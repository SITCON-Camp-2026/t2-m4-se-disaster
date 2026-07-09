# Release 01：使用者訪談 Kit

## 你現在在哪個階段

你已經完成 Phase 0，用 Codex 快速做出第一版資訊整理工作台。

接下來請先不要繼續改程式。這一階段是**需求分析**：透過三個 persona sub-agent 的回饋，理解你的 prototype 可能幫到誰、誤導誰、漏掉什麼。

## 這一階段要完成什麼

你會完成四件事：

1. 讓三個 persona sub-agent 給你固定格式回饋。
2. 讓 main agent 彙整三份回饋。
3. 自己刪改、補充與判斷取捨。
4. 和小隊比較彼此 agent 回饋的品質。

## 你會使用哪些檔案

請閱讀：

- `docs/personas/reporter.md`
- `docs/personas/organizer.md`
- `docs/personas/actor.md`
- `docs/prompts/subagent-interview.md`
- `docs/prompts/main-agent-summarizer.md`
- `docs/prompts/team-discussion.md`

請產出或更新：

- `docs/interview-notes.md`
- `docs/interview-summary.md`
- `docs/decisions.md`
- `docs/ai-log.md`

## Codex 可以做什麼

Codex 可以幫你產生文件草稿，包含：

- persona sub-agent 回饋。
- 訪談紀錄。
- main agent 彙整。
- 需求取捨草稿。
- AI 使用紀錄草稿。

但你必須刪除、修改或補充。不要把 AI 輸出直接當成最後決策。

## Codex 這階段不應該做什麼

這一階段不要修改程式碼。

不要請 Codex 改：

- `src/**`
- `src/app/App.tsx`
- `src/components/**`
- `src/contracts/**`
- `src/fixtures/**`

如果 Codex 主動想修改程式，請拒絕，並要求它先完成訪談與需求整理。

## 完成條件

完成這一階段時，你應該能回答：

- 三個 persona 各自最想完成什麼？
- 三個 persona 最怕什麼錯誤？
- 哪個 Phase 0 原始假設被推翻？
- 哪個 AI 建議你不採用？為什麼？
- 你的 v1 會優先服務哪一種使用者？
- 今天明確不做什麼？

## 小隊討論

每人完成自己的訪談與彙整後，小隊用 10–15 分鐘比較：

- 誰的 sub-agent 回饋最具體？
- 誰的 sub-agent 太像產品顧問？
- 誰的 main agent 彙整最有幫助？
- 誰的 main agent 把衝突需求過度簡化？
- 誰做了最清楚的取捨？
- 哪個 AI 建議最危險？
