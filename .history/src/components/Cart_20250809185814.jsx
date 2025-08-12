import React from 'react'
import { useCart } from '../context/CartContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa'

export default function Cart () {
  const { cartItems, removeFromCart, placeOrder, companyName } = useCart()

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.')
      return
    }
    placeOrder(companyName) // pass company name to order
  }

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  )

  return (
    <div className='container my-5'>
      {/* Header */}
      <div className='text-center mb-4'>
        <h1 className='fw-bold text-primary'>
          <FaShoppingCart className='me-2' />
          {companyName ? `${companyName}'s Cart` : 'Your Cart'}
        </h1>
        <p className='text-muted'>
          {companyName
            ? `Review your selected items before placing the order.`
            : 'Add items to your cart to get started.'}
        </p>
      </div>

      {/* Cart Items */}
      {cartItems.length > 0 ? (
        <div className='row g-4'>
          {cartItems.map((item, index) => (
            <div className='col-md-6 col-lg-4' key={`${item.id}-${index}`}>
              <div className='card h-100 shadow-sm border-0 rounded-4'>
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/150'}
                  className='card-img-top rounded-top-4'
                  alt={item.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className='card-body'>
                  <h5 className='card-title text-dark fw-bold'>{item.name}</h5>
                  <p className='card-text text-muted mb-1'>
                    Price:{' '}
                    <span className='fw-semibold text-success'>
                      KSh {item.price}
                    </span>
                  </p>
                  <p className='card-text text-muted mb-1'>
                    Quantity:{' '}
                    <span className='fw-semibold'>{item.quantity}</span>
                  </p>
                  <p className='card-text text-muted'>
                    Subtotal:{' '}
                    <span className='fw-semibold text-primary'>
                      KSh {item.price * item.quantity}
                    </span>
                  </p>
                </div>
                <div className='card-footer bg-transparent border-0 text-end'>
                  <button
                    className='btn btn-outline-danger btn-sm'
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrashAlt className='me-1' />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center text-muted py-5'>
          <FaShoppingCart size={50} className='mb-3' />
          <h5>Your cart is empty</h5>
        </div>
      )}

      {/* Receipt / Total Section */}
      {cartItems.length > 0 && (
        <div className='mt-5 p-4 bg-light rounded shadow-sm'>
          <h4 className='fw-bold'>Receipt Summary</h4>
          <hr />
          {cartItems.map((item, index) => (
            <div key={index} className='d-flex justify-content-between mb-2'>
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>KSh {item.price * item.quantity}</span>
            </div>
          ))}
          <hr />
          <div className='d-flex justify-content-between fw-bold'>
            <span>Total:</span>
            <span className='text-success'>KSh {totalPrice}</span>
          </div>
        </div>
      )}

      {/* Order Button */}
      {cartItems.length > 0 && (
        <div className='text-center mt-4'>
          <button
            className='btn btn-lg px-5 py-3 rounded-pill text-white'
            style={{
              background: 'linear-gradient(90deg, #007bff, #00c6ff)',
              boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)'
            }}
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  )
}
