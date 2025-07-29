// components/ReceiptImage.jsx
import React, { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!receiptRef.current) return

      toPng(receiptRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        pixelRatio: 2 // High-resolution image
      })
        .then(dataUrl => {
          download(dataUrl, `Receipt-${receiptId}.png`)
          if (onDone) onDone()
        })
        .catch(err => {
          console.error('Image download failed:', err)
          alert('Failed to download receipt. Please try again.')
        })
    }, 1000) // Give time for DOM to render

    return () => clearTimeout(timeout)
  }, [onDone, receiptId])

  return (
    <div className='text-center'>
      <div
        ref={receiptRef}
        style={{
          width: '380px',
          minHeight: '480px',
          padding: '20px',
          margin: '40px auto',
          backgroundColor: '#fff',
          color: '#000',
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          border: '1px solid #ccc',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
          textAlign: 'left'
        }}
      >
        <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>
          🪷 Le Blossom Bar
        </h4>
        <p>Receipt ID: <strong>{receiptId}</strong></p>
        <p>Date: {new Date().toLocaleString()}</p>
        <p>You were served by: <strong>Linzo</strong></p>

        <hr />

        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.productName} x{item.qty}</span>
            <span>KES {(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}

        <hr />
        <h5 style={{ textAlign: 'right' }}>Total: KES {total.toFixed(2)}</h5>

        <p style={{ marginTop: '20px', fontStyle: 'italic', textAlign: 'center' }}>
          Thank you for choosing Le Blossom Bar 🍷
        </p>
      </div>

      <button
        className='btn btn-primary mt-3'
        onClick={() => {
          // in case user wants to re-download manually
          if (receiptRef.current) {
            toPng(receiptRef.current, {
              backgroundColor: '#ffffff',
              cacheBust: true,
              pixelRatio: 2
            }).then(dataUrl => {
              download(dataUrl, `Receipt-${receiptId}.png`)
            })
          }
        }}
      >
        📸 Re-download Receipt Image
      </button>
    </div>
  )
}

export default ReceiptImage
