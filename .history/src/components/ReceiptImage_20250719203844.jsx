import React, { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()

  useEffect(() => {
    const timeout = setTimeout(() => {
      toPng(receiptRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true
      })
        .then(dataUrl => {
          download(dataUrl, `Receipt-${receiptId}.png`)
          if (onDone) onDone()
        })
        .catch(err => {
          console.error('Image download failed', err)
          alert('Receipt failed to generate.')
        })
    }, 500) // Give time for DOM to fully render

    return () => clearTimeout(timeout)
  }, [onDone, receiptId])

  return (
    <div
      ref={receiptRef}
      style={{
        width: '380px',
        padding: '20px',
        margin: '40px auto',
        backgroundColor: '#fff',
        color: '#000',
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        border: '1px solid #ccc',
        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
        🪷 Le Blossom Bar
      </h2>
      <p>
        Receipt ID: <strong>{receiptId}</strong>
      </p>
      <p>Date: {new Date().toLocaleString()}</p>
      <p>
        You were served by: <strong>Linzo</strong>
      </p>

      <hr />

      {items.map((item, i) => (
        <div
          key={i}
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
      <h3>Total: KES {total.toFixed(2)}</h3>
      <p
        style={{ textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}
      >
        Thank you for choosing Le Blossom Bar 🍷
      </p>
    </div>
  )
}

export default ReceiptImage
