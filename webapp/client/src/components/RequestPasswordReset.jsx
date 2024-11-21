/**
* @file Component serving /login/request-password-reset
* Allows user to enter account email to send a password reset email.
* @component <RequestPasswordReset/>
*/

import React, { useState } from 'react';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';

const RequestPasswordReset = () => {
  // Declare state variables for form fields
  const [email, setEmail] = useState('');
  const [sentResponse, setSentResponse] = useState({});
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all fields are filled
    if (!email) {
      alert('Enter a valid email.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      setSentResponse(result);

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

  let emailForm;
  if (sentResponse && sentResponse.message && sentResponse.message.includes("success") ) {
    emailForm = (
      <form>
        <p>Please check your email for a link to reset your password. <br/><br/>
          Check your spam folder if it does not appear within a few minutes.</p>
      </form>
    );
  } else {
    emailForm = (
      <form onSubmit={handleSubmit}>
          {/* Email */}
          <p>Enter your account's email to receive password reset link</p>
          <md-outlined-text-field
            label="Email" 
            type="email" 
            value={email} 
            onInput={(e) => setEmail(e.target.value)} 
          ></md-outlined-text-field>

          {/* Submit Button */}
          <md-filled-button 
            label="Submit" 
            type="submit"
            style={{ width: '300px' }}
          >Send password reset email</md-filled-button>
      </form>
    );
  }

  return (
    <div className='page-container'>
      <h2 className='sub-heading'>Reset your password</h2>

      {emailForm}

      <a className='hyperlink-padded' href="/login">Return to login</a>

    </div>
  );
};

export default RequestPasswordReset;
