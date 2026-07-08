# Maintainer Decisions

## DEC-001：

### Context

Starter repository commands and CI should use one package manager so students and agents do not split workflows.

### Options considered

- Keep the previous package-manager workflow.
- Use pnpm as the only documented and CI package manager.

### Decision

Use Node 24 and pnpm for install, scripts, lockfile, CI, and course documentation.

### Consequences

Contributors should use Node 24, then run `pnpm install` and `pnpm check`. No alternate package manager is supported.

## DEC-002：Phase 0 starter 不預先完成整理 CRUD

### Context

第一階段要讓學員用 coding agent 做出有操作感的災害資訊整理工作台。如果 public starter 已經完成整理草稿 CRUD 或內建每筆原始資訊的候選答案，學員只會操作既有結果，較難體驗 agent 寫程式與人類審查的取捨。

### Options considered

- 在 starter repo 直接完成整理草稿 CRUD 與候選判斷。
- Starter 只提供原始資訊、工作台入口與安全預設，CRUD 由學員透過 coding agent 實作。

### Decision

Starter 保留 Phase 0 入口、原始資訊顯示、查核狀態標示與保守安全預設；整理草稿的建立、查看、編輯、刪除或重設，留給學員依照 Phase 0 task card 使用 coding agent 完成。

### Consequences

Starter 不應 hardcode M-001 到 M-012 的完整候選分類、證據或卡住原因。學員需要在實作 CRUD 後自行判斷哪些 agent 建議可信、哪些必須修正或交給人工確認。
