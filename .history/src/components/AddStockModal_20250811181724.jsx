import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Modal, Button, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const AddStockModal = ({ show, handleClose, product, refreshProducts }) => {
  const { t } = useTranslation()
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
      refreshProducts()
      alert(t('stockUpdatedSuccess'))
    } catch (err) {
      console.error(t('errorAddingStock'), err)
      alert(t('stockUpdateFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {t('addStockFor', { productName: product.productName })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className='mb-3'>
            <Form.Label>{t('storeStockToAdd')}</Form.Label>
            <Form.Control
              type='number'
              value={addedStore}
              onChange={e => setAddedStore(parseInt(e.target.value) || 0)}
              min={0}
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>{t('shopStockToAdd')}</Form.Label>
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
          {t('cancel')}
        </Button>
        <Button variant='primary' onClick={handleAddStock} disabled={loading}>
          {loading ? t('updating') : t('addStock')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddStockModal
