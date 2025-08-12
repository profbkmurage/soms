import React, { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useTranslation } from 'react-i18next'

export default function SuperAdminOrders () {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders')
        const snapshot = await getDocs(ordersRef)
        const ordersList = snapshot.docs.map(docSnap => {
          const data = docSnap.data()
          let formattedDate = t('notAvailable')
          let dateValue = 0

          if (data.date?.seconds) {
            dateValue = data.date.seconds * 1000
            formattedDate = new Date(dateValue).toLocaleString()
          }

          return {
            id: docSnap.id,
            ...data,
            date: formattedDate,
            status: data.status || t('pending'),
            rawDate: dateValue
          }
        })

        // Sort by latest date
        const sortedOrders = ordersList.sort((a, b) => b.rawDate - a.rawDate)
        setOrders(sortedOrders)
      } catch (error) {
        console.error(t('errorFetchingOrders'), error)
      }
    }

    fetchAllOrders()
  }, [t])

  const toggleStatus = async orderId => {
    try {
      setOrders(prev =>
        prev.map(order => {
          if (
            order.id === orderId &&
            order.status !== t('delivered') &&
            order.status !== t('revoked')
          ) {
            let newStatus =
              order.status === t('pending')
                ? t('processing')
                : order.status === t('processing')
                ? t('delivered')
                : order.status

            updateDoc(doc(db, 'orders', orderId), { status: newStatus })
            return { ...order, status: newStatus }
          }
          return order
        })
      )
    } catch (error) {
      console.error(t('errorUpdatingStatus'), error)
    }
  }

  const revokeOrder = async orderId => {
    if (!window.confirm(t('confirmRevoke'))) return
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: t('revoked') })
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: t('revoked') } : order
        )
      )
    } catch (error) {
      console.error(t('errorRevokingOrder'), error)
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
        {t('allOrdersSuperAdmin')}
      </h2>

      {orders.length === 0 ? (
        <div className='text-center text-muted fs-5'>{t('noOrdersFound')}</div>
      ) : (
        <table className='table table-bordered table-hover bg-white shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>{t('orderId')}</th>
              <th>{t('company')}</th>
              <th>{t('userEmail')}</th>
              <th>{t('date')}</th>
              <th>{t('totalKsh')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                  <td>{order.id.slice(0, 8)}</td>
                  <td>{order.companyName || t('notAvailable')}</td>
                  <td>{order.userEmail || t('notAvailable')}</td>
                  <td>{order.date}</td>
                  <td>{order.total?.toLocaleString() || t('notAvailable')}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${
                        order.status === t('pending')
                          ? 'btn-warning'
                          : order.status === t('processing')
                          ? 'btn-info'
                          : order.status === t('revoked')
                          ? 'btn-danger'
                          : 'btn-success'
                      }`}
                      onClick={() => toggleStatus(order.id)}
                      disabled={
                        order.status === t('delivered') ||
                        order.status === t('revoked')
                      }
                    >
                      {order.status}
                    </button>
                  </td>
                  <td className='d-flex gap-2'>
                    <button
                      className='btn btn-outline-primary btn-sm'
                      onClick={() => toggleDetails(order.id)}
                    >
                      {expandedOrder === order.id
                        ? t('hideDetails')
                        : t('viewDetails')}
                    </button>
                    <button
                      className='btn btn-danger btn-sm'
                      onClick={() => revokeOrder(order.id)}
                      disabled={
                        order.status === t('revoked') ||
                        order.status === t('delivered')
                      }
                    >
                      {t('revokeOrder')}
                    </button>
                  </td>
                </tr>

                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan='7' className='bg-light'>
                      <div className='p-3'>
                        <h5 className='fw-bold'>{t('orderDetails')}</h5>
                        <p>
                          <strong>{t('orderNumber')}:</strong> {order.id}
                        </p>
                        <p>
                          <strong>{t('date')}:</strong> {order.date}
                        </p>
                        <p>
                          <strong>{t('companyName')}:</strong>{' '}
                          {order.companyName || t('notAvailable')}
                        </p>

                        <h6 className='fw-bold mt-3'>{t('items')}:</h6>
                        <div className='table-responsive'>
                          <table className='table table-sm table-bordered align-middle'>
                            <thead className='table-secondary'>
                              <tr>
                                <th>{t('barcode')}</th>
                                <th>{t('productName')}</th>
                                <th>{t('qty')}</th>
                                <th>{t('price')}</th>
                                <th>{t('subtotal')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items?.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.barcode || t('notAvailable')}</td>
                                  <td>{item.productName}</td>
                                  <td>{item.qty}</td>
                                  <td>KSh {item.price.toLocaleString()}</td>
                                  <td>KSh {item.subtotal?.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className='mt-3 text-end'>
                          <strong>
                            {t('totalKsh')}: KSh {order.total?.toLocaleString()}
                          </strong>
                        </div>
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
