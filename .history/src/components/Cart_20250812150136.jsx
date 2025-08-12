import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { FaTrash } from 'react-icons/fa'
import { db, auth } from '../firebase/config'
import { collection, addDoc, getDoc, doc, Timestamp } from 'firebase/firestore'
import ReceiptImage from './ReceiptImage'
import { useTranslation } from 'react-i18next'

const Cart = () => {
  const { t } = useTranslation()
  const { cartItems, removeFromCart, clearCart } = useCart()
  const [role, setRole] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptId, setReceiptId] = useState(null)
  const [receiptPayload, setReceiptPayload] = useState(null)

  const subtotal = cartItems.reduce((total, item) => {
    const qtyStr = item.quantity ?? item.qty ?? '0'
    const priceStr = item.price ?? '0'

    const qty = parseFloat(String(qtyStr).trim()) || 0
    const price = parseFloat(String(priceStr).trim()) || 0

    return total + price * qty
  }, 0)

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          const data = snap.data()
          setRole(data.role)
          setCompanyName(data.companyName || '')
        }
      } catch (err) {
        console.error(t('fetchUserError'), err)
      }
    }
    fetchUserData()
  }, [t])

  const createFormattedItems = () =>
    cartItems.map(item => {
      const qty =
        parseFloat(String(item.quantity ?? item.qty ?? '0').trim()) || 0
      const price = parseFloat(String(item.price ?? '0').trim()) || 0
      return {
        productId: item.productId || '',
        barcode: item.barcode || t('notAvailable'),
        productName: item.productName || item.name || t('unnamedProduct'),
        qty,
        price,
        subtotal: price * qty
      }
    })

  const handleCheckout = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        alert(t('mustBeLoggedIn'))
        return
      }

      if (!cartItems || cartItems.length === 0) {
        alert(t('cartEmpty'))
        return
      }

      const formattedItems = createFormattedItems()

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        companyName: companyName || t('notAvailable'),
        companyEmail: user.email,
        date: Timestamp.now(),
        items: formattedItems,
        total: subtotal,
        status: t('statusPending')
      }

      let docRef
      if (role === 'company') {
        docRef = await addDoc(collection(db, 'orders'), orderData)
        alert(t('orderPlaced'))
        clearCart()
      } else if (role === 'staff' || role === 'superadmin') {
        docRef = await addDoc(collection(db, 'receipts'), orderData)
        alert(t('receiptGenerated'))
        setReceiptId(docRef.id)

        setReceiptPayload({
          items: formattedItems,
          total: subtotal,
          meta: {
            receiptId: docRef.id,
            createdBy: user.uid,
            companyName: companyName || t('notAvailable'),
            userEmail: user.email
          }
        })

        setShowReceipt(true)
      } else {
        alert(t('unknownRole'))
      }
    } catch (err) {
      console.error(t('checkoutError'), err)
      alert(t('checkoutFailed'))
    }
  }

  const handleReceiptDone = () => {
    clearCart()
    setShowReceipt(false)
    setReceiptPayload(null)
    setReceiptId(null)
  }

  return (
    <div className='container my-4'>
      <h2 className='mb-4'>{t('yourCart')}</h2>

      {cartItems.length === 0 ? (
        <p>{t('cartEmpty')}</p>
      ) : (
        <>
          <table className='table table-bordered table-hover'>
            <thead className='table-dark'>
              <tr>
                <th>{t('barcode')}</th>
                <th>{t('name')}</th>
                <th>{t('price')}</th>
                <th>{t('qty')}</th>
                <th>{t('subtotal')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => {
                const qty =
                  parseFloat(String(item.quantity ?? item.qty ?? '0').trim()) ||
                  0
                const price = parseFloat(String(item.price ?? '0').trim()) || 0
                const sub = price * qty
                return (
                  <tr key={index}>
                    <td>{item.barcode || t('notAvailable')}</td>
                    <td>{item.productName || t('unnamedProduct')}</td>
                    <td>{t('currencyKES', { amount: price })}</td>
                    <td>{qty}</td>
                    <td>{t('currencyKES', { amount: sub })}</td>
                    <td>
                      <button
                        className='btn btn-danger btn-sm'
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className='d-flex justify-content-between align-items-center mt-4'>
            <h4>{t('totalAmount', { amount: subtotal })}</h4>
            <div>
              <button className='btn btn-secondary me-2' onClick={clearCart}>
                {t('clearCart')}
              </button>
              <button className='btn btn-primary' onClick={handleCheckout}>
                {t('checkout')}
              </button>
            </div>
          </div>
        </>
      )}

      {showReceipt && receiptPayload && (
        <ReceiptImage
          items={receiptPayload.items}
          total={receiptPayload.total}
          receiptId={receiptPayload.meta.receiptId || receiptId}
          meta={receiptPayload.meta}
          onDone={handleReceiptDone}
        />
      )}
    </div>
  )
}

export default Cart
