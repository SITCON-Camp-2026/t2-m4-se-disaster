import { createPhase0Judgement } from "./phase0-heuristics";
import type { Phase0MessyRecord, Phase0WorkbenchDraft } from "./phase0-types";

const seededDrafts: Record<string, Partial<Phase0WorkbenchDraft>> = {
  "M-001": {
    candidateSummary: "可能有人力清泥需求，但位置只有模糊描述。",
    possibleKind: "help_request_candidate",
    cannotBecomeTaskReason: "缺少可確認地址、需求人與現場安全狀態。",
  },
  "M-002": {
    candidateSummary: "可能是雨鞋庫存更新，但下午狀態未知。",
    possibleKind: "site_status_candidate",
    cannotBecomeTaskReason: "時間已變動，不能用早上庫存直接引導領取。",
  },
  "M-003": {
    candidateSummary: "可能是需求更新：鏟子需求下降，水電需求待確認。",
    possibleKind: "site_status_candidate",
    cannotBecomeTaskReason: "原本那張單可能未更新，不能直接改派水電人力。",
    agentConcern: "Agent 可能會把「比較需要水電」直接寫成正式任務。",
    draftStatus: "human_corrected",
  },
  "M-004": {
    candidateSummary: "社群轉述雨鞋很多，但沒有現場盤點時間與確認者。",
    possibleKind: "unknown",
    cannotBecomeTaskReason: "叫大家直接過去拿可能造成錯誤移動或現場混亂。",
    agentConcern: "人類修正：不能把群組貼文當成庫存事實。",
    draftStatus: "human_corrected",
  },
  "M-005": {
    candidateSummary: "可能是道路封閉公告截圖，但日期與來源都不清楚。",
    possibleKind: "announcement_candidate",
    cannotBecomeTaskReason: "不知道是哪一天，也不知道是否仍有效或官方發布。",
  },
  "M-006": {
    candidateSummary: "可能是集合點提案，但同時有淹水風險回報。",
    possibleKind: "site_status_candidate",
    cannotBecomeTaskReason: "現場安全狀態互相衝突，不能指派人員前往停留。",
  },
  "M-010": {
    candidateSummary:
      "看起來較完整的物資與服務台現場更新，仍需人工確認後使用。",
    possibleKind: "site_status_candidate",
    confidence: "medium",
    suggestedNextStep: "create_site_update_suggestion",
    cannotBecomeTaskReason:
      "雖有盤點時間與數量，仍是 needs_review，不能標成已確認。",
  },
  "M-011": {
    candidateSummary: "志工代長者轉述搬動家具需求，個資與同意狀態待確認。",
    possibleKind: "help_request_candidate",
    operatorIsAffectedPerson: "no",
    cannotBecomeTaskReason:
      "不是當事人直接建立，且未確認是否同意公開完整地址。",
  },
  "M-012": {
    candidateSummary: "外地家屬希望協助確認親友狀況，但位置與需求都不確定。",
    possibleKind: "help_request_candidate",
    operatorIsAffectedPerson: "no",
    cannotBecomeTaskReason: "來電者不在現場，不能直接建立藥品或派工任務。",
  },
};

export function createDefaultDraft(
  record: Phase0MessyRecord,
): Phase0WorkbenchDraft {
  const safetyBoundary = createPhase0Judgement(record);
  const seed = seededDrafts[record.id] ?? {};

  return {
    ...safetyBoundary,
    possibleKind: seed.possibleKind ?? safetyBoundary.possibleKind,
    confidence: seed.confidence ?? safetyBoundary.confidence,
    suggestedNextStep:
      seed.suggestedNextStep ?? safetyBoundary.suggestedNextStep,
    draftStatus: seed.draftStatus ?? "drafting",
    candidateSummary: seed.candidateSummary ?? "",
    operatorIsAffectedPerson: seed.operatorIsAffectedPerson ?? "unknown",
    cannotBecomeTaskReason:
      seed.cannotBecomeTaskReason ?? "尚未由人類寫下為什麼不能直接變成任務。",
    agentConcern:
      seed.agentConcern ?? "尚未記錄 agent 判斷是否補了原文沒有的資訊。",
  };
}

export function createInitialDrafts(records: Phase0MessyRecord[]) {
  const requiredExampleIds = new Set([
    ...records.slice(0, 6).map((record) => record.id),
    "M-010",
    "M-011",
    "M-012",
  ]);
  const initialRecords = records.filter((record) =>
    requiredExampleIds.has(record.id),
  );

  return Object.fromEntries(
    initialRecords.map((record) => [record.id, createDefaultDraft(record)]),
  );
}
