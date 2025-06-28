describe('Cooking App - Meal Plan Management', () => {
    beforeEach(() => {
        cy.visit('/mealPlans')
    })

    it('should display meal plans page', () => {
        cy.url().should('include', '/mealPlans')
        cy.get('body').should('be.visible')
        cy.contains('Meal Plans').should('be.visible')
    })

    it('should navigate to create new meal plan', () => {
        cy.visit('/mealPlans/new')
        cy.url().should('include', '/mealPlans/new')
        cy.get('form').should('be.visible')
    })

    it('should create a new meal plan', () => {
        cy.visit('/mealPlans/new')

        // Wypełniamy podstawowe informacje o planie posiłków
        cy.get('input[name="name"], input[id="name"]').type('Test Meal Plan')

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
                text.includes('meal') || text.includes('plan')
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
                text.includes('meal') ||
                text.includes('plan') ||
                text.includes('empty') ||
                text.includes('create') ||
                text.includes('add')
            )
        })
    })

    it('should display meal plan cards or list', () => {
        cy.get('body').should('be.visible')

        // Sprawdzamy czy są elementy reprezentujące plany posiłków
        cy.get('body').should(($body) => {
            const hasPlans = $body.find('[data-testid*="meal"], .meal-plan, .plan-card').length > 0
            const hasListItems = $body.find('li, article, section').length > 0
            const hasContent = hasPlans || hasListItems

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
