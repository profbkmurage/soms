import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import { useTranslation } from 'react-i18next'

const Orders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser
      if (!user) return

      // Get orders belonging only to the logged-in company
      const q = query(
        collection(db, 'orders'),
        where('companyEmail', '==', user.email)
      )

      const snapshot = await getDocs(q)
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setOrders(ordersData)
    }

    fetchOrders()
  }, [])

  const toggleExpand = orderId => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const formatStatus = status => {
    if (!status) return ''
    return status.replace(/^status/, '').replace(/^\w/, c => c.toUpperCase())
  }

  return (
    <div className='container mt-4'>
      <h2>{t('ordersTitle')}</h2>
      <table className='table table-bordered table-hover'>
        <thead>
          <tr>
            <th>{t('orderNumber')}</th>
            <th>{t('companyName')}</th>
            <th>{t('companyEmail')}</th>
            <th>{t('orderDate')}</th>
            <th>{t('orderStatus')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              <tr>
                <td>#{order.id}</td>
                <td>{order.companyName}</td>
                <td>{order.companyEmail}</td>
                <td>
                  {order.date?.toDate
                    ? order.date.toDate().toLocaleString()
                    : ''}
                </td>
                <td>{formatStatus(order.status)}</td>
                <td>
                  <button
                    className='btn btn-sm btn-primary'
                    onClick={() => toggleExpand(order.id)}
                  >
                    {expandedOrder === order.id
                      ? t('hideDetails')
                      : t('viewDetails')}
                  </button>
                </td>
              </tr>
              {expandedOrder === order.id && (
                <tr>
                  <td colSpan='6'>
                    <strong>{t('orderItems')}:</strong>
                    <ul>
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.productName} - {item.qty} x {item.price}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Orders
