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
  const [imagePreview, setImagePreview] = useState(null) // preview state
  const [price, setPrice] = useState('')
  const [buyingPrice, setBuyingPrice] = useState('') // new buying price state
  const [expiryDate, setExpiryDate] = useState('')
  const [barcode, setBarcode] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    // Show local preview immediately
    setImagePreview(URL.createObjectURL(file))

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
    const parsedBuyingPrice = parseFloat(buyingPrice || 0)
    const trimmedBarcode = barcode.trim()

    if (
      !trimmedName ||
      !imageUrl ||
      parsedPrice <= 0 ||
      parsedBuyingPrice <= 0 ||
      !expiryDate ||
      trimmedBarcode.length !== 6 ||
      isNaN(Number(trimmedBarcode)) ||
      !category
    ) {
      alert('Please fill all fields correctly.')
      return
    }

    // Check for duplicate product name
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
      const productId = Date.now().toString()
      const totalQty = parsedStore + parsedShop

      const productData = {
        productId,
        productName: trimmedName,
        storeQty: parsedStore,
        shopQty: parsedShop,
        totalQty,
        imageUrl,
        price: parsedPrice,
        buyingPrice: parsedBuyingPrice, // save buying price
        expiryDate,
        barcode: trimmedBarcode,
        category,
        createdAt: serverTimestamp()
      }

      await setDoc(doc(db, 'products', productId), productData)
      await setDoc(doc(db, 'referenceStocks', productId), {
        ...productData,
        reference: true
      })

      alert('Product added successfully!')

      setProductName('')
      setStoreQty('')
      setShopQty('')
      setPrice('')
      setBuyingPrice('')
      setImageUrl('')
      setImagePreview(null)
      setExpiryDate('')
      setBarcode('')
      setCategory('')
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
            capture='environment' // enables camera capture on mobile
            onChange={handleFileChange}
          />
          {uploading && <small className='text-info'>Uploading...</small>}

          {/* Live preview */}
          {imagePreview && (
            <div className='mt-2 text-center'>
              <img
                src={imagePreview}
                alt='Preview'
                style={{
                  maxWidth: '200px',
                  borderRadius: '10px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          )}
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
          <label className='form-label'>Selling Price (KES)</label>
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
          <label className='form-label'>Buying Price (KES)</label>
          <input
            type='number'
            className='form-control'
            value={buyingPrice}
            onChange={e => setBuyingPrice(e.target.value)}
            min='1'
            required
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>Expiry Date</label>
          <input
            type='date'
            className='form-control'
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            required
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>6-digit Barcode</label>
          <input
            type='text'
            className='form-control'
            maxLength={6}
            value={barcode}
            onChange={e => setBarcode(e.target.value.replace(/\D/g, ''))}
            placeholder='e.g. 123456'
            required
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>Category</label>
          <select
            className='form-select'
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            <option value=''>Select Category</option>
            <option value='snacks'>Snacks</option>
            <option value='sauces'>Sauces</option>
            <option value='local products'>Local Products</option>
            <option value='Vegetables'>Vegetables</option>
            <option value=''></option>
            <option value='beverage'>Beverage</option>
            <option value='frozen products'>Frozen Products</option>
          </select>
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
