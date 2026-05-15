import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import logoImage from '../assets/images/โลโก้Checkjai-removebg-preview.png'

type PinkShellProps = PropsWithChildren<{
  title: string
  subtitle?: string
  showBack?: boolean
}>

export default function PinkShell({
  title,
  subtitle,
  showBack = false,
  children,
}: PinkShellProps) {
  const navigate = useNavigate()

  return (
    <div className="cj-page">
      <div className="cj-card">
        <div className="cj-header">
          <div className="cj-headerRow">
            {showBack ? (
              <button
                type="button"
                className="cj-back"
                onClick={() => navigate(-1)}
                aria-label="ย้อนกลับ"
              >
                <span aria-hidden="true">‹</span>
              </button>
            ) : (
              <div className="cj-backSpacer" />
            )}
            <div className="cj-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <img 
                src={logoImage} 
                alt="Logo" 
                style={{ 
                  height: '50px', 
                  objectFit: 'contain',
                  marginRight: '8px'
                }} 
              />
              <span className="cj-brandText">CheckJai</span>
            </div>
            <div className="cj-backSpacer" />
          </div>

          <div className="cj-title">{title}</div>
          {subtitle ? <div className="cj-subtitle">{subtitle}</div> : null}
        </div>

        <div className="cj-body">{children}</div>
      </div>
    </div>
  )
}

