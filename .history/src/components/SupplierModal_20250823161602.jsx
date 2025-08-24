import React, { useState } from 'react'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Modal, Button, Form, Table, Tabs, Tab } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const SupplierModal = ({ show, handleClose, supplier, refreshSuppliers }) => {
  const { t } = useTranslation()

  // Form states
  const [productName, setProductName] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [unitType, setUnitType] = useState('pcs')
  const [quantityDelivered, setQuantityDelivered] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')

  const [loading, setLoading] = useState(false)

  if (!supplier) return null

  const totalPrice =
    unitPrice && quantityDelivered
      ? (parseFloat(unitPrice) * parseFloat(quantityDelivered)).toFixed(2)
      : 0

  // Add new delivery
  const handleAddDelivery = async () => {
    if (!productName || !unitPrice || !quantityDelivered) return
    setLoading(true)
    try {
      const supplierRef = doc(db, 'suppliers', supplier.id)
      await updateDoc(supplierRef, {
        deliveries: arrayUnion({
          productName,
          unitPrice: parseFloat(unitPrice),
          unitType,
          quantityDelivered: parseFloat(quantityDelivered),
          totalPrice: parseFloat(totalPrice),
          date: new Date().toISOString()
        })
      })
      // Reset form
      setProductName('')
      setUnitPrice('')
      setUnitType('pcs')
      setQuantityDelivered('')
      refreshSuppliers()
      alert(t('deliveryAddedSuccess'))
    } catch (err) {
      console.error(err)
      alert(t('deliveryAddFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Add payment
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
        <Tabs defaultActiveKey='deliveries' id='supplier-tabs' className='mb-3'>
          {/* Deliveries Tab */}
          <Tab eventKey='deliveries' title={t('deliveryHistory')}>
            <h5>{t('newDelivery')}</h5>
            <Form className='mb-3'>
              <div className='row g-2'>
                <div className='col-md-3'>
                  <Form.Control
                    type='text'
                    placeholder={t('productName')}
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                  />
                </div>
                <div className='col-md-2'>
                  <Form.Control
                    type='number'
                    step='0.01'
                    placeholder={t('unitPrice')}
                    value={unitPrice}
                    onChange={e => setUnitPrice(e.target.value)}
                  />
                </div>
                <div className='col-md-2'>
                  <Form.Select
                    value={unitType}
                    onChange={e => setUnitType(e.target.value)}
                  >
                    <option value='pcs'>pcs</option>
                    <option value='kg'>kg</option>
                  </Form.Select>
                </div>
                <div className='col-md-2'>
                  <Form.Control
                    type='number'
                    step='0.01'
                    placeholder={t('quantityDelivered')}
                    value={quantityDelivered}
                    onChange={e => setQuantityDelivered(e.target.value)}
                  />
                </div>
                <div className='col-md-2'>
                  <Form.Control
                    type='text'
                    value={`${totalPrice}`}
                    readOnly
                    placeholder={t('totalPrice')}
                  />
                </div>
                <div className='col-md-1'>
                  <Button
                    onClick={handleAddDelivery}
                    disabled={loading}
                    className='w-100'
                  >
                    {loading ? t('adding') : t('add')}
                  </Button>
                </div>
              </div>
            </Form>

            <h5>{t('deliveryHistory')}</h5>
            <Table striped bordered hover size='sm'>
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('productName')}</th>
                  <th>{t('quantityDelivered')}</th>
                  <th>{t('unitType')}</th>
                  <th>{t('unitPrice')}</th>
                  <th>{t('totalPrice')}</th>
                </tr>
              </thead>
              <tbody>
                {supplier.deliveries && supplier.deliveries.length > 0 ? (
                  supplier.deliveries.map((d, idx) => (
                    <tr key={idx}>
                      <td>{new Date(d.date).toLocaleString()}</td>
                      <td>{d.productName}</td>
                      <td>{d.quantityDelivered}</td>
                      <td>{d.unitType}</td>
                      <td>{d.unitPrice}</td>
                      <td>{d.totalPrice}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='6'>{t('noDeliveries')}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Tab>

          {/* Payments Tab */}
          <Tab eventKey='payments' title={t('paymentHistory')}>
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

            <Table striped bordered hover size='sm'>
              <thead>
                <tr>
                  <th>{t('amount')}</th>
                  <th>{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {supplier.payments && supplier.payments.length > 0 ? (
                  supplier.payments.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.amount}</td>
                      <td>{new Date(p.date).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='2'>{t('noPayments')}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
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
