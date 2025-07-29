// src/components/RefundPage.jsx
import React, { useState } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/co'

const RefundPage = ({ onRefundComplete }) => {
  const [receiptId, setReceiptId] = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])

  const handleFetchReceipt = async () => {
    if (!receiptId.trim()) return alert('Please enter a receipt ID')
    try {
      const docRef = doc(db, 'receipts', receiptId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setReceiptData(docSnap.data())
        setSelectedItems(docSnap.data().items)
      } else {
        alert('Receipt not found!')
        setReceiptData(null)
      }
    } catch (error) {
      console.error('Error fetching receipt:', error)
      alert('Failed to fetch receipt')
    }
  }

  const handleToggleSelectItem = productId => {
    const isSelected = selectedItems.some(item => item.productId === productId)
    if (isSelected) {
      setSelectedItems(prev => prev.filter(i => i.productId !== productId))
    } else {
      const item = receiptData.items.find(i => i.productId === productId)
      setSelectedItems(prev => [...prev, item])
    }
  }

  const handleRefund = () => {
    // We'll implement this logic in the next step
    alert('Refund logic to be implemented...')
  }

  return (
    <div className='container mt-4'>
      <h3>🔁 Refund Portal</h3>

      <div className='mb-3'>
        <label className='form-label'>Enter Receipt ID:</label>
        <input
          type='text'
          className='form-control'
          value={receiptId}
          onChange={e => setReceiptId(e.target.value)}
        />
        <button className='btn btn-primary mt-2' onClick={handleFetchReceipt}>
          🔍 Fetch Receipt
        </button>
      </div>

      {receiptData && (
        <>
          <h5 className='mt-4'>Products in Receipt:</h5>
          <ul className='list-group'>
            {receiptData.items.map(item => (
              <li
                key={item.productId}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  selectedItems.some(i => i.productId === item.productId)
                    ? 'list-group-item-success'
                    : ''
                }`}
                onClick={() => handleToggleSelectItem(item.productId)}
              >
                {item.productName} x{item.qty}
                <span>KES {(item.price * item.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <button
            className='btn btn-success mt-4'
            onClick={handleRefund}
            disabled={selectedItems.length === 0}
          >
            ✅ Confirm Refund ({selectedItems.length} items)
          </button>
        </>
      )}
    </div>
  )
}

export default RefundPage
