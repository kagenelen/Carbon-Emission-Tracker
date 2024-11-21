/**
* @file Component serving the user registration page.
* Allows new users to create an account by entering company details, email, and password, with confirmation.
* Validates required fields and matching passwords before submission. 
* Upon successful registration, stores a JWT in local storage and navigates the user to the projects page.
* Includes a link to the login page for existing users.
* 
* @component <UserCreationForm/>
*/

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import { SessionContext } from './Layout.jsx';

const UserCreationForm = () => {
  // Declare state variables for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const session = useContext(SessionContext);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all fields are filled
    if (!name || !email || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    // Ensure passwords match before sending to the backend
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result);
        session.setSessionJwt(result.jwtToken);
        localStorage.setItem('jwtToken', result.jwtToken);
        navigate('/projects');
      } else {
        console.error(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className='page-container'>
      <h2 className='sub-heading'>New User Creation</h2>

      <form onSubmit={handleSubmit}>
        {/* Company Name or ABN */}
        <md-outlined-text-field 
          label="Company Name or ABN" 
          value={name} 
          onInput={(e) => setName(e.target.value)} 
        ></md-outlined-text-field>

        {/* Email */}
        <md-outlined-text-field 
          label="Email" 
          type="email" 
          value={email} 
          onInput={(e) => setEmail(e.target.value)} 
        ></md-outlined-text-field>

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

      <a href="/login" className='hyperlink-padded'>Already an Existing user? Click here to login</a>
    </div>
  );
};

export default UserCreationForm;
