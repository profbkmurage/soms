// src/components/SupplierModal.jsx
import React, { useMemo, useState } from 'react'
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
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
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)

  const totalPrice =
    unitPrice && quantityDelivered
      ? (parseFloat(unitPrice) * parseFloat(quantityDelivered)).toFixed(2)
      : 0

  const { grandTotal, totalPaid, balance } = useMemo(() => {
    if (!supplier) return { grandTotal: 0, totalPaid: 0, balance: 0 }

    const deliveriesTotal =
      supplier.deliveries?.reduce((sum, d) => sum + (d.totalPrice || 0), 0) || 0

    const paymentsTotal =
      supplier.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      grandTotal: deliveriesTotal,
      totalPaid: paymentsTotal,
      balance: deliveriesTotal - paymentsTotal
    }
  }, [supplier])

  if (!supplier) return null

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

      await getDoc(supplierRef) // sync

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
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    setLoading(true)
    try {
      const supplierRef = doc(db, 'suppliers', supplier.id)
      await updateDoc(supplierRef, {
        payments: arrayUnion({
          amount: Number(paymentAmount),
          method: paymentMethod,
          date: new Date().toISOString()
        })
      })

      await getDoc(supplierRef)

      setPaymentAmount('')
      setPaymentMethod('cash')
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
        <Modal.Title className='text-center w-100'>
          {t('supplierDetails', { name: supplier.name })}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs defaultActiveKey='deliveries' id='supplier-tabs' className='mb-3'>
          {/* Deliveries Tab */}
          <Tab eventKey='deliveries' title={t('deliveryHistory')}>
            <h5 className='mt-3'>{t('newDelivery')}</h5>
            <Form className='mb-3'>
              <div className='row g-2'>
                <div className='col-12 col-sm-6 col-md-3'>
                  <Form.Control
                    type='text'
                    placeholder={t('productName')}
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                  />
                </div>
                <div className='col-6 col-md-2'>
                  <Form.Control
                    type='number'
                    step='0.01'
                    placeholder={t('unitPrice')}
                    value={unitPrice}
                    onChange={e => setUnitPrice(e.target.value)}
                  />
                </div>
                <div className='col-6 col-md-2'>
                  <Form.Select
                    value={unitType}
                    onChange={e => setUnitType(e.target.value)}
                  >
                    <option value='pcs'>pcs</option>
                    <option value='kg'>kg</option>
                  </Form.Select>
                </div>
                <div className='col-6 col-md-2'>
                  <Form.Control
                    type='number'
                    step='0.01'
                    placeholder={t('quantityDelivered')}
                    value={quantityDelivered}
                    onChange={e => setQuantityDelivered(e.target.value)}
                  />
                </div>
                <div className='col-6 col-md-2'>
                  <Form.Control
                    type='text'
                    value={`${totalPrice}`}
                    readOnly
                    placeholder={t('totalPrice')}
                  />
                </div>
                <div className='col-12 col-md-1'>
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
            <div className='table-responsive'>
              <Table striped bordered hover size='sm'>
                <thead className='table-dark'>
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
                  {supplier.deliveries?.length > 0 ? (
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
                      <td colSpan='6' className='text-center'>
                        {t('noDeliveries')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Payments Tab */}
          <Tab eventKey='payments' title={t('paymentHistory')}>
            <h5 className='mt-3'>{t('previousPayments')}</h5>
            <div className='table-responsive'>
              <Table striped bordered hover size='sm'>
                <thead className='table-dark'>
                  <tr>
                    <th>{t('amount')}</th>
                    <th>{t('method')}</th>
                    <th>{t('date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.payments?.length > 0 ? (
                    supplier.payments.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.amount}</td>
                        <td>{p.method || '-'}</td>
                        <td>{new Date(p.date).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='3' className='text-center'>
                        {t('noPayments')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Make Payment */}
          <Tab eventKey='makePayment' title={t('makePayment')}>
            <div className='row text-center my-3'>
              <div className='col-12 col-md-4'>
                <h6>
                  {t('grandTotal')}: {grandTotal}
                </h6>
              </div>
              <div className='col-12 col-md-4'>
                <h6>
                  {t('totalPaid')}: {totalPaid}
                </h6>
              </div>
              <div className='col-12 col-md-4'>
                <h6>
                  {t('balance')}: {balance}
                </h6>
              </div>
            </div>

            <Form className='mt-3'>
              <Form.Group className='mb-3'>
                <Form.Label>{t('paymentMethod')}</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value='cash'>{t('cash')}</option>
                  <option value='mpesa'>{t('mpesa')}</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>{t('amountToPay')}</Form.Label>
                <Form.Control
                  type='number'
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder={t('enterPaymentAmount')}
                />
              </Form.Group>

              <Button
                onClick={handleAddPayment}
                disabled={loading}
                className='w-100'
              >
                {loading ? t('processing') : t('completePayment')}
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant='secondary'
          onClick={handleClose}
          disabled={loading}
          className='w-100 w-md-auto'
        >
          {t('close')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SupplierModal
