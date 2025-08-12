import React, { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function SuperAdminOrders () {
  const [orders, setOrders] = useState([])
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const fetchAllOrders = async () => {
    try {
      const ordersRef = collection(db, 'orders')
      const snapshot = await getDocs(ordersRef)
      const ordersList = snapshot.docs.map(docSnap => {
        const data = docSnap.data()
        let formattedDate = 'N/A'
        if (data.date?.seconds) {
          formattedDate = new Date(data.date.seconds * 1000).toLocaleString()
        }
        return {
          id: docSnap.id,
          ...data,
          date: formattedDate,
          status: data.status || 'Pending'
        }
      })
      setOrders(ordersList)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const toggleStatus = async orderId => {
    try {
      setOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            let newStatus =
              order.status === 'Pending'
                ? 'Processing'
                : order.status === 'Processing'
                ? 'Delivered'
                : 'Pending'
            updateDoc(doc(db, 'orders', orderId), { status: newStatus })
            return { ...order, status: newStatus }
          }
          return order
        })
      )
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const toggleDetails = orderId => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId))
  }

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
        <table className='table table-bordered table-hover bg-white shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Order ID</th>
              <th>Company</th>
              <th>User Email</th>
              <th>Date</th>
              <th>Total (KSh)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                  <td>{order.id.slice(0, 8)}</td>
                  <td>{order.companyName || 'N/A'}</td>
                  <td>{order.userEmail || 'N/A'}</td>
                  <td>{order.date}</td>
                  <td>{order.total?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${
                        order.status === 'Pending'
                          ? 'btn-warning'
                          : order.status === 'Processing'
                          ? 'btn-info'
                          : 'btn-success'
                      }`}
                      onClick={() => toggleStatus(order.id)}
                    >
                      {order.status}
                    </button>
                  </td>
                  <td>
                    <button
                      className='btn btn-outline-primary btn-sm'
                      onClick={() => toggleDetails(order.id)}
                    >
                      {expandedOrder === order.id
                        ? 'Hide Details'
                        : 'View Details'}
                    </button>
                  </td>
                </tr>

                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan='7' className='bg-light'>
                      <div className='p-3'>
                        <p>
                          <strong>Order Number:</strong> {order.id}
                        </p>
                        <p>
                          <strong>Date:</strong> {order.date}
                        </p>
                        <p>
                          <strong>Company Name:</strong>{' '}
                          {order.companyName || 'N/A'}
                        </p>
                        <h6 className='fw-bold'>Items:</h6>
                        <ul className='list-unstyled'>
                          {order.items?.map((item, idx) => (
                            <li
                              key={idx}
                              className='d-flex justify-content-between border-bottom py-1'
                            >
                              <span>
                                {item.barcode ? `${item.barcode} - ` : ''}
                                {item.productName}
                              </span>
                              <span>
                                x{item.quantity} — KSh{' '}
                                {item.subtotal?.toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
