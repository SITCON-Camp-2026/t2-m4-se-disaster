import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type ReviewRequest = {
  record: {
    id: string;
    rawText: string;
    sourceType: string;
    verificationStatus: string;
    updatedAt: string;
  };
  draft: {
    candidateSummary: string;
    possibleKind: string;
    confidence: string;
    suggestedNextStep: string;
    unsafeToActDirectly: boolean;
    cannotBecomeTaskReason: string;
    operatorIsAffectedPerson: string;
  };
};

type ReviewResponse = {
  note: string;
  source: "cloudflare_ai_gateway" | "configuration_error" | "upstream_error";
};

const cloudflareGatewayHost = "gateway.ai.cloudflare.com";

export function loadLocalEnv(envPath = resolve(process.cwd(), ".env")) {
  try {
    const envFile = readFileSync(envPath, "utf8");

    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const name = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      process.env[name] ??= value;
    }
  } catch {
    // Missing .env is okay; the endpoint reports a configuration error.
  }
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: ReviewResponse,
) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolveBody, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16_384) {
        request.destroy(new Error("Request body is too large."));
      }
    });
    request.on("end", () => resolveBody(body));
    request.on("error", reject);
  });
}

function buildPrompt({ record, draft }: ReviewRequest) {
  return [
    "你是 SITCON Camp Phase 0 的資訊品質檢查助手。",
    "請只根據使用者提供的 mock 原始資訊與草稿提出風險提醒。",
    "不要補真實世界資料、不要查外部資料、不要把任何內容標成已確認。",
    "請用繁體中文，輸出 3 到 5 個短句，每句都要說明需要人工確認或不能直接變成任務的原因。",
    "",
    `資料編號：${record.id}`,
    `來源類型：${record.sourceType}`,
    `查核狀態：${record.verificationStatus}`,
    `原文：${record.rawText}`,
    "",
    `草稿摘要：${draft.candidateSummary}`,
    `候選類型：${draft.possibleKind}`,
    `信心程度：${draft.confidence}`,
    `下一步：${draft.suggestedNextStep}`,
    `不能直接行動：${draft.unsafeToActDirectly ? "是" : "否"}`,
    `不能直接變成任務的原因：${draft.cannotBecomeTaskReason}`,
    `操作者是否為當事人：${draft.operatorIsAffectedPerson}`,
  ].join("\n");
}

function extractText(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "choices" in payload &&
    Array.isArray(payload.choices)
  ) {
    const firstChoice = payload.choices[0] as
      { message?: { content?: unknown }; text?: unknown } | undefined;
    const messageContent = firstChoice?.message?.content;
    if (typeof messageContent === "string") return messageContent;
    if (typeof firstChoice?.text === "string") return firstChoice.text;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "result" in payload &&
    typeof payload.result === "object" &&
    payload.result !== null &&
    "response" in payload.result &&
    typeof payload.result.response === "string"
  ) {
    return payload.result.response;
  }

  return "";
}

export function createGatewayRequestConfig() {
  const gatewayToken =
    process.env.CLOUDFLARE_AI_GATEWAY_TOKEN ?? process.env.key;
  const providerApiKey =
    process.env.PROVIDER_API_KEY ?? process.env.OPENAI_API_KEY;
  const gatewayId = process.env.CLOUDFLARE_AI_GATEWAY_ID;
  const configuredGatewayUrl = process.env.CLOUDFLARE_AI_GATEWAY_URL;

  if (!gatewayToken || !configuredGatewayUrl) {
    return {
      ok: false as const,
      note: "外部 AI 檢查尚未設定完成：後端需要 .env 的 key 或 CLOUDFLARE_AI_GATEWAY_TOKEN，以及 CLOUDFLARE_AI_GATEWAY_URL。若使用 api.cloudflare.com 的 AI Gateway，請同時設定 CLOUDFLARE_AI_GATEWAY_ID。請先用本機檢查，不要把草稿當成已確認資料。",
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredGatewayUrl);
  } catch {
    return {
      ok: false as const,
      note: "CLOUDFLARE_AI_GATEWAY_URL 格式不正確；請先用本機檢查，不要把草稿當成已確認資料。",
    };
  }

  if (parsedUrl.pathname.endsWith("/ai/v1")) {
    parsedUrl.pathname = `${parsedUrl.pathname}/chat/completions`;
  }

  const isProviderNativeGateway = parsedUrl.hostname === cloudflareGatewayHost;
  const isCloudflareAccountAi = parsedUrl.hostname === "api.cloudflare.com";
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (isProviderNativeGateway) {
    headers["cf-aig-authorization"] = `Bearer ${gatewayToken}`;

    if (providerApiKey) {
      headers.authorization = `Bearer ${providerApiKey}`;
    }
  } else {
    headers.authorization = `Bearer ${gatewayToken}`;

    if (isCloudflareAccountAi && gatewayId) {
      headers["cf-aig-gateway-id"] = gatewayId;
    }
  }

  return {
    ok: true as const,
    gatewayUrl: parsedUrl.toString(),
    headers,
    model:
      process.env.CLOUDFLARE_AI_MODEL ??
      (isProviderNativeGateway
        ? "gpt-4o-mini"
        : "@cf/moonshotai/kimi-k2.7-code"),
  };
}

export async function reviewWithCloudflare(requestBody: ReviewRequest) {
  const gatewayConfig = createGatewayRequestConfig();

  if (!gatewayConfig.ok) {
    return {
      note: gatewayConfig.note,
      source: "configuration_error" as const,
      statusCode: 503,
    };
  }

  const upstreamResponse = await fetch(gatewayConfig.gatewayUrl, {
    method: "POST",
    headers: gatewayConfig.headers,
    body: JSON.stringify({
      model: gatewayConfig.model,
      messages: [
        {
          role: "system",
          content:
            "You review messy mock disaster information for uncertainty. Never confirm facts or create real rescue instructions.",
        },
        { role: "user", content: buildPrompt(requestBody) },
      ],
      temperature: 0.2,
      max_tokens: 350,
    }),
  });

  if (!upstreamResponse.ok) {
    let errorMessage = "";
    try {
      const errorPayload = (await upstreamResponse.json()) as {
        errors?: Array<{ message?: string }>;
        error?: { message?: string };
      };
      errorMessage =
        errorPayload.errors?.[0]?.message ?? errorPayload.error?.message ?? "";
    } catch {
      // Some upstream failures do not return JSON.
    }

    const note = createUpstreamErrorNote(upstreamResponse.status, errorMessage);

    return {
      note,
      source: "upstream_error" as const,
      statusCode: 502,
    };
  }

  const payload: unknown = await upstreamResponse.json();
  const note = extractText(payload).trim();

  return {
    note:
      note || "外部 AI 沒有回傳可讀內容；請改用本機檢查，並由人類確認草稿。",
    source: "cloudflare_ai_gateway" as const,
    statusCode: 200,
  };
}

function createUpstreamErrorNote(status: number, errorMessage: string) {
  if (status === 402 || errorMessage.includes("balance")) {
    return "Cloudflare AI Gateway 已連上，但帳號餘額不足或需要設定 BYOK。請先使用本機檢查，並不要把草稿當成已確認資料。";
  }

  if (status === 401 || status === 403) {
    return "Cloudflare AI Gateway 已連上，但授權失敗。請確認 .env 裡的 key 或 CLOUDFLARE_AI_GATEWAY_TOKEN 是否有效；草稿仍需人工確認。";
  }

  if (status === 404) {
    return "Cloudflare AI Gateway 已連上，但 Gateway URL 找不到。請確認 .env 裡的 CLOUDFLARE_AI_GATEWAY_URL 是否包含正確帳號與 gateway 路徑；草稿仍需人工確認。";
  }

  if (status === 400) {
    return "Cloudflare AI Gateway 已連上，但請求格式或模型名稱被拒絕。請確認 CLOUDFLARE_AI_MODEL 與 Gateway URL 的 provider 是否相符；草稿仍需人工確認。";
  }

  return `外部 AI 檢查暫時失敗（HTTP ${status}）：請改用本機檢查，並保留需要人工確認與不能直接變成任務的標示。`;
}

export function createAiReviewServer(
  review: (requestBody: ReviewRequest) => Promise<{
    note: string;
    source: ReviewResponse["source"];
    statusCode: number;
  }> = reviewWithCloudflare,
) {
  return createServer(async (request, response) => {
    if (request.method === "OPTIONS" && request.url === "/api/ai-review") {
      response.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
      });
      response.end();
      return;
    }

    if (request.method !== "POST" || request.url !== "/api/ai-review") {
      response.writeHead(404);
      response.end();
      return;
    }

    try {
      const rawBody = await readBody(request);
      const requestBody = JSON.parse(rawBody) as ReviewRequest;
      const result = await review(requestBody);

      sendJson(response, result.statusCode, {
        note: result.note,
        source: result.source,
      });
    } catch {
      sendJson(response, 500, {
        note: "AI 檢查服務發生錯誤：請回到本機檢查，並由人類確認草稿內容。",
        source: "upstream_error",
      });
    }
  });
}

export function startAiReviewServer() {
  loadLocalEnv();
  const port = Number(process.env.AI_REVIEW_PORT ?? 8787);
  const server = createAiReviewServer();

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `AI review proxy port ${port} 已被占用。請關掉舊的 pnpm dev:api，或在 .env 設定 AI_REVIEW_PORT 後同步調整 Vite proxy。`,
      );
      process.exitCode = 1;
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    console.log(`AI review proxy listening on http://localhost:${port}`);
  });

  return server;
}

const executedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === executedPath) {
  startAiReviewServer();
}
