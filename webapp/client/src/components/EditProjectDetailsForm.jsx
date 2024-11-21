/**
* @file Component serving /edit-project-details
* Allows users to edit the details of an existing project, including the project name, date, client name, and revision number.
* Essential fields are validated before submission, and updates are sent to the backend.
* On successful submission, users are redirected to the project data editing page.
* @component <EditProjectDetailsForm/>
*/


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const EditProjectDetailsForm = () => {
  // Declare state variables for form fields
  const navigate = useNavigate();
  const { state: { projectId } = {} } = useLocation();
  const token = localStorage.getItem('jwtToken');
  const [projectDetails, setProjectDetails] = useState({
    projectName: "", 
    projectNumber: "", 
    date: dayjs(), 
    client: "",
    revision: "",
  });

  useEffect(() => {
    const getProjectDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/get-project-details/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        const result = await response.json();
        let resultDetails = result.projectDetails;
        resultDetails['date'] = dayjs(resultDetails['date']);
        
        setProjectDetails(resultDetails);
      } catch (err) {
        console.error('Error:', err)
      }
    }
    getProjectDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value.trim(),
    }));
  };

  const handleDateChange = (newDate) => {
    setProjectDetails((prevDetails) => ({
      ...prevDetails,
      date: newDate,
    }));
  };

  // Get project details or replace with default values if it failed to be fetched
  const getDetail = () => {
    return ({
          projectName: projectDetails?.projectName || "Loading Project...", 
          projectNumber: projectDetails?.projectNumber || "0000", 
          date: dayjs(projectDetails?.date) || dayjs(), 
          clientName: projectDetails?.clientName || "-",
          revisionNumber: projectDetails?.revisionNumber || "-",
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const details = getDetail();
    // Ensure essential fields are filled (Client and revision number not required)
    if (!projectDetails.projectName || !projectDetails.projectNumber || !projectDetails.date) {
      alert('Please enter all required fields');
      return;
    }

    if (!details.date.isValid()) {
      alert('Please enter a valid date');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/edit-project-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          projectId, 
          projectName: details.projectName, 
          date: dayjs(details.date).format('YYYY-MM-DD'), 
          clientName: details.clientName, 
          revisionNumber: details.revisionNumber }),
      });

      const result = await response.json();

      if (response.ok) {
        // Pass project data page with created project's id
        navigate('/edit-project-data', { state: { projectId } } );
      } else {
        console.error(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className='page-container'>
      <h2 className='sub-heading'>Edit Project</h2>

      <form onSubmit={handleSubmit}>
        {/* Project Name */}
        <md-outlined-text-field 
          // required
          label="Project Name*" 
          name="projectName"
          value={getDetail().projectName} 
          defaultValue={getDetail().projectName}
          onInput={handleChange} 
        ></md-outlined-text-field>

        {/* Project Number (Disabled for input) */}
        <md-outlined-text-field 
          disabled
          // required
          label="Project Number*" 
          name="projectNumber"
          value={getDetail().projectNumber} 
          defaultValue={getDetail().projectNumber}
          onInput={handleChange} 
        ></md-outlined-text-field>

        {/* Date */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
            label="Date*" 
            name="date" 
            sx={{ width: '245px' }}
            value={getDetail().date} 
            // defaultValue={dayjs()} 
            format="DD/MM/YYYY"
            onChange={handleDateChange}
            slotProps={{ textField: { variant: 'outlined' }, readOnly: false }}
          />
        </LocalizationProvider>

        {/* Client Name */}
        <md-outlined-text-field 
          label="Client" 
          name="clientName" 
          value={getDetail().clientName} 
          defaultValue={getDetail().clientName}
          onInput={handleChange} 
        ></md-outlined-text-field>

        {/* Revision Number */}
        <md-outlined-text-field 
          label="Revision Number" 
          name="revisionNumber" 
          value={getDetail().revisionNumber}
          defaultValue={getDetail().revisionNumber}
          onInput={handleChange} 
        ></md-outlined-text-field>

        {/* Submit Button */}
        <md-filled-button label="Next" type="submit">Next</md-filled-button>
      </form>
    </div>
  );
};

export default EditProjectDetailsForm;