import React, { useState } from 'react'
import { getDoc, doc, updateDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const RefundMode = () => {
  const [receiptId, setReceiptId] = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])

  const fetchReceipt = async () => {
    try {
      const receiptRef = doc(db, 'receipts', receiptId)
      const receiptSnap = await getDoc(receiptRef)

      if (receiptSnap.exists()) {
        setReceiptData(receiptSnap.data())
      } else {
        alert('Receipt not found')
      }
    } catch (error) {
      console.error('Error fetching receipt:', error)
      alert('Failed to fetch receipt')
    }
  }

  const handleSelectItem = productId => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleRefund = async () => {
    if (!receiptData) return
    const refundItems = receiptData.items.filter(item =>
      selectedItems.includes(item.productId)
    )

    try {
      // 1. Add refunded items back to inventory
      for (let item of refundItems) {
        const productRef = doc(db, 'products', item.productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          const existingQty = productSnap.data().stockQty || 0
          await updateDoc(productRef, {
            stockQty: existingQty + item.qty
          })
        }
      }

      // 2. Log the refund
      await addDoc(collection(db, 'refunds'), {
        receiptId,
        refundedItems: refundItems,
        timestamp: new Date()
      })

      alert('Refund processed successfully')
      setReceiptData(null)
      setSelectedItems([])
      setReceiptId('')
    } catch (err) {
      console.error('Refund failed', err)
      alert('Refund failed')
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
          🔍 Fetch Receipt
        </button>
      </div>

      {receiptData && (
        <div className='mt-4'>
          <h5>Receipt Items</h5>
          <ul className='list-group'>
            {receiptData.items.map(item => (
              <li
                key={item.productId}
                className='list-group-item d-flex justify-content-between'
              >
                <label>
                  <input
                    type='checkbox'
                    checked={selectedItems.includes(item.productId)}
                    onChange={() => handleSelectItem(item.productId)}
                    className='form-check-input me-2'
                  />
                  {item.productName} x{item.qty} (KES {item.price})
                </label>
              </li>
            ))}
          </ul>

          <button
            className='btn btn-danger mt-3'
            disabled={selectedItems.length === 0}
            onClick={handleRefund}
          >
            💸 Refund Selected
          </button>
        </div>
      )}
    </div>
  )
}

export default RefundMode
