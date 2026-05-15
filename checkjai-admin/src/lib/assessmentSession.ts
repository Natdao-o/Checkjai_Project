/** เก็บคำตอบ EQ ระหว่างทำ DASS (sessionStorage) */
export const EQ_ANSWERS_KEY = 'checkjai_eq_answers_v1'

export function saveEqAnswersJson(json: string) {
  sessionStorage.setItem(EQ_ANSWERS_KEY, json)
}

export function readEqAnswersJson(): string | null {
  return sessionStorage.getItem(EQ_ANSWERS_KEY)
}

export function clearEqAnswers() {
  sessionStorage.removeItem(EQ_ANSWERS_KEY)
}
