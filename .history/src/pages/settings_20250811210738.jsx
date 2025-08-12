import React, { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useTranslation } from 'react-i18next'

const Settings = () => {
  const { t } = useTranslation()
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

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const exportStockReport = () => {
    const formatted = products.map(p => ({
      [t('barcode')]: p.barcode || '',
      [t('productName')]: p.productName || '',
      [t('shopQuantity')]: p.shopQty ?? '',
      [t('storeQuantity')]: p.storeQty ?? '',
      [t('totalQuantity')]: p.totalQty ?? ''
    }))

    exportToExcel(
      formatted,
      [
        t('barcode'),
        t('productName'),
        t('shopQuantity'),
        t('storeQuantity'),
        t('totalQuantity')
      ],
      'Stock_Report'
    )
  }

  const exportExpiryReport = () => {
    const formatted = products
      .filter(p => p.expiryDate)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .map(p => ({
        [t('barcode')]: p.barcode || '',
        [t('productName')]: p.productName || '',
        [t('totalQuantity')]: p.totalQty ?? '',
        [t('expiryDate')]: p.expiryDate || ''
      }))

    exportToExcel(
      formatted,
      [t('barcode'), t('productName'), t('totalQuantity'), t('expiryDate')],
      'Expiry_Report'
    )
  }

  const exportReorderLevels = () => {
    const formatted = products
      .filter(p => p.reorderLevel && p.shopQty <= p.reorderLevel)
      .map(p => ({
        [t('barcode')]: p.barcode || '',
        [t('productName')]: p.productName || '',
        [t('shopQuantity')]: p.shopQty ?? '',
        [t('reorderLevel')]: p.reorderLevel ?? ''
      }))

    exportToExcel(
      formatted,
      [t('barcode'), t('productName'), t('shopQuantity'), t('reorderLevel')],
      'Reorder_Levels'
    )
  }

  const handleDeleteUser = async id => {
    if (window.confirm(t('confirmDeleteUser'))) {
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
      <h2 className='mb-4'>{t('superadminSettings')}</h2>

      {/* View Orders Button */}
      <div className='mb-4'>
        <button
          className='btn btn-outline-primary'
          onClick={() => navigate('/superadmin-orders')}
        >
          {t('viewAllOrders')}
        </button>
      </div>

      {/* Stock Reports */}
      <div className='card mb-4'>
        <div className='card-header bg-primary text-white'>
          <h5 className='mb-0'>{t('stockReports')}</h5>
        </div>
        <div className='card-body'>
          <button
            className='btn btn-primary me-2 mb-2'
            onClick={exportStockReport}
          >
            {t('exportStockReport')}
          </button>
          <button
            className='btn btn-warning me-2 mb-2'
            onClick={exportExpiryReport}
          >
            {t('exportExpiryDates')}
          </button>
          <button className='btn btn-danger mb-2' onClick={exportReorderLevels}>
            {t('exportReorderLevels')}
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className='card'>
        <div className='card-header bg-dark text-white d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>
            {viewType === 'staff' ? t('staffUsers') : t('companyAccounts')}
          </h5>
          <div>
            <button
              className='btn btn-success me-2'
              onClick={() => navigate('/create-account')}
            >
              {t('createNewUser')}
            </button>
            <button
              className='btn btn-info'
              onClick={() =>
                setViewType(viewType === 'staff' ? 'company' : 'staff')
              }
            >
              {viewType === 'staff' ? t('viewCompanies') : t('viewStaff')}
            </button>
          </div>
        </div>

        <div className='card-body p-0'>
          {filteredUsers.length === 0 ? (
            <p className='p-3'>{t('noAccountsFound', { type: viewType })}</p>
          ) : (
            <div className='table-responsive'>
              <table className='table table-striped table-bordered mb-0'>
                <thead className='table-light'>
                  <tr>
                    <th>{t('companyName')}</th>
                    <th>{t('email')}</th>
                    <th>{t('role')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.companyName || '—'}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button
                          className='btn btn-sm btn-outline-danger'
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          {t('delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
