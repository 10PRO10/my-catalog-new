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

export default async function Home({
  searchParams,
}: {
  searchParams: { search?: string; category?: string }
}) {
  const products = await getProducts()
  
  const searchQuery = searchParams.search?.toLowerCase() || ''
  const selectedCategory = searchParams.category || 'all'
  
  // Получаем все уникальные категории
  const categories = ['all', ...new Set(products.map((p: any) => p.category).filter(Boolean))]
  
  // Фильтруем товары
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery)
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>📦 Наш Каталог</h1>
        <Link href="/login" style={styles.loginLink}>
          Вход для админа
        </Link>
      </header>

      {/* Поиск и фильтры */}
      <div style={styles.filters}>
        <form style={styles.searchForm}>
          <input
            type="text"
            name="search"
            placeholder="🔍 Поиск товаров..."
            defaultValue={searchQuery}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            Найти
          </button>
        </form>
        
        <div style={styles.categories}>
          {categories.map((category: string) => (
            <Link
              key={category}
              href={`/?category=${category}${searchQuery ? `&search=${searchQuery}` : ''}`}
              style={{
                ...styles.categoryButton,
                ...(selectedCategory === category ? styles.categoryButtonActive : {}),
              }}
            >
              {category === 'all' ? '📋 Все' : category}
            </Link>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div style={styles.noProducts}>
          <p>📭 Товары не найдены</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Попробуй изменить параметры поиска
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredProducts.map((product: any) => (
            <article key={product.id} style={styles.card}>
              <div style={styles.imageContainer}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={styles.image}
                />
                {product.category && (
                  <div style={styles.categoryBadge}>
                    {product.category}
                  </div>
                )}
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
    marginBottom: '30px',
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
  filters: {
    marginBottom: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  searchForm: {
    display: 'flex',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e1e1e1',
    borderRadius: '8px',
    outline: 'none',
  },
  searchButton: {
    padding: '12px 24px',
    fontSize: '16px',
    background: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  categories: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  categoryButton: {
    padding: '8px 16px',
    background: '#f5f5f5',
    border: '1px solid #e1e1e1',
    borderRadius: '20px',
    textDecoration: 'none',
    color: '#333',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryButtonActive: {
    background: '#0070f3',
    color: '#fff',
    borderColor: '#0070f3',
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
    position: 'relative' as const,
  },
  imageContainer: {
    width: '100%',
    height: '250px',
    overflow: 'hidden',
    background: '#f5f5f5',
    position: 'relative' as const,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  categoryBadge: {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    background: 'rgba(0, 112, 243, 0.9)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
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
    fontSize: '14px',
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