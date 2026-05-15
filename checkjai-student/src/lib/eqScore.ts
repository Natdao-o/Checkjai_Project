/**
 * แบบทดสอบ EQ: กลุ่มคะแนนปกติ / กลุ่มย้อนกลับ (1-based ตามลำดับข้อในข้อสอบ)
 * ตัวเลือก (index 0–3): ไม่จริง, จริงบางครั้ง, ค่อนข้างจริง, จริงมาก
 */

/** กลุ่มปกติ: 1 = ไม่จริง, 2 = บางครั้ง, 3 = ค่อนข้าง, 4 = จริงมาก */
const NORMAL_Q = new Set([
  1, 4, 6, 7, 10, 12, 14, 15, 17, 20, 22, 23, 25, 28, 31, 32, 34, 36, 38, 39, 41, 42, 43, 44, 46, 48, 49, 50,
])

/** กลุ่ม reverse: สลับเช่น ไม่จริง = 4, จริงมาก = 1 */
const REVERSE_Q = new Set([
  2, 3, 5, 8, 9, 11, 13, 16, 18, 19, 21, 24, 26, 27, 29, 30, 33, 35, 37, 40, 45, 47, 51, 52,
])

const MAX_PER_QUESTION = 4
export const EQ_MAX_SCORE = 52 * MAX_PER_QUESTION

export function isReverseQuestion(questionNumber1Based: number): boolean {
  return REVERSE_Q.has(questionNumber1Based)
}

/** choiceIndex: 0–3 */
export function scoreForAnswer(
  questionNumber1Based: number,
  choiceIndex: number,
): number {
  if (choiceIndex < 0 || choiceIndex > 3) return 0
  if (REVERSE_Q.has(questionNumber1Based)) {
    return 4 - choiceIndex
  }
  if (NORMAL_Q.has(questionNumber1Based)) {
    return choiceIndex + 1
  }
  return 0
}

export function calculateEqTotal(answers: (number | null)[]): {
  total: number
  max: number
  answeredCount: number
} {
  let total = 0
  let answeredCount = 0
  for (let i = 0; i < answers.length; i++) {
    const a = answers[i]
    if (a === null) continue
    answeredCount += 1
    total += scoreForAnswer(i + 1, a)
  }
  return { total, max: EQ_MAX_SCORE, answeredCount }
}

// ตรวจว่า 52 ข้อครบกลุ่ม (dev)
if (import.meta.env?.DEV) {
  const covered = new Set<number>([...NORMAL_Q, ...REVERSE_Q])
  if (covered.size !== 52) {
    console.warn('[eqScore] จำนวนข้อไม่ครบ 52:', covered.size)
  }
}
