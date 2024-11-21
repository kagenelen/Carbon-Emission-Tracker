import dayjs from 'dayjs';

describe('Edit Project Data Form Tests', () => {
  beforeEach(() => {
    // Load the auth token and project data fixtures
    cy.fixture('authToken').then((auth) => {
      localStorage.setItem('jwtToken', auth.jwtToken);
    });

    cy.fixture('editProjectData').then((data) => {
      // Intercept the API call to load project details
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-project-details/${data.projectId}`, {
        statusCode: 200,
        body: { projectDetails: data.oldProjectDetails },
      }).as('getProjectDetails');

      // Visit the Project Dashboard page and wait for the API response
      cy.visit(`/project/${data.projectId}`);
      cy.wait('@getProjectDetails');
    });

    // Click on the "Edit Project" button in the drawer
    cy.contains('Edit Project').click();

    // Verify that we are on the Edit Project Details page
    cy.url().should('include', '/edit-project-details');

    // Fill in the required fields in the Edit Project Details form
    cy.fixture('editProjectData').then((data) => {
      const newProjectDetails = data.newProjectDetails;

      cy.get('md-outlined-text-field[label="Project Name*"]')
        .shadow()
        .find('input')
        .clear()
        .type(newProjectDetails.projectName);

      cy.get('.MuiInputBase-input')
        .clear({ force: true })
        .type(dayjs().format('DD/MM/YYYY'), { force: true });
      
      cy.get('md-outlined-text-field[label="Client"]')
        .shadow()
        .find('input')
        .clear({ force: true })
        .type(newProjectDetails.client, { force: true });

      cy.get('md-outlined-text-field[label="Revision Number"]')
        .shadow()
        .find('input')
        .clear({force: true})
        .type(newProjectDetails.revisionNumber, {force: true});
    });

    // Submit the form
    cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/edit-project-details`, {
      statusCode: 200,
      body: { message: 'Project details updated successfully' },
    }).as('submitEditDetails');

    cy.get('md-filled-button[type="submit"]').click({force: true});

    // Confirm navigation to the next page (e.g., `edit-project-data`)
    cy.url().should('include', '/edit-project-data');
    cy.wait('@submitEditDetails');
  });

  // it('should display initial project data values in the form', () => {
  //   cy.fixture('editProjectData').then((data) => {
  //     // Check that each material's initial values are displayed correctly
  //     Object.entries(data.oldProject.recyclingData).forEach(([material, values]) => {
  //       cy.get(`md-outlined-text-field[id="${material.replace(/\s+/g, '')}-tonnage"]`)
  //         .shadow()
  //         .find('input')
  //         .should('have.value', values.tonnage.toString());
  //       cy.get(`md-outlined-text-field[id="${material.replace(/\s+/g, '')}-recycled"]`)
  //         .shadow()
  //         .find('input')
  //         .should('have.value', values.recycled.toString());
  //       cy.get(`md-outlined-text-field[id="${material.replace(/\s+/g, '')}-truck"]`)
  //         .shadow()
  //         .find('input')
  //         .should('have.value', values.truck.toString());
  //     });
  //   });
  // });

  it('should allow updating project data values and submit the form successfully', () => {
    cy.fixture('editProjectData').then((data) => {
      // Update the form with new values for each material
      Object.entries(data.newProject.recyclingData).forEach(([material, values]) => {
        cy.get(`md-outlined-text-field[id="${material.replace(/\s+/g, '')}-tonnage"]`)
          .shadow()
          .find('input')
          .clear()
          .type(values.tonnage.toString());
        cy.get(`md-outlined-text-field[id="${material.replace(/\s+/g, '')}-recycled"]`)
          .shadow()
          .find('input')
          .clear()
          .type(values.recycled.toString());
        cy.get(`md-outlined-text-field[id="${material.replace(/\s+/g, '')}-truck"]`)
          .shadow()
          .find('input')
          .clear()
          .type(values.truck.toString());
      });

      // Intercept the POST request to simulate form submission
      cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/edit-project-data`, {
        statusCode: 200,
        body: { message: 'Project data updated successfully' },
      }).as('submitProjectData');

      // Submit the form
      cy.get('md-filled-button[type="submit"]').click();
      cy.wait('@submitProjectData');

      // Verify redirection to the project data view page
      cy.url().should('include', `/project/${data.projectId}`);
    });
  });

  it('should display validation alert for invalid tonnage values', () => {
    cy.fixture('editProjectData').then((data) => {
      // Set an invalid tonnage value
      cy.get(`md-outlined-text-field[id="Concrete-tonnage"]`)
        .shadow()
        .find('input')
        .clear()
        .type('-1');

      // Submit the form
      cy.get('md-filled-button[type="submit"]').click();

      // Assert the validation alert
      cy.on('window:alert', (text) => {
        expect(text).to.contains(data.invalidTonnageAlert);
      });
    });
  });

  it('should display validation alert for recycled percentage out of range', () => {
    cy.fixture('editProjectData').then((data) => {
      // Set an invalid recycled percentage (greater than 100)
      cy.get(`md-outlined-text-field[id="Concrete-recycled"]`)
        .shadow()
        .find('input')
        .clear()
        .type('150');

      // Submit the form
      cy.get('md-filled-button[type="submit"]').click();

      // Assert the validation alert
      cy.on('window:alert', (text) => {
        expect(text).to.contains(data.invalidRecycledAlert);
      });
    });
  });

  it('should display validation alert for invalid truck numbers', () => {
    cy.fixture('editProjectData').then((data) => {
      // Set an invalid truck number
      cy.get(`md-outlined-text-field[id="Concrete-truck"]`)
        .shadow()
        .find('input')
        .clear()
        .type('-5');

      // Submit the form
      cy.get('md-filled-button[type="submit"]').click();

      // Assert the validation alert
      cy.on('window:alert', (text) => {
        expect(text).to.contains(data.invalidTruckAlert);
      });
    });
  });

  // it('should allow adding and interacting with custom materials', () => {
  //   cy.fixture('editProjectData').then((data) => {
  //     // Ensure the "Add Custom Material" button is visible
  //     cy.get('md-outlined-button[label="Add Custom Material"]').should('be.visible').click({force: true});

  //     // Enter values for the custom material fields
  //     cy.get('md-outlined-text-field[placeholder="Material"]')
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialName, { force: true });
  //     cy.get(`md-outlined-text-field[id="${data.customMaterialName.replace(/\s+/g, '')}-tonnage"]`)
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialTonnage.toString(), { force: true });
  //     cy.get(`md-outlined-text-field[id="${data.customMaterialName.replace(/\s+/g, '')}-recycled"]`)
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialRecycled.toString(), { force: true });
  //     cy.get(`md-outlined-text-field[id="${data.customMaterialName.replace(/\s+/g, '')}-truck"]`)
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialTruck.toString(), { force: true });
  //   });
  // });
});
