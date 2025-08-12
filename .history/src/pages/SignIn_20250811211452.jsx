// src/components/SignIn.jsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'

const SignIn = () => {
  const { t } = useTranslation()
  const { SignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('cashier') // default role
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      const userCredential = await SignIn(email, password)
      const user = userCredential.user

      // Save the user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: new Date()
      })

      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className='container mt-5'>
      <h2>{t('createNewUser')}</h2>
      {error && (
        <div className='alert alert-danger'>{t('errorAlert', { error })}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label>{t('email')}</label>
          <input
            type='email'
            className='form-control'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='mb-3'>
          <label>{t('password')}</label>
          <input
            type='password'
            className='form-control'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className='mb-3'>
          <label>{t('role')}</label>
          <select
            className='form-select'
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value='cashier'>{t('cashier')}</option>
            <option value='storekeeper'>{t('storekeeper')}</option>
            <option value='manager'>{t('manager')}</option>
            <option value='superadmin'>{t('superadmin')}</option>
          </select>
        </div>
        <button type='submit' className='btn btn-primary'>
          {t('createAccount')}
        </button>
      </form>
    </div>
  )
}

export default SignIn
