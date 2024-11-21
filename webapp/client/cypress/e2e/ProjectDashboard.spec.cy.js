import * as ExportModule from '../../src/components/exportToExcel';

describe('Project Dashboard Page', () => {
    beforeEach(() => {
      // Load the token and set it in localStorage
      cy.fixture('authToken').then((auth) => {
        localStorage.setItem('jwtToken', auth.jwtToken);
      });
  
      // Mock the API response for project details specific to the dashboard using the fixture
      cy.fixture('projectDetails').then((data) => {
        cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-project-details/${data.projectId}`, {
          statusCode: 200,
          body: {
            message: "Project data retrieved.",
            projectDetails: data.projectDetails,
            recyclingData: data.recyclingData
          }
        }).as('retrieveDashboardDetails');
  
        cy.visit(`/project/${data.projectId}`);
      });
    });
  
    it('should display project details correctly', () => {
      // Wait for the project details API call to complete before assertions
      cy.wait('@retrieveDashboardDetails');
  
      cy.contains('Project No. 101').should('be.visible');
      cy.contains('Dashboard Project Test').should('be.visible');
    });

    it('should navigate to the edit project page when "Edit Project" is clicked', () => {
        // Click on "Edit Project" button
        cy.contains('Edit Project').click();
      
        // Verify that the URL changes to the edit project page
        cy.url().should('include', '/edit-project-details');
      });
  });
  