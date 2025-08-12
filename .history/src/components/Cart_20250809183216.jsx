import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { auth, db } from '../firebase/config'
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const Cart = () => {
  const { cartItems, clearCart } = useCart()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔹 Listen for auth changes and fetch role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (currentUser) {
        setUser(currentUser)
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setRole(userSnap.data().role || '')
        }
      } else {
        setUser(null)
        setRole('')
      }
    })
    return () => unsubscribe()
  }, [])

  // 🛒 Handle Checkout (Company = order, Staff = sale)
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty')
      return
    }

    setLoading(true)
    try {
      if (role === 'company') {
        // 🔹 Create an Order (no stock subtraction)
        await addDoc(collection(db, 'orders'), {
          companyId: user.uid,
          companyEmail: user.email,
          items: cartItems,
          status: 'pending', // you can change to processing, shipped, etc.
          createdAt: serverTimestamp()
        })
        alert('Order request sent successfully ✅')
        clearCart()
      } else {
        // 🔹 Store Staff logic (Generate receipt + subtract stock)
        // You will place your existing receipt/sales code here
        // Example:
        /*
        await generateReceiptAndSubtractStock(cartItems, user);
        */
        alert('Sale completed and stock updated ✅')
        clearCart()
      }
    } catch (error) {
      console.error('Error processing checkout:', error)
      alert('Error processing checkout ❌')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <ul>
            {cartItems.map(item => (
              <li key={item.productId}>
                {item.name} - {item.qty}
              </li>
            ))}
          </ul>
          <button onClick={handleCheckout} disabled={loading}>
            {loading
              ? 'Processing...'
              : role === 'company'
              ? 'Place Order'
              : 'Complete Sale'}
          </button>
        </>
      )}
    </div>
  )
}

export default Cart
