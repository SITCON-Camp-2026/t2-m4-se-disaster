import { useState } from "react";
import messyReports from "../fixtures/phase-0/messy-reports.json";
import { EmptyState } from "../components/EmptyState";
import { createInitialDrafts } from "../features/phase-0/phase0-drafts";
import { Phase0OrganizedInfoPanel } from "../features/phase-0/Phase0OrganizedInfoPanel";
import { Phase0PeopleCallPanel } from "../features/phase-0/Phase0PeopleCallPanel";
import { Phase0RawInfoPanel } from "../features/phase-0/Phase0RawInfoPanel";
import { Phase0Workbench } from "../features/phase-0/Phase0Workbench";
import type { Phase0MessyRecord } from "../features/phase-0/phase0-types";
import { V1Demo } from "../features/v1/V1Demo";

type TabKey = "raw" | "organized" | "people" | "workbench";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "raw", label: "原始資訊" },
  { key: "organized", label: "候選整理" },
  { key: "people", label: "人力呼叫" },
  { key: "workbench", label: "整理工作台" },
];

const phase0Records = messyReports satisfies Phase0MessyRecord[];

export function App() {
  const isV1Route = window.location.pathname.startsWith("/v1");
  const [activeTab, setActiveTab] = useState<TabKey>("raw");
  const [selectedRecordId, setSelectedRecordId] = useState(
    phase0Records[0]?.id ?? "",
  );
  const [drafts, setDrafts] = useState(() =>
    createInitialDrafts(phase0Records),
  );

  if (isV1Route) {
    return (
      <main className="layout">
        <header className="hero">
          <div className="hero__meta">
            <p className="eyebrow">SITCON Camp 2026</p>
            <span>v1</span>
          </div>
          <h1>行動者資訊分流 Demo</h1>
          <p>
            v1 使用模擬報告展示五個工作區：已人工確認、AI 排序、原始回報、
            回報表單與整理者工作台。高急迫但未確認的資料會帶警示，不會被系統標成可出發。
          </p>
          <a className="hero__link" href="/">
            回到 Phase 0
          </a>
        </header>
        <section className="panel">
          <V1Demo />
        </section>
      </main>
    );
  }

  function selectForWorkbench(recordId: string) {
    setSelectedRecordId(recordId);
    setActiveTab("workbench");
  }

  return (
    <main className="layout">
      <header className="hero">
        <div className="hero__meta">
          <p className="eyebrow">SITCON Camp 2026</p>
          <span>Phase 0</span>
        </div>
        <h1>災害資訊整理工作台</h1>
        <p>
          第一階段先用 coding agent
          做出可展示的前端原型，再從成果中看見資料品質、角色、狀態與來源的限制。
        </p>
        <a className="hero__link" href="/v1/">
          前往 v1 行動者 Demo
        </a>
      </header>

      <nav className="tabs" aria-label="第一階段工作區">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="panel">
        {phase0Records.length === 0 ? (
          <EmptyState message="目前沒有資料" />
        ) : activeTab === "raw" ? (
          <Phase0RawInfoPanel
            records={phase0Records}
            selectedRecordId={selectedRecordId}
            onSelect={selectForWorkbench}
          />
        ) : activeTab === "organized" ? (
          <Phase0OrganizedInfoPanel records={phase0Records} drafts={drafts} />
        ) : activeTab === "people" ? (
          <Phase0PeopleCallPanel records={phase0Records} drafts={drafts} />
        ) : (
          <Phase0Workbench
            records={phase0Records}
            selectedRecordId={selectedRecordId}
            onSelect={setSelectedRecordId}
            drafts={drafts}
            setDrafts={setDrafts}
            onOpenOrganized={() => setActiveTab("organized")}
          />
        )}
      </section>
    </main>
  );
}
