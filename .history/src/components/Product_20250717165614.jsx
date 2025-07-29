import React, { useState } from 'react'
import { uploadImageToCloudinary } from '../services/uploadImage'
import { db } from '../firebase/config'
import { collection, setDoc,doc,ser, getDocs, query, where } from 'firebase/firestore'

const ProductForm = () => {
  const [productName, setProductName] = useState('')
  const [storeQty, setStoreQty] = useState('')
  const [shopQty, setShopQty] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async e => {
    const file = e.target.files[0]
    setUploading(true)
    try {
      const uploadedUrl = await uploadImageToCloudinary(file)
      setImageUrl(uploadedUrl)
    } catch (err) {
      alert(`Image upload failed. with error ${err}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const totalQty = parseInt(storeQty || 0) + parseInt(shopQty || 0)

    // Check for duplicate product
    const q = query(
      collection(db, 'products'),
      where('productName', '==', productName.trim().toLowerCase())
    )
    const querySnapshot = await getDocs(q)

    if (!productName || !imageUrl || querySnapshot.size > 0) {
      alert('Product exists or missing fields.')
      return
    }

    try {
      // Generate a reusable ID to store in both collections
      const productId = Date.now().toString() // or use nanoid/uuid if needed

      const productData = {
        productId,
        productName,
        storeQty: parseInt(storeQty),
        shopQty: parseInt(shopQty),
        totalQty: parseInt(storeQty) + parseInt(shopQty),
        imageUrl,
        price: parseFloat(price),
        createdAt: serverTimestamp()
      }

      // 1. Save to 'products/'
      await setDoc(doc(db, 'products', productId), productData)

      // 2. Save to 'referenceStocks/' (frozen snapshot)
      await setDoc(doc(db, 'referenceStocks', productId), {
        ...productData,
        reference: true // just a tag to distinguish
      })

      alert('Product added successfully!')

      // Clear form
      setProductName('')
      setStoreQty('')
      setShopQty('')
      setPrice('')
      setImageUrl('')
    } catch (error) {
      alert('Failed to add product.')
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
            />
          </div>
          <div className='col'>
            <label className='form-label'>Shop Quantity</label>
            <input
              type='number'
              className='form-control'
              value={shopQty}
              onChange={e => setShopQty(e.target.value)}
            />
          </div>
        </div>
        ;
        <div className='mb-3'>
          <label className='form-label'>Product Price (KES)</label>
          <input
            type='number'
            className='form-control'
            value={price}
            onChange={e => setPrice(parseFloat(e.target.value))}
            min='0'
            required
          />
        </div>
        <div className='mb-3'>
          <strong>Total Quantity: </strong>
          {parseInt(storeQty || 0) + parseInt(shopQty || 0)}
        </div>
        <button type='submit' className='btn btn-primary' disabled={uploading}>
          Save Product
        </button>
      </form>
    </div>
  )
}

export default ProductForm
