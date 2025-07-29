import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

const ProductList = () => {
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
      <div className='row row-cols-1 row-cols-md-3 g-4'>
        {products.map(;<ProductCard key={product.id} product={product} editMode={editMode} />
)}
      </div>
    </div>
  )
}

export default ProductList
