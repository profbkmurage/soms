import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function SuperAdminOrders () {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders')
        const snapshot = await getDocs(ordersRef)
        const ordersList = snapshot.docs.map(doc => {
          const data = doc.data()

          // Format Firestore Timestamp to readable date
          let formattedDate = 'N/A'
          if (data.date?.seconds) {
            formattedDate = new Date(data.date.seconds * 1000).toLocaleString()
          }

          return {
            id: doc.id,
            ...data,
            date: formattedDate
          }
        })
        setOrders(ordersList)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    fetchAllOrders()
  }, [])

  return (
    <div
      className='container py-5'
      style={{ background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)' }}
    >
      <h2
        className='text-center mb-4'
        style={{ color: '#2c3e50', fontWeight: '700' }}
      >
        All Orders (Super Admin)
      </h2>
      {orders.length === 0 ? (
        <div className='text-center text-muted fs-5'>No orders found.</div>
      ) : (
        <div className='row g-4'>
          {orders.map(order => (
            <div key={order.id} className='col-md-6 col-lg-4'>
              <div
                className='card shadow-lg border-0 h-100'
                style={{
                  borderRadius: '15px',
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)'
                }}
              >
                <div className='card-body'>
                  <h5
                    className='card-title fw-bold'
                    style={{ color: '#007bff' }}
                  >
                    Order #{order.id.slice(0, 8)}
                  </h5>
                  <p className='mb-1'>
                    <strong>Company:</strong> {order.companyName || 'N/A'}
                  </p>
                  <p className='mb-1'>
                    <strong>User Email:</strong> {order.userEmail || 'N/A'}
                  </p>
                  <p className='mb-1'>
                    <strong>User ID:</strong> {order.userId || 'N/A'}
                  </p>
                  <p className='mb-3 text-muted'>
                    <strong>Date:</strong> {order.date}
                  </p>
                  <h6 className='fw-bold' style={{ color: '#28a745' }}>
                    Items:
                  </h6>
                  <ul className='list-unstyled'>
                    {order.items?.map((item, index) => (
                      <li
                        key={index}
                        className='d-flex justify-content-between border-bottom py-1'
                      >
                        <span>{item.barcod
}</span>
                        <span>{item.productName}</span>
                        <span className='text-muted'>x{item.qty}</span>
                      </li>
                    ))}
                  </ul>
                  <div className='mt-3'>
                    <span className='badge bg-primary p-2'>
                      Total:{' '}
                      {order.total
                        ? `KSh ${order.total.toLocaleString()}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className='card-footer bg-transparent border-0 text-end'>
                  <button className='btn btn-outline-primary btn-sm'>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
