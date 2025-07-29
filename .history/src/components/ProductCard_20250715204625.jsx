import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import AddStockModal from './AddStockModal'

const ProductCard = ({ product, editMode, addStockMode, refreshProducts }) => {
  const [storeQty, setStoreQty] = useState(product.storeQty)
  const [shopQty, setShopQty] = useState(product.shopQty)
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const totalQty = storeQty + shopQty
  const originalTotal = product.totalQty
  const variance = totalQty - originalTotal

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, {
        storeQty,
        shopQty,
        totalQty,
        lastUpdated: new Date()
      })
      alert('Product stock updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product stock.')
    }
    setIsSaving(false)
  }

  return (
  <div className='col'>
    <div className='card h-100 shadow-sm'>
      <img
        src={product.imageUrl}
        className='card-img-top'
        alt={product.productName}
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className='card-body'>
        <h5 className='card-title text-capitalize'>{product.productName}</h5>

        {editMode ? (
          <>
            <div className='mb-2'>
              <label className='form-label'>Store Quantity</label>
              <input
                type='number'
                className='form-control'
                value={storeQty === 0 ? '' : storeQty}
                onChange={e => {
                  const value = e.target.value
                  const clean = value === '' ? '' : Math.max(0, parseInt(value))
                  setStoreQty(clean)
                }}
              />
            </div>
            <div className='mb-2'>
              <label className='form-label'>Shop Quantity</label>
              <input
                type='number'
                className='form-control'
                value={shopQty === 0 ? '' : shopQty}
                onChange={e => {
                  const value = e.target.value
                  const clean = value === '' ? '' : Math.max(0, parseInt(value))
                  setShopQty(clean)
                }}
              />
            </div>
            <p className='mb-1'>
              <strong>Total:</strong> {totalQty}
            </p>
            <p>
              <strong>Variance:</strong>{' '}
              <span
                className={`badge ${
                  variance === 0 ? 'bg-success' : 'bg-danger'
                }`}
              >
                {variance}
              </span>
            </p>
            <button
              className='btn btn-primary w-100'
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <p className='card-text mb-1'>
              <strong>Store:</strong> {storeQty}
            </p>
            <p className='card-text mb-1'>
              <strong>Shop:</strong> {shopQty}
            </p>
            <p className='card-text'>
              <strong>Total:</strong>{' '}
              <span className='badge bg-secondary'>{totalQty}</span>
            </p>
          </>
        )}
      </div>
    </div>

    {/* Add Stock Button - shows when addStockMode is active */}
    {addStockMode && (
      <button
        className='btn btn-outline-primary w-100 mt-3'
        onClick={() => setShowModal(true)}
      >
        Add Stock
      </button>
    )}

    {/* Add Stock Modal */}
    <AddStockModal
      show={showModal}
      handleClose={() => setShowModal(false)}
      product={product}
      refreshProducts={refreshProducts}
    />
  </div>
)
}

export default ProductCard
