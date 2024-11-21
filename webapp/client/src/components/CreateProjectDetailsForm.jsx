/**
* @file Component serving /new-project-details. Form to enter project details.
* Navigates to /new-project-data on submission.
* @component <CreateProjectDetailsForm/>
*/

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { SessionContext } from './Layout.jsx';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';


const CreateProjectDetailsForm = () => {
  // Declare state variables for form fields

  const [projectName, setProjectName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [date, setDate] = useState(dayjs());
  const [clientName, setClientName] = useState('');
  const [revisionNumber, setRevisionNumber] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [projectId, setProjectId] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const session = useContext(SessionContext);
  const userId = session.user.userId;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // // Ensure essential fields are filled (Client and revision number not required)
    if (!projectName || !projectNumber || !date) {
      alert('Please enter all required fields');
      return;
    }
    
    if (!date.isValid()) {
      alert('Please enter a valid date');
      return;
    }

    try {
      const projectDate = dayjs(date).format('YYYY-MM-DD');
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/create-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, projectName, projectNumber, date: projectDate, clientName, revisionNumber }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        setProjectId(result.projectId);
        // Open data entry options box
        setOpenDialog(true);
      } else {
        alert(result.message);
        console.error(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className='page-container'>
      <h2 className='sub-heading'>New Project</h2>

      <form onSubmit={handleSubmit}>
        {/* Project Name */}
        <md-outlined-text-field 
          // required
          label="Project Name*" 
          value={projectName} 
          onInput={(e) => setProjectName(e.target.value.trim())} 
        ></md-outlined-text-field>

        {/* Project Number */}
        <md-outlined-text-field 
          // required
          label="Project Number*" 
          value={projectNumber} 
          onInput={(e) => setProjectNumber(e.target.value.trim())} 
        ></md-outlined-text-field>

        {/* Date */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
            label="Date*" 
            sx={{ width: '245px' }}
            value={date} 
            format="DD/MM/YYYY"
            onChange={(newDate) => { setDate(newDate) }}
            renderInput={(params) => (
              <TextField 
                {...params}   
                error={true}
                helperText="Please enter a valid date" 
              />
            )}
          />
        </LocalizationProvider>

        {/* Client Name */}
        <md-outlined-text-field 
          label="Client" 
          value={clientName} 
          onInput={(e) => setClientName(e.target.value.trim())} 
        ></md-outlined-text-field>

        {/* Revision Number */}
        <md-outlined-text-field 
          label="Revision Number" 
          value={revisionNumber} 
          onInput={(e) => setRevisionNumber(e.target.value.trim())} 
        ></md-outlined-text-field>

        {/* Submit Button */}
        <md-filled-button label="Next" type="submit">Next</md-filled-button>
      </form>

      {/* Project Data Options */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select Next Step</DialogTitle>
        <DialogContent>
          <p>How would you like to enter your project data?</p>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
          {/* Pass project data page with created project's id */}
          <md-filled-button onClick={() => navigate('/edit-project-data', { state: { projectId: projectId } })}
            >Manual</md-filled-button>
          <md-filled-button onClick={() => navigate('/new-project-forecast', { state: { projectId: projectId } })}
            >Forecast</md-filled-button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateProjectDetailsForm;
