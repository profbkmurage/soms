import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from './ProductCard'
import { getAuth } from 'firebase/auth'

const ProductList = ({ editMode, addStockMode }) => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [username, setUsername] = useState('')

  const auth = getAuth()

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      const name = user.displayName || user.email.split('@')[0]
      setUsername(name.charAt(0).toUpperCase() + name.slice(1))
    }
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
        (p.barcode && p.barcode.toLowerCase().includes(search)) // ✅ barcode added
    )
    setFilteredProducts(filtered)
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className='container mt-5'>
      {/* Greeting */}
      {username && (
        <div className='mb-4 text-center'>
          <h4 className='fw-bold'>
            Hello, <span className='text-primary'>{username}</span>
            <br />
            <small className='text-muted'>Welcome to the app today!</small>
          </h4>
        </div>
      )}

      {/* Search Form */}
      <div className='row justify-content-center mb-4'>
        <div className='col-md-8'>
          <div className='input-group shadow-sm'>
            <input
              type='text'
              className='form-control'
              placeholder='Search by product name, code, or barcode...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className='btn btn-primary' onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4'>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              editMode={editMode}
              addStockMode={addStockMode}
              refreshProducts={fetchProducts}
            />
          ))
        ) : (
          <div className='text-center mt-4'>
            <h5 className='text-muted'>No products match your search.</h5>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
