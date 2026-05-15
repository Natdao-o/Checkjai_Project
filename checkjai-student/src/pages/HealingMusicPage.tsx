import { useState } from 'react'
import TopBar from '@/components/TopBar'
import bunnyImg from '@/assets/images/bunny_illustration.png'

import thai01 from '@/assets/images/ข้างกาย-Safeplanet.jpg'
import thai02 from '@/assets/images/เหตุผล-The-Toys.jpg'
import thai03 from '@/assets/images/ฮีลใจ-พัดVorapat.jpg'
import thai04 from '@/assets/images/ห้ามใจไม่อยู่ - Earth Patravee.jpg'
import thai05 from '@/assets/images/คนหรือไมโครเวฟ (Microwave) - BELL WARISARA, No One Else.jpg'
import thai06 from '@/assets/images/พบรัก - Ink Waruntorn.jpg'
import thai07 from '@/assets/images/คนโปรด (Close Friend) -  Muzik Move Artists.jpg'
import thai08 from '@/assets/images/น่ารักจะตาย - BURGUNDY.jpg'
import thai09 from '@/assets/images/แค่เราก็พอ (With You) - Earth Patravee.jpg'

import eng01 from '@/assets/images/taylor swift-You Need To Calm Down.png'
import eng02 from '@/assets/images/taylor swift-Daylight.jpg'
import eng03 from '@/assets/images/sabrina carpenter-Espresso.jpg'
import eng04 from "@/assets/images/one direction-Live While We're Young.jpg"
import eng05 from '@/assets/images/justin bieber-Hold On.jpg'
import eng06 from '@/assets/images/justin bieber deserve you.jpg'
import eng07 from '@/assets/images/charlie puth-One Call Away.jpg'
import eng08 from '@/assets/images/Bruno Mars - 24K Magic.jpg'
import eng09 from '@/assets/images/Beautiful People – Ed Sheeran ft. Khalid.png'

const thaiSongs = [
  {
    id: 1,
    title: 'ข้างกาย',
    artist: 'Safeplanet',
    img: thai01,
    youtube: 'https://www.youtube.com/watch?v=4xvSFYbVa0U&list=RD4xvSFYbVa0U&start_radio=1'
  },
  {
    id: 2,
    title: 'เหตุผล',
    artist: 'The-Toys',
    img: thai02,
    youtube: 'https://www.youtube.com/watch?v=LfqLxrvM_Aw&list=RDLfqLxrvM_Aw&start_radio=1'
  },
  {
    id: 3,
    title: 'ฮีลใจ',
    artist: 'Vorapat',
    img: thai03,
    youtube: 'https://www.youtube.com/watch?v=2FxYYY9E6hs&list=RD2FxYYY9E6hs&start_radio=1'
  },
  {
    id: 4,
    title: 'ห้ามใจไม่อยู่',
    artist: 'Earth Patravee',
    img: thai04,
    youtube: 'https://www.youtube.com/watch?v=MFnKm6aB938&list=RDMFnKm6aB938&start_radio=1'
  },
  {
    id: 5,
    title: 'คนหรือไมโครเวฟ (Microwave)',
    artist: 'BELL WARISARA, No One Else',
    img: thai05,
    youtube: 'https://www.youtube.com/watch?v=zEt0-5fgy6I&list=RDzEt0-5fgy6I&start_radio=1'
  },
  {
    id: 6,
    title: 'พบรัก',
    artist: 'Ink Waruntorn',
    img: thai06,
    youtube: 'https://www.youtube.com/watch?v=n2wjOYVC38Y&list=RDn2wjOYVC38Y&start_radio=1'
  },
  {
    id: 7,
    title: 'คนโปรด (Close Friend)',
    artist: 'Muzik Move Artists',
    img: thai07,
    youtube: 'https://www.youtube.com/watch?v=VvbwmKH-gcU&list=RDVvbwmKH-gcU&start_radio=1'
  },
  {
    id: 8,
    title: 'น่ารักจะตาย',
    artist: 'BURGUNDY',
    img: thai08,
    youtube: 'https://www.youtube.com/watch?v=Laq_q3Uq4iU&list=RDLaq_q3Uq4iU&start_radio=1'
  },
  {
    id: 9,
    title: 'แค่เราก็พอ (With You)',
    artist: 'Earth Patravee',
    img: thai09,
    youtube: 'https://www.youtube.com/watch?v=xnPVjzE0QtM&list=RDxnPVjzE0QtM&start_radio=1'
  },
]

const englishSongs = [
  {
    id: 1,
    title: 'You Need To Calm Down',
    artist: 'Taylor Swift',
    img: eng01,
    youtube: 'https://www.youtube.com/watch?v=Dkk9gvTmCXY'
  },
  {
    id: 2,
    title: 'Daylight',
    artist: 'Taylor Swift',
    img: eng02,
    youtube: 'https://www.youtube.com/watch?v=u9raS7-NisU&list=RDu9raS7-NisU&start_radio=1'
  },
  {
    id: 3,
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    img: eng03,
    youtube: 'https://www.youtube.com/watch?v=eVli-tstM5E&list=RDeVli-tstM5E&start_radio=1'
  },
  {
    id: 4,
    title: 'Live While We\'re Young',
    artist: 'One Direction',
    img: eng04,
    youtube: 'https://www.youtube.com/watch?v=AbPED9bisSc'
  },
  {
    id: 5,
    title: 'Hold On',
    artist: 'Justin Bieber',
    img: eng05,
    youtube: 'https://www.youtube.com/watch?v=LWeiydKl0mU'
  },
  {
    id: 6,
    title: 'Deserve You',
    artist: 'Justin Bieber',
    img: eng06,
    youtube: 'https://www.youtube.com/watch?v=1_NVaujWgBg&list=RD1_NVaujWgBg&start_radio=1'
  },
  {
    id: 7,
    title: 'One Call Away',
    artist: 'Charlie Puth',
    img: eng07,
    youtube: 'https://www.youtube.com/watch?v=BxuY9FET9Y4'
  },
  {
    id: 8,
    title: '24K Magic',
    artist: 'Bruno Mars',
    img: eng08,
    youtube: 'https://www.youtube.com/watch?v=UqyT8IEBkvY'
  },
  {
    id: 9,
    title: 'Beautiful People',
    artist: 'Ed Sheeran ft. Khalid',
    img: eng09,
    youtube: 'https://www.youtube.com/watch?v=mj0XInqZMHY'
  },
]

export default function HealingMusicPage() {
  const [language, setLanguage] = useState<'TH' | 'EN'>('TH')
  const [selectedSong, setSelectedSong] = useState<typeof thaiSongs[0] | null>(null)

  const currentSongs = language === 'TH' ? thaiSongs : englishSongs

  return (
    <div className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3]">
      <TopBar />

      <main className="flex-grow flex flex-col items-center px-6 py-8">

        {/* Language Switcher */}
        <div className="flex bg-white rounded-full p-1 shadow-md border border-[#fce7f3] mb-8">
          <button
            onClick={() => { setLanguage('TH'); setSelectedSong(null); }}
            className={`px-8 py-2 rounded-full font-bold transition-all ${language === 'TH' ? 'bg-[#d44b7d] text-white' : 'text-[#5b2b3b]/60 hover:text-[#5b2b3b]'}`}
          >
            Thai
          </button>
          <button
            onClick={() => { setLanguage('EN'); setSelectedSong(null); }}
            className={`px-8 py-2 rounded-full font-bold transition-all ${language === 'EN' ? 'bg-[#d44b7d] text-white' : 'text-[#5b2b3b]/60 hover:text-[#5b2b3b]'}`}
          >
            English
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5b2b3b] mb-3">
            {language === 'TH' ? 'เพลงที่อยากให้เธอฟัง' : 'Songs for You'}
          </h1>
          <p className="text-[#5b2b3b]/70 text-lg">
            {language === 'TH'
              ? '"เลือกเพลงที่ตรงกับใจ แล้วให้มันโอบกอดเธอนะ"'
              : '"Choose a song that touches your heart, and let it embrace you."'}
          </p>
        </div>

        {/* Music Grid 3x3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          {currentSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => setSelectedSong(song)}
              className="group relative aspect-square rounded-[32px] overflow-hidden cursor-pointer shadow-xl border-4 border-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={song.img}
                alt={song.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/400x400/fce7f3/5b2b3b?text=${encodeURIComponent(song.title)}`
                }}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-white text-2xl font-bold mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {song.title}
                </p>
                <p className="text-white/80 text-lg font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Comfort Modal */}
      {selectedSong && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden p-10 flex flex-col items-center text-center space-y-8 relative animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSong(null)}
              className="absolute top-6 right-6 text-[#5b2b3b]/40 hover:text-[#5b2b3b] text-2xl transition-colors"
            >
              ✕
            </button>

            <img
              src={bunnyImg}
              alt="Comfort Bunny"
              className="w-32 h-32 object-contain"
            />

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#b63a67]">
                {language === 'TH' ? 'เราดีใจที่เธอมาฟังเพลงนี้นะ' : 'We are glad you are listening to this song'}
              </h3>
              <p className="text-lg text-[#d44b7d] leading-relaxed">
                {language === 'TH'
                  ? '"เราหวังว่าเพลงนี้จะช่วยกอดเธอไว้ในวันที่โลกใจร้าย"'
                  : '"We hope this song embraces you on days when the world is unkind."'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <a
                href={selectedSong.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-8 py-4 bg-[#d44b7d] text-white rounded-full font-bold shadow-lg hover:bg-[#b63a67] transition-all text-center flex items-center justify-center gap-2"
              >
                <span>▶</span> {language === 'TH' ? 'ไปฟังเพลงนี้' : 'Listen on YouTube'}
              </a>
              <button
                onClick={() => setSelectedSong(null)}
                className="flex-1 px-8 py-4 bg-[#fce7f3] text-[#d44b7d] rounded-full font-bold hover:bg-[#fae1ee] transition-all"
              >
                {language === 'TH' ? 'ขอบคุณนะ' : 'Thank you'}
              </button>
            </div>
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedSong(null)}
          ></div>
        </div>
      )}

      <footer className="h-16 bg-transparent" />
    </div>
  )
}
