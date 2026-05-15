import { useState } from 'react'
import TopBar from '@/components/TopBar'
import heartEmoji from '@/assets/images/อิโมจิ.png'

// Import all postcard images
import img1 from '@/assets/images/โปสการ์ดรอยยิ้ม-1.jpg'
import img2 from '@/assets/images/โปสการ์ดรอยยิ้ม-2.jpg'
import img3 from '@/assets/images/โปสการ์ดรอยยิ้ม-3.jpg'
import img4 from '@/assets/images/โปสการ์ดรอยยิ้ม-4.jpg'
import img5 from '@/assets/images/โปสการ์ดรอยยิ้ม-5.jpg'
import img6 from '@/assets/images/โปสการ์ดรอยยิ้ม-6.jpg'
import img7 from '@/assets/images/โปสการ์ดรอยยิ้ม-7.jpg'
import img8 from '@/assets/images/โปสการ์ดรอยยิ้ม-8.jpg'

const postcards = [
  {
    id: 1,
    title: 'คุณยายแมวเหมียวกับมิตรภาพต่างสายพันธุ์',
    img: img1,
    content: "ในประเทศญี่ปุ่น มีเรื่องราวโด่งดังของคุณยายมิซาโอะที่รับเลี้ยงแมวสีขาวตาคนละสีชื่อ 'ฟุกุมารุ' ทั้งคู่ใช้ชีวิตเรียบง่ายในฟาร์ม ไม่ว่าคุณยายจะทำอะไร ฟุกุมารุจะอยู่ข้างๆ เสมอ มิตรภาพที่บริสุทธิ์นี้ทำให้เห็นว่าความรักไม่ต้องใช้คำพูด แค่มีกันและกันก็เพียงพอแล้ว"
  },
  {
    id: 2,
    title: 'พลังของ "จดหมาย" จากคนแปลกหน้า',
    img: img2,
    content: "ที่ประเทศอังกฤษ มีแคมเปญชื่อ 'The World Needs More Love Letters' ที่เริ่มต้นจากการส่งจดหมายให้กำลังใจคนแปลกหน้าที่กำลังเจอเรื่องยากลำบาก ข้อความเล็กๆ บนกระดาษช่วยย้ำเตือนว่าในโลกที่วุ่นวายนี้ ยังมีคนที่ห่วงใยและปรารถนาดีต่อเราเสมอ"
  },
  {
    id: 3,
    title: 'น้องหมาฮาจิโกะ: หัวใจที่คำว่า "รอ" มีความหมาย',
    img: img3,
    content: "เรื่องราวระดับตำนานของเจ้าหมาฮาจิโกะที่ไปรอรับเจ้านายที่สถานีรถไฟชิบูย่าทุกวัน แม้เจ้านายจะจากไปแล้ว ฮาจิโกะก็ยังคงไปรอที่เดิมเป็นเวลาเกือบ 10 ปี ความซื่อสัตย์ที่ยิ่งใหญ่นี้เตือนให้เรารู้ว่าความรักที่มั่นคงคือพลังที่สวยงามที่สุด"
  },
  {
    id: 4,
    title: 'คุณตาผู้ออกเดินเพื่อ "มอบกอด"',
    img: img4,
    content: "ในออสเตรเลียมีคุณตาคนหนึ่งชื่อ Juan Mann เขาเริ่มเดินถือป้าย 'Free Hugs' ในย่านชุมชนเพื่อมอบอ้อมกอดให้คนแปลกหน้า การกอดเพียงไม่กี่วินาทีช่วยลดความโดดเดี่ยวและส่งต่อความอบอุ่นให้กันได้อย่างน่าอัศจรรย์"
  },
  {
    id: 5,
    title: 'Christian the Lion: สายใยที่ไม่เคยจางหาย',
    img: img5,
    content: "เรื่องราวของชายหนุ่มสองคนที่รับเลี้ยงลูกสิงโตชื่อ 'คริสเตียน' ในลอนดอน เมื่อมันโตขึ้นพวกเขาต้องนำมันไปปล่อยที่แอฟริกา หลายปีต่อมาพวกเขากลับไปหาคริสเตียน และมันยังคงจำพวกเขาได้พร้อมกระโจนเข้ากอดด้วยความรัก เป็นเครื่องพิสูจน์ว่าความผูกพันไม่มีวันเลือนหาย"
  },
  {
    id: 6,
    title: 'ดอกไม้ที่เบ่งบานใน "หัวใจ" ของเพื่อนบ้าน',
    img: img6,
    content: "ในหมู่บ้านเล็กๆ แห่งหนึ่ง มีคุณยายที่ชอบปลูกดอกไม้มาก แต่พออายุเยอะขึ้นเธอเริ่มทำไม่ไหว เพื่อนบ้านในระแวกนั้นจึงแอบมาช่วยกันรดน้ำและดูแลสวนให้จนดอกไม้เบ่งบานเต็มสวนอีกครั้ง ความเอื้ออาทรเล็กๆ น้อยๆ ทำให้หมู่บ้านนี้เต็มไปด้วยรอยยิ้ม"
  },
  {
    id: 7,
    title: 'Street Cat Bob: แมวข้างถนนที่เปลี่ยนชีวิตคน',
    img: img7,
    content: "James Bowen ชายพเนจรที่มีชีวิตมืดมนและติดยา ได้พบกับ 'บ็อบ' แมวสีส้มที่บาดเจ็บอยู่ เขาตัดสินใจช่วยเหลือมัน และนั่นคือจุดเริ่มต้นที่ทำให้ชีวิตของเขาเปลี่ยนไป บ็อบไม่ได้แค่มาเป็นเพื่อน แต่มาเพื่อสอนให้เขารู้จักการรักตัวเองและผู้อื่น"
  },
  {
    id: 8,
    title: 'จูราสสิค พาร์ค ของเด็กชายตัวน้อย',
    img: img8,
    content: "มีเรื่องจริงของเด็กชายที่เป็นออทิสติกซึ่งชอบไดโนเสาร์มาก แต่เขามักจะโดนเพื่อนแกล้ง จนกระทั่งกลุ่มคนรักไดโนเสาร์รวมตัวกันจัดนิทรรศการเล็กๆ ให้เขาโดยเฉพาะ เพื่อบอกให้เขารู้ว่าสิ่งที่เขาชอบนั้นพิเศษและสวยงามเพียงใด"
  }
]

export default function PostcardPage() {
  const [selectedPostcard, setSelectedPostcard] = useState<typeof postcards[0] | null>(null)

  return (
    <div className="min-h-screen flex flex-col font-['Sarabun'] bg-[#fce7f3]">
      <TopBar />

      <main className="flex-grow flex flex-col items-center px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5b2b3b] mb-4">โปสการ์ดรอยยิ้ม</h1>
          <p className="text-[#5b2b3b]/70 text-lg">"รับแรงบันดาลใจและพลังบวกผ่านเรื่องราวฮีลใจ"</p>
        </div>

        {/* Postcard Grid 4x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl w-full">
          {postcards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedPostcard(card)}
              className="bg-white rounded-[32px] p-4 shadow-[0_10px_30px_rgba(212,75,125,0.08)] border border-[#fce7f3] cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={heartEmoji}
                  alt="Heart"
                  className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-125 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal System */}
      {selectedPostcard && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="bg-white rounded-[40px] shadow-2xl max-w-5xl w-full overflow-hidden relative animate-in zoom-in duration-300 flex flex-col md:flex-row min-h-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPostcard(null)}
              className="absolute top-6 right-6 z-10 text-[#5b2b3b]/40 hover:text-[#5b2b3b] text-3xl transition-colors"
            >
              ✕
            </button>

            {/* Left side: Image Container */}
            <div className="w-full md:w-[400px] h-[300px] md:h-[550px] flex-shrink-0 overflow-hidden md:ml-10 md:my-10 md:rounded-[32px] shadow-md border-4 border-white/50">
              <img
                src={selectedPostcard.img}
                alt={selectedPostcard.title}
                className="w-full h-full object-cover rounded-[28px]"
              />
            </div>

            {/* Right side: Content */}
            <div className="flex-grow p-8 md:p-12 flex flex-col justify-center bg-white">
              <h2 className="text-2xl md:text-3xl font-bold text-[#3b82f6] mb-6 md:mb-10 leading-tight">
                {selectedPostcard.title}
              </h2>
              <p className="text-lg md:text-xl text-[#5b2b3b]/80 leading-relaxed font-medium">
                {selectedPostcard.content}
              </p>
            </div>
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedPostcard(null)}
          ></div>
        </div>
      )}

      <footer className="h-16 bg-transparent" />
    </div>
  )
}
