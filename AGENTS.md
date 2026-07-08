# Agent Instructions

0. 修改前先閱讀：
   - `docs/course-context.md`
   - `docs/student-context.md`
   - `docs/brief.md`
   - `docs/output-paths.md`
   - `docs/tasks/01-phase-0-messy-sprint.md`
   - `docs/tasks/02-phase-0-debrief.md`
1. 可展示成果必須接進 Vite app，並能從這條路徑看到：
   - `src/main.tsx`
   - `src/app/App.tsx`
2. 不要只新增未被引用的 component、資料檔、docs 或 tests。若新增 UI 元件，必須說明畫面從哪個檔案進入。
3. 不得新增後端、資料庫、外部 runtime API 或真實 LLM runtime call。
4. 不得放入 API key、密碼、真實個資、真實災情資料、真實地圖、真實地址、真實電話或真實人物資料。
5. 所有 runtime 資料使用 mock data。
6. Phase 0 的 coding agent 可以協助：
   - 分析原始資訊。
   - 找出不能判斷處。
   - 實作前端工作台。
   - 改善畫面標示。
   - 補 `docs/phase0-observations.md`。
   - 補 `docs/ai-log.md`。
7. Phase 0 的 coding agent 不可以：
   - 把未確認資訊標成已確認。
   - 把原始資訊改成正式整理後資料。
   - 自動做真實救災判斷。
   - 補真實世界資料。
   - 產生後續課程材料。
   - 新增訪談、流程設計、變更請求、變更事件、交接材料或成果交流內容。
8. 使用學生容易理解的詞彙：
   - 原始資訊 / 未整理資料。
   - 整理後資料。
   - 資料格式。
   - 轉換器。
   - 完成條件。
   - 畫面從哪個檔案進入。
9. 若需要保留英文技術詞，請用括號補充，不要讓學生文件充滿英文術語。
10. 使用 AI / Coding Agent 完成重要工作時，必須更新 `docs/ai-log.md`；不需要逐字貼 prompt，但要記錄任務、AI 建議、採用或拒絕、人類判斷理由，以及相關檔案或 commit。
11. 完成前執行：
    - `pnpm format`
    - `pnpm test`
    - `pnpm build`
    - `pnpm check`
12. 不確定需求時，不可自行補完為救災決策。
