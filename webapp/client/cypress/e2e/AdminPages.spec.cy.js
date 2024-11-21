describe('Admin Pages', () => {
  beforeEach(() => {
    // Load the token from the fixture
    cy.fixture('adminToken').then((auth) => {
      // Simulate localStorage of session
      localStorage.setItem('jwtToken', auth.jwtToken);
    });
    // Visit the User List page
    cy.fixture('adminPagesData').then((data) => {
      // Intercept the API call to load users
      cy.intercept('get', `${Cypress.env('REACT_APP_BASE_URL')}/user/get-all-users`, {
        statusCode: 200,
        body: { users: [ data.testUser ] },
      }).as('getUsers');
      console.log(data.testUser)
      // cy.reload();
      cy.visit('/users');
      cy.wait('@getUsers');
    });
  })


  it('should display the page correctly', () => {
    cy.contains('Manage Users').should('be.visible');
    cy.fixture('adminPagesData').then((data) => {
      cy.contains(data.testUser.name).should('be.visible');
      cy.contains('View profile').should('be.visible');
      cy.contains('View projects').should('be.visible');
    });
  });


  it('should navigate between pages correctly and display the correct user name', () => {
    cy.fixture('adminPagesData').then((data) => {
      const user = data.testUser;

      // Navigate to a user profile
      cy.intercept('get', `${Cypress.env('REACT_APP_BASE_URL')}/user/get-user/${user._id}`, {
        statusCode: 200,
        body: { user },
      }).as('getUser');
      cy.get('.user-table-name')
        .contains('div', user.name) 
        .parent()
        .parent() 
        .within(() => {
          cy.get('.user-table-link').contains('View profile').click();
      });
      cy.wait('@getUser');

      cy.url().should('include', `/profile/${user._id}`);
      cy.contains(user.name).should('exist');
      
      // Navigate back to users list
      cy.get('#back-to-users-button').click()
      cy.wait('@getUsers');
      cy.url().should('include', `/users`);

      // Navigate to projects list of a user 
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-all-projects/${user._id}`, {
        statusCode: 200,
        body: { projects: [ data.testUserProjectDetails ]},
      }).as('getProjects');

      cy.get('.user-table-name')
        .contains('div', user.name) 
        .parent() 
        .parent() 
        .within(() => {
          cy.get('.user-table-link').contains('View projects').click();
      });
      cy.wait('@getUser');
      cy.wait('@getProjects');

      cy.url().should('include', `/projects/${user._id}`);
      cy.contains(`${user.name}'s Projects`).should('exist');

      // Navigate to a project page
      cy.intercept('GET', `${Cypress.env('REACT_APP_BASE_URL')}/get-project-details/${data.testUserProject._id}`, {
        statusCode: 200,
        body: { projectDetails: [ data.testUserProjectDetails ]},
      }).as('getProject');

      cy.get('.project-row').first().click();
      cy.wait('@getProject');
      
      cy.url().should('include', `/project/${data.testUserProject._id}/${user._id}`);
      cy.contains(`${user.name}'s Project`).should('exist');
      
      // Navigate back to projects list
      cy.get('#Back').click();
      cy.url().should('include', `/projects/${user._id}`);
      cy.wait('@getUser');
      
      // Navigate to profile from projects list
      cy.get('#get-user-profile-button').click();
      cy.url().should('include', `/profile/${user._id}`);
      cy.wait('@getUser');

      // Navigate back to projects list from profile
      cy.get('#get-project-list-button').click();
      cy.url().should('include', `/projects/${user._id}`);

      // Navigate back to users list
      cy.get('#back-to-users-button').click()
      cy.url().should('include', `/users`);
    });
  });

  
  it('should alert the user if they press "delete account"', () => {
    cy.fixture('adminPagesData').then((data) => {
      const user = data.testUser;
      // Navigate to a user profile
      cy.intercept('get', `${Cypress.env('REACT_APP_BASE_URL')}/user/get-user/${user._id}`, {
        statusCode: 200,
        body: { user },
      }).as('getUser');
      cy.get('.user-table-name')
        .contains('div', user.name) 
        .parent()
        .parent() 
        .within(() => {
          cy.get('.user-table-link').contains('View profile').click();
      });
      cy.wait('@getUser');
      cy.get('#delete-account-button').click();
        cy.on('window:alert', (text) => {
          expect(text).to.contains(`Delete user'${user.name}'?`);
        });
    });
  });
});


