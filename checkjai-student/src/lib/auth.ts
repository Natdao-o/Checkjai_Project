
export const STUDENT_ID_KEY = 'checkjai_student_id'
export const STUDENT_FULL_NAME_KEY = 'checkjai_student_full_name'

export function getStudentId(): string | null {
  return sessionStorage.getItem(STUDENT_ID_KEY)
}

export function setStudentId(id: string) {
  sessionStorage.setItem(STUDENT_ID_KEY, id)
}

export function getStudentFullName(): string | null {
  return sessionStorage.getItem(STUDENT_FULL_NAME_KEY)
}

export function setStudentFullName(fullName: string) {
  sessionStorage.setItem(STUDENT_FULL_NAME_KEY, fullName)
}

export function clearStudentAuth() {
  sessionStorage.removeItem(STUDENT_ID_KEY)
  sessionStorage.removeItem(STUDENT_FULL_NAME_KEY)
}
