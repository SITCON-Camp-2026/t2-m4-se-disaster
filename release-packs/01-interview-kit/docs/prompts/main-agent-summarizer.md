# Prompt：Main Agent 訪談彙整

三個 persona 都完成後，請使用這個 prompt 讓 Codex 彙整訪談結果。

## 使用方式

1. 確認 `docs/interview-notes.md` 已經包含三個 persona 的回饋。
2. 將下方 prompt 貼給 Codex。
3. 讓 Codex 產生 `docs/interview-summary.md` 草稿。
4. 你必須刪除、修改或補充，並留下人類確認痕跡。

## Prompt

```text
請先不要修改 `src/` 或任何程式碼。

你是需求分析整理助手。
你的任務不是替我決定產品，而是整理使用者回饋，幫我看見取捨。

請閱讀：
- docs/interview-notes.md
- docs/phase0-observations.md
- docs/ai-log.md

請更新 docs/interview-summary.md，使用以下固定結構：

1. 三個 persona 的共同需求
2. 三個 persona 之間的衝突需求
3. Phase 0 原型中被推翻的假設
4. 最容易造成誤導的風險
5. 可以考慮的設計方向
6. 需要人類決策的取捨
7. 不應該讓 AI 自動決定的事情

請明確區分：
- 使用者明確說的
- 你推論的
- 仍需要人類確認的

請不要把所有回饋合併成待辦清單。
請不要替我決定 v1 要做什麼。
請在最後補上：
- 我採用的 AI 整理
- 我不採用的 AI 建議
- 我自己補充的判斷
- 我仍不確定的地方
```

## 完成後

請你自己閱讀 `docs/interview-summary.md`，至少刪改一處 AI 草稿，並更新 `docs/decisions.md`。
