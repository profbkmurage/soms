import React, { useEffect, useState, useCallback } from 'react'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/'
import { useTranslation } from 'react-i18next'

const Orders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])

  // Fetch all orders
  const fetchAllOrders = useCallback(() => {
    const unsub = onSnapshot(collection(db, 'orders'), snapshot => {
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
          status: data.status || 'pending', // store key, not translated
          rawDate: dateValue
        }
      })

      // sort by date descending
      ordersList.sort((a, b) => b.rawDate - a.rawDate)
      setOrders(ordersList)
    })

    return () => unsub()
  }, [t])

  useEffect(() => {
    const unsub = fetchAllOrders()
    return () => unsub && unsub()
  }, [fetchAllOrders])

  // Toggle status between pending → processing → delivered
  const toggleStatus = async orderId => {
    try {
      setOrders(prev =>
        prev.map(order => {
          if (
            order.id === orderId &&
            order.status !== 'delivered' &&
            order.status !== 'revoked'
          ) {
            let newStatus =
              order.status === 'pending'
                ? 'processing'
                : order.status === 'processing'
                ? 'delivered'
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

  // Revoke order
  const revokeOrder = async orderId => {
    if (!window.confirm(t('confirmRevoke'))) return
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'revoked' })
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'revoked' } : order
        )
      )
    } catch (error) {
      console.error(t('errorRevokingOrder'), error)
    }
  }

  return (
    <div className='container mt-4'>
      <h2>{t('allOrders')}</h2>
      <div className='table-responsive'>
        <table className='table table-bordered table-striped'>
          <thead className='table-dark'>
            <tr>
              <th>#</th>
              <th>{t('name')}</th>
              <th>{t('yourCart')}</th>
              <th>{t('date')}</th>
              <th>{t('status')}</th>
              <th>{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan='6' className='text-center'>
                  {t('noOrders')}
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.name || t('notAvailable')}</td>
                  <td>
                    {order.cart?.length > 0 ? (
                      <ul>
                        {order.cart.map((item, idx) => (
                          <li key={idx}>
                            {item.name} ({t('qty')}: {item.quantity})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      t('notAvailable')
                    )}
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${
                        order.status === 'pending'
                          ? 'btn-warning'
                          : order.status === 'processing'
                          ? 'btn-info'
                          : order.status === 'revoked'
                          ? 'btn-danger'
                          : 'btn-success'
                      }`}
                      onClick={() => toggleStatus(order.id)}
                      disabled={
                        order.status === 'delivered' ||
                        order.status === 'revoked'
                      }
                    >
                      {t(order.status)}
                    </button>
                  </td>
                  <td>
                    <button
                      className='btn btn-sm btn-danger'
                      onClick={() => revokeOrder(order.id)}
                      disabled={order.status === 'revoked'}
                    >
                      {t('revoke')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Orders
