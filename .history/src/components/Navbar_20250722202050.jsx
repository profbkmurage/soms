import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = ({ onToggleEdit, onToggleAddStock, editMode, addStockMode }) => {
  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <div className='container'>
        
        <li className='nav-item'>
          <Link to='/add-product' className='btn btn-outline-primary mx-2'>
            New Product
          </Link>
        </li>
        
        <Link to='/' className='navbar-brand'>
          StockBar
        </Link>

        <div className='d-flex gap-2'>
          <button
            className={`btn btn-sm ${
              editMode ? 'btn-secondary' : 'btn-warning'
            }`}
            onClick={onToggleEdit}
          >
            {editMode ? 'Exit Stock Mode' : '📋 Take Stock'}
          </button>

          <button
            className={`btn btn-sm ${
              addStockMode ? 'btn-secondary' : 'btn-info'
            }`}
            onClick={onToggleAddStock}
          >
            {addStockMode ? 'Exit Update Mode' : '🔁 Update Stock'}
          </button>

          <Link to='/cart' className='btn btn-sm btn-success'>
            🛒 View Cart
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
