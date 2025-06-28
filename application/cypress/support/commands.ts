// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to select elements by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
    return cy.get(`[data-cy=${value}]`)
})

// Custom command for login (if you add authentication later)
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.visit('/login')
    cy.get('[data-cy=email-input]').type(email)
    cy.get('[data-cy=password-input]').type(password)
    cy.get('[data-cy=login-button]').click()
})
