// @vitest-environment node

import { type AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAiReviewServer,
  reviewWithCloudflare,
} from "../server/ai-review-server";

const originalEnv = { ...process.env };

const sampleRequest = {
  record: {
    id: "M-001",
    rawText: "社群轉錄說可能需要清泥，但地點不明。",
    sourceType: "social_post",
    verificationStatus: "needs_review",
    updatedAt: "2026-07-09T00:00:00.000Z",
  },
  draft: {
    candidateSummary: "可能是清泥需求，但位置與來源不足。",
    possibleKind: "task_candidate",
    confidence: "low",
    suggestedNextStep: "send_to_human_review",
    unsafeToActDirectly: true,
    cannotBecomeTaskReason: "地點仍不夠精確。",
    operatorIsAffectedPerson: "unknown",
  },
};

function resetAiEnv() {
  delete process.env.key;
  delete process.env.CLOUDFLARE_AI_GATEWAY_TOKEN;
  delete process.env.CLOUDFLARE_AI_GATEWAY_URL;
  delete process.env.CLOUDFLARE_AI_GATEWAY_ID;
  delete process.env.CLOUDFLARE_AI_MODEL;
  delete process.env.PROVIDER_API_KEY;
  delete process.env.OPENAI_API_KEY;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
  resetAiEnv();
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
});

describe("AI review proxy server", () => {
  it("serves POST /api/ai-review through the local proxy", async () => {
    const server = createAiReviewServer(async (requestBody) => ({
      note: `收到 ${requestBody.record.id}，仍需人工確認。`,
      source: "cloudflare_ai_gateway",
      statusCode: 200,
    }));

    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address() as AddressInfo;

    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/ai-review`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(sampleRequest),
        },
      );

      await expect(response.json()).resolves.toEqual({
        note: "收到 M-001，仍需人工確認。",
        source: "cloudflare_ai_gateway",
      });
      expect(response.status).toBe(200);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("allows browser preflight requests for direct local testing", async () => {
    const server = createAiReviewServer();

    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address() as AddressInfo;

    try {
      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/ai-review`,
        { method: "OPTIONS" },
      );

      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-methods")).toContain(
        "POST",
      );
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("reports missing Cloudflare configuration without calling upstream", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(reviewWithCloudflare(sampleRequest)).resolves.toMatchObject({
      source: "configuration_error",
      statusCode: 503,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses Cloudflare account AI authorization and gateway id for api.cloudflare.com URLs", async () => {
    process.env.CLOUDFLARE_AI_GATEWAY_TOKEN = "fake-gateway-token";
    process.env.CLOUDFLARE_AI_GATEWAY_ID = "example-gateway";
    process.env.CLOUDFLARE_AI_GATEWAY_URL =
      "https://api.cloudflare.com/client/v4/accounts/example/ai/v1";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "仍需人工確認來源與地點。" } }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(reviewWithCloudflare(sampleRequest)).resolves.toMatchObject({
      note: "仍需人工確認來源與地點。",
      source: "cloudflare_ai_gateway",
      statusCode: 200,
    });

    const [, init] = fetchMock.mock.calls[0];
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.cloudflare.com/client/v4/accounts/example/ai/v1/chat/completions",
    );
    expect(init.headers).toMatchObject({
      authorization: "Bearer fake-gateway-token",
      "cf-aig-gateway-id": "example-gateway",
      "content-type": "application/json",
    });
    expect(init.headers).not.toHaveProperty("cf-aig-authorization");
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: "@cf/moonshotai/kimi-k2.7-code",
    });
  });

  it("uses AI Gateway and provider headers for gateway.ai.cloudflare.com URLs", async () => {
    process.env.CLOUDFLARE_AI_GATEWAY_TOKEN = "fake-gateway-token";
    process.env.PROVIDER_API_KEY = "fake-provider-token";
    process.env.CLOUDFLARE_AI_GATEWAY_URL =
      "https://gateway.ai.cloudflare.com/v1/example-account/example-gateway/openai/chat/completions";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: { response: "需要人工補問。" } }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(reviewWithCloudflare(sampleRequest)).resolves.toMatchObject({
      note: "需要人工補問。",
      source: "cloudflare_ai_gateway",
      statusCode: 200,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).toMatchObject({
      authorization: "Bearer fake-provider-token",
      "cf-aig-authorization": "Bearer fake-gateway-token",
      "content-type": "application/json",
    });
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: "gpt-4o-mini",
    });
  });

  it("returns a clear note when Cloudflare reports insufficient balance", async () => {
    process.env.CLOUDFLARE_AI_GATEWAY_TOKEN = "fake-gateway-token";
    process.env.CLOUDFLARE_AI_GATEWAY_URL =
      "https://api.cloudflare.com/client/v4/accounts/example/ai/v1/chat/completions";

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ errors: [{ message: "insufficient balance" }] }),
            { status: 402 },
          ),
        ),
    );

    await expect(reviewWithCloudflare(sampleRequest)).resolves.toMatchObject({
      note: expect.stringContaining("餘額不足"),
      source: "upstream_error",
      statusCode: 502,
    });
  });

  it("returns a clear note when the Gateway URL is not found", async () => {
    process.env.CLOUDFLARE_AI_GATEWAY_TOKEN = "fake-gateway-token";
    process.env.CLOUDFLARE_AI_GATEWAY_URL =
      "https://api.cloudflare.com/client/v4/accounts/example/ai/v1/chat/completions";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ message: "not found" }] }), {
          status: 404,
        }),
      ),
    );

    await expect(reviewWithCloudflare(sampleRequest)).resolves.toMatchObject({
      note: expect.stringContaining("Gateway URL 找不到"),
      source: "upstream_error",
      statusCode: 502,
    });
  });
});
