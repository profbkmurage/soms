import React from 'react'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart()

  const total = cartItems.reduce((sum, item) => {
    if (!item || typeof item.price !== 'number' || typeof item.qty !== 'number')
      return sum
    return sum + item.price * item.qty
  }, 0)

  return (
    <div className='container mt-4'>
      <h3>🛒 Cart Summary</h3>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.product.productName}</td>
                  <td>{item.qty}</td>
                  <td>KES {item.product.price}</td>
                  <td>KES {item.product.price * item.qty}</td>
                  <td>
                    <button
                      className='btn btn-sm btn-danger'
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>Total: KES {total.toFixed(2)}</h5>

          <div className='d-flex gap-2 mt-3'>
            <button className='btn btn-warning' onClick={clearCart}>
              Clear Cart
            </button>
            <button
              className='btn btn-success'
              onClick={() => alert('Ready for receipt')}
            >
              Generate Receipt
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
