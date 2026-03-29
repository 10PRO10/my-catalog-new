'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Для редактирования
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
        loadProducts()
      }
    }
    
    checkUser()
  }, [router])

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) {
      console.error('Error loading products:', error)
    } else {
      setProducts(data || [])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let imageUrl = ''

      if (imageFile) {
        setMessage('⏳ Загрузка изображения...')
        imageUrl = await uploadImage(imageFile)
      }

      setMessage('💾 Сохранение товара...')
      const { error } = await supabase
        .from('products')
        .insert([
          {
            name: name.trim(),
            price: parseInt(price),
            image_url: imageUrl,
            description: description.trim(),
            category: category.trim(),
          },
        ])

      if (error) {
        throw error
      }

      setMessage('✅ Товар успешно добавлен!')
      
      setName('')
      setPrice('')
      setImageFile(null)
      setImagePreview('')
      setDescription('')
      setCategory('')
      
      loadProducts()

    } catch (error: any) {
      setMessage('❌ Ошибка: ' + error.message)
    }

    setLoading(false)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product)
    setEditName(product.name)
    setEditPrice(product.price.toString())
    setEditImageUrl(product.image_url)
    setEditDescription(product.description)
    setEditCategory(product.category || '')
    setEditImagePreview('')
    setEditImageFile(null)
  }

  const handleCloseEdit = () => {
    setEditingProduct(null)
    setEditName('')
    setEditPrice('')
    setEditImageUrl('')
    setEditDescription('')
    setEditCategory('')
    setEditImagePreview('')
    setEditImageFile(null)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setLoading(true)
    setMessage('')

    try {
      let imageUrl = editImageUrl

      // Если загрузили новое изображение
      if (editImageFile) {
        setMessage('⏳ Загрузка нового изображения...')
        imageUrl = await uploadImage(editImageFile)
      }

      setMessage('💾 Обновление товара...')
      const { error } = await supabase
        .from('products')
        .update({
          name: editName.trim(),
          price: parseInt(editPrice),
          image_url: imageUrl,
          description: editDescription.trim(),
          category: editCategory.trim(),
        })
        .eq('id', editingProduct.id)

      if (error) {
        throw error
      }

      setMessage('✅ Товар обновлён!')
      handleCloseEdit()
      loadProducts()

    } catch (error: any) {
      setMessage('❌ Ошибка: ' + error.message)
    }

    setLoading(false)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleDeleteProduct = async (productId: number, productName: string) => {
    const confirmDelete = confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)
    
    if (!confirmDelete) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      setMessage('❌ Ошибка при удалении: ' + error.message)
    } else {
      setMessage('✅ Товар удалён!')
      loadProducts()
    }

    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const filteredProducts = products.filter((product: any) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.category && product.category.toLowerCase().includes(query))
    )
  })

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
        {/* Форма добавления товара */}
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
                  placeholder="Например: Обувь, Техника"
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
              <label style={styles.label}>Изображение товара *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.fileInput}
                required
              />
              {imagePreview && (
                <div style={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                </div>
              )}
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
              {loading ? '⏳ Загрузка...' : '✨ Добавить товар'}
            </button>
          </form>
        </section>

        {/* Поиск товаров */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📦 Товары ({filteredProducts.length} из {products.length})</h2>
          
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="🔍 Поиск товаров по названию, описанию или категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                ✕
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <p style={styles.noProducts}>
              {products.length === 0 ? 'Товаров пока нет' : 'Товары не найдены'}
            </p>
          ) : (
            <div style={styles.productsList}>
              {filteredProducts.map((product: any) => (
                <div key={product.id} style={styles.productItem}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={styles.productImage}
                  />
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productCategory}>📋 {product.category || 'Без категории'}</p>
                    <p style={styles.productPrice}>{product.price.toLocaleString('ru-RU')} ₽</p>
                    <p style={styles.productDescription}>{product.description}</p>
                  </div>
                  <div style={styles.productActions}>
                    <button
                      onClick={() => handleOpenEdit(product)}
                      style={styles.editButton}
                      disabled={loading}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      style={styles.deleteButton}
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Модальное окно редактирования */}
      {editingProduct && (
        <div style={styles.modalOverlay} onClick={handleCloseEdit}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✏️ Редактировать товар</h2>
              <button onClick={handleCloseEdit} style={styles.closeButton}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateProduct} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Название товара *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Категория *</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Цена (₽) *</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={styles.input}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Текущее изображение</label>
                <img src={editImageUrl} alt="Current" style={styles.currentImage} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Новое изображение (оставь пустым, если не меняешь)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  style={styles.fileInput}
                />
                {editImagePreview && (
                  <div style={styles.imagePreview}>
                    <img src={editImagePreview} alt="New Preview" style={styles.previewImage} />
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Описание *</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ ...styles.input, minHeight: '100px' as const }}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  style={styles.cancelButton}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={loading ? styles.buttonDisabled : styles.saveButton}
                >
                  {loading ? '⏳ Сохранение...' : '💾 Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  fileInput: {
    padding: '10px',
    fontSize: '14px',
    border: '2px dashed #e1e1e1',
    borderRadius: '8px',
    background: '#fafafa',
    cursor: 'pointer',
  },
  imagePreview: {
    marginTop: '10px',
    padding: '10px',
    background: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  currentImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginTop: '5px',
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
  searchContainer: {
    position: 'relative' as const,
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 45px 12px 16px',
    fontSize: '15px',
    border: '2px solid #e1e1e1',
    borderRadius: '8px',
    outline: 'none',
  },
  clearSearchButton: {
    position: 'absolute' as const,
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  productItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    border: '1px solid #e1e1e1',
    borderRadius: '8px',
    background: '#fafafa',
  },
  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover' as const,
    borderRadius: '8px',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  productCategory: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#666',
  },
  productPrice: {
    margin: '0 0 5px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  productDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#888',
    lineHeight: '1.4',
  },
  productActions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '10px 15px',
    background: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  deleteButton: {
    padding: '10px 15px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  noProducts: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
    background: '#f5f5f5',
    borderRadius: '8px',
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
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eaeaea',
  },
  modalTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px 10px',
  },
  modalForm: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
}