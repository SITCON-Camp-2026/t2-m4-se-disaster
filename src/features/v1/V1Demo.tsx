import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  sortForAiQueue,
  type V1Report,
  type V1ReportQuality,
  type V1VerificationStatus,
  v1Reports,
} from "./v1-demo-data";

type V1Tab =
  | "verified"
  | "ai-sorted"
  | "raw"
  | "report-form"
  | "info-requests"
  | "organizer";

type InfoRequest = {
  id: string;
  reportId: string;
  field: string;
  question: string;
  createdAt: string;
};

const tabs: Array<{ key: V1Tab; label: string }> = [
  { key: "verified", label: "已人工確認" },
  { key: "ai-sorted", label: "AI 排序" },
  { key: "raw", label: "原始回報" },
  { key: "report-form", label: "回報表單" },
  { key: "info-requests", label: "資訊請求" },
  { key: "organizer", label: "整理工作台" },
];

const qualityLabels: Record<V1ReportQuality, string> = {
  high: "高品質",
  medium: "中等品質",
  low: "低品質",
  spam: "疑似垃圾",
};

const verificationLabels: Record<V1VerificationStatus, string> = {
  manual_verified: "人工確認",
  needs_review: "需要確認",
  unverified: "未確認",
  rejected: "暫不採用",
};

const sourceLabels: Record<V1Report["sourceType"], string> = {
  field_report: "現場回報",
  phone_call: "電話",
  social_post: "社群轉錄",
  volunteer_update: "志工更新",
  mock: "模擬資料",
};

const topicKeywords = [
  "飲用水",
  "水",
  "避難",
  "藥",
  "照護",
  "積水",
  "通道",
  "動線",
  "物資",
  "運送",
  "車",
  "求助",
  "接收",
  "募集",
  "志工",
];

function createUserReport(rawText: string): V1Report {
  return {
    id: `V1-FORM-${Date.now()}`,
    title: "表單新增的未確認回報",
    rawText,
    sourceType: "mock",
    reporterRole: "表單填寫者",
    locationText: "表單未確認地點",
    urgency: 3,
    quality: "low",
    verificationStatus: "needs_review",
    isAiSorted: true,
    isLikelySpam: false,
    updatedAt: new Date().toISOString(),
    actionSummary: "表單新增資料尚未人工確認，不進入已確認主清單。",
    confirmationQuestions: [
      "回報者是否為當事人？",
      "地點、時間、需求是否可人工確認？",
    ],
    warnings: ["新回報只是一筆線索，不是任務。"],
    organizerNotes: "等待整理者人工檢查。",
    additionalInfo: [],
  };
}

function findRelatedReports(input: string, reports: V1Report[]) {
  const trimmed = input.trim();
  if (trimmed.length < 4) return [];

  const matchedKeywords = topicKeywords.filter((keyword) =>
    trimmed.includes(keyword),
  );

  return reports
    .map((report) => {
      const searchable = `${report.title} ${report.rawText} ${report.locationText}`;
      const score = matchedKeywords.filter((keyword) =>
        searchable.includes(keyword),
      ).length;
      return { report, score };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || b.report.urgency - a.report.urgency)
    .slice(0, 3)
    .map((candidate) => candidate.report);
}

export function V1Demo() {
  const [activeTab, setActiveTab] = useState<V1Tab>("verified");
  const [reports, setReports] = useState<V1Report[]>(v1Reports);
  const [formText, setFormText] = useState("");
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([]);

  const verifiedReports = reports.filter(
    (report) => report.verificationStatus === "manual_verified",
  );
  const aiSortedReports = useMemo(() => sortForAiQueue(reports), [reports]);
  const relatedReports = useMemo(
    () => findRelatedReports(formText, reports),
    [formText, reports],
  );
  const unverifiedCount = reports.filter(
    (report) => report.verificationStatus !== "manual_verified",
  ).length;

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = formText.trim();
    if (!trimmed) return;
    setReports((currentReports) => [
      createUserReport(trimmed),
      ...currentReports,
    ]);
    setFormText("");
    setActiveTab("raw");
  }

  function addAdditionalInfo(reportId: string) {
    const trimmed = formText.trim();
    if (!trimmed) return;
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              additionalInfo: [
                ...report.additionalInfo,
                `表單補充：${trimmed}`,
              ],
              verificationStatus:
                report.verificationStatus === "manual_verified"
                  ? report.verificationStatus
                  : "needs_review",
              organizerNotes: `${report.organizerNotes} / 有新的回報者補充資訊，需人工檢查是否同一事件。`,
            }
          : report,
      ),
    );
    setFormText("");
    setActiveTab("raw");
  }

  function markManuallyVerified(reportId: string) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              verificationStatus: "manual_verified",
              quality: report.quality === "spam" ? "low" : report.quality,
              organizerNotes: `${report.organizerNotes} / 人工標示為已確認。`,
            }
          : report,
      ),
    );
  }

  function markNeedsReview(reportId: string) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              verificationStatus: "needs_review",
              organizerNotes: `${report.organizerNotes} / 退回人工確認。`,
            }
          : report,
      ),
    );
  }

  function createInfoRequest(request: Omit<InfoRequest, "id" | "createdAt">) {
    setInfoRequests((currentRequests) => [
      {
        ...request,
        id: `REQ-${String(currentRequests.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
      },
      ...currentRequests,
    ]);
  }

  return (
    <section className="v1-demo" aria-labelledby="v1-heading">
      <header className="v1-hero">
        <p className="eyebrow">v1 demo</p>
        <h2 id="v1-heading">行動者資訊分流</h2>
        <p>
          這是模擬資料工作台。主畫面顯示人工確認過的高品質回報；未確認、
          高急迫或疑似垃圾內容會留在 AI 排序與原始回報中，並保留警示。
        </p>
      </header>

      <div className="v1-stats" aria-label="v1 報告統計">
        <Stat label="人工確認" value={verifiedReports.length} />
        <Stat label="待確認或暫不採用" value={unverifiedCount} />
        <Stat
          label="疑似垃圾"
          value={reports.filter((report) => report.isLikelySpam).length}
        />
      </div>

      <nav className="tabs" aria-label="v1 工作區">
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

      {activeTab === "verified" ? (
        <ReportGrid
          title="已人工確認報告"
          description="這些是模擬資料中品質較高、已由人工標示確認的回報。系統仍不產生派工、路線或出發建議。"
          reports={verifiedReports}
          mode="verified"
        />
      ) : activeTab === "ai-sorted" ? (
        <ReportGrid
          title="AI 排序報告"
          description="排序規則只用於整理畫面：高急迫在上、疑似垃圾在下。排序不是可信度背書，也不是行動優先順序。"
          reports={aiSortedReports}
          mode="ai"
        />
      ) : activeTab === "raw" ? (
        <ReportGrid
          title="原始回報"
          description="保留原文，讓行動者或整理者看見資料品質差異。低品質回報不會被改寫成任務。"
          reports={reports}
          mode="raw"
        />
      ) : activeTab === "report-form" ? (
        <ReportForm
          value={formText}
          onChange={setFormText}
          onSubmit={submitReport}
          relatedReports={relatedReports}
          onAddAdditionalInfo={addAdditionalInfo}
        />
      ) : activeTab === "info-requests" ? (
        <InfoRequestPanel
          reports={reports}
          requests={infoRequests}
          onCreateRequest={createInfoRequest}
        />
      ) : (
        <OrganizerWorkstation
          reports={reports}
          onVerify={markManuallyVerified}
          onNeedsReview={markNeedsReview}
        />
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReportGrid({
  title,
  description,
  reports,
  mode,
}: {
  title: string;
  description: string;
  reports: V1Report[];
  mode: "verified" | "ai" | "raw";
}) {
  return (
    <section className="v1-section">
      <div className="panel__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{reports.length} 筆</span>
      </div>
      <div className="v1-grid">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} mode={mode} />
        ))}
      </div>
    </section>
  );
}

function ReportCard({
  report,
  mode,
}: {
  report: V1Report;
  mode: "verified" | "ai" | "raw";
}) {
  return (
    <article className={`v1-card v1-card--${report.quality}`}>
      <div className="v1-card__header">
        <div>
          <p className="v1-card__id">{report.id}</p>
          <h4>{report.title}</h4>
        </div>
        <span className={`v1-pill v1-pill--${report.verificationStatus}`}>
          {verificationLabels[report.verificationStatus]}
        </span>
      </div>

      <div className="v1-card__tags">
        <span>{qualityLabels[report.quality]}</span>
        <span>急迫 {report.urgency}/5</span>
        <span>{sourceLabels[report.sourceType]}</span>
      </div>

      <p>{mode === "raw" ? report.rawText : report.actionSummary}</p>

      <dl className="v1-card__meta">
        <div>
          <dt>地點描述</dt>
          <dd>{report.locationText}</dd>
        </div>
        <div>
          <dt>回報角色</dt>
          <dd>{report.reporterRole}</dd>
        </div>
      </dl>

      {mode !== "verified" && (
        <WarningList title="警示" items={report.warnings} />
      )}
      {mode !== "verified" && (
        <WarningList title="需要確認" items={report.confirmationQuestions} />
      )}
      {report.additionalInfo.length > 0 && (
        <WarningList title="補充資訊" items={report.additionalInfo} />
      )}
    </article>
  );
}

function InfoRequestPanel({
  reports,
  requests,
  onCreateRequest,
}: {
  reports: V1Report[];
  requests: InfoRequest[];
  onCreateRequest: (request: Omit<InfoRequest, "id" | "createdAt">) => void;
}) {
  const defaultReportId =
    reports.find((report) => report.verificationStatus !== "manual_verified")
      ?.id ??
    reports[0]?.id ??
    "";
  const [reportId, setReportId] = useState(defaultReportId);
  const [field, setField] = useState("地點");
  const [question, setQuestion] = useState("");

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!reportId || !trimmed) return;
    onCreateRequest({ reportId, field, question: trimmed });
    setQuestion("");
  }

  return (
    <section className="v1-form-panel">
      <h3>資訊請求</h3>
      <p>
        整理者可以針對某筆報告送出需要補問的欄位。這不是派工，也不是要求出發，
        只是把缺少的資訊說清楚。
      </p>
      <form onSubmit={submitRequest}>
        <label>
          目標報告
          <select
            value={reportId}
            onChange={(event) => setReportId(event.target.value)}
          >
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.id} {report.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          需要補問的欄位
          <select
            value={field}
            onChange={(event) => setField(event.target.value)}
          >
            <option value="地點">地點</option>
            <option value="時間">時間</option>
            <option value="需求是否仍存在">需求是否仍存在</option>
            <option value="接收條件">接收條件</option>
            <option value="回報者身分">回報者身分</option>
            <option value="其他">其他</option>
          </select>
        </label>
        <label>
          請求內容
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例如：請確認這筆回報的接收窗口是否仍在現場。"
          />
        </label>
        <button type="submit">送出資訊請求</button>
      </form>

      <div className="v1-table" role="list" aria-label="已送出的資訊請求">
        {requests.length === 0 ? (
          <p>目前沒有資訊請求。</p>
        ) : (
          requests.map((request) => (
            <article key={request.id} role="listitem">
              <div>
                <h4>
                  {request.id} / {request.reportId} / {request.field}
                </h4>
                <p>{request.question}</p>
                <small>等待人工補充，不代表派工。</small>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function WarningList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="v1-card__list">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReportForm({
  value,
  onChange,
  onSubmit,
  relatedReports,
  onAddAdditionalInfo,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  relatedReports: V1Report[];
  onAddAdditionalInfo: (reportId: string) => void;
}) {
  return (
    <section className="v1-form-panel">
      <h3>新增原始回報</h3>
      <p>
        輸入時會先顯示可能相關的既有報告。如果是同一主題，可以把內容加在既有報告下方，避免重複建立新報告。
      </p>
      <form onSubmit={onSubmit}>
        <label>
          原始回報內容
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="請貼上模擬回報文字，不要填入真實地址、電話或個資。"
          />
        </label>
        {relatedReports.length > 0 && (
          <div className="v1-related">
            <h4>可能相關報告</h4>
            <p>
              這只是文字比對提示，不代表系統判定為同一事件。是否合併仍需人工確認。
            </p>
            <div className="v1-related__list">
              {relatedReports.map((report) => (
                <article key={report.id}>
                  <div>
                    <strong>
                      {report.id} {report.title}
                    </strong>
                    <span>
                      {verificationLabels[report.verificationStatus]} /{" "}
                      {qualityLabels[report.quality]}
                    </span>
                  </div>
                  <p>{report.actionSummary}</p>
                  <button
                    type="button"
                    onClick={() => onAddAdditionalInfo(report.id)}
                  >
                    加到這筆報告下方
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
        <button type="submit">加入原始回報</button>
      </form>
    </section>
  );
}

function OrganizerWorkstation({
  reports,
  onVerify,
  onNeedsReview,
}: {
  reports: V1Report[];
  onVerify: (reportId: string) => void;
  onNeedsReview: (reportId: string) => void;
}) {
  return (
    <section className="v1-section">
      <div className="panel__header">
        <div>
          <h3>整理者工作台</h3>
          <p>
            這裡讓整理者模擬人工確認或退回確認。按鈕只改變前端記憶體狀態，
            不代表真實救災判斷。
          </p>
        </div>
      </div>
      <div className="v1-table" role="list">
        {reports.map((report) => (
          <article key={report.id} role="listitem">
            <div>
              <h4>
                {report.id} {report.title}
              </h4>
              <p>{report.organizerNotes}</p>
              <small>
                {qualityLabels[report.quality]} /{" "}
                {verificationLabels[report.verificationStatus]}
              </small>
            </div>
            <div className="v1-table__actions">
              <button
                type="button"
                onClick={() => onVerify(report.id)}
                disabled={report.verificationStatus === "manual_verified"}
              >
                標示人工確認
              </button>
              <button type="button" onClick={() => onNeedsReview(report.id)}>
                退回確認
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
