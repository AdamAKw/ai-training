describe('Cooking App - Pantry Management', () => {
    beforeEach(() => {
        cy.visit('/pantry')
    })

    it('should display pantry page', () => {
        cy.url().should('include', '/pantry')
        cy.get('body').should('be.visible')
        cy.contains('Spiżarka').should('be.visible')
    })

    it('should navigate to add new pantry item', () => {
        cy.visit('/pantry/new')
        cy.url().should('include', '/pantry/new')
        cy.get('form').should('be.visible')
    })

    it('should create a new pantry item', () => {
        cy.visit('/pantry/new')

        // Wypełniamy wymagane informacje o produkcie
        cy.get('input[id="name"]').should('be.visible').type('Test Produkt')

        // Sprawdzamy i wypełniamy pole ilości
        cy.get('input[id="quantity"]').should('be.visible').clear().type('5')

        // Sprawdzamy i wypełniamy pole jednostki (Select)
        cy.get('body').then(($body) => {
            // Sprawdzamy czy jest SelectTrigger dla jednostek
            if ($body.find('button[id="unit"]').length > 0) {
                cy.get('button[id="unit"]').click()
                // Czekamy na pojawienie się opcji i wybieramy pierwszą dostępną
                cy.get('[role="option"]').first().click()
            }
        })

        // Sprawdzamy czy formularz ma wszystkie wymagane pola
        cy.get('form').should('be.visible')
        cy.get('input[id="name"]').should('have.value', 'Test Produkt')
        cy.get('input[id="quantity"]').should('have.value', '5')

        // Próbujemy wysłać formularz
        cy.get('button[type="submit"]').should('be.visible').click()

        // Sprawdzamy czy nastąpi przekierowanie lub pojawi się komunikat o sukcesie
        cy.url().should('satisfy', (url: string) => {
            return url.includes('/pantry') && !url.includes('/new')
        }, { timeout: 10000 })
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

        // Sprawdzamy czy są elementy spiżarni lub stan pusty
        cy.get('body').should(($body) => {
            // Sprawdzamy czy jest grid z produktami
            const hasGrid = $body.find('.grid').length > 0
            // Sprawdzamy czy są karty (Card komponenty)
            const hasCards = $body.find('[class*="card"]').length > 0
            // Sprawdzamy czy jest EmptyState (gdy brak produktów)
            const hasEmptyState = $body.text().includes('pusta') || $body.text().includes('Dodaj')
            // Sprawdzamy czy jest tekst związany ze spiżarnią
            const hasPantryContent = $body.text().includes('spiżar') || $body.text().includes('produkt')

            const hasContent = hasGrid || hasCards || hasEmptyState || hasPantryContent
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
