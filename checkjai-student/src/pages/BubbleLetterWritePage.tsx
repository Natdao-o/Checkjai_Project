import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import imgBubble from '@/assets/images/จดหมายฟองสบู่.png'

export default function BubbleLetterWritePage() {
  const navigate = useNavigate()
  const [text, setText] = useState('')

  const handleRelease = async () => {
    if (!text.trim()) {
      navigate('/bubble-letter/comfort')
      return
    }

    try {
      const studentId = sessionStorage.getItem('checkjai_student_id') || undefined
      await fetch('/api/bubble-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, student_id: studentId }),
      })
    } catch (err) {
      console.error('Failed to save bubble letter:', err)
    }
    
    navigate('/bubble-letter/comfort')
  }

  return (
    <div className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3]">
      <TopBar />

      <main className="flex-grow flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-[0_20px_50px_rgba(212,75,125,0.1)] border border-[#fce7f3] overflow-hidden flex flex-col min-h-[600px]">

          {/* Header section with vertical pink bar */}
          <div className="flex items-center gap-4 px-8 py-8">
            <div className="w-1.5 h-10 bg-[#d44b7d] rounded-full"></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#5b2b3b]">พื้นที่ระบายความรู้สึก</h1>
              <p className="text-[#5b2b3b]/60 text-sm mt-1">* ระบบจะทำการบันทึกข้อความหลังทำการส่ง</p>
            </div>
          </div>

          {/* Textarea Area */}
          <div className="flex-grow px-8 pb-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="เขียนทุกสิ่งที่คุณอยากระบายออกมาที่นี่..."
              className="w-full h-full min-h-[400px] text-xl text-[#5b2b3b] placeholder-[#5b2b3b]/30 resize-none border-none focus:ring-0 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Footer with Release Button */}
          <div className="px-8 py-8 flex justify-end">
            <button
              onClick={handleRelease}
              className="group flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 cj-glow-pulse">
                <img
                  src={imgBubble}
                  alt="ปลดปล่อย"
                  className="w-full h-full object-cover rounded-full shadow-lg border-4 border-white group-hover:border-[#fce7f3] transition-all cj-glow-soft"
                />
              </div>
              <span className="font-bold text-[#d44b7d] text-lg">ปลดปล่อย</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="h-20" />
    </div>
  )
}
