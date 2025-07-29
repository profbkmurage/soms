import React, { useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()

  const handleDownload = () => {
    toPng(receiptRef.current, {
      cacheBust: true,
      backgroundColor: '#ffffff'
    })
      .then(dataUrl => {
        download(dataUrl, `Receipt-${receiptId}.png`)
        if (onDone) onDone()
      })
      .catch(err => {
        console.error('Receipt download failed', err)
        alert('Failed to download receipt')
      })
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        ref={receiptRef}
        style={{
          width: '380px',
          padding: '20px',
          margin: 'auto',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          border: '1px solid #ccc',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)'
        }}
      >
        <h2 style={{ marginBottom: '5px' }}>🪷 Le Blossom Bar</h2>
        <p>
          Receipt ID: <strong>{receiptId}</strong>
        </p>
        <p>Date: {new Date().toLocaleString()}</p>
        <p>
          You were served by: <strong>Linzo</strong>
        </p>

        <hr style={{ margin: '10px 0' }} />

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

        <hr style={{ margin: '10px 0' }} />

        <h3 style={{ marginBottom: '10px' }}>Total: KES {total.toFixed(2)}</h3>
        <p style={{ fontStyle: 'italic' }}>
          Thank you for choosing Le Blossom Bar 🍷
        </p>
      </div>

      <button
        onClick={handleDownload}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px'
        }}
      >
        📸 Download Receipt Image
      </button>
    </div>
  )
}

export default ReceiptImage
