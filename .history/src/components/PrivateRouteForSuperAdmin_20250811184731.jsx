import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useSuperAdmin from '../services/useSuperAdmin'
import { useLanguage } from '../context/LanguageContext'

const PrivateRouteForSuperAdmin = ({ children }) => {
  const { currentUser } = useAuth()
  const { isSuperAdmin, loading } = useSuperAdmin()
  const { language } = useLanguage()

  const translations = {
    en: {
      checkingPermissions: 'Checking permissions...'
    },
    zh: {
      checkingPermissions: '正在检查权限...'
    }
  }

  if (loading)
    return (
      <div className='text-center mt-5'>
        {translations[language].checkingPermissions}
      </div>
    )

  if (!currentUser || !isSuperAdmin) {
    return <Navigate to='/' />
  }

  return children
}

export default PrivateRouteForSuperAdmin
