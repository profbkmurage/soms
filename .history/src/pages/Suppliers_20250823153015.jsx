import React, { useEffect, useState } from 'react'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Button, Table, Form } from 'react-bootstrap'
import SupplierModal from '../components/SupplierModal'

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    products: '' // ✅ store products temporarily as a string input
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
          : [] // ✅ convert comma-separated string to array
      }

      const docRef = await addDoc(collection(db, 'suppliers'), supplierData)
      setSuppliers([...suppliers, { id: docRef.id, ...supplierData }])
      setNewSupplier({ name: '', email: '', phone: '', products: '' })
    } catch (error) {
      console.error('Error adding supplier:', error)
    }
  }

  // Open supplier modal
  const handleViewSupplier = supplier => {
    setSelectedSupplier(supplier)
    setShowModal(true)
  }

  return (
    <div className='container mt-4'>
      <h3>Suppliers</h3>

      {/* Add Supplier Form */}
      <Form onSubmit={handleAddSupplier} className='mb-4'>
        <div className='row g-2'>
          <div className='col-md-2'>
            <Form.Control
              type='text'
              placeholder='Name'
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
              placeholder='Email'
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
              placeholder='Phone'
              value={newSupplier.phone}
              onChange={e =>
                setNewSupplier({ ...newSupplier, phone: e.target.value })
              }
            />
          </div>
          <div className='col-md-4'>
            <Form.Control
              type='text'
              placeholder='Products (comma separated)'
              value={newSupplier.products}
              onChange={e =>
                setNewSupplier({ ...newSupplier, products: e.target.value })
              }
            />
          </div>
          <div className='col-md-2'>
            <Button type='submit' className='w-100'>
              Add Supplier
            </Button>
          </div>
        </div>
      </Form>

      {/* Suppliers Table */}
      {loading ? (
        <p>Loading suppliers...</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Products</th> {/* ✅ New column */}
              <th>Actions</th>
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
                    : '—'}
                </td>
                <td>
                  <Button
                    variant='info'
                    size='sm'
                    onClick={() => handleViewSupplier(supplier)}
                  >
                    View Details
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
