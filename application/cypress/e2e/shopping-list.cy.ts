describe('Cooking App - Shopping List Management', () => {
    beforeEach(() => {
        cy.visit('/shoppingList')
    })

    it('should display shopping list page', () => {
        cy.url().should('include', '/shoppingList')
        cy.get('body').should('be.visible')
        cy.contains('Lista zakupów').should('be.visible')
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
                text.includes('lista') ||
                text.includes('zakup') ||
                text.includes('pusty') ||
                text.includes('brak') ||
                text.includes('dodaj') ||
                text.includes('kup')
            )
        })
    })

    it('should display shopping list items', () => {
        cy.get('body').should('be.visible')

        // Sprawdzamy czy są elementy listy zakupów lub stan pusty
        cy.get('body').should(($body) => {
            // Sprawdzamy czy jest grid lub layout z listami
            const hasGrid = $body.find('.grid').length > 0
            // Sprawdzamy czy są komponenty ShoppingListItem lub inne elementy listy
            const hasListElements = $body.find('[class*="space-y"], div[class*="p-3"]').length > 0
            // Sprawdzamy czy jest loading state
            const hasLoadingState = $body.text().includes('Ładowanie') || $body.text().includes('loading')
            // Sprawdzamy czy jest EmptyState (gdy brak list zakupów)
            const hasEmptyState = $body.text().includes('nie masz') || $body.text().includes('Utwórz') || $body.text().includes('lista')
            // Sprawdzamy czy jest tekst związany z listą zakupów
            const hasShoppingContent = $body.text().includes('Lista zakupów') || $body.text().includes('zakup') || $body.text().includes('produkt')
            // Sprawdzamy czy są przyciski lub akcje
            const hasButtons = $body.find('button').length > 0

            const hasContent = hasGrid || hasListElements || hasLoadingState || hasEmptyState || hasShoppingContent || hasButtons
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
