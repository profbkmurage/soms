import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useTranslation } from 'react-i18next'

export default function Orders () {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return
      const ordersRef = collection(db, 'orders')
      const snapshot = await getDocs(ordersRef)
      const ordersList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(order => order.userId === userId)
      setOrders(ordersList)
    }

    fetchOrders()
  }, [userId])

  return (
    <div
      className='container py-5'
      style={{ background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)' }}
    >
      <h2
        className='text-center mb-4'
        style={{ color: '#2c3e50', fontWeight: '700' }}
      >
        📦 {t('myOrders')}
      </h2>
      {orders.length === 0 ? (
        <div className='text-center text-muted fs-5'>{t('noOrders')}</div>
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
                    {t('orderNumber', { id: order.id.slice(0, 8) })}
                  </h5>
                  <p className='mb-1'>
                    <strong>{t('company')}:</strong>{' '}
                    {order.companyName || t('na')}
                  </p>
                  <p className='mb-3 text-muted'>
                    <strong>{t('date')}:</strong> {order.date || t('na')}
                  </p>
                  <h6 className='fw-bold' style={{ color: '#28a745' }}>
                    {t('items')}:
                  </h6>
                  <ul className='list-unstyled'>
                    {order.items?.map((item, index) => (
                      <li
                        key={index}
                        className='d-flex justify-content-between border-bottom py-1'
                      >
                        <span>{item.name}</span>
                        <span className='text-muted'>
                          {t('quantityPrefix', { qty: item.qty })}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className='mt-3'>
                    <span className='badge bg-primary p-2'>
                      {t('total')}:{' '}
                      {order.totalPrice
                        ? `KSh ${order.totalPrice.toLocaleString()}`
                        : t('na')}
                    </span>
                  </div>
                </div>
                <div className='card-footer bg-transparent border-0 text-end'>
                  <button className='btn btn-outline-primary btn-sm'>
                    {t('viewDetails')}
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
