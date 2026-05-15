import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/TopBar'

import musicBg from '@/assets/images/เพลง.jpg'
import artBg from '@/assets/images/ศิลปะ.jpg'

export default function HealingChoicePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3]">
      <TopBar />

      <main className="flex-grow flex flex-col pt-4">
        {/* Page Header */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5b2b3b] mb-2">เลือกหมวดหมู่ที่ต้องการ</h1>
          <p className="text-[#5b2b3b]/70 text-lg italic">"ให้เสียงเพลงและศิลปะช่วยโอบกอดใจคุณ"</p>
        </div>

        <div className="flex flex-col flex-grow">
          {/* Music Category Bar */}
          <div
            className="group relative flex-1 min-h-[300px] cursor-pointer overflow-hidden"
            onClick={() => navigate('/healing/music')}
          >
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <img
                src={musicBg}
                alt="หมวดเพลง"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/1200x400/fce7f3/5b2b3b?text=Music+Background'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg tracking-wider mb-2">หมวดเพลง</h2>
                <div className="h-1.5 w-24 bg-white mx-auto rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>

          {/* Art Category Bar */}
          <div
            className="group relative flex-1 min-h-[300px] cursor-pointer overflow-hidden border-t-4 border-white"
            onClick={() => navigate('/healing/art')}
          >
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <img
                src={artBg}
                alt="หมวดศิลปะ"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/1200x400/fef2f2/5b2b3b?text=Art+Background'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg tracking-wider mb-2">หมวดศิลปะ</h2>
                <div className="h-1.5 w-24 bg-white mx-auto rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-12 bg-transparent" />
    </div>
  )
}
