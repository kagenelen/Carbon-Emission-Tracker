/**
* @file Component serving all pages.
* For permanent UI elements and session checking
* @component <Layout/>
*/

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clientLogo from '../assets/client_logo.jpg';
import UNSWLogo from '../assets/unsw_logo.png';
import accountCircle from '../assets/account_circle.png'
import {Grid} from '@mui/material'
import '../theme.css';  // Import the CSS file

export const SessionContext = createContext();

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ user, setUser ] = useState({"placeholder": 1}); // Cannot be empty other second useEffect will try to redirect
  const [ sessionJwt, setSessionJwt ] = useState(''); // Passed to /login to force render when token is updated

  /////////////////// Session related code /////////////////

  useEffect(() => {
    // Retrieve, verify and decode the jwt token from local storage
    // This code is run after /login sets sessionJwt
    const token = localStorage.getItem('jwtToken');
    fetch(`${import.meta.env.REACT_APP_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      .then(response => response.json())
      .then(data => {
        setUser(data);
      })
    
  }, [sessionJwt]);
  
  useEffect(() => {
    // This has to be kept separate from above, since setUser is does not immediately update user
    if (Object.keys(user).length == 0) {
      // Exclude login related and register page from invalid session redirect
      let currentUrl = location.pathname;
      if (!currentUrl.includes('login') && currentUrl != "/register") {
        alert("Invalid or expired session, redirecting...");
        navigate('/login');
      }
    }
  }, [user]);

  /////////////////// Navigation related code and elements /////////////////

  const isAdmin = user.permission;

  const loggedOutPages = [
    "/register" , 
    "/login/request-password-reset" , 
    "/:userId/:token/login" , 
    "/login" , 
  ];
  
  const handleHeadingClick = () => {
    navigate(isAdmin ? 'users' : '/projects');
  }

  const handleAccountClick = () => {
    navigate('/profile');
  }

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
  }

  const loggedIn = () => {
    if (loggedOutPages.includes(window.location.pathname) || Object.keys(user).length == 0) {
      // Not logged in
      return false;
    }
    return true;
  }


  const getHeading = () => {
    const headingName = isAdmin ? 'Rubble to Renewal (Admin)' : 'Rubble to Renewal'
    if (loggedIn()) {
      return (
        <div className='heading-container'>
          <h1 onClick={handleHeadingClick}>{headingName}</h1>
          {/* <h1 style={{ cursor: 'pointer' }} onClick={handleHeadingClick}>Rubble to Renewal</h1> */}
        </div>
      )
    } else {
      return (
        <h1>Rubble to Renewal</h1>
      )
    }
  }

  const getAccountIcon = () => {
    if (loggedIn()) {
      return (
        <div>
          <img src={accountCircle} alt="Account Icon" className='account-icon' onClick={handleAccountClick} />
          <label className='account-name'>{user.userName}</label>
          <md-outlined-button 
          onClick={handleLeaderboardClick} 
          label="Leaderboard"
          style={{ position: 'absolute', top: '20px', left: '200px' }}
        >
          Leaderboard
        </md-outlined-button>
        </div>
      )
    } else {
      return null;
    }
  }


  return (
    <div className='heading-container'>
      {getAccountIcon()}
      {getHeading()}
      

      <div className='logo-container'>
        <img src={clientLogo} alt="Logo" className='logo' />
        <img src={UNSWLogo} alt="UNSW Logo" className='logo' />
      </div>

      <div>
        <SessionContext.Provider value={{user, setSessionJwt}}>
          {children}
        </SessionContext.Provider>
      </div>
    </div>
  );
};

export default Layout;
