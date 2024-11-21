/**
* @file Component serving /project-settings. Form to change project formula constants
* Navigates to /project on submission.
* @component <ProjectSettings/>
*/

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { InputAdornment, TextField, Dialog, DialogContent, DialogActions, Button } from '@mui/material';

const ProjectSettings = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const token = localStorage.getItem('jwtToken');

  const [materials, setMaterials] = useState([]);
  const [landfillDist, setLandfillDist] = useState([]);
  const [plantDist, setPlantDist] = useState([]);
  const [finalProductCo2Rate, setFinalProductCo2Rate] = useState([]);
  const [plantCo2Rate, setPlantCo2Rate] = useState([]);
  const [transportCo2Rate, setTransportCo2Rate] = useState("0");
  const [errorOpen, setErrorOpen] = useState(false); // For the error dialog

  useEffect(() => {
    const getProjectDetails = async () => {
      try {
        const response1 = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/get-project-data/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const result1 = await response1.json();

        const response2 = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/get-project-details/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const result2 = await response2.json();

        const materialsObj = result1.projectData;
        setMaterials(Object.keys(materialsObj));
        setLandfillDist(Object.values(materialsObj).map(item => item.landfillDist || "0"));
        setPlantDist(Object.values(materialsObj).map(item => item.plantDist || "0"));
        setFinalProductCo2Rate(Object.values(materialsObj).map(item => item.finalProductCo2Rate || "0"));
        setPlantCo2Rate(Object.values(materialsObj).map(item => item.plantCo2Rate || "0"));
        setTransportCo2Rate(result2.projectDetails.transportCo2Rate || "0");
      } catch (err) {
        console.error('Error:', err);
      }
    };
    getProjectDetails();
  }, [projectId, token]);

  const handleInput = (category, index, value) => {
    let tempArray;
    switch (category) {
      case 'plantCo2Rate':
        tempArray = [...plantCo2Rate];
        tempArray[index] = value;
        setPlantCo2Rate(tempArray);
        break;
      case 'finalProductCo2Rate':
        tempArray = [...finalProductCo2Rate];
        tempArray[index] = value;
        setFinalProductCo2Rate(tempArray);
        break;
      case 'landfillDist':
        tempArray = [...landfillDist];
        tempArray[index] = value;
        setLandfillDist(tempArray);
        break;
      case 'plantDist':
        tempArray = [...plantDist];
        tempArray[index] = value;
        setPlantDist(tempArray);
        break;
      case 'transportCo2Rate':
        setTransportCo2Rate(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalidValue = (value) => {
      const valueFloat = parseFloat(value);
      return isNaN(valueFloat) || valueFloat < 0;
    };

    if (
      landfillDist.some(invalidValue) ||
      plantDist.some(invalidValue) ||
      finalProductCo2Rate.some(invalidValue) ||
      plantCo2Rate.some(invalidValue) ||
      invalidValue(transportCo2Rate)
    ) {
      setErrorOpen(true);
      return;
    }

    const settingsData = materials.map((material, i) => ({
      "material": material,
      "landfillDist": Number(landfillDist[i]),
      "plantDist": Number(plantDist[i]),
      "finalProductCo2Rate": Number(finalProductCo2Rate[i]),
      "plantCo2Rate": Number(plantCo2Rate[i])
    }));

    try {
      const response1 = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/edit-project-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, projectData: settingsData })
      });

      const response2 = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/edit-project-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, transportCo2Rate })
      });

      if (response1.ok && response2.ok) {
        navigate(`/project/${projectId}`);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="page-container-widest">
      <h2 className="sub-heading">Project Settings</h2>
      <form className="data-form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>Project Constants</Typography>
        <TextField
          id="transport-co2-field"
          variant="outlined"
          label="Transportation CO2 Emission Rate"
          value={transportCo2Rate}
          onChange={(e) => handleInput('transportCo2Rate', 0, e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end">kg CO2/km</InputAdornment>
          }}
        />
        
        <Typography variant="h6" gutterBottom>Material Constants</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Recycling Plant CO2 Emission Rate</TableCell>
                <TableCell>Final Product Production CO2 Emission Rate</TableCell>
                <TableCell>Distance to Landfill</TableCell>
                <TableCell>Distance to Recycling Plant</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material, i) => (
                <TableRow key={i}>
                  <TableCell>{material}</TableCell>
                  <TableCell>
                    <md-outlined-text-field
                      value={plantCo2Rate[i] || "0"}
                      onInput={(e) => handleInput('plantCo2Rate', i, e.target.value)}
                    ></md-outlined-text-field>
                  </TableCell>
                  <TableCell>
                    <md-outlined-text-field
                      value={finalProductCo2Rate[i] || "0"}
                      onInput={(e) => handleInput('finalProductCo2Rate', i, e.target.value)}
                    ></md-outlined-text-field>
                  </TableCell>
                  <TableCell>
                    <md-outlined-text-field
                      value={landfillDist[i] || "0"}
                      onInput={(e) => handleInput('landfillDist', i, e.target.value)}
                    ></md-outlined-text-field>
                  </TableCell>
                  <TableCell>
                    <md-outlined-text-field
                      value={plantDist[i] || "0"}
                      onInput={(e) => handleInput('plantDist', i, e.target.value)}
                    ></md-outlined-text-field>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <md-filled-button type="submit">Confirm Settings</md-filled-button>

        <Dialog open={errorOpen} onClose={() => setErrorOpen(false)}>
          <DialogContent>Please enter valid positive numbers.</DialogContent>
          <DialogActions>
            <Button onClick={() => setErrorOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </form>
    </div>
  );
};

export default ProjectSettings;
