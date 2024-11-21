/**
* @file Component serving /project/:projectId/:userId?. 
* View information, charts and data table for a specific project. 
* When accessed as admin, project info and settings cannot be edited
* @component <ProjectDashboard/>
*/

import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import Grid from '@mui/material/Grid2';
import * as Icons from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Drawer, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Table, TableBody, TableRow, TableCell } from '@mui/material';
import dayjs from 'dayjs';

import { TableVisualisation } from './TableVisualisation.jsx'
import { exportToExcel } from './exportToExcel.jsx';
import { ContributionPieChart, EmmissionPieChart, RatioBarChart, ReductionBarChart, getMaterials} from './Graphs.jsx';


const ProjectDashboard = () => {

  const reductionBarRef = useRef(null);
  const ratioBarRef = useRef(null);
  const contributionPieRef = useRef(null);
  const emissionPieRef = useRef(null);

  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();
  const { projectId, userId } = useParams();
  const isAdmin = userId? 1 : 0;
  const [open, setOpen] = useState(true);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [value, setValue] = useState("1");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditPressed, setIsEditPressed] = useState(false);


  const state = useLocation();
  const username = state?.state?.name || "";

  // Set empty values so page doesn't break when data hasn't been fetched yet
  const [projectDetails, setProjectDetails] = useState(
    state?.state?.projectDetails ||
    {
    projectName: "", 
    projectNumber: "", 
    date: "", 
    client: "",
    revision: "",
  });
  //graphs elements to hide
  const [hiddenElements, setHiddenElements] = useState([]);
  //list of materials for given project
  const projectMaterials = getMaterials(projectId);
  
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

        if (response.status == 401) {
          navigate('/projects');
        } else if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
        const result = await response.json();
        setProjectDetails(result.projectDetails);
        setIsLoaded(true);
        
      } catch (err) {
        console.error('Error:', err)
      }
    }
    getProjectDetails();
    if (isEditPressed) {
      navigate(`/edit-project-details/`, { state: { projectId, projectDetails } } )
    }
  }, []);

  const exportAllCharts = () => {
    const chartRefs = [
      { ref: reductionBarRef, filename: 'ReductionBarChart.svg', title: 'CO2 Reduction per Material' },
      { ref: ratioBarRef, filename: 'RatioBarChart.svg', title: 'CO2 Reduction Ratio' },
      { ref: contributionPieRef, filename: 'ContributionPieChart.svg', title: 'Reduction Contribution in CO2 Emission %' },
      { ref: emissionPieRef, filename: 'EmissionPieChart.svg', title: 'Total CO2 Emission (Ton)' },
    ];
  
    const svgStyles = `
      text {
        font-family: Arial, sans-serif;
        font-size: 12px;
        fill: black;
      }
      .title {
        font-size: 16px;
        font-weight: bold;
        text-anchor: middle;
      }
    `;
  
    // Helper function to capture segment colors and apply to legend items
    const matchLegendToSegments = (clonedSvg) => {
      const legendItems = clonedSvg.querySelectorAll('.legend-item');
      const segments = clonedSvg.querySelectorAll('path'); // Assuming pie segments are <path> elements
  
      legendItems.forEach((legendItem, index) => {
        if (segments[index]) {
          const segmentColor = segments[index].getAttribute('fill');
          const legendRect = legendItem.querySelector('rect'); // Assuming each legend has a <rect> for color
          if (legendRect) {
            legendRect.setAttribute('fill', segmentColor);
          }
        }
      });
    };
  
    chartRefs.forEach(({ ref, filename, title }, index) => {
      setTimeout(() => {
        const svgElement = ref.current?.querySelector('svg');
        if (svgElement) {
          const clonedSvg = svgElement.cloneNode(true);
  
          // Apply color matching for legend and pie segments
          matchLegendToSegments(clonedSvg);
  
          // Add style and title as before
          const styleTag = document.createElement('style');
          styleTag.textContent = svgStyles;
          clonedSvg.insertBefore(styleTag, clonedSvg.firstChild);
  
          const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          titleElement.setAttribute('x', clonedSvg.getAttribute('width') / 2);
          titleElement.setAttribute('y', 20);
          titleElement.setAttribute('class', 'title');
          titleElement.textContent = title;
          clonedSvg.insertBefore(titleElement, clonedSvg.firstChild);
  
          const svgData = new XMLSerializer().serializeToString(clonedSvg);
          const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
  
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
  
          URL.revokeObjectURL(url); // Clean up
        } else {
          console.log(`SVG not found for ${filename}`);
        }
      }, index * 500); // Delay of 500 ms between each download
    });
  };  

  // Get project details or replace with default values if it failed to be fetched
  const getDetail = () => {
    return ({
          projectName: projectDetails?.projectName || "Loading Project...", 
          projectNumber: projectDetails?.projectNumber || "0000", 
          date: projectDetails?.date || dayjs().format("D MMM YYYY"), 
          clientName: projectDetails?.clientName || "-",
          revisionNumber: projectDetails?.revisionNumber || "-",
    })
  }

  const getProjectNameHeading = () => {
    const name = getDetail().projectName;
    return isAdmin ? `${username}'s Project: ${name}` : name;
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleEditProject = () => {
      navigate(`/edit-project-details/`, { state: { projectId, projectDetails } } )
  };

  const handleViewProjectDetails = () => {
    setProjectDetailsOpen(true);
  };

  const handleProjectDetailsClose = () => {
    setProjectDetailsOpen(false);
  };

  const handleSettings = () => {
    navigate(`/project-settings/${projectId}`);
  };

  const handleBack = () => {
    if (isAdmin) {
      navigate(`/projects/${userId}`, { state: { name: username }});
    } else {
      navigate('/projects');
    }
  };

  const handleDeleteProject = () => {
    setDeleteAlertOpen(true); 
  };

  const handleAlertClose = () => {
    setDeleteAlertOpen(false); 
  };
  
  // Deleting a project
  const deleteProject = async () => {
    try {
        const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/delete-project/${projectId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            
        });
        const result = await response.json();
        if (response.ok) {
            alert('Project deleted successfully!');
            if (isAdmin) {
              navigate(`/projects/${userId}`, { state: { name: username }});
            } else {
              navigate('/projects');
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete the project.');
    }
  }


  /** 
  * Toggles on/off given value from graphs
  * @param {string} toggledValue - Project ID
  * @returns {null}
  */
  const toggleValue = (toggledValue = null) => {

    let newElements = hiddenElements.slice();
    
    if (toggledValue) {
      if (newElements.includes(toggledValue)) {
        let index = newElements.indexOf(toggledValue);
        newElements.splice(index, 1);
      } else {
        newElements.push(toggledValue);
      }
    }

    setHiddenElements(newElements);
  }

  /** 
  * Generates the panel to control interactive graphs
  */
  const InteractivePanel = () => {

    const emissionTypes = ['Recycling', 'Transportation', 'Production'];

    let materialToggles = [];
    let emissionTypeToggles = [];

    if (projectMaterials != null) {
      for (let x of projectMaterials) {
        materialToggles.push(
              <md-outlined-button style={{margin: '5px 10px', width:'auto'}} onClick={() => {toggleValue(x)}} key={x}>Toggle {x}</md-outlined-button>
          );
      }
    }
    
    for (let x of emissionTypes) {
      emissionTypeToggles.push(
          <md-outlined-button style={{margin: '5px 10px', width:'auto'}} onClick={() => {toggleValue(x)}} key={x}>Toggle {x}</md-outlined-button>
      );
  }

    return (

        <div className="chart-container">
          <Grid item xs={12} sm={6} md={6} lg={5}>
            {materialToggles}
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={5} style={{marginTop:'10px'}}>
            {emissionTypeToggles}
          </Grid>
        </div>

    )
  }

  
  // Get items for side menu based on whether user is admin or not
  const items = {
    'edit': {'text': 'Edit Project', 'icon': <Icons.Edit />, 'handleClick': handleEditProject}, 
    'exportData': {'text': 'Export Data', 'icon': <Icons.FileDownload />, 'handleClick': () => exportToExcel({ projectId })}, 
    'exportChart': {'text': 'Export Chart', 'icon': <Icons.FileDownload />, 'handleClick': exportAllCharts }, 
    'viewDetails': {'text': 'View Details', 'icon': <Icons.List />, 'handleClick': handleViewProjectDetails},
    'settings': {'text': 'Settings', 'icon': <Icons.Settings />, 'handleClick': handleSettings},
    'deleteProject': {'text': 'Delete Project', 'icon': <Icons.Delete />, 'handleClick': handleDeleteProject},
    'back': {'text': 'Back', 'icon': <Icons.ArrowBack />, 'handleClick': handleBack},
  };

  const drawerItems = isAdmin ? [
    items.exportData, 
    items.exportChart, 
    items.viewDetails, 
    items.deleteProject, 
    items.back
  ] : [
    items.edit, 
    items.exportData, 
    items.exportChart, 
    items.viewDetails, 
    items.settings, 
    items.deleteProject, 
    items.back
  ];


  const projectDetailsList = [
    {'detail': 'Project Name', 'content': getDetail().projectName}, 
    {'detail': 'Project Date', 'content': getDetail().date}, 
    {'detail': 'Project Number', 'content': getDetail().projectNumber}, 
    {'detail': 'Client', 'content': getDetail().clientName}, 
    {'detail': 'Revision', 'content': getDetail().revisionNumber}, 
  ];

  return (
  <div className='page-container-widest'>
    <Box 
      display='flex' 
    >
      <Box
        display='flex'
        flexDirection='column'
      >
        {/* Project number and date above side menu */}
        <h4>Project No. {getDetail().projectNumber}</h4>
        <h4>{dayjs(getDetail().date).format("D MMM YYYY")}</h4>

        {/* Side menu with buttons to edit data, export data/charts, view details and delete project */}
        <Drawer 
          variant='persistent' 
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            width: '200px', 
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 'auto', 
              boxSizing: 'border-box',
              position: 'relative',
              marginTop: '16px',
            },
          }}
          anchor='left'
        >
          <List>
            {drawerItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton id={item.text} onClick={item.handleClick}>
                  <ListItemIcon> {item.icon} </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>

      <Box className="main-box">

        {/* <h1 style={styles.heading}>{getProjectNameHeading()}</h1> */}
        <h2>{getProjectNameHeading()}</h2>

        {/* Tabs to change between Charts and Data */}
        <TabContext value={value}>
          <Box >
            {/* <TabList sx={styles.tab} onChange={handleTabChange} centered>
              <Tab  label="Charts" value="1" sx={styles.tabs}/>
              <Tab label="Data" value="2" sx={styles.tabs}/> */}
            <TabList onChange={handleTabChange} centered sx={{
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}>
              <Tab 
                label="Charts" 
                value="1" 
                sx={{
                  color: '#000000', // Default color for the tab label
                  '&.Mui-selected': {
                    color: '#2F4F2F', // Color when the tab is selected
                  },
                  '&:hover': {
                    color: '#73af73', // Color on hover
                  }
                }}
              />
              <Tab 
                label="Data" 
                value="2" 
                sx={{
                  color: '#000000', // Default color for the tab label
                  '&.Mui-selected': {
                    color: '#2F4F2F', // Color when the tab is selected
                  },
                  '&:hover': {
                    color: '#73af73', // Color on hover
                  }
                }}
              />
            </TabList>
          </Box>
          {/* Chart components*/}
          <TabPanel value="1">
            <Grid container spacing={2} justifyContent="center">
              <InteractivePanel/>
              <Grid item xs={12} sm={6} md={6} lg={5}> {/* ReductionBarChart on the left */}
                <ReductionBarChart ref={reductionBarRef} projectID={projectId} hiddenElements={hiddenElements}/>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={5}> {/* RatioBarChart on the right */}
                <RatioBarChart ref={ratioBarRef} projectID={projectId} hiddenElements={hiddenElements}/>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={5}> {/* ContributionPieChart below the bar charts */}
                <ContributionPieChart ref={contributionPieRef} projectID={projectId} hiddenElements={hiddenElements}/>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={5}> {/* EmissionPieChart beside ContributionPieChart */}
                <EmmissionPieChart ref={emissionPieRef} projectID={projectId} hiddenElements={hiddenElements}/>
              </Grid>
            </Grid>       
          </TabPanel>
          <TabPanel value="2">
            <TableVisualisation projectId={projectId}/>
          </TabPanel>
        </TabContext>

      </Box>
    </Box>

    {/* Dialog popup for when 'View Details' is clicked */}
    <Dialog
      open={projectDetailsOpen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{textAlign: 'center'}}>Project Details</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleProjectDetailsClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Table>
          <TableBody>
            {projectDetailsList.map((item) => (
              <TableRow key={item.detail}>
                <TableCell className='dialog-cell'>{item.detail}</TableCell>
                <TableCell className='dialog-cell'>{item.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>

    {/* Alert popup for when 'Delete Project' is clicked */}
    <Dialog
      open={deleteAlertOpen}
      onClose={handleAlertClose}
      sx={{textAlign: 'center'}}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle sx={{ fontSize: 16}}>
        Delete project <i>'{getDetail().projectName}'</i>?
      </DialogTitle>
      <DialogActions root>
        <Button sx={styles.deleteButton} onClick={deleteProject}>Delete</Button>
        <Button sx={styles.cancelButton} onClick={handleAlertClose} autoFocus> Cancel </Button>
      {/* <DialogActions>
        <Button onClick={deleteProject} color="error">Delete</Button>
        <Button onClick={handleAlertClose} autoFocus>Cancel</Button> */}
      </DialogActions>
    </Dialog>
    
  </div>
  )
};

// Define CSS styles for the component
const styles = {
  pageContainer: {
    textAlign: 'center',
    margin: 'auto',
    paddingTop: '10px',
    position: 'relative',
  },
  heading: {
    marginTop: '0px',
  },
  subHeading: {
    fontSize: '1.5rem',
    fontWeight: 'normal',
    marginBottom: '0px',
  },
  heading4: {
    color: 'gray',
    fontWeight: 300,
    marginTop: '0px',
    marginLeft: '5px',
    textAlign: 'left',
  },
  mainBody: {
    textAlign: 'center', 
    padding: '0px 10px 10px 10px',
  },
  button: {
    width: '200px', 
    height: '50px', 
    borderRadius: '5px', 
    margin: '10px 0', 
    textAlign: 'center', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  drawer: {
    width: '200px', 
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 'auto', 
      boxSizing: 'border-box',
      position: 'relative',
      marginTop: '16px',
    },
  },
  mainBox: {
    flexGrow: 1,
    margin: '0px 10px 10px 10px',
  },
  tabs: {
    borderBottom: 1,
    borderColor: 'green',
    color: '#2F4F2F',
  },
  dialog: {
    width: '600px',
    textAlign: 'center',
  },
  dialogCell: {
    wordWrap: 'break-word', 
    whiteSpace: 'normal', 
  },
  deleteButton: {
    color: 'red',
  },
  cancelButton: {
    color: '#444444',
  },
  tab: {
    '.MuiTab-root': {
      color: '#2F4F2F',
    },
    '.Mui-selected': {
      color: '#2F4F2F',
      borderColor: 'green',
      
    },
    '.css-1qltlow-MuiTabs-indicator': {

      backgroundColor: '#2F4F2F'
    }
  }
};

export default ProjectDashboard;
