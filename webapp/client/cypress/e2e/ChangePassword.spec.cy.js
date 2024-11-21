describe('Change Password Page Tests', () => {
    beforeEach(() => {
      // Load the token from the fixture
      cy.fixture('authToken').then((auth) => {
        // Simulate localStorage of session
        localStorage.setItem('jwtToken', auth.jwtToken);
      });
      
      // Visit the Change Password page
      cy.visit('/change-password');
    });
  
    it('should display the stored account name from localStorage', () => {
      // Check if the stored account name is displayed
      cy.contains('cypress user').should('exist');
    });
  
    it('should render the password fields and submit button', () => {
      // Check if the password fields and submit button are rendered
      cy.get('md-outlined-text-field[label="Current Password"]').should('exist');
      cy.get('md-outlined-text-field[label="New Password"]').should('exist');
      cy.get('md-outlined-text-field[label="Confirm New Password"]').should('exist');
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
  
    it('should display an alert if the new passwords do not match', () => {
      // Fill in the form with mismatching passwords
      cy.get('md-outlined-text-field[label="Current Password"]')
        .shadow()
        .find('input')
        .type('currentPassword123');
      
      cy.get('md-outlined-text-field[label="New Password"]')
        .shadow()
        .find('input')
        .type('newPassword123');
      
      cy.get('md-outlined-text-field[label="Confirm New Password"]')
        .shadow()
        .find('input')
        .type('differentPassword123');
  
      // Submit the form
      cy.get('md-filled-button[type="submit"]').click();
  
      // Assert that an alert is shown
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Passwords do not match!');
      });
    });
  
    it('should submit the form successfully with matching passwords and navigate to the Profile page', () => {
      // Intercept the API request to simulate a successful backend response
      cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/change-password/confirm_password`, {
        statusCode: 200,
        body: { message: 'Password changed successfully' },
      }).as('changePassword');
  
      // Fill in the form with valid passwords
      cy.get('md-outlined-text-field[label="Current Password"]')
        .shadow()
        .find('input')
        .type('currentPassword123');
      
      cy.get('md-outlined-text-field[label="New Password"]')
        .shadow()
        .find('input')
        .type('newPassword123');
      
      cy.get('md-outlined-text-field[label="Confirm New Password"]')
        .shadow()
        .find('input')
        .type('newPassword123');
  
      // Submit the form
      cy.get('md-filled-button[type="submit"]').click();
  
      // Wait for the backend response
      cy.wait('@changePassword');
  
      // Assert that the form redirects to the Profile page
      cy.url().should('include', '/profile');
    });
  });
  