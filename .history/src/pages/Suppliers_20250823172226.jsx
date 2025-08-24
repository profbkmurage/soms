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
        console.error('Error fetching suppliers:', error)
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

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
      setSuppliers([...suppliers, { id: docRef.id, ...supplierData }])
      setNewSupplier({ name: '', email: '', phone: '', products: '' })
    } catch (error) {
      console.error('Error adding supplier:', error)
    }
  }

  // Delete supplier
  const handleDeleteSupplier = async supplierId => {
    if (!window.confirm(t('supplierss.confirmDelete'))) return
    try {
      await deleteDoc(doc(db, 'suppliers', supplierId))
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId))
    } catch (error) {
      console.error('Error deleting supplier:', error)
    }
  }

  // Open supplier modal
  const handleViewSupplier = supplier => {
    setSelectedSupplier(supplier)
    setShowModal(true)
  }

  return (
    <div className='container mt-4'>
      <h3>{t('supplierss.title')}</h3>

      {/* Add Supplier Form */}
      <Form onSubmit={handleAddSupplier} className='mb-4'>
        <div className='row g-2'>
          <div className='col-md-2'>
            <Form.Control
              type='text'
              placeholder={t('supplierss.name')}
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
              placeholder={t('supplierss.email')}
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
              placeholder={t('supplierss.phone')}
              value={newSupplier.phone}
              onChange={e =>
                setNewSupplier({ ...newSupplier, phone: e.target.value })
              }
            />
          </div>
          <div className='col-md-4'>
            <Form.Control
              type='text'
              placeholder={t('supplierss.productsPlaceholder')}
              value={newSupplier.products}
              onChange={e =>
                setNewSupplier({ ...newSupplier, products: e.target.value })
              }
            />
          </div>
          <div className='col-md-2'>
            <Button type='submit' className='w-100'>
              {t('supplierss.addBtn')}
            </Button>
          </div>
        </div>
      </Form>

      {/* Supplierss Table */}
      {loading ? (
        <p>{t('supplierss.loading')}</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('supplierss.name')}</th>
              <th>{t('supplierss.email')}</th>
              <th>{t('supplierss.phone')}</th>
              <th>{t('supplierss.products')}</th>
              <th>{t('supplierss.actions')}</th>
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
                    : t('supplierss.none')}
                </td>
                <td className='d-flex gap-2'>
                  <Button
                    variant='info'
                    size='sm'
                    onClick={() => handleViewSupplier(supplier)}
                  >
                    {t('supplierss.viewDetails')}
                  </Button>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    {t('supplierss.delete')}
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
