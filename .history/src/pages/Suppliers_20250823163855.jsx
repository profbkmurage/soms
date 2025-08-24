import React, { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Button, Table, Form } from 'react-bootstrap'
import SupplierModal from '../components/SupplierModal'
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

  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'suppliers'))
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setSuppliers(data)
        setLoading(false)
      } catch (error) {
        console.error(t('suppliers.messages.errorFetch'), error)
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [t])

  // Add new supplier
  const handleAddSupplier = async e => {
    e.preventDefault()
    try {
      const supplierData = {
        ...newSupplier,
        products: newSupplier.products
          ? newSupplier.products.split(',').map(p => p.trim())
          : []
      }

      const docRef = await addDoc(collection(db, 'suppliers'), supplierData)
      setSuppliers(prev => [...prev, { id: docRef.id, ...supplierData }])
      setNewSupplier({ name: '', email: '', phone: '', products: '' })
    } catch (error) {
      console.error(t('suppliers.messages.errorAdd'), error)
    }
  }

  // Delete supplier
  const handleDeleteSupplier = async supplierId => {
    if (!window.confirm(t('suppliers.messages.confirmDelete'))) return
    try {
      await deleteDoc(doc(db, 'suppliers', supplierId))
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId))
    } catch (error) {
      console.error(t('suppliers.messages.errorDelete'), error)
    }
  }

  // Open supplier modal
  const handleViewSupplier = supplier => {
    setSelectedSupplier(supplier)
    setShowModal(true)
  }

  return (
    <div className='container mt-4'>
      <h3>{t('suppliers.title')}</h3>

      {/* Add Supplier Form */}
      <Form onSubmit={handleAddSupplier} className='mb-4'>
        <div className='row g-2'>
          <div className='col-md-2'>
            <Form.Control
              type='text'
              placeholder={t('suppliers.addForm.name')}
              value={newSupplier.name}
              onChange={e =>
                setNewSupplier({ ...newSupplier, name: e.target.value })
              }
              required
            />
          </div>
          <div className='col-md-2'>
            <Form.Control
              type='email'
              placeholder={t('suppliers.addForm.email')}
              value={newSupplier.email}
              onChange={e =>
                setNewSupplier({ ...newSupplier, email: e.target.value })
              }
              required
            />
          </div>
          <div className='col-md-2'>
            <Form.Control
              type='text'
              placeholder={t('suppliers.addForm.phone')}
              value={newSupplier.phone}
              onChange={e =>
                setNewSupplier({ ...newSupplier, phone: e.target.value })
              }
            />
          </div>
          <div className='col-md-4'>
            <Form.Control
              type='text'
              placeholder={t('suppliers.addForm.products')}
              value={newSupplier.products}
              onChange={e =>
                setNewSupplier({ ...newSupplier, products: e.target.value })
              }
            />
          </div>
          <div className='col-md-2'>
            <Button type='submit' className='w-100'>
              {t('suppliers.addForm.addButton')}
            </Button>
          </div>
        </div>
      </Form>

      {/* Suppliers Table */}
      {loading ? (
        <p>{t('suppliers.messages.loading')}</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('suppliers.table.name')}</th>
              <th>{t('suppliers.table.email')}</th>
              <th>{t('suppliers.table.phone')}</th>
              <th>{t('suppliers.table.products')}</th>
              <th>{t('suppliers.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone}</td>
                <td>
                  {supplier.products && supplier.products.length > 0
                    ? supplier.products.join(', ')
                    : t('suppliers.table.noProducts')}
                </td>
                <td className='d-flex gap-2'>
                  <Button
                    variant='info'
                    size='sm'
                    onClick={() => handleViewSupplier(supplier)}
                  >
                    {t('suppliers.buttons.view')}
                  </Button>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    {t('suppliers.buttons.delete')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Supplier Modal */}
      {selectedSupplier && (
        <SupplierModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          supplier={selectedSupplier}
        />
      )}
    </div>
  )
}

export default Suppliers
