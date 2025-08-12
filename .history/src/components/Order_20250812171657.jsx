import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-bootstrap'
import { onAuthStateChanged } from 'firebase/auth'

const Orders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState(null)

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUserEmail(user.email)
      } else {
        setUserEmail(null)
        setOrders([])
      }
    })

    return () => unsubscribe()
  }, [])

  // Fetch orders for logged-in company
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userEmail) return

      try {
        const q = query(
          collection(db, 'orders'),
          where('companyEmail', '==', userEmail)
        )

        const querySnapshot = await getDocs(q)
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setOrders(fetchedOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userEmail])

  const toggleDetails = orderId => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (loading) {
    return <div className='container mt-4'>{t('loading')}...</div>
  }

  if (!orders.length) {
    return <div className='container mt-4'>{t('noOrdersFound')}</div>
  }

  return (
    <div className='container mt-4'>
      <h2>{t('orders')}</h2>
      <div className='table-responsive'>
        <table className='table table-bordered table-hover align-middle'>
          <thead className='table-light'>
            <tr>
              <th>{t('orderNumber')}</th>
              <th>{t('companyName')}</th>
              <th>{t('companyEmail')}</th>
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
                  <td
                    title={order.id}
                    style={{
                      maxWidth: '150px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {order.id}
                  </td>
                  <td>{order.companyName}</td>
                  <td>{order.companyEmail}</td>
                  <td>
                    {order.date?.toDate
                      ? order.date.toDate().toLocaleString()
                      : ''}
                  </td>
                  <td>{t(order.status)}</td>
                  <td>{order.total}</td>
                  <td>
                    <Button
                      size='sm'
                      variant='primary'
                      onClick={() => toggleDetails(order.id)}
                    >
                      {expandedOrder === order.id
                        ? t('hideDetails')
                        : t('viewDetails')}
                    </Button>
                  </td>
                </tr>

                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan='7'>
                      <div>
                        <h5>{t('items')}</h5>
                        <div className='table-responsive'>
                          <table className='table table-sm table-striped'>
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
                              {order.items?.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.productName}</td>
                                  <td>{item.barcode}</td>
                                  <td>{item.qty}</td>
                                  <td>{item.price}</td>
                                  <td>{item.subtotal}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
