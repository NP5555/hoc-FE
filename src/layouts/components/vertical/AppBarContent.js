// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// * Web3 Imports
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import toast from 'react-hot-toast'

import { useDispatch } from 'react-redux'
import { setSigner } from 'src/store/apps/signer'

// ** Components
import Autocomplete from 'src/layouts/components/Autocomplete'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { useSelector } from 'react-redux'
import { Button, Typography } from '@mui/material'

const AppBarContent = props => {
  // ** States
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const state = useSelector(state => state)
  const usersAddress = state?.reducer?.userData?.userData?.user.wallet
  const isKYC = state?.reducer?.kyc?.kyc?.status

  const dispatch = useDispatch()

  const getWeb3Provider = async () => {
    const providerOptions = {} // Additional provider options (e.g., Infura API key)

    const web3Modal = new Web3Modal({
      providerOptions
    })

    const provider = await web3Modal.connect()

    return new ethers.providers.Web3Provider(provider)
  }

  const connectWallet = async () => {
    if (isKYC !== 'approved') {
      toast.error('Your KYC is pending')

      return null
    }
    if (!window.ethereum) {
      toast.error('MetaMask is not installed')

      return
    }
    const provider = await getWeb3Provider()
    const accounts = await provider.listAccounts()

    if (usersAddress === accounts[0]) {
      try {
        const chainId = (await provider.getNetwork()).chainId

        if (chainId !== 56) {
          let networkId = '0x38'

          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: networkId,
                  chainName: 'BNB Smart Chain',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                  },
                  rpcUrls: ['https://bsc-dataseed.binance.org'],
                  blockExplorerUrls: ['https://polygonscan.com']
                }
              ]
            })
            const signer = provider.getSigner()
            const walletAddress = await signer.getAddress()
            if (walletAddress !== undefined) {
              dispatch(setSigner(signer))
              setAccount(walletAddress)
            }
          } catch (error) {
            toast.error(error.message)
            console.error('Error switching MetaMask network:', error)
          }
        } else {
          const signer = provider.getSigner()
          const walletAddress = await signer.getAddress()
          if (walletAddress !== undefined) {
            dispatch(setSigner(signer))
            setAccount(walletAddress)
          }
        }
      } catch (error) {
        toast.error('MetaMask is not installed')
      }
    } else {
      toast.error(
        `Oops! Wrong Metamask account detected. Please connect ${
          usersAddress.slice(0, 5) + '...' + usersAddress.slice(usersAddress.length - 5, usersAddress.length)
        }.`
      )
    }
  }

  useEffect(() => {
    connectWallet()
  }, [])

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden && !settings.navHidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon fontSize='1.5rem' icon='tabler:menu-2' />
          </IconButton>
        ) : null}
        <Typography sx={{ color: 'text.primary' }}>
          Welcome to the {state?.reducer?.userData?.userData?.user?.role.toLowerCase()} panel
        </Typography>
        {state.reducer.userData.userData && <Autocomplete hidden={hidden} settings={settings} />}
      </Box>

      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <Button variant='contained' onClick={connectWallet}>
          {account === null
            ? 'Connect Wallet'
            : account.slice(0, 5) + '...' + account.slice(account.length - 5, account.length)}
        </Button>
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        {state.reducer.userData.userData && <UserDropdown settings={settings} />}
      </Box>
    </Box>
  )
}

export default AppBarContent
