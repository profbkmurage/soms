import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { FaTrash } from 'react-icons/fa'
import { db, auth } from '../firebase/config'
import { collection, addDoc, getDoc, doc, Timestamp } from 'firebase/firestore'
import ReceiptImage from './ReceiptImage'

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart()
  const [role, setRole] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptId, setReceiptId] = useState(null)

  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity || item.qty) || 0
    return total + price * qty
  }, 0)

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser
      if (!user) return
      const userRef = doc(db, 'users', user.uid)
      const snap = await getDoc(userRef)
      if (snap.exists()) {
        setRole(snap.data().role) // e.g., "company", "staff", "superadmin"
      }
    }
    fetchRole()
  }, [])

  const handleCheckout = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        alert('You must be logged in to checkout.')
        return
      }

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        date: Timestamp.now(),
        items: cartItems,
        total: subtotal
      }

      let docRef
      if (role === 'company') {
        docRef = await addDoc(collection(db, 'orders'), orderData)
        alert('✅ Order placed successfully.')
      } else if (role === 'staff' || role === 'superadmin') {
        docRef = await addDoc(collection(db, 'receipts'), orderData)
        alert('✅ Receipt generated successfully.')
        setReceiptId(docRef.id)
        setShowReceipt(true)
      } else {
        alert('❌ Unknown role. Cannot process.')
        return
      }

      clearCart()
    } catch (err) {
      console.error('Checkout error:', err)
      alert('❌ Failed to process.')
    }
  }

  return (
    <div className='container my-4'>
      <h2 className='mb-4'>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table className='table table-bordered table-hover'>
            <thead className='table-dark'>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName || 'Unnamed Product'}</td>
                  <td>KES {Number(item.price).toLocaleString()}</td>
                  <td>{item.quantity || item.qty}</td>
                  <td>
                    KES{' '}
                    {(
                      Number(item.price) * Number(item.quantity || item.qty)
                    ).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className='btn btn-danger btn-sm'
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='d-flex justify-content-between align-items-center mt-4'>
            <h4>Subtotal: KES {subtotal.toLocaleString()}</h4>
            <div>
              <button className='btn btn-secondary me-2' onClick={clearCart}>
                Clear Cart
              </button>
              <button className='btn btn-primary' onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {showReceipt && role !== 'company' && (
        <ReceiptImage
          items={cartItems}
          total={subtotal}
          receiptId={receiptId}
          onDone={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}

export default Cart
