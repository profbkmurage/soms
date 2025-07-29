import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import ReceiptImage from './ReceiptImage'
import { db } from '../firebase/config'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart()
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptId, setReceiptId] = useState(null)

  const total = cartItems.reduce((sum, item) => {
    const price = item?.price || 0
    const qty = item?.qty || 0
    return sum + price * qty
  }, 0)

  // const handleGenerateReceipt = async () => {
  //   const id = `LB-${Date.now()}`
  //   setReceiptId(id)
  //   setShowReceipt(true)
  // }

  const saveReceiptToFirestore = async () => {
    if (!receiptId || cartItems.length === 0) {
      console.error('Missing receipt ID or cart items.')
      return
    }

    const receiptData = {
      items: cartItems.map(item => ({
        productId: item.productId || item.id, // Ensure this exists
        productName: item.productName,
        qty: item.qty,
        price: item.price
      })),
      total,
      createdAt: serverTimestamp(),
      servedBy: 'Linzo'
    }

    try {
      await setDoc(doc(db, 'receipts', receiptId), receiptData)
      console.log(`✅ Receipt ${receiptId} saved to Firestore`)
    } catch (error) {
      console.error('❌ Failed to save receipt:', error)
    }
  }

  if (showReceipt) {
    return (
      <div className='container mt-4'>
        <h3>Receipt Preview</h3>
        <ReceiptImage
          items={cartItems}
          total={total}
          receiptId={receiptId}
          onDone={async () => {
            await saveReceiptToFirestore()
            clearCart()
            setShowReceipt(false)
            alert(`✅ Receipt ${receiptId} saved!`)
          }}
        />
      </div>
    )
  }

  return (
    <div className='container mt-4'>
      <h3>Cart Summary</h3>

      {cartItems.length === 0 ? (
        <div className='alert alert-info'>
          Your cart is empty. Go grab a drink!
        </div>
      ) : (
        <>
          <table className='table table-bordered table-hover mt-3'>
            <thead className='table-dark'>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.qty}</td>
                  <td>KES {Number(item.price).toFixed(2)}</td>
                  <td>KES {(item.price * item.qty).toFixed(2)}</td>
                  <td>
                    <button
                      className='btn btn-sm btn-outline-danger'
                      onClick={() => removeFromCart(item.productId || item.id)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='text-end mt-3'>
            <h4 className='fw-bold'>Total: KES {total.toFixed(2)}</h4>
          </div>

          <div className='d-flex justify-content-end gap-3 mt-4'>
            <button className='btn btn-outline-warning' onClick={clearCart}>
              Clear Cart
            </button>
            <button className='btn btn-success' onClick={handleGenerateReceipt}>
              Generate Receipt
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
