/**
* @file Component to display project data and calculations in a table
* Part of <ProjectDashboard> component
* @component <TableVisualisation/>
*/

import React, { useState, useEffect } from 'react';
import { fetchData } from './api/fetchData';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import '../theme.css';

export function TableVisualisation({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchData(projectId);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [projectId]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  const formatValue = (value) => {
    if (value == undefined || value == null) return '-';
    if (value == 0) return '0';
    return value;
  };

  const total_reduction = formatValue(data.total_co2_reduction);
  const recycling_total = formatValue(data.recyc_total);
  const transportation_total = formatValue(data.trans_total);
  const production_total = formatValue(data.prod_total);

  return (
    <div>
      {/* Project Data Title */}
      <Typography
        variant="h5" // Larger title size
        component="h2"
        gutterBottom
        sx={{ fontWeight: 'bold', mt: 2, mb: 1 }} // Adds top and bottom margin
      >
        Project Data
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell>Total Recycled Material [tons]</TableCell>
              <TableCell>Total Deposited Material [tons]</TableCell>
              <TableCell>CO2 Emission by Transportation (landfield) [kg]</TableCell>
              <TableCell>CO2 Emission by Transportation (recycling) [kg]</TableCell>
              <TableCell>CO2 Emission for Production [kg]</TableCell>
              <TableCell>CO2 Emission for Recycling [kg]</TableCell>
              <TableCell>Reduction in CO2 Emission [ton]</TableCell>
              <TableCell>Contribution</TableCell>
              <TableCell>Reduction in CO2 Ratio [ton/ton]</TableCell>
              <TableCell>Recycle Percentage</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.material.map((material, index) => (
              <TableRow key={index}>
                <TableCell>{material}</TableCell>
                <TableCell>{formatValue(data.total_recycled_material[index])}</TableCell>
                <TableCell>{formatValue(data.total_deposited_material[index])}</TableCell>
                <TableCell>{formatValue(data.co2_emmission_by_trans_landfield[index])}</TableCell>
                <TableCell>{formatValue(data.co2_emmission_by_trans_recyc[index])}</TableCell>
                <TableCell>{formatValue(data.co2_emm_for_production[index])}</TableCell>
                <TableCell>{formatValue(data.co2_emm_for_recycling[index])}</TableCell>
                <TableCell>{formatValue(data.reduction_co2_tons[index])}</TableCell>
                <TableCell>{formatValue(data.contribution[index])}</TableCell>
                <TableCell>{formatValue(data.reduction_ratio[index])}</TableCell>
                <TableCell>{formatValue(data.recycled_percent[index])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CO2 Emission Totals Title */}
      <Typography
        variant="h5" // Larger title size
        component="h2"
        gutterBottom
        sx={{ fontWeight: 'bold', mt: 4, mb: 1 }} // Adds top margin for separation
      >
        CO2 Emission Totals
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Total CO2 Reduction [ton]</TableCell>
              <TableCell>Total CO2 Emission from Recycling [ton]</TableCell>
              <TableCell>Total CO2 Emission from Transportation [ton]</TableCell>
              <TableCell>Total CO2 Emission for Production [ton]</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{total_reduction}</TableCell>
              <TableCell>{recycling_total}</TableCell>
              <TableCell>{transportation_total}</TableCell>
              <TableCell>{production_total}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
