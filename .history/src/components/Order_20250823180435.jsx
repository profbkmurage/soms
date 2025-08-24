import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { useTranslation } from 'react-i18next'
import 'bootstrap/dist/css/bootstrap.min.css'

const Order = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [expandedOrderIds, setExpandedOrderIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) setUserEmail(user.email)
      else {
        setUserEmail(null)
        setOrders([])
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userEmail) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const q = query(
          collection(db, 'orders'),
          where('companyEmail', '==', userEmail)
        )
        const snapshot = await getDocs(q)
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        fetched.sort((a, b) => {
          const ta = a.date?.toDate ? a.date.toDate().getTime() : 0
          const tb = b.date?.toDate ? b.date.toDate().getTime() : 0
          return tb - ta
        })
        setOrders(fetched)
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [userEmail])

  const toggleExpand = orderId => {
    setExpandedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const formatDate = timestamp => {
    if (!timestamp) return t('na')
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString()
    }
    try {
      const d = new Date(timestamp)
      if (!isNaN(d)) return d.toLocaleString()
    } catch (e) {
      console.error('Date parse failed', e)
    }
    return t('na')
  }

  const formatCurrency = num => {
    if (num === undefined || num === null) return t('na')
    const n = Number(num)
    if (isNaN(n)) return t('na')
    return `KSh ${n.toLocaleString()}`
  }

  const formatStatusForDisplay = rawStatus => {
    if (!rawStatus) return t('na')
    const cleaned = rawStatus.replace(/^status/i, '').trim()
    const key = cleaned.toLowerCase()
    const knownKeys = [
      'pending',
      'delivered',
      'cancelled',
      'completed',
      'processing'
    ]
    if (knownKeys.includes(key)) {
      const translated = t(key)
      if (translated && translated !== key) return translated
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
  }

  if (loading) {
    return <div className='container mt-4 text-center'>{t('loading')}...</div>
  }

  if (!orders.length) {
    return (
      <div className='container mt-4 text-center'>{t('noOrdersFound')}</div>
    )
  }

  return (
    <div className='container-fluid mt-4'>
      <h2 className='mb-3 text-center'>{t('ordersTitle')}</h2>

      <div className='table-responsive'>
        <table className='table table-bordered table-hover align-middle'>
          <thead className='table-light'>
            <tr>
              <th style={{ minWidth: 140 }}>{t('orderNumber')}</th>
              <th>{t('companyName')}</th>
              <th>{t('companyEmail')}</th>
              <th style={{ minWidth: 160 }}>{t('orderDate')}</th>
              <th>{t('orderStatus')}</th>
              <th>{t('total')}</th>
              <th style={{ minWidth: 120 }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                  <td
                    title={order.id}
                    className='text-truncate'
                    style={{
                      maxWidth: '200px'
                    }}
                  >
                    {order.id}
                  </td>
                  <td className='text-wrap'>{order.companyName || t('na')}</td>
                  <td className='text-wrap'>{order.companyEmail || t('na')}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>{formatStatusForDisplay(order.status)}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <button
                      className='btn btn-primary btn-sm w-100 w-md-auto'
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
                    <td colSpan='7' className='p-3 bg-light'>
                      <div className='fw-bold mb-2'>{t('orderItems')}</div>
                      <div className='table-responsive'>
                        <table className='table table-sm table-bordered mb-0'>
                          <thead className='table-secondary'>
                            <tr>
                              <th>{t('productName')}</th>
                              <th>{t('barcode')}</th>
                              <th>{t('qty')}</th>
                              <th>{t('price')}</th>
                              <th>{t('subtotal')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.length ? (
                              order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className='text-wrap'>
                                    {item.productName || t('unnamedProduct')}
                                  </td>
                                  <td className='text-truncate'>
                                    {item.barcode || t('na')}
                                  </td>
                                  <td>{item.qty ?? 0}</td>
                                  <td>{formatCurrency(item.price)}</td>
                                  <td>{formatCurrency(item.subtotal)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan='5'
                                  className='text-center text-muted'
                                >
                                  {t('noItems')}
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan='4' className='text-end fw-bold'>
                                {t('total')}
                              </td>
                              <td className='fw-bold'>
                                {formatCurrency(order.total)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className='mt-3 small text-muted'>
                        <div>
                          <strong>{t('userEmail')}:</strong>{' '}
                          {order.userEmail || t('na')}
                        </div>
                        <div>
                          <strong>{t('orderNumber')}:</strong> {order.id}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Order
