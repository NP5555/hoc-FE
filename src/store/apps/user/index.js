import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BASE_URL_API } from 'src/configs/const'
import { store } from 'src/store'
import { getHomeRoute, getOTPRoute } from 'src/layouts/components/acl/getHomeRoute'
import { formatErrorMessage, logError } from 'src/utils/errorHandler'

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
import { setDocument, setDocumentLoading, setDocumentError } from '../document'
import { setTypes } from '../type'
import { setAgentLand } from '../agentLand'
import { setBuyRequest } from '../buyRequest'
import { setUserDocuments } from '../userDocuments'
import { setPendingBuy, setPendingBuyLoading, setPendingBuyError } from '../pendingBuy'
import userKycbyId, { setUserKycById } from '../userKycbyId'
import { setRequestDocument, setRequestDocumentLoading, setRequestDocumentError } from '../requestDocument'
import { setTrade } from '../trade'
import { setUserKYC } from '../userKYC'

// ** Register
export const register = createAsyncThunk('appUsers/register', async data => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })

  try {
    console.log('Sending registration data to API:', data)
    
    const response = await fetch(`${BASE_URL_API}/auth/register`, {
      method: 'POST',
      body: formData
    })
    
    // Get response data regardless of status
    const responseData = await response.json().catch(() => null)
    console.log('Registration response:', response.status, responseData)
    
    if (response.status === 200) {
      toast.success('Register Successfully')
      Router.push('/login')
      return responseData
    } else if (response.status === 422) {
      // Handle validation errors
      const validationErrors = responseData?.message || []
      
      // Display specific validation error messages
      if (validationErrors.length > 0) {
        const firstError = validationErrors[0]
        const errorField = firstError.property
        const errorConstraint = Object.values(firstError.constraints || {})[0]
        
        // Display specific error messages based on field
        if (errorField === 'phone') {
          toast.error('Invalid phone number format. Please enter a complete international phone number with country code.')
        } else {
          toast.error(`${errorField}: ${errorConstraint}`)
        }
      } else {
        toast.error('Validation failed. Please check your inputs.')
      }
      
      throw new Error('Validation error')
    } else {
      // Handle other errors
      const errorMessage = responseData?.message || 'Registration Failed'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('Registration error:', error)
    toast.error(error.message || 'Registration Failed')
    throw error
  }
})

// ** KYC
export const kyc = createAsyncThunk('appUsers/kyc', async data => {
  try {
    console.log('Submitting KYC for user ID:', data.userId);
    
    // Ensure company field is not empty
    if (!data.company || data.company === '') {
      data.company = 'N/A';
    }
    
    // First check if user already has a KYC entry
    try {
      // For this check, we need a token. If one isn't available, we'll skip this step
      if (data.token) {
        const checkResponse = await fetch(`${BASE_URL_API}/UserKYC/byId?page=1&take=1&userId=${data.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`
          }
        });
        
        // If we get a successful response and there's data, user already has KYC
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.data && checkData.data.data && checkData.data.data.length > 0) {
            console.log('User already has KYC, updating instead of creating');
            // Extract the KYC ID
            const existingKycId = checkData.data.data[0].id;
            
            // Update the existing KYC instead of creating a new one
            const updateResponse = await fetch(`${BASE_URL_API}/UserKYC/${existingKycId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.token}`
              },
              body: JSON.stringify({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                address: data.address,
                street: data.street,
                state: data.state,
                postalCode: data.postalCode,
                mobileNumber: data.mobileNumber,
                company: data.company || 'N/A',
                pubkey: data.pubkey,
                certificates: data.certificates,
                passportImage: data.passportImage,
                nicFrontImage: data.nicFrontImage,
                nicBackImage: data.nicBackImage,
                signatureImage: data.signatureImage,
                isPassport: data.isPassport,
                experience: data.experience,
                sourceOfIncome: data.sourceOfIncome,
                riskProfile: data.riskProfile
              })
            });
            
            if (updateResponse.ok) {
              toast.success('KYC updated successfully');
              return { success: true, message: 'KYC updated successfully' };
            } else {
              const errorData = await updateResponse.text().catch(() => null);
              const errorMessage = errorData ? `KYC update failed: ${errorData}` : 'KYC update failed';
              toast.error(errorMessage);
              throw new Error(errorMessage);
            }
          }
        }
      }
    } catch (checkError) {
      console.error('Error checking for existing KYC:', checkError);
      // Continue with creation, as the check failed
    }
    
    // If we get here, either the user doesn't have KYC or we couldn't check
    // Proceed with creating a new KYC entry
    let response = await fetch(`${BASE_URL_API}/UserKYC`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    console.log('KYC submission response status:', response.status);
    
    if (response.ok) {
      toast.success('KYC submitted successfully');
      return { success: true, message: 'KYC submitted successfully' };
    } else {
      // Specific handling for duplicate key constraint error
      const responseText = await response.text().catch(() => null);
      console.error('KYC submission error response:', responseText);
      
      if (responseText && responseText.includes('duplicate key value')) {
        toast.error('You already have a KYC submission. Please contact support to update your information.');
        return { success: false, message: 'Duplicate KYC entry', isDuplicate: true };
      } else {
        // Handle other error cases
        const errorMessage = responseText ? `KYC submission failed: ${responseText}` : 'KYC submission failed';
        logError('KYC submission API', { 
          status: response.status, 
          statusText: response.statusText, 
          data: responseText 
        });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  } catch (error) {
    // Fix: properly handle error object
    const errorMsg = formatErrorMessage(error, 'Error submitting KYC');
    logError('KYC submission', error);
    toast.error(errorMsg);
    throw error; // Re-throw to allow component to handle it
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
    } else if (response.status === 200) {
      response = await response.json()
      console.log('Login response:', response) // For debugging
      
      if (response.user && response.user.isActive === false) {
        toast.error('Your account is disabled. Kindly contact the admin')
      } else {
        // If the user is an admin, ensure their KYC is auto-approved
        if (response.user && response.user.role === 'ADMIN') {
          console.log('Admin user detected - ensuring KYC approval')
          try {
            // Use the new approveAdminKyc function to ensure admin KYC
            await store.dispatch(approveAdminKyc({
              userId: response.user.id,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              email: response.user.email,
              phone: response.user.phone,
              wallet: response.user.wallet,
              token: response.token.accessToken
            })).unwrap();
          } catch (kycError) {
            console.error('Error in admin KYC auto-approval:', kycError)
            // Don't block login flow if KYC approval fails
          }
        }
        
        // Store the user data and token in Redux store
        store.dispatch(setUserData({
          user: response.user,
          token: response.token
        }))
        
        // Get the appropriate OTP route based on user role
        const url = getOTPRoute(response.user.role)
        toast.success('OTP sent to your email')
        
        // Navigate to the OTP page
        Router.push(url)
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    toast.error(error.message || 'An error occurred during login')
  }
})

// ** Login OTP verification
export const loginOTP = createAsyncThunk('appUsers/loginOTP', async data => {
  try {
    console.log('Verifying OTP with data:', data)
    
    if (!data.token || !data.otp) {
      console.error('Missing required data for OTP verification:', { token: !!data.token, otp: !!data.otp })
      toast.error('Missing required authentication data')
      return
    }
    
    let response = await fetch(`${BASE_URL_API}/auth/login/${data.otp}/${data.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Check HTTP status first
    if (!response.ok) {
      console.error('OTP verification failed with status:', response.status)
      toast.error(`OTP verification failed: ${response.statusText}`)
      return
    }
    
    const responseData = await response.json()
    console.log('OTP verification response:', responseData)
    
    if (responseData.status !== 200) {
      toast.error(responseData.message || 'OTP verification failed')
      return
    }
    
    if (responseData.data?.user?.isActive === false) {
      toast.error('Your account is disabled. Kindly contact the admin')
      return
    }
    
    // Success path - get user KYC data if available
    try {
      let kyc = await fetch(`${BASE_URL_API}/UserKYC/byId?page=1&take=1&userId=${responseData.data.user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${responseData.data.token}`
        }
      })
      
      kyc = await kyc.json()
      
      if (kyc.data?.data?.[0]) {
        store.dispatch(setKyc(kyc.data.data[0]))
      } else {
        store.dispatch(setKyc(null))
      }
    } catch (kycError) {
      console.error('Error fetching KYC data:', kycError)
      store.dispatch(setKyc(null))
    }
    
    // Store the verified user data in Redux
    store.dispatch(setUserData(responseData.data))
    
    // Navigate to appropriate route based on user role
    const url = getHomeRoute(responseData.data.user.role)
    toast.success(responseData.message || 'Login successful')
    Router.push(url)
  } catch (error) {
    console.error('OTP verification error:', error)
    toast.error(error.message || 'An error occurred during OTP verification')
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
    console.log('Updating role with data:', data);
    
    const response = await fetch(`${BASE_URL_API}/users/updateRole`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({ id: data.id, role: data.role })
    });
    
    // Get the response status before parsing JSON
    const status = response.status;
    
    // For debugging
    console.log('Update role response status:', status);
    
    // Parse response as JSON
    const responseData = await response.json();
    console.log('Update role response data:', responseData);
    
    if (status === 200 || status === 201) {
      toast.success('Role Updated Successfully');
      
      // Fetch updated user list
      const usersResponse = await fetch(`${BASE_URL_API}/users?page=1&take=15`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      });
      
      const usersData = await usersResponse.json();
      
      if (usersData.status === 200) {
        store.dispatch(setUser(usersData.data.data));
      }
      
      return { success: true, data: responseData };
    } else {
      const errorMessage = responseData.message || 'Request Failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('Role update error:', error);
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
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
    console.log('�� ~ file: index.js:262 ~ updateStatus ~ response:', response)
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
      console.log("User data fetched successfully:", response.data.data.length, "users")
      store.dispatch(setUser(response.data.data))
    } else {
      console.error("Failed to fetch users:", response.message)
      store.dispatch(setUser(response.message))
    }
  } catch (error) {
    console.error("Error fetching users:", error)
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
    // Validate developerId
    if (!data.developerId) {
      console.error('Developer ID is missing:', data);
      store.dispatch(setProject({ 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      }));
      toast.error('Developer ID is required');
      return;
    }

    console.log('Fetching projects with params:', { 
      page: data.page, 
      take: data.take, 
      developerId: data.developerId,
      baseUrl: BASE_URL_API 
    });

    const url = `${BASE_URL_API}/project/developerId?page=${data.page}&take=${data.take}&developerId=${data.developerId}`;
    console.log('Full request URL:', url);

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    });

    console.log('Response status:', response.status);

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Project fetch error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      // Handle 404 specially
      if (response.status === 404) {
        const emptyData = {
          data: [], 
          meta: { 
            totalItems: 0, 
            itemCount: 0, 
            itemsPerPage: data.take || 10, 
            totalPages: 0, 
            currentPage: data.page || 1 
          } 
        };
        store.dispatch(setProject(emptyData));
        toast.error('No projects found for this developer');
        return;
      }
      
      throw new Error(errorData?.message || 'Failed to fetch projects');
    }

    const responseData = await response.json();
    console.log('Project fetch response:', responseData);

    // The response format is { status, message, data: { data: [], meta: {} } }
    // We need to dispatch the data object which contains both data array and meta
    if (responseData.status === 200) {
      store.dispatch(setProject(responseData.data));
    } else {
      throw new Error(responseData.message || 'Failed to load projects');
    }
  } catch (error) {
    console.error('Error in fetchProject:', error);
    store.dispatch(setProject({ 
      data: [], 
      meta: { 
        totalItems: 0, 
        itemCount: 0, 
        itemsPerPage: data.take || 10, 
        totalPages: 0, 
        currentPage: data.page || 1 
      } 
    }));
    toast.error(error.message || 'Failed to load projects');
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
      toast.error(response.message || 'Failed to load projects')
    }
  } catch (error) {
    store.dispatch(setProject([null]))
    toast.error(error.message || 'Failed to load projects')
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
      if (response.status === 200) {
        store.dispatch(setProject(response.data))
      } else {
        toast.error(response.message || 'Failed to load projects after delete')
      }
    }
  } catch (error) {
    toast.error(error.message || 'Failed to delete project')
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
    // Validate required parameters
    if (!data.token) {
      console.error('Token is required for fetchType');
      store.dispatch(setTypes({
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      }));
      return { error: 'Token is required' };
    }

    console.log('Fetching types with params:', { 
      page: data.page, 
      take: data.take,
      developerId: data.developerId, 
      baseUrl: BASE_URL_API 
    });

    // Construct the URL - include developerId as a parameter if it's provided
    let url = `${BASE_URL_API}/type?page=${data.page}&take=${data.take}`;
    if (data.developerId) {
      url += `&developerId=${data.developerId}`;
    }
    
    console.log('Full request URL for types:', url);

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    });

    console.log('Types response status:', response.status);

    // Handle non-200 responses
    if (!response.ok) {
      // Handle 404 specially
      if (response.status === 404) {
        console.log('No types found (404), returning empty data');
        const emptyData = { 
          data: [], 
          meta: { 
            totalItems: 0, 
            itemCount: 0, 
            itemsPerPage: data.take || 10, 
            totalPages: 0, 
            currentPage: data.page || 1 
          } 
        };
        store.dispatch(setTypes(emptyData));
        return emptyData;
      }
      
      // For other errors
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Error ${response.status} fetching types:`, errorText);
      
      store.dispatch(setTypes({
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      }));
      return { error: errorText };
    }

    const responseData = await response.json();
    console.log('Types fetch response data:', responseData);

    if (responseData.status === 200) {
      store.dispatch(setTypes(responseData.data));
      return responseData.data;
    } else {
      store.dispatch(setTypes(responseData.message || 'Failed to load types'));
      return { error: responseData.message || 'Failed to load types' };
    }
  } catch (error) {
    console.error('Exception in fetchType:', error);
    store.dispatch(setTypes({
      data: [], 
      meta: { 
        totalItems: 0, 
        itemCount: 0, 
        itemsPerPage: data.take || 10, 
        totalPages: 0, 
        currentPage: data.page || 1 
      } 
    }));
    return { error: error.message || 'Failed to load types' };
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
    console.log('Fetching agent land data with params:', { page: data.page, take: data.take });
    
    let response = await fetch(`${BASE_URL_API}/agent-land?page=${data.page}&take=${data.take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    });
    
    // Log response status for debugging
    console.log('Agent land fetch response status:', response.status);
    
    // Handle 404 errors gracefully
    if (response.status === 404) {
      console.log('Agent Land API returned 404, using empty data');
      const emptyData = { 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      };
      store.dispatch(setAgentLand(emptyData));
      return;
    }
    
    const responseData = await response.json();
    console.log('Agent land fetch response:', responseData);
    
    if (responseData.status === 200) {
      store.dispatch(setAgentLand(responseData.data));
    } else {
      // Handle other error cases
      console.error('Error fetching agent land:', responseData.message);
      store.dispatch(setAgentLand({ 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      }));
      // Only show error toast for non-404 errors
      if (responseData.message !== 'Failed to load data') {
        toast.error(responseData.message || 'Failed to load agent land data');
      }
    }
  } catch (error) {
    console.error('Exception in fetchAgentLand:', error);
    store.dispatch(setAgentLand({ 
      data: [], 
      meta: { 
        totalItems: 0, 
        itemCount: 0, 
        itemsPerPage: data.take || 10, 
        totalPages: 0, 
        currentPage: data.page || 1 
      } 
    }));
    toast.error(error.message || 'Failed to load agent land data');
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
    
    // Handle 404 errors gracefully
    if (response.statusCode === 404) {
      console.log('Agent Land by ID API returned 404, using empty data')
      return { error: 'Land not found', id: data.landId }
    } else if (response.status === 200) {
      return response.data
    } else {
      return response.message
    }
  } catch (error) {
    toast.error(error.message)
    return { error: error.message }
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

// ** Fetch Buy Requests by ID
export const fetchBuyRequestsById = createAsyncThunk('appUsers/fetchBuyRequestsById', async data => {
  try {
    // Set loading state
    store.dispatch(setPendingBuyLoading());
    
    console.log('Fetching buy requests by user ID:', data.userId);
    
    let response = await fetch(`${BASE_URL_API}/buy/userId?page=${data.page}&take=${data.take}&userId=${data.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    
    // Log the response status
    console.log('Buy requests by user ID response status:', response.status);
    
    // If the request fails with a 404, handle it gracefully
    if (response.status === 404) {
      console.log('Buy/userId API returned 404, using empty data');
      const emptyData = { 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      };
      store.dispatch(setPendingBuy(emptyData));
      return emptyData;
    }
    
    const responseData = await response.json();
    console.log('Buy requests by user ID response:', responseData);
    
    if (responseData.status === 200) {
      store.dispatch(setPendingBuy(responseData.data));
      return responseData.data;
    } else if (responseData.statusCode === 404) {
      console.log('Buy/userId API returned 404 in JSON, using empty data');
      const emptyData = { 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      };
      store.dispatch(setPendingBuy(emptyData));
      return emptyData;
    } else {
      // Handle other errors
      console.error('Error fetching buy requests:', responseData.message);
      store.dispatch(setPendingBuyError(responseData.message || 'Failed to load buy requests'));
      return null;
    }
  } catch (error) {
    console.error('Exception in fetchBuyRequestsById:', error);
    store.dispatch(setPendingBuyError(error.message || 'Failed to load buy requests'));
    return null;
  }
})

// ** Fetch Buy Requests by User ID - use the improved implementation from above for this function too
export const fetchBuysByUserId = createAsyncThunk('appUsers/fetchBuysByUserId', async data => {
  try {
    // Set loading state
    store.dispatch(setPendingBuyLoading());
    
    console.log('Fetching buys by user ID:', data.userId);
    
    let response = await fetch(`${BASE_URL_API}/buy/userId?page=${data.page}&take=${data.take}&userId=${data.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    
    // Log the response status
    console.log('Buys by user ID response status:', response.status);
    
    // If the request fails with a 404, handle it gracefully
    if (response.status === 404) {
      console.log('Buy/userId API returned 404, using empty data');
      const emptyData = { 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      };
      store.dispatch(setPendingBuy(emptyData));
      return emptyData;
    }
    
    const responseData = await response.json();
    console.log('Buys by user ID response:', responseData);
    
    if (responseData.status === 200) {
      store.dispatch(setPendingBuy(responseData.data));
      return responseData.data;
    } else if (responseData.statusCode === 404) {
      console.log('Buy/userId API returned 404 in JSON, using empty data');
      const emptyData = { 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      };
      store.dispatch(setPendingBuy(emptyData));
      return emptyData;
    } else {
      // Handle other errors
      console.error('Error fetching buys:', responseData.message);
      store.dispatch(setPendingBuyError(responseData.message || 'Failed to load buys'));
      return null;
    }
  } catch (error) {
    console.error('Exception in fetchBuysByUserId:', error);
    store.dispatch(setPendingBuyError(error.message || 'Failed to load buys'));
    return null;
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
    // Ensure we have default pagination parameters to avoid the 422 error
    const page = data.page || 1;
    const take = data.take || 10;
    
    console.log('Uploading document with data:', {
      name: data.name,
      description: data.description,
      url: data.url,
      userId: data.userId
    });
    
    let response = await fetch(`${BASE_URL_API}/userDocuments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        url: data.url,
        userId: data.userId,
        // Add pagination parameters to prevent 422 error
        page: page,
        take: take
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload document error:', errorText);
      throw new Error(`Failed to upload document: ${errorText}`);
    }
    
    const responseData = await response.json();
    
    console.log('Document upload response:', responseData);
    
    // Immediately fetch updated documents to refresh the UI
    try {
      let fetchResponse = await fetch(
        `${BASE_URL_API}/userDocuments?page=${page}&take=${take}&userId=${responseData.userId || data.userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`
          }
        }
      );
      
      if (!fetchResponse.ok) {
        console.warn('Could not immediately refresh documents list');
      } else {
        const fetchData = await fetchResponse.json();
        if (fetchData.status === 200) {
          store.dispatch(setUserDocuments(fetchData.data));
        }
      }
    } catch (fetchError) {
      console.error('Error fetching updated documents:', fetchError);
      // Don't throw here, as the upload was successful
    }
    
    toast.success('File successfully uploaded');
    return responseData;
  } catch (error) {
    console.error('Document upload error:', error);
    toast.error(error.message || 'Failed to upload document');
    throw error;
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
      console.log('Request Documents API returned 404, using empty data')
      store.dispatch(setRequestDocument({ items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } }))
    }
    toast.success('File successfully uploaded')
  } catch (error) {
    toast.error(error.message)
  }
})

// ** Fetch Request Documents from user
export const fetchRequestedDocuments = createAsyncThunk('appUsers/fetchRequestedDocuments', async data => {
  try {
    // Set loading state
    store.dispatch(setRequestDocumentLoading());
    
    console.log('Fetching requested documents with user ID:', data.userId);
    
    let res = await fetch(
      `${BASE_URL_API}/requestDocuments?page=${data.page}&take=${data.take}&userId=${data.userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      }
    )
    
    // Log the response status
    console.log('Request Documents fetch response status:', res.status);
    
    // If the request fails with a 404, handle it gracefully
    if (res.status === 404) {
      console.log('Request Documents API returned 404, using empty data');
      const emptyData = { 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      };
      store.dispatch(setRequestDocument(emptyData));
      return emptyData;
    }
    
    const responseData = await res.json();
    console.log('Request Documents response:', responseData);
    
    if (responseData.status === 200) {
      store.dispatch(setRequestDocument(responseData.data));
      return responseData.data;
    } else if (responseData.statusCode === 404) {
      console.log('Request Documents API returned 404 in JSON, using empty data');
      const emptyData = { 
        data: [], 
        meta: { 
          totalItems: 0, 
          itemCount: 0, 
          itemsPerPage: data.take || 10, 
          totalPages: 0, 
          currentPage: data.page || 1 
        } 
      };
      store.dispatch(setRequestDocument(emptyData));
      return emptyData;
    } else {
      // Handle other errors
      console.error('Error fetching requested documents:', responseData.message);
      store.dispatch(setRequestDocumentError(responseData.message || 'Failed to load requested documents'));
      return null;
    }
  } catch (error) {
    console.error('Exception in fetchRequestedDocuments:', error);
    store.dispatch(setRequestDocumentError(error.message || 'Failed to load requested documents'));
    return null;
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
      
      // Handle 404 errors gracefully
      if (response.statusCode === 404) {
        console.log('Request Documents API returned 404, using empty data')
        store.dispatch(setRequestDocument({ items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } }))
      } else {
        store.dispatch(setRequestDocument(response.data))
      }
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
    console.log('Fetching documents with token:', data.token ? 'Valid token' : 'No token')
    
    // Set loading state
    store.dispatch(setDocumentLoading());
    
    // Default pagination parameters if not provided
    const page = data.page || 1
    const take = data.take || 10
    
    let response = await fetch(`${BASE_URL_API}/documentCatalogue?page=${page}&take=${take}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`
      }
    })
    
    // Log the response status
    console.log('Document fetch response status:', response.status)
    
    const responseData = await response.json()
    console.log('Document fetch response:', responseData)
    
    // Handle 404 errors gracefully
    if (responseData.statusCode === 404) {
      console.log('Document Catalogue API returned 404, using empty data')
      store.dispatch(setDocument([]))
      return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } }
    } else if (responseData.status === 200) {
      // Make sure to update the Redux store
      store.dispatch(setDocument(responseData.data))
      return responseData.data
    } else {
      console.error('Error fetching documents:', responseData.message)
      toast.error(responseData.message || 'Failed to load documents')
      store.dispatch(setDocumentError(responseData.message || 'Failed to load documents'))
      return []
    }
  } catch (error) {
    console.error('Exception in fetchDocument:', error)
    toast.error(error.message || 'Failed to load documents')
    store.dispatch(setDocumentError(error.message || 'Failed to load documents'))
    return []
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
    
    // Handle 404 errors gracefully
    if (response.statusCode === 404) {
      console.log('Document Catalogue by User ID API returned 404, using empty data')
      return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } }
    } else {
      return response.data
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

// ** Auto-approve KYC for admin
export const approveAdminKyc = createAsyncThunk('appUsers/approveAdminKyc', async data => {
  try {
    console.log('Auto-approving KYC for admin user ID:', data.userId);
    
    // First check if admin already has a KYC entry
    let existingKycId = null;
    
    try {
      const checkResponse = await fetch(`${BASE_URL_API}/UserKYC/byId?page=1&take=1&userId=${data.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        }
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        // Admin has existing KYC
        if (checkData.data && checkData.data.data && checkData.data.data.length > 0) {
          const existingKyc = checkData.data.data[0];
          existingKycId = existingKyc.id;
          
          // If KYC is already approved, no need to do anything
          if (existingKyc.status === 'approved') {
            console.log('Admin KYC is already approved');
            return { success: true, message: 'Admin KYC is already approved' };
          }
          
          // Update the existing KYC status to approved
          const updateResponse = await fetch(`${BASE_URL_API}/UserKYC/${existingKycId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`
            },
            body: JSON.stringify({ status: 'approved' })
          });
          
          if (updateResponse.ok) {
            console.log('Admin KYC status updated to approved');
            return { success: true, message: 'Admin KYC status updated to approved' };
          } else {
            console.error('Failed to update admin KYC status');
            return { success: false, message: 'Failed to update admin KYC status' };
          }
        } else {
          // Admin has no KYC, create one automatically with approved status
          console.log('Creating auto-approved KYC for admin');
          
          const adminKyc = {
            firstName: data.firstName || 'Admin',
            lastName: data.lastName || 'User',
            email: data.email || 'admin@example.com',
            address: 'Admin Address',
            street: 'Admin Street',
            state: 'Admin State',
            postalCode: '00000',
            mobileNumber: data.phone || '0000000000',
            company: 'Admin Company',
            pubkey: data.wallet || '',
            certificates: 'Admin Certificate',
            passportImage: 'no image',
            nicFrontImage: 'no image',
            nicBackImage: 'no image',
            signatureImage: 'no image',
            isPassport: true,
            experience: 'expert',
            sourceOfIncome: 'Employment',
            riskProfile: 'lowRisk',
            userId: data.userId,
            status: 'approved'
          };
          
          const createResponse = await fetch(`${BASE_URL_API}/UserKYC`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`
            },
            body: JSON.stringify(adminKyc)
          });
          
          if (createResponse.ok) {
            console.log('Auto-approved admin KYC created successfully');
            return { success: true, message: 'Auto-approved admin KYC created successfully' };
          } else {
            // Check if the error is related to duplicate key
            const errorText = await createResponse.text().catch(() => null);
            console.error('Admin KYC creation failed:', errorText);
            
            if (errorText && errorText.includes('duplicate key value')) {
              // Try a different approach - find the KYC by user ID again
              // This might happen if a concurrent process created it
              console.log('Duplicate key error, trying to find and update the KYC');
              return await approveAdminKyc(data); // Retry once
            }
            
            return { success: false, message: 'Failed to create admin KYC', error: errorText };
          }
        }
      } else {
        console.error('Failed to check for existing admin KYC');
        return { success: false, message: 'Failed to check for existing admin KYC' };
      }
    } catch (error) {
      console.error('Error in admin KYC auto-approval:', error);
      return { success: false, message: 'Error in admin KYC auto-approval', error: error.message };
    }
  } catch (error) {
    console.error('Exception in approveAdminKyc:', error);
    return { success: false, message: 'Exception in approveAdminKyc', error: error.message };
  }
})