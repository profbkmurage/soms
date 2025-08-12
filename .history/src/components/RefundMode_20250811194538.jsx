import React, { useState, useEffect } from 'react'
import { getDoc, doc, updateDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

const RefundMode = () => {
  const { t } = useTranslation()

  const [receiptId, setReceiptId] = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [refundQuantities, setRefundQuantities] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAuth()

  const [userRole, setUserRole] = useState(null)

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

      if (!receiptSnap.exists()) {
        alert(t('receiptNotFound'))
        setReceiptData(null)
      } else {
        const data = receiptSnap.data()
        if (data.refunded) {
          alert(t('receiptAlreadyRefunded'))
          setReceiptData(null)
        } else {
          setReceiptData(data)
          setRefundQuantities({})
        }
      }
    } catch (error) {
      console.error(t('errorFetchingReceipt'), error)
      alert(t('failedToFetchReceipt'))
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
      alert(t('noValidItemsForRefund'))
      return
    }

    try {
      const receiptRef = doc(db, 'receipts', receiptId)
      const latestReceiptSnap = await getDoc(receiptRef)

      if (!latestReceiptSnap.exists()) {
        alert(t('receiptNoLongerExists'))
        return
      }

      const latestData = latestReceiptSnap.data()
      if (latestData.refunded) {
        alert(t('receiptAlreadyRefundedBySomeoneElse'))
        setReceiptData(null)
        return
      }

      await updateDoc(receiptRef, { refunded: true })

      for (let item of refundItems) {
        const { productId, refundQty } = item

        const productRef = doc(db, 'products', productId)
        const productSnap = await getDoc(productRef)
        if (productSnap.exists()) {
          const productData = productSnap.data()
          await updateDoc(productRef, {
            shopQty: (productData.shopQty || 0) + refundQty
          })
        }

        const refStockRef = doc(db, 'referenceStocks', productId)
        const refStockSnap = await getDoc(refStockRef)
        if (refStockSnap.exists()) {
          const refStockData = refStockSnap.data()
          await updateDoc(refStockRef, {
            quantity: (refStockData.quantity || 0) + refundQty
          })
        }
      }

      await addDoc(collection(db, 'refunds'), {
        receiptId,
        refundedItems: refundItems,
        timestamp: new Date(),
        userId: currentUser?.uid || 'unknown'
      })

      alert(t('refundSuccess'))
      setReceiptId('')
      setReceiptData(null)
      setRefundQuantities({})
    } catch (error) {
      console.error(t('refundFailed'), error)
      alert(t('refundFailedAlert'))
    }
  }

  if (userRole !== 'superadmin') {
    return (
      <div className='container mt-5 text-center'>
        <h4>{t('accessDenied')}</h4>
        <p>{t('superadminOnly')}</p>
      </div>
    )
  }

  return (
    <div className='container mt-4'>
      <h3>{t('refundMode')}</h3>

      <div className='mb-3'>
        <input
          type='text'
          placeholder={t('enterReceiptId')}
          value={receiptId}
          onChange={e => setReceiptId(e.target.value)}
          className='form-control'
        />
        <button
          className='btn btn-primary mt-2'
          onClick={fetchReceipt}
          disabled={isLoading}
        >
          {isLoading ? t('fetching') : t('fetchReceipt')}
        </button>
      </div>

      {receiptData && (
        <div className='mt-4'>
          <h5>{t('receiptItems')}</h5>
          <ul className='list-group'>
            {receiptData.items.map(item => (
              <li
                key={item.productId || item.productName}
                className='list-group-item'
              >
                <strong>{item.productName}</strong> — {t('bought')}: {item.qty}{' '}
                — KES {item.price}
                <br />
                <label className='mt-2'>
                  {t('refundQuantity')}:
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
            {t('refundSelectedItems')}
          </button>
        </div>
      )}
    </div>
  )
}

export default RefundMode
