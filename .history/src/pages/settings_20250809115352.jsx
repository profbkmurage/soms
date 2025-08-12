import React, { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

const Settings = () => {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [viewType, setViewType] = useState('staff') // "staff" or "company"
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
    const formatted = products.map(p => ({
      Barcode: p.barcode || '',
      'Product Name': p.productName || '',
      'Shop Quantity': p.shopQty ?? '',
      'Store Quantity': p.storeQty ?? '',
      'Total Quantity': p.totalQty ?? ''
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
    const formatted = products
      .filter(p => p.expiryDate)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .map(p => ({
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
    const formatted = products
      .filter(p => p.reorderLevel && p.shopQty <= p.reorderLevel)
      .map(p => ({
        Barcode: p.barcode || '',
        'Product Name': p.productName || '',
        'Shop Quantity': p.shopQty ?? '',
        'Reorder Level': p.reorderLevel ?? ''
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

  // Filter users by viewType
  const filteredUsers = users.filter(user =>
    viewType === 'staff' ? user.role !== 'company' : user.role === 'company'
  )

  return (
    <div className='container mt-4 mb-5'>
      <h2 className='mb-4'>Superadmin Settings</h2>

      {/* Export Buttons */}
      <div className='card mb-4'>
        <div className='card-header bg-primary text-white'>
          <h5 className='mb-0'>Stock Reports</h5>
        </div>
        <div className='card-body'>
          <button
            className='btn btn-primary me-2 mb-2'
            onClick={exportStockReport}
          >
            Export Stock Report
          </button>
          <button
            className='btn btn-warning me-2 mb-2'
            onClick={exportExpiryReport}
          >
            Export Expiry Dates
          </button>
          <button className='btn btn-danger mb-2' onClick={exportReorderLevels}>
            Export Reorder Levels
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className='card'>
        <div className='card-header bg-dark text-white d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>
            {viewType === 'staff' ? 'Staff Users' : 'Company Accounts'}
          </h5>
          <div>
            <button
              className='btn btn-success me-2'
              onClick={() => navigate('/create-account')}
            >
              Create New User
            </button>
            <button
              className='btn btn-info'
              onClick={() =>
                setViewType(viewType === 'staff' ? 'company' : 'staff')
              }
            >
              {viewType === 'staff' ? 'View Companies' : 'View Staff'}
            </button>
          </div>
        </div>
        <div className='card-body p-0'>
          {filteredUsers.length === 0 ? (
            <p className='p-3'>No {viewType} accounts found.</p>
          ) : (
            ;<div className='table-responsive'>
  <table className='table table-striped table-bordered mb-0'>
    <thead className='table-light'>
      <tr>
        <th>Company Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.map(user => (
        <tr key={user.id}>
          <td>{user.companyName || '—'}</td> {/* Fallback if null */}
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
</div>)      )}
        </div>
      </div>
    </div>
  )
}

export default Settings
