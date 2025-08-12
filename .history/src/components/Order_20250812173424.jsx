import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { useTranslation } from 'react-i18next'
import 'bootstrap/dist/css/bootstrap.min.css'

const Orders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [expandedOrderIds, setExpandedOrderIds] = useState([]) // array of expanded order ids
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
        // sort newest first (optional)
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
    // fallback: if it's a string or number
    try {
      const d = new Date(timestamp)
      if (!isNaN(d)) return d.toLocaleString()
    } catch (e) {
    
      alert('failed' e)}
    return t('na')
  }

  const formatCurrency = num => {
    if (num === undefined || num === null) return t('na')
    const n = Number(num)
    if (isNaN(n)) return t('na')
    // no decimals in your example amounts — keep as integer grouping
    return `KSh ${n.toLocaleString()}`
  }

  // try to map statuses to translation keys (fallback to cleaned readable text)
  const formatStatusForDisplay = rawStatus => {
    if (!rawStatus) return t('na')

    // remove potential "status" prefix e.g. "statusPending"
    const cleaned = rawStatus.replace(/^status/i, '').trim()
    const key = cleaned.toLowerCase()

    // if we have a translation for a canonical status key (pending, delivered, cancelled, completed, processing)
    const knownKeys = [
      'pending',
      'delivered',
      'cancelled',
      'completed',
      'processing'
    ]
    if (knownKeys.includes(key)) {
      const translated = t(key)
      // if translation exists return it, else fallback to cleaned with nice capitalization
      if (translated && translated !== key) return translated
    }

    // fallback: nice capitalization of cleaned text
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
  }

  if (loading) {
    return <div className='container mt-4'>{t('loading')}...</div>
  }

  if (!orders.length) {
    return <div className='container mt-4'>{t('noOrdersFound')}</div>
  }

  return (
    <div className='container mt-4'>
      <h2 className='mb-3'>{t('ordersTitle')}</h2>

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
              <th style={{ width: 140 }}>{t('actions')}</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                  {/* order id (no "Order #{{id}}" in header) */}
                  <td
                    title={order.id}
                    style={{
                      maxWidth: '220px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {order.id}
                  </td>

                  <td>{order.companyName || t('na')}</td>
                  <td>{order.companyEmail || t('na')}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>{formatStatusForDisplay(order.status)}</td>
                  <td>{formatCurrency(order.total)}</td>

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
                    <td colSpan='7' className='p-3 bg-white'>
                      <div className='mb-2'>
                        <strong>{t('items')}:</strong>
                      </div>

                      <div className='table-responsive'>
                        <table className='table table-sm table-striped table-bordered mb-0'>
                          <thead className='table-secondary'>
                            <tr>
                              <th>{t('productName')}</th>
                              <th>{t('productId')}</th>
                              <th>{t('barcode')}</th>
                              <th>{t('qty')}</th>
                              <th>{t('price')}</th>
                              <th>{t('subtotal')}</th>
                            </tr>
                          </thead>

                          <tbody>
                            {order.items && order.items.length ? (
                              order.items.map((it, idx) => (
                                <tr key={idx}>
                                  <td>
                                    {it.productName || t('unnamedProduct')}
                                  </td>
                                  <td
                                    title={it.productId}
                                    style={{
                                      maxWidth: '140px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {it.productId || t('na')}
                                  </td>
                                  <td>{it.barcode || t('na')}</td>
                                  <td>{it.qty ?? 0}</td>
                                  <td>{formatCurrency(it.price)}</td>
                                  <td>{formatCurrency(it.subtotal)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan='6'
                                  className='text-center text-muted'
                                >
                                  {t('noItems')}
                                </td>
                              </tr>
                            )}
                          </tbody>

                          <tfoot>
                            <tr>
                              <td colSpan='5' className='text-end fw-bold'>
                                {t('total')}
                              </td>
                              <td className='fw-bold'>
                                {formatCurrency(order.total)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* optional: any extra meta */}
                      <div className='mt-3 text-muted small'>
                        <div>
                          <strong>{t('userEmail')}:</strong>{' '}
                          {order.userEmail || t('na')}
                        </div>
                        <div>
                          <strong>{t('orderId') || t('orderNumber')}:</strong>{' '}
                          {order.id}
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

export default Orders
