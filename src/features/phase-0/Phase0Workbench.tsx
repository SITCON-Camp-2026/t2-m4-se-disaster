import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { RecordCard } from "../../components/RecordCard";
import { StatusBadge } from "../../components/StatusBadge";
import { createDefaultDraft, createInitialDrafts } from "./phase0-drafts";
import { Phase0JudgementCard } from "./Phase0JudgementCard";
import { createPhase0Judgement } from "./phase0-heuristics";
import type {
  Phase0Confidence,
  Phase0MessyRecord,
  Phase0PossibleKind,
  Phase0SuggestedNextStep,
  Phase0WorkbenchDraft,
} from "./phase0-types";

const kindOptions: Array<{ value: Phase0PossibleKind; label: string }> = [
  { value: "unknown", label: "候選類型待判斷" },
  { value: "help_request_candidate", label: "求助候選" },
  { value: "site_status_candidate", label: "地點狀態候選" },
  { value: "task_candidate", label: "任務候選" },
  { value: "assignment_candidate", label: "人員指派候選" },
  { value: "announcement_candidate", label: "公告候選" },
];

const confidenceOptions: Array<{ value: Phase0Confidence; label: string }> = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

const nextStepOptions: Array<{
  value: Phase0SuggestedNextStep;
  label: string;
}> = [
  { value: "send_to_human_review", label: "交給人工確認" },
  { value: "ask_for_more_info", label: "補問來源或現場資訊" },
  { value: "create_candidate_report", label: "建立候選通報" },
  { value: "create_site_update_suggestion", label: "建立地點更新建議" },
  { value: "do_not_use_yet", label: "暫時不要使用" },
  { value: "keep_raw", label: "先保留原始資訊" },
];

const concernOptions = [
  "Agent 可能補了原文沒有的地點或數量。",
  "Agent 可能把轉述當成現場事實。",
  "Agent 可能把待確認狀態寫成已確認。",
  "Agent 可能直接產生志工任務，但原文仍缺少關鍵資訊。",
];

function summaryOptionsFor(record: Phase0MessyRecord) {
  const rawText = record.rawText;
  const options = ["先保留原始資訊，等待人工確認。"];

  if (rawText.includes("清泥")) {
    options.unshift("可能是清泥人力需求，但位置與來源不足。");
  }
  if (rawText.includes("雨鞋")) {
    options.unshift("可能是雨鞋庫存或領取狀態更新。");
  }
  if (rawText.includes("水電")) {
    options.unshift("可能是水電需求或水電支援狀態更新。");
  }
  if (rawText.includes("道路封閉")) {
    options.unshift("可能是道路封閉公告截圖，但日期與來源待查。");
  }
  if (rawText.includes("集合點") || rawText.includes("車站東側出口")) {
    options.unshift("可能是集合點規則或地點狀態更新。");
  }
  if (rawText.includes("家具") || rawText.includes("藥品")) {
    options.unshift("可能是個案協助需求，但需確認同意與位置。");
  }

  return Array.from(new Set(options));
}

function blockerOptionsFor(record: Phase0MessyRecord) {
  const rawText = record.rawText;
  const options = ["尚未完成查核，不能顯示成已確認。"];

  if (rawText.includes("不知道") || rawText.includes("疑似")) {
    options.push("原文包含不確定語句，需要補問。");
  }
  if (
    rawText.includes("有人") ||
    rawText.includes("社群") ||
    rawText.includes("群組")
  ) {
    options.push("需要確認原始來源與回報者角色。");
  }
  if (
    rawText.includes("附近") ||
    rawText.includes("那邊") ||
    rawText.includes("老雜貨店") ||
    rawText.includes("A 區")
  ) {
    options.push("地點仍不夠精確。");
  }
  if (
    rawText.includes("昨天") ||
    rawText.includes("哪一天") ||
    rawText.includes("下午")
  ) {
    options.push("時間有效性需要重新確認。");
  }
  if (rawText.includes("代") || rawText.includes("家屬")) {
    options.push("需要確認當事人同意、位置與實際需求。");
  }
  if (
    rawText.includes("淹水") ||
    rawText.includes("封閉") ||
    rawText.includes("不要再派人")
  ) {
    options.push("現場安全原因需要人工判斷。");
  }

  return Array.from(new Set(options));
}

function setListItem(currentValue: string, item: string, checked: boolean) {
  const items = currentValue
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
  const nextItems = checked
    ? Array.from(new Set([...items, item]))
    : items.filter((value) => value !== item);

  return nextItems.join("\n");
}

function createLocalAiReview(
  record: Phase0MessyRecord,
  draft: Phase0WorkbenchDraft,
) {
  const notes = ["本機 AI 風格檢查：沒有呼叫外部 API，結果仍需人類判斷。"];

  if (record.verificationStatus !== "verified") {
    notes.push(
      `原始狀態是 ${record.verificationStatus}，不能把草稿顯示成已確認。`,
    );
  }

  if (record.sourceType === "social_post") {
    notes.push("來源是社群轉錄，容易把轉述誤當成現場事實。");
  }

  if (record.rawText.includes("不知道") || record.rawText.includes("疑似")) {
    notes.push("原文包含不確定語句，摘要不能省略這些限制。");
  }

  if (record.rawText.includes("代") || record.rawText.includes("家屬")) {
    notes.push("操作者可能不是當事人，需要確認同意、位置與需求。");
  }

  if (!draft.unsafeToActDirectly) {
    notes.push("草稿目前允許直接行動，請重新確認是否符合 Phase 0 安全邊界。");
  }

  if (!draft.cannotBecomeTaskReason.trim()) {
    notes.push("缺少不能直接變成任務的原因。");
  }

  return notes.join("\n");
}

type AiReviewResponse = {
  note: string;
  source: "cloudflare_ai_gateway" | "configuration_error" | "upstream_error";
};

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
  drafts,
  setDrafts,
  onOpenOrganized,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
  drafts: Record<string, Phase0WorkbenchDraft>;
  setDrafts: Dispatch<SetStateAction<Record<string, Phase0WorkbenchDraft>>>;
  onOpenOrganized: () => void;
}) {
  const [reviewingRecordId, setReviewingRecordId] = useState<string | null>(
    null,
  );
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];
  const safetyBoundary = createPhase0Judgement(selectedRecord);
  const selectedDraft = drafts[selectedRecord.id];
  const createdDrafts = Object.values(drafts);
  const humanCorrectedCount = createdDrafts.filter(
    (draft) => draft.draftStatus === "human_corrected",
  ).length;
  const cannotBecomeTaskCount = createdDrafts.filter(
    (draft) => draft.unsafeToActDirectly && draft.cannotBecomeTaskReason.trim(),
  ).length;
  const operatorNotAffectedCount = createdDrafts.filter(
    (draft) => draft.operatorIsAffectedPerson === "no",
  ).length;
  const candidateDraftCount = createdDrafts.filter(
    (draft) => draft.possibleKind !== "unknown",
  ).length;
  const canShowSeededReviewExamples = useMemo(
    () => records.some((record) => record.id === "M-011"),
    [records],
  );

  function createDraft(record: Phase0MessyRecord) {
    setDrafts((current) => ({
      ...current,
      [record.id]: current[record.id] ?? createDefaultDraft(record),
    }));
  }

  function updateDraft(
    recordId: string,
    changes: Partial<Phase0WorkbenchDraft>,
  ) {
    setDrafts((current) => {
      const record = records.find((item) => item.id === recordId);
      if (!record) return current;
      const existing = current[recordId] ?? createDefaultDraft(record);

      return {
        ...current,
        [recordId]: {
          ...existing,
          ...changes,
        },
      };
    });
  }

  function deleteDraft(recordId: string) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[recordId];
      return next;
    });
  }

  function resetDraft(record: Phase0MessyRecord) {
    setDrafts((current) => ({
      ...current,
      [record.id]: createDefaultDraft(record),
    }));
  }

  function resetAllDrafts() {
    setDrafts(createInitialDrafts(records));
  }

  function runLocalAiReview(
    record: Phase0MessyRecord,
    draft: Phase0WorkbenchDraft,
  ) {
    const aiReviewNote = createLocalAiReview(record, draft);

    updateDraft(record.id, {
      aiReviewNote,
      agentConcern: `${draft.agentConcern.trim()}\n${aiReviewNote}`.trim(),
      draftStatus: "human_corrected",
      unsafeToActDirectly: true,
    });
  }

  async function runAiReview(
    record: Phase0MessyRecord,
    draft: Phase0WorkbenchDraft,
  ) {
    setReviewingRecordId(record.id);

    try {
      const response = await fetch("/api/ai-review", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          record,
          draft: {
            candidateSummary: draft.candidateSummary,
            possibleKind: draft.possibleKind,
            confidence: draft.confidence,
            suggestedNextStep: draft.suggestedNextStep,
            unsafeToActDirectly: draft.unsafeToActDirectly,
            cannotBecomeTaskReason: draft.cannotBecomeTaskReason,
            operatorIsAffectedPerson: draft.operatorIsAffectedPerson,
          },
        }),
      });
      const result = (await response.json()) as AiReviewResponse;
      const sourceLabel =
        result.source === "cloudflare_ai_gateway"
          ? "Cloudflare AI Gateway"
          : "AI proxy 設定提醒";
      const aiReviewNote = `${sourceLabel}：\n${result.note}`;

      updateDraft(record.id, {
        aiReviewNote,
        agentConcern: `${draft.agentConcern.trim()}\n${aiReviewNote}`.trim(),
        draftStatus: "human_corrected",
        unsafeToActDirectly: true,
      });
    } catch {
      const aiReviewNote = [
        "AI proxy 無法連線，已改用本機 AI 風格檢查。",
        createLocalAiReview(record, draft),
      ].join("\n");

      updateDraft(record.id, {
        aiReviewNote,
        agentConcern: `${draft.agentConcern.trim()}\n${aiReviewNote}`.trim(),
        draftStatus: "human_corrected",
        unsafeToActDirectly: true,
      });
    } finally {
      setReviewingRecordId(null);
    }
  }

  return (
    <div className="workbench">
      <div className="workbench__intro">
        <p className="eyebrow">整理工作台</p>
        <h2>第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。</h2>
        <p>
          這裡先只標示安全邊界，真正的候選判斷要由小組和 coding agent
          補上；這不是 runtime LLM 分析，也不是正式資料模型。
        </p>
      </div>

      <div className="workbench__layout">
        <aside className="workbench__queue" aria-label="選擇原始資訊">
          {records.map((record) => (
            <button
              className={record.id === selectedRecord.id ? "active" : ""}
              key={record.id}
              type="button"
              onClick={() => onSelect(record.id)}
            >
              <span>{record.id}</span>
              <StatusBadge status={record.verificationStatus} />
              {drafts[record.id] ? <small>已有草稿</small> : null}
            </button>
          ))}
        </aside>

        <div className="workbench__main">
          <RecordCard record={selectedRecord} />

          {selectedDraft ? (
            <article className="draft-editor">
              <div className="draft-editor__header">
                <div>
                  <p className="eyebrow">整理草稿</p>
                  <h3>{selectedRecord.id} 的可編輯草稿</h3>
                </div>
                <StatusBadge status={selectedDraft.draftStatus} />
              </div>

              <div className="draft-editor__controls">
                <button
                  type="button"
                  onClick={() => resetDraft(selectedRecord)}
                >
                  重設這筆草稿
                </button>
                <button
                  className="button-danger"
                  type="button"
                  onClick={() => deleteDraft(selectedRecord.id)}
                >
                  刪除草稿
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void runAiReview(selectedRecord, selectedDraft)
                  }
                  disabled={reviewingRecordId === selectedRecord.id}
                >
                  {reviewingRecordId === selectedRecord.id
                    ? "AI 檢查中"
                    : "AI API 檢查"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runLocalAiReview(selectedRecord, selectedDraft)
                  }
                >
                  本機檢查
                </button>
                <button type="button" onClick={onOpenOrganized}>
                  送到候選整理
                </button>
              </div>

              <section className="draft-choice-group">
                <h4>候選整理摘要</h4>
                <div className="choice-list">
                  {summaryOptionsFor(selectedRecord).map((option) => (
                    <button
                      className={
                        selectedDraft.candidateSummary === option
                          ? "choice-chip choice-chip--selected"
                          : "choice-chip"
                      }
                      key={option}
                      type="button"
                      onClick={() =>
                        updateDraft(selectedRecord.id, {
                          candidateSummary: option,
                        })
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </section>

              <div className="draft-editor__grid">
                <label>
                  候選類型
                  <select
                    value={selectedDraft.possibleKind}
                    onChange={(event) =>
                      updateDraft(selectedRecord.id, {
                        possibleKind: event.target.value as Phase0PossibleKind,
                      })
                    }
                  >
                    {kindOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  信心程度
                  <select
                    value={selectedDraft.confidence}
                    onChange={(event) =>
                      updateDraft(selectedRecord.id, {
                        confidence: event.target.value as Phase0Confidence,
                      })
                    }
                  >
                    {confidenceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  下一步
                  <select
                    value={selectedDraft.suggestedNextStep}
                    onChange={(event) =>
                      updateDraft(selectedRecord.id, {
                        suggestedNextStep: event.target
                          .value as Phase0SuggestedNextStep,
                      })
                    }
                  >
                    {nextStepOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  操作者是否為當事人
                  <select
                    value={selectedDraft.operatorIsAffectedPerson}
                    onChange={(event) =>
                      updateDraft(selectedRecord.id, {
                        operatorIsAffectedPerson: event.target
                          .value as Phase0WorkbenchDraft["operatorIsAffectedPerson"],
                      })
                    }
                  >
                    <option value="unknown">還不知道</option>
                    <option value="yes">看起來是</option>
                    <option value="no">不是，需人工確認</option>
                  </select>
                </label>
              </div>

              <label className="draft-editor__check">
                <input
                  checked={selectedDraft.unsafeToActDirectly}
                  type="checkbox"
                  onChange={(event) =>
                    updateDraft(selectedRecord.id, {
                      unsafeToActDirectly: event.target.checked,
                    })
                  }
                />
                不能直接變成志工任務或行動依據
              </label>

              <section className="draft-choice-group">
                <h4>不能直接變成任務的原因</h4>
                <div className="check-list">
                  {blockerOptionsFor(selectedRecord).map((option) => (
                    <label key={option}>
                      <input
                        checked={selectedDraft.cannotBecomeTaskReason.includes(
                          option,
                        )}
                        type="checkbox"
                        onChange={(event) =>
                          updateDraft(selectedRecord.id, {
                            cannotBecomeTaskReason: setListItem(
                              selectedDraft.cannotBecomeTaskReason,
                              option,
                              event.target.checked,
                            ),
                          })
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </section>

              <section className="draft-choice-group">
                <h4>Agent 判斷需質疑或人類修正處</h4>
                <div className="check-list">
                  {concernOptions.map((option) => (
                    <label key={option}>
                      <input
                        checked={selectedDraft.agentConcern.includes(option)}
                        type="checkbox"
                        onChange={(event) => {
                          const agentConcern = setListItem(
                            selectedDraft.agentConcern,
                            option,
                            event.target.checked,
                          );

                          updateDraft(selectedRecord.id, {
                            agentConcern,
                            draftStatus: agentConcern.trim()
                              ? "human_corrected"
                              : "drafting",
                          });
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </section>

              <details className="manual-edit-panel">
                <summary>手動編輯草稿文字</summary>
                <div className="manual-edit-panel__body">
                  <label>
                    手動摘要
                    <textarea
                      value={selectedDraft.candidateSummary}
                      onChange={(event) =>
                        updateDraft(selectedRecord.id, {
                          candidateSummary: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    手動補充不能直接變成任務的原因
                    <textarea
                      value={selectedDraft.cannotBecomeTaskReason}
                      onChange={(event) =>
                        updateDraft(selectedRecord.id, {
                          cannotBecomeTaskReason: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    手動補充 Agent 需要被質疑處
                    <textarea
                      value={selectedDraft.agentConcern}
                      onChange={(event) =>
                        updateDraft(selectedRecord.id, {
                          agentConcern: event.target.value,
                          draftStatus: event.target.value.trim()
                            ? "human_corrected"
                            : "drafting",
                        })
                      }
                    />
                  </label>
                </div>
              </details>

              {selectedDraft.aiReviewNote ? (
                <section
                  className="ai-review-note"
                  aria-label="AI 風格檢查結果"
                >
                  <h4>AI 風格檢查結果</h4>
                  <pre>{selectedDraft.aiReviewNote}</pre>
                </section>
              ) : null}
            </article>
          ) : (
            <div className="draft-empty">
              <Phase0JudgementCard
                judgement={safetyBoundary}
                record={selectedRecord}
              />
              <button type="button" onClick={() => createDraft(selectedRecord)}>
                建立這筆整理草稿
              </button>
            </div>
          )}
        </div>

        <aside className="workbench__checklist">
          <h3>第一階段完成檢查</h3>
          <dl className="draft-stats">
            <div>
              <dt>草稿</dt>
              <dd>{createdDrafts.length} 筆</dd>
            </div>
            <div>
              <dt>候選判斷</dt>
              <dd>{candidateDraftCount} 筆</dd>
            </div>
            <div>
              <dt>不能直接變任務</dt>
              <dd>{cannotBecomeTaskCount} 筆</dd>
            </div>
            <div>
              <dt>操作者非當事人</dt>
              <dd>{operatorNotAffectedCount} 筆</dd>
            </div>
            <div>
              <dt>人類質疑或修正</dt>
              <dd>{humanCorrectedCount} 筆</dd>
            </div>
          </dl>
          <ul>
            <li>Starter 已載入 {records.length} 筆原始資訊</li>
            <li>目前可以建立、編輯、刪除與重設整理草稿</li>
            <li>至少讓 6 筆原始資訊被嘗試整理成可編輯草稿</li>
            <li>
              {canShowSeededReviewExamples
                ? "M-011 與 M-012 可標示操作者不是當事人"
                : "至少 1 筆操作者不是當事人的資訊需標示"}
            </li>
            <li>至少挑 2 個候選判斷由人類質疑或修正</li>
            <li>
              把資料品質問題寫進 observations，並記錄 agent 哪裡不能直接相信
            </li>
          </ul>
          <button type="button" onClick={resetAllDrafts}>
            重設全部草稿
          </button>
        </aside>
      </div>
    </div>
  );
}
