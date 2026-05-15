import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { getStudentId } from '../lib/auth'
import emptyImg from '../assets/images/รูปแสดงว่ายังไม่มีประวัติการทำแบบทดสอบ.png'
import { API_URL } from '../lib/apiConfig'

type HistoryItem = {
  id: string
  created_at: string
  eq_total_score?: number
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const studentId = getStudentId()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) {
      navigate('/login')
      return
    }

    async function fetchHistory() {
      try {
        const res = await fetch(`${API_URL}/api/history?student_id=${studentId}`)
        const json = await res.json()
        if (json.ok) {
          setHistory(json.history || [])
        }
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [studentId, navigate])

  function formatDateTh(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3]">
      <TopBar />

      <main className="cj-quizMain">
        <section className="cj-quizHead">
          <span className="cj-quizHeadBar" aria-hidden="true" />
          <h1>ประวัติ</h1>
        </section>

        <div className="w-full max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#df4a91]/20 border-t-[#df4a91] rounded-full animate-spin"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="flex flex-col gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#fce7f3] flex items-center gap-4 transition-all hover:shadow-md"
                >
                  <div className="w-3 h-3 bg-[#ff4d4d] rounded-full flex-shrink-0"></div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-[#df4a91] text-lg mb-1">ทำแบบทดสอบสำเร็จ</h3>
                    <p className="text-[#5b2b3b]/70 text-sm md:text-base">
                      แบบทดสอบความฉลาดทางอารมณ์ EQ, แบบทดสอบสุขภาพจิตใจ DASS-21
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#5b2b3b]/60 text-sm font-medium">
                      {formatDateTh(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-64 h-64 mb-6">
                <img
                  src={emptyImg}
                  alt="ไม่มีประวัติ"
                  className="w-full h-full object-contain opacity-80"
                />
              </div>
              <p className="text-xl font-bold text-[#5b2b3b]/80">ยังไม่มีประวัติการทำแบบทดสอบ</p>
            </div>
          )}
        </div>
      </main>

      <footer className="h-16 bg-transparent" />
    </div>
  )
}
