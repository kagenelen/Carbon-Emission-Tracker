describe('User Login Form Tests', () => {
    beforeEach(() => {
      // Visit the User Login Form page
      cy.visit('/login');
    });
  
    it('should render the login form with all necessary fields', () => {
      // Check if the heading and subheading are rendered
      cy.contains('Rubble to Renewal').should('exist');
      cy.contains('Existing User Login').should('exist');
  
      // Check if the form fields and submit button are rendered
      cy.get('md-outlined-text-field[label="Company Name or ABN"]').should('exist');
      cy.get('md-outlined-text-field[label="Password"]').should('exist');
      cy.get('md-filled-button[type="submit"]').contains('Submit').should('exist');
    });
  
    it('should display an alert if required fields are empty on submission', () => {
      // Submit the form without filling in any fields
      cy.get('md-filled-button[type="submit"]').click();
  
      // Assert that an alert is shown
      cy.on('window:alert', (text) => {
        expect(text).to.contains('All fields are required');
      });
    });
  
    it('should submit the form successfully with valid data and navigate to the profile page', () => {
        // Intercept the API request to simulate a successful backend response
        cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/user/login`, {
          statusCode: 200,
          body: { message: 'Login successful' },
        }).as('loginUser');  // Place intercept before the form submission
      
        // Fill in the form with valid data
        cy.get('md-outlined-text-field[label="Company Name or ABN"]')
          .shadow()
          .find('input')
          .type('testcompany');
      
        cy.get('md-outlined-text-field[label="Password"]')
          .shadow()
          .find('input')
          .type('password123');
      
        // Submit the form
        cy.get('md-filled-button[type="submit"]').click();
      
        // Wait for the backend response
        cy.wait('@loginUser');  // Cypress waits for the intercepted request
      
        // Assert that the form redirects to the Project List page
        cy.url().should('include', '/projects');
      });
  
      it('should display an alert if the login fails', () => {
        // Intercept the API request to simulate a failed login response
        cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/user/login`, {
          statusCode: 401,
          body: { message: 'Invalid credentials' }, // Ensure the backend returns the correct message
        }).as('loginUser');
      
        // Fill in the form with invalid data
        cy.get('md-outlined-text-field[label="Company Name or ABN"]')
          .shadow()
          .find('input')
          .type('wrongcompany');
      
        cy.get('md-outlined-text-field[label="Password"]')
          .shadow()
          .find('input')
          .type('wrongpassword');
      
        // Submit the form
        cy.get('md-filled-button[type="submit"]').click();
      
        // Wait for the backend response
        cy.wait('@loginUser');
      
        // Assert that an alert is shown for invalid credentials
        cy.on('window:alert', (text) => {
          expect(text).to.contains('Invalid credentials'); // Ensure this matches the correct error message
        });
      });      
  
    it('should navigate to the password reset page when clicking "Forgot password?"', () => {
      // Click the "Forgot password?" link
      cy.contains('Forgot password?').click();
  
      // Assert that the URL has changed to the password reset page
      cy.url().should('include', '/login/request-password-reset');
    });
  
    it('should navigate to the sign-up page when clicking "Not an Existing user? Click here to sign up"', () => {
      // Click the sign-up link
      cy.contains('Not an Existing user? Click here to sign up').click();
  
      // Assert that the URL has changed to the sign-up page
      cy.url().should('include', '/register');
    });
  });
  