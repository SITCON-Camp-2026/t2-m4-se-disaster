# Release 02：流程設計 Kit

## 你現在在哪個階段

你已經完成 Phase 0 prototype，也完成三個 persona sub-agent 的回饋與 main agent 彙整。

接下來請先不要急著改程式。這一階段是**流程設計**：把你的需求取捨轉成一條人和 Codex 都看得懂的資訊流程。

## 為什麼要畫流程

流程圖不是作業，也不是為了好看。

流程圖的目標是讓你看見：

- 原始資訊如何進入你的工作台。
- 哪些地方需要人工確認。
- 哪些地方不能讓 AI 自動決定。
- 哪些分支會產生候選結果。
- 哪些資訊應該被拒絕或暫時保留。
- 哪些操作需要留下紀錄。

你的流程越清楚，後面請 Codex 實作時越不容易亂加功能或替你做錯判斷。

## 這一階段要完成什麼

請完成：

1. 用自然語言描述你的 v1 流程。
2. 請 Codex 把自然語言流程轉成 Mermaid。
3. 用 VS Code 預覽 Mermaid。
4. 用 `docs/design-checklist.md` 檢查流程。
5. 修正至少一個流程問題。
6. 將結果寫入 `docs/flow.md`。

## 你會使用哪些檔案

請閱讀：

- `docs/interview-summary.md`
- `docs/decisions.md`
- `docs/design-checklist.md`
- `docs/prompts/flow-designer.md`
- `docs/prompts/flow-reviewer.md`

請產出或更新：

- `docs/flow.md`
- `docs/decisions.md`，如果流程設計讓你改變取捨
- `docs/ai-log.md`

## Codex 可以做什麼

Codex 可以幫你：

- 把自然語言流程轉成 Mermaid。
- 找出流程中缺少的人工確認點。
- 找出 AI 不應自動決定的地方。
- 找出可能誤導使用者的狀態。
- 協助更新 `docs/flow.md`。

## Codex 這階段不應該做什麼

這一階段仍然不要修改程式碼。

不要請 Codex 改：

- `src/**`
- `src/app/App.tsx`
- `src/components/**`
- `src/contracts/**`
- `src/fixtures/**`

如果 Codex 主動想修改程式，請拒絕，並要求它先完成流程設計。

## 完成條件

完成這一階段時，你應該有：

- 一段自然語言流程描述。
- 一張可以在 VS Code 預覽的 Mermaid 流程圖。
- 至少一個人工確認點。
- 至少一個不能自動處理的分支。
- 至少一個操作或判斷紀錄。
- 一段「我檢查後修正了什麼」。
- 一段「我仍不確定的流程點」。

## 小隊討論

每人完成自己的流程圖後，小隊用 10 分鐘互看：

- 誰的流程最清楚？
- 誰的流程把 AI 當成決策者？
- 誰的流程漏掉人工確認？
- 誰的流程最容易讓 Codex 接著實作？
- 哪一張流程圖最容易誤導使用者？
