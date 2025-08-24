import React, { useState } from 'react'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Modal, Button, Form, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const SupplierModal = ({ show, handleClose, supplier, refreshSuppliers }) => {
  const { t } = useTranslation()
  const [deliveryAmount, setDeliveryAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [loading, setLoading] = useState(false)

  if (!supplier) return null

  const handleAddDelivery = async () => {
    if (!deliveryAmount) return
    setLoading(true)
    try {
      const supplierRef = doc(db, 'suppliers', supplier.id)
      await updateDoc(supplierRef, {
        deliveries: arrayUnion({
          amount: Number(deliveryAmount),
          date: new Date().toISOString()
        })
      })
      setDeliveryAmount('')
      refreshSuppliers()
      alert(t('deliveryAddedSuccess'))
    } catch (err) {
      console.error(err)
      alert(t('deliveryAddFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = async () => {
    if (!paymentAmount) return
    setLoading(true)
    try {
      const supplierRef = doc(db, 'suppliers', supplier.id)
      await updateDoc(supplierRef, {
        payments: arrayUnion({
          amount: Number(paymentAmount),
          date: new Date().toISOString()
        })
      })
      setPaymentAmount('')
      refreshSuppliers()
      alert(t('paymentAddedSuccess'))
    } catch (err) {
      console.error(err)
      alert(t('paymentAddFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>
          {t('supplierDetails', { name: supplier.name })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>{t('supplierSummary')}</h5>
        <p>
          <strong>{t('totalDeliveries')}:</strong>{' '}
          {supplier.deliveries?.length || 0}
        </p>
        <p>
          <strong>{t('totalPayments')}:</strong>{' '}
          {supplier.payments?.length || 0}
        </p>

        <hr />

        <h5>{t('addDelivery')}</h5>
        <Form className='mb-3 d-flex'>
          <Form.Control
            type='number'
            value={deliveryAmount}
            onChange={e => setDeliveryAmount(e.target.value)}
            placeholder={t('enterDeliveryAmount')}
          />
          <Button
            className='ms-2'
            onClick={handleAddDelivery}
            disabled={loading}
          >
            {loading ? t('adding') : t('add')}
          </Button>
        </Form>

        <h5>{t('addPayment')}</h5>
        <Form className='mb-3 d-flex'>
          <Form.Control
            type='number'
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
            placeholder={t('enterPaymentAmount')}
          />
          <Button
            className='ms-2'
            onClick={handleAddPayment}
            disabled={loading}
          >
            {loading ? t('adding') : t('add')}
          </Button>
        </Form>

        <hr />

        <h5>{t('deliveryHistory')}</h5>
        <Table striped bordered hover size='sm'>
          <thead>
            <tr>
              <th>{t('amount')}</th>
              <th>{t('date')}</th>
            </tr>
          </thead>
          <tbody>
            {supplier.deliveries?.map((d, idx) => (
              <tr key={idx}>
                <td>{d.amount}</td>
                <td>{new Date(d.date).toLocaleString()}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan='2'>{t('noDeliveries')}</td>
              </tr>
            )}
          </tbody>
        </Table>

        <h5>{t('paymentHistory')}</h5>
        <Table striped bordered hover size='sm'>
          <thead>
            <tr>
              <th>{t('amount')}</th>
              <th>{t('date')}</th>
            </tr>
          </thead>
          <tbody>
            {supplier.payments?.map((p, idx) => (
              <tr key={idx}>
                <td>{p.amount}</td>
                <td>{new Date(p.date).toLocaleString()}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan='2'>{t('noPayments')}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose} disabled={loading}>
          {t('close')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SupplierModal
