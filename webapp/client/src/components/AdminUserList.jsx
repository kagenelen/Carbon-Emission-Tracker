/**
* @file Component serving /users
* Displays the user list for the admin user. 
* Provides navigation options for viewing user profiles and user projects
* @component <AdminUserList/>
*/

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import '../theme.css';  // Import the CSS file

const AdminUserList = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);

  const [ emptyMessage, setEmptyMessage ] = useState("Loading users");
  
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('jwtToken');
      try {
        const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/user/get-all-users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (response.status == 403) {
          alert("Invalid admin permissions, redirecting...");
          navigate('/projects');
        } else if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
    
        const data = await response.json();
    
        if (Array.isArray(data.users)) {
          data.users.sort((a, b) => a._id.localeCompare(b._id));
          setUserList(
            data.users
            .filter((user) => (user.permission == 0))
            .sort((a, b) => a.name.localeCompare(b.name))
          );
        } else {
          console.error("users data is missing or not an array.");
          setUserList([]);
          setEmptyMessage("No users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUserList([]);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    navigate(`/profile/${user._id}`, { state: { name: user.name} });
  };

  const handleProjectsClick = (user) => {
    navigate(`/projects/${user._id}`, { state: { name: user.name} });
  };

  return (
    <div className="page-container">
      <h2 className="sub-heading">Manage Users</h2>
      <Stack style={{ alignItems: 'center' }}> 
        <TableContainer className="project-table">
          <Table>
            <TableBody>
              {userList.length > 0 ? (
                userList.map((user, i) => (
                  <TableRow  key={i} sx={{width: '100%', paddingRight: '0px'}}>
                      <TableCell 
                        className="user-table-name"
                      >
                        <div style={{fontWeight: 600}}>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell 
                        className="user-table-link"
                        onClick={() => handleUserClick(user)}
                      >
                        <div>
                          View profile
                        </div>
                      </TableCell>
                      <TableCell 
                        className="user-table-link"
                        onClick={() => handleProjectsClick(user)}
                      >
                        <div>
                          View projects 
                        </div>
                      </TableCell>
                      
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </div>
  );
};

export default AdminUserList;
