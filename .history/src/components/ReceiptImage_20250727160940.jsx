import React, { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { db } from '../firebase/config'
import {
  getDoc,
  doc,
  updateDoc,
  collection,
  increment
} from 'firebase/firestore'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()

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
  }, [onDone, receiptId])

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

        // Update products
        await updateDoc(productRef, {
          shopQty: newShopQty,
          storeQty: newStoreQty,
          totalQty: totalQty
        })

        // Update referenceStocks
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
          padding: '20px',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          border: '5px solid red',
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          textAlign: 'left',
          overflow: 'visible'
        }}
      >
        <h4 style={{ textAlign: 'center' }}>🪷 Le Blossom Bar</h4>
        <p>
          Receipt ID: <strong>{receiptId}</strong>
        </p>
        <p>Date: {new Date().toLocaleString()}</p>
        <p>
          You were served by: <strong>Linzo</strong>
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
            <span>
              {item.productName} x{item.qty}
            </span>
            <span>KES {(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}

        <hr />
        <h5 style={{ textAlign: 'right' }}>Total: KES {total.toFixed(2)}</h5>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontStyle: 'italic'
          }}
        >
          Thank you for choosing Le Blossom Bar
        </p>
      </div>
    </div>
  )
}

export default ReceiptImage
