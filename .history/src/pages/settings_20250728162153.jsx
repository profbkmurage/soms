import React, { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

const Settings = () => {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
    fetchProducts()
  }, [])

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setUsers(data)
  }

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setProducts(data)
  }

  const handleDeleteUser = async id => {
    await deleteDoc(doc(db, 'users', id))
    fetchUsers()
  }

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  const exportStockReport = () => {
    exportToExcel(products, 'Stock_Report')
  }

  const exportExpiryReport = () => {
    const expired = products.filter(p => p.expiryDate)
    exportToExcel(expired, 'Expiry_Report')
  }

  const showReorderProducts = () => {
    const reorder = products.filter(p => p.shopQty <= p.reorderLevel)
    exportToExcel(reorder, 'Reorder_Level_Products')
  }

  return (
    <div className='container mt-4'>
      <h2 className='mb-4'>Settings Panel (Superadmin)</h2>

      <div className='mb-4'>
        <h4>Exports</h4>
        <button className='btn btn-success me-2' onClick={exportStockReport}>
          Export Stock Report
        </button>
        <button className='btn btn-warning me-2' onClick={exportExpiryReport}>
          Export Expiry Report
        </button>
        <button className='btn btn-danger' onClick={showReorderProducts}>
          Reorder Level Report
        </button>
      </div>

      <div className='mb-4'>
        <h4>Manage Users</h4>
        <button
          className='btn btn-primary mb-3'
          onClick={() => navigate('/signup')}
        >
          Create New Account
        </button>
        <ul className='list-group'>
          {users.map(user => (
            <li
              key={user.id}
              className='list-group-item d-flex justify-content-between align-items-center'
            >
              <div>
                <strong>{user.email}</strong> — {user.role}
              </div>
              <button
                className='btn btn-sm btn-outline-danger'
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Settings
