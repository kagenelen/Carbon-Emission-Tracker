describe('User Creation Form', () => {
  beforeEach(() => {
    // Visit the page containing the UserCreationForm component
    cy.visit('/register');
  });

  it('should render the form correctly', () => {
    // Check for the presence of the form fields and submit button
    cy.get('md-outlined-text-field[label="Company Name or ABN"]').should('exist');
    cy.get('md-outlined-text-field[label="Email"]').should('exist');
    cy.get('md-outlined-text-field[label="Password"]').should('exist');
    cy.get('md-outlined-text-field[label="Confirm Password"]').should('exist');
    cy.get('md-filled-button').should('contain', 'Submit');
  });

  it('should display an alert if required fields are empty', () => {
    // Try to submit the form without filling in any fields
    cy.get('md-filled-button[type="submit"]').click();

    // Assert that the alert is displayed
    cy.on('window:alert', (text) => {
      expect(text).to.contains('All fields are required');
    });
  });

  it('should show an error if passwords do not match', () => {
    // Load the invalid user fixture data
    cy.fixture('userCreationData').then((data) => {
      const user = data.invalidUser;

      // Fill in the form using fixture data
      cy.get('md-outlined-text-field[label="Company Name or ABN"]')
        .shadow()
        .find('input')
        .type(user.companyName);

      cy.get('md-outlined-text-field[label="Email"]')
        .shadow()
        .find('input')
        .type(user.email);

      cy.get('md-outlined-text-field[label="Password"]')
        .shadow()
        .find('input')
        .type(user.password);

      cy.get('md-outlined-text-field[label="Confirm Password"]')
        .shadow()
        .find('input')
        .type(user.confirmPassword);

      // Click the submit button
      cy.get('md-filled-button')
        .shadow()
        .find('button')
        .click();

      // Assert that the alert shows passwords do not match
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Passwords do not match!');
      });
    });
  });

  it('should submit the form successfully with correct data', () => {
    // Load the valid user fixture data
    cy.fixture('userCreationData').then((data) => {
      const user = data.validUser;

      // Fill in the form using fixture data
      cy.get('md-outlined-text-field[label="Company Name or ABN"]')
        .shadow()
        .find('input')
        .type(user.companyName);

      cy.get('md-outlined-text-field[label="Email"]')
        .shadow()
        .find('input')
        .type(user.email);

      cy.get('md-outlined-text-field[label="Password"]')
        .shadow()
        .find('input')
        .type(user.password);

      cy.get('md-outlined-text-field[label="Confirm Password"]')
        .shadow()
        .find('input')
        .type(user.confirmPassword);

      // Click the submit button
      cy.get('md-filled-button')
        .shadow()
        .find('button')
        .click();

      // Assert that the form redirects to the profile page
      cy.url().should('include', '/projects');
    });
  });
});
