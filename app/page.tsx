import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>📦 Наш Каталог</h1>
        <Link href="/login" style={styles.loginLink}>
          Вход для админа
        </Link>
      </header>

      {products.length === 0 ? (
        <div style={styles.noProducts}>
          <p>📭 Товаров пока нет</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Добавь товары через админ-панель
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((product: any) => (
            <article key={product.id} style={styles.card}>
              <div style={styles.imageContainer}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={styles.image}
                  // ❌ УБРАЛ onError - нельзя в Server Component!
                />
              </div>
              <div style={styles.cardContent}>
                <h2 style={styles.productName}>{product.name}</h2>
                <p style={styles.price}>{product.price.toLocaleString('ru-RU')} ₽</p>
                <p style={styles.description}>{product.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer style={styles.footer}>
        <p>© 2024 Каталог товаров</p>
      </footer>
    </main>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: '100vh',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #eaeaea',
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
  },
  loginLink: {
    color: '#0070f3',
    textDecoration: 'none',
    padding: '10px 20px',
    border: '1px solid #0070f3',
    borderRadius: '6px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    border: '1px solid #eaeaea',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: '250px',
    overflow: 'hidden',
    background: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '20px',
  },
  productName: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
  price: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  description: {
    margin: '0 0 15px 0',
    color: '#666',
    lineHeight: '1.5',
  },
  noProducts: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    background: '#f5f5f5',
    borderRadius: '12px',
  },
  footer: {
    marginTop: '60px',
    paddingTop: '20px',
    borderTop: '1px solid #eaeaea',
    textAlign: 'center' as const,
    color: '#666',
  },
}