import React, { useContext } from 'react'
import { useCart } from '../context/CartContext'
import { FaTrash } from 'react-icons/fa'

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(useCart)

  // Subtotal calculation with NaN fix
  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity) || 0
    return total + price * qty
  }, 0)

  return (
    <div className='container my-4'>
      <h2 className='mb-4'>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table className='table table-bordered table-hover'>
            <thead className='table-dark'>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover'
                      }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>KES {Number(item.price).toLocaleString()}</td>
                  <td>{item.quantity}</td>
                  <td>
                    KES{' '}
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className='btn btn-danger btn-sm'
                      onClick={() => removeFromCart(item)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='d-flex justify-content-between align-items-center mt-4'>
            <h4>Subtotal: KES {subtotal.toLocaleString()}</h4>
            <div>
              <button className='btn btn-secondary me-2' onClick={clearCart}>
                Clear Cart
              </button>
              <button className='btn btn-primary'>Checkout</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
