import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/TopBar'

// Import images following strict project structure
import imgBubble from '@/assets/images/จดหมายฟองสบู่.png'
import imgPostcard from '@/assets/images/โปสการ์ดรอยยิ้ม.png'
import imgHealing from '@/assets/images/กิจกรรมฮีลใจ.png'

export default function CategoriesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3]">
      <TopBar />

      <main className="flex-grow pt-8 pb-16">

        {/* Page Header (Matching Home Page hero style softly) */}
        <div className="text-center mb-12 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5b2b3b] mb-3">หมวดหมู่กิจกรรม</h1>
          <p className="text-[#5b2b3b]/70 text-lg">เลือกพื้นที่ที่ใช่ สำหรับใจของคุณในวันนี้</p>
        </div>

        <div className="space-y-16 md:space-y-24">
          {/* Section 1: จดหมายฟองสบู่ (Text Left - Image Right) */}
          <section className="px-6 md:px-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <span className="inline-block px-5 py-2 bg-white/60 text-[#d44b7d] rounded-full font-bold text-lg shadow-sm border border-white/80">
                  🦋 จดหมายฟองสบู่
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-[#5b2b3b] leading-tight">
                  จดหมายที่เต็มไปด้วยความรู้สึกที่หลากหลายของคุณ<br className="hidden md:block" /> ราวกับฟองสบู่
                </h2>
                <p className="text-[#5b2b3b]/80 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
                  ปล่อยให้ความรู้สึกที่หนักอึ้งเหมือนฟองสบู่ เขียนทุกสิ่งที่คุณอยากระบายหรือบอกเล่า เพื่อให้ใครสักคนได้รับฟัง แล้วมองมันค่อยๆจางหายไปอย่างอิสระ
                </p>
                <button
                  onClick={() => navigate('/bubble-letter/write')}
                  className="mt-4 px-8 py-3 bg-[#d44b7d] text-white rounded-full font-bold shadow-lg hover:bg-[#b63a67] transition-colors"
                >
                  เริ่มระบายความรู้สึก
                </button>
              </div>
              <div className="flex-1 flex justify-center md:justify-end w-full">
                <div
                  className="relative w-full max-w-[450px] cursor-pointer"
                  onClick={() => navigate('/bubble-letter/write')}
                >
                  <div className="absolute inset-0 bg-pink-200/50 rounded-[48px] transform rotate-3 scale-105 transition-transform duration-500 hover:rotate-6"></div>
                  <img
                    src={imgBubble}
                    alt="จดหมายฟองสบู่"
                    className="relative w-full aspect-[4/3] object-cover rounded-[40px] shadow-[0_18px_35px_-18px_rgba(63,22,37,0.25)] border-[6px] border-white/80 hover:-translate-y-2 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: โปสการ์ดรอยยิ้ม (Image Left - Text Right) */}
          <section className="px-6 md:px-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <span className="inline-block px-5 py-2 bg-white/60 text-[#3b82f6] rounded-full font-bold text-lg shadow-sm border border-white/80">
                  🌷 โปสการ์ดรอยยิ้ม
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-[#5b2b3b] leading-tight">
                  อ่านเรื่องราวฮีลใจและ<br className="hidden md:block" />สร้างแรงบันดาลใจจากเพื่อนๆ
                </h2>
                <p className="text-[#5b2b3b]/80 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
                  ส่งต่อพลังบวกและความรู้สึกดีๆ ให้กับเพื่อนร่วมทาง หรือรับรอยยิ้มจากข้อความน่ารักๆ ที่ใครบางคนตั้งใจเขียนถึงคุณ
                </p>
                <button
                  onClick={() => navigate('/postcard')}
                  className="mt-4 px-8 py-3 bg-[#3b82f6] text-white rounded-full font-bold shadow-lg hover:bg-[#2563eb] transition-colors"
                >
                  เปิดรับรอยยิ้ม
                </button>
              </div>
              <div className="flex-1 flex justify-center md:justify-start w-full">
                <div
                  className="relative w-full max-w-[450px] cursor-pointer"
                  onClick={() => navigate('/postcard')}
                >
                  <div className="absolute inset-0 bg-blue-200/50 rounded-[48px] transform -rotate-3 scale-105 transition-transform duration-500 hover:-rotate-6"></div>
                  <img
                    src={imgPostcard}
                    alt="โปสการ์ดรอยยิ้ม"
                    className="relative w-full aspect-[4/3] object-cover rounded-[40px] shadow-[0_18px_35px_-18px_rgba(30,58,138,0.25)] border-[6px] border-white/80 hover:-translate-y-2 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: กิจกรรมฮีลใจ (Text Left - Image Right) */}
          <section className="px-6 md:px-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <span className="inline-block px-5 py-2 bg-white/60 text-[#10b981] rounded-full font-bold text-lg shadow-sm border border-white/80">
                  💐 กิจกรรมฮีลใจ
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-[#5b2b3b] leading-tight">
                  พักผ่อนใจไปกับกิจกรรม<br className="hidden md:block" />เบาสมองและสร้างสรรค์
                </h2>
                <p className="text-[#5b2b3b]/80 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
                  ใช้เวลาอยู่กับตัวเองผ่านกิจกรรมที่ช่วยให้ใจสงบ ไม่ว่าจะเป็นการฟังเพลง วาดรูป หรือการฝึกหายใจเพื่อฟื้นฟูพลัง
                </p>
                <button
                  onClick={() => navigate('/healing/choice')}
                  className="mt-4 px-8 py-3 bg-[#10b981] text-white rounded-full font-bold shadow-lg hover:bg-[#059669] transition-colors"
                >
                  เริ่มกิจกรรมฮีลใจ
                </button>
              </div>
              <div className="flex-1 flex justify-center md:justify-end w-full">
                <div
                  className="relative w-full max-w-[450px] cursor-pointer"
                  onClick={() => navigate('/healing/choice')}
                >
                  <div className="absolute inset-0 bg-green-200/50 rounded-[48px] transform rotate-3 scale-105 transition-transform duration-500 hover:rotate-6"></div>
                  <img
                    src={imgHealing}
                    alt="กิจกรรมฮีลใจ"
                    className="relative w-full aspect-[4/3] object-cover rounded-[40px] shadow-[0_18px_35px_-18px_rgba(6,78,59,0.25)] border-[6px] border-white/80 hover:-translate-y-2 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="cj-homeFooter mt-12" />
    </div>
  )
}
