describe('Profile Page Tests', () => {
    beforeEach(() => {
      // Load the token from the fixture
      cy.fixture('authToken').then((auth) => {
        // Simulate localStorage of session
        localStorage.setItem('jwtToken', auth.jwtToken);
      });
      // Visit the Profile page
      cy.visit('/profile');
    });
  
    it('should display the stored account name from localStorage', () => {
      // Check if the stored account name is displayed
      cy.contains('cypress user').should('exist');
    });
  
    it('should render the heading and account image', () => {
      // Check if the heading is rendered
      cy.contains('Rubble to Renewal').should('exist');
  
      // Check if the account image is displayed
      cy.get('img[src*="account_circle.png"]').should('be.visible');
    });
  
    it('should navigate to Change Password when clicking the "Change Password" button', () => {
      // Click the "Change Password" button
      cy.get('md-filled-button').contains('Change Password').click();
  
      // Assert that the URL has changed to '/change-password'
      cy.url().should('include', '/change-password');
    });
  
    it('should navigate to Change Email when clicking the "Change Email" button', () => {
      // Click the "Change Email" button
      cy.get('md-filled-button').contains('Change Email').click();
  
      // Assert that the URL has changed to '/change-email'
      cy.url().should('include', '/change-email');
    });
  
    it('should navigate to Login when clicking the "Logout" button', () => {
      // Click the "Logout" button
      cy.get('md-filled-button').contains('Logout').click();
  
      // Assert that the URL has changed to '/login'
      cy.url().should('include', '/login');
    });

    it('should not display account number when logged out', () => {
      // Check that user name is the logged out version
      cy.contains('Not logged in').should('exist');
    });
    
    it('should redirect to login if /profile is accessed after logout', () => {
      // Click the "Logout" button
      cy.get('md-filled-button').contains('Logout').click();
  
      // Assert that the URL has changed to '/login'
      cy.url().should('include', '/login');

      // Visit the Profile page
      cy.visit('/profile');
  
      // Assert that the URL has changed to '/login'
      cy.url().should('include', '/login');
    });
  });
  