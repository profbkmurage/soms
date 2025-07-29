import React, { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
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
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'))
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  const exportToExcel = (data, headers, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data, { origin: 'A2' })
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' })

    // Bold header row
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: col })
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true } }
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const exportStockReport = () => {
    const formatted = products.map(product => ({
      Barcode: product.barcode || '',
      'Product Name': product.productName || '',
      'Shop Quantity': product.shopQty ?? '',
      'Store Quantity': product.storeQty ?? '',
      'Total Quantity': product.totalQty ?? ''
    }))

    exportToExcel(
      formatted,
      [
        'Barcode',
        'Product Name',
        'Shop Quantity',
        'Store Quantity',
        'Total Quantity'
      ],
      'Stock_Report'
    )
  }

  const exportExpiryReport = () => {
    const withExpiry = products
      .filter(p => p.expiryDate)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))

    const formatted = withExpiry.map(p => ({
      Barcode: p.barcode || '',
      'Product Name': p.productName || '',
      'Total Quantity': p.totalQty ?? '',
      'Expiry Date': p.expiryDate || ''
    }))

    exportToExcel(
      formatted,
      ['Barcode', 'Product Name', 'Total Quantity', 'Expiry Date'],
      'Expiry_Report'
    )
  }

  const exportReorderLevels = () => {
    const lowStock = products.filter(
      p => p.reorderLevel && p.shopQty <= p.reorderLevel
    )

    const formatted = lowStock.map(product => ({
      Barcode: product.barcode || '',
      'Product Name': product.productName || '',
      'Shop Quantity': product.shopQty ?? '',
      'Reorder Level': product.reorderLevel ?? ''
    }))

    exportToExcel(
      formatted,
      ['Barcode', 'Product Name', 'Shop Quantity', 'Reorder Level'],
      'Reorder_Levels'
    )
  }

  const handleDeleteUser = async id => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(db, 'users', id))
      fetchUsers()
    }
  }

  return (
    <div className='container mt-4'>
      <h2>Superadmin Settings</h2>

      <div className='mt-4'>
        <h4>📦 Stock Reports</h4>
        <button className='btn btn-primary me-2' onClick={exportStockReport}>
          Export Stock Report
        </button>
        <button className='btn btn-warning me-2' onClick={exportExpiryReport}>
          Export Expiry Dates
        </button>
        <button className='btn btn-danger' onClick={exportReorderLevels}>
          Export Reorder Levels
        </button>
      </div>

      <div className='mt-5'>
        <h4>Users</h4>
        <button
          className='btn btn-success mb-2'
          onClick={() => navigate('/signup')}
        >
           Create New User
        </button>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className='btn btn-sm btn-outline-danger'
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Settings
