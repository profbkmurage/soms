import React, { useState } from 'react'
import { getDoc, doc, updateDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const RefundMode = () => {
  const [receiptId, setReceiptId] = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [refundQuantities, setRefundQuantities] = useState({})

  const fetchReceipt = async () => {
    try {
      const receiptRef = doc(db, 'receipts', receiptId)
      const receiptSnap = await getDoc(receiptRef)

      if (receiptSnap.exists()) {
        setReceiptData(receiptSnap.data())
        setRefundQuantities({}) // Reset input
      } else {
        alert('Receipt not found')
      }
    } catch (error) {
      console.error('Error fetching receipt:', error)
      alert('Failed to fetch receipt')
    }
  }

  const handleRefundQtyChange = (productId, maxQty, value) => {
    const qty = parseInt(value, 10)
    if (!isNaN(qty) && qty >= 0 && qty <= maxQty) {
      setRefundQuantities(prev => ({
        ...prev,
        [productId]: qty
      }))
    }
  }

  const handleRefund = async () => {
    if (!receiptData) return

    const refundItems = receiptData.items
      .filter(item => item.productId && refundQuantities[item.productId] > 0)
      .map(item => ({
        ...item,
        refundQty: refundQuantities[item.productId]
      }))

    if (refundItems.length <= 0) {
      alert('No valid items selected for refund.')
      return
    }

    try {
      for (let item of refundItems) {
        const { productId, refundQty } = item

        // Update product shopQty
        const productRef = doc(db, 'products', productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          const productData = productSnap.data()
          const updatedShopQty = (productData.shopQty || 0) + refundQty

          await updateDoc(productRef, {
            shopQty: updatedShopQty
          })
        }

        // Update referenceStocks.quantity
        const refStockRef = doc(db, 'referenceStocks', productId)
        const refStockSnap = await getDoc(refStockRef)

        if (refStockSnap.exists()) {
          const refStockData = refStockSnap.data()
          const updatedQty = (refStockData.quantity || 0) + refundQty

          await updateDoc(refStockRef, {
            quantity: updatedQty
          })
        }
      }

      // Log refund
      await addDoc(collection(db, 'refunds'), {
        receiptId,
        refundedItems: refundItems,
        timestamp: new Date()
      })

      alert('Refund processed successfully.')
      setReceiptId('')
      setReceiptData(null)
      setRefundQuantities({})
    } catch (error) {
      console.error('Refund failed:', error)
      alert('Refund failed. See console for details.')
    }
  }

  return (
    <div className='container mt-4'>
      <h3>Refund Mode</h3>

      <div className='mb-3'>
        <input
          type='text'
          placeholder='Enter Receipt ID'
          value={receiptId}
          onChange={e => setReceiptId(e.target.value)}
          className='form-control'
        />
        <button className='btn btn-primary mt-2' onClick={fetchReceipt}>
          Fetch Receipt
        </button>
      </div>

      {receiptData && (
        <div className='mt-4'>
          <h5>Receipt Items</h5>
          <ul className='list-group'>
            {receiptData.items.map(item => (
              <li
                key={item.productId || item.productName}
                className='list-group-item'
              >
                <strong>{item.productName}</strong> — Bought: {item.qty} — KES{' '}
                {item.price}
                <br />
                <label className='mt-2'>
                  Refund Quantity:
                  <input
                    type='number'
                    min='0'
                    max={item.qty}
                    value={refundQuantities[item.productId] || ''}
                    onChange={e =>
                      handleRefundQtyChange(
                        item.productId,
                        item.qty,
                        e.target.value
                      )
                    }
                    className='form-control form-control-sm mt-1'
                    style={{ width: '100px' }}
                  />
                </label>
              </li>
            ))}
          </ul>

          <button
            className='btn btn-danger mt-3'
            onClick={handleRefund}
            disabled={!Object.values(refundQuantities).some(qty => qty > 0)}
          >
            Refund Selected Items
          </button>
        </div>
      )}
    </div>
  )
}

export default RefundMode
