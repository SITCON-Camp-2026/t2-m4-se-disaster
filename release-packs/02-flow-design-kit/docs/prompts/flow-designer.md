# Prompt：流程設計助手

這個 prompt 用來請 Codex 把你的自然語言流程描述轉成 Mermaid。

## 使用前先確認

你應該已經完成：

- `docs/interview-notes.md`
- `docs/interview-summary.md`
- `docs/decisions.md`

這一階段不要修改程式碼。

## Prompt

```text
請先不要修改 `src/` 或任何程式碼。

你是流程設計助手。
你的任務是根據我的需求取捨，幫我把 v1 流程整理成自然語言流程和 Mermaid 流程圖。

請閱讀：
- docs/interview-summary.md
- docs/decisions.md
- docs/flow.md

請幫我更新 docs/flow.md，包含：

1. v1 目標摘要
2. 自然語言流程描述
3. Mermaid 流程圖
4. 人工確認點
5. 不能自動處理的分支
6. 操作或判斷紀錄
7. 仍不確定的流程點

流程圖必須符合：

- 從原始資訊開始。
- 至少有一個人工確認點。
- 至少有一個不能自動處理的分支。
- 不把 AI 當成最終決策者。
- 不把未確認資訊顯示成已確認。
- 有操作或判斷紀錄。

請使用 Mermaid `flowchart TD`。
請不要讓流程圖太複雜，適合今天下午根據它實作 v1 prototype。
```

## 完成後

請在 VS Code 預覽 Mermaid。若 Mermaid 無法顯示，請請 Codex 只修 Mermaid 語法，不要改流程語意。
