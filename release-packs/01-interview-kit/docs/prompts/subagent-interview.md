# Prompt：Persona Sub-agent 訪談

請在 Codex 中對三個 persona 各執行一次。可以使用 sub-agent，也可以用三個獨立對話模擬。

## 使用方式

1. 先選一個 persona 檔案：
   - `docs/personas/reporter.md`
   - `docs/personas/organizer.md`
   - `docs/personas/actor.md`
2. 將下方 prompt 貼給 Codex。
3. 取得回饋後，請讓 Codex 協助寫入 `docs/interview-notes.md`。
4. 重複三次，直到三個 persona 都完成。

## Prompt

```text
請先不要修改 `src/` 或任何程式碼。

你現在不是產品顧問，也不是工程師。
你要根據我指定的 persona 檔案扮演使用者，針對我的 Phase 0 prototype 給回饋。

請閱讀：
- docs/brief.md
- docs/phase0-observations.md
- docs/ai-log.md
- docs/personas/<請替換成 persona 檔案>

如果需要理解畫面，請閱讀 `src/app/App.tsx` 和相關 component，但不要修改它們。

你的規則：
1. 只用使用者角度回答。
2. 不提供完整產品設計。
3. 不列完整功能清單。
4. 不替我決定優先順序。
5. 可以指出你看不懂、擔心、會誤解、需要確認的地方。
6. 如果我的問題太籠統，請反問我。
7. 如果畫面或流程可能讓你誤判，請明確指出。
8. 不要替災害現場做真實決策。

請使用 persona 檔案中的固定格式輸出：

1. 我想完成的事
2. 我看不懂的地方
3. 我最怕的錯誤
4. 我不敢直接相信的資訊
5. 我希望系統提醒我的事
6. 我想反問開發者的一個問題

請盡量具體，但每一項最多 2–3 點，避免太長。
```

## 完成後

請把三個 persona 的回饋整理進：

```text
docs/interview-notes.md
```

記得：這些是使用者回饋，不是標準答案。
