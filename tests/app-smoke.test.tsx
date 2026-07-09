import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app/App";

afterEach(() => {
  window.history.pushState({}, "", "/");
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("renders starter title", () => {
    render(<App />);
    expect(screen.getByText("災害資訊整理工作台")).toBeInTheDocument();
  });

  it("keeps the home page focused on phase 0 tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "原始資訊" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "候選整理" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "人力呼叫" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通報" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "地點" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "志工任務" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "人員指派" }),
    ).not.toBeInTheDocument();
  });

  it("shows review states in the phase 0 workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByText(
        "第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
  });

  it("shows candidate organized info with ratings and important details", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "候選整理" }));

    expect(
      screen.getByRole("heading", { name: "候選整理資訊" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("完整度").length).toBeGreaterThan(0);
    expect(screen.getAllByText("可用度").length).toBeGreaterThan(0);
    expect(
      screen.getByText("雨鞋約剩 12 雙，尺寸多為 26-28。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "草稿同步" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/不能直接變成任務/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "完整度偏低" }));
    expect(screen.getByText(/筆完整度偏低/)).toBeInTheDocument();
    expect(
      screen.queryByText("雨鞋約剩 12 雙，尺寸多為 26-28。"),
    ).not.toBeInTheDocument();
  });

  it("syncs workbench draft choices into the organized page", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "先保留原始資訊，等待人工確認。",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "候選整理" }));

    const m001Card = screen
      .getByRole("heading", { name: "M-001" })
      .closest("article");
    expect(m001Card).not.toBeNull();
    expect(
      within(m001Card!).getByText("先保留原始資訊，等待人工確認。"),
    ).toBeInTheDocument();
    expect(
      within(m001Card!).getByText("這張卡已同步整理工作台草稿。"),
    ).toBeInTheDocument();
  });

  it("lets users manually edit a draft and send it to organized info", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));
    fireEvent.change(screen.getByLabelText("候選摘要"), {
      target: { value: "手動改寫的候選摘要，仍需人工確認。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送到候選整理" }));

    expect(
      screen.getByRole("heading", { name: "候選整理資訊" }),
    ).toBeInTheDocument();

    const m001Card = screen
      .getByRole("heading", { name: "M-001" })
      .closest("article");
    expect(m001Card).not.toBeNull();
    expect(
      within(m001Card!).getByText("手動改寫的候選摘要，仍需人工確認。"),
    ).toBeInTheDocument();
    expect(
      within(m001Card!).getByText("這張卡已同步整理工作台草稿。"),
    ).toBeInTheDocument();
  });

  it("shows people call candidates without directly dispatching anyone", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "人力呼叫" }));

    expect(
      screen.getByRole("heading", { name: "人力呼叫候選" }),
    ).toBeInTheDocument();
    expect(screen.getByText("筆目前暫不呼叫")).toBeInTheDocument();
    expect(screen.getByText("筆可直接派人")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getAllByText("暫不呼叫").length).toBeGreaterThan(0);
    expect(screen.getAllByText("清淤志工候選").length).toBeGreaterThan(0);
    expect(screen.getAllByText("呼叫前必須確認").length).toBeGreaterThan(0);
  });

  it("supports in-memory draft CRUD without confirming review data", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByRole("heading", { name: "M-001 的可編輯草稿" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("目前可以建立、編輯、刪除與重設整理草稿"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("至少讓 6 筆原始資訊被嘗試整理成可編輯草稿"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("M-011 與 M-012 可標示操作者不是當事人"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /M-007/ }));
    expect(screen.getByText("尚未建立整理草稿")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "建立這筆整理草稿" }));
    expect(
      screen.getByRole("heading", { name: "M-007 的可編輯草稿" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
  });

  it("runs AI review through the local proxy without marking data confirmed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        note: "原始狀態仍需人工確認，不能直接變成任務。",
        source: "cloudflare_ai_gateway",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));
    fireEvent.click(screen.getByRole("button", { name: "AI API 檢查" }));

    expect(await screen.findByText("AI 風格檢查結果")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai-review",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getAllByText(/原始狀態仍需人工確認/).length).toBeGreaterThan(
      0,
    );
    expect(
      (screen.getByLabelText("目前草稿原因") as HTMLTextAreaElement).value,
    ).toContain("原始狀態仍需人工確認");
    expect(
      screen.getByRole("button", { name: "套用到草稿" }),
    ).toBeInTheDocument();
  });

  it("renders the v1 demo with action-taker tabs", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "行動者資訊分流 Demo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "已人工確認" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 排序" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "原始回報" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "回報表單" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "資訊請求" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("人工確認").length).toBeGreaterThan(0);
    expect(screen.queryByText("需要確認")).not.toBeInTheDocument();
  });

  it("sorts high urgency reports above spam in the v1 AI tab", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "AI 排序" }));

    const firstReport = screen.getAllByRole("article")[0];
    expect(within(firstReport).getByText("V1-001")).toBeInTheDocument();
    expect(screen.getByText(/排序不是可信度背書/)).toBeInTheDocument();
  });

  it("adds form reports as unconfirmed raw reports in v1", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "回報表單" }));
    fireEvent.change(screen.getByLabelText("原始回報內容"), {
      target: { value: "模擬新增：有人轉述需要協助，但地點和時間不清楚。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "加入原始回報" }));

    expect(
      screen.getByRole("heading", { name: "原始回報" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("模擬新增：有人轉述需要協助，但地點和時間不清楚。"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("需要確認").length).toBeGreaterThan(0);
  });

  it("lets reporters append related info instead of creating duplicate v1 reports", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "回報表單" }));
    fireEvent.change(screen.getByLabelText("原始回報內容"), {
      target: { value: "我也聽到避難點飲用水快不夠，可能需要再確認補給。" },
    });

    expect(screen.getByText("可能相關報告")).toBeInTheDocument();
    expect(screen.getByText(/V1-001/)).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole("button", { name: "加到這筆報告下方" })[0],
    );

    expect(
      screen.getByRole("heading", { name: "原始回報" }),
    ).toBeInTheDocument();
    expect(screen.getByText("補充資訊")).toBeInTheDocument();
    expect(
      screen.getByText(
        "表單補充：我也聽到避難點飲用水快不夠，可能需要再確認補給。",
      ),
    ).toBeInTheDocument();
  });

  it("lets organizers send specific information requests in v1", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "資訊請求" }));
    fireEvent.change(screen.getByLabelText("需要補問的欄位"), {
      target: { value: "接收條件" },
    });
    fireEvent.change(screen.getByLabelText("請求內容"), {
      target: { value: "請確認接收窗口是否仍在現場。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送出資訊請求" }));

    expect(screen.getByText("REQ-001 / V1-003 / 接收條件")).toBeInTheDocument();
    expect(
      screen.getByText("請確認接收窗口是否仍在現場。"),
    ).toBeInTheDocument();
    expect(screen.getByText("等待人工補充，不代表派工。")).toBeInTheDocument();
  });
});
