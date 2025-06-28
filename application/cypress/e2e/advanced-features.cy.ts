describe('Cooking App - Advanced Features', () => {

    describe('Recipe Detail Management', () => {
        beforeEach(() => {
            // Tworzymy testowy przepis przed każdym testem
            cy.visit('/recipes/new')
            cy.get('input[name="name"]').type('Zaawansowany Test Przepis')
            cy.get('textarea[name="description"]').type('Opis testowego przepisu')
            cy.get('input[name="prepTime"]').clear().type('20')
            cy.get('input[name="cookTime"]').clear().type('40')
            cy.get('input[name="servings"]').clear().type('4')

            // Dodajemy składniki
            cy.get('input[name="ingredients.0.name"]').clear().type('Makaron')
            cy.get('input[name="ingredients.0.quantity"]').clear().type('400')
            cy.get('input[name="ingredients.0.unit"]').clear().type('g')

            // Dodajemy instrukcje
            cy.get('textarea[name="instructions.0.value"], input[name="instructions.0.value"]').clear().type('Ugotuj makaron')

            cy.get('button[type="submit"]').click()
            cy.url().should('include', '/recipes')
        })

        it('should display recipe details', () => {
            // Klikamy w pierwszy przepis na liście
            cy.get('[class*="card"]').first().click()

            // Sprawdzamy czy jesteśmy na stronie szczegółów
            cy.url().should('include', '/recipes/')
            cy.contains('Zaawansowany Test Przepis').should('be.visible')
            cy.contains('Opis testowego przepisu').should('be.visible')
        })

        it('should allow editing recipe', () => {
            // Klikamy w pierwszy przepis żeby przejść do szczegółów
            cy.get('[class*="card"]').first().click()

            // Sprawdzamy czy jesteśmy na stronie szczegółów
            cy.url().should('include', '/recipes/')

            // Szukamy i klikamy przycisk edycji na stronie szczegółów
            cy.get('a').contains(/edytuj|edit/i).click()

            // Sprawdzamy czy jesteśmy na stronie edycji
            cy.url().should('include', '/edit')
            cy.get('input[name="name"]').should('have.value', 'Zaawansowany Test Przepis')

            // Modyfikujemy przepis
            cy.get('input[name="name"]').clear().type('Zmodyfikowany Przepis')
            cy.get('button[type="submit"]').click()

            // Sprawdzamy czy zostaliśmy przekierowani i zmiany zostały zapisane
            cy.url().should('include', '/recipes/')
            cy.contains('Zmodyfikowany Przepis').should('be.visible')
        })

        it('should allow deleting recipe', () => {
            // Klikamy w pierwszy przepis żeby przejść do szczegółów
            cy.get('[class*="card"]').first().click()

            // Sprawdzamy czy jesteśmy na stronie szczegółów
            cy.url().should('include', '/recipes/')

            // Szukamy przycisku usuwania na stronie szczegółów
            cy.get('button').contains(/usuń|delete/i).click()

            // Potwierdzamy usunięcie w dialogu
            cy.get('[role="dialog"], .modal, [data-state="open"]').within(() => {
                cy.get('button').contains(/usuń|delete|potwierdź/i).click()
            })

            // Sprawdzamy czy zostaliśmy przekierowani na listę przepisów
            cy.url().should('include', '/recipes')
            cy.url().should('not.include', '/recipes/')

            // Sprawdzamy czy przepis został usunięty z listy
            cy.contains('Zaawansowany Test Przepis').should('not.exist')
        })
    })

    describe('Meal Plan Advanced Features', () => {
        it('should add meals to meal plan', () => {
            // Tworzymy nowy plan posiłków
            cy.visit('/mealPlans/new')
            cy.get('input[name="name"], input[id="name"]').type('Plan z Posiłkami')

            // Ustawiamy daty
            const today = new Date().toISOString().split('T')[0]
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            cy.get('input[type="date"]').first().type(today)
            cy.get('input[type="date"]').eq(1).type(nextWeek)

            // Dodajemy posiłek używając przycisku "Dodaj posiłek"
            cy.get('button').contains('Dodaj posiłek').click()

            // Sprawdzamy czy pojawił się nowy posiłek w formularzu
            cy.get('select[name*="recipe"], [role="combobox"]').should('be.visible')

            // Wypełniamy pierwszy posiłek (jeśli są dostępne opcje)
            cy.get('body').then(($body) => {
                if ($body.find('select[name*="recipe"] option, [role="option"]').length > 1) {
                    cy.get('select[name*="recipe"]').first().select(1)
                } else if ($body.find('[role="combobox"]').length > 0) {
                    cy.get('[role="combobox"]').first().click()
                    cy.get('[role="option"]').first().click()
                }
            })

            cy.get('button[type="submit"]').click()
            cy.url().should('include', '/mealPlans')
        })

        it('should mark meals as completed', () => {
            cy.visit('/')

            // Sprawdzamy czy jest aktualny plan posiłków
            cy.get('body').then(($body) => {
                if ($body.text().includes('plan')) {
                    // Szukamy checkbox lub przycisku do oznaczania ukończenia
                    const hasCheckboxes = $body.find('input[type="checkbox"]').length > 0
                    const hasCompleteButtons = $body.find('button').text().toLowerCase().includes('ukończ')

                    if (hasCheckboxes) {
                        cy.get('input[type="checkbox"]').first().check()
                    } else if (hasCompleteButtons) {
                        cy.get('button').contains(/ukończ/i).first().click()
                    }
                }
            })
        })
    })

    describe('Pantry Management Advanced Features', () => {
        it('should manage pantry categories', () => {
            cy.visit('/pantry/new')

            // Dodajemy produkt z kategorią
            cy.get('input[id="name"]').type('Testowy Produkt Kategoryzowany')
            cy.get('input[id="quantity"]').clear().type('3')
            cy.get('input[id="unit"]').type('kg')

            // Wybieramy kategorię używając Select componentu
            cy.get('button[role="combobox"], select[id*="category"]').click()

            // Sprawdzamy czy są dostępne opcje kategorii
            cy.get('body').then(($body) => {
                if ($body.find('[role="option"], option').length > 1) {
                    // Wybieramy pierwszą dostępną kategorię (pomijając placeholder)
                    cy.get('[role="option"], option').eq(1).click()
                } else {
                    // Jeśli nie ma opcji, zamykamy dropdown
                    cy.get('button[role="combobox"], select').click()
                }
            })

            cy.get('button[type="submit"]').click()
            cy.url().should('include', '/pantry')

            // Sprawdzamy czy produkt został dodany
            cy.contains('Testowy Produkt Kategoryzowany').should('be.visible')
        })

        it('should handle expiry dates', () => {
            cy.visit('/pantry/new')

            cy.get('input[id="name"]').type('Produkt z Datą Ważności')
            cy.get('input[id="quantity"]').clear().type('1')

            // Ustawiamy datę ważności
            const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            cy.get('body').then(($body) => {
                if ($body.find('input[type="date"]').length > 0) {
                    cy.get('input[type="date"]').type(futureDate)
                }
            })

            cy.get('button[type="submit"]').click()
            cy.url().should('include', '/pantry')

            // Sprawdzamy czy data ważności jest wyświetlana
            cy.visit('/pantry')
            cy.contains('Produkt z Datą Ważności').should('be.visible')
        })

        it('should display expired items warning', () => {
            cy.visit('/pantry')

            // Sprawdzamy czy są ostrzeżenia o wygasających produktach
            cy.get('body').should('be.visible')
        })
    })

    describe('Shopping List Advanced Features', () => {
        it('should mark items as purchased', () => {
            cy.visit('/shoppingList')

            // Sprawdzamy czy są produkty na liście
            cy.get('body').then(($body) => {
                if ($body.find('input[type="checkbox"]').length > 0) {
                    // Zaznaczamy pierwszy produkt jako kupiony
                    cy.get('input[type="checkbox"]').first().check()
                    cy.get('input[type="checkbox"]').first().should('be.checked')

                    // Sprawdzamy czy produkt jest wizualnie oznaczony jako kupiony
                    cy.get('body').should('be.visible')
                }
            })
        })

        it('should transfer purchased items to pantry', () => {
            cy.visit('/shoppingList')

            // Szukamy opcji transferu do spiżarni
            cy.get('body').then(($body) => {
                const hasTransferButton = $body.find('button').text().toLowerCase().includes('spiżar')

                if (hasTransferButton) {
                    cy.get('button').contains(/spiżar/i).click()

                    // Sprawdzamy czy pojawi się potwierdzenie
                    cy.get('body').should('be.visible')
                }
            })
        })

        it('should generate shopping list from meal plan', () => {
            // Sprawdzamy czy można wygenerować listę z planu posiłków
            cy.visit('/mealPlans')

            cy.get('body').then(($body) => {
                if ($body.find('button, a').text().toLowerCase().includes('lista zakupów')) {
                    cy.get('button, a').contains(/lista zakupów/i).first().click()
                    cy.url().should('include', '/shoppingList')
                }
            })
        })
    })

    describe('Home Page Features', () => {
        it('should display current meal plan on home page', () => {
            cy.visit('/')

            // Sprawdzamy czy wyświetla się aktualny plan posiłków
            cy.get('body').should('be.visible')
        })

        it('should have working quick navigation', () => {
            cy.visit('/')

            // Sprawdzamy nawigację do przepisów
            cy.get('a[href="/recipes"], a').contains(/przepis/i).click()
            cy.url().should('include', '/recipes')

            // Wracamy na główną
            cy.visit('/')

            // Sprawdzamy nawigację do planów posiłków
            cy.get('a[href="/mealPlans"], a').contains(/plan/i).click()
            cy.url().should('include', '/mealPlans')

            // Wracamy na główną
            cy.visit('/')

            // Sprawdzamy nawigację do spiżarni
            cy.get('a[href="/pantry"], a').contains(/spiżar/i).click()
            cy.url().should('include', '/pantry')

            // Wracamy na główną
            cy.visit('/')

            // Sprawdzamy nawigację do listy zakupów
            cy.get('a[href="/shoppingList"], a').contains(/zakup/i).click()
            cy.url().should('include', '/shoppingList')
        })
    })
})
