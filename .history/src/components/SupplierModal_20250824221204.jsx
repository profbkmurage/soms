// src/components/SupplierModal.jsx
import React, { useState } from 'react'
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import {
  Modal,
  Button,
  Form,
  Table,
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const SupplierModal = ({ show, handleClose, supplier, refreshSuppliers }) => {
  const { t } = useTranslation()

  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)

  if (!supplier) return null

  // Add payment for a specific delivery
  const handlePay = async deliveryIdx => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    setLoading(true)
    try {
      const supplierRef = doc(db, 'suppliers', supplier.id)

      const payment = {
        amount: Number(paymentAmount),
        method: paymentMethod,
        date: new Date().toISOString(),
        deliveryIdx
      }

      await updateDoc(supplierRef, {
        payments: arrayUnion(payment)
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

  // Helper: calculate payments made per delivery
  const getDeliveryPayments = idx => {
    return supplier.payments?.filter(p => p.deliveryIdx === idx) || []
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
            
            <div className='table-responsive'>
              <Table striped bordered hover size='sm'>
                <thead className='table-dark'>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('productName')}</th>
                    <th>{t('quantity')}</th>
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
                        <td>
                          {d.quantityDelivered} {d.unitType}
                        </td>
                        <td>{d.unitPrice}</td>
                        <td>{d.totalPrice}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='5' className='text-center'>
                        {t('noDeliveries')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Make Payment */}
          <Tab eventKey='makePayment' title={t('makePayment')}>
            <h5 className='mt-3'>{t('pendingPayments')}</h5>
            <div className='table-responsive'>
              <Table striped bordered hover size='sm'>
                <thead className='table-dark'>
                  <tr>
                    <th>{t('productName')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('totalPrice')}</th>
                    <th>{t('paid')}</th>
                    <th>{t('balance')}</th>
                    <th>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.deliveries?.map((d, idx) => {
                    const payments = getDeliveryPayments(idx)
                    const totalPaid = payments.reduce(
                      (sum, p) => sum + p.amount,
                      0
                    )
                    const balance = d.totalPrice - totalPaid

                    if (balance <= 0) return null // fully paid

                    return (
                      <tr key={idx}>
                        <td>{d.productName}</td>
                        <td>
                          {d.quantityDelivered} {d.unitType}
                        </td>
                        <td>{d.totalPrice}</td>
                        <td>{totalPaid}</td>
                        <td>{balance}</td>
                        <td>
                          <Form.Select
                            size='sm'
                            className='mb-1'
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                          >
                            <option value='cash'>{t('cash')}</option>
                            <option value='mpesa'>{t('mpesa')}</option>
                          </Form.Select>
                          <Form.Control
                            type='number'
                            size='sm'
                            className='mb-1'
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                            placeholder={t('enterPaymentAmount')}
                          />
                          <Button
                            size='sm'
                            className='w-100'
                            onClick={() => handlePay(idx)}
                            disabled={loading}
                          >
                            {t('pay')}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Payment History */}
          <Tab eventKey='payments' title={t('paymentHistory')}>
            <div className='table-responsive'>
              <Table striped bordered hover size='sm'>
                <thead className='table-dark'>
                  <tr>
                    <th>{t('deliveryDate')}</th>
                    <th>{t('productName')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('amountPaid')}</th>
                    <th>{t('balance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.deliveries?.map((d, idx) => {
                    const payments = getDeliveryPayments(idx)
                    const totalPaid = payments.reduce(
                      (sum, p) => sum + p.amount,
                      0
                    )
                    const balance = d.totalPrice - totalPaid
                    const lastPayment =
                      payments.length > 0 ? payments[payments.length - 1] : null

                    if (payments.length === 0) return null

                    return (
                      <tr key={idx}>
                        <td>{new Date(d.date).toLocaleString()}</td>
                        <td>{d.productName}</td>
                        <td>
                          {d.quantityDelivered} {d.unitType}
                        </td>
                        <td>
                          <OverlayTrigger
                            placement='top'
                            overlay={
                              <Tooltip>
                                {lastPayment
                                  ? new Date(lastPayment.date).toLocaleString()
                                  : ''}
                              </Tooltip>
                            }
                          >
                            <span>{totalPaid}</span>
                          </OverlayTrigger>
                        </td>
                        <td>{balance}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
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
