import React, { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { db, auth } from '../firebase/config'
import { getDoc, doc, updateDoc, increment } from 'firebase/firestore'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Get the logged-in user
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user.displayName || user.email)
      } else {
        setCurrentUser('Unknown')
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const capture = () => {
      if (!receiptRef.current) return

      toPng(receiptRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true
      })
        .then(async dataUrl => {
          download(dataUrl, `Receipt-${receiptId}.png`)
          const success = await updateStockLevels(items)
          if (success && onDone) onDone()
        })
        .catch(err => {
          console.error('Failed to generate receipt image:', err)
        })
    }

    const timeout = setTimeout(() => {
      requestAnimationFrame(capture)
    }, 500)

    return () => clearTimeout(timeout)
  }, [items, onDone, receiptId])

  const updateStockLevels = async items => {
    try {
      for (const item of items) {
        const productRef = doc(db, 'products', item.productId)
        const refStockRef = doc(db, 'referenceStocks', item.productId)

        const productSnap = await getDoc(productRef)
        if (!productSnap.exists()) continue

        const product = productSnap.data()
        let { shopQty, storeQty } = product
        const purchaseQty = item.qty

        if (purchaseQty > shopQty + storeQty) {
          alert(
            `Insufficient stock for "${item.productName}". Available: ${
              shopQty + storeQty
            }, Requested: ${purchaseQty}`
          )
          return false
        }

        let newShopQty = shopQty
        let newStoreQty = storeQty

        if (purchaseQty <= shopQty) {
          newShopQty -= purchaseQty
        } else {
          const remaining = purchaseQty - shopQty
          newShopQty = 0
          newStoreQty -= remaining
        }

        const totalQty = newShopQty + newStoreQty

        await updateDoc(productRef, {
          shopQty: newShopQty,
          storeQty: newStoreQty,
          totalQty
        })

        await updateDoc(refStockRef, {
          quantity: increment(-purchaseQty)
        })
      }
      return true
    } catch (err) {
      console.error('Stock update error:', err)
      alert('Failed to update product stock. Please try again.')
      return false
    }
  }

  return (
    <div className='d-flex justify-content-center mt-5'>
      <div
        ref={receiptRef}
        style={{
          width: '380px',
          minHeight: '480px',
          padding: '16px',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          border: '5px solid red',
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          textAlign: 'left',
          overflow: 'visible'
        }}
      >
        <h4 style={{ textAlign: 'center', fontSize: '14px' }}>
          China Garden Supermarket
        </h4>
        <p>
          Receipt ID: <strong>{receiptId}</strong>
        </p>
        <p>Date: {new Date().toLocaleString()}</p>
        <p>
          Processed by: <strong>{currentUser || '...'}</strong>
        </p>
        <hr />

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}
          >
            <span style={{ flex: 1 }}>
              {item.barcode} | {item.productName} x{item.qty}
            </span>
            <span>KES {(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}

        <hr />
        <h5 style={{ textAlign: 'right', fontSize: '13px' }}>
          Total: KES {total.toFixed(2)}
        </h5>

        <p
          style={{
            textAlign: 'center',
            marginTop: '16px',
            fontStyle: 'italic'
          }}
        >
          Thank you for choosing China Garden
        </p>
      </div>
    </div>
  )
}

export default ReceiptImage
