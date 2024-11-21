/**
* @file Component serving /leaderboard. 
* Shows are comparison of all user's carbon emission data
* @component <Leaderboard/>
*/

import React, { useEffect, useState } from 'react';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
} from '@mui/material';
import medal from '../assets/medal.png';

const Leaderboard = () => {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/leaderboard/leaderboard_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        setData(result); 
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage); 
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); 
    setPage(0);  
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div style={styles.pageContainer}>
      <img src={medal} style={styles.logo} />
      <h2 style={styles.subHeading}>Leaderboard</h2>

      <TableContainer key={`page-${page}-rows-${rowsPerPage}`} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell> 
              <TableCell>Company Name</TableCell>
              <TableCell>Total Reduction in CO2</TableCell>
              <TableCell>Average Recycling Percent per Material</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={item.userId}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell> 
                <TableCell>{item.userId}</TableCell>

                <TableCell>{item.totalReduction.toFixed(3)}</TableCell>
                <TableCell>{item.averageRecyc.toFixed(3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]} 
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage} 
        onRowsPerPageChange={handleChangeRowsPerPage} 
      />
    </div>
  );
};

const styles = {
  pageContainer: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: 'auto',
    paddingTop: '40px',
    position: 'relative',
  },
  subHeading: {
    fontSize: '1.5rem',
    fontWeight: 'normal',
    marginBottom: '20px',
  },
  logo: {
    maxWidth: '150px',
    marginBottom: '20px',
  },
};

export default Leaderboard;
