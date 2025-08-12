import React, { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { db, auth } from '../firebase/config'
import { getDoc, doc, updateDoc, increment } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'

const ReceiptImage = ({
  items = [],
  total = 0,
  receiptId,
  meta = {},
  onDone
}) => {
  const { t } = useTranslation()
  const receiptRef = useRef()
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generatedOnce, setGeneratedOnce] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (!user) {
        setCurrentUser(t('unknownUser'))
        setUserRole(null)
        return
      }
      setCurrentUser(user.displayName || user.email || user.uid)
      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          setUserRole(snap.data().role || null)
        } else {
          setUserRole(null)
        }
      } catch (err) {
        console.error(t('fetchUserRoleError'), err)
      }
    })
    return () => unsub()
  }, [t])

  useEffect(() => {
    if (!items || items.length === 0) return
    if (generating || generatedOnce) return

    const capture = async () => {
      setGenerating(true)
      try {
        await new Promise(r => setTimeout(r, 120))
        if (!receiptRef.current) throw new Error(t('receiptElementMissing'))

        const dataUrl = await toPng(receiptRef.current, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          cacheBust: true
        })

        download(
          dataUrl,
          `${t('receiptFilename')}-${receiptId || Date.now()}.png`
        )

        const success = await updateStockLevels(items)
        if (success) {
          if (receiptId) {
            try {
              const receiptRefDoc = doc(db, 'receipts', receiptId)
              await updateDoc(receiptRefDoc, {
                processedAt: new Date(),
                processedBy: auth.currentUser ? auth.currentUser.uid : null
              })
            } catch (err) {
              console.warn(t('receiptProcessedMarkFailed'), err)
            }
          }
          setGeneratedOnce(true)
          if (onDone) onDone()
        } else {
          alert(t('stockUpdateFailed'))
        }
      } catch (err) {
        console.error(t('receiptImageGenFailed'), err)
        alert(t('receiptImageGenFailedAlert'))
      } finally {
        setGenerating(false)
      }
    }

    capture()
  }, [items, generating, generatedOnce, onDone, receiptId, t, updateStockLevels])

  const updateStockLevels = async itemsToUpdate => {
    try {
      for (const item of itemsToUpdate) {
        if (!item.productId) {
          console.warn(t('skipStockUpdateNoProductId'), item)
          continue
        }

        const productRef = doc(db, 'products', item.productId)
        const refStockRef = doc(db, 'referenceStocks', item.productId)

        const productSnap = await getDoc(productRef)
        if (!productSnap.exists()) {
          console.warn(t('productDocNotFound'), item.productId)
          continue
        }
        const product = productSnap.data()
        let shopQty = Number(product.shopQty || 0)
        let storeQty = Number(product.storeQty || 0)
        const purchaseQty = Number(item.qty || item.quantity || 0)

        const available = shopQty + storeQty
        if (purchaseQty > available) {
          alert(
            t('insufficientStock', {
              productName: item.productName,
              available,
              requested: purchaseQty
            })
          )
          return false
        }

        if (purchaseQty <= shopQty) {
          shopQty -= purchaseQty
        } else {
          const remaining = purchaseQty - shopQty
          shopQty = 0
          storeQty -= remaining
        }

        const totalQty = shopQty + storeQty

        await updateDoc(productRef, {
          shopQty,
          storeQty,
          totalQty
        })

        try {
          await updateDoc(refStockRef, {
            quantity: increment(-purchaseQty)
          })
        } catch (err) {
          console.warn(t('refStockUpdateFailed'), item.productId, err)
        }
      }
      return true
    } catch (err) {
      console.error(t('stockUpdateError'), err)
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
          {t('companyName')}
        </h4>

        <p>
          {t('receiptId')}: <strong>{receiptId || 'N/A'}</strong>
        </p>

        <p>
          {t('date')}: <strong>{new Date().toLocaleString()}</strong>
        </p>

        <p>
          {t('processedBy')}: <strong>{currentUser || '...'}</strong>
          {userRole ? ` (${userRole})` : ''}
        </p>

        {meta?.companyName && (
          <p>
            {t('company')}: <strong>{meta.companyName}</strong>
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
              <span>
                KES{' '}
                {(Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}
              </span>
            </div>
          ))
        ) : (
          <p>{t('noProductsFound')}</p>
        )}

        <hr />
        <h5 style={{ textAlign: 'right', fontSize: '13px' }}>
          {t('total')}: KES {Number(total || 0).toFixed(2)}
        </h5>

        <p
          style={{
            textAlign: 'center',
            marginTop: '16px',
            fontStyle: 'italic'
          }}
        >
          {t('thankYou')}
        </p>
      </div>
    </div>
  )
}

export default ReceiptImage
