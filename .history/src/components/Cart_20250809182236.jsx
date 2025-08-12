import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import ReceiptImage from './ReceiptImage'
import { db, auth } from '../firebase/config'
import { setDoc, doc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart()
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptId, setReceiptId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  // Listen for logged-in user
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        setCurrentUser({ uid: user.uid, ...userDoc.data() })
      } else {
        setCurrentUser(null)
      }
    })
    return () => unsub()
  }, [])

  const total = cartItems.reduce((sum, item) => {
    const price = item?.price || 0
    const qty = item?.qty || 0
    return sum + price * qty
  }, 0)

  const handleCheckout = async () => {
    if (!currentUser) {
      alert("You must be logged in.")
      return
    }

    // Generate ID based on user type
    const isCompany = currentUser.role === "company"
    const id = isCompany ? `ORD-${Date.now()}` : `LB-${Date.now()}`
    setReceiptId(id)

    if (isCompany) {
      await saveOrderToFirestore(id)
    } else {
      // Show receipt preview for sales
      setShowReceipt(true)
    }
  }

  // Save sale receipt + subtract stock
  const saveReceiptToFirestore = async () => {
    if (!receiptId || cartItems.length === 0) return

    const receiptData = {
      items: cartItems.map(item => ({
        productId: item.productId || item.id,
        productName: item.productName,
        barcode: item.barcode || '',
        qty: item.qty,
        price: item.price
      })),
      total,
      createdAt: serverTimestamp(),
      servedBy: currentUser?.displayName || 'Unknown'
    }

    try {
      await setDoc(doc(db, 'receipts', receiptId), receiptData)

      // Subtract from stock
      for (let item of cartItems) {
        const productRef = doc(db, "products", item.productId || item.id)
        const productSnap = await getDoc(productRef)
        if (productSnap.exists()) {
          const { shopQty = 0, storeQty = 0 } = productSnap.data()
          let remainingShop = shopQty
          let remainingStore = storeQty
          let qtyToSubtract = item.qty

          // Subtract from shop first
          if (qtyToSubtract <= shopQty) {
            remainingShop -= qtyToSubtract
          } else {
            qtyToSubtract -= shopQty
            remainingShop = 0
            remainingStore -= qtyToSubtract
          }

          await updateDoc(productRef, {
            shopQty: remainingShop,
            storeQty: remainingStore
          })
        }
      }

      console.log(`Receipt ${receiptId} saved to Firestore`)
    } catch (error) {
      console.error('Failed to save receipt:', error)
    }
  }

  // Save company order (no stock subtraction)
  const saveOrderToFirestore = async (orderId) => {
    const orderData = {
      orderNumber: orderId,
      companyId: currentUser.uid,
      companyName: currentUser.companyName || currentUser.displayName || 'Unknown Company',
      items: cartItems.map(item => ({
        productId: item.productId || item.id,
        productName: item.productName,
        barcode: item.barcode || '',
        qty: item.qty,
        price: item.price
      })),
      total,
      createdAt: serverTimestamp(),
      status: "pending"
    }

    try {
      await setDoc(doc(db, 'orders', orderId), orderData)
      console.log(`Order ${orderId} saved to Firestore`)
      clearCart()
      alert(`Order ${orderId} submitted successfully!`)
    } catch (error) {
      console.error('Failed to save order:', error)
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
            alert(`Receipt ${receiptId} saved!`)
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
          <div className='table-responsive'>
            <table className='table table-bordered table-hover mt-3'>
              <thead className='table-dark'>
                <tr>
                  <th>Barcode</th>
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
                    <td>{item.barcode || '—'}</td>
                    <td>{item.productName}</td>
                    <td>{item.qty}</td>
                    <td>KES {Number(item.price).toFixed(2)}</td>
                    <td>KES {(item.price * item.qty).toFixed(2)}</td>
                    <td>
                      <button
                        className='btn btn-sm btn-outline-danger'
                        onClick={() =>
                          removeFromCart(item.productId || item.id)
                        }
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='text-end mt-3'>
            <h4 className='fw-bold'>Total: KES {total.toFixed(2)}</h4>
          </div>

          <div className='d-flex justify-content-end gap-3 mt-4'>
            <button className='btn btn-outline-warning' onClick={clearCart}>
              Clear Cart
            </button>
            <button className='btn btn-success' onClick={handleCheckout}>
              {currentUser?.role === "company" ? "Submit Order" : "Generate Receipt"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
