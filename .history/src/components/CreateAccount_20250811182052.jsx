// src/components/CreateAccount.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useTranslation } from 'react-i18next'

const CreateAccount = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('cashier') // default role
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      const userData = {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: new Date()
      }

      if (role === 'company') {
        userData.companyName = companyName
      }

      await setDoc(doc(db, 'users', user.uid), userData)

      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className='container mt-5'>
      <h2>{t('createAccount.title')}</h2>
      {error && (
        <div className='alert alert-danger'>
          {t('createAccount.error')}: {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label>{t('createAccount.email')}</label>
          <input
            type='email'
            className='form-control'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='mb-3'>
          <label>{t('createAccount.password')}</label>
          <input
            type='password'
            className='form-control'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className='mb-3'>
          <label>{t('createAccount.role')}</label>
          <select
            className='form-select'
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value='cashier'>{t('createAccount.cashier')}</option>
            <option value='storekeeper'>
              {t('createAccount.storekeeper')}
            </option>
            <option value='manager'>{t('createAccount.manager')}</option>
            <option value='superadmin'>{t('createAccount.superadmin')}</option>
            <option value='company'>{t('createAccount.company')}</option>
          </select>
        </div>

        {role === 'company' && (
          <div className='mb-3'>
            <label>{t('createAccount.companyName')}</label>
            <input
              type='text'
              className='form-control'
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </div>
        )}

        <button type='submit' className='btn btn-primary'>
          {t('createAccount.submit')}
        </button>
      </form>
    </div>
  )
}

export default CreateAccount
