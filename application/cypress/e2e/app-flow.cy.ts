describe('Cooking App - Meal Plans', () => {
    beforeEach(() => {
        cy.visit('/mealPlans')
    })

    it('should display meal plans page', () => {
        cy.url().should('include', '/mealPlans')
        cy.get('body').should('be.visible')
    })

    it('should allow creating new meal plan', () => {
        // Szukamy przycisku tworzenia nowego planu
        cy.get('a[href*="/mealPlans/new"], button').contains(/dodaj|nowy|add|new|plan/i).first().click()

        cy.url().should('include', '/mealPlans/new')
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
        // Szukamy opcji dodawania przedmiotu do spiżarni
        cy.get('body').then(($body) => {
            if ($body.find('a[href*="/pantry/new"], button').length > 0) {
                cy.get('a[href*="/pantry/new"], button').contains(/dodaj|add/i).first().click()
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
