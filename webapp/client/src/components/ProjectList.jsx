/**
* @file Component displaying the Project List page where users can manage their projects.
* Fetches and displays a list of projects associated with the authenticated user.
* Provides navigation options for viewing project details and creating new projects.
* When accessed as an admin, displays the project list for a user, with options to 
* navigate to the user's profile or back to the users list
* @component <ProjectList/>
*/

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import { Stack, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import '../theme.css';  // Import the CSS file

const ProjectList = () => {
  const navigate = useNavigate();

  const [projectList, setProjectList] = useState([]);
  const [ emptyMessage, setEmptyMessage ] = useState("No projects available");

  const { userId } = useParams();
  const isAdmin = userId ? 1: 0;

  const state = useLocation();
  const name = state?.state?.name || "";
  const [ username, setUsername ] = useState(name);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('jwtToken');
      try {
        const base = `${import.meta.env.REACT_APP_BASE_URL}/get-all-projects`;
        const route = userId ? `${base}/${userId}` : base;
        const response = await fetch(route, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        // Redirect if user tries to get projects of a user by userId and does not have admin permissions
        if (response.status == 403) {
          alert("Invalid admin permissions, redirecting...");
          navigate('/projects');
        } else if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
        
        const data = await response.json();
    
        if (Array.isArray(data.projects)) {
          setProjectList(data.projects);
        } else {
          console.error("Projects data is missing or not an array.");
          setProjectList([]);
        }
        setEmptyMessage("No projects available");
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjectList([]);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem('jwtToken');
      try {
        const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/user/get-user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
    
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
    
        const data = await response.json();
        setUsername(data.users.name);

      } catch (error) {
        console.error("Error getting user:", error);
      }
    };
    if (isAdmin) {
      getUser();
    }
  }, []);


  // Handle all button presses
  const handleNewProject = () => {
    navigate('/new-project-details');
  };

  const handleViewUserProfile = () => {
    navigate(`/profile/${userId}`, { state: { name: username} });
  };

  const handleBackButton = () => {
    navigate('/users');
  };

  const handleProjectClick = (project) => {
    if (isAdmin) {
      navigate(`/project/${project._id}/${userId}`, {state: { name: username } });
    } else {
      navigate(`/project/${project._id}`);
    }
  };


  // Get page components based on whether user is an admin or not
  const getHeading = () => {
    if (isAdmin) {
      return `${username}'s Projects`;
    } 
    return 'Manage Projects';
  };

  const getNewProjectButton = () => {
    return isAdmin ? null : (
      <div>
        <md-filled-button onClick={handleNewProject}>New Project</md-filled-button>
      </div>
    )
  };

  const getViewUserProfileButton = () => {
    return !isAdmin ? null : (
      <div>
        <md-outlined-button id='get-user-profile-button' onClick={handleViewUserProfile}>View User Profile</md-outlined-button>
      </div>
    )
  };

  const getBackButton = () => {
    return !isAdmin ? null : (
      <div className='back-button-container'>
        <md-outlined-button id='back-to-users-button' sx={{ position: 'absolute' }}  onClick={handleBackButton}>Back to users</md-outlined-button>
      </div>
    )
  };

  
  return (
    <div>
      {getBackButton()}
      <div className="page-container">
        <h2 className="sub-heading">{getHeading()}</h2>
        <Stack style={{ alignItems: 'center' }}> 
          {getViewUserProfileButton()}
          <TableContainer className="project-table">
            <Table>
              <TableBody>
                {projectList.length > 0 ? (
                  projectList.map((project, i) => (
                    <TableRow className="project-row" onClick={() => handleProjectClick(project)} key={i}>
                      <TableCell className="project-table-project">
                        {project.projectName}
                      </TableCell>
                      <TableCell className="project-table-date">
                        {project.date}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                      {emptyMessage}
                  {/**     */}
    {/* <div className="page-container-wide">
      <h2 className="sub-heading">Manage Projects</h2>
      <Stack style={{ alignItems: 'center' }}> 
        <TableContainer className="project-table">
          <Table>
            <TableBody>
              {projectList.length > 0 ? (
                projectList.map((project, i) => (
                  <TableRow className="project-row" onClick={() => handleProjectClick(project)} key={i}>
                    <TableCell className="project-table-project">
                      {project.projectName}
                    </TableCell>
                    <TableCell className="project-table-date">
                      {project.date} */}
                    {/*    */}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {getNewProjectButton()}
        </Stack>
      </div>
    </div>
  );
};

export default ProjectList;
