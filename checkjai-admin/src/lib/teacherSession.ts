import { API_URL } from './apiConfig'

export const CHECKJAI_TEACHER_STORAGE_KEY = 'checkjai_teacher_username'
/** โทเค็นหลัง POST /api/auth/teacher/login — ส่งเป็น Authorization: Bearer */
export const CHECKJAI_TEACHER_TOKEN_KEY = 'checkjai_teacher_token'

export function clearTeacherSession() {
  sessionStorage.removeItem(CHECKJAI_TEACHER_STORAGE_KEY)
  sessionStorage.removeItem(CHECKJAI_TEACHER_TOKEN_KEY)
}

export function getTeacherToken(): string | null {
  return sessionStorage.getItem(CHECKJAI_TEACHER_TOKEN_KEY)
}

export async function adminFetch(
  path: string,
  opts: RequestInit = {},
): Promise<Response> {
  const token = getTeacherToken()
  const headers = new Headers(opts.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(API_URL + path, { ...opts, headers })
}
