import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from './ProductCard'
import { getAuth } from 'firebase/auth'
import { useTranslation } from 'react-i18next'
import { Nav } from 'react-bootstrap'

const ProductList = ({ editMode, addStockMode }) => {
  const { t } = useTranslation()

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const auth = getAuth()

  // categories for tabs
  const categories = [
    { value: 'all', label: t('allCategories') },
    { value: 'snacks', label: t('categorySnacks') },
    { value: 'sauces', label: t('categorySauces') },
    { value: 'local products', label: t('categoryLocalProducts') },
    { value: 'Vegetables', label: t('categoryVegetables') },
    { value: 'Fruits', label: t('categoryFruits') },
    { value: 'beverage', label: t('categoryBeverage') },
    { value: 'frozen products', label: t('categoryFrozenProducts') }
  ]

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser
      if (user) {
        const name = user.displayName || user.email.split('@')[0]
        setUsername(name.charAt(0).toUpperCase() + name.slice(1))

        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap.exists()) {
          setRole(userDocSnap.data().role || '')
        }
      }
    }
    fetchUserRole()
  }, [auth.currentUser])

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'))
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setProducts(data)
    setFilteredProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSearch = () => {
    const search = searchTerm.toLowerCase()
    const filtered = products.filter(
      p =>
        (p.productName && p.productName.toLowerCase().includes(search)) ||
        (p.productCode && p.productCode.toLowerCase().includes(search)) ||
        (p.barcode && p.barcode.toLowerCase().includes(search))
    )
    setFilteredProducts(filtered)
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // apply category filter
  const displayedProducts = filteredProducts.filter(p =>
    activeCategory === 'all'
      ? true
      : (p.category || '').toLowerCase() === activeCategory.toLowerCase()
  )

  return (
    <div className='container mt-5'>
      {username && (
        <div className='mb-4 text-center'>
          <h4 className='fw-bold'>
            {t('hello')}, <span className='text-primary'>{username}</span>
            <br />
            <small className='text-muted'>{t('welcomeMessage')}</small>
          </h4>
        </div>
      )}

      {/* Search */}
      <div className='row justify-content-center mb-4'>
        <div className='col-md-8'>
          <div className='input-group shadow-sm'>
            <input
              type='text'
              className='form-control'
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className='btn btn-primary' onClick={handleSearch}>
              {t('search')}
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Nav
        variant='tabs'
        activeKey={activeCategory}
        className='mb-4 justify-content-center'
      >
        {categories.map(cat => (
          <Nav.Item key={cat.value}>
            <Nav.Link
              eventKey={cat.value}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Products */}
      {displayedProducts.length > 0 ? (
        <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4'>
          {displayedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              editMode={editMode && role !== 'company'}
              addStockMode={addStockMode && role !== 'company'}
              refreshProducts={fetchProducts}
              role={role}
            />
          ))}
        </div>
      ) : (
        <div className='text-center mt-4'>
          <h5 className='text-muted'>{t('noProductsMatch')}</h5>
        </div>
      )}
    </div>
  )
}

export default ProductList
