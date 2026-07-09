import { useMemo, useState } from "react";
import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord, Phase0WorkbenchDraft } from "./phase0-types";

type Rating = {
  score: 1 | 2 | 3 | 4 | 5;
  label: string;
  reason: string;
};

type OrganizedCandidate = {
  record: Phase0MessyRecord;
  category: string;
  candidateSummary: string;
  completeness: Rating;
  usefulness: Rating;
  importantDetails: string[];
  missingDetails: string[];
  dispatchAdvice: {
    decision: "do_not_send" | "candidate_only";
    peopleTypes: string[];
    reason: string;
    confirmBeforeSending: string[];
  };
  reviewFocus: string;
  taskWarning: string;
  tags: string[];
  syncedFromDraft: boolean;
};

const allTag = "全部";

function rating(score: Rating["score"], reason: string): Rating {
  const labels: Record<Rating["score"], string> = {
    1: "很低",
    2: "偏低",
    3: "中等",
    4: "偏高",
    5: "很高",
  };

  return {
    score,
    label: labels[score],
    reason,
  };
}

function categoryFor(rawText: string) {
  if (rawText.includes("雨鞋") || rawText.includes("飲用水")) {
    return "物資與服務狀態候選";
  }
  if (rawText.includes("水電") || rawText.includes("工班")) {
    return "水電支援候選";
  }
  if (rawText.includes("集合點") || rawText.includes("車站東側出口")) {
    return "集合與地點規則候選";
  }
  if (rawText.includes("道路封閉")) {
    return "道路公告候選";
  }
  if (rawText.includes("先不要再派人")) {
    return "派遣限制候選";
  }
  if (
    rawText.includes("清泥") ||
    rawText.includes("清淤") ||
    rawText.includes("家具") ||
    rawText.includes("藥品")
  ) {
    return "個案協助需求候選";
  }

  return "待分類候選";
}

function categoryForDraft(
  draft: Phase0WorkbenchDraft,
  fallbackRawText: string,
) {
  const labels: Record<Phase0WorkbenchDraft["possibleKind"], string> = {
    help_request_candidate: "個案協助需求候選",
    site_status_candidate: "地點與物資狀態候選",
    task_candidate: "任務候選",
    assignment_candidate: "人員指派候選",
    announcement_candidate: "公告候選",
    unknown: categoryFor(fallbackRawText),
  };

  return labels[draft.possibleKind];
}

function detailsFor(rawText: string) {
  const details: string[] = [];

  if (rawText.includes("十幾個人清泥")) details.push("提到需要十幾個人清泥。");
  if (rawText.includes("老雜貨店後面"))
    details.push("位置只有「老雜貨店後面」。");
  if (rawText.includes("早上還有雨鞋"))
    details.push("早上仍有雨鞋，但下午狀態未知。");
  if (rawText.includes("不缺鏟子")) details.push("提到老街口已不缺鏟子。");
  if (rawText.includes("比較需要水電")) details.push("提到現在比較需要水電。");
  if (rawText.includes("很多雨鞋"))
    details.push("群組轉述溪畔活動中心還有很多雨鞋。");
  if (rawText.includes("中午前道路封閉"))
    details.push("截圖內容寫中午前道路封閉。");
  if (rawText.includes("側門可以當集合點"))
    details.push("有人提議學校側門當集合點。");
  if (rawText.includes("剛剛淹水"))
    details.push("另一位志工回報該處剛剛淹水。");
  if (rawText.includes("昨天的名單"))
    details.push("留言指出水電工班名單可能是昨天的。");
  if (rawText.includes("今天沒空")) details.push("留言指出今天可能無法支援。");
  if (rawText.includes("A 區先不要再派人"))
    details.push("現場回報 A 區先不要再派人。");
  if (rawText.includes("只接受已完成報到"))
    details.push("臨時集合點只接受已完成報到的清淤志工。");
  if (rawText.includes("一般物資請不要送到此處"))
    details.push("一般物資不要送到該集合點。");
  if (rawText.includes("雨鞋約剩 12 雙"))
    details.push("雨鞋約剩 12 雙，尺寸多為 26-28。");
  if (rawText.includes("飲用水暫時不缺")) details.push("飲用水暫時不缺。");
  if (rawText.includes("不再收二手衣物")) details.push("不再收二手衣物。");
  if (rawText.includes("大進路口服務台"))
    details.push("水電檢修需求改到大進路口服務台登記。");
  if (rawText.includes("下一次現場盤點預計 16:30"))
    details.push("下一次現場盤點預計 16:30。");
  if (rawText.includes("志工代"))
    details.push("由志工代長者轉述，不是當事人直接操作。");
  if (rawText.includes("搬動大型家具"))
    details.push("需求是協助搬動大型家具。");
  if (rawText.includes("尚未確認長者是否同意"))
    details.push("尚未確認長者是否同意公開完整地址。");
  if (rawText.includes("外地家屬來電"))
    details.push("外地家屬來電，不在現場。");
  if (rawText.includes("疑似需要藥品")) details.push("親友疑似需要藥品協助。");
  if (rawText.includes("無法確認親友目前位置"))
    details.push("目前無法確認親友位置。");

  return details.length > 0
    ? details
    : ["原文資訊不足，只能保留為待整理線索。"];
}

function missingDetailsFor(record: Phase0MessyRecord) {
  const rawText = record.rawText;
  const missing: string[] = [];

  if (record.verificationStatus !== "verified") {
    missing.push("尚未完成查核，不能顯示成已確認。");
  }
  if (
    rawText.includes("有人說") ||
    rawText.includes("群組說") ||
    rawText.includes("社群貼文")
  ) {
    missing.push("需要確認原始來源與回報者角色。");
  }
  if (
    rawText.includes("不知道") ||
    rawText.includes("可能") ||
    rawText.includes("疑似") ||
    rawText.includes("不確定")
  ) {
    missing.push("原文含不確定語句，需要補問。");
  }
  if (
    rawText.includes("老雜貨店") ||
    rawText.includes("附近") ||
    rawText.includes("那邊") ||
    rawText.includes("A 區")
  ) {
    missing.push("地點仍不夠精確。");
  }
  if (
    rawText.includes("昨天") ||
    rawText.includes("下午") ||
    rawText.includes("哪一天")
  ) {
    missing.push("時間有效性需要重新確認。");
  }
  if (rawText.includes("代") || rawText.includes("家屬")) {
    missing.push("需要確認當事人同意、位置與實際需求。");
  }
  if (
    rawText.includes("淹水") ||
    rawText.includes("道路封閉") ||
    rawText.includes("先不要再派人")
  ) {
    missing.push("現場安全原因需要人工判斷。");
  }

  return missing.length > 0 ? missing : ["仍需人工確認是否可以進入後續流程。"];
}

function completenessFor(
  record: Phase0MessyRecord,
  draft?: Phase0WorkbenchDraft,
): Rating {
  const rawText = record.rawText;
  let score = 2;

  if (
    rawText.includes("14:") ||
    rawText.includes("14：") ||
    rawText.includes("16:30")
  )
    score += 1;
  if (
    rawText.includes("約剩 12") ||
    rawText.includes("只接受") ||
    rawText.includes("不再收")
  )
    score += 1;
  if (
    rawText.includes("不知道") ||
    rawText.includes("疑似") ||
    rawText.includes("不確定")
  )
    score -= 1;
  if (
    rawText.includes("老雜貨店") ||
    rawText.includes("附近") ||
    rawText.includes("A 區")
  )
    score -= 1;
  if (draft?.candidateSummary.trim()) score += 1;
  if (draft?.cannotBecomeTaskReason.trim()) score += 1;

  const boundedScore = Math.min(5, Math.max(1, score)) as Rating["score"];
  const reason =
    boundedScore >= 4
      ? "有較明確的時間、數量或限制，但仍需人工查核。"
      : boundedScore >= 3
        ? "有部分可用線索，但缺少關鍵欄位。"
        : "缺少明確來源、時間、地點或當事人資訊。";

  return rating(boundedScore, reason);
}

function usefulnessFor(
  record: Phase0MessyRecord,
  draft?: Phase0WorkbenchDraft,
): Rating {
  const rawText = record.rawText;
  let score = 2;

  if (
    rawText.includes("不要送") ||
    rawText.includes("不再收") ||
    rawText.includes("只接受")
  )
    score += 2;
  if (
    rawText.includes("約剩") ||
    rawText.includes("服務台") ||
    rawText.includes("盤點")
  )
    score += 1;
  if (
    rawText.includes("不知道") ||
    rawText.includes("疑似") ||
    rawText.includes("無法確認")
  )
    score -= 1;
  if (
    rawText.includes("直接過去") ||
    rawText.includes("道路封閉") ||
    rawText.includes("淹水")
  )
    score -= 1;
  if (draft?.suggestedNextStep === "send_to_human_review") score += 1;
  if (draft?.unsafeToActDirectly) score += 1;

  const boundedScore = Math.min(5, Math.max(1, score)) as Rating["score"];
  const reason =
    boundedScore >= 4
      ? "對下一位協作者很有參考價值，但不能直接派工。"
      : boundedScore >= 3
        ? "可協助判斷下一步要問什麼。"
        : "目前主要價值是提醒風險與缺口。";

  return rating(boundedScore, reason);
}

function summarize(rawText: string) {
  if (rawText.includes("雨鞋約剩 12"))
    return "較完整的物資與服務台現場更新候選。";
  if (rawText.includes("只接受已完成報到")) return "臨時集合點規則更新候選。";
  if (rawText.includes("搬動大型家具"))
    return "需保護個資與同意狀態的個案協助候選。";
  if (rawText.includes("疑似需要藥品"))
    return "遠端家屬通報，需先確認位置與需求。";
  if (rawText.includes("清泥")) return "清泥人力需求候選，但位置與來源不足。";
  if (rawText.includes("雨鞋")) return "雨鞋庫存或領取狀態候選。";
  if (rawText.includes("水電")) return "水電需求或支援狀態候選。";
  if (rawText.includes("道路封閉")) return "道路公告截圖候選，日期與來源待查。";
  if (rawText.includes("集合點")) return "集合點狀態候選，需確認安全性。";
  if (rawText.includes("先不要再派人")) return "停止派遣訊號候選，但原因不明。";

  return "待整理原始資訊候選。";
}

function taskWarningFor(record: Phase0MessyRecord) {
  if (record.verificationStatus !== "verified") {
    return "不能直接變成任務：這筆資訊仍是待確認或未查核。";
  }

  return "即使看似完整，仍需人工判斷是否能進入後續流程。";
}

function possiblePeopleTypesFor(record: Phase0MessyRecord) {
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
    rawText.includes("車站東側出口") ||
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

function objectiveIsUnclear(
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
    rawText.includes("沒有說") ||
    rawText.includes("無法確認") ||
    rawText.includes("可能") ||
    rawText.includes("剛剛淹水") ||
    rawText.includes("道路封閉") ||
    rawText.includes("先不要再派人") ||
    rawText.includes("直接過去")
  );
}

function dispatchAdviceFor(
  record: Phase0MessyRecord,
  draft?: Phase0WorkbenchDraft,
) {
  const unclear = objectiveIsUnclear(record, draft);
  const confirmBeforeSending = missingDetailsFor(record);

  if (unclear) {
    return {
      decision: "do_not_send" as const,
      peopleTypes: possiblePeopleTypesFor(record),
      reason:
        "暫不派人：目標、位置、安全或查核狀態仍不清楚，只能先標記候選角色。",
      confirmBeforeSending,
    };
  }

  return {
    decision: "candidate_only" as const,
    peopleTypes: possiblePeopleTypesFor(record),
    reason: "可作為候選角色討論，但仍需人工確認後才能派人。",
    confirmBeforeSending,
  };
}

function createTags(
  record: Phase0MessyRecord,
  completeness: Rating,
  usefulness: Rating,
  draft?: Phase0WorkbenchDraft,
) {
  const tags = [
    categoryForDraft(
      draft ?? ({ possibleKind: "unknown" } as Phase0WorkbenchDraft),
      record.rawText,
    ),
    record.verificationStatus === "unverified" ? "未查核" : "待人工確認",
  ];

  if (draft) tags.push("草稿同步");
  if (draft?.operatorIsAffectedPerson === "no") tags.push("操作者非當事人");
  if (completeness.score <= 2) tags.push("完整度偏低");
  if (usefulness.score >= 4) tags.push("可用度偏高");
  if (record.rawText.includes("不知道") || record.rawText.includes("疑似")) {
    tags.push("資訊不確定");
  }
  if (record.rawText.includes("淹水") || record.rawText.includes("封閉")) {
    tags.push("安全待確認");
  }
  if (objectiveIsUnclear(record, draft)) tags.push("暫不派人");

  return Array.from(new Set(tags));
}

function createOrganizedCandidate(
  record: Phase0MessyRecord,
  draft?: Phase0WorkbenchDraft,
): OrganizedCandidate {
  const completeness = completenessFor(record, draft);
  const usefulness = usefulnessFor(record, draft);
  const dispatchAdvice = dispatchAdviceFor(record, draft);

  return {
    record,
    category: categoryForDraft(
      draft ?? ({ possibleKind: "unknown" } as Phase0WorkbenchDraft),
      record.rawText,
    ),
    candidateSummary:
      draft?.candidateSummary.trim() || summarize(record.rawText),
    completeness,
    usefulness,
    importantDetails: detailsFor(record.rawText),
    missingDetails: draft?.cannotBecomeTaskReason.trim()
      ? draft.cannotBecomeTaskReason.split("\n").filter(Boolean)
      : missingDetailsFor(record),
    dispatchAdvice,
    reviewFocus: "請由人類確認來源、時間有效性、地點精確度與當事人同意。",
    taskWarning: taskWarningFor(record),
    tags: createTags(record, completeness, usefulness, draft),
    syncedFromDraft: Boolean(draft),
  };
}

function RatingMeter({ rating }: { rating: Rating }) {
  return (
    <div className="rating-meter">
      <div className="rating-meter__label">
        <strong>{rating.label}</strong>
        <span>{rating.score}/5</span>
      </div>
      <div className="rating-meter__track" aria-hidden="true">
        <span style={{ width: `${rating.score * 20}%` }} />
      </div>
      <p>{rating.reason}</p>
    </div>
  );
}

export function Phase0OrganizedInfoPanel({
  records,
  drafts,
}: {
  records: Phase0MessyRecord[];
  drafts: Record<string, Phase0WorkbenchDraft>;
}) {
  const [activeTag, setActiveTag] = useState(allTag);
  const candidates = useMemo(
    () =>
      records.map((record) =>
        createOrganizedCandidate(record, drafts[record.id]),
      ),
    [drafts, records],
  );
  const filterTags = useMemo(
    () => [
      allTag,
      ...Array.from(new Set(candidates.flatMap((candidate) => candidate.tags))),
    ],
    [candidates],
  );
  const visibleCandidates =
    activeTag === allTag
      ? candidates
      : candidates.filter((candidate) => candidate.tags.includes(activeTag));
  const highUsefulnessCount = candidates.filter(
    (candidate) => candidate.usefulness.score >= 4,
  ).length;
  const lowCompletenessCount = candidates.filter(
    (candidate) => candidate.completeness.score <= 2,
  ).length;

  return (
    <div className="organized-info">
      <div className="panel__header">
        <div>
          <h2>候選整理資訊</h2>
          <p>這裡是根據原文做的候選分類與評分，不是已確認的整理後資料。</p>
        </div>
        <p>{records.length} 筆候選</p>
      </div>

      <div className="tag-filter" aria-label="依標籤篩選候選整理">
        {filterTags.map((tag) => (
          <button
            className={activeTag === tag ? "active" : ""}
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <section className="organized-summary" aria-label="候選整理摘要">
        <div>
          <span>{highUsefulnessCount}</span>
          <p>筆可用度偏高，但仍需人工確認</p>
        </div>
        <div>
          <span>{lowCompletenessCount}</span>
          <p>筆完整度偏低，不能直接變任務</p>
        </div>
        <div>
          <span>{candidates.length}</span>
          <p>筆都保留原始查核狀態</p>
        </div>
      </section>

      <div className="organized-grid">
        {visibleCandidates.map((candidate) => (
          <article className="organized-card" key={candidate.record.id}>
            <div className="organized-card__header">
              <div>
                <p className="eyebrow">{candidate.category}</p>
                <h3>{candidate.record.id}</h3>
              </div>
              <StatusBadge status={candidate.record.verificationStatus} />
            </div>

            <p className="organized-card__summary">
              {candidate.candidateSummary}
            </p>

            <div
              className="tag-list"
              aria-label={`${candidate.record.id} 標籤`}
            >
              {candidate.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="organized-card__meta">
              <SourceLabel sourceType={candidate.record.sourceType} />
              <span>更新：{formatDateTime(candidate.record.updatedAt)}</span>
            </div>

            <div className="organized-card__ratings">
              <section>
                <h4>完整度</h4>
                <RatingMeter rating={candidate.completeness} />
              </section>
              <section>
                <h4>可用度</h4>
                <RatingMeter rating={candidate.usefulness} />
              </section>
            </div>

            <section>
              <h4>重要細節</h4>
              <ul>
                {candidate.importantDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>缺少或不能直接相信的地方</h4>
              <ul>
                {candidate.missingDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </section>

            <section className="dispatch-advice">
              <div className="dispatch-advice__header">
                <h4>派誰與是否派人</h4>
                <span
                  className={
                    candidate.dispatchAdvice.decision === "do_not_send"
                      ? "dispatch-status dispatch-status--stop"
                      : "dispatch-status"
                  }
                >
                  {candidate.dispatchAdvice.decision === "do_not_send"
                    ? "暫不派人"
                    : "候選角色"}
                </span>
              </div>
              <p>{candidate.dispatchAdvice.reason}</p>
              <div
                className="tag-list"
                aria-label={`${candidate.record.id} 候選角色`}
              >
                {candidate.dispatchAdvice.peopleTypes.map((peopleType) => (
                  <span key={peopleType}>{peopleType}</span>
                ))}
              </div>
              <h5>派人前必須確認</h5>
              <ul>
                {candidate.dispatchAdvice.confirmBeforeSending.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <div className="organized-card__warning">
              <strong>{candidate.taskWarning}</strong>
              {candidate.syncedFromDraft ? (
                <p>這張卡已同步整理工作台草稿。</p>
              ) : null}
              <p>{candidate.reviewFocus}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
