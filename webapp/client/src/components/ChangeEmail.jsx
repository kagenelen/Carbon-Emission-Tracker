/**
* @file Component serving /change-email
* Form to enter a new password.
* Navigates back to /profile on form submission.
* Can be accessed as an admin passing in userId as a parameter
* @component <ChangeEmail/>
*/

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import accountCircle from '../assets/account_circle.png'
import { SessionContext } from './Layout.jsx';
import ProfileHeader from './ProfileHeader';

const ChangeEmail = () => {
  const [newEmail, setNewEmail] = useState('');
  const { userId } = useParams();
  const asAdmin = userId ? 1: 0;
  const state = useLocation();
  const name = state?.state?.name || "";
  const [ username, setUsername ] = useState(name);
  const navigate = useNavigate();
  const session = useContext(SessionContext);
  const token = localStorage.getItem('jwtToken');

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

  const handleGoBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //ensure emails are valid 
    if (!newEmail) {
      alert('All fields are required');
      return;
    }
    //TODO check emails are in valid email form 
 
    try {
      //send emails to backend for those checks 
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/change-email/confirm_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        navigate('/profile');
      } else {
        console.error(result.message);
      }

    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="page-container">
        {/* <img src={accountCircle} alt="UNSW Logo" style={styles.logo} /> */}
      <ProfileHeader imageSrc={accountCircle} userName={username || "Not logged in"} />
      {/* <ProfileHeader imageSrc={accountCircle} userName={session.user.userName} /> */}
        {/* <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <>{username || "Not logged in"}</>
    </div> */}

        <form onSubmit={handleSubmit}>
          {/* New Email */}
          <md-outlined-text-field 
            label="New Email" 
            value={newEmail}
            onInput={(e) => setNewEmail(e.target.value)} 
          ></md-outlined-text-field>

          {/* Submit Button */}
          <md-filled-button label="Submit" type="submit">Submit</md-filled-button>
        </form>

        {/* Go Back Button */}
        <md-outlined-button onClick={handleGoBack} style={{ marginTop: '10px' }}>Go Back</md-outlined-button>

        </div>
  )
};

export default ChangeEmail;
