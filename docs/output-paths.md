# 成果放置路徑與 GitHub Pages 展示規則

本專案會被 build 成 GitHub Pages 網頁。Phase 0 的前端成果必須能從部署後的首頁看到或操作。

主要入口是：

```text
src/main.tsx
src/app/App.tsx
```

如果成果沒有被 `src/app/App.tsx` 使用，或沒有被 `App.tsx` 匯入的元件使用，GitHub Pages demo 就看不到它；這樣不算完成前端成果。

## 核心規則

1. 可展示成果必須接進 Vite app。
2. 主流程必須能從 GitHub Pages 首頁進入。
3. 只新增 `docs/`、`tests/` 或未被引用的 component，不算完成前端 demo。
4. Phase 0 原始資訊來自 `src/fixtures/phase-0/`。
5. 不要把未整理資料搬進 shared fixtures 假裝乾淨。
6. GitHub Pages 展示前，請至少確認 `pnpm build` 能成功。

## 產物放置位置

| 產物             | 放置位置                                     | 是否必須接到 UI | 說明                              |
| ---------------- | -------------------------------------------- | --------------- | --------------------------------- |
| 主流程畫面       | `src/app/App.tsx` 或由它匯入的 component     | 是              | GitHub Pages 首頁必須能看見或操作 |
| 新 UI 元件       | `src/components/` 或 `src/features/phase-0/` | 是              | 新增後要從 `App.tsx` 接進去       |
| Phase 0 資料讀取 | `src/fixtures/phase-0/`                      | starter 會讀取  | 原始資訊，不代表整理後資料        |
| 測試             | `tests/`                                     | 否              | 用來驗證 UI 行為與資料安全邊界    |
| Phase 0 觀察     | `docs/phase0-observations.md`                | 否              | 記錄資料品質問題                  |
| AI log           | `docs/ai-log.md`                             | 否              | 記錄 AI 協作與人類判斷            |

## 常見不算完成的情況

以下都不算完成前端成果：

- 新增了 component，但沒有被 `App.tsx` 匯入或顯示。
- 新增了 fixture，但 UI 沒有使用。
- 只更新文件，但沒有任何可操作畫面。
- 本機某個檔案存在，但 GitHub Pages 首頁看不到。

## 建議開發流程

```text
讀 task card
  → 找到資料來源
  → 先請 coding agent 分析原始資訊
  → 決定最小畫面
  → 接進 App.tsx / component
  → 補 observation / AI log
  → pnpm build
  → 確認 GitHub Pages 首頁可展示
```

## Demo 檢核點

交付前請回答：

- [ ] 打開 GitHub Pages 首頁，是否能看到本階段成果？
- [ ] 使用者是否能看出資料來源與查核狀態？
- [ ] 不確定資料是否被清楚標示？
- [ ] `docs/ai-log.md` 是否記錄重要 AI 協作？
