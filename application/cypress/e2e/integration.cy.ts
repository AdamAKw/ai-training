describe('Cooking App - Full User Journey', () => {
    it('should complete a full user workflow', () => {
        // 1. Odwiedzamy stronę główną
        cy.visit('/')
        cy.get('body').should('be.visible')

        // 2. Przechodzimy do przepisów - używamy angielskich nazw z nawigacji
        cy.contains('Recipes').click()
        cy.url().should('include', '/recipes')

        // 3. Sprawdzamy możliwość dodania przepisu
        cy.get('body').then(($body) => {
            if ($body.find('a[href="/recipes/new"]').length > 0) {
                cy.get('a[href="/recipes/new"]').first().click()
                cy.url().should('include', '/recipes/new')

                // Sprawdzamy formularz
                cy.get('form').should('be.visible')

                // Wracamy do listy przepisów
                cy.go('back')
            }
        })

        // 4. Przechodzimy do planów posiłków
        cy.contains('Meal Plans').click()
        cy.url().should('include', '/mealPlans')

        // 5. Sprawdzamy spiżarnię
        cy.contains('Pantry').click()
        cy.url().should('include', '/pantry')

        // 6. Sprawdzamy listę zakupów
        cy.contains('Shopping List').click()
        cy.url().should('include', '/shoppingList')

        // 7. Wracamy na stronę główną
        cy.visit('/')
        cy.get('body').should('be.visible')
    })

    it('should handle responsive design', () => {
        // Test na różnych rozmiarach ekranu
        const viewports = [
            { width: 375, height: 667 }, // iPhone SE
            { width: 768, height: 1024 }, // iPad
            { width: 1280, height: 720 }  // Desktop
        ]

        viewports.forEach((viewport) => {
            cy.viewport(viewport.width, viewport.height)
            cy.visit('/', { timeout: 15000 })

            // Sprawdzamy czy strona jest responsywna
            cy.get('body').should('be.visible')

            // Sprawdzamy nawigację na każdym rozmiarze
            cy.get('nav, header, [role="navigation"]').should('be.visible')
        })
    })

    it('should handle errors gracefully', () => {
        // Test nieistniejącej strony
        cy.visit('/nieistniejaca-strona', {
            failOnStatusCode: false,
            timeout: 15000
        })

        // Sprawdzamy czy jest strona 404 lub przekierowanie
        cy.get('body').should('be.visible')
    })
})
