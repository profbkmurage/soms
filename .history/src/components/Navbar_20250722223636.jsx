import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({ editMode, addStockMode, onToggleEdit, onToggleAddStock }) => {
  const navigate = useNavigate()

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <div className='container'>
        <Link className='navbar-brand' to='/'>
          🍷 Le Blossom Bar
        </Link>

        <div className='d-flex gap-2'>
          <button className='btn btn-outline-info' onClick={onToggleEdit}>
            ✏️ {editMode ? 'Exit Edit' : 'Edit Mode'}
          </button>

          <button
            className='btn btn-outline-primary'
            onClick={onToggleAddStock}
          >
            ➕ {addStockMode ? 'Exit Add Stock' : 'Add Stock'}
          </button>

          <Link to='/cart' className='btn btn-outline-success'>
            🛒 View Cart
          </Link>
          
          <Link to='/New Product' className='btn btn-outline-primary'>
            New 
          </Link>

          <button
            className='btn btn-outline-warning'
            onClick={() => navigate('/refund')}
          >
            ♻️ Refund Mode
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
