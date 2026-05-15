import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import drawImg from '@/assets/images/รูปLet\'sdraw it.png'
import gameImg from '@/assets/images/รูปcrazygames.avif'

export default function HealingArtPage() {
  const navigate = useNavigate()

  const activities = [
    {
      id: 1,
      title: 'กิจกรรมวาดรูป',
      img: drawImg,
      link: 'https://letsdraw.it/'
    },
    {
      id: 2,
      title: 'กิจกรรมเกม',
      img: gameImg,
      link: 'https://www.crazygames.com/'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3]">
      <TopBar />

      <main className="flex-grow flex flex-col items-center px-6 py-8">

        {/* Header section with vertical green bar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-[#bbf7d0] rounded-full"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#5b2b3b]">กิจกรรมฮีลใจ</h1>
          </div>
          <button
            onClick={() => navigate('/healing/choice')}
            className="text-[#5b2b3b]/60 hover:text-[#5b2b3b] font-medium transition-colors flex items-center gap-2"
          >
            <span>←</span> กลับไปหน้าเลือกหมวดหมู่
          </button>
        </div>

        {/* Activity Cards Stack */}
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-[40px] p-8 shadow-sm border border-[#fce7f3] flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-md"
            >
              <div className="w-full md:w-1/3 aspect-[4/3] rounded-3xl overflow-hidden shadow-inner bg-gray-50">
                <img
                  src={activity.img}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f0fdf4/166534?text=${encodeURIComponent(activity.title)}`
                  }}
                />
              </div>

              <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                <h2 className="text-2xl font-bold text-[#5b2b3b]">{activity.title}</h2>
                <a
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-12 py-3 bg-[#bbf7d0] text-[#166534] rounded-full font-bold text-lg hover:bg-[#86efac] transition-all transform hover:scale-105 shadow-sm"
                >
                  Play
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="h-16 bg-transparent" />
    </div>
  )
}
