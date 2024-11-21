import dayjs from 'dayjs';

describe('Create Project Details Form Tests', () => {
    beforeEach(() => {
      // Load the token from the fixture
      cy.fixture('authToken').then((auth) => {
        // Simulate localStorage of session
        localStorage.setItem('jwtToken', auth.jwtToken);
      });
  
      // Visit the Create Project page
      cy.visit('/new-project-details');
    });
  
    it('should render the form fields and submit button', () => {
      // Check if required form fields and submit button are rendered
      cy.get('md-outlined-text-field[label="Project Name*"]').should('exist');
      cy.get('md-outlined-text-field[label="Project Number*"]').should('exist');
      cy.get('md-outlined-text-field[label="Client"]').should('exist');
      cy.get('md-outlined-text-field[label="Revision Number"]').should('exist');
      cy.get('md-filled-button[type="submit"]').contains('Next').should('exist');
    });
  
    it('should display an alert if any required field is empty on submission', () => {
      // Submit the form without filling in required fields
      cy.get('md-filled-button[type="submit"]').click();
  
      // Assert that an alert is shown
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Please enter all required fields');
      });
    });
  
    it('should display an alert if the date is invalid on submission', () => {
      // Fill in other fields but set an invalid date
      cy.get('md-outlined-text-field[label="Project Name*"]')
        .shadow()
        .find('input')
        .type('New Project');
      cy.get('md-outlined-text-field[label="Project Number*"]')
        .shadow()
        .find('input')
        .type('123456');
      cy.get('.MuiInputBase-input')
        .clear({ force: true })
        .type(dayjs().format('invalid-date'), { force: true });
  
      // Submit the form
      cy.get('md-filled-button[type="submit"]').click({ force: true });
  
      // Assert that an alert is shown
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Please enter a valid date');
      });
    });
  
    it('should submit the form successfully', () => {
      // Intercept the API request to simulate a successful backend response
      cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/create-project`, {
        statusCode: 200,
        body: { projectId: '12345' },
      }).as('createProject');
  
      // Fill in the form with valid data
      cy.get('md-outlined-text-field[label="Project Name*"]')
        .shadow()
        .find('input')
        .type('New Project');
      cy.get('md-outlined-text-field[label="Project Number*"]')
        .shadow()
        .find('input')
        .type('123456');
    cy.get('.MuiInputBase-input')
        .clear({ force: true })
        .type(dayjs().format('DD/MM/YYYY'), { force: true });
  
      // Optional fields
      cy.get('md-outlined-text-field[label="Client"]').shadow().find('input').type('Client Name', { force: true });
      cy.get('md-outlined-text-field[label="Revision Number"]').shadow().find('input').type('001', { force: true });
  
      // Submit the form
      cy.get('md-filled-button[type="submit"]').click({ force: true });
      cy.get('md-filled-button').contains('Manual').click();
  
      // Wait for the backend response
      cy.wait('@createProject');
  
      // Assert that the form redirects to the Edit Project Data page
      cy.url().should('include', '/edit-project-data');
    });
  });
  