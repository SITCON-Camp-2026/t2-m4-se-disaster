export type V1ReportQuality = "high" | "medium" | "low" | "spam";
export type V1VerificationStatus =
  "manual_verified" | "needs_review" | "unverified" | "rejected";

export type V1Report = {
  id: string;
  title: string;
  rawText: string;
  sourceType:
    "field_report" | "phone_call" | "social_post" | "volunteer_update" | "mock";
  reporterRole: string;
  locationText: string;
  urgency: number;
  quality: V1ReportQuality;
  verificationStatus: V1VerificationStatus;
  isAiSorted: boolean;
  isLikelySpam: boolean;
  updatedAt: string;
  actionSummary: string;
  confirmationQuestions: string[];
  warnings: string[];
  organizerNotes: string;
  additionalInfo: string[];
};

export const v1Reports: V1Report[] = [
  {
    id: "V1-001",
    title: "臨時避難點需要飲用水補給",
    rawText:
      "現場志工回報：臨時避難點目前飲用水剩半箱，現場約有 18 人，下午前可能不夠。已由值班整理者回電確認需求仍存在。",
    sourceType: "field_report",
    reporterRole: "現場志工",
    locationText: "模擬避難點 A",
    urgency: 5,
    quality: "high",
    verificationStatus: "manual_verified",
    isAiSorted: true,
    isLikelySpam: false,
    updatedAt: "2026-07-09T05:40:00.000Z",
    actionSummary: "已人工確認：模擬避難點 A 有飲用水補給需求。",
    confirmationQuestions: [],
    warnings: [],
    organizerNotes: "電話回確認需求仍存在；demo 不提供真實地址。",
    additionalInfo: [],
  },
  {
    id: "V1-002",
    title: "藥品需求已由照護志工確認",
    rawText:
      "照護志工回報：有慢性用藥需求，品項已由照護窗口抄錄，需交由具資格人員處理，不適合一般志工自行採買。",
    sourceType: "volunteer_update",
    reporterRole: "照護志工",
    locationText: "模擬安置區 B",
    urgency: 4,
    quality: "high",
    verificationStatus: "manual_verified",
    isAiSorted: true,
    isLikelySpam: false,
    updatedAt: "2026-07-09T05:25:00.000Z",
    actionSummary: "已人工確認：模擬安置區 B 有照護需求，已交由照護窗口處理。",
    confirmationQuestions: [],
    warnings: [],
    organizerNotes: "需求存在已確認；執行資格仍需人工控管。",
    additionalInfo: [],
  },
  {
    id: "V1-003",
    title: "入口積水，可能需要引導動線",
    rawText:
      "電話回報：某入口積水，老人進出比較慢。回報者說不是很深，但希望有人提醒其他人改走旁邊通道。",
    sourceType: "phone_call",
    reporterRole: "轉述家屬",
    locationText: "模擬社區入口 C",
    urgency: 4,
    quality: "medium",
    verificationStatus: "needs_review",
    isAiSorted: true,
    isLikelySpam: false,
    updatedAt: "2026-07-09T05:32:00.000Z",
    actionSummary: "可能是動線提醒需求，但積水狀態、位置與替代通道仍需確認。",
    confirmationQuestions: [
      "積水是否仍存在？",
      "替代通道是否安全？",
      "是否需要現場人員確認動線？",
    ],
    warnings: ["未人工確認，不應直接派人前往。"],
    organizerNotes: "可放入未確認 / 高風險分頁。",
    additionalInfo: [],
  },
  {
    id: "V1-004",
    title: "疑似需要搬運物資但條件不足",
    rawText:
      "社群轉錄：那邊好像缺很多東西，可能要車。沒有說數量、接收人或時間，只附了一張模糊截圖。",
    sourceType: "social_post",
    reporterRole: "社群轉述者",
    locationText: "原文只寫「那邊」",
    urgency: 3,
    quality: "low",
    verificationStatus: "unverified",
    isAiSorted: true,
    isLikelySpam: false,
    updatedAt: "2026-07-09T05:18:00.000Z",
    actionSummary: "資訊不足，不能變成運送任務。",
    confirmationQuestions: [
      "具體缺什麼？",
      "需要多少？",
      "誰可以接收？",
      "地點是否可確認？",
    ],
    warnings: ["缺少地點、數量、接收條件。"],
    organizerNotes: "低品質報告，保留原文但不進主畫面。",
    additionalInfo: [],
  },
  {
    id: "V1-005",
    title: "高急迫口述求助但位置不明",
    rawText:
      "現場口述：有人說有一戶需要協助，語氣很急，但沒有可確認位置，也不知道是不是本人求助。",
    sourceType: "field_report",
    reporterRole: "現場轉述者",
    locationText: "位置不明",
    urgency: 5,
    quality: "low",
    verificationStatus: "needs_review",
    isAiSorted: true,
    isLikelySpam: false,
    updatedAt: "2026-07-09T05:36:00.000Z",
    actionSummary: "高急迫但資訊不足，應放在未確認 / 高風險分頁。",
    confirmationQuestions: [
      "求助者是否為當事人？",
      "可確認的位置或聯絡窗口是什麼？",
      "是否有第二來源？",
    ],
    warnings: ["急迫不等於已確認；不可自動產生路線或派工。"],
    organizerNotes: "高急迫低品質，最容易誤導行動者。",
    additionalInfo: [],
  },
  {
    id: "V1-006",
    title: "重複轉貼的物資募集文字",
    rawText:
      "社群大量轉貼：快捐！越多越好！沒有時間、沒有接收窗口，內容與前一則轉貼相同。",
    sourceType: "social_post",
    reporterRole: "社群轉述者",
    locationText: "未提供",
    urgency: 2,
    quality: "spam",
    verificationStatus: "rejected",
    isAiSorted: true,
    isLikelySpam: true,
    updatedAt: "2026-07-09T05:12:00.000Z",
    actionSummary: "疑似重複或垃圾訊息，不進行動主畫面。",
    confirmationQuestions: ["是否有原始來源？", "是否有接收窗口？"],
    warnings: ["重複轉貼不代表可信度提高。"],
    organizerNotes: "Spam bucket；保留作為資料品質案例。",
    additionalInfo: [],
  },
  {
    id: "V1-007",
    title: "安全巡視回報：通道已恢復",
    rawText:
      "志工更新：模擬通道 D 已清出可通行寬度，兩位現場志工回報一致。仍提醒雨天可能再度積水。",
    sourceType: "volunteer_update",
    reporterRole: "現場志工",
    locationText: "模擬通道 D",
    urgency: 3,
    quality: "high",
    verificationStatus: "manual_verified",
    isAiSorted: true,
    isLikelySpam: false,
    updatedAt: "2026-07-09T05:45:00.000Z",
    actionSummary: "已人工確認：模擬通道 D 已恢復可通行狀態。",
    confirmationQuestions: [],
    warnings: [],
    organizerNotes: "兩位志工回報一致，標示人工確認。",
    additionalInfo: [],
  },
  {
    id: "V1-008",
    title: "格式混亂的情緒性留言",
    rawText:
      "拜託快來！！！大家都不管！！！需要很多人！！！沒有具體地點、需求、時間或回報者角色。",
    sourceType: "social_post",
    reporterRole: "不明",
    locationText: "未提供",
    urgency: 3,
    quality: "spam",
    verificationStatus: "unverified",
    isAiSorted: true,
    isLikelySpam: true,
    updatedAt: "2026-07-09T05:08:00.000Z",
    actionSummary: "情緒強烈但缺少可確認資訊。",
    confirmationQuestions: ["是否能找到原始回報者？", "是否有具體需求？"],
    warnings: ["不能因語氣急迫就當成任務。"],
    organizerNotes: "低品質且可能重複，放排序底部。",
    additionalInfo: [],
  },
];

export function sortForAiQueue(reports: V1Report[]) {
  return [...reports].sort((a, b) => {
    if (a.isLikelySpam !== b.isLikelySpam) return a.isLikelySpam ? 1 : -1;
    if (a.urgency !== b.urgency) return b.urgency - a.urgency;
    const qualityRank: Record<V1ReportQuality, number> = {
      high: 4,
      medium: 3,
      low: 2,
      spam: 1,
    };
    return qualityRank[b.quality] - qualityRank[a.quality];
  });
}
