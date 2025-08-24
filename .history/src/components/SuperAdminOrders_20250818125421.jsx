// src/pages/SuperAdminOrders.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'

const SuperAdminOrders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAllOrders = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'))
      const allOrders = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      setOrders(allOrders)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllOrders()
  }, [fetchAllOrders])

  const revokeOrder = async orderId => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, { status: 'revoked' })
      fetchAllOrders()
    } catch (error) {
      console.error('Error revoking order:', error)
    }
  }

  if (loading) {
    return <p>{t('loading')}</p>
  }

  return (
    <div className='container mt-5'>
      <h2>{t('allOrders')}</h2>
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>{t('orderId')}</th>
            <th>{t('customer')}</th>
            <th>{t('total')}</th>
            <th>{t('status')}</th>
            <th>{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName || t('unknown')}</td>
              <td>{order.total}</td>
              <td>{order.status}</td>
              <td>
                <button
                  className='btn btn-danger'
                  onClick={() => revokeOrder(order.id)}
                  disabled={
                    order.status === 'delivered' || order.status === 'revoked'
                  }
                >
                  {t('revoke')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SuperAdminOrders
