import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Modal, Button, Form } from 'react-bootstrap'

const AddStockModal = ({ show, handleClose, product, refreshProducts }) => {
  const [addedStore, setAddedStore] = useState(0)
  const [addedShop, setAddedShop] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleAddStock = async () => {
    setLoading(true)
    const newStore = product.storeQty + addedStore
    const newShop = product.shopQty + addedShop
    const newTotal = newStore + newShop

    try {
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, {
        storeQty: newStore,
        shopQty: newShop,
        totalQty: newTotal,
        lastUpdated: new Date()
      })
      handleClose()
      refreshProducts() // Refresh product list
      alert('Stock updated successfully.')
    } catch (err) {
      console.error('Error adding stock:', err)
      alert('Failed to update stock.')
    }
    setLoading(false)
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Stock for: {product.productName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className='mb-3'>
            <Form.Label>Store Stock to Add</Form.Label>
            <Form.Control
              type='number'
              value={addedStore}
              onChange={e => setAddedStore(parseInt(e.target.value) || 0)}
              min={0}
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Shop Stock to Add</Form.Label>
            <Form.Control
              type='number'
              value={addedShop}
              onChange={e => setAddedShop(parseInt(e.target.value) || 0)}
              min={0}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant='primary' onClick={handleAddStock} disabled={loading}>
          {loading ? 'Updating...' : 'Add Stock'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddStockModal;
