describe('Change Email Page Tests', () => {
    beforeEach(() => {
      // Load the token from the fixture
      cy.fixture('authToken').then((auth) => {
        // Simulate localStorage of session
        localStorage.setItem('jwtToken', auth.jwtToken);
      });
      
      // Visit the Change Email page
      cy.visit('/change-email');
    });
  
    it('should display the stored account name from localStorage', () => {
      // Check if the stored account name is displayed
      cy.contains('cypress user').should('exist');
    });
  
    it('should render the email fields and submit button', () => {
      // Check if the email fields and submit button are rendered
      cy.get('md-outlined-text-field[label="New Email"]').should('exist');
      cy.get('md-filled-button[type="submit"]').should('exist');
    });
  
    it('should display an alert if any field is empty on submission', () => {
      // Submit the form without filling in any fields
      cy.get('md-filled-button[type="submit"]').click();
  
      // Assert that an alert is shown
      cy.on('window:alert', (text) => {
        expect(text).to.contains('All fields are required');
      });
    });
  
    it('should submit the form successfully', () => {
      // Intercept the API request to simulate a successful backend response
      cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/change-email/confirm_email`, {
        statusCode: 200,
        body: { message: 'Email changed successfully' },
      }).as('changeEmail');
  
      // Fill in the form with valid emails
      cy.get('md-outlined-text-field[label="New Email"]')
        .shadow()
        .find('input')
        .type('newemail@example.com');
  
      // Submit the form
      cy.get('md-filled-button[type="submit"]').click();
  
      // Wait for the backend response
      cy.wait('@changeEmail');
  
      // Assert that the form redirects to the Profile page
      cy.url().should('include', '/profile');
    });
  });
  