import React, { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'

const Suppliers = () => {
  const { t } = useTranslation()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    products: ''
  })

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'))
      const suppliersData = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setSuppliers(suppliersData)
      setLoading(false)
    } catch (error) {
      console.error(t('suppliers.messages.errorFetch'), error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Add supplier
  const handleAddSupplier = async e => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'suppliers'), {
        ...newSupplier,
        products: newSupplier.products
          ? newSupplier.products.split(',').map(p => p.trim())
          : []
      })
      setNewSupplier({ name: '', email: '', phone: '', products: '' })
      fetchSuppliers()
    } catch (error) {
      console.error(t('suppliers.messages.errorAdd'), error)
    }
  }

  // Delete supplier
  const handleDeleteSupplier = async id => {
    if (window.confirm(t('suppliers.messages.confirmDelete'))) {
      try {
        await deleteDoc(doc(db, 'suppliers', id))
        fetchSuppliers()
      } catch (error) {
        console.error(t('suppliers.messages.errorDelete'), error)
      }
    }
  }

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold mb-4'>{t('suppliers.title')}</h1>

      {/* Add Supplier Form */}
      <form onSubmit={handleAddSupplier} className='space-y-4 mb-6'>
        <input
          type='text'
          placeholder={t('suppliers.addForm.name')}
          value={newSupplier.name}
          onChange={e =>
            setNewSupplier({ ...newSupplier, name: e.target.value })
          }
          className='border rounded px-3 py-2 w-full'
          required
        />
        <input
          type='email'
          placeholder={t('suppliers.addForm.email')}
          value={newSupplier.email}
          onChange={e =>
            setNewSupplier({ ...newSupplier, email: e.target.value })
          }
          className='border rounded px-3 py-2 w-full'
          required
        />
        <input
          type='text'
          placeholder={t('suppliers.addForm.phone')}
          value={newSupplier.phone}
          onChange={e =>
            setNewSupplier({ ...newSupplier, phone: e.target.value })
          }
          className='border rounded px-3 py-2 w-full'
        />
        <input
          type='text'
          placeholder={t('suppliers.addForm.products')}
          value={newSupplier.products}
          onChange={e =>
            setNewSupplier({ ...newSupplier, products: e.target.value })
          }
          className='border rounded px-3 py-2 w-full'
        />
        <button
          type='submit'
          className='bg-blue-600 text-white px-4 py-2 rounded'
        >
          {t('suppliers.addForm.addButton')}
        </button>
      </form>

      {/* Suppliers Table */}
      {loading ? (
        <p>{t('suppliers.messages.loading')}</p>
      ) : (
        <table className='w-full border-collapse border'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='border px-4 py-2'>{t('suppliers.table.name')}</th>
              <th className='border px-4 py-2'>{t('suppliers.table.email')}</th>
              <th className='border px-4 py-2'>{t('suppliers.table.phone')}</th>
              <th className='border px-4 py-2'>
                {t('suppliers.table.products')}
              </th>
              <th className='border px-4 py-2'>
                {t('suppliers.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier.id}>
                <td className='border px-4 py-2'>{supplier.name}</td>
                <td className='border px-4 py-2'>{supplier.email}</td>
                <td className='border px-4 py-2'>{supplier.phone}</td>
                <td className='border px-4 py-2'>
                  {supplier.products && supplier.products.length > 0
                    ? supplier.products.join(', ')
                    : t('suppliers.table.noProducts')}
                </td>
                <td className='border px-4 py-2 space-x-2'>
                  <button className='bg-green-500 text-white px-2 py-1 rounded'>
                    {t('suppliers.buttons.view')}
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className='bg-red-500 text-white px-2 py-1 rounded'
                  >
                    {t('suppliers.buttons.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Suppliers
