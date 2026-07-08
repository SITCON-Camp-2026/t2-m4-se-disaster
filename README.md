# 災害資訊積木起始專案

SITCON Camp 2026 軟體工程工作坊的 Phase 0 public 起始專案。

這是一個前端-only 的學習原型。Phase 0 的核心體驗是：每位學員在自己的個人 repo 中使用 Codex + VS Code extension，快速做出一個能暴露資料品質問題的資訊整理工作台。

本 public 起始專案只包含 Phase 0。Phase 0 之後的訪談、流程設計、實作支架、變更事件、交接材料與成果交流材料，會由講師在課程中從 private staff repo 釋出。

## 快速開始

```bash
pnpm install
pnpm dev
```

## 常用指令

```bash
pnpm validate:data
pnpm test
pnpm build
pnpm check
```

## GitHub Pages 展示規則

本 repo 會被 build 成 GitHub Pages 網頁。學員的前端成果必須能從部署後的首頁看到或操作。

主要入口：

```text
src/main.tsx
src/app/App.tsx
```

請把可展示成果接進 `src/app/App.tsx`，或由 `App.tsx` 匯入的 component。只新增 `docs/`、`tests/` 或未被匯入的 component，不算完成前端 demo。

詳細規則請看 [`docs/output-paths.md`](docs/output-paths.md)。

## 第一階段入口

上課時請先讀這些文件。它們只會引導 Phase 0，不會提前提供後續階段材料。

1. [`docs/student-context.md`](docs/student-context.md)
2. [`docs/brief.md`](docs/brief.md)
3. [`docs/output-paths.md`](docs/output-paths.md)
4. [`docs/tasks/00-how-to-use-task-cards.md`](docs/tasks/00-how-to-use-task-cards.md)
5. [`docs/tasks/01-phase-0-messy-sprint.md`](docs/tasks/01-phase-0-messy-sprint.md)
6. [`docs/tasks/02-phase-0-debrief.md`](docs/tasks/02-phase-0-debrief.md)

## 課程限制

- 不做後端服務。
- 不使用真實個資。
- 不呼叫真實 LLM runtime API。
- 不查真實地圖、真實地址、真實電話或真實人物資料。
- 不做真實救災判斷。
- Phase 0 使用 `src/fixtures/phase-0/` 的原始資訊 / 未整理資料。
- 不把未整理資料搬進 shared fixtures 假裝成整理後資料。
- 若學生文件需要保留英文技術詞，請搭配中文說法，例如資料格式（schema）或完成條件（completion criteria）。
- public 起始專案不放後續課程材料、隱藏變更資料、講師指南或標準答案。

## 授權

- 程式碼：MIT
- 教案與文件：CC BY-SA
- mock data：CC0
