import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL_API } from 'src/configs/const'
import { store } from 'src/store'
import { getHomeRoute, getOTPRoute } from 'src/layouts/components/acl/getHomeRoute'

import Router from 'next/router'

import toast from 'react-hot-toast'

// ** Axios Imports
import axios from 'axios'
import { setUserData } from '../userData'
import { setUser } from '../users'
import { setArea } from '../area'
import { setCurrency } from '../currency'
import { setCategory } from '../category'
import { setProject } from '../project'
import { setKyc } from '../kyc'
import { setDocument } from '../document'
import { setTypes } from '../type'
import { setAgentLand } from '../agentLand'
import { setBuyRequest } from '../buyRequest'
import { setUserDocuments } from '../userDocuments'
import { setPendingBuy } from '../pendingBuy'
import userKycbyId, { setUserKycById } from '../userKycbyId'
import { setRequestDocument } from '../requestDocument'
import { setTrade } from '../trade'
import { setUserKYC } from '../userKYC'

// ** Register
export const register = createAsyncThunk('appUsers/register', async data => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })

  try {
    const response = await fetch(`${BASE_URL_API}/auth/register`, {
      method: 'POST',
      body: formData
    })
    if (response.status === 200) {
      toast.success('Register Successfully')
      Router.push('/login')
    } else {
      toast.error('Registeration Failed')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** KYC
export const kyc = createAsyncThunk('appUsers/kyc', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/UserKYC`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    console.log('🚀 ~ kyc ~ response:', response)
    if (response.ok) {
      toast.success('KYC submitted successfully')
    } else {
      toast.error('KYC is not Submitted')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Users KYC
export const fetchKyc = createAsyncThunk('appUsers/updateKyc', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/UserKYC`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setUserKYC(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** fetch user kyc by user id
export const fetchUserKycById = createAsyncThunk('appUsers/fetchUserKycById', async data => {
  try {
    let response = await fetch(
      `${BASE_URL_API}/UserKYC/byId?page=${data.page}&take=${data.take}&userId=${data.userId}`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    response = await response.json()
    console.log('🚀 ~ file: index.js:108 ~ fetchUserKycById ~ response:', response)
    if (response.status === 200) {
      store.dispatch(setKyc(response.data))
    } else if (response.statusCode === 404) {
      store.dispatch(setKyc('Record not found'))
    }
  } catch (error) {
    store.dispatch(setKyc('Record not found'))
    toast.error(error.message)
  }
})

// ** KYC
export const updateKycStatus = createAsyncThunk('appUsers/updateKycStatus', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/UserKYC/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({ status: data.status })
    })
    if (response.ok) {
      toast.success('KYC updated successfully')
      try {
        let response = await fetch(`${BASE_URL_API}/UserKYC`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`
          }
        })
        response = await response.json()
        if (response.status === 200) {
          store.dispatch(setUserKYC(response.data))
        } else {
          store.dispatch(setUserKYC('Failed to load data'))
        }
      } catch (error) {
        toast.error(error.message)
      }
    } else {
      toast.error('KYC is not updated')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Login
export const login = createAsyncThunk('appUsers/register', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (response.status === 404) {
      toast.error(response.statusText)
    } else if (response.statusText === 'OK') {
      response = await response.json()
      if (response.user.isActive === false) {
        toast.error('Your account is disabled. Kindly contact the admin')
      } else {
        store.dispatch(setUserData(response))
        const url = getOTPRoute(response.user.role)
        toast.success('OTP sent to you email')
        Router.push(url)
      }
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Login
export const loginOTP = createAsyncThunk('appUsers/loginOTP', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/auth/login/${data.otp}/${data.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    response = await response.json()
    console.log('🚀 ~ file: index.js:195 ~ loginOTP ~ response:', response)
    if (response.status !== 200) {
      toast.error(response.message)
    } else {
      if (response.data.user.isActive === false) {
        toast.error('Your account is disabled. Kindly contact the admin')
      } else {
        try {
          let kyc = await fetch(`${BASE_URL_API}/UserKYC/byId?page=1&take=1&userId=${response.data.user.id}`, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${response.token}`
            }
          })
          kyc = await kyc.json()
          kyc = kyc.data.data[0]
          store.dispatch(setKyc(kyc))
        } catch (error) {
          store.dispatch(setKyc(null))
        }
        store.dispatch(setUserData(response.data))
        const url = getHomeRoute(response.data.user.role)
        toast.success(response.message)
        Router.push(url)
      }
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** forgot password **
export const forgotPassword = createAsyncThunk('appUsers/forgotPassword', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/auth/forgot-password`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: data })
    })
    if (response.statusCode == 200) {
      toast.success('Check your email. Magic link is sent')
    } else {
      toast.error('Request Failed')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Change Password **
export const changePassword = createAsyncThunk('appUsers/changePassword', async data => {
  let token = data.token
  try {
    let response = await fetch(`${BASE_URL_API}/auth/change-password`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword })
    })
    if (response.statusCode == 200) {
      toast.success('Password Changed Successfully')
    } else {
      toast.error('Request Failed')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

export const updateRole = createAsyncThunk('appUsers/updateRole', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/users/updateRole`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({ id: data.id, role: data.role })
    })
    if (response.statusText == 'OK') {
      toast.success('Role Updated Successfully')

      let response = await fetch(`${BASE_URL_API}/users?page=1&take=15`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      if (response.status === 200) {
        store.dispatch(setUser(response.data.data))
      }
    } else {
      toast.error('Request Failed')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

export const updateStatus = createAsyncThunk('appUsers/updateStatus', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/users/updateStatus`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({ id: data.id, isActive: data.isActive })
    })
    response = await response.json()
    console.log('🚀 ~ file: index.js:262 ~ updateStatus ~ response:', response)
    if (response.status === 200) {
      toast.success('Role Updated Successfully')

      let res = await fetch(`${BASE_URL_API}/users?page=1&take=15`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      res = await res.json()
      if (res.status === 200) {
        store.dispatch(setUser(res.data.data))
      }
    } else {
      toast.error('Request Failed')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Logout
export const logout = createAsyncThunk('appUsers/logout', () => {
  window.localStorage.removeItem('userData')
  window.localStorage.removeItem('accessToken')
  router.push('/login')
})

// ** Fetch Users
export const fetchUser = createAsyncThunk('appUsers/fetchUser', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/users?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setUser(response.data.data))
    } else {
      store.dispatch(setUser(response.message))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add Area
export const addArea = createAsyncThunk('appUsers/addArea', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/area`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({ name: data.name, description: data.description })
    })
    response = await response.json()
    if (response.statusCode == 400) {
      toast.error(response.message)
    }
    if (response.name) {
      toast.success('Area added successfully')

      let response = await fetch(`${BASE_URL_API}/area?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setArea(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Area
export const fetchArea = createAsyncThunk('appUsers/fetchArea', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/area?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    store.dispatch(setArea(response.data))
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Delete Area
export const deleteArea = createAsyncThunk('appUsers/deleteArea', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/area/${data.areaId}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.affected) {
      toast.success('Area deleted successfully')

      let response = await fetch(`${BASE_URL_API}/area?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setArea(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add Currency
export const addCurrency = createAsyncThunk('appUsers/addCurrency', async data => {
  console.log('🚀 ~ file: index.js:367 ~ addCurrency ~ data:', data)
  try {
    let response = await fetch(`${BASE_URL_API}/currency`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data.data)
    })
    response = await response.json()
    if (response.statusCode == 400) {
      toast.error(response.message)
    }
    if (response.name) {
      toast.success('Currency added successfully')

      let response = await fetch(`${BASE_URL_API}/currency?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setCurrency(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Currency
export const fetchCurrency = createAsyncThunk('appUsers/fetchCurrency', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/currency?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setCurrency(response.data))
    } else if (response.statusCode === 404) {
      store.dispatch(setCurrency('Record not found'))
    } else {
      store.dispatch(setCurrency(response.data))
    }
  } catch (error) {
    store.dispatch(setCurrency('Record not found'))
  }
})

// ** Delete Currency
export const deleteCurrency = createAsyncThunk('appUsers/deleteCurrency', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/currency/${data.currencyId}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.affected) {
      toast.success('Currency deleted successfully')

      let response = await fetch(`${BASE_URL_API}/currency?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setCurrency(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add Category
export const addCategory = createAsyncThunk('appUsers/addCategory', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/category`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({ name: data.name, description: data.description })
    })
    response = await response.json()
    if (response.statusCode == 400) {
      toast.error(response.message)
    }
    if (response.name) {
      toast.success('Category added successfully')

      let response = await fetch(`${BASE_URL_API}/category?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setCategory(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Category
export const fetchCategory = createAsyncThunk('appUsers/fetchCategory', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/category?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    store.dispatch(setCategory(response.data))
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Delete Category
export const deleteCategory = createAsyncThunk('appUsers/deleteCategory', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/category/${data.categoryId}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.affected) {
      toast.success('Category deleted successfully')

      let response = await fetch(`${BASE_URL_API}/category?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setCategory(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add Project
export const addProject = createAsyncThunk('appUsers/addProject', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/project`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        name: data.name,
        price: data.price,
        description: data.description,
        saleAddress: data.saleAddress,
        nftAddress: data.nftAddress,
        categoryId: data.categoryId,
        currencyId: data.currencyId,
        developerId: data.developerId
      })
    })
    response = await response.json()
    toast.success('Successfully added')
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add Project
export const updateProject = createAsyncThunk('appUsers/updateProject', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/project/${data.id}`, {
      method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data.data)
    })
    response = await response.json()
    toast.success('Successfully Updated')
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Project
export const fetchProject = createAsyncThunk('appUsers/fetchProject', async data => {
  try {
    let response = await fetch(
      `${BASE_URL_API}/project?page=${data.page}&take=${data.take}&developerId=${data.developerId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setProject(response.data))
    } else {
      store.dispatch(setProject(response.message))
    }
  } catch (error) {
    store.dispatch(setProject('Failed to load data'))
  }
})

// ** Fetch Project
export const fetchProjects = createAsyncThunk('appUsers/fetchProjects', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/project?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setProject(response.data))
    } else {
      store.dispatch(setProject(response.message))
    }
  } catch (error) {
    store.dispatch(setProject([null]))
  }
})

// ** Fetch Project
export const deleteProject = createAsyncThunk('appUsers/deleteProject', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/project/${data.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.affected) {
      toast.success('Record deleted successfully')

      let response = await fetch(`${BASE_URL_API}/project?page=1&take=10`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setProject(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Users
export const fetchData = createAsyncThunk('appUsers/fetchData', async data => {
  let response = await axios.get('/apps/users/list', {
    data
  })
})

// ** Fetch admin
export const fetchAdmin = createAsyncThunk('appUsers/fetchAdmin', async data => {
  const response = await axios.get('/apps/admins/list', {
    data
  })

  return response.data
})

// ** Add User
export const addUser = createAsyncThunk('appUsers/addUser', async (data, { getState, dispatch }) => {
  const response = await axios.post('/apps/users/add-user', {
    data
  })
  dispatch(fetchData(getState().user.data))

  return response.data
})

// ** Delete User
export const deleteUser = createAsyncThunk('appUsers/deleteUser', async (id, { getState, dispatch }) => {
  const response = await axios.delete('/apps/users/delete', {
    data: id
  })
  dispatch(fetchData(getState().user.data))

  return response.data
})

// ** Add Type
export const addType = createAsyncThunk('appUsers/addType', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/type`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        projectId: data.project
      })
    })
    response = await response.json()
    if (response.createType) {
      toast.success('Successfully added')

      let response = await fetch(`${BASE_URL_API}/type?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setTypes(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Type
export const fetchType = createAsyncThunk('appUsers/fetchType', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/type?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setTypes(response.data))
    } else {
      store.dispatch(setTypes(response.message))
    }
  } catch (error) {
    toast.error(error.message) // toast.error(error.message)
  }
})

// ** Delete Type
export const deleteType = createAsyncThunk('appUsers/deleteCurrency', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/type/${data.currencyId}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    console.log('🚀 ~ file: index.js:730 ~ deleteType ~ response:', response)
    if (response.deleteType.affected === 1) {
      toast.success('Type deleted successfully')

      let response = await fetch(`${BASE_URL_API}/type?page=1&take=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setTypes(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add Land
export const addLand = createAsyncThunk('appUsers/land', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/agent-land/createBulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (response.ok) {
      toast.success('Land added successfully')
    } else {
      toast.error('Failed')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Agent Land
export const fetchAgentLand = createAsyncThunk('appUsers/fetchAgentLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/agent-land?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setAgentLand(response.data))
    } else {
      store.dispatch(setAgentLand(response.message))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Agent Land
export const fetchAgentLandById = createAsyncThunk('appUsers/fetchAgentLandById', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/agent-land/${data.landId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setAgentLand(response.data))
    } else {
      store.dispatch(setAgentLand(response.message))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Agent Land
export const updateAgentLand = createAsyncThunk('appUsers/updateAgentLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/agent-land/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        status: data.status
      })
    })
    response = await response.json()
    console.log('🚀 ~ file: index.js:778 ~ updateAgentLand ~ response:', response)
    toast.success('Status Updated')

    // if (response.status === 200) {
    //   store.dispatch(setAgentLand(response.data))
    // } else {
    //   store.dispatch(setAgentLand(response.message))
    // }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Buy Requests
export const fetchBuyRequests = createAsyncThunk('appUsers/fetchBuyRequests', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/buy?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setBuyRequest(response.data))
    } else {
      store.dispatch(setBuyRequest(response.message))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Buy Requests
export const fetchBuyRequestsById = createAsyncThunk('appUsers/fetchBuyRequestsById', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/buy/userId?page=${data.page}&take=${data.take}&userId=${data.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setPendingBuy(response.data))
    } else {
      store.dispatch(setPendingBuy(response.message))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Buy Requests
export const fetchBuysByUserId = createAsyncThunk('appUsers/fetchBuysByUserId', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/buy/userId?page=${data.page}&take=${data.take}&userId=${data.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setPendingBuy(response.data))
    } else {
      store.dispatch(setPendingBuy(response.message))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Buy Requests
export const updateBuyRequests = createAsyncThunk('appUsers/updateBuyRequests', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/buy/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        signatures: data.signatures,
        signatureTime: data.signatureTime,
        isSigned: true
      })
    })
    response = await response.json()
    if (response.status === 200) {
      toast.success(response.message)
    } else {
      toast.error(res.message)
    }
  } catch (error) {
    toast.error(error.message)
  }
})

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: [],
    total: 1,
    data: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.users
      state.total = action.payload.total
      state.data = action.payload.data
      state.allData = action.payload.allData
    })
  }
})

// ** Add Buy Land
export const buyLand = createAsyncThunk('appUsers/buyLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/buy`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data)
    })
    response = await response.json()
    console.log('🚀 ~ file: index.js:910 ~ buyLand ~ response:', response)
    toast.success('Success')
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Buy Land by user Id
export const buyLandById = createAsyncThunk('appUsers/buyLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/buy`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        wallet: data.wallet,
        tokenId: data.tokenId,
        typeId: data.typeId,
        agentLandId: data.agentLandId,
        agentWallet: data.agentWallet,
        projectId: data.projectId,
        userId: data.userId
      })
    })
    response = await response.json()
    toast.success('Success')
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Update Buy Land
export const updateBuyLand = createAsyncThunk('appUsers/updateBuyLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/buy/${data.id}`, {
      method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data.data)
    })
    response = await response.json()
    if (response.status === 200) {
      toast.success('Success')
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add user Documents
export const uploadUserDocuments = createAsyncThunk('appUsers/uploadUserDocuments', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/userDocuments`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        url: data.url,
        userId: data.userId
      })
    })
    response = await response.json()

    let res = await fetch(
      `${BASE_URL_API}/userDocuments?page=${data.page}&take=${data.take}&userId=${response.userId}`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    res = await res.json()
    if (res.status === 200) {
      store.dispatch(setUserDocuments(res.data))
    } else if (res.statusCode === 404) {
      store.dispatch(setUserDocuments('Record not found'))
    }
    toast.success('File successfully uploaded')
  } catch (error) {
    toast.error(error.message)
  }
})

// ** fetch user documents
export const fetchUserDocuments = createAsyncThunk('appUsers/fetchUserDocuments', async data => {
  try {
    let response = await fetch(
      `${BASE_URL_API}/userDocuments?page=${data.page}&take=${data.take}&userId=${data.userId}`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setUserDocuments(response.data))
    } else if (response.statusCode === 404) {
      store.dispatch(setUserDocuments('Record not found'))
    }
  } catch (error) {
    store.dispatch(setUserDocuments('Record not found'))
    toast.error(error.message)
  }
})

// ** Delete Document
export const deleteDocument = createAsyncThunk('appUsers/deleteDocument', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/userDocuments/${data.documentId}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.affected) {
      toast.success('Document deleted successfully')

      let response = await fetch(`${BASE_URL_API}/userDocuments?page=1&take=10&userId=${data.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setUserDocuments(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Request Documents from user
export const requestDocuments = createAsyncThunk('appUsers/requestDocuments', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/requestDocuments`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        message: data.message,
        userId: data.userId
      })
    })
    response = await response.json()

    let res = await fetch(
      `${BASE_URL_API}/requestDocuments?page=${data.page}&take=${data.take}&userId=${data.userId}`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    res = await res.json()
    if (res.status === 200) {
      store.dispatch(setRequestDocument(res.data))
    } else if (res.statusCode === 404) {
      store.dispatch(setRequestDocument('Record not found'))
    }
    toast.success('File successfully uploaded')
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Request Documents from user
export const fetchRequestedDocuments = createAsyncThunk('appUsers/fetchRequestedDocuments', async data => {
  try {
    let res = await fetch(
      `${BASE_URL_API}/requestDocuments?page=${data.page}&take=${data.take}&userId=${data.userId}`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    res = await res.json()
    if (res.status === 200) {
      store.dispatch(setRequestDocument(res.data))
    } else if (res.statusCode === 404) {
      store.dispatch(setRequestDocument('Record not found'))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** delete Request Documents from user
export const deleteRequestedDocuments = createAsyncThunk('appUsers/fetchRequestedDocuments', async data => {
  try {
    let res = await fetch(`${BASE_URL_API}/requestDocuments/${data.documentId}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    res = await res.json()
    if (res.affected) {
      toast.success('Message deleted successfully')

      let response = await fetch(`${BASE_URL_API}/requestDocuments?page=1&take=10&userId=${data.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      response = await response.json()
      store.dispatch(setRequestDocument(response.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add Trade
export const tradeLand = createAsyncThunk('appUsers/tradeLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/trade`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data.data)
    })
    response = await response.json()
    if (response.status === 200) {
      toast.success(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

// ** Fetch Trade
export const fetchTradeLand = createAsyncThunk('appUsers/fetchTradeLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/trade?page=${data.page}&take=${data.take}`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setTrade(response.data))
    }
    if (response.status === 404) {
      toast.error(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

// ** Fetch Trade
export const fetchTradeLandByUserId = createAsyncThunk('appUsers/fetchTradeLandByUserId', async data => {
  try {
    let response = await fetch(
      `${BASE_URL_API}/trade/userId?page=${data.page}&take=${data.take}&userId=${data.userId}`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    response = await response.json()
    console.log('🚀 ~ file: index.js:1176 ~ fetchTradeLandByUserId ~ response:', response)
    if (response.status === 200) {
      store.dispatch(setTrade(response.data))
    }
    if (response.status === 404) {
      toast.error(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

// ** Fetch Trade
export const fetchTradeLandByBuyerId = createAsyncThunk('appUsers/fetchTradeLandByBuyerId', async data => {
  try {
    let response = await fetch(
      `${BASE_URL_API}/trade/buyerId?page=${data.page}&take=${data.take}&buyerId=${data.userId}`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    response = await response.json()
    console.log('🚀 ~ file: index.js:1176 ~ fetchTradeLandByUserId ~ response:', response)
    if (response.status === 200) {
      store.dispatch(setTrade(response.data))
    }
    if (response.status === 404) {
      toast.error(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

// ** Update Trade
export const updateTradeLand = createAsyncThunk('appUsers/updateTradeLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/trade/${data.landId}`, {
      method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data.data)
    })
    response = await response.json()
    if (response.status === 200) {
      toast.success(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

// ** Add documents to the catalog
export const addDocumentCatalog = createAsyncThunk('appUsers/addDocumentCatalog', async data => {
  try {
    const formData = new FormData()
    formData.append('isAdmin', data.data.isAdmin)
    formData.append('userId', data.data.userId)
    formData.append('document', data.data.document)

    let response = await fetch(`${BASE_URL_API}/documentCatalogue`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        Authorization: `Bearer ${data.token}`
      },
      body: formData
    })
    response = await response.json()
    if (response.status == 400) {
      toast.error(response.message)
    }
    if (response.status === 200) {
      toast.success('Document added successfully')

      let res = await fetch(`${BASE_URL_API}/documentCatalogue`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      res = await res.json()
      store.dispatch(setDocument(res.data))
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1387 ~ addDocumentCatalog ~ error:', error)
    toast.error(error.message)
  }
})

// ** fetch documents
export const fetchDocument = createAsyncThunk('appUsers/fetchDocument', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/documentCatalogue`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    store.dispatch(setDocument(response.data))
  } catch (error) {
    toast.error(error.message)
  }
})

// ** fetch documents by user Id
export const fetchDocumentByUserId = createAsyncThunk('appUsers/fetchDocumentByUserId', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/documentCatalogue/userId?userId=${data.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setDocument(response.data))
    } else {
      toast.error(response.message)
    }
  } catch (error) {
    toast.error(error.message)
  }
})

//** delete document */
export const deleteDocumentCatalog = createAsyncThunk('appUsers/deleteDocumentCatalog', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/documentCatalogue/${data.documentId}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status) {
      toast.success(response.message)

      let res = await fetch(`${BASE_URL_API}/documentCatalogue`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      })
      res = await res.json()
      store.dispatch(setDocument(res.data))
    }
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Add rent
export const rentLand = createAsyncThunk('appUsers/rentLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/rent`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data.data)
    })
    response = await response.json()
    if (response.status === 200) {
      toast.success(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

// ** Fetch rent
export const fetchRentLand = createAsyncThunk('appUsers/fetchRentLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/rent?page=${data.page}&take=${data.take}`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    response = await response.json()
    if (response.status === 200) {
      store.dispatch(setTrade(response.data))
    }
    if (response.status === 404) {
      toast.error(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

// ** Fetch rent
export const updateRentLand = createAsyncThunk('appUsers/updateTradeLand', async data => {
  try {
    let response = await fetch(`${BASE_URL_API}/rent/${data.landId}`, {
      method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify(data.data)
    })
    response = await response.json()
    if (response.status === 200) {
      toast.success(response.message)
    }
  } catch (error) {
    console.log('🚀 ~ file: index.js:1160 ~ tradeLand ~ error:', error)
    toast.error(error.message)
  }
})

export default appUsersSlice.reducer
