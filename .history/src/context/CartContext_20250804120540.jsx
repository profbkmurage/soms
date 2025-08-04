// src/components/CreateAccount.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const CreateAccount = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('cashier') // default role
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    try {
      // ✅ CREATE NEW USER
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // ✅ SAVE USER TO FIRESTORE
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
      <h2>Create New Account</h2>
      {error && <div className='alert alert-danger'>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label>Email</label>
          <input
            type='email'
            className='form-control'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='mb-3'>
          <label>Password</label>
          <input
            type='password'
            className='form-control'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className='mb-3'>
          <label>Role</label>
          <select
            className='form-select'
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value='cashier'>Cashier</option>
            <option value='storekeeper'>Storekeeper</option>
            <option value='manager'>Manager</option>
            <option value='superadmin'>Superadmin</option>
          </select>
        </div>
        <button type='submit' className='btn btn-primary'>
          Create Account
        </button>
      </form>
    </div>
  )
}

export default CreateAccount
