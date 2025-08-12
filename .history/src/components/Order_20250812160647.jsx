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
  const [expandedOrderIds, setExpandedOrderIds] = useState([]) // track which orders are expanded

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid)
      } else {
        setUserId(null)
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

  const formatDate = timestamp => {
    if (!timestamp?.toDate) return t('na')
    const date = timestamp.toDate()
    return date.toLocaleString()
  }

  const toggleExpand = id => {
    setExpandedOrderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className='container py-5'>
      <h2
        className='mb-4 text-center'
        style={{ color: '#2c3e50', fontWeight: '700' }}
      >
        📦 {t('myOrders')}
      </h2>

      {orders.length === 0 ? (
        <div className='text-center text-muted fs-5'>{t('noOrders')}</div>
      ) : (
        <div className='table-responsive'>
          <table className='table table-striped table-hover align-middle'>
            <thead className='table-dark'>
              <tr>
                <th>{t('orderNumber')}</th>
                <th>{t('company')}</th>
                <th>{t('date')}</th>
                <th>{t('status')}</th>
                <th>{t('total')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td>{order.id.slice(0, 8)}</td>
                    <td>{order.companyName || t('na')}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.status || t('na')}</td>
                    <td>
                      {typeof order.total === 'number'
                        ? `KSh ${order.total.toLocaleString()}`
                        : t('na')}
                    </td>
                    <td>
                      <button
                        className='btn btn-sm btn-outline-primary'
                        onClick={() => toggleExpand(order.id)}
                        aria-expanded={expandedOrderIds.includes(order.id)}
                        aria-controls={`order-details-${order.id}`}
                      >
                        {expandedOrderIds.includes(order.id)
                          ? t('hideDetails')
                          : t('viewDetails')}
                      </button>
                    </td>
                  </tr>

                  {expandedOrderIds.includes(order.id) && (
                    <tr id={`order-details-${order.id}`}>
                      <td colSpan='6' className='p-0'>
                        <div className='p-3 bg-light border rounded'>
                          <table className='table table-bordered table-sm mb-0'>
                            <thead>
                              <tr>
                                <th>{t('productName')}</th>
                                <th>{t('barcode')}</th>
                                <th>{t('qty')}</th>
                                <th>{t('price')}</th>
                                <th>{t('subtotal')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items?.map((item, idx) => (
                                <tr key={idx}>
                                  <td>
                                    {item.productName || t('unnamedProduct')}
                                  </td>
                                  <td>{item.barcode || t('na')}</td>
                                  <td>{item.qty ?? 0}</td>
                                  <td>
                                    {item.price
                                      ? `KSh ${item.price.toLocaleString()}`
                                      : t('na')}
                                  </td>
                                  <td>
                                    {item.subtotal
                                      ? `KSh ${item.subtotal.toLocaleString()}`
                                      : t('na')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
