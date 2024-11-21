import dayjs from 'dayjs';

describe('Create Project Data Form Tests', () => {
  beforeEach(() => {
    // Set up initial localStorage for authentication
    cy.fixture('authToken').then((auth) => {
      localStorage.setItem('jwtToken', auth.jwtToken);
    });

    // Load fixture data and set up initial API intercepts and localStorage
    cy.fixture('editProjectData').then((data) => {
      // Intercept the POST request for creating the project
      cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/create-project`, {
        statusCode: 201,
        body: { projectId: data.projectId, projectDetails: data.oldProjectDetails },
      }).as('createProject');

      // Visit the initial form page and submit the "Create Project Details" form
      cy.visit('/new-project-details');
      cy.get('md-outlined-text-field[label="Project Name*"]')
        .shadow()
        .find('input')
        .type('Test Project');
      cy.get('md-outlined-text-field[label="Project Number*"]')
        .shadow()
        .find('input')
        .type('001');
    cy.get('.MuiInputBase-input')
        .clear({ force: true })
        .type(dayjs().format('DD/MM/YYYY'), { force: true });
      cy.get('md-outlined-text-field[label="Client"]')
        .shadow()
        .find('input')
        .type('Client Name', { force: true });
      cy.get('md-outlined-text-field[label="Revision Number"]')
        .shadow()
        .find('input')
        .type('1', { force: true });

      // Submit the form
      cy.get('md-filled-button[type="submit"]').click({ force: true });
      cy.get('md-filled-button').contains('Manual').click();
      cy.wait('@createProject');
    });
  });

  it('should display initial project data values as empty', () => {
    const fields = ['tonnage', 'recycled', 'truck'];
  
    // Loop through each default material and check that the fields have a value of '0'
    const defaultMaterials = [
      'Concrete', 'Brick', 'Black Iron', 'PVC', 'Copper', 
      'Mixed Metal Scrap', 'Asbestos', 'Asbestos Soil', 
      'Mixed Waste', 'VENM'
    ];
  
    defaultMaterials.forEach((material) => {
      fields.forEach((field) => {
        cy.get(`md-outlined-text-field[id="${material.replace(/\s+/g, '')}-${field}"]`)
          .shadow()
          .find('input')
          .should('have.value', '');
      });
    });
  });   

  it('should display validation alerts for invalid input values', () => {
    cy.fixture('editProjectData').then((data) => {
      // Set invalid values for validation testing
      cy.get(`md-outlined-text-field[id="Concrete-tonnage"]`)
        .shadow()
        .find('input')
        .clear()
        .type('-10'); // Invalid tonnage

      cy.get(`md-outlined-text-field[id="Concrete-recycled"]`)
        .shadow()
        .find('input')
        .clear()
        .type('150'); // Invalid recycled percentage

      cy.get(`md-outlined-text-field[id="Concrete-truck"]`)
        .shadow()
        .find('input')
        .clear()
        .type('-5'); // Invalid truck number

      // Trigger form submission
      cy.get('md-filled-button[type="submit"]').click();

      // Verify validation alerts are shown
      cy.on('window:alert', (alertText) => {
        expect(alertText).to.include(data.invalidTonnageAlert);
        expect(alertText).to.include(data.invalidRecycledAlert);
        expect(alertText).to.include(data.invalidTruckAlert);
      });
    });
  });

  // it('should allow adding and deleting custom materials', () => {
  //   cy.fixture('editProjectData').then((data) => {
  //     // Click to add a custom material
  //     cy.get('md-outlined-button[label="Add Custom Material"]').click();

  //     // Fill in custom material details
  //     const customMaterialName = `Custom Material ${data.customMaterialIndex}`;
  //     cy.get(`md-outlined-text-field[value="${customMaterialName}"]`)
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialName);

  //     cy.get(`md-outlined-text-field[id="${data.customMaterialName.replace(/\s+/g, '')}-tonnage"]`)
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialTonnage.toString());
  //     cy.get(`md-outlined-text-field[id="${data.customMaterialName.replace(/\s+/g, '')}-recycled"]`)
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialRecycled.toString());
  //     cy.get(`md-outlined-text-field[id="${data.customMaterialName.replace(/\s+/g, '')}-truck"]`)
  //       .shadow()
  //       .find('input')
  //       .type(data.customMaterialTruck.toString());

  //     // Delete the custom material
  //     cy.get(`md-outlined-text-field[value="${customMaterialName}"]`).then(($el) => {
  //       cy.wrap($el)
  //         .parent()
  //         .parent()
  //         .find('button[aria-label="delete"]')
  //         .click();
  //     });

  //     // Ensure custom material fields are no longer present
  //     cy.get(`md-outlined-text-field[value="${customMaterialName}"]`).should('not.exist');
  //   });
  // });
});
