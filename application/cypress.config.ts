import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        viewportWidth: 1280,
        viewportHeight: 720,
        video: true,
        screenshotOnRunFailure: true,
        setupNodeEvents() {
            // implement node event listeners here if needed
        },
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/e2e.ts',
    },

    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
        specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/component.ts',
    },

    // Global configuration
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Environment variables
    env: {
        // Add your environment variables here
    },

    // Folders
    downloadsFolder: 'cypress/downloads',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
})
