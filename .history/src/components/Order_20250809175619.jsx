import React from 'react'
import { useCart } from '../context/CartContext'
import { db, auth } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const Order = () => {
  const { cartItems, clearCart, companyName } = useCart()

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }

    try {
      await addDoc(collection(db, 'orders'), {
        companyName,
        items: cartItems,
        total: cartItems.reduce(
          (sum, item) => sum + item.sellingPrice * item.qty,
          0
        ),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser ? auth.currentUser.uid : null
      })

      alert('Order placed successfully!')
      clearCart()
    } catch (error) {
      console.error('Error placing order:', error)
    }
  }

  return (
    <div>
      <h2>Order Summary for {companyName}</h2>
      <ul>
        {cartItems.map(item => (
          <li key={item.productId}>
            {item.productName} - {item.qty} × KES {item.sellingPrice}
          </li>
        ))}
      </ul>
      <h3>
        Total: KES{' '}
        {cartItems.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0)}
      </h3>
      <button onClick={handlePlaceOrder}>Place Order</button>
    </div>
  )
}

export default Order
