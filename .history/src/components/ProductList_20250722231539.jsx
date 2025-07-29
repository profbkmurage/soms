import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from './ProductCard'

const ProductList = ({
  editMode,
  addStockMode,
  // // setEditMode,
  // setAddStockMode
}) => {
  const [products, setProducts] = useState([])

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'))
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className='container mt-5'>
      <h2 className='mb-4'>Available Products</h2>
            {/* 🧾 PRODUCT GRID */}
      <div className='row row-cols-1 row-cols-md-3 g-4'>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            editMode={editMode}
            addStockMode={addStockMode}
            refreshProducts={fetchProducts}
          />
        ))}
      </div>
    </div>
  )
}

export default ProductList
