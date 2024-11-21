/**
* @file Component serving /profile/:userId?. 
* Can logout which clears session token. Or navigate to /change-email, /change-password
* As admin, shows buttons to view user projects at /projects/userId, send password reset 
* email to user, change email at /change-email or delete user
* @component <Profile/>
*/

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import { Stack } from '@mui/material';
import accountCircle from '../assets/account_circle.png';
import { Dialog, DialogTitle, DialogActions, Button} from '@mui/material';
import { SessionContext } from './Layout.jsx';
import ProfileHeader from './ProfileHeader';


const Profile = () => {
  const navigate = useNavigate();
  const session = useContext(SessionContext);
  const { userId } = useParams();
  const asAdmin = userId ? 1 : 0;
  const state = useLocation();
  const name = state?.state?.name || "";
  const [ username, setUsername ] = useState( name);
  const [ userEmail, setUserEmail ] = useState("");
  const [ deleteAccountAlertOpen, setDeleteAccountAlertOpen ] = useState(false);

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
    
        if (response.status == 403) {
          alert("Invalid admin permissions, redirecting...");
          navigate('/projects');
        } else if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
    
        const data = await response.json();
        setUsername(data.users.name);
        setUserEmail(data.users.email);

      } catch (error) {
        console.error("Error getting user:", error);
      }
    };
    if (asAdmin) {
      getUser();
    } else {
      setUsername(session.user.userName || "Not logged in");
    }
  }, [userId]);


  // Handle all button presses
  const handleviewProjects = () => {
    navigate(`/projects/${userId}`, { state: { name: username } });
  };

  const handleChangeEmail = () => {
    if (asAdmin) {
      navigate(`/change-email/${userId}`, { state: { name: username } });
    } else {
      navigate(`/change-email`);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleLogout = () => {
    // Clear session token
    session.setSessionJwt({});
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const handleBackButton = () => {
    navigate('/users');
  };

  const handleProjectList = () => {
    if (asAdmin) {
      navigate(`/projects/${userId}`, { state: { name: username } });
    } else {
      navigate('/projects');
    }
  };

  const deleteAccount = async () => {
    setDeleteAccountAlertOpen(false);

    try {
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/user/delete-user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });
      console.log(response);
      if (response.ok) {
        alert(`User '${username}' has been deleted`);
        navigate('/users');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }

  const handleResetPassword = async () => {
    
    try {
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/login/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();
      if (response.status == 202) {
        k
        alert(`Password reset link has been sent to ${userEmail}`);
      }

      if (response.ok) {
        console.log(result);
      } else {
        // Shows if no user is registered with entered email
        console.error(result.message);
        alert(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };


  // Get all components based on whether user is an admin or not
  const getUserProjectsButton = () => {
    return !asAdmin ? "": (
      <div>
        <md-filled-button id='get-project-list-button' onClick={handleviewProjects}>View Projects</md-filled-button>
      </div>
    )
  };

  const getChangeEmailButton = () => {
    return (
      <div>
        <md-filled-button onClick={handleChangeEmail}>Change Email</md-filled-button>
      </div>
    )
  };

  const getResetPasswordButton = () => {
    return !asAdmin ? null : (
      <div>
        <md-filled-button onClick={handleResetPassword}>Reset Password</md-filled-button>
      </div>
    )
  };

  const getChangePasswordButton = () => {
    return asAdmin ? null : (
      <div>
        <md-filled-button onClick={handleChangePassword}>Change Password</md-filled-button>
      </div>
    )
  };

  const getDeleteAccountButton = () => {
    return !asAdmin ? null : (
      <div>
          <md-filled-button 
            onClick={() => setDeleteAccountAlertOpen(true)} 
            className="delete-account-button"
            id="delete-account-button"
          >
            Delete Account
          </md-filled-button>

      </div>
    )
  };

  const getLogoutButton = () => {
    return asAdmin ? null : (
      <div>
        <md-filled-button onClick={handleLogout}>Logout</md-filled-button>
      </div>
    )
  };

  const getBackButton = () => {
    return !asAdmin ? null : (
      <div className='back-button-container'>
        <md-outlined-button id='back-to-users-button' sx={{ position: 'absolute' }}  onClick={handleBackButton}>Back to users</md-outlined-button>
      </div>
    )
  }

  const getProjectListButton = () => {
    if (!userId && session.user.permission == 1) {
      return "";
    }
    const buttonText = asAdmin ? 'View Projects' : 'Return to Project List';
    return (
    <div>
      <md-outlined-button id='get-project-list-button' onClick={handleProjectList}>{buttonText}</md-outlined-button>
    </div>
    )
  }


  return (
    <div>
      {getBackButton()}
      <div className='page-container'>
        <ProfileHeader imageSrc={accountCircle} userName={username} adminView={asAdmin}/>

        <Stack spacing={2} direction="column">
          {/* {getUserProjectsButton()} */}
          {getChangePasswordButton()}
          {getResetPasswordButton()}
          {getChangeEmailButton()}
          {getDeleteAccountButton()}
          {getLogoutButton()}
          {getProjectListButton()}
        </Stack>

        {/* Alert popup for when 'Delete Project' is clicked */}
        <Dialog
          open={deleteAccountAlertOpen}
          onClose={() => setDeleteAccountAlertOpen(false)}
          sx={{textAlign: 'center'}}
          maxWidth='xs'
          fullWidth
        >
          <DialogTitle sx={{ fontSize: 16}}>
            Delete user <i>'{username}'</i>?
          </DialogTitle>
          <DialogActions>
            <Button sx={{ color: 'red' }} onClick={deleteAccount}>Delete</Button>
            <Button sx={{ color: '#444444' }} onClick={() => setDeleteAccountAlertOpen(false)} autoFocus> Cancel </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
};

export default Profile;
