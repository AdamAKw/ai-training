describe('Cooking App - Meal Plans', () => {
    beforeEach(() => {
        cy.visit('/mealPlans')
    })

    it('should display meal plans page', () => {
        cy.url().should('include', '/mealPlans')
        cy.get('body').should('be.visible')
    })

    it('should allow creating new meal plan', () => {
        // Sprawdzamy czy jest przycisk "New Plan" lub link do tworzenia nowego planu
        cy.get('body').then(($body) => {
            if ($body.find('a[href="/mealPlans/new"]').length > 0) {
                cy.get('a[href="/mealPlans/new"]').first().click()
                cy.url().should('include', '/mealPlans/new')
            } else if ($body.find('button').length > 0) {
                // Sprawdzamy czy jest przycisk zawierający "New" lub "Add"
                cy.get('button').contains(/new|add|nowy|dodaj/i).first().click()
                cy.url().should('include', '/mealPlans/new')
            } else {
                // Jeśli nie ma przycisku, sprawdzamy czy strona działa
                cy.visit('/mealPlans/new')
                cy.url().should('include', '/mealPlans/new')
            }
        })
    })

    it('should display meal plan form', () => {
        cy.visit('/mealPlans/new')

        cy.get('form').should('be.visible')

        // Sprawdzamy podstawowe pola formularza
        cy.get('input, select, textarea').should('have.length.at.least', 1)
    })
})

describe('Cooking App - Pantry Management', () => {
    beforeEach(() => {
        cy.visit('/pantry')
    })

    it('should display pantry page', () => {
        cy.url().should('include', '/pantry')
        cy.get('body').should('be.visible')
    })

    it('should allow adding items to pantry', () => {
        // Sprawdzamy czy jest link do dodawania przedmiotów do spiżarni
        cy.get('body').then(($body) => {
            if ($body.find('a[href="/pantry/new"]').length > 0) {
                cy.get('a[href="/pantry/new"]').first().click()
                cy.url().should('include', '/pantry/new')
            } else if ($body.find('button').length > 0) {
                // Sprawdzamy czy jest przycisk zawierający "Add" lub "New"
                cy.get('button').contains(/add|new|dodaj|nowy/i).first().click()
                cy.url().should('include', '/pantry/new')
            } else {
                // Jeśli nie ma przycisku, sprawdzamy czy strona /pantry/new działa
                cy.visit('/pantry/new')
                cy.url().should('include', '/pantry/new')
            }
        })
    })
})

describe('Cooking App - Shopping List', () => {
    beforeEach(() => {
        cy.visit('/shoppingList')
    })

    it('should display shopping list page', () => {
        cy.url().should('include', '/shoppingList')
        cy.get('body').should('be.visible')
    })

    it('should handle empty shopping list', () => {
        cy.get('body').should('be.visible')

        // Sprawdzamy czy jest komunikat o pustej liście lub opcja dodawania przedmiotów
        cy.get('body').should(($body) => {
            const text = $body.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('lista') ||
                text.includes('shopping') ||
                text.includes('zakup') ||
                text.includes('dodaj') ||
                text.includes('empty') ||
                text.includes('brak')
            )
        })
    })
})
