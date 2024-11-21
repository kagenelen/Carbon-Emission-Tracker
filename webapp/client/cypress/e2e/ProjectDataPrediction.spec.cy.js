describe('Project Data Prediction Page Tests', () => {beforeEach(() => {
    // Load the token from the fixture
    cy.fixture('authToken').then((auth) => {
      // Simulate localStorage of session
      localStorage.setItem('jwtToken', auth.jwtToken);
    });

    // Fill out the form on project details to be redirected to project data prediction
    cy.visit('/new-project-details');

    // Fill in the required fields and click submit
    cy.get('md-outlined-text-field[label="Project Name*"]').shadow().find('input').type('Project1');
    cy.get('md-outlined-text-field[label="Project Number*"]').shadow().find('input').type('1');

    cy.get('md-filled-button[label="Next"]').click();

    // Click on the "Forecast" button in the dialog box to prediction page
    cy.get('md-filled-button').contains('Forecast').click();
    cy.url().should('include', '/new-project-forecast');
  
  });

  it('should render all components', () => {
    // Check if form fields are rendered
    cy.get('#usage').should('exist'); // Building Usage dropdown
    cy.get('#gfa').should('exist'); // Gross Floor Area input
    cy.get('#volume').should('exist'); // Building Volume input
    cy.get('#floors').should('exist'); // Floor Amount input
    cy.get('#own-data').should('exist'); // Radio group for useMyData
    cy.get('md-filled-button[type="submit"]').should('exist'); // Forecast waste button
  });

  it('should show an alert if required fields are missing', () => {
    // Leave the required fields empty and submit the form
    cy.get('md-filled-button[type="submit"]').click();

    // Assert that an alert pops up
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Usage, gross floor area and floor are required fields');
    });
  });

  it('should submit the form and redirect to project page when all fields are filled', () => {
    // Fill out fields
    cy.get('#usage').click().get('li[data-value="education"]').click(); // Select 'Education' for usage
    cy.get('#gfa').type('100'); // Input for Gross Floor Area
    cy.get('#volume').type('3000'); // Input for Building Volume
    cy.get('#floors').type('2'); // Input for Floor Amount
    cy.get('[type="radio"]').first().check(); // Check radio for historical data

    // Simulate API call and response
    cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/predict-waste`, {
      statusCode: 200,
      body: {},
    }).as('predictWaste');

    // Click submit
    cy.get('md-filled-button[type="submit"]').click();

    // Wait for the API call 
    cy.wait('@predictWaste');
    cy.url().should('include', '/edit-project-data');
  });

});