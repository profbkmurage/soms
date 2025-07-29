import React, { useState } from 'react'
import { uploadImageToCloudinary } from '../services/uploadImage'
import { db } from '../firebase/config'
import {
  collection,
  setDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore'

const ProductForm = () => {
  const [productName, setProductName] = useState('')
  const [storeQty, setStoreQty] = useState('')
  const [shopQty, setShopQty] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadedUrl = await uploadImageToCloudinary(file)
      setImageUrl(uploadedUrl)
    } catch (err) {
      alert(`Image upload failed: ${err.message || err}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const trimmedName = productName.trim().toLowerCase()
    const parsedStore = parseInt(storeQty || 0)
    const parsedShop = parseInt(shopQty || 0)
    const parsedPrice = parseFloat(price || 0)

    if (!trimmedName || !imageUrl || parsedPrice <= 0) {
      alert('Please fill all fields and upload a product image.')
      return
    }

    // Check for duplicate product
    const q = query(
      collection(db, 'products'),
      where('productName', '==', trimmedName)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      alert('Product already exists.')
      return
    }

    try {
      const productId = Date.now().toString() // or nanoid
      const totalQty = parsedStore + parsedShop

      const productData = {
        productId,
        productName: trimmedName,
        storeQty: parsedStore,
        shopQty: parsedShop,
        totalQty,
        imageUrl,
        price: parsedPrice,
        createdAt: serverTimestamp()
      }

      // Save to products/
      await setDoc(doc(db, 'products', productId), productData)

      // Save to referenceStocks/
      await setDoc(doc(db, 'referenceStocks', productId), {
        ...productData,
        reference: true
      })

      alert('✅ Product added successfully!')

      // Clear form
      setProductName('')
      setStoreQty('')
      setShopQty('')
      setPrice('')
      setImageUrl('')
    } catch (error) {
      alert('❌Failed to add product.')
      console.error(error)
    }
  }

  return (
    <div className='container mt-4'>
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} className='mt-3'>
        <div className='mb-3'>
          <label className='form-label'>Product Image</label>
          <input
            type='file'
            className='form-control'
            accept='image/*'
            onChange={handleFileChange}
          />
          {uploading && <small className='text-info'>Uploading...</small>}
        </div>

        <div className='mb-3'>
          <label className='form-label'>Product Name</label>
          <input
            type='text'
            className='form-control'
            value={productName}
            onChange={e => setProductName(e.target.value)}
          />
        </div>

        <div className='row mb-3'>
          <div className='col'>
            <label className='form-label'>Store Quantity</label>
            <input
              type='number'
              className='form-control'
              value={storeQty}
              onChange={e => setStoreQty(e.target.value)}
              min='0'
            />
          </div>
          <div className='col'>
            <label className='form-label'>Shop Quantity</label>
            <input
              type='number'
              className='form-control'
              value={shopQty}
              onChange={e => setShopQty(e.target.value)}
              min='0'
            />
          </div>
        </div>

        <div className='mb-3'>
          <label className='form-label'>Product Price (KES)</label>
          <input
            type='number'
            className='form-control'
            value={price}
            onChange={e => setPrice(e.target.value)}
            min='1'
            required
          />
        </div>

        <div className='mb-3'>
          <strong>Total Quantity: </strong>
          {parseInt(storeQty || 0) + parseInt(shopQty || 0)}
        </div>

        <button
          type='submit'
          className='btn btn-primary w-100'
          disabled={uploading}
        >
          {uploading ? 'Uploading Image...' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}

export default ProductForm
