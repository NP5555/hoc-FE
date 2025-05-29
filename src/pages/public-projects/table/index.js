import React from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Pagination,
  Chip,
  Card,
  CardContent,
  Box
} from '@mui/material'
import Spinner from 'src/views/spinner'

const PublicProjectTable = ({ projects, loading, page, totalPages, onPageChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'success'
      case 'CLOSE':
        return 'error'
      default:
        return 'default'
    }
  }

  if (loading && projects.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
        <Spinner />
      </div>
    )
  }

  return (
    <>
      {projects.length === 0 ? (
        <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          No projects available at the moment.
        </Typography>
      ) : (
        <>
          {/* Desktop Table View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>Project Name</TableCell>
                  <TableCell align='center'>Description</TableCell>
                  <TableCell align='center'>Price</TableCell>
                  <TableCell align='center'>Category</TableCell>
                  <TableCell align='center'>Currency</TableCell>
                  <TableCell align='center'>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell align='center'>
                      <Typography variant="h6" color="primary">
                        {project.name}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant="body2">
                        {project.description?.length > 100 
                          ? `${project.description.substring(0, 100)}...` 
                          : project.description}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant="h6" color="secondary">
                        {project.price} {project.currency?.symbol || ''}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>{project.category?.name || 'N/A'}</TableCell>
                    <TableCell align='center'>{project.currency?.name || 'N/A'}</TableCell>
                    <TableCell align='center'>
                      <Chip 
                        label={project.status} 
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
            {projects.map((project) => (
              <Card key={project.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      {project.name}
                    </Typography>
                    <Chip 
                      label={project.status} 
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="secondary">
                      {project.price} {project.currency?.symbol || ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.category?.name || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {totalPages > 1 && (
            <Pagination
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '20px',
                paddingBottom: '20px'
              }}
              count={totalPages}
              page={page}
              onChange={onPageChange}
            />
          )}
        </>
      )}
    </>
  )
}

export default PublicProjectTable 