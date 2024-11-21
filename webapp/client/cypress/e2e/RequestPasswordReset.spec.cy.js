describe('Request Password Reset Page Tests', () => {
    beforeEach(() => {
      // Visit the Request Password Reset page
      cy.visit('/login/request-password-reset');
    });
  
    it('should render the heading, subheading, and email input', () => {
      cy.contains('Rubble to Renewal').should('exist');
      cy.contains('Reset your password').should('exist');
      cy.get('md-outlined-text-field[label="Email"]').should('exist');
      cy.get('md-filled-button[type="submit"]').should('exist');
    });
  
    it('should display an alert if the email field is empty on submission', () => {
        // Don't type anything in the email field
      
        // Submit the form without typing in the email field
        cy.get('md-filled-button[type="submit"]').click();
      
        // Assert that an alert is shown
        cy.on('window:alert', (text) => {
          expect(text).to.contains('Enter a valid email.');
        });
      });      
  
      it('should submit the form successfully with a valid email', () => {
        // Intercept the API request to simulate a successful backend response
        cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/request-password-reset`, {
          statusCode: 200,
          body: { message: 'Password reset email sent successfully' },
        }).as('requestPasswordReset');
      
        // Fill in the form with a valid email
        cy.get('md-outlined-text-field[label="Email"]')
          .shadow()
          .find('input')
          .type('test@example.com');
      
        // Submit the form
        cy.get('md-filled-button[type="submit"]').click();
      
        // Wait for the backend response
        cy.wait('@requestPasswordReset');
      
        // Check that the confirmation message is displayed
        cy.contains('Please check your email').should('exist');
      });
      
  });
  