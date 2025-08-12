import React, { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { db, auth } from '../firebase/config'
import { getDoc, doc, updateDoc, increment } from 'firebase/firestore'

const ReceiptImage = ({ items = [], total = 0, receiptId, meta = {}, onDone }) => {
  const receiptRef = useRef()
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generatedOnce, setGeneratedOnce] = useState(false) // prevent double runs

  // Get logged-in user displayName/email and role (for display)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (!user) {
        setCurrentUser('Unknown')
        setUserRole(null)
        return
      }
      setCurrentUser(user.displayName || user.email || user.uid)

      // fetch role from users collection (non-blocking)
      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          setUserRole(snap.data().role || null)
        } else {
          setUserRole(null)
        }
      } catch (err) {
        console.error('Failed to fetch user role:', err)
      }
    })
    return () => unsub()
  }, [])

  // Wait for items to be present, then generate image once.
  useEffect(() => {
    if (!items || items.length === 0) return
    if (generating || generatedOnce) return

    const capture = async () => {
      setGenerating(true)
      try {
        // give the DOM a brief moment to render properly
        await new Promise(r => setTimeout(r, 120))
        if (!receiptRef.current) throw new Error('Receipt element missing')

        const dataUrl = await toPng(receiptRef.current, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          cacheBust: true
        })

        // trigger download
        download(dataUrl, `Receipt-${receiptId || Date.now()}.png`)

        // update stock AFTER successful download
        const success = await updateStockLevels(items)
        if (success) {
          // optionally, you can update the receipt document to mark processed
          if (receiptId) {
            try {
              const receiptRefDoc = doc(db, 'receipts', receiptId)
              await updateDoc(receiptRefDoc, {
                processedAt: new Date(),
                processedBy: auth.currentUser ? auth.currentUser.uid : null
              })
            } catch (err) {
              // not fatal
              console.warn('Could not mark receipt processed:', err)
            }
          }
          setGeneratedOnce(true)
          if (onDone) onDone()
        } else {
          alert('Receipt created but stock update failed. Please check inventory.')
        }
      } catch (err) {
        console.error('Failed to generate receipt image:', err)
        alert('Failed to generate receipt image. See console for details.')
      } finally {
        setGenerating(false)
      }
    }

    capture()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // Stock update logic: subtract from product's shopQty/storeQty and decrement referenceStock
  const updateStockLevels = async itemsToUpdate => {
    try {
      for (const item of itemsToUpdate) {
        if (!item.productId) {
          // skip items without productId (can't update stock)
          console.warn('Skipping stock update for item without productId:', item)
          continue
        }

        const productRef = doc(db, 'products', item.productId)
        const refStockRef = doc(db, 'referenceStocks', item.productId)

        const productSnap = await getDoc(productRef)
        if (!productSnap.exists()) {
          console.warn('Product doc not found for', item.productId)
          continue
        }
        const product = productSnap.data()
        let shopQty = Number(product.shopQty || 0)
        let storeQty = Number(product.storeQty || 0)
        const purchaseQty = Number(item.qty || item.quantity || 0)

        const available = shopQty + storeQty
        if (purchaseQty > available) {
          alert(
            `Insufficient stock for "${item.productName}". Available: ${available}, Requested: ${purchaseQty}`
          )
          return false
        }

        // subtract from shop first, then store
        if (purchaseQty <= shopQty) {
          shopQty = shopQty - purchaseQty
        } else {
          const remaining = purchaseQty - shopQty
          shopQty = 0
          storeQty = storeQty - remaining
        }

        const totalQty = shopQty + storeQty

        // update product doc
        await updateDoc(productRef, {
          shopQty,
          storeQty,
          totalQty
        })

        // update referenceStocks quantity (decrement)
        try {
          await updateDoc(refStockRef, {
            quantity: increment(-purchaseQty)
          })
        } catch (err) {
          // if referenceStocks doc missing / can't update, warn but continue
          console.warn('Failed to update referenceStocks for', item.productId, err)
        }
      }
      return true
    } catch (err) {
      console.error('Stock update error:', err)
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
          textAlign: 'left'
        }}
      >
        <h4 style={{ textAlign: 'center', fontSize: '14px' }}>
          China Garden Supermarket
        </h4>

        <p>
          Receipt ID: <strong>{receiptId || 'N/A'}</strong>
        </p>

        <p>
          Date: <strong>{new Date().toLocaleString()}</strong>
        </p>

        <p>
          Processed by: <strong>{currentUser || '...'}</strong>
          {userRole ? ` (${userRole})` : ''}
        </p>

        {meta?.companyName && (
          <p>
            Company: <strong>{meta.companyName}</strong>
          </p>
        )}

        <hr />

        {items && items.length > 0 ? (
          items.map((item, index) => (
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
              <span>KES {(Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}</span>
            </div>
          ))
        ) : (
          <p>No products found in receipt.</p>
        )}

        <hr />
        <h5 style={{ textAlign: 'right', fontSize: '13px' }}>
          Total: KES {Number(total || 0).toFixed(2)}
        </h5>

        <p style={{ textAlign: 'center', marginTop: '16px', fontStyle: 'italic' }}>
          Thank you for choosing China Garden
        </p>
      </div>
    </div>
  )
}

export default ReceiptImage
