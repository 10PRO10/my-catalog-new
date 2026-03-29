'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Логотип */}
          <Link href="/" style={styles.logo}>
            📦 Наш Каталог
          </Link>

          {/* Десктопное меню */}
          <nav style={styles.desktopNav} className="desktop-nav">
            <Link href="/" style={styles.desktopLink}>
              🏠 Главная
            </Link>
            <Link href="/login" style={styles.loginButton}>
              Вход для админа
            </Link>
          </nav>

          {/* Кнопка мобильного меню */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.mobileButton}
            className="mobile-button"
            aria-label="Меню"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div style={styles.mobileMenu} className="mobile-menu">
            <Link
              href="/"
              style={styles.mobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 Главная
            </Link>
            <Link
              href="/login"
              style={styles.mobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              🔐 Вход для админа
            </Link>
          </div>
        )}
      </header>

      {/* Стили для мобильных */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-button {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-button {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #eaeaea',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    textDecoration: 'none',
  },
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  desktopLink: {
    color: '#333',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
  },
  loginButton: {
    color: '#0070f3',
    textDecoration: 'none',
    padding: '10px 20px',
    border: '1px solid #0070f3',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  mobileButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#333',
    padding: '5px 10px',
  },
  mobileMenu: {
    flexDirection: 'column',
    padding: '20px',
    background: '#fff',
    borderTop: '1px solid #eaeaea',
    gap: '15px',
  },
  mobileLink: {
    color: '#333',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '500',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  },
}