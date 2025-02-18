// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import Grid from '@mui/material/Grid' //
import MenuItem from '@mui/material/MenuItem' //
import InputLabel from '@mui/material/InputLabel' //
import FormControl from '@mui/material/FormControl' //
import Select from '@mui/material/Select' //

const TableHeader = props => {
  // ** Props
  const { handleFilter, toggle, value, role, handleRoleChange } = props

  return (
    <Box
      sx={{
        py: 4,
        px: 6,
        rowGap: 2,
        columnGap: 4,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small'
          value={value}
          sx={{ mr: 4 }}
          placeholder='Search Admin'
          onChange={e => handleFilter(e.target.value)}
        />

        {/* <Grid item sm={4} xs={12}>
          <FormControl>
            <InputLabel size='small' id='role-select'>
              Select Role
            </InputLabel>
            <Select
              fullWidth
              size='small'
              value={role}
              id='select-role'
              label='Select Role'
              labelId='role-select'
              onChange={handleRoleChange}
              inputProps={{ placeholder: 'Select Role' }}
            >
              <MenuItem value=''>Select Role</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
              <MenuItem value='author'>Author</MenuItem>
              <MenuItem value='editor'>Editor</MenuItem>
              <MenuItem value='maintainer'>Maintainer</MenuItem>
              <MenuItem value='subscriber'>Subscriber</MenuItem>
            </Select>
          </FormControl>
        </Grid> */}

        {/* <Button onClick={toggle} variant='contained' item sm={4} xs={12}>
          <Icon fontSize='1.125rem' icon='tabler:plus' />
          Add New Developer
        </Button> */}
      </Box>
      <Button variant='contained' onClick={toggle}>
        <Icon fontSize='1.125rem' icon='tabler:plus' />
        Add New Project
      </Button>
    </Box>
  )
}

export default TableHeader
