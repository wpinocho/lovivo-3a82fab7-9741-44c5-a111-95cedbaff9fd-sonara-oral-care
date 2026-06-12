import { Link } from 'react-router-dom'

export const BrandLogoLeft = () => {
  return (
    <Link to="/" aria-label="Sonara — Inicio" className="flex items-center flex-shrink-0">
      <img
        src="/logo.png"
        alt="Sonara Oral Care"
        className="h-10 w-auto object-contain"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const span = document.createElement('span')
          span.textContent = 'SONARA'
          span.style.cssText = 'font-family: Sora, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.03em; color: hsl(213 52% 12%)'
          el.parentElement?.appendChild(span)
        }}
      />
    </Link>
  )
}