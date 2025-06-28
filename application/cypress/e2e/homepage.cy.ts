describe('Cooking App - Home Page', () => {
    beforeEach(() => {
        // Odwiedzamy stronę główną przed każdym testem
        cy.visit('/')
    })

    it('should load the homepage successfully', () => {
        // Sprawdzamy czy strona się załadowała
        cy.get('body').should('be.visible')

        // Sprawdzamy czy tytuł strony jest poprawny
        cy.title().should('include', 'Cooking')
    })

    it('should display navigation menu', () => {
        // Sprawdzamy czy główne elementy nawigacji są widoczne - używamy angielskich nazw
        cy.contains('Recipes').should('be.visible')
        cy.contains('Meal Plans').should('be.visible')
        cy.contains('Pantry').should('be.visible')
        cy.contains('Shopping List').should('be.visible')
    })

    it('should navigate to recipes page', () => {
        // Klikamy link do przepisów
        cy.contains('Recipes').click()

        // Sprawdzamy czy jesteśmy na stronie przepisów
        cy.url().should('include', '/recipes')
        cy.contains('Recipes').should('be.visible')
    })

    it('should navigate to meal plans page', () => {
        // Klikamy link do planów posiłków
        cy.contains('Meal Plans').click()

        // Sprawdzamy czy jesteśmy na stronie planów posiłków
        cy.url().should('include', '/mealPlans')
    })

    it('should navigate to pantry page', () => {
        // Klikamy link do spiżarni
        cy.contains('Pantry').click()

        // Sprawdzamy czy jesteśmy na stronie spiżarni
        cy.url().should('include', '/pantry')
    })

    it('should navigate to shopping list page', () => {
        // Klikamy link do listy zakupów
        cy.contains('Shopping List').click()

        // Sprawdzamy czy jesteśmy na stronie listy zakupów
        cy.url().should('include', '/shoppingList')
    })
})
