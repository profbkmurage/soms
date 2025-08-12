import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { FaTrash } from 'react-icons/fa'
import { db, auth } from '../firebase/config'
import { collection, addDoc, getDoc, doc, Timestamp } from 'firebase/firestore'
import ReceiptImage from './ReceiptImage'

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart()
  const [role, setRole] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptId, setReceiptId] = useState(null)
  const [receiptPayload, setReceiptPayload] = useState(null) // { items, total }

  // compute subtotal
  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity ?? item.qty) || 0
    return total + price * qty
  }, 0)

  // Fetch user role and company name on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (!user) return
      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          const data = snap.data()
          setRole(data.role) // e.g., "company", "staff", "superadmin"
          setCompanyName(data.companyName || '')
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      }
    }
    fetchUserData()
  }, [])

  // Format cart items into canonical shape for Firestore and receipt
  const createFormattedItems = () =>
    cartItems.map(item => {
      const qty = Number(item.quantity ?? item.qty) || 0
      const price = Number(item.price) || 0
      return {
        productId: item.productId || '', // used for stock updates
        barcode: item.barcode || 'N/A',
        productName: item.productName || item.name || 'Unnamed Product',
        qty,
        price,
        subtotal: price * qty
      }
    })

  const handleCheckout = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        alert('You must be logged in to checkout.')
        return
      }

      // If cart empty, block
      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty.')
        return
      }

      const formattedItems = createFormattedItems()

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        companyName: companyName || 'N/A',
        companyEmail: user.email,
        date: Timestamp.now(),
        items: formattedItems,
        total: subtotal,
        status: 'Pending' // default for orders/receipts
      }

      let docRef
      if (role === 'company') {
        // Save to orders collection for companies
        docRef = await addDoc(collection(db, 'orders'), orderData)
        alert('Order placed successfully.')
        // clear cart immediately for company orders
        clearCart()
      } else if (role === 'staff' || role === 'superadmin') {
        // Save to receipts collection for staff/superadmin
        docRef = await addDoc(collection(db, 'receipts'), orderData)
        alert('Receipt generated successfully.')
        setReceiptId(docRef.id)

        // Pass a snapshot of the items and total to the ReceiptImage so it won't be empty
        setReceiptPayload({
          items: formattedItems,
          total: subtotal,
          meta: {
            receiptId: docRef.id,
            createdBy: user.uid,
            companyName: companyName || 'N/A',
            userEmail: user.email
          }
        })

        setShowReceipt(true)
        // NOTE: do NOT clear cart here. Wait until receipt generation finishes (onDone).
      } else {
        // If role missing or unexpected, show error (but staff/superadmin allowed above)
        alert('Unknown role. Cannot process.')
        return
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Failed to process. Check console for details.')
    }
  }

  // onDone callback passed to ReceiptImage
  const handleReceiptDone = () => {
    // Clear cart after receipt has been generated and stock updated
    clearCart()
    setShowReceipt(false)
    setReceiptPayload(null)
    setReceiptId(null)
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
                <th>Barcode</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => {
                const qty = Number(item.quantity ?? item.qty) || 0
                const sub = (Number(item.price) || 0) * qty
                return (
                  <tr key={index}>
                    <td>{item.barcode || 'N/A'}</td>
                    <td>{item.productName || 'Unnamed Product'}</td>
                    <td>KES {Number(item.price).toLocaleString()}</td>
                    <td>{qty}</td>
                    <td>KES {sub.toLocaleString()}</td>
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
            <h4>Total: KES {subtotal.toLocaleString()}</h4>
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
