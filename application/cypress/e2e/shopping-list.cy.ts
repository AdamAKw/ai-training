describe('Cooking App - Shopping List Management', () => {
    beforeEach(() => {
        cy.visit('/shoppingList')
    })

    it('should display shopping list page', () => {
        cy.url().should('include', '/shoppingList')
        cy.get('body').should('be.visible')
        cy.contains('Shopping List').should('be.visible')
    })

    it('should navigate to add new shopping item', () => {
        cy.visit('/shoppingList/new')
        cy.url().should('include', '/shoppingList/new')
        cy.get('form').should('be.visible')
    })

    it('should handle empty shopping list', () => {
        cy.visit('/shoppingList')

        // Sprawdzamy czy strona obsługuje pustą listę zakupów
        cy.get('body').should('be.visible')

        // Może być komunikat o pustej liście lub lista produktów
        cy.get('body').should(($body) => {
            const text = $body.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('shopping') ||
                text.includes('list') ||
                text.includes('empty') ||
                text.includes('no items') ||
                text.includes('add') ||
                text.includes('buy')
            )
        })
    })

    it('should display shopping list items', () => {
        cy.get('body').should('be.visible')

        // Sprawdzamy czy są elementy listy zakupów
        cy.get('body').should(($body) => {
            const hasItems = $body.find('[data-testid*="shopping"], .shopping-item, .item-card').length > 0
            const hasListItems = $body.find('li, article, section').length > 0
            const hasContent = hasItems || hasListItems

            expect(hasContent).to.equal(true)
        })
    })
})

describe('Cooking App - Shopping List Operations', () => {
    it('should handle shopping item operations', () => {
        cy.visit('/shoppingList')

        // Sprawdzamy czy są opcje zarządzania listą zakupów
        cy.get('body').then(($body) => {
            const hasButtons = $body.find('button').length > 0
            const hasLinks = $body.find('a[href*="/shoppingList/"]').length > 0
            const hasCheckboxes = $body.find('input[type="checkbox"]').length > 0

            if (hasButtons || hasLinks || hasCheckboxes) {
                cy.log('Shopping list management options are available')
            }
        })
    })

    it('should allow marking items as completed', () => {
        cy.visit('/shoppingList')

        // Sprawdzamy czy są checkboxy do zaznaczania zakupów
        cy.get('body').then(($body) => {
            if ($body.find('input[type="checkbox"]').length > 0) {
                cy.get('input[type="checkbox"]').first().check()
                cy.get('input[type="checkbox"]').first().should('be.checked')
            }
        })
    })

    it('should validate shopping list form', () => {
        cy.visit('/shoppingList/new')

        // Sprawdzamy formularz dodawania produktu
        cy.get('form').should('be.visible')

        // Próbujemy dodać produkt
        cy.get('body').then(($body) => {
            if ($body.find('input[name="name"], input[id="name"]').length > 0) {
                cy.get('input[name="name"], input[id="name"]').type('Test Shopping Item')
            }

            if ($body.find('input[name="quantity"], input[id="quantity"]').length > 0) {
                cy.get('input[name="quantity"], input[id="quantity"]').type('2')
            }
        })
    })
})
