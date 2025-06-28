// ***********************************************************
// This example support/e2e.ts file is processed and
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

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err) => {
    // Returning false here prevents Cypress from failing the test
    // on uncaught exceptions. Use with caution.
    console.log('Uncaught exception:', err.message)
    return false
})

// Add custom commands for your app
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to select DOM element by data-cy attribute.
             * @example cy.dataCy('greeting')
             */
            dataCy(value: string): Chainable<JQuery<HTMLElement>>

            /**
             * Custom command to login to the application (if you add authentication later)
             * @example cy.login('user@example.com', 'password')
             */
            login(email: string, password: string): Chainable<void>
        }
    }
}
