/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useSelector } from 'react-redux'

const AuthGuard = props => {
  const { children, fallback } = props
  const router = useRouter()
  const state = useSelector(state => state)

  useEffect(
    () => {
      if (!router.isReady) {
        return
      }
      if (state?.reducer?.userData?.userData === null) {
        if (router.asPath !== '/') {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace('/login')
        }
      }
    },
    [router.route]
  )

  return <>{children}</>
}

export default AuthGuard
