import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Table, TableHead, TableBody, TableRow, TableCell, Pagination } from '@mui/material';
import Spinner from 'src/views/spinner';
import { fetchAgentLand } from 'src/store/apps/user';

const AgentLandTable = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  const { reducer, agentLand } = useSelector((state) => state);
  const dispatch = useDispatch();

  const loadData = () => {
    let landData = agentLand?.agentLandData?.data?.filter(item => {
      return reducer?.userData?.userData?.user?.id === item?.agentId;
    });
    setData(landData || []);
  };

  const handleChange = (event, value) => {
    dispatch(
      fetchAgentLand({
        token: reducer.userData.userData.token.accessToken,
        page: value,
        take: 10
      })
    );
    setPage(value);
  };

  useEffect(() => {
    if (reducer?.userData?.userData?.token?.accessToken) {
      dispatch(
        fetchAgentLand({
          token: reducer.userData.userData.token.accessToken,
          page: 1,
          take: 10
        })
      );
    }
  }, [reducer?.userData?.userData?.token?.accessToken]);

  useEffect(() => {
    if (agentLand?.agentLandData?.data) {
      loadData();
    }
  }, [agentLand?.agentLandData?.data]);

  // Loading state
  if (!agentLand?.agentLandData) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell align='center' colSpan={6}>
              <Spinner />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Empty state
  if (!data?.length) {
    return (
      <Typography align='center' sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
        No land records found
      </Typography>
    );
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Token Id</TableCell>
            <TableCell align='center'>Project Name</TableCell>
            <TableCell align='center'>Project Type</TableCell>
            <TableCell align='center'>Project Category</TableCell>
            <TableCell align='center'>Price</TableCell>
            <TableCell align='center'>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell align='center'>{row.tokenId}</TableCell>
              <TableCell align='center'>{row.project.name}</TableCell>
              <TableCell align='center'>{row.type.name}</TableCell>
              <TableCell align='center'>{row.project.category.name}</TableCell>
              <TableCell align='center'>
                {row.project.price} {row.project.currency.name}
              </TableCell>
              <TableCell align='center'>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {agentLand?.agentLandData?.meta?.totalPages > 1 && (
        <Pagination
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '20px',
            paddingBottom: '20px'
          }}
          count={agentLand.agentLandData.meta.totalPages}
          page={page}
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default AgentLandTable;
