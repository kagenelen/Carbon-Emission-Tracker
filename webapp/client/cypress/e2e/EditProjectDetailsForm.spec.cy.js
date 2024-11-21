describe('Edit Project Details Form Tests', () => {
  beforeEach(() => {
    cy.fixture('authToken').then((auth) => {
      localStorage.setItem('jwtToken', auth.jwtToken);
    });
    cy.fixture('editProjectData').then((data) => {
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-project-details/${data.projectId}`, {
        statusCode: 200,
        body: {
          message: "Project data retrieved.",
          projectDetails: data.oldProjectDetails,
        },
      }).as('retrieveDetails');
      cy.visit(`/project/${data.projectId}`);
      cy.wait('@retrieveDetails');
      cy.contains("Edit Project").click();
    });
  });

  it('should display an alert for an invalid date', () => {
    cy.wait('@retrieveDetails');
    cy.get('input[name="date"]').clear({ force: true }).type('invalid-date', { force: true });
    cy.get('md-filled-button[type="submit"]').click({force: true});
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Please enter a valid date');
    });
  });

  it('should submit the form successfully with valid data', () => {
    cy.intercept('POST', `${Cypress.env('REACT_APP_BASE_URL')}/edit-project-details`, {
      statusCode: 200,
      body: { message: 'Project updated successfully' },
    }).as('updateProject');

    cy.fixture('editProjectData').then((data) => {
      cy.get('md-outlined-text-field[label="Project Name*"]')
        .shadow()
        .find('input')
        .clear()
        .type(data.newProjectDetails.projectName);
        cy.get('input[name="date"]').clear({ force: true }).type('05/11/2024', { force: true });
      cy.get('md-filled-button[type="submit"]').click({force: true});
      cy.wait('@updateProject');
      cy.url().should('include', '/edit-project-data');
    });
  });

  // it('should pre-fill the form with retrieved project data', () => {
  //   cy.fixture('editProjectData').then((data) => {
  //     cy.get('md-outlined-text-field[label="Project Name*"]')
  //       .shadow()
  //       .find('input')
  //       .should('have.value', data.oldProjectDetails.projectName);
  //     cy.get('md-outlined-text-field[label="Project Number*"]')
  //       .shadow()
  //       .find('input')
  //       .should('have.value', data.oldProjectDetails.projectNumber)
  //       .should('be.disabled');
  //     cy.get('md-outlined-text-field[label="Client"]')
  //       .shadow()
  //       .find('input')
  //       .should('have.value', data.oldProjectDetails.clientName);
  //     cy.get('md-outlined-text-field[label="Revision Number"]')
  //       .shadow()
  //       .find('input')
  //       .should('have.value', data.oldProjectDetails.revisionNumber);
  //   });
  // });

// it('should display updated project details on the dashboard', () => {
//   cy.fixture('editProjectData').then((data) => {
//     // Navigate to the Edit Project page
//     cy.contains('Edit Project').click();

//     // Fill in the new project details using data from the fixture
//     const newDetails = data.newProjectDetails;
//     cy.get('md-outlined-text-field[label="Project Name*"]')
//       .shadow()
//       .find('input')
//       .clear()
//       .type(newDetails.projectName);
    
//     cy.get('input[name="date"]').clear({ force: true }).type('05/11/2024', { force: true });
    
//     // cy.get('md-outlined-text-field[label="Client"]')
//     //   .shadow()
//     //   .find('input')
//     //   .clear()
//     //   .type(newDetails.client);
    
//     cy.get('md-outlined-text-field[label="Revision Number"]')
//       .shadow()
//       .find('input')
//       .clear({force: true})
//       .type(newDetails.revisionNumber, {force: true});

//     // Submit the form to save the changes
//     cy.get('md-filled-button[type="submit"]').click({force: true});

//     // Submit the form of the data
//     cy.get('md-filled-button[type="submit"]').click({force: true});

//     // Reopen the "Project Details" dialog
//     cy.contains('View Details').click({force: true});

//     // Verify that the updated project details are displayed
//     cy.contains(newDetails.projectName).should('exist');
//     cy.contains(newDetails.projectNumber).should('exist');
//     cy.contains(dayjs(newDetails.date).format("D MMM YYYY")).should('exist');
//     // cy.contains(newDetails.client).should('exist');
//     cy.contains(newDetails.revisionNumber).should('exist');
//   });
// });
});
