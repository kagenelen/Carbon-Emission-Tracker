/**
* @file Component serving /change-password
* Form to change password.
* Requires old password and two matching entries of the new password.
* Navigates to /profile after submission.
* @component <ChangePassword/>
*/

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import accountCircle from '../assets/account_circle.png'
import { SessionContext } from './Layout.jsx';
import ProfileHeader from './ProfileHeader';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const session = useContext(SessionContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  const handleGoBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //ensure passwords are valid 
    if (!password || !newPassword || !newPasswordConfirm) {
      alert('All fields are required');
      return;
    }
    // Ensure passwords are the same
    if (newPassword !== newPasswordConfirm) {
      alert('Passwords do not match!');
      return;
    }
 
    try {
      //send passwords to backend for backend checks 
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/change-password/confirm_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password, newPassword }),
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
    <div className='page-container'>
      <ProfileHeader imageSrc={accountCircle} userName={session.user.userName} />
      <div>
        <form onSubmit={handleSubmit}>
          {/* Current password */}
          <md-outlined-text-field 
            label="Current Password" 
            type="password" 
            value={password}
            onInput={(e) => setPassword(e.target.value)} 
          ></md-outlined-text-field>

          {/* New password */}
          <md-outlined-text-field 
            label="New Password" 
            type="password" 
            value={newPassword}
            onInput={(e) => setNewPassword(e.target.value)} 
          ></md-outlined-text-field>

          {/* Confirm new password */}
          <md-outlined-text-field 
            label="Confirm New Password" 
            type="password" 
            value={newPasswordConfirm}
            onInput={(e) => setNewPasswordConfirm(e.target.value)} 
          ></md-outlined-text-field>

          {/* Submit Button */}
          <md-filled-button label="Submit" type="submit">Submit</md-filled-button>
        </form>

        {/* Go Back Button */}
        <md-outlined-button onClick={handleGoBack} style={{ marginTop: '10px' }}>Go Back</md-outlined-button>
      </div>
    </div>
  )
};

export default ChangePassword;
