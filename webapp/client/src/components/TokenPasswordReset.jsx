/**
* @file Component serving the password reset page for a specific user.
* Allows users to reset their password by entering and confirming a new password.
* Validates password match and required fields before sending the new password to the backend.
* Redirects users to the login page upon successful password reset.
* Extracts user ID and token from the URL path.
* 
* @component <TokenPasswordReset/>
*/

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';

const TokenPasswordReset = () => {
  // Declare state variables for form fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  let response = {}
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all fields are filled
    if (!password || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    // Ensure passwords match before sending to the backend
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Extract userId and token from URL
    let url_part = location.pathname.split("/");

    try {
      response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/${url_part[1]}/${url_part[2]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      console.log("response for password reset obtained")
      const result = await response.json();
      console.log(result);

      if (response.ok) {
        console.log(result);
        navigate('/login');
      } else {
        alert('Invalid or expired token.');
        console.error(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className='page-container'>
      <h2 className='sub-heading'>Reset your password</h2>

      <form onSubmit={handleSubmit}>
        {/* Password */}
        <md-outlined-text-field 
          label="Password" 
          type="password" 
          value={password} 
          onInput={(e) => setPassword(e.target.value)} 
        ></md-outlined-text-field>

        {/* Confirm Password */}
        <md-outlined-text-field 
          label="Confirm Password" 
          type="password" 
          value={confirmPassword} 
          onInput={(e) => setConfirmPassword(e.target.value)} 
        ></md-outlined-text-field>

        {/* Submit Button */}
        <md-filled-button label="Submit" type="submit">Submit</md-filled-button>
      </form>

    </div>
  );
};

export default TokenPasswordReset;
