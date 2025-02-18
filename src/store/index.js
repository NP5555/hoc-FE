// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// ** Reducers
import rootReducer from 'src/store/apps/rootReducer'
import user from 'src/store/apps/users'
import area from 'src/store/apps/area'
import currency from 'src/store/apps/currency'
import category from 'src/store/apps/category'
import project from 'src/store/apps/project'
import signer from 'src/store/apps/signer'
import types from 'src/store/apps/type'
import agentLand from 'src/store/apps/agentLand'
import buyRequest from 'src/store/apps/buyRequest'
import kyc from 'src/store/apps/kyc'
import userDocuments from './apps/userDocuments'
import pendingBuy from './apps/pendingBuy'
import userKycbyId from './apps/userKycbyId'
import requestDocument from './apps/requestDocument'
import trade from './apps/trade'
import document from './apps/document'
import userKYC from './apps/userKYC'

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: {
    reducer: persistedReducer,
    usersRecord: user,
    areaRecord: area,
    currency,
    category,
    project,
    signer,
    agentLand,
    buyRequest,
    types,
    kyc,
    userDocuments,
    pendingBuy,
    userKycbyId,
    userKYC,
    requestDocument,
    trade,
    document
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export const persistor = persistStore(store)
