import React, { useState, useEffect } from 'react'
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
import { useTranslation } from 'react-i18next'

const ProductForm = () => {
  const { t } = useTranslation()

  const [productName, setProductName] = useState('')
  const [storeQty, setStoreQty] = useState('')
  const [shopQty, setShopQty] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [price, setPrice] = useState('')
  const [buyingPrice, setBuyingPrice] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [barcode, setBarcode] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mobileCheck = /Mobi|Android/i.test(navigator.userAgent)
    setIsMobile(mobileCheck)
  }, [])

  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    setImagePreview(URL.createObjectURL(file))

    setUploading(true)
    try {
      const uploadedUrl = await uploadImageToCloudinary(file)
      setImageUrl(uploadedUrl)
    } catch (err) {
      alert(t('imageUploadFailed', { error: err.message || err }))
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
      alert(t('fillAllFieldsCorrectly'))
      return
    }

    const q = query(
      collection(db, 'products'),
      where('productName', '==', trimmedName)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      alert(t('productExists'))
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
        buyingPrice: parsedBuyingPrice,
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

      alert(t('productAddedSuccess'))

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
      alert(t('productAddFailed'))
      console.error(error)
    }
  }

  return (
    <div className='container mt-4'>
      <h2>{t('addNewProduct')}</h2>
      <form onSubmit={handleSubmit} className='mt-3'>
        <div className='mb-3'>
          <label className='form-label'>{t('productImage')}</label>
          <input
            type='file'
            className='form-control'
            accept='image/*'
            {...(isMobile ? { capture: 'environment' } : {})}
            onChange={handleFileChange}
          />
          {uploading && <small className='text-info'>{t('uploading')}</small>}

          {imagePreview && (
            <div className='mt-2 text-center'>
              <img
                src={imagePreview}
                alt={t('preview')}
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
          <label className='form-label'>{t('productName')}</label>
          <input
            type='text'
            className='form-control'
            value={productName}
            onChange={e => setProductName(e.target.value)}
          />
        </div>

        <div className='row mb-3'>
          <div className='col'>
            <label className='form-label'>{t('storeQuantity')}</label>
            <input
              type='number'
              className='form-control'
              value={storeQty}
              onChange={e => setStoreQty(e.target.value)}
              min='0'
            />
          </div>
          <div className='col'>
            <label className='form-label'>{t('shopQuantity')}</label>
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
          <label className='form-label'>{t('sellingPrice')}</label>
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
          <label className='form-label'>{t('buyingPrice')}</label>
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
          <label className='form-label'>{t('expiryDate')}</label>
          <input
            type='date'
            className='form-control'
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            required
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>{t('barcode6')}</label>
          <input
            type='text'
            className='form-control'
            maxLength={6}
            value={barcode}
            onChange={e => setBarcode(e.target.value.replace(/\D/g, ''))}
            placeholder={t('barcodePlaceholder')}
            required
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>{t('category')}</label>
          <select
            className='form-select'
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            <option value=''>{t('selectCategory')}</option>
            <option value='snacks'>{t('categorySnacks')}</option>
            <option value='sauces'>{t('categorySauces')}</option>
            <option value='local products'>{t('categoryLocalProducts')}</option>
            <option value='Vegetables'>{t('categoryVegetables')}</option>
            <option value='Fruits'>{t('categoryFruits')}</option>
            <option value='beverage'>{t('categoryBeverage')}</option>
            <option value='frozen products'>
              {t('categoryFrozenProducts')}
            </option>
          </select>
        </div>

        <div className='mb-3'>
          <strong>{t('totalQuantity')} </strong>
          {parseInt(storeQty || 0) + parseInt(shopQty || 0)}
        </div>

        <button
          type='submit'
          className='btn btn-primary w-100'
          disabled={uploading}
        >
          {uploading ? t('uploadingImage') : t('saveProduct')}
        </button>
      </form>
    </div>
  )
}

export default ProductForm
