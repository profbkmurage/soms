import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import AddStockModal from './AddStockModal'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product, editMode, addStockMode, refreshProducts }) => {
  const [storeQty, setStoreQty] = useState(product.storeQty)
  const [shopQty, setShopQty] = useState(product.shopQty)
  const [expiryDate, setExpiryDate] = useState(
    product.expiryDate ? product.expiryDate.split('T')[0] : ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()

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
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        lastUpdated: new Date()
      })
      alert('Product stock updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product stock.')
    }
    setIsSaving(false)
  }

  const handleAdd = () => {
    const numericQty = parseInt(qty)
    if (numericQty <= 0) return alert('Enter a valid quantity')
    addToCart(product, numericQty)
    alert(`${product.productName} added to cart.`)
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
          <p className='mb-2'>
            <strong>Price:</strong> KES {product.price}
          </p>

          {editMode ? (
            <>
              <div className='mb-2'>
                <label className='form-label'>Store Quantity</label>
                <input
                  type='number'
                  className='form-control'
                  value={storeQty === 0 ? '' : storeQty}
                  onChange={e =>
                    setStoreQty(
                      e.target.value === ''
                        ? ''
                        : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>
              <div className='mb-2'>
                <label className='form-label'>Shop Quantity</label>
                <input
                  type='number'
                  className='form-control'
                  value={shopQty === 0 ? '' : shopQty}
                  onChange={e =>
                    setShopQty(
                      e.target.value === ''
                        ? ''
                        : Math.max(0, parseInt(e.target.value))
                    )
                  }
                />
              </div>
              <div className='mb-2'>
                <label className='form-label'>Expiry Date</label>
                <input
                  type='date'
                  className='form-control'
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
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
              ;
              <p className='card-text'>
                <strong>Barcode:</strong> {product.barcode}
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
              <p className='card-text mb-1'>
                <strong>Total:</strong>{' '}
                <span className='badge bg-secondary'>{totalQty}</span>
              </p>
              {product.expiryDate && (
                <p className='card-text mb-2'>
                  <strong>Expiry:</strong>{' '}
                  {new Date(product.expiryDate).toLocaleDateString()}
                </p>
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
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>

      {addStockMode && (
        <button
          className='btn btn-outline-primary w-100 mt-3'
          onClick={() => setShowModal(true)}
        >
          Add Stock
        </button>
      )}

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
