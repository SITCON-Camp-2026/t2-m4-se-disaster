# AI Log

這份紀錄用來留下小組如何使用 AI / Coding Agent 的操作脈絡。重點不是逐字保存所有對話，而是記錄重要協作、取捨與人類判斷。

## 什麼時候要記錄

請在以下情況更新本檔案：

- AI 協助分析原始資訊。
- AI 協助找出不能判斷處。
- AI 協助判斷哪些資訊不能直接相信。
- AI 協助判斷哪些資訊不能直接變成任務。
- AI 協助修改畫面標示或前端工作台。
- AI 可能補了原文沒有的資訊。
- AI 建議被小組拒絕，且拒絕原因和安全 / 正確性 / scope 有關
- AI 輸出可能造成誤導，例如把未確認資料寫成已確認事實

## 不需要記錄

- 不需要逐字貼完整對話
- 不需要記錄每一次小型 autocomplete
- 不需要記錄單純修 typo 或格式化

## 紀錄格式

| 時間       | 階段       | 任務                            | AI / Agent 建議                                                                                                  | 採用 / 拒絕 | 人類判斷理由                                                                                  | 相關檔案 / commit                                                                                                                                                        |
| ---------- | ---------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-09 | Phase 0    | 實作整理草稿                    | 在前端工作台加入建立、編輯、刪除、重設整理草稿；用保守預設標示需要人工確認、不能直接變成任務、agent 判斷需質疑處 | 採用        | 草稿只存在前端記憶體，不新增後端或外部 API；未把 `needs_review` / `unverified` 顯示成已確認   | `src/features/phase-0/Phase0Workbench.tsx`, `docs/phase0-observations.md`                                                                                                |
| 2026-07-09 | Phase 0    | 加入 AI 檢查按鈕                | 使用 Cloudflare AI Gateway key 呼叫外部模型                                                                      | 拒絕        | public starter 規則禁止 API key、外部 runtime API 與真實 LLM 呼叫；改做本機 AI 風格檢查       | `src/features/phase-0/Phase0Workbench.tsx`, `tests/app-smoke.test.tsx`                                                                                                   |
| 2026-07-09 | Phase 0    | 改用後端代理呼叫 AI             | 讓前端呼叫 `/api/ai-review`，由本機 Node proxy 讀 `.env` 的 key 後轉送 Cloudflare AI Gateway                     | 採用        | 不把 key 放進前端 bundle；AI 回覆只當風險提醒，仍不能把草稿標成已確認                         | `server/ai-review-server.ts`, `vite.config.ts`, `.env.example`                                                                                                           |
| 2026-07-09 | Phase 0    | 調整畫面風格                    | 讓首頁與工作台更可愛、柔和，保留待確認與不能直接變成任務的警示                                                   | 採用        | 只調整視覺呈現，不改原始資料、不把草稿或 AI 檢查顯示成已確認                                  | `src/app/App.tsx`, `src/styles/global.css`                                                                                                                               |
| 2026-07-09 | Phase 0    | 套用 AI Gateway API             | 讓 proxy 依照 Gateway URL 自動選擇 `authorization` 或 `cf-aig-authorization` header                              | 採用        | token 仍只在 `.env` 與後端 proxy；目前 `.env` 還需要補 `CLOUDFLARE_AI_GATEWAY_URL`            | `server/ai-review-server.ts`, `.env.example`                                                                                                                             |
| 2026-07-09 | Phase 0    | 新增候選整理頁                  | 新增候選分類、完整度、可用度、重要細節與缺漏提醒                                                                 | 採用        | 頁面只顯示候選整理與評分，不把任何 `needs_review` / `unverified` 資訊當成已確認               | `src/features/phase-0/Phase0OrganizedInfoPanel.tsx`, `src/app/App.tsx`                                                                                                   |
| 2026-07-09 | Phase 0    | 新增人力呼叫頁                  | 依原始資訊列出候選人力類型，目標不清楚時標示暫不呼叫                                                             | 採用        | 只做候選角色整理，不實際派人；所有待確認或未查核資料都不能直接呼叫人員                        | `src/features/phase-0/Phase0PeopleCallPanel.tsx`, `src/app/App.tsx`                                                                                                      |
| 2026-07-09 | Phase 0    | 改善草稿同步                    | 在整理工作台補回可展開的手動文字編輯，並加入送到候選整理的切頁按鈕                                               | 採用        | 手動輸入仍只是候選草稿，送出只同步到整理頁，不把資訊標為已確認                                | `src/features/phase-0/Phase0Workbench.tsx`, `src/app/App.tsx`                                                                                                            |
| 2026-07-09 | Phase 0    | 測試 AI proxy                   | 把 AI proxy 拆成可測試模組，補 server 測試與端到端本機 POST 測試，並讓 Cloudflare 錯誤顯示更明確                 | 採用        | 測試確認 key 不進前端；端到端結果是 Cloudflare 帳號餘額不足或需要 BYOK，草稿仍不能當成已確認  | `server/ai-review-server.ts`, `tests/ai-review-server.test.ts`                                                                                                           |
| 2026-07-09 | Phase 0    | 接上 OpenCode Gateway           | 依照本機 OpenCode 設定補齊 Cloudflare AI Gateway id、account AI base URL 與 Kimi 模型                            | 採用        | key 只放在被 git ignore 的 `.env`，前端仍只呼叫本機 proxy；AI 輸出只作風險提醒                | `server/ai-review-server.ts`, `.env.example`, `tests/ai-review-server.test.ts`                                                                                           |
| 2026-07-09 | Phase 0    | 同步遠端分支                    | 合併遠端更新後，移除被帶入 public starter 的後續 release pack，並恢復 Phase 0-only agent 規則                    | 採用        | public starter 不應預先保留訪談、persona、flow design 等後續課程材料；同步時保留 Phase 0 邊界 | `AGENTS.md`, `release-packs/**`                                                                                                                                          |
| 2026-07-09 | Release 01 | 使用 persona sub-agent 模擬訪談 | 讓回報者、資訊整理者、行動者三個 persona sub-agent 回饋 Phase 0 prototype，並整理成訪談紀錄、彙整與 v1 取捨草稿  | 採用        | 這些是模擬訪談，不是真實使用者結論；v1 暫時優先服務資訊整理者，Release 02 檔案已放回但先擱置  | `release-packs/01-interview-kit/docs/interview-notes.md`, `release-packs/01-interview-kit/docs/interview-summary.md`, `release-packs/01-interview-kit/docs/decisions.md` |
| 2026-07-09 | Release 01 | 調整 v1 優先使用者              | 原本建議先服務資訊整理者；使用者要求改以行動者為優先，並保留不能做真實行動判斷的安全界線                         | 採用        | 人類決定 v1 應先降低錯誤行動風險；採用行動者視角，但拒絕讓系統產生派工、出發或真實救災判斷    | `release-packs/01-interview-kit/docs/interview-summary.md`, `release-packs/01-interview-kit/docs/decisions.md`                                                           |
| 2026-07-09 | Release 01 | 補齊新增 persona 檔案           | 將第二輪訪談使用的新增 persona 先寫成獨立 persona 文件，讓後續 sub-agent 訪談有明確來源，而不是臨場生成角色      | 採用        | persona 仍是模擬研究素材，不是真實訪談；先有 persona 文件可降低 sub-agent 自行補設定的風險    | `release-packs/01-interview-kit/docs/personas/*.md`                                                                                                                      |
| 2026-07-09 | v1         | 實作行動者 demo                 | 建立五分頁 v1 demo：已人工確認、AI 排序、原始回報、回報表單、整理者工作台；加入高低品質模擬報告與人工確認狀態    | 採用        | 全部資料皆為 mock；人工確認只代表 demo 內的人為狀態，不代表真實世界查核；AI 排序不是派工排序  | `src/features/v1/V1Demo.tsx`, `src/features/v1/v1-demo-data.ts`, `src/app/App.tsx`, `tests/app-smoke.test.tsx`                                                           |
| 2026-07-09 | Release 01 | 補其他角色取捨                  | 新增回報者與資訊整理者優先時的決策草稿，方便之後和行動者方案比較，找出三方都能接受的 v1 資訊鏈                   | 採用        | 不推翻目前行動者優先；先補齊其他角色視角，避免最後方案只對單一角色好                          | `release-packs/01-interview-kit/docs/decisions-other-roles.md`                                                                                                           |
| 2026-07-09 | v1         | 回報表單顯示相關報告            | 回報者輸入時顯示可能相關報告，若同一主題可把內容加到既有報告下方，而不是建立重複報告                             | 採用        | 文字比對只作提示，不代表系統判定同一事件；新增補充資訊仍需人工確認                            | `src/features/v1/V1Demo.tsx`, `src/features/v1/v1-demo-data.ts`, `release-packs/01-interview-kit/docs/decisions-other-roles.md`                                          |
| 2026-07-09 | v1         | 調整已確認與資訊請求分頁        | 已人工確認分頁不再顯示待確認事項；新增資訊請求分頁，讓整理者針對特定報告送出需要補問的欄位                       | 採用        | 已確認報告在 demo 中應呈現完整資訊；資訊請求只要求補資料，不代表派工或出發指示                | `src/features/v1/V1Demo.tsx`, `src/features/v1/v1-demo-data.ts`, `tests/app-smoke.test.tsx`                                                                              |
| 2026-07-09 | Release 02 | 設計 v1 資訊流程                | 依 Release 02 flow kit 將回報、相關報告提示、整理者人工分流、資訊請求與行動者分頁整理成自然語言流程和 Mermaid 圖 | 採用        | 已先提交 v1 demo checkpoint；流程圖保留人工確認點，AI 只排序與提示，不作真實決策              | `release-packs/02-flow-design-kit/docs/flow.md`                                                                                                                          |
| 2026-07-09 | v1         | 補完整工作循環                  | 新增未確認 / 高風險分頁、資訊請求回覆流程、報告上的請求狀態與整理者操作紀錄                                      | 採用        | 讓回報者、整理者、行動者的資訊流更完整；仍不把未確認資訊放入已確認主畫面，也不產生真實派工    | `src/features/v1/V1Demo.tsx`, `src/styles/global.css`, `tests/app-smoke.test.tsx`, `release-packs/02-flow-design-kit/docs/flow.md`                                       |

## 範例

| 時間  | 階段    | 任務         | AI / Agent 建議                        | 採用 / 拒絕 | 人類判斷理由                              | 相關檔案 / commit             |
| ----- | ------- | ------------ | -------------------------------------- | ----------- | ----------------------------------------- | ----------------------------- |
| 09:45 | Phase 0 | 分析原始資訊 | 建議把社群貼文直接轉成 verified report | 拒絕        | 社群貼文來源未確認，應保持 `needs_review` | `docs/phase0-observations.md` |

## 課後反思

### AI 幫助最大的地方

-

### AI 最容易誤導的地方

-

### 下次使用 AI 開發前，我們會先準備

-
