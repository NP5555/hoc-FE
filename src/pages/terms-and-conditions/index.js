// ** React Imports
import { useState } from 'react'

import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import { register } from 'src/store/apps/user'

import toast from 'react-hot-toast'

// ** Icon Imports

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useDispatch } from 'react-redux'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/hooks/useAuth'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import { Container } from '@mui/material'
import Head from 'next/head'
import Image from 'next/image'

// ** Styled Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 700,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.75),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const Register = () => {
  return (
    <Container maxWidth='md'>
      <Head>
        <title>Terms and Conditions</title>
      </Head>

      {/* Logo at the top center */}
      <Box textAlign='center' my={4}>
        <Image alt='Home Owners Club' src={`/images/pages/hoc-logo.png`} width={150} height={150} />
      </Box>

      {/* Terms and Conditions content */}
      <Typography textAlign='center' variant='h4' gutterBottom>
        Membership Terms and Conditions
      </Typography>

      <Typography textAlign='center' variant='subtitle1' paragraph>
        Welcome to the Membership Club - HOC (Honesty, Opportunity, Change).
      </Typography>

      <Typography textAlign='center' variant='body1' paragraph>
        By becoming a member of HOC, you agree to the following terms and conditions:
      </Typography>

      {/* Insert the provided terms and conditions here */}
      {/* I'm using a <ul> for better organization, you can customize as needed */}
      <ul>
        <Typography textAlign='center' variant='h6' gutterBottom>
          <b> Before becoming a member of HOC, you are informed about:</b>
        </Typography>
        <ul>
          <li> Cryptocurrency and Blockchain.</li>
          <li> Trading and Investing.</li>
          <li> Decentralized Finance.</li>
          <li> Decentralized Autonomous Organisations.</li>
          <li> The problems in the property and real estate market.</li>
          <li> The housing problems in the world.</li>
          <li> The economic problems alot of people face today.</li>
          <li> The real definition of democracy.</li>
          <li> Building new ecosystems does not come without hurdles.</li>
          <li> The solutions that are available.</li>
          <li> The opacity of the property and real estate market.</li>
          <li> The dissimilarity of the housing distribution.</li>
          <li> The lack of honesty and transparency within the the real estate markets.</li>
          <li> The difficult accessibility of owning property and real estate.</li>
          <li> The lack of equal chances within the real estate ecosystem.</li>
          <li> The high transaction costs in the real estate markets.</li>
          <li> The risks that are involved in the real estate markets.</li>
          <li> Doing your own due diligence.</li>
          <li> To always consult with your own financial advisors.</li>
          <li> The Risks of trading and investing.</li>
          <li> The risks that comes with blockchain, AI and digital currencies.</li>
          <li>
            You will be provided sources, education, information to exercise your membership at the best level of
            participation and participate in all that is provided by the educational resources.
          </li>
        </ul>
        <Typography textAlign='center' variant='h6' gutterBottom>
          <b>Membership Rules and Agreements</b>
        </Typography>
        <ul>
          <li>Membership is available to anyone 18 years of age or older.</li>
          <li>
            You promise NOT to use to conduct any fraudulent or business activity or have more than one Member Account
            at any time.
          </li>
          <li>
            You agree that you are a member, not an investor, and contribute by rebuilding, redesigning, voting,
            donating, learning, understanding, and expanding the ecosystem.
          </li>
          <li>You get rewards when donating to the system. The rewards are in HOC.</li>
          <li>We only use cryptocurrency, our coin, the DEX, and the DAO.</li>
          <li>
            Changes to the system can be made by the voting system and if oppressed by any laws, rules, and regulations.
          </li>
          <li>
            You agree that we are no security offering falling under the rules and regulations of any regulatory
            embodiment of any traditional system.
          </li>
          <li>You agree to participate in an automated self-regulated governance club.</li>
          <li>
            You understand that the club is built on trust, and contributing to change, and moral and ethical norms are
            our high standards that want to impact, improve, and add value to a million people's lives. This requires
            adaptability.
          </li>
          <li>You are aware that the builders and expanders of this club always will act by these rules.</li>
          <li>As a member, you can also become a builder and expander of the club.</li>
          <li>
            This club is an international online club under the guidance and advisory of experts and respectable eco
            players in the property and real estate market.
          </li>
          <li>You agree you want to see and contribute to change within the property and real estate markets.</li>
          <li>This Platform falls under international constitutions and human rights.</li>
          <li>
            You agree to deliver all the documents that are needed to prevent any kind of money laundering or terrorist
            financing activities.
          </li>
          <li>
            You agree to cooperate with these rules, and if we find out that you are in any way involved with such
            activities, you will be blacklisted, removed, and reported to the authorities.
          </li>
          <li>
            All the disputes if there are any from purchase or transaction from the tangible asset will be fought in the
            jurisdiction of the country in which the tangible asset is purchased, issued, or offered.
          </li>
        </ul>
      </ul>
    </Container>
  )
}
Register.getLayout = page => <BlankLayout>{page}</BlankLayout>
Register.guestGuard = true

export default Register
