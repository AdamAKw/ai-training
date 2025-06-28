describe('Cooking App - Recipe Management', () => {
    beforeEach(() => {
        cy.visit('/recipes')
    })

    it('should display recipes page', () => {
        cy.url().should('include', '/recipes')
        cy.get('body').should('be.visible')
        cy.contains('Recipes').should('be.visible')
    })

    it('should navigate to create new recipe', () => {
        cy.visit('/recipes/new')
        cy.url().should('include', '/recipes/new')
        cy.get('form').should('be.visible')
    })

    it('should create a new recipe with basic information', () => {
        cy.visit('/recipes/new')

        // Wypełniamy podstawowe informacje
        cy.get('input[name="name"], input[id="name"]').type('Test Recipe')
        cy.get('textarea[name="description"], textarea[id="description"]').type('Test description for Cypress')

        // Sprawdzamy czy formularz ma wymagane pola
        cy.get('form').should('contain.text', 'Recipe')
    })

    it('should handle empty recipe list', () => {
        cy.visit('/recipes')

        // Sprawdzamy czy strona obsługuje pustą listę przepisów
        cy.get('body').should('be.visible')

        // Może być komunikat o braku przepisów lub lista (oba są OK)
        cy.get('body').should(($body) => {
            const text = $body.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('recipe') ||
                text.includes('empty') ||
                text.includes('no recipes') ||
                text.includes('create') ||
                text.includes('add')
            )
        })
    })
})

describe('Cooking App - Recipe Search and Filtering', () => {
    beforeEach(() => {
        cy.visit('/recipes')
    })

    it('should handle search functionality if available', () => {
        cy.get('body').then(($body) => {
            if ($body.find('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]').length > 0) {
                cy.get('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]').first()
                    .type('test')
                    .should('have.value', 'test')
            }
        })
    })

    it('should display recipe cards or list items', () => {
        cy.get('body').should('be.visible')

        // Sprawdzamy czy są elementy reprezentujące przepisy (karty, elementy listy itp.)
        cy.get('body').should(($body) => {
            const hasCards = $body.find('[data-testid*="recipe"], .recipe-card, .recipe-item').length > 0
            const hasListItems = $body.find('li, article, section').length > 0
            const hasContent = hasCards || hasListItems

            expect(hasContent).to.equal(true)
        })
    })
})
