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
  const { handleFilter, toggle, value } = props

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
          placeholder='Search Category'
          onChange={e => handleFilter(e.target.value)}
        />
      </Box>
      <Button variant='contained' onClick={toggle}>
        <Icon fontSize='1.125rem' icon='tabler:plus' />
        Add New Category
      </Button>
    </Box>
  )
}

export default TableHeader
