// src/components/SuperAdminOrders.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useTranslation } from 'react-i18next'

const SuperAdminOrders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'))
      const fetchedOrders = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      setOrders(fetchedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Revoke an order
  const handleRevoke = async orderId => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, { status: 'revoked' })
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'revoked' } : order
        )
      )
    } catch (error) {
      console.error('Error revoking order:', error)
    }
  }

  if (loading) return <p>{t('loading')}...</p>

  return (
    <div className="container mt-4">
      <h2>{t('superAdminOrders')}</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>{t('receiptId')}</th>
            <th>{t('customer')}</th>
            <th>{t('status')}</th>
            <th>{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName || t('unknownCustomer')}</td>
                <td>{order.status}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleRevoke(order.id)}
                    disabled={order.status.toLowerCase() === 'delivered'}
                  >
                    {t('revoke')}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                {t('noOrders')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default SuperAdminOrders
