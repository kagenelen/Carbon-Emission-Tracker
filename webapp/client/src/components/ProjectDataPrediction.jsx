/**
* @file Component serving /new-project-forecast. Form to enter building features.
* This form will be used to get machine learning inputs parameters
* Navigates to /edit-project-data on submission.
* @component <ProjectDataPrediction/>
*/

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import { TextField, InputAdornment, Typography, LinearProgress } from '@mui/material';
import { Select, MenuItem, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material';

// Need like a loading bar thing for prediction waiting

const ProjectDataPrediction = () => {
  // Declare state variables for form fields
  const [usage, setUsage] = useState('');
  const [gfa, setGfa] = useState('');
  const [volume, setVolume] =  useState('');
  const [floor, setFloor] = useState('');
  const [useMyData, setUseMyData] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const { state: { projectId } = {} } = useLocation();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure essential fields are filled (volume is optional)
    if (!usage || !gfa || !floor) {
      alert('Usage, gross floor area and floor are required fields');
      return;
    }

    setLoading(true); // Loading screen until fetch finishes

    try {
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/predict-waste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({projectId, usage, gfa, floor, useMyData}),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(result);
        // Pass view project data page with project's id
        navigate('/edit-project-data', { state: { projectId: projectId } } );
      } else {
        console.error(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='page-container'>
      <h2 className='sub-heading'>New Project</h2>

      <form onSubmit={handleSubmit}>
        {/* Building Usage - Dropdown */}
        <Box className='forecast-field'>
          <Typography align="left" className='forecast-label'>Building Usage*</Typography>
          <Select
            id="usage"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            fullWidth
            style={{ textAlign: 'left' }}
          >
            <MenuItem value="education">Education</MenuItem>
            <MenuItem value="residential">Residential</MenuItem>
            <MenuItem value="hospital">Hospital</MenuItem>
            <MenuItem value="retail">Retail</MenuItem>
            <MenuItem value="office">Office</MenuItem>
          </Select>
        </Box>

        {/* Gross Floor Area */}
        <Box className='forecast-field'>
          <Typography align="left" className='forecast-label'>Gross Floor Area*</Typography>
          <TextField
            id="gfa"
            value={gfa}
            onChange={(e) => setGfa(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">m²</InputAdornment>,
            }}
            fullWidth
          />
        </Box>

        {/* Volume */}
        <Box className='forecast-field'>
          <Typography align="left" className='forecast-label'>Building Volume</Typography>
          <TextField
            id="volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">m³</InputAdornment>,
            }}
            fullWidth
          />
        </Box>

        {/* Floor Amount */}
        <Box className='forecast-field'>
          <Typography align="left" className='forecast-label'>Floor Amount*</Typography>
          <TextField
            id="floors"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            fullWidth
          />
        </Box>

        {/* Use My Own Data - Radio */}
        <Box className='forecast-field'>
          <Typography align="left" className='forecast-label'>Use My Historical Data*</Typography>
          <RadioGroup
            id="own-data"
            value={useMyData}
            onChange={(e) => setUseMyData(e.target.value)}
          >
            <FormControlLabel value={true} control={<Radio />} label="Yes" />
            <FormControlLabel value={false} control={<Radio />} label="No" />
          </RadioGroup>
        </Box>

        {/* Submit Button */}
        { loading ? (
          <div>
            <p>Forecasting... </p>
            <LinearProgress size={24} />
          </div>
        ):(
          <md-filled-button label="Submit" type="submit">
            Forecast Waste
          </md-filled-button>
        )}
        
      </form>
    </div>
  )
};

export default ProjectDataPrediction;
