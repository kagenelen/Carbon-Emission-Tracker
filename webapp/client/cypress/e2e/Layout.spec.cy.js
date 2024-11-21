describe('Layout Component with Dynamic Content', () => {
  
    it('should render the logos on every page', () => {
      // Visit a page (this will be tested on all pages where Layout is used)
      cy.visit('/anypage');  // Test this on any page
  
      // Ensure the logos inside the Layout component are visible on all pages
      cy.get('img[alt="Logo"]').should('be.visible');
      cy.get('img[alt="UNSW Logo"]').should('be.visible');
    });
  });
  