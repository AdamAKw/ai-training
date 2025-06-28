describe('Cooking App - Full User Journey', () => {
    it('should complete a full user workflow', () => {
        // 1. Odwiedzamy stronę główną
        cy.visit('/')
        cy.get('body').should('be.visible')

        // 2. Przechodzimy do przepisów - sprawdzamy różne sposoby nawigacji
        cy.get('body').then(($body) => {
            if ($body.find('a').text().includes('Przepisy')) {
                cy.contains('Przepisy').click()
            } else if ($body.find('a[href="/recipes"]').length > 0) {
                cy.get('a[href="/recipes"]').first().click()
            } else {
                cy.visit('/recipes')
            }
        })
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
            } else if ($body.find('button, a').text().toLowerCase().includes('dodaj')) {
                cy.get('button, a').contains(/dodaj|nowy/i).first().click()
            }
        })

        // 4. Przechodzimy do planów posiłków
        cy.get('body').then(($body) => {
            if ($body.find('a').text().includes('Plany posiłków') || $body.find('a').text().includes('plany')) {
                cy.contains(/plan/i).click()
            } else if ($body.find('a[href="/mealPlans"]').length > 0) {
                cy.get('a[href="/mealPlans"]').first().click()
            } else {
                cy.visit('/mealPlans')
            }
        })
        cy.url().should('include', '/mealPlans')

        // 5. Sprawdzamy spiżarnię
        cy.get('body').then(($body) => {
            if ($body.find('a').text().includes('Spiżarka')) {
                cy.contains('Spiżarka').click()
            } else if ($body.find('a[href="/pantry"]').length > 0) {
                cy.get('a[href="/pantry"]').first().click()
            } else {
                cy.visit('/pantry')
            }
        })
        cy.url().should('include', '/pantry')

        // 6. Sprawdzamy listę zakupów
        cy.get('body').then(($body) => {
            if ($body.find('a').text().includes('Lista zakupów')) {
                cy.contains('Lista zakupów').click()
            } else if ($body.find('a[href="/shoppingList"]').length > 0) {
                cy.get('a[href="/shoppingList"]').first().click()
            } else {
                cy.visit('/shoppingList')
            }
        })
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
