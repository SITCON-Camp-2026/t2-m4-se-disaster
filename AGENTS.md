# Agent Instructions

## 0. Repo 角色

這個 repo 是 SITCON Camp 2026 軟體工程課程的 Phase 0 public 起始專案。

Phase 0 的目標不是完成正式產品，而是讓學員使用 Codex / Coding Agent 快速做出資訊整理工作台，並看見原始資訊中的混亂、不確定性與 AI 推測風險。

Phase 0 後的訪談、流程設計、實作支架、變更事件、交接與成果交流材料，會由 private staff repo 在課程中釋出，不得預先放進本 public starter。

## 1. 修改前必讀

修改前請先閱讀：

- `docs/course-context.md`
- `docs/student-context.md`
- `docs/brief.md`
- `docs/output-paths.md`
- `docs/tasks/01-phase-0-messy-sprint.md`
- `docs/tasks/02-phase-0-debrief.md`
- `docs/prompts/phase-0.md`，若存在

## 2. 展示入口

可展示成果必須接進 Vite app，並能從首頁看到：

- `src/main.tsx`
- `src/app/App.tsx`

不要只新增未被引用的 component、資料檔、docs 或 tests。

如果新增 UI component，必須由 `src/app/App.tsx` 或它匯入的 component 使用。

## 3. Phase 0 可以做什麼

Coding Agent 可以協助：

- 分析 Phase 0 原始資訊。
- 找出不能判斷的地方。
- 找出不能直接相信的地方。
- 找出不能直接變成志工任務的地方。
- 提出最小前端工作台計畫。
- 實作前端工作台。
- 改善畫面上對「需要人工確認」「尚未確認」「不能直接變成任務」的標示。
- 補 `docs/phase0-observations.md`。
- 補 `docs/ai-log.md`。
- 修正 Phase 0 相關文件與格式。

## 4. Phase 0 不可以做什麼

Coding Agent 不可以：

- 把未確認資訊標成已確認。
- 把 `needs_review` / `unverified` 顯示成 `verified` / `confirmed`。
- 把原始資訊改成正式整理後資料。
- 把推測寫成事實。
- 自動做真實救災判斷。
- 補真實世界資料。
- 查外部社群、地圖、政府資料或新聞來補內容。
- 新增資料庫。
- 放入 API key、密碼或 secrets。
- 放入真實個資。
- 放入真實災情資料。
- 放入真實地圖、真實地址、真實電話或真實人物資料。
- 產生後續課程材料。
- 新增訪談、persona、sub-agent、main agent、流程設計、Mermaid、change request、event injection、handoff 或 showcase 內容。

## 5. Prompt 檔案規則

public starter 可以保留：

- `docs/prompts/phase-0.md`

public starter 不可以保留或新增：

- 訪談 prompt。
- persona prompt。
- sub-agent prompt。
- main agent prompt。
- flow design prompt。
- Mermaid prompt。
- build guide prompt。
- change request prompt。
- event injection prompt。
- handoff prompt。
- showcase prompt。

如果需要 Phase 0 prompt，請只修改 `docs/prompts/phase-0.md`。

## 6. 資料規則

Phase 0 只使用：

- `src/fixtures/phase-0/`

不要把未整理資料搬進 `src/fixtures/shared/` 假裝乾淨。

不要新增真實資料。

不要新增隱藏變更資料。

## 7. 學員文件用語

學生可見文件請優先使用白話中文：

- 起始專案。
- 起始畫面。
- 原始資訊。
- 未整理資料。
- 整理後資料。
- 資料格式。
- 轉換器。
- 完成條件。
- 畫面從哪個檔案進入。
- 需要人工確認。
- 不能直接相信。
- 不能直接變成任務。

若需要保留英文技術詞，請用括號補充，不要讓學生文件充滿英文術語。

## 8. AI 使用紀錄

使用 AI / Coding Agent 完成重要工作時，必須更新 `docs/ai-log.md`。

不需要逐字貼完整 prompt，但要記錄：

- 我請 agent 做什麼。
- Agent 產出了什麼。
- 我採用或不採用什麼。
- 人類判斷理由。
- 相關檔案或 commit。

## 9. 驗證

完成前請執行：

```bash
pnpm format
pnpm test
pnpm build
pnpm check
```

若測試因 UI 文案改變而失敗，請同步修正測試。

不確定需求時，不可自行補完為救災決策。
