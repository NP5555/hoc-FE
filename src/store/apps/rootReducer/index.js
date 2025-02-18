import { combineReducers } from 'redux'
import userData from 'src/store/apps/userData'
import kyc from 'src/store/apps/kyc'

const rootReducer = combineReducers({
  userData: userData,
  kyc: kyc
})

export default rootReducer
