/**
* @file Component serving /edit-project-data. Form to change project data
* Navigates to /project on submission.
* @component <EditProjectDataForm/>
*/

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import DeleteIcon from '@mui/icons-material/Delete';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import Paper from '@mui/material/Paper';

const EditProjectDataForm = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const { state: { projectId} = {} } = useLocation();

  const defaultMaterials = [
    "Concrete", 
    "Brick",
    "Black Iron",
    "PVC",
    "Copper",
    "Mixed Metal Scrap",
    "Asbestos",
    "Asbestos Soil",
    "Mixed Waste",
    "VENM"
  ]

  const [materials, setMaterials] = useState([...defaultMaterials]);

  const [projectData, setProjectData] = useState(
    defaultMaterials.reduce((obj, key) => {
      obj[key] = {"tonnage": "", "recycled": "", "truck": ""};
      return obj;
    }, {})
  );

  useEffect(() => {
    const getProjectData = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/get-project-data/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (response.ok && result.projectData) {
          const updatedData = result.projectData;

          // Append any custom materials
          const customMaterials = Object.keys(updatedData).filter(material => !defaultMaterials.includes(material));
          setMaterials([...defaultMaterials, ...customMaterials]);

          setProjectData(updatedData);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    if (projectId) {
      getProjectData();
    }
  }, [projectId, token]);

  const handleChange = (key, field, value) => {
    setProjectData((prevData) => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        [field]: value.trim(),
      },
    }));
  };

  const handleAddCustomMaterial = () => {
    const customMaterialName = `Custom Material ${materials.length - defaultMaterials.length + 1}`;
    setMaterials([...materials, customMaterialName]);
    setProjectData({
      ...projectData,
      [customMaterialName]: { "tonnage": "", "recycled": "", "truck": "" }
    });
  };

  const handleDeleteCustomMaterial = (material) => {
    const updatedMaterials = materials.filter(item => item != material);
    const { [material]: _, ...updatedProjectData } = projectData;
    setMaterials(updatedMaterials);
    setProjectData(updatedProjectData);
    console.log(materials)
    console.log(projectData)
  };

  const handleCustomMaterialNameChange = (oldName, newName) => {
    if (newName && newName != oldName && (defaultMaterials.includes(newName) || materials.includes(newName))) {
      alert("Material names must be unique. This name is already in use.");
      return;
    }

    const updatedMaterials = materials.map(material => (material === oldName ? newName : material));
    const { [oldName]: oldData, ...otherData } = projectData;

    setMaterials(updatedMaterials);
    setProjectData({
      ...otherData,
      [newName]: { ...oldData }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recyclingData = materials.map((material) => ({
      "material": material, 
      "tonnage": Number(projectData[material]?.tonnage || 0), 
      "recycledPercentage": Number(projectData[material]?.recycled || 0),
      "truck": Number(projectData[material]?.truck || 0)
    }));

    try {
      console.log(recyclingData)
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/edit-project-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, projectData: recyclingData }),
      });

      const result = await response.json();

      if (response.ok) {
        navigate(`/project/${projectId}`);
      } else {
        console.error(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className='page-container-widest'>
      <h2 className='sub-heading'>Edit Project Data</h2>

      <form className='data-form' onSubmit={handleSubmit}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '200px' }}>Material</TableCell>
                <TableCell style={{ width: '150px' }}>Tonnage&nbsp;(t)</TableCell>
                <TableCell style={{ width: '150px' }}>Percentage Recycled&nbsp;(%)</TableCell>
                <TableCell style={{ width: '150px' }}>Truck Number</TableCell>
                <TableCell style={{ width: '150px' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material}>
                  <TableCell style={{ width: '200px' }}>
                    {defaultMaterials.includes(material) ? (
                      material
                    ) : (
                      <md-outlined-text-field
                        value={material}
                        onBlur={(e) => handleCustomMaterialNameChange(material, e.target.value)}
                        placeholder="Material"
                      ></md-outlined-text-field>
                    )}
                  </TableCell>
                  <TableCell style={{ width: '150px' }}>
                    <md-outlined-text-field 
                      id={`${material.replace(/\s+/g, '')}-tonnage`}
                      value={projectData[material]?.tonnage || ''} 
                      onInput={(e) => handleChange(material, 'tonnage', e.target.value)}
                    ></md-outlined-text-field>
                  </TableCell>
                  <TableCell style={{ width: '150px' }}>
                    <md-outlined-text-field 
                      id={`${material.replace(/\s+/g, '')}-recycled`}
                      value={projectData[material]?.recycled || ''} 
                      onInput={(e) => handleChange(material, 'recycled', e.target.value)}
                    ></md-outlined-text-field>
                  </TableCell>
                  <TableCell style={{ width: '150px' }}>
                    <md-outlined-text-field 
                      id={`${material.replace(/\s+/g, '')}-truck`}
                      value={projectData[material]?.truck || ''} 
                      onInput={(e) => handleChange(material, 'truck', e.target.value)}
                    ></md-outlined-text-field>
                  </TableCell>
                  <TableCell style={{ width: '150px' }}>
                    {!defaultMaterials.includes(material) && (
                      <IconButton onClick={() => handleDeleteCustomMaterial(material)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Submit Button */}
        <md-filled-button className='data-button' label="Enter Data" type="submit">Enter Data</md-filled-button>
      </form>
      {/* Add Custom Material Button */}
      <md-outlined-button 
          onClick={handleAddCustomMaterial} 
          label="Add Custom Material"
          style={{ display: 'block', margin: '20px auto' }}
        >
          Add Custom Material
        </md-outlined-button>
    </div>
  );
};

export default EditProjectDataForm;
