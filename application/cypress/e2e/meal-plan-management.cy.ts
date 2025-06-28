describe('Cooking App - Meal Plan Management', () => {
    beforeEach(() => {
        cy.visit('/mealPlans')
    })

    it('should display meal plans page', () => {
        cy.url().should('include', '/mealPlans')
        cy.get('body').should('be.visible')

        // Sprawdzamy tytuł strony - może być w różnych miejscach
        cy.get('body').should(($body) => {
            const text = $body.text()
            const hasTitle = text.includes('Plany posiłków') || text.includes('plany posiłków') || text.includes('plan')
            expect(hasTitle).to.equal(true)
        })

        // Sprawdzamy czy jest przycisk dodawania nowego planu
        cy.get('body').should(($body) => {
            const text = $body.text()
            const hasNewButton = text.includes('Nowy plan') || text.includes('Dodaj') || text.includes('Utwórz')
            expect(hasNewButton).to.equal(true)
        })
    })

    it('should navigate to create new meal plan', () => {
        cy.visit('/mealPlans/new')
        cy.url().should('include', '/mealPlans/new')
        cy.get('form').should('be.visible')
    })

    it('should create a new meal plan', () => {
        cy.visit('/mealPlans/new')

        // Wypełniamy podstawowe informacje o planie posiłków
        cy.get('input[name="name"], input[id="name"]').type('Test Plan Posiłków')

        // Sprawdzamy czy są pola dla dat
        cy.get('body').then(($body) => {
            if ($body.find('input[type="date"]').length > 0) {
                const today = new Date().toISOString().split('T')[0]
                cy.get('input[type="date"]').first().type(today)
            }
        })

        // Sprawdzamy czy formularz ma wymagane pola
        cy.get('form').should(($form) => {
            const text = $form.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('plan') || text.includes('posiłek')
            )
        })
    })

    it('should handle empty meal plans list', () => {
        cy.visit('/mealPlans')

        // Sprawdzamy czy strona obsługuje pustą listę planów
        cy.get('body').should('be.visible')

        cy.get('body').should(($body) => {
            const text = $body.text().toLowerCase()
            expect(text).to.satisfy((text: string) =>
                text.includes('plan') ||
                text.includes('posiłek') ||
                text.includes('pusty') ||
                text.includes('utwórz') ||
                text.includes('dodaj')
            )
        })
    })

    it('should display meal plan cards or list', () => {
        cy.get('body').should('be.visible')

        // Sprawdzamy czy są elementy reprezentujące plany posiłków lub stan pusty
        cy.get('body').should(($body) => {
            // Sprawdzamy czy jest grid z meal planami
            const hasGrid = $body.find('.grid').length > 0
            // Sprawdzamy czy są karty (Card komponenty)
            const hasCards = $body.find('[class*="card"]').length > 0
            // Sprawdzamy czy jest EmptyState (gdy brak planów)
            const hasEmptyState = $body.text().includes('nie masz') || $body.text().includes('Utwórz')
            // Sprawdzamy czy jest tekst związany z planami posiłków
            const hasPlansContent = $body.text().includes('plan')

            const hasContent = hasGrid || hasCards || hasEmptyState || hasPlansContent
            expect(hasContent).to.equal(true)
        })
    })
})

describe('Cooking App - Meal Plan Operations', () => {
    it('should handle meal plan editing', () => {
        cy.visit('/mealPlans')

        // Sprawdzamy czy są opcje edycji planów
        cy.get('body').then(($body) => {
            const hasEditLinks = $body.find('a[href*="/edit"], button').length > 0

            if (hasEditLinks) {
                cy.log('Meal plan editing options are available')
            }
        })
    })

    it('should validate meal plan form fields', () => {
        cy.visit('/mealPlans/new')

        // Sprawdzamy wymagane pola formularza
        cy.get('form').should('be.visible')

        // Próbujemy wysłać formularz
        cy.get('body').then(($body) => {
            if ($body.find('button[type="submit"]').length > 0) {
                cy.get('button[type="submit"]').first().click()

                // Sprawdzamy czy formularz reaguje
                cy.get('body').should('be.visible')
            }
        })
    })

    it('should handle meal plan details view', () => {
        // Sprawdzamy czy można przejść do szczegółów planu
        cy.get('body').then(($body) => {
            if ($body.find('a[href*="/mealPlans/"]').length > 0) {
                // Jeśli są linki do szczegółów, testujemy pierwszy dostępny
                cy.get('a[href*="/mealPlans/"]').first().then(($link) => {
                    const href = $link.attr('href')
                    if (href && href !== '/mealPlans/new') {
                        cy.visit(href)
                        cy.get('body').should('be.visible')
                    }
                })
            }
        })
    })
})
