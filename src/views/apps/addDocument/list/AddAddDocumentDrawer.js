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
import axios from 'axios'
import { Typography } from '@mui/material'
import { toast } from 'react-hot-toast'
import { formatErrorMessage, logError } from 'src/utils/errorHandler'

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

  // Pinata credentials
  const pinataApiKey = '1acc89c3ecbd58333e9d'
  const pinataSecretApiKey = 'a546f01c561adfa84518187f253b6eefe3220f4d5c7eb0fb30f60673c4d91f9d'
  const pinataJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0M2I3ZDRlOS1hZDUzLTRkYzQtYmI5My0wYjBhMmJkYWZjNDUiLCJlbWFpbCI6Im5ncy5uYWVlbWFzaHJhZkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMWFjYzg5YzNlY2JkNTgzMzNlOWQiLCJzY29wZWRLZXlTZWNyZXQiOiJhNTQ2ZjAxYzU2MWFkZmE4NDUxODE4N2YyNTNiNmVlZmUzMjIwZjRkNWM3ZWIwZmIzMGY2MDY3M2M0ZDkxZjlkIiwiZXhwIjoxNzc0MzQ1MDgxfQ.5ObykNMJUjCf5BNPF3ChmmLyn-G6hfTgKeahC7QHFJw'
  const pinataGateway = 'https://red-impressive-beetle-555.mypinata.cloud'

  const handleClose = () => {
    toggle()
    setFiles([])
    setFileName('')
    setFileTag('')
  }
  
  const uploadToPinata = async (file) => {
    if (!file) {
      console.error('No file provided to uploadToPinata');
      return null;
    }
    
    // Log the file being uploaded for debugging
    console.log('Uploading file to Pinata:', file.name, file.size, file.type);
    
    // Creating FormData
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('Starting Pinata upload with JWT authentication');
      
      // Use pure fetch API with JWT authentication
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`
        },
        body: formData
      });
      
      // Check for non-OK response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata error response:', errorText);
        throw new Error(`Pinata upload failed with status: ${response.status}. ${errorText}`);
      }
      
      // Parse the successful response
      const data = await response.json();
      console.log('Pinata upload successful:', data);
      
      if (data && data.IpfsHash) {
        const ipfsUrl = `${pinataGateway}/ipfs/${data.IpfsHash}`;
        console.log('Generated IPFS URL:', ipfsUrl);
        return ipfsUrl;
      } else {
        logError('Pinata upload', 'No IPFS hash returned');
        return null;
      }
    } catch (error) {
      logError('Pinata upload', error);
      console.error('Pinata upload error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const handleFileChange = async event => {
    const file = event.target.files[0]
    if (!file) {
      toast.error('No file selected')
      return
    }

    // Add quick form validation
    if (!fileName.trim()) {
      toast.error('Please enter a file name')
      return
    }

    setIsLoading(true)
    try {
      console.log(`Starting upload for file: ${file.name} (${file.size} bytes)`)
      const path = await uploadToPinata(file);
      
      if (!path) {
        toast.error('Failed to upload to Pinata. Please try again.');
        return;
      }

      // Add pagination parameters to avoid the 422 error
      let data = {
        token: state.reducer.userData.userData.token.accessToken,
        url: path,
        name: fileName,
        description: fileTag || 'Document', // Provide default if empty
        userId: state?.reducer?.userData?.userData?.user?.id,
        page: 1,
        take: 10
      }
      
      console.log('Dispatching document upload with data:', data);
      const result = await dispatch(uploadUserDocuments(data))
      console.log('Upload result:', result);
      
      // Success notification
      toast.success(`File "${fileName}" successfully uploaded`);
      
      // Clear form fields
      setFileName('');
      setFileTag('');
      
      // Close drawer after successful upload
      handleClose();
    } catch (error) {
      logError('Document upload', error)
      toast.error(formatErrorMessage(error, 'Error uploading document. Please try again.'))
    } finally {
      setIsLoading(false)
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
      </Box>
    </Drawer>
  )
}

export default SidebarAddDocuments
