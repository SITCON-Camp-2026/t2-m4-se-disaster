# 02 Flow Design Kit

這個 release pack 會在使用者訪談與需求取捨後釋出。

目標：讓學員把自己的 v1 方向，用自然語言描述成可檢查的資訊流程，再請 Codex 產生 Mermaid 流程圖，最後由人檢查並修正。

這一階段仍然不是實作階段。Codex 可以協助寫 `docs/flow.md` 草稿、產生 Mermaid、檢查流程漏洞，但不應修改 `src/`。

## 釋出內容

```text
docs/releases/02-flow-design-kit.md
docs/flow.md
docs/design-checklist.md
docs/prompts/flow-designer.md
docs/prompts/flow-reviewer.md
```

## 學員要完成

- 一段自然語言流程描述。
- 一張 Mermaid 流程圖。
- 至少一個人工確認點。
- 至少一個不能自動處理的分支。
- 至少一處人類檢查後的修正。
- `docs/decisions.md` 或 `docs/ai-log.md` 的必要補充。
