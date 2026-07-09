import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord, Phase0WorkbenchDraft } from "./phase0-types";

type PeopleCallCandidate = {
  record: Phase0MessyRecord;
  decision: "do_not_call" | "candidate_only";
  peopleTypes: string[];
  objective: string;
  reason: string;
  confirmFirst: string[];
  tags: string[];
};

function peopleTypesFor(record: Phase0MessyRecord) {
  const rawText = record.rawText;
  const peopleTypes: string[] = [];

  if (rawText.includes("清泥") || rawText.includes("清淤")) {
    peopleTypes.push("清淤志工候選");
  }
  if (rawText.includes("水電") || rawText.includes("工班")) {
    peopleTypes.push("水電專長志工候選");
  }
  if (rawText.includes("雨鞋") || rawText.includes("物資")) {
    peopleTypes.push("物資盤點或現場值守志工候選");
  }
  if (
    rawText.includes("集合點") ||
    rawText.includes("報到") ||
    rawText.includes("服務台")
  ) {
    peopleTypes.push("現場協調或報到窗口候選");
  }
  if (rawText.includes("道路封閉") || rawText.includes("淹水")) {
    peopleTypes.push("安全確認或交通資訊確認角色候選");
  }
  if (rawText.includes("家具")) {
    peopleTypes.push("搬運協助志工候選");
  }
  if (rawText.includes("藥品")) {
    peopleTypes.push("醫藥需求確認角色候選");
  }
  if (rawText.includes("家屬") || rawText.includes("長者")) {
    peopleTypes.push("個案聯絡與同意確認角色候選");
  }

  return peopleTypes.length > 0 ? peopleTypes : ["人工確認角色候選"];
}

function objectiveFor(record: Phase0MessyRecord, draft?: Phase0WorkbenchDraft) {
  if (draft?.candidateSummary.trim()) return draft.candidateSummary;
  const rawText = record.rawText;

  if (rawText.includes("清泥")) return "可能需要清泥協助。";
  if (rawText.includes("雨鞋")) return "可能需要確認雨鞋物資狀態。";
  if (rawText.includes("水電")) return "可能需要確認水電支援或需求。";
  if (rawText.includes("集合點")) return "可能需要確認集合點是否可用。";
  if (rawText.includes("道路封閉")) return "可能需要確認道路公告是否有效。";
  if (rawText.includes("家具"))
    return "可能需要搬運協助，但需先確認同意與位置。";
  if (rawText.includes("藥品")) return "可能需要藥品需求確認。";

  return "目標尚不明確。";
}

function confirmFirstFor(
  record: Phase0MessyRecord,
  draft?: Phase0WorkbenchDraft,
) {
  const rawText = record.rawText;
  const items: string[] = [];

  if (record.verificationStatus !== "verified") {
    items.push("查核狀態仍不是已確認。");
  }
  if (draft?.cannotBecomeTaskReason.trim()) {
    items.push(...draft.cannotBecomeTaskReason.split("\n").filter(Boolean));
  }
  if (
    rawText.includes("不知道") ||
    rawText.includes("疑似") ||
    rawText.includes("不確定")
  ) {
    items.push("原文有不確定語句，需要補問。");
  }
  if (
    rawText.includes("老雜貨店") ||
    rawText.includes("附近") ||
    rawText.includes("那邊") ||
    rawText.includes("A 區")
  ) {
    items.push("地點不夠精確。");
  }
  if (rawText.includes("代") || rawText.includes("家屬")) {
    items.push("需要確認當事人同意與實際需求。");
  }
  if (
    rawText.includes("淹水") ||
    rawText.includes("道路封閉") ||
    rawText.includes("先不要再派人")
  ) {
    items.push("需要先確認現場安全原因。");
  }
  if (rawText.includes("直接過去")) {
    items.push("不能只依社群轉述要求人員直接前往。");
  }

  return Array.from(
    new Set(items.length > 0 ? items : ["需要人工確認目標與安全性。"]),
  );
}

function shouldNotCall(
  record: Phase0MessyRecord,
  draft?: Phase0WorkbenchDraft,
) {
  const rawText = record.rawText;

  return (
    record.verificationStatus !== "verified" ||
    draft?.unsafeToActDirectly === true ||
    rawText.includes("不知道") ||
    rawText.includes("疑似") ||
    rawText.includes("不確定") ||
    rawText.includes("無法確認") ||
    rawText.includes("沒有說") ||
    rawText.includes("道路封閉") ||
    rawText.includes("淹水") ||
    rawText.includes("先不要再派人") ||
    rawText.includes("直接過去")
  );
}

function createPeopleCallCandidate(
  record: Phase0MessyRecord,
  draft?: Phase0WorkbenchDraft,
): PeopleCallCandidate {
  const doNotCall = shouldNotCall(record, draft);
  const peopleTypes = peopleTypesFor(record);
  const tags = [
    doNotCall ? "暫不呼叫" : "候選呼叫",
    record.verificationStatus === "unverified" ? "未查核" : "待人工確認",
    ...peopleTypes,
  ];

  if (draft) tags.push("草稿同步");
  if (draft?.operatorIsAffectedPerson === "no") tags.push("操作者非當事人");

  return {
    record,
    decision: doNotCall ? "do_not_call" : "candidate_only",
    peopleTypes,
    objective: objectiveFor(record, draft),
    reason: doNotCall
      ? "暫不呼叫：目標、位置、安全或查核狀態仍不清楚。"
      : "只作為候選呼叫名單，仍需人工確認後才可通知人員。",
    confirmFirst: confirmFirstFor(record, draft),
    tags: Array.from(new Set(tags)),
  };
}

export function Phase0PeopleCallPanel({
  records,
  drafts,
}: {
  records: Phase0MessyRecord[];
  drafts: Record<string, Phase0WorkbenchDraft>;
}) {
  const candidates = records.map((record) =>
    createPeopleCallCandidate(record, drafts[record.id]),
  );
  const doNotCallCount = candidates.filter(
    (candidate) => candidate.decision === "do_not_call",
  ).length;
  const peopleTypeCount = new Set(
    candidates.flatMap((candidate) => candidate.peopleTypes),
  ).size;

  return (
    <div className="people-call">
      <div className="panel__header">
        <div>
          <h2>人力呼叫候選</h2>
          <p>只整理可能需要聯絡的人力類型；目標不清楚時一律標記暫不呼叫。</p>
        </div>
        <p>{records.length} 筆候選</p>
      </div>

      <section className="people-call__summary" aria-label="人力呼叫摘要">
        <div>
          <span>{doNotCallCount}</span>
          <p>筆目前暫不呼叫</p>
        </div>
        <div>
          <span>{peopleTypeCount}</span>
          <p>種候選人力類型</p>
        </div>
        <div>
          <span>0</span>
          <p>筆可直接派人</p>
        </div>
      </section>

      <div className="people-call__grid">
        {candidates.map((candidate) => (
          <article className="people-card" key={candidate.record.id}>
            <div className="people-card__header">
              <div>
                <p className="eyebrow">人力呼叫判斷</p>
                <h3>{candidate.record.id}</h3>
              </div>
              <span
                className={
                  candidate.decision === "do_not_call"
                    ? "dispatch-status dispatch-status--stop"
                    : "dispatch-status"
                }
              >
                {candidate.decision === "do_not_call" ? "暫不呼叫" : "候選呼叫"}
              </span>
            </div>

            <p>{candidate.objective}</p>

            <div className="people-card__meta">
              <StatusBadge status={candidate.record.verificationStatus} />
              <SourceLabel sourceType={candidate.record.sourceType} />
              <span>更新：{formatDateTime(candidate.record.updatedAt)}</span>
            </div>

            <section>
              <h4>可能需要的人</h4>
              <div className="tag-list">
                {candidate.peopleTypes.map((peopleType) => (
                  <span key={peopleType}>{peopleType}</span>
                ))}
              </div>
            </section>

            <section className="people-card__stop">
              <h4>呼叫判斷</h4>
              <p>{candidate.reason}</p>
              <h5>呼叫前必須確認</h5>
              <ul>
                {candidate.confirmFirst.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <div
              className="tag-list"
              aria-label={`${candidate.record.id} 人力標籤`}
            >
              {candidate.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
