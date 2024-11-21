/**
* @file Component serving the user login page.
* Allows users to log in by entering a company name (or ABN) and password.
* Validates required fields before submission and, upon successful login, stores a JWT in local storage and navigates to the projects page.
* Includes links for password reset and user registration.
* Navigates to /projects if user is not admin, /users if they are admin
* 
* @component <UserLoginForm/>
*/

import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import { SessionContext } from './Layout.jsx';

const UserLoginForm = () => {
  // Declare state variables for form fields
  const navigate = useNavigate();
  const session = useContext(SessionContext);
  const nameRef = useRef();
  const passwordRef = useRef();


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const password = passwordRef.current.value;

    // Ensure all fields are filled
    if (!name || !password) {
      alert('All fields are required');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const result = await response.json();

      if (response.ok) {
        session.setSessionJwt(result.jwtToken);
        localStorage.setItem('jwtToken', result.jwtToken);
        // If admin, nav to admin page showing all users
        if (result.permission) {
          navigate('/users');
        } else {
          navigate('/projects');
        }
      } else {
        console.error(result.message);
        alert(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
      
  };

  return (
    <div className='page-container'>
      <h2 className='sub-heading'>Existing User Login</h2>

      <form onSubmit={handleSubmit}>
        {/* Company Name or ABN */}
        <md-outlined-text-field 
          label="Company Name or ABN" 
          ref={nameRef}
        ></md-outlined-text-field>

        {/* Password */}
        <md-outlined-text-field 
          label="Password" 
          type="password" 
          ref={passwordRef}
        ></md-outlined-text-field>

        <a href="/login/request-password-reset" className='hyperlink'>Forgot password?</a>

        {/* Submit Button */}
        <md-filled-button label="Submit" type="submit">Submit</md-filled-button>
      </form>

      <a href="/register" className='hyperlink-padded'>Not an Existing user? Click here to sign up</a>
    </div>
    
  );
};

export default UserLoginForm;
