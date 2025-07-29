import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ editMode, addStockMode, onToggleEdit, onToggleAddStock }) => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <div className='container'>
        <Link className='navbar-brand' to='/'>
          Le Blossom Bar
        </Link>

        <div className='d-flex gap-2'>
          {/* Always visible */}
          {!currentUser && (
            <Link to='/login' className='btn btn-outline-light'>
              Login
            </Link>
          )}
          {
  currentUser?.email === 'bkmurage27@gmail.com' && (
    <Link to='/signup' className='btn btn-outline-light'>
      Sign Up
    </Link>
  )
}


          {/* Only visible when logged in */}
          {currentUser && (
            <>
              <Link to='/New-Product' className='btn btn-outline-primary'>
                New product
              </Link>

              <button className='btn btn-outline-info' onClick={onToggleEdit}>
                {editMode ? 'Exit Edit' : 'Edit Mode'}
              </button>

              <button
                className='btn btn-outline-primary'
                onClick={onToggleAddStock}
              >
                {addStockMode ? 'Exit Add Stock' : 'Add Stock'}
              </button>

              <Link to='/cart' className='btn btn-outline-success'>
                View Cart
              </Link>

              <button
                className='btn btn-outline-warning'
                onClick={() => navigate('/refund')}
              >
                Refund Mode
              </button>

              <button className='btn btn-outline-danger' onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
