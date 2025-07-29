import React, { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()

  useEffect(() => {
    const updateStock = async () => {
      try {
        for (let item of items) {
          const { productId, qty } = item
          if (!productId || !qty) continue

          // Update products collection (shopQty and storeQty)
          const productRef = doc(db, 'products', productId)
          const productSnap = await getDoc(productRef)

          if (productSnap.exists()) {
            const productData = productSnap.data()
            const updatedShopQty = (productData.shopQty || 0) - qty
            const updatedStoreQty = (productData.storeQty || 0) - qty

            await updateDoc(productRef, {
              shopQty: Math.max(updatedShopQty, 0),
              storeQty: Math.max(updatedStoreQty, 0)
            })
          }

          // Update referenceStocks collection (quantity)
          const refStockRef = doc(db, 'referenceStocks', productId)
          const refStockSnap = await getDoc(refStockRef)

          if (refStockSnap.exists()) {
            const refStockData = refStockSnap.data()
            const updatedQty = (refStockData.quantity || 0) - qty

            await updateDoc(refStockRef, {
              quantity: Math.max(updatedQty, 0)
            })
          }
        }

        console.log('✅ Stock updated successfully')
      } catch (error) {
        console.error('❌ Failed to update stock:', error)
      }
    }

    const captureAndUpdate = async () => {
      if (!receiptRef.current) return

      await updateStock() // Step 1: Update stock before downloading image

      toPng(receiptRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true
      })
        .then(dataUrl => {
          download(dataUrl, `Receipt-${receiptId}.png`)
          if (onDone) onDone() // Proceed only after successful update and capture
        })
        .catch(err => {
          console.error('Failed to generate receipt image:', err)
        })
    }

    const timeout = setTimeout(() => {
      requestAnimationFrame(captureAndUpdate)
    }, 500)

    return () => clearTimeout(timeout)
  }, [items, total, receiptId, onDone])

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
