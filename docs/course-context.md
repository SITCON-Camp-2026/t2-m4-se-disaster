# Course Context

This document is for instructors, TAs, repository maintainers, and coding agents. Student-facing Phase 0 context starts from `docs/student-context.md`.

## Course Theme

**災害資訊積木：從混亂資訊到可被下一位協作者理解的前端工作台**

Students use AI-assisted development to experience how quickly a prototype can expose information quality problems. The goal is not to build a real disaster response system, and not to let AI decide what is true or what action should happen.

## Current Repository Boundary

Public starter source:

```text
sitcon-tw/camp2026-se-disaster-starter
```

Staff-only material source:

```text
sitcon-tw/camp2026-se-disaster-staff
```

Student repositories are individual repositories in the org, named similarly to:

```text
t1-m1-se-disaster
```

Each student maintains their own codebase. A team is a co-learning studio for discussion, comparison, and feedback; it is not a shared repository or shared codebase.

This public starter must only contain Phase 0. Materials after Phase 0 are released by instructors during class from the private staff repository.

## Fixed Decisions

Do not change these without asking the course designer.

- Stack: Vite + React + TypeScript + Node 24 + pnpm.
- Tooling: Codex + VS Code extension.
- Runtime: front-end only.
- No backend service.
- No database.
- No real LLM runtime API call.
- No API keys or secrets.
- No real personal data.
- No real disaster case data.
- No real map dependency as a core dependency unless explicitly requested.
- Code license: MIT.
- Curriculum and documents: CC BY-SA.
- Mock data: CC0.
- Repository and demo are expected to be public.

## Public Starter Must Not Contain

- Hidden event data.
- Mentor guide.
- Expected answer.
- The complete original report PDF.
- Concrete interview materials.
- Concrete process-design materials.
- Change request materials.
- Concrete transfer materials.
- Concrete final-sharing materials.
- Materials that let students preview Phase 0 follow-up releases.

Blank templates that are only Phase 0 observation or AI log scaffolding may stay. Technical support for the Vite app, tests, fixtures, and validation may stay when it does not reveal later course content.

## Phase 0 Scope

Phase 0 asks students to face a small set of original / messy information and build a visible front-end workbench that makes uncertainty obvious.

The workbench should help students notice:

- Which fields are missing or unclear.
- Which claims are not confirmed.
- Which suggestions came from a coding agent and still need human review.
- Why raw information cannot be displayed as verified fact.

The public starter may include:

- Phase 0 student context and task cards.
- Phase 0 original information under `src/fixtures/phase-0/`.
- A minimal Vite app entry.
- Technical tests and validation for the starter.
- `docs/phase0-observations.md`.
- `docs/ai-log.md`.

## Data And Safety Boundary

- Phase 0 original information is mock data.
- Do not add real disaster reports, real addresses, real phone numbers, real personal names, or real locations.
- Do not let AI decide which information is true.
- Do not let AI decide rescue priority or volunteer action.
- Do not display unconfirmed information as confirmed / verified fact.
- Do not place later release data in this public starter.

If a technical document needs English terms, pair them with student-readable wording: 原始資訊 / 未整理資料, 整理後資料, 資料格式, 完成條件, 畫面從哪個檔案進入.

## GitHub Pages Deliverable Rule

The project is built and deployed as a GitHub Pages site. Student deliverables must be visible or operable from the deployed home page.

Main app path:

```text
src/main.tsx
src/app/App.tsx
```

A component, fixture, data file, or feature is not a front-end deliverable until it is used by `src/app/App.tsx` or by a component imported from `App.tsx`.

Docs and tests support the engineering process, but they do not replace the deployed demo.

## Acceptance For This Public Starter

The starter repo is acceptable when:

- `pnpm install` succeeds.
- `pnpm check` succeeds.
- It has Phase 0 original information.
- It has a minimal Phase 0 UI for source, status, uncertainty, and review state.
- It has Phase 0 student context, brief, output path rules, task card instructions, sprint task, and debrief task.
- It has `docs/phase0-observations.md` and `docs/ai-log.md`.
- It has AGENTS, SAFETY, DATA_SOURCES, README, TEAM.
- It has CI and GitHub Pages workflow support.
- It contains no hidden event data, mentor guide, expected answer, real personal data, secrets, real disaster data, or real LLM runtime calls.
