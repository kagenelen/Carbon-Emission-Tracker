// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'
import { addCommands } from 'cypress-mongodb/dist/index-browser';

addCommands();

Cypress.on('uncaught:exception', (err, runnable) => {
    // Prevent cypress from failing test due to variables not loading in strict mode
    return false;
});

beforeEach(() => {
    // Clear test database before each test
    // Add collections as needed
    console.log("e2e rerun");
    
    cy.deleteMany({}, {collection: 'users'}).then(result => {
        console.log('dropped users')
        cy.log("User database: ", result); 
    });

    const adminUser = {
        userName : "admin3900",
        email : "demouser@example.com",
        password : "$2a$10$gcZXQl3fj2qvnAxFyZkZROLZtMrOTuzv.StOfgMU/MQFvyLDlH1gC", // sleepy
        permission : 1
    }

    cy.insertOne(adminUser, {collection: 'users'}).then(result => {
        cy.log("Inserted test user", result); 
    });
    
    cy.deleteMany({}, {collection: 'tokens'}).then(result => {
        cy.log("Tokens database: ", result); 
    });

    cy.deleteMany({}, {collection: 'projects'}).then(result => {
        cy.log("Projects database: ", result); 
    });
})