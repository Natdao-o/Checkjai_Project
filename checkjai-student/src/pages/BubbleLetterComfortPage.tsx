import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import imgBunny from '@/assets/images/bunny_illustration.png'

export default function BubbleLetterComfortPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3] cursor-pointer"
      onClick={() => navigate('/categories')}
    >
      <TopBar />

      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden px-6">

        {/* Radial Glow Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(249,231,238,0)_60%)] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl space-y-8 animate-in fade-in zoom-in duration-1000">

          {/* Bunny Illustration */}
          <div className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl transition-transform hover:scale-105 duration-500">
            <img
              src={imgBunny}
              alt="Bunny Illustration"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Comfort Message */}
          <div className="space-y-6">
            <p className="text-2xl md:text-3xl font-bold text-[#b63a67] leading-relaxed drop-shadow-sm">
              เธอได้ปลดปล่อยความรู้สึกของเธอแล้ว
            </p>
            <p className="text-xl md:text-2xl font-medium text-[#d44b7d] leading-relaxed">
              ทุกความรู้สึกของเธอจะถูกโอบกอดอย่างอ่อนโยนเสมอ<br />
              และสักวันเธอจะเป็นเจ้าดอกไม้ที่เบ่งบาน<br />
              และพร้อมเติบโตสำหรับโลกกว้างนะ
            </p>
          </div>

          {/* Prompt to return */}
          <p className="text-[#5b2b3b]/40 text-sm animate-pulse mt-12">
            คลิกที่ว่างเพื่อกลับไปยังหน้าหมวดหมู่
          </p>
        </div>
      </main>

      <footer className="h-20" />
    </div>
  )
}
