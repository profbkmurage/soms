import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-bootstrap'

const Orders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'))
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id, // Firestore UID
          ...doc.data()
        }))
        setOrders(fetchedOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    fetchOrders()
  }, [])

  const toggleDetails = orderId => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
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
                  {/* Firestore UID with truncation */}
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

                {/* Expanded order details */}
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
