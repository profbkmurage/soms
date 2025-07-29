// components/ReceiptImage.jsx
import React, { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()

  useEffect(() => {
    // Wait a bit to ensure rendering before capturing
    const timer = setTimeout(() => {
      if (receiptRef.current) {
        toPng(receiptRef.current)
          .then(dataUrl => {
            download(dataUrl, `Receipt-LB-${receiptId}.png`)
            if (onDone) onDone()
          })
          .catch(err => {
            console.error('Failed to generate receipt image', err)
            alert('Image download failed.')
          })
      }
    }, 500) // Give time for DOM to render

    return () => clearTimeout(timer)
  }, [onDone, receiptId])

  return (
    <div
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        background: '#fff',
        padding: '20px',
        width: '380px',
        fontFamily: 'Courier New, monospace',
        color: '#000',
        border: '1px solid #ccc'
      }}
      ref={receiptRef}
    >
      <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>
        🪷 Le Blossom Bar
      </h4>
      <p style={{ fontSize: '0.9rem' }}>Receipt ID: {receiptId}</p>
      <p style={{ fontSize: '0.9rem' }}>Date: {new Date().toLocaleString()}</p>
      <p style={{ fontSize: '0.9rem' }}>
        You were served by: <strong>Linzo</strong>
      </p>

      <hr />

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: '4px',
            display: 'flex',
            justifyContent: 'space-between'
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
        style={{ marginTop: '20px', textAlign: 'center', fontStyle: 'italic' }}
      >
        Thank you for choosing Le Blossom Bar 🍷
      </p>
    </div>
  )
}

export default ReceiptImage
