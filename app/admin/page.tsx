'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    }
    
    checkUser()
  }, [router])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('products')
      .insert([
        {
          name: name.trim(),
          price: parseInt(price),
          image_url: imageUrl.trim(),
          description: description.trim(),
          category: category.trim(),
        },
      ])

    if (error) {
      setMessage('❌ Ошибка: ' + error.message)
    } else {
      setMessage('✅ Товар успешно добавлен!')
      setName('')
      setPrice('')
      setImageUrl('')
      setDescription('')
      setCategory('')
    }

    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        Загрузка...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>👨‍💼 Админ-панель</h1>
        <div style={styles.headerActions}>
          <span style={styles.userEmail}>{user.email}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Выйти
          </button>
        </div>
      </header>

      {message && (
        <div style={{
          ...styles.message,
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
        }}>
          {message}
        </div>
      )}

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>➕ Добавить товар</h2>
          
          <form onSubmit={handleAddProduct} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Название товара *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="Например: Кроссовки Nike"
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Категория *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.input}
                  placeholder="Например: Обувь, Техника, Одежда"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Цена (₽) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={styles.input}
                  placeholder="9990"
                  min="0"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ссылка на изображение *</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={styles.input}
                placeholder="https://..."
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Описание *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...styles.input, minHeight: '100px' as const }}
                placeholder="Описание товара..."
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={loading ? styles.buttonDisabled : styles.button}
            >
              {loading ? '⏳ Добавление...' : '✨ Добавить товар'}
            </button>
          </form>
        </section>
      </div>

      <div style={styles.footer}>
        <a href="/" style={styles.link}>← Вернуться на главную</a>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    padding: '20px 30px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#333',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userEmail: {
    color: '#666',
    fontSize: '14px',
  },
  logoutButton: {
    padding: '10px 20px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  message: {
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  section: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '22px',
    color: '#333',
    paddingBottom: '15px',
    borderBottom: '2px solid #f0f0f0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '12px',
    fontSize: '15px',
    border: '2px solid #e1e1e1',
    borderRadius: '8px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    background: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '30px',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
  },
}