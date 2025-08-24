// src/pages/Suppliers.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs, addDoc} from 'firebase/firestore' //, updateDoc, doc 
import { db } from '../firebase/config'
import { Button, Modal, Table, Form } from 'react-bootstrap'

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    products: []
  })

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
      await addDoc(collection(db, 'suppliers'), newSupplier)
      setSuppliers([...suppliers, newSupplier])
      setNewSupplier({ name: '', email: '', phone: '', products: [] })
    } catch (error) {
      console.error('Error adding supplier:', error)
    }
  }

  return (
    <div className='container mt-4'>
      <h3>Suppliers</h3>

      {/* Add Supplier Form */}
      <Form onSubmit={handleAddSupplier} className='mb-4'>
        <div className='row g-2'>
          <div className='col-md-3'>
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
          <div className='col-md-3'>
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
          <div className='col-md-3'>
            <Form.Control
              type='text'
              placeholder='Phone'
              value={newSupplier.phone}
              onChange={e =>
                setNewSupplier({ ...newSupplier, phone: e.target.value })
              }
            />
          </div>
          <div className='col-md-3'>
            <Button type='submit'>Add Supplier</Button>
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
                  <Button
                    variant='info'
                    size='sm'
                    onClick={() => {
                      setSelectedSupplier(supplier)
                      setShowModal(true)
                    }}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Supplier Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Supplier Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSupplier ? (
            <>
              <p>
                <strong>Name:</strong> {selectedSupplier.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedSupplier.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedSupplier.phone}
              </p>
              {/* Later: add products + delivery history tables */}
              <p>Products & delivery history will appear here...</p>
            </>
          ) : (
            <p>No supplier selected</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Suppliers
