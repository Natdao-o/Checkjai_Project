import { useNavigate } from 'react-router-dom'

import TopBar from '../components/TopBar'
import { getStudentId } from '../lib/auth'
import eqCover from '../assets/images/nature (1).jpg'
import dassCover from '../assets/images/รูปหน้าปกแบบทดสอบ.jpg'

export default function QuizPage() {
  const navigate = useNavigate()

  const handleStartQuiz = () => {
    if (!getStudentId()) {
      alert('กรุณาเข้าสู่ระบบก่อนทำแบบทดสอบ')
      navigate('/login')
      return
    }
    navigate('/quiz/question')
  }

  return (
    <div className="cj-home bg-[#fce7f3] min-h-screen">
      <TopBar />

      <main className="cj-quizMain">
        <section className="cj-quizHead">
          <span className="cj-quizHeadBar" aria-hidden="true" />
          <h1>แบบทดสอบ</h1>
        </section>

        <section className="cj-quizCard">
          <div className="cj-quizPanels">
            <article
              className="cj-quizPanel cj-quizPanelLeft"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("${eqCover}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h2>แบบทดสอบความฉลาดทางอารมณ์ EQ</h2>
              <div className="cj-quizHoverContent">
                <div className="cj-quizHoverText">
                  <h3>แบบทดสอบความฉลาดทางอารมณ์ EQ</h3>
                  <p>
                    มาทำความรู้จัก 'หัวใจ' ของตัวเองให้มากขึ้น
                    ผ่านการสำรวจทักษะการรับรู้และจัดการอารมณ์ ทั้งของตนเองและผู้อื่น
                    เพื่อช่วยให้เราสามารถรับมือกับความท้าทายในชีวิต
                    และสร้างความสัมพันธ์ที่ดีกับคนรอบข้างได้อย่างราบรื่นและมีความสุข
                  </p>
                </div>
                <div
                  className="cj-quizHoverImg"
                  style={{ backgroundImage: `url("${eqCover}")` }}
                />
              </div>
            </article>

            <article
              className="cj-quizPanel cj-quizPanelRight"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("${dassCover}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h2>แบบทดสอบสุขภาพจิต DASS-21</h2>
              <div className="cj-quizHoverContent">
                <div
                  className="cj-quizHoverImg"
                  style={{ backgroundImage: `url("${dassCover}")` }}
                />
                <div className="cj-quizHoverText">
                  <h3>แบบทดสอบสุขภาพจิต DASS-21</h3>
                  <p>
                    สำรวจสภาวะภายในใจในช่วงที่ผ่านมา
                    ด้วยเครื่องมือประเมินระดับความเครียด ความวิตกกังวล และภาวะซึมเศร้าเบื้องต้น
                    เพื่อให้คุณได้รู้เท่าทันสัญญาณเตือนจากร่างกายและจิตใจและสามารถดูแลตัวเองได้อย่างเหมาะสมก่อนที่ความเหนื่อยล้าจะสะสมมากเกินไป
                  </p>
                </div>
              </div>
            </article>
          </div>

          <p className="cj-quizDesc">
            แบบทดสอบจะแบ่งออกเป็น 2 ส่วนด้วยกัน: ก่อนทำแบบ EQ แล้วต่อด้วย DASS-21 ในครั้งเดียว (บันทึกคำตอบหลังทำครบทั้งสองส่วน)
          </p>

          <button type="button" className="cj-quizCta" onClick={handleStartQuiz}>
            ทำแบบทดสอบ
          </button>
        </section>
      </main>

      <footer className="cj-homeFooter" />
    </div>
  )
}
