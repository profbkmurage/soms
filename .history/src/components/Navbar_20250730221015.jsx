import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useSuperAdmin from '../services/useSuperAdmin'
import './Navbar.css' // ⬅️ Import custom styles here

const Navbar = ({ editMode, addStockMode, onToggleEdit, onToggleAddStock }) => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { isSuperAdmin } = useSuperAdmin()

  const [isCollapsed, setIsCollapsed] = useState(true)
  const toggleNavbar = () => setIsCollapsed(!isCollapsed)

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <div className='container'>
        <Link className='navbar-brand' to='/'>
          China Garden Supermarket
        </Link>

        <button
          className='navbar-toggler'
          type='button'
          onClick={toggleNavbar}
          aria-controls='navbarNav'
          aria-expanded={!isCollapsed}
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div
          className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`}
          id='navbarNav'
        >
          <ul className='navbar-nav ms-auto'>
            {!currentUser && (
              <li className='nav-item nav-hover-1'>
                <Link className='nav-link' to='/login'>
                  Login
                </Link>
              </li>
            )}

            {currentUser && (
              <>
                {isSuperAdmin && (
                  <li className='nav-item nav-hover-2'>
                    <Link className='nav-link' to='/settings'>
                      Settings
                    </Link>
                  </li>
                )}

                <li className='nav-item nav-hover-3'>
                  <Link className='nav-link' to='/New-Product'>
                    New Product
                  </Link>
                </li>

                <li className='nav-item nav-hover-4'>
                  <span
                    className='nav-link'
                    role='button'
                    onClick={onToggleEdit}
                    style={{ cursor: 'pointer' }}
                  >
                    {editMode ? 'Exit Edit' : 'Edit Mode'}
                  </span>
                </li>

                <li className='nav-item nav-hover-5'>
                  <span
                    className='nav-link'
                    role='button'
                    onClick={onToggleAddStock}
                    style={{ cursor: 'pointer' }}
                  >
                    {addStockMode ? 'Exit Add Stock' : 'Add Stock'}
                  </span>
                </li>

                <li className='nav-item nav-hover-6'>
                  <Link className='nav-link' to='/cart'>
                    View Cart
                  </Link>
                </li>

                <li className='nav-item nav-hover-7'>
                  <span
                    className='nav-link'
                    role='button'
                    onClick={() => navigate('/refund')}
                    style={{ cursor: 'pointer' }}
                  >
                    Refund Mode
                  </span>
                </li>

                <li className='nav-item nav-hover-8'>
                  <span
                    className='nav-link'
                    role='button'
                    onClick={logout}
                    style={{ cursor: 'pointer' }}
                  >
                    Logout
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
