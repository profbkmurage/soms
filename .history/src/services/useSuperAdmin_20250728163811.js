import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase' // adjust if your Firebase config is in another file

const useSuperAdmin = () => {
  const { currentUser } = useAuth()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!currentUser) {
        setIsSuperAdmin(false)
        setLoading(false)
        return
      }

      const userRef = doc(db, 'users', currentUser.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        setIsSuperAdmin(userSnap.data().isSuperAdmin === true)
      } else {
        setIsSuperAdmin(false)
      }

      setLoading(false)
    }

    fetchUserRole()
  }, [currentUser])

  return { isSuperAdmin, loading }
}

export default useSuperAdmin
