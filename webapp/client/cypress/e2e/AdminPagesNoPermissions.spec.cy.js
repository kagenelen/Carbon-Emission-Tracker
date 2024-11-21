describe('Project List Page', () => {
  beforeEach(() => {
    // Load the token from the fixture
    cy.fixture('notAdminToken').then((auth) => {
      // Simulate localStorage of session
      localStorage.setItem('jwtToken', auth.jwtToken);
    });

  });

  // Should show alert if user does not have admin permissions on /users page
  it('should redirect user from /users if they do not have admin permissions', () => {
    cy.visit('/users');

    cy.fixture('adminPagesData').then((data) => {
      cy.on('window:alert', (text) => {
        expect(text).to.contains(data.notAdminError);
      });
    })
  });

  // Should show alert if user does not have admin permissions on /users page
  it('should redirect non admin user from /profile/:userId', () => {
    cy.fixture('adminPagesData').then((data) => {
      cy.visit(`/profile/${data.testUser._id}`);

      cy.on('window:alert', (text) => {
        expect(text).to.contains(data.notAdminError);
      })
    });
  });
  
  it('should redirect non admin user from /projects/:userId', () => {
    cy.fixture('adminPagesData').then((data) => {
      cy.visit(`/projects/${data.testUser._id}`);

      cy.on('window:alert', (text) => {
        expect(text).to.contains(data.notAdminError);
      })
    });
  });

});
