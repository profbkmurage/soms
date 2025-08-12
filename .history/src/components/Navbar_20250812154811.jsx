// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from 'react-i18next' // <-- added

const Navbar = ({
  editMode,
  addStockMode,
  onToggleEdit,
  onToggleAddStock,
  isSuperadmin
}) => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [role, setRole] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [loadingRole, setLoadingRole] = useState(false)

  const { language, toggleLanguage } = useLanguage()
  const { t } = useTranslation() // translation hook

  useEffect(() => {
    let mounted = true
    const fetchRole = async () => {
      if (!currentUser?.uid) {
        if (mounted) setRole(null)
        return
      }
      setLoadingRole(true)
      try {
        const userRef = doc(db, 'users', currentUser.uid)
        const snap = await getDoc(userRef)
        if (snap.exists() && mounted) {
          setRole(snap.data().role || null)
        } else if (mounted) {
          setRole(null)
        }
      } catch (err) {
        console.error('Failed to fetch user role:', err)
        if (mounted) setRole(null)
      } finally {
        if (mounted) setLoadingRole(false)
      }
    }
    fetchRole()
    return () => {
      mounted = false
    }
  }, [currentUser])

  const isCompany = role === 'company'
  const isSuper = role === 'superadmin' || isSuperadmin

  const toggleNavbar = () => setIsCollapsed(prev => !prev)

  const handleNavClick = cb => {
    setIsCollapsed(true)
    if (typeof cb === 'function') cb()
  }

  const handleLogout = async () => {
    try {
      await logout()
      setRole(null)
      setIsCollapsed(true)
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
      alert(t('logoutFail'))
    }
  }

  return (
    <>
      <style>{`
        .nav-item .nav-link { transition: background .15s, color .15s; border-radius: 6px; }
        .nav-hover-1 .nav-link:hover { background:#f6e05e; color:#000; }
        .nav-hover-2 .nav-link:hover { background:#60a5fa; color:#fff; }
        .nav-hover-3 .nav-link:hover { background:#34d399; color:#064e3b; }
        .nav-hover-4 .nav-link:hover { background:#fb7185; color:#fff; }
        .nav-hover-5 .nav-link:hover { background:#a78bfa; color:#fff; }
        .nav-hover-6 .nav-link:hover { background:#f97316; color:#fff; }
        .nav-hover-7 .nav-link:hover { background:#f43f5e; color:#fff; }
        .nav-hover-8 .nav-link:hover { background:#06b6d4; color:#fff; }
        .nav-hover-9 .nav-link:hover { background:#7c3aed; color:#fff; }
        .navbar-dark .navbar-toggler { border-color: rgba(255,255,255,0.12); }
      `}</style>

      <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
        <div className='container'>
          <Link
            className='navbar-brand'
            to='/'
            onClick={() => setIsCollapsed(true)}
          >
            {t('appName')}
          </Link>

          <button
            className='navbar-toggler'
            type='button'
            aria-controls='navbarNav'
            aria-expanded={!isCollapsed}
            aria-label={t('toggleNavigation')}
            onClick={toggleNavbar}
          >
            <span className='navbar-toggler-icon' />
          </button>

          <div
            className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`}
            id='navbarNav'
          >
            <ul className='navbar-nav ms-auto align-items-lg-center'>
              {/* Language toggle */}
              <li className='nav-item nav-hover-6'>
                <button
                  className='nav-link btn btn-sm'
                  style={{
                    background: '#ffcc00',
                    color: '#000',
                    border: 'none'
                  }}
                  onClick={() => {
                    toggleLanguage()
                    setIsCollapsed(true)
                  }}
                >
                  {language === 'en' ? '中文' : 'EN'}
                </button>
              </li>

              {/* Login */}
              {!currentUser && (
                <li className='nav-item nav-hover-1'>
                  <Link
                    className='nav-link'
                    to='/login'
                    onClick={() => handleNavClick()}
                  >
                    {t('login')}
                  </Link>
                </li>
              )}

              {currentUser && loadingRole && (
                <li className='nav-item nav-hover-6'>
                  <span className='nav-link'>{t('checkingRole')}</span>
                </li>
              )}

              {currentUser && !loadingRole && (
                <>
                  {isCompany ? (
                    <>
                      <li className='nav-item nav-hover-6'>
                        <Link
                          className='nav-link'
                          to='/'
                          onClick={() => handleNavClick()}
                        >
                          {t('products')}
                        </Link>
                      </li>

                      <li className='nav-item nav-hover-9'>
                        <Link
                          className='nav-link'
                          to='/orders'
                          onClick={() => handleNavClick()}
                        >
                          {t('viewOrders')}
                        </Link>
                      </li>

                      <li className='nav-item nav-hover-7'>
                        <Link
                          className='nav-link'
                          to='/cart'
                          onClick={() => handleNavClick()}
                        >
                          {t('viewCart')}
                        </Link>
                      </li>

                      <li className='nav-item nav-hover-8'>
                        <span
                          role='button'
                          className='nav-link'
                          onClick={handleLogout}
                        >
                          {t('logout')}
                        </span>
                      </li>
                    </>
                  ) : (
                    <>
                      {isSuper && (
                        <li className='nav-item nav-hover-2'>
                          <Link
                            className='nav-link'
                            to='/settings'
                            onClick={() => handleNavClick()}
                          >
                            {t('settings')}
                          </Link>
                        </li>
                      )}
                      <li className='nav-item nav-hover-3'>
                        <Link
                          className='nav-link'
                          to='/New-Product'
                          onClick={() => handleNavClick()}
                        >
                          {t('newProduct')}
                        </Link>
                      </li>
                      <li className='nav-item nav-hover-4'>
                        <span
                          className='nav-link'
                          role='button'
                          onClick={() => {
                            onToggleEdit?.()
                            handleNavClick()
                          }}
                        >
                          {editMode ? t('exitEdit') : t('editMode')}
                        </span>
                      </li>
                      <li className='nav-item nav-hover-5'>
                        <span
                          className='nav-link'
                          role='button'
                          onClick={() => {
                            onToggleAddStock?.()
                            handleNavClick()
                          }}
                        >
                          {addStockMode ? t('exitAddStock') : t('addStock')}
                        </span>
                      </li>
                      <li className='nav-item nav-hover-6'>
                        <Link
                          className='nav-link'
                          to='/cart'
                          onClick={() => handleNavClick()}
                        >
                          {t('viewCart')}
                        </Link>
                      </li>
                      {isSuper && (
                        <li className='nav-item nav-hover-7'>
                          <span
                            className='nav-link'
                            role='button'
                            onClick={() => {
                              handleNavClick(() => navigate('/refund'))
                            }}
                          >
                            {t('refundMode')}
                          </span>
                        </li>
                      )}
                      <li className='nav-item nav-hover-8'>
                        <span
                          className='nav-link'
                          role='button'
                          onClick={() => {
                            handleLogout()
                            handleNavClick()
                          }}
                        >
                          {t('logout')}
                        </span>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
