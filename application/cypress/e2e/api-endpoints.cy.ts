describe('Cooking App - API Endpoints', () => {

    describe('Recipes API', () => {
        it('should fetch recipes via API', () => {
            cy.request('/api/recipes').then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('recipes')
                expect(response.body.recipes).to.be.an('array')
            })
        })

        it('should create recipe via API', () => {
            const newRecipe = {
                name: 'Test API Recipe',
                description: 'Recipe created via API test',
                ingredients: [
                    { name: 'Test składnik', quantity: 1, unit: 'szt.' }
                ],
                instructions: ['Test instrukcja'],
                prepTime: 15,
                cookTime: 30,
                servings: 2,
                tags: ['test']
            }

            cy.request('POST', '/api/recipes', newRecipe).then((response) => {
                expect(response.status).to.eq(201)
                expect(response.body).to.have.property('recipe')
                expect(response.body.recipe.name).to.eq(newRecipe.name)
            })
        })

        it('should validate recipe data on creation', () => {
            const invalidRecipe = {
                name: '', // Invalid: empty name
                ingredients: [], // Invalid: no ingredients
                instructions: [] // Invalid: no instructions
            }

            cy.request({
                method: 'POST',
                url: '/api/recipes',
                body: invalidRecipe,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400)
                expect(response.body).to.have.property('issues')
            })
        })
    })

    describe('Pantry API', () => {
        it('should fetch pantry items via API', () => {
            cy.request('/api/pantry').then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('items')
                expect(response.body.items).to.be.an('array')
            })
        })

        it('should create pantry item via API', () => {
            const newItem = {
                name: 'Test API Item',
                quantity: 5,
                unit: 'szt.',
                category: 'test',
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }

            cy.request('POST', '/api/pantry', newItem).then((response) => {
                expect(response.status).to.eq(201)
                expect(response.body).to.have.property('item')
                expect(response.body.item.name).to.eq(newItem.name)
            })
        })
    })

    describe('Meal Plans API', () => {
        it('should fetch meal plans via API', () => {
            cy.request('/api/mealPlans').then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('mealPlans')
                expect(response.body.mealPlans).to.be.an('array')
            })
        })

        it('should create meal plan via API', () => {
            const newMealPlan = {
                name: 'Test API Meal Plan',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                meals: []
            }

            cy.request('POST', '/api/mealPlans', newMealPlan).then((response) => {
                expect(response.status).to.eq(201)
                expect(response.body).to.have.property('mealPlan')
                expect(response.body.mealPlan.name).to.eq(newMealPlan.name)
            })
        })
    })

    describe('Shopping List API', () => {
        it('should fetch shopping lists via API', () => {
            cy.request('/api/shoppingList').then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.be.an('array')
            })
        })

        it('should create shopping list via API', () => {
            const newShoppingList = {
                name: 'Test API Shopping List',
                items: [
                    {
                        ingredient: 'Test API składnik',
                        quantity: 2,
                        unit: 'kg',
                        purchased: false
                    }
                ]
            }

            cy.request('POST', '/api/shoppingList', newShoppingList).then((response) => {
                expect(response.status).to.eq(201)
                expect(response.body).to.have.property('name')
                expect(response.body.name).to.eq(newShoppingList.name)
            })
        })
    })
})
