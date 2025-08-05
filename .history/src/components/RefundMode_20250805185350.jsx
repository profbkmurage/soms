import React, { useState, useEffect } from 'react'
import { getDoc, doc, updateDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext' // <-- you need a custom AuthContext for this

const RefundMode = () => {
  const [receiptId, setReceiptId] = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [refundQuantities, setRefundQuantities] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAuth() // assuming you're using a custom hook

  const [userRole, setUserRole] = useState(null)

  // 🔐 Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!currentUser?.uid) return
      const userRef = doc(db, 'users', currentUser.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUserRole(userSnap.data().role || '')
      }
    }
    fetchUserRole()
  }, [currentUser])

  const fetchReceipt = async () => {
    setIsLoading(true)
    try {
      const receiptRef = doc(db, 'receipts', receiptId)
      const receiptSnap = await getDoc(receiptRef)

      if (receiptSnap.exists()) {
        const data = receiptSnap.data()
        if (data.refunded) {
          alert('This receipt has already been refunded.')
          setReceiptData(null)
        } else {
          setReceiptData(data)
          setRefundQuantities({})
        }
      } else {
        alert('Receipt not found')
      }
    } catch (error) {
      console.error('Error fetching receipt:', error)
      alert('Failed to fetch receipt')
    }
    setIsLoading(false)
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

    if (refundItems.length === 0) {
      alert('No valid items selected for refund.')
      return
    }

    try {
      // ✅ Prevent double refund
      const receiptRef = doc(db, 'receipts', receiptId)
      await updateDoc(receiptRef, {
        refunded: true
      })

      for (let item of refundItems) {
        const { productId, refundQty } = item

        // Update product shopQty
        const productRef = doc(db, 'products', productId)
        const productSnap = await getDoc(productRef)
        if (productSnap.exists()) {
          const productData = productSnap.data()
          await updateDoc(productRef, {
            shopQty: (productData.shopQty || 0) + refundQty
          })
        }

        // Update referenceStocks.quantity
        const refStockRef = doc(db, 'referenceStocks', productId)
        const refStockSnap = await getDoc(refStockRef)
        if (refStockSnap.exists()) {
          const refStockData = refStockSnap.data()
          await updateDoc(refStockRef, {
            quantity: (refStockData.quantity || 0) + refundQty
          })
        }
      }

      // Log refund
      await addDoc(collection(db, 'refunds'), {
        receiptId,
        refundedItems: refundItems,
        timestamp: new Date(),
        userId: currentUser.uid
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

  // 🔒 Show nothing if not superadmin
  if (userRole !== 'superadmin') {
    return (
      <div className='container mt-5 text-center'>
        <h4>Access Denied</h4>
        <p>This section is restricted to Superadmins only.</p>
      </div>
    )
  }

  return (
    <div className='container mt-4'>
      <h3>Refund Mode (Superadmin Only)</h3>

      <div className='mb-3'>
        <input
          type='text'
          placeholder='Enter Receipt ID'
          value={receiptId}
          onChange={e => setReceiptId(e.target.value)}
          className='form-control'
        />
        <button
          className='btn btn-primary mt-2'
          onClick={fetchReceipt}
          disabled={isLoading}
        >
          {isLoading ? 'Fetching...' : 'Fetch Receipt'}
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
