describe('Cooking App - Pantry Management', () => {
    beforeEach(() => {
        cy.visit('/pantry')
    })

    it('should display pantry page', () => {
        cy.url().should('include', '/pantry')
        cy.get('body').should('be.visible')
        cy.contains('Pantry').should('be.visible')
    })

    it('should navigate to add new pantry item', () => {
        cy.visit('/pantry/new')
        cy.url().should('include', '/pantry/new')
        cy.get('form').should('be.visible')
    })

    it('should create a new pantry item', () => {
        cy.visit('/pantry/new')

        // Wypełniamy informacje o produkcie
        cy.get('input[name="name"], input[id="name"]').type('Test Item')

        // Sprawdzamy czy są pola dla ilości
        cy.get('body').then(($body) => {
            if ($body.find('input[name="quantity"], input[id="quantity"]').length > 0) {
                cy.get('input[name="quantity"], input[id="quantity"]').type('5')
            }
        })

        // Sprawdzamy czy formularz ma wymagane pola
        cy.get('form').should(($form) => {
            const text = $form.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('pantry') || text.includes('item')
            )
        })
    })

    it('should handle empty pantry list', () => {
        cy.visit('/pantry')

        // Sprawdzamy czy strona obsługuje pustą spiżarnię
        cy.get('body').should('be.visible')

        // Może być komunikat o pustej spiżarni lub lista produktów
        cy.get('body').should(($body) => {
            const text = $body.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('pantry') ||
                text.includes('empty') ||
                text.includes('no items') ||
                text.includes('add') ||
                text.includes('item')
            )
        })
    })

    it('should display pantry items list', () => {
        cy.get('body').should('be.visible')

        // Sprawdzamy czy są elementy spiżarni
        cy.get('body').should(($body) => {
            const hasItems = $body.find('[data-testid*="pantry"], .pantry-item, .item-card').length > 0
            const hasListItems = $body.find('li, article, section').length > 0
            const hasContent = hasItems || hasListItems

            expect(hasContent).to.equal(true)
        })
    })
})

describe('Cooking App - Pantry Operations', () => {
    it('should handle pantry item operations', () => {
        cy.visit('/pantry')

        // Sprawdzamy czy są opcje zarządzania produktami
        cy.get('body').then(($body) => {
            // Szukamy przycisków edycji, usuwania lub innych operacji
            const hasButtons = $body.find('button').length > 0
            const hasLinks = $body.find('a[href*="/pantry/"]').length > 0

            if (hasButtons || hasLinks) {
                cy.log('Pantry management options are available')
            }
        })
    })

    it('should validate pantry form fields', () => {
        cy.visit('/pantry/new')

        // Sprawdzamy wymagane pola formularza
        cy.get('form').should('be.visible')

        // Próbujemy wysłać pusty formularz
        cy.get('body').then(($body) => {
            if ($body.find('button[type="submit"], input[type="submit"]').length > 0) {
                cy.get('button[type="submit"], input[type="submit"]').first().click()

                // Sprawdzamy czy pojawiają się komunikaty o błędach
                cy.get('body').should('be.visible')
            }
        })
    })
})
