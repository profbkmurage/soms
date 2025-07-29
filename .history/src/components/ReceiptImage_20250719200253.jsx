// components/ReceiptImage.jsx
import React, { useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'

const ReceiptImage = ({ items, total, receiptId, onDone }) => {
  const receiptRef = useRef()

  const handleDownload = () => {
    if (!receiptRef.current) return

    toPng(receiptRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })
      .then(dataUrl => {
        download(dataUrl, `Receipt-${receiptId}.png`)
        if (onDone) onDone()
      })
      .catch(err => {
        console.error('Receipt download failed', err)
        alert('Failed to download receipt')
      })
  }

  if (!items || items.length === 0) {
    return <p className='text-center'>No items to generate receipt.</p>
  }

  return (
    <div className='text-center'>
      <div
        ref={receiptRef}
        style={{
          width: '380px',
          padding: '20px',
          margin: 'auto',
          backgroun: '#ffffff',
          color: '#000',
          fontFamily: 'Courier New, monospace',
          border: '1px solid #ccc',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}
      >
        <h4 style={{ marginBottom: '10px' }}>🪷 Le Blossom Bar</h4>
        <p style={{ fontSize: '0.9rem' }}>Receipt ID: {receiptId}</p>
        <p style={{ fontSize: '0.9rem' }}>
          Date: {new Date().toLocaleString()}
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          You were served by: <strong>Linzo</strong>
        </p>

        <hr />

        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {item.productName} x{item.qty}
              </span>
              <span>KES {(item.price * item.qty).toFixed(2)}</span>
            </div>
          </div>
        ))}

        <hr />
        <h5>Total: KES {total.toFixed(2)}</h5>

        <p style={{ marginTop: '20px', fontStyle: 'italic' }}>
          Thank you for choosing Le Blossom Bar 🍷
        </p>
      </div>

      <button className='btn btn-primary mt-3' onClick={handleDownload}>
        📸 Download Receipt Image
      </button>
    </div>
  )
}

export default ReceiptImage
