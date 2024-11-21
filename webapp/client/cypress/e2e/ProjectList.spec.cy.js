describe('Project List Page', () => {
  beforeEach(() => {
    // Load the token from the fixture
    cy.fixture('authToken').then((auth) => {
      // Simulate localStorage of session
      localStorage.setItem('jwtToken', auth.jwtToken);
    });

    // Visit the Project List page
    cy.visit('/projects');
  });

  it('should display "No projects available" if the server fails to retrieve projects', () => {
    cy.fixture('serverError').then((serverError) => {
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-all-projects`, {
        statusCode: 500,
        body: serverError,
      }).as('serverError');
    });
  
    cy.reload();
    cy.wait('@serverError');
    cy.contains('No projects available').should('be.visible');
  });

  it('should handle projects with missing fields gracefully', () => {
    cy.fixture('missingFieldsProjects').then((missingFieldsProjects) => {
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-all-projects`, {
        statusCode: 200,
        body: missingFieldsProjects,
      }).as('getProjectsWithMissingFields');
    });
  
    cy.reload();
    cy.wait('@getProjectsWithMissingFields');
    cy.get('.project-table').within(() => {
      cy.contains('Project 2').should('be.visible');
      cy.contains('2023-01-01').should('be.visible');
    });
  });

  it('should display "No projects available" when there are no projects', () => {
    cy.fixture('emptyProjects').then((emptyProjects) => {
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-all-projects`, {
        statusCode: 200,
        body: emptyProjects,
      }).as('getEmptyProjects');
    });

    cy.reload();
    cy.wait('@getEmptyProjects');
    cy.contains('No projects available').should('be.visible');
  });

  it('should fetch and display a list of projects', () => {
    cy.fixture('projects').then((projects) => {
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-all-projects`, {
        statusCode: 200,
        body: projects,
      }).as('getProjects');
    });

    cy.reload();
    cy.wait('@getProjects');
    cy.contains('Manage Projects').should('be.visible');
    cy.get('.project-table').within(() => {
      cy.contains('Project 1').should('be.visible');
      cy.contains('2023-01-01').should('be.visible');
      cy.contains('Project 2').should('be.visible');
      cy.contains('2023-01-02').should('be.visible');
    });
  });

  it('should navigate to project details page when a project row is clicked', () => {
    cy.fixture('projects').then((projects) => {
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-all-projects`, {
        statusCode: 200,
        body: projects,
      }).as('getProjects');
    });

    cy.reload();
    cy.wait('@getProjects');
    cy.get('.project-row').first().click();
    cy.url().should('include', '/project/1');
  });

  it('should navigate to the "New Project" page when the "New Project" button is clicked', () => {
    cy.contains('New Project').click();
    cy.url().should('include', '/new-project-details');
  });
});
