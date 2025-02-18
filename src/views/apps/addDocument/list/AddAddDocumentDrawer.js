import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { addArea } from 'src/store/apps/user'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import { Typography } from '@mui/material'

import { uploadUserDocuments } from 'src/store/apps/user'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  justifyContent: 'space-between'
}))

const FileList = styled('ul')(({ theme }) => ({
  listStyleType: 'none',
  paddingLeft: 0,
  marginTop: theme.spacing(2),
  '& li': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    '& .file-name': {
      flex: 1,
      marginLeft: theme.spacing(2)
    },
    '& .delete-button': {
      marginLeft: theme.spacing(1)
    }
  }
}))

const SidebarAddDocuments = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileTag, setFileTag] = useState('')

  // ** Hooks
  const dispatch = useDispatch()
  const state = useSelector(state => state)

  const projectId = '2I1oqhW4ncFv71LUKDOVWWRZ1ZH'
  const projectSecret = 'd8538b15a850ae329e8b348dbbd6311d'
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth
    }
  })

  const handleClose = () => {
    toggle()
    setFiles([])
    setFileName('')
    setFileTag('')
  }

  const handleFileChange = async event => {
    const file = event.target.files[0]

    try {
      const result = await client.add(file)
      const path = `https://marketplace-argon.infura-ipfs.io/ipfs/${result.path}`

      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        url: path,
        name: fileName,
        description: fileTag,
        userId: state?.reducer?.userData?.userData?.user?.id
      }
      await dispatch(uploadUserDocuments(data))
    } catch (error) {
      console.log('🚀 ~ file: index.js:114 ~ handleImageUpload ~ error:', error)
      toast.error(error)
    } finally {
      handleClose()
    }
  }

  const removeFile = fileToRemove => {
    const filteredFiles = files.filter(file => file !== fileToRemove)
    setFiles(filteredFiles)
  }

  const addFile = async e => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.addEventListener('change', handleFileChange)
    fileInput.click()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
    >
      <Header>
        <Typography variant='h6'>Add Documents</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected'
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      <Box sx={{ p: theme => theme.spacing(0, 2, 2) }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FileList sx={{ mt: 5 }}>
            {files.map((fileObj, index) => (
              <li key={index}>
                <Icon icon='tabler:file-text' fontSize='1rem' />
                <span className='file-name'>{fileObj.name}</span>
                <Button className='delete-button' onClick={() => removeFile(fileObj)} variant='outlined'>
                  <Icon fontSize='1.125rem' icon='fluent-mdl2:delete' />
                </Button>
              </li>
            ))}
          </FileList>

          <TextField
            label='File Name'
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            variant='outlined'
            sx={{ mt: 3, width: '100%' }}
          />
          <TextField
            label='File Tag'
            value={fileTag}
            onChange={e => setFileTag(e.target.value)}
            variant='outlined'
            sx={{ mt: 3, width: '100%' }}
          />
          <TextField
            type='file'
            name=''
            inputProps={{ multiple: true }}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Button variant='outlined' color='secondary' onClick={addFile} sx={{ mt: 3, width: '100%' }}>
            Add File
          </Button>
        </Box>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Button type='submit' variant='contained' onClick={onSubmit} sx={{ mt: 3, mx: 1, width: '40%' }}>
                Submit
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleClose} sx={{ mt: 3, mx: 1, width: '40%' }}>
                Cancel
              </Button>
            </>
          )}
        </Box> */}
      </Box>
    </Drawer>
  )
}

export default SidebarAddDocuments
