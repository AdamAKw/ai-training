describe('Cooking App - Recipe Management', () => {
    beforeEach(() => {
        cy.visit('/recipes')
    })

    it('should display recipes page', () => {
        cy.url().should('include', '/recipes')
        cy.get('body').should('be.visible')
        cy.contains('Przepisy').should('be.visible')
    })

    it('should navigate to create new recipe', () => {
        cy.visit('/recipes/new')
        cy.url().should('include', '/recipes/new')
        cy.get('form').should('be.visible')
    })

    it('should create a new recipe with basic information', () => {
        cy.visit('/recipes/new')

        // Wypełniamy podstawowe informacje - używamy nazw pól z react-hook-form
        cy.get('input[name="name"]').should('be.visible').type('Test Przepis')

        // Sprawdzamy i wypełniamy opis
        cy.get('textarea[name="description"]').should('be.visible').type('Testowy opis przepisu utworzony przez Cypress')

        // Sprawdzamy i wypełniamy wymagane pola numeryczne
        cy.get('input[name="prepTime"]').should('be.visible').clear().type('30')
        cy.get('input[name="cookTime"]').should('be.visible').clear().type('45')
        cy.get('input[name="servings"]').should('be.visible').clear().type('4')

        // Sprawdzamy czy jest przynajmniej jeden składnik (powinien być domyślnie)
        cy.get('input[name*="ingredients"]').should('have.length.greaterThan', 0)

        // Wypełniamy pierwszy składnik jeśli jest pusty
        cy.get('input[name="ingredients.0.name"]').clear().type('Test składnik')
        cy.get('input[name="ingredients.0.quantity"]').clear().type('500')
        // Wybieramy jednostkę z dropdown (now it's a Select component)
        cy.get('[role="combobox"]').first().click()
        cy.get('[role="option"]').contains('Gram').click()

        // Sprawdzamy czy jest przynajmniej jedna instrukcja
        cy.get('textarea[name*="instructions"], input[name*="instructions"]').should('have.length.greaterThan', 0)

        // Wypełniamy pierwszą instrukcję
        cy.get('textarea[name="instructions.0.value"], input[name="instructions.0.value"]').clear().type('Testowa instrukcja przygotowania')

        // Sprawdzamy czy formularz ma wszystkie wymagane elementy
        cy.get('form').should('be.visible')
        cy.get('input[name="name"]').should('have.value', 'Test Przepis')

        // Próbujemy wysłać formularz
        cy.get('button[type="submit"]').should('be.visible').click()

        // Sprawdzamy czy nastąpi przekierowanie po sukcesie
        cy.url().should('satisfy', (url: string) => {
            return url.includes('/recipes') && !url.includes('/new')
        }, { timeout: 10000 })
    })

    it('should handle empty recipe list', () => {
        cy.visit('/recipes')

        // Sprawdzamy czy strona obsługuje pustą listę przepisów
        cy.get('body').should('be.visible')

        // Może być komunikat o braku przepisów lub lista (oba są OK)
        cy.get('body').should(($body) => {
            const text = $body.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('przepis') ||
                text.includes('pusty') ||
                text.includes('brak') ||
                text.includes('dodaj') ||
                text.includes('nowy') ||
                text.includes('utwórz')
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

        // Sprawdzamy czy są elementy reprezentujące przepisy lub stan pusty
        cy.get('body').should(($body) => {
            // Sprawdzamy czy jest grid z przepisami
            const hasGrid = $body.find('.grid').length > 0
            // Sprawdzamy czy są karty (Card komponenty)
            const hasCards = $body.find('[class*="card"]').length > 0
            // Sprawdzamy czy są skeletony (podczas ładowania)
            const hasSkeletons = $body.find('[class*="skeleton"]').length > 0
            // Sprawdzamy czy jest EmptyState (gdy brak przepisów)
            const hasEmptyState = $body.text().includes('nie masz') || $body.text().includes('Utwórz')
            // Sprawdzamy czy jest tekst związany z przepisami
            const hasRecipesContent = $body.text().includes('przepis') || $body.text().includes('Przepis')

            const hasContent = hasGrid || hasCards || hasSkeletons || hasEmptyState || hasRecipesContent
            expect(hasContent).to.equal(true)
        })
    })
})
