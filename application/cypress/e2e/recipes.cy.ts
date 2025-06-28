describe('Cooking App - Recipes Management', () => {
    beforeEach(() => {
        cy.visit('/recipes')
    })

    it('should display recipes page', () => {
        // Sprawdzamy czy jesteśmy na stronie przepisów
        cy.url().should('include', '/recipes')
        cy.get('h1, h2').contains('Przepisy').should('be.visible')
    })

    it('should allow navigation to add new recipe', () => {
        // Szukamy przycisku "Dodaj przepis" lub podobnego
        cy.get('a[href*="/recipes/new"], button').contains(/dodaj|nowy|add|new/i).first().click()

        // Sprawdzamy czy jesteśmy na stronie dodawania przepisu
        cy.url().should('include', '/recipes/new')
    })

    it('should display recipe form when creating new recipe', () => {
        // Przechodzimy do formularza dodawania przepisu
        cy.visit('/recipes/new')

        // Sprawdzamy czy formularz jest widoczny
        cy.get('form').should('be.visible')

        // Sprawdzamy czy podstawowe pola są dostępne
        cy.get('input[name*="name"], input[placeholder*="nazwa"], input[placeholder*="Name"]').should('be.visible')
    })

    it('should handle empty recipes state', () => {
        // Sprawdzamy czy aplikacja obsługuje stan braku przepisów
        cy.visit('/recipes')

        // Może być komunikat o braku przepisów lub przycisk dodawania pierwszego przepisu
        cy.get('body').should('be.visible')
        cy.get('body').should(($body) => {
            const text = $body.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('przepis') || text.includes('recipe') || text.includes('dodaj') || text.includes('add')
            )
        })
    })

    it('should allow searching/filtering recipes (if implemented)', () => {
        cy.visit('/recipes')

        // Sprawdzamy czy jest pole wyszukiwania (opcjonalne)
        cy.get('body').then(($body) => {
            if ($body.find('input[type="search"], input[placeholder*="szukaj"], input[placeholder*="search"]').length > 0) {
                cy.get('input[type="search"], input[placeholder*="szukaj"], input[placeholder*="search"]').should('be.visible')
            }
        })
    })
})
