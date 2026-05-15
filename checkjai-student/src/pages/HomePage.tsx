import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'

// Import images from assets
import heroBg from '../assets/images/หน้าหลักรูปปก.jpg'
import card01 from '../assets/images/กล่องจดหมาย01.jpg'
import card02 from '../assets/images/กล่องจดหมาย02.jpg'
import card03 from '../assets/images/กล่องจดหมาย03.jpg'
import card04 from '../assets/images/กล่องจดหมาย04.jpg'

const features = [
  {
    description: `ขอให้เธอยิ้มได้มากขึ้นในทุกวัน
และเจอเรื่องดี ๆ เข้ามาในชีวิตบ่อย ๆ
ถึงวันนี้จะเหนื่อยแค่ไหนก็ตาม
อย่าลืมนะว่าเธอเก่งมากจริงๆ 🌷`,
    image: card04,
    emoji: '🦋',
    path: '/bubble-letter',
    isLight: true
  },
  {
    description: `บางครั้งชีวิตก็ไม่ได้ง่ายเลยเนอะ
แต่เธอก็ยังพยายามอยู่ทุกวัน
นั่นเป็นสิ่งที่น่าภูมิใจมากแล้วนะ
ค่อย ๆ เติบโตไปด้วยกันนะ ☁️💗`,
    image: card01,
    emoji: '🌷',
    path: '/postcards',
    isLight: false
  },
  {
    description: `ถ้าวันนี้เหนื่อยมาก ก็พักได้เลยนะ
โลกไม่ได้รีบให้เธอเก่งในทันที
ดอกไม้เองก็ยังใช้เวลาในการผลิบานเลย 🌸`,
    image: card02,
    emoji: '🌼',
    path: '/quiz',
    isLight: true
  },
  {
    description: `เราอยากให้เธอจำไว้ว่า
เธอมีคุณค่าเสมอ
และยังมีคนที่เชื่อในตัวเธออยู่มากกว่าที่เธอคิดนะ 🤍`,
    image: card03,
    emoji: '💐',
    path: '/activities',
    isLight: false
  }
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="cj-home bg-[#fce7f3] min-h-screen">
      <TopBar />

      <main className="cj-homeMain">
        {/* Hero Section */}
        <section className="cj-hero-section">
          <div className="cj-hero-content">
            <h1 className="cj-hero-greeting">
              สวัสดีเจ้าคนเก่ง...<br />
              วันนี้เป็นอย่างไรบ้าง?
            </h1>
            <p className="cj-hero-subtext">
              เราพร้อมรับฟังและอยู่เคียงข้างคุณเสมอ พื้นที่ปลอดภัยสำหรับใจของคุณ
            </p>
          </div>
          <div className="cj-hero-visual">
            <img src={heroBg} alt="Hero Background" className="cj-hero-img" />
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="cj-feature-grid">
          {features.map((feature, index) => (
            <article
              key={index}
              className="cj-feature-card"
              onClick={() => navigate(feature.path)}
            >
              <div
                className="cj-card-bg"
                style={{ backgroundImage: `url(${feature.image})` }}
              />
              <div className={`cj-card-overlay ${(feature as any).isLight ? 'is-light' : ''}`}>
                <p className="cj-card-desc">{feature.description}</p>
                <div className="cj-card-emoji">{feature.emoji}</div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="cj-homeFooter" />
    </div>
  )
}




