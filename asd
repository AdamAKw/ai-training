1. Add functionality to transfer meal plan ingredients to a shopping list, considering pantry inventory
2. Fix the meal plan list display issue (it shows "create plan" message despite plans existing)
3. Update the ingredient implementation to use IDs for better identification
4. Allow adding items to shopping lists independent of meal plans (for pantry restocking)


# 1. Po wprowadzeniu zmian - zbuduj aplikację
npm run build

# 2. Uruchom serwer produkcyjny  
npm run start &

# 3. Uruchom wszystkie testy E2E
DISPLAY=:99 xvfb-run -a npm run cypress:run

# LUB wszystko jedną komendą:
npm run test:e2e