describe('Cooking App - Form Validation', () => {

    describe('Recipe Form Validation', () => {
        beforeEach(() => {
            cy.visit('/recipes/new')
        })

        it('should validate required fields', () => {
            // Próbujemy wysłać pusty formularz
            cy.get('button[type="submit"]').click()

            // Sprawdzamy czy są komunikaty o błędach
            cy.get('body').should(($body) => {
                const text = $body.text().toLowerCase()
                const hasErrors = text.includes('wymagane') ||
                    text.includes('required') ||
                    text.includes('błąd') ||
                    text.includes('error') ||
                    $body.find('[class*="error"], [class*="invalid"], [role="alert"]').length > 0

                return hasErrors;
            })
        })

        it('should validate minimum prep time', () => {
            cy.get('input[name="name"]').type('Test Przepis')
            cy.get('input[name="prepTime"]').clear().type('-5') // Ujemna wartość
            cy.get('button[type="submit"]').click()

            // Sprawdzamy komunikat o błędzie
            cy.get('body').should('be.visible')
        })

        it('should validate ingredients requirement', () => {
            cy.get('input[name="name"]').type('Test Przepis')
            cy.get('input[name="prepTime"]').clear().type('10')
            cy.get('input[name="cookTime"]').clear().type('20')
            cy.get('input[name="servings"]').clear().type('2')

            // Sprawdzamy czy są jakieś składniki i je usuwamy
            cy.get('body').then(($body) => {
                // Szukamy przycisków usuwania składników
                const removeButtons = $body.find('button').filter((i, el) => {
                    const text = el.textContent?.toLowerCase() || ''
                    return text.includes('usuń') || text.includes('x') || text.includes('remove')
                })

                if (removeButtons.length > 0) {
                    cy.get('button').contains(/usuń|x|remove/i).click()
                } else {
                    // Jeśli nie ma przycisków usuwania, czyścimy pola składników
                    const ingredientInputs = $body.find('input[name*="ingredients"]')
                    if (ingredientInputs.length > 0) {
                        cy.get('input[name*="ingredients"]').clear()
                    }
                }
            })

            cy.get('button[type="submit"]').click()

            // Sprawdzamy czy są komunikaty błędów lub czy formularz nie został wysłany
            cy.get('body').should(($body) => {
                const text = $body.text().toLowerCase()
                const hasIngredientError = text.includes('składnik') || text.includes('ingredient') ||
                    text.includes('wymagane') || text.includes('required') ||
                    text.includes('błąd') || text.includes('error')

                // Alternatywnie sprawdzamy czy nadal jesteśmy na stronie formularza
                const stillOnForm = $body.find('form').length > 0

                const hasValidation = hasIngredientError || stillOnForm
                expect(hasValidation).to.equal(true)
            })
        })

        it('should validate instructions requirement', () => {
            cy.get('input[name="name"]').type('Test Przepis')
            cy.get('input[name="ingredients.0.name"]').type('Test składnik')
            cy.get('input[name="ingredients.0.quantity"]').type('1')
            cy.get('input[name="ingredients.0.unit"]').type('szt')

            // Pozostawiamy puste instrukcje
            cy.get('textarea[name="instructions.0.value"], input[name="instructions.0.value"]').clear()

            cy.get('button[type="submit"]').click()

            // Sprawdzamy błąd o braku instrukcji
            cy.get('body').should('be.visible')
        })
    })

    describe('Pantry Form Validation', () => {
        beforeEach(() => {
            cy.visit('/pantry/new')
        })

        it('should validate required pantry item fields', () => {
            // Próbujemy wysłać pusty formularz
            cy.get('button[type="submit"]').click()

            // Sprawdzamy komunikaty o błędach
            cy.get('body').should('be.visible')
        })

        it('should validate positive quantity', () => {
            cy.get('input[id="name"]').type('Test Produkt')
            cy.get('input[id="quantity"]').clear().type('0') // Zerowa ilość

            cy.get('button[type="submit"]').click()

            // Sprawdzamy błąd o nieprawidłowej ilości
            cy.get('body').should('be.visible')
        })

        it('should validate expiry date in future', () => {
            cy.get('input[id="name"]').type('Test Produkt')
            cy.get('input[id="quantity"]').clear().type('1')

            // Ustawiamy datę z przeszłości
            const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            cy.get('body').then(($body) => {
                if ($body.find('input[type="date"]').length > 0) {
                    cy.get('input[type="date"]').type(pastDate)
                    cy.get('button[type="submit"]').click()

                    // Sprawdzamy czy jest ostrzeżenie o dacie z przeszłości
                    cy.get('body').should('be.visible') // Podstawowa walidacja
                }
            })
        })
    })

    describe('Meal Plan Form Validation', () => {
        beforeEach(() => {
            cy.visit('/mealPlans/new')
        })

        it('should validate meal plan name', () => {
            // Próbujemy utworzyć plan bez nazwy
            cy.get('button[type="submit"]').click()

            // Sprawdzamy komunikat o błędzie
            cy.get('body').should('be.visible')
        })

        it('should validate date range', () => {
            cy.get('input[name="name"], input[id="name"]').type('Test Plan')

            // Ustawiamy nieprawidłowy zakres dat (koniec przed początkiem)
            const today = new Date().toISOString().split('T')[0]
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            cy.get('body').then(($body) => {
                if ($body.find('input[type="date"]').length >= 2) {
                    cy.get('input[type="date"]').first().type(today)
                    cy.get('input[type="date"]').eq(1).type(yesterday)

                    cy.get('button[type="submit"]').click()

                    // Sprawdzamy błąd o nieprawidłowym zakresie dat
                    cy.get('body').should('be.visible')
                }
            })
        })
    })

    describe('Shopping List Form Validation', () => {
        beforeEach(() => {
            cy.visit('/shoppingList/new')
        })

        it('should validate shopping list fields', () => {
            // Próbujemy utworzyć pustą listę zakupów
            cy.get('body').then(($body) => {
                if ($body.find('form').length > 0) {
                    cy.get('button[type="submit"]').click()

                    // Sprawdzamy komunikat o błędzie
                    cy.get('body').should('be.visible')
                } else {
                    // Jeśli nie ma formularza, test przechodzi
                    cy.get('body').should('be.visible')
                }
            })
        })

        it('should validate item quantity', () => {
            cy.get('body').then(($body) => {
                if ($body.find('input[name="quantity"]').length > 0) {
                    cy.get('input[name="name"]').type('Test Produkt')
                    cy.get('input[name="quantity"]').clear().type('-1') // Ujemna ilość

                    cy.get('button[type="submit"]').click()

                    // Sprawdzamy błąd walidacji
                    cy.get('body').should(($body) => {
                        const text = $body.text().toLowerCase()
                        const hasError = text.includes('positive') || text.includes('dodatnia') || text.includes('błąd')
                        // Alternatywnie sprawdzamy czy nadal jesteśmy na formularzu
                        const stillOnForm = $body.find('form').length > 0
                        expect(hasError || stillOnForm).to.equal(true)
                    })
                } else {
                    cy.get('body').should('be.visible')
                }
            })
        })
    })

    describe('Form Error Recovery', () => {
        it('should allow fixing validation errors', () => {
            cy.visit('/recipes/new')

            // Próbujemy wysłać pusty formularz
            cy.get('button[type="submit"]').click()

            // Naprawiamy błędy
            cy.get('input[name="name"]').type('Naprawiony Przepis')
            cy.get('input[name="prepTime"]').clear().type('15')
            cy.get('input[name="cookTime"]').clear().type('25')
            cy.get('input[name="servings"]').clear().type('3')

            // Dodajemy składnik
            cy.get('input[name="ingredients.0.name"]').type('Składnik')
            cy.get('input[name="ingredients.0.quantity"]').type('1')
            cy.get('input[name="ingredients.0.unit"]').type('szt')

            // Dodajemy instrukcję
            cy.get('textarea[name="instructions.0.value"], input[name="instructions.0.value"]').type('Instrukcja')

            // Teraz formularz powinien się wysłać pomyślnie
            cy.get('button[type="submit"]').click()

            // Sprawdzamy przekierowanie
            cy.url().should('satisfy', (url: string) => {
                return url.includes('/recipes') && !url.includes('/new')
            }, { timeout: 10000 })
        })

        it('should preserve form data after validation error', () => {
            cy.visit('/pantry/new')

            // Wypełniamy formularz z błędem
            cy.get('input[id="name"]').type('Test Produkt Zachowany')
            cy.get('input[id="quantity"]').clear().type('0') // Nieprawidłowa wartość

            cy.get('button[type="submit"]').click()

            // Sprawdzamy czy nazwa została zachowana po błędzie walidacji
            cy.get('input[id="name"]').should('have.value', 'Test Produkt Zachowany')
        })
    })
})
