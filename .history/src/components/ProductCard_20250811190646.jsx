import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import AddStockModal from './AddStockModal'
import { useCart } from '../context/CartContext'
import { useTranslation } from 'react-i18next'

const ProductCard = ({
  product,
  editMode,
  addStockMode,
  refreshProducts,
  role
}) => {
  const { t } = useTranslation()

  const [storeQty, setStoreQty] = useState(product.storeQty || 0)
  const [shopQty, setShopQty] = useState(product.shopQty || 0)
  const [expiryDate, setExpiryDate] = useState(
    product.expiryDate ? product.expiryDate.split('T')[0] : ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()

  const isCompanyUser = role === 'company'

  const totalQty = storeQty + shopQty
  const originalTotal = product.totalQty || 0
  const variance = totalQty - originalTotal

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, {
        storeQty,
        shopQty,
        totalQty,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        lastUpdated: new Date()
      })
      alert(t('productStockUpdated'))
      refreshProducts?.()
    } catch (error) {
      console.error('Error updating product:', error)
      alert(t('productStockUpdateFailed'))
    }
    setIsSaving(false)
  }

  const handleAdd = () => {
    const numericQty = parseInt(qty)
    if (isNaN(numericQty) || numericQty <= 0) {
      return alert(t('enterValidQuantity'))
    }
    addToCart(product, numericQty)
    alert(`${product.productName} ${t('addedToCart')}`)
  }

  return (
    <div className='col-md-6 col-lg-4 mb-4'>
      <div className='card h-100 shadow-sm'>
        <img
          src={product.imageUrl}
          className='card-img-top'
          alt={product.productName}
          style={{ height: '200px', objectFit: 'cover' }}
        />

        <div className='card-body d-flex flex-column'>
          <h5 className='card-title text-capitalize'>{product.productName}</h5>

          <p className='mb-1'>
            <strong>{t('price')}:</strong> KES {product.price}
          </p>

          {!isCompanyUser && (
            <p className='mb-1 text-muted'>
              <strong>{t('barcode')}:</strong>{' '}
              {product.barcode || t('notAvailable')}
            </p>
          )}

          {editMode && !isCompanyUser ? (
            <>
              <div className='mb-2'>
                <label className='form-label'>{t('storeQuantity')}</label>
                <input
                  type='number'
                  className='form-control'
                  value={storeQty === 0 ? '' : storeQty}
                  onChange={e =>
                    setStoreQty(
                      e.target.value === ''
                        ? 0
                        : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>

              <div className='mb-2'>
                <label className='form-label'>{t('shopQuantity')}</label>
                <input
                  type='number'
                  className='form-control'
                  value={shopQty === 0 ? '' : shopQty}
                  onChange={e =>
                    setShopQty(
                      e.target.value === ''
                        ? 0
                        : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>

              <div className='mb-2'>
                <label className='form-label'>{t('expiryDate')}</label>
                <input
                  type='date'
                  className='form-control'
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                />
              </div>

              <p className='mb-1'>
                <strong>{t('total')}:</strong> {totalQty}
              </p>
              <p className='mb-3'>
                <strong>{t('variance')}:</strong>{' '}
                <span
                  className={`badge ${
                    variance === 0 ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  {variance}
                </span>
              </p>

              <button
                className='btn btn-primary mt-auto w-100'
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? t('saving') : t('saveChanges')}
              </button>
            </>
          ) : (
            <>
              <p className='mb-1'>
                <strong>{t('total')}:</strong>{' '}
                <span className='badge bg-secondary'>{totalQty}</span>
              </p>
              {!isCompanyUser && (
                <>
                  <p className='mb-1'>
                    <strong>{t('store')}:</strong> {storeQty}
                  </p>
                  <p className='mb-1'>
                    <strong>{t('shop')}:</strong> {shopQty}
                  </p>
                  {product.expiryDate && (
                    <p className='mb-2 text-muted'>
                      <strong>{t('expiry')}:</strong>{' '}
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
              <input
                type='number'
                className='form-control mb-2'
                value={qty}
                onChange={e => setQty(e.target.value)}
                min='1'
              />
              <button
                className='btn btn-outline-success w-100'
                onClick={handleAdd}
              >
                {t('addToCart')}
              </button>
            </>
          )}
        </div>

        {!isCompanyUser && addStockMode && (
          <div className='card-footer bg-transparent border-0'>
            <button
              className='btn btn-outline-primary w-100'
              onClick={() => setShowModal(true)}
            >
              {t('addStock')}
            </button>
          </div>
        )}
      </div>

      {!isCompanyUser && (
        <AddStockModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          product={product}
          refreshProducts={refreshProducts}
        />
      )}
    </div>
  )
}

export default ProductCard
