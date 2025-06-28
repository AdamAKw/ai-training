# Testowanie E2E z Cypress - Przewodnik kompletny

## 🎯 Przegląd

Projekt został skonfigurowany z **Cypress** - nowoczesnym frameworkiem do testów end-to-end (E2E). Cypress symuluje zachowanie użytkownika w przeglądarce i sprawdza funkcjonalność całej aplikacji.

## 📁 Struktura testów

```
cypress/
├── e2e/                    # Testy end-to-end
│   ├── homepage.cy.ts      # Testy strony głównej ✅
│   ├── recipes.cy.ts       # Testy zarządzania przepisami ✅
│   ├── app-flow.cy.ts      # Testy poszczególnych sekcji ✅
│   └── integration.cy.ts   # Testy integracyjne całej aplikacji ⚠️
├── fixtures/               # Dane testowe
│   └── testData.json       # Przykładowe dane
├── support/                # Pliki wsparcia
│   ├── commands.ts         # Niestandardowe komendy
│   └── e2e.ts             # Konfiguracja globalna
└── cypress.config.ts       # Główna konfiguracja Cypress
```

## 🚀 Szybki start

### Uruchamianie testów

```bash
# Uruchom wszystkie testy E2E w trybie headless (bez GUI)
npm run cypress:run

# Automatycznie uruchom serwer dev i testy
npm run test:e2e

# Testy w środowisku kontenera (VSCode)
DISPLAY=:99 xvfb-run -a -s "-screen 0 1280x720x24" npm run cypress:run

# Uruchom konkretny test
DISPLAY=:99 xvfb-run -a npx cypress run --spec "cypress/e2e/homepage.cy.ts"
```

### Zadania VS Code (Ctrl+Shift+P → "Tasks: Run Task")

- **Run E2E Tests with Server** - Automatycznie uruchamia serwer i wszystkie testy
- **Start Development Server** - Uruchamia serwer deweloperski w tle
- **Build and Start Production** - Buduje i uruchamia wersję produkcyjną

## 📊 Status testów

| Test Suite          | Status     | Testy                                                   | Opis |
| ------------------- | ---------- | ------------------------------------------------------- | ---- |
| `homepage.cy.ts`    | ✅ **6/6** | Podstawowa nawigacja, ładowanie strony głównej          |
| `app-flow.cy.ts`    | ✅ **7/7** | Testy poszczególnych sekcji aplikacji                   |
| `recipes.cy.ts`     | ✅ **5/5** | Zarządzanie przepisami, formularze                      |
| `integration.cy.ts` | ⚠️ **2/3** | Pełny przepływ użytkownika (jeden test wymaga poprawki) |

**Łącznie: 20/21 testów przechodzi pomyślnie (95% success rate)**

## 🛠️ Workflow dla agenta AI

### 1. Automatyczne testowanie po zmianach

Po wprowadzeniu zmian w kodzie:

```bash
# Krok 1: Zbuduj aplikację
npm run build

# Krok 2: Uruchom serwer produkcyjny w tle
npm run start &

# Krok 3: Uruchom testy E2E
DISPLAY=:99 xvfb-run -a npm run cypress:run

# Lub wszystko razem:
npm run test:e2e
```

### 2. Sprawdzanie aplikacji w przeglądarce

```bash
# Uruchom serwer deweloperski
npm run dev

# Otwórz w przeglądarce (localhost:3000)
curl -I http://localhost:3000  # sprawdź status
```

### 3. Podgląd w VS Code

Po uruchomieniu serwera, można użyć VS Code Simple Browser lub Port Forwarding.

## 📝 Pisanie testów

### Podstawowy przykład testu

```typescript
describe("Nazwa grupy testów", () => {
  beforeEach(() => {
    // Wykonywane przed każdym testem
    cy.visit("/");
  });

  it("powinien sprawdzić konkretną funkcjonalność", () => {
    // Sprawdź czy element jest widoczny
    cy.contains("Przepisy").should("be.visible");

    // Kliknij element
    cy.contains("Przepisy").click();

    // Sprawdź URL
    cy.url().should("include", "/recipes");

    // Wprowadź tekst do pola
    cy.get('input[name="search"]').type("kurczak");

    // Sprawdź zawartość
    cy.get("body").should("contain", "kurczak");
  });
});
```

### Niestandardowe komendy

```typescript
// Już dostępne w projekcie:
cy.dataCy("element-id"); // Wybierz element po data-cy
cy.login("email", "pass"); // Zaloguj się (gdy dodasz autoryzację)
```

### Dodawanie atrybutów testowych

```jsx
// Dobra praktyka - dodaj data-cy do ważnych elementów
<button data-cy="save-recipe-button">Zapisz przepis</button>
<input data-cy="recipe-name-input" placeholder="Nazwa przepisu" />

// Użycie w testach
cy.dataCy('save-recipe-button').click()
cy.dataCy('recipe-name-input').type('Nowy przepis')
```

## 🔧 Najlepsze praktyki

### 1. Struktura testów

- **Grupuj** podobne testy w `describe` blocks
- **Używaj opisowych nazw** testów
- **Jeden test = jedna funkcjonalność**

### 2. Selektory (od najlepszych)

1. ✅ `data-cy` atrybuty
2. ✅ `data-testid` atrybuty
3. ❌ Selektory CSS opartych na klasach/ID

### 3. Oczekiwania (assertions)

```typescript
// ✅ Dobre praktyki
cy.get("[data-cy=element]").should("be.visible");
cy.url().should("include", "/recipes");
cy.contains("Przepisy").should("exist");

// ✅ Sprawdzenie wielu warunków
cy.get("[data-cy=form]").should("be.visible").and("contain", "Nazwa");
```

### 4. Czekanie na elementy

```typescript
// ✅ Cypress automatycznie czeka
cy.get("[data-cy=loading]").should("not.exist");
cy.get("[data-cy=content]").should("be.visible");

// ❌ Unikaj explicit wait
cy.wait(1000); // tylko w wyjątkowych przypadkach
```

## 🐛 Debugowanie testów

### 1. Sprawdzanie błędów

```typescript
// Screenshots i wideo są automatycznie tworzone przy błędach
// Lokalizacja: cypress/screenshots/ i cypress/videos/
```

### 2. Komendy debugowania

```typescript
// Zatrzymaj i otwórz debugger
cy.debug();

// Zapisz stan do konsoli
cy.get("[data-cy=element]").debug();

// Pauza w wykonaniu
cy.pause();
```

### 3. Sprawdzanie logów

```bash
# Uruchom z dodatkowymi logami
ELECTRON_ENABLE_LOGGING=1 npm run cypress:run
```

## ⚙️ Konfiguracja

### Zmiana ustawień testów

Edytuj `cypress.config.ts`:

```typescript
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // URL aplikacji
    viewportWidth: 1280, // Szerokość okna
    viewportHeight: 720, // Wysokość okna
    defaultCommandTimeout: 10000, // Timeout dla komend
    video: true, // Nagrywanie wideo
    screenshotOnRunFailure: true, // Screenshots przy błędach
  },
});
```

### Zmienne środowiskowe

```typescript
// cypress.config.ts
env: {
  API_URL: 'http://localhost:3000/api',
  TEST_USER_EMAIL: 'test@example.com'
}

// Użycie w testach
cy.visit(Cypress.env('API_URL'))
```

## 🔄 Integracja z CI/CD

```bash
# Dla automatyzacji w CI/CD
npm run cypress:run:headless

# Z dodatkowymi opcjami
npx cypress run --browser chrome --headless --record
```

## 📋 Przykładowe scenariusze testowe

### 1. Test pełnego przepływu użytkownika

```typescript
it("powinien umożliwić zarządzanie przepisami", () => {
  // 1. Idź do przepisów
  cy.visit("/recipes");

  // 2. Kliknij "Dodaj przepis"
  cy.dataCy("add-recipe-button").click();

  // 3. Wypełnij formularz
  cy.dataCy("recipe-name").type("Testowy przepis");
  cy.dataCy("recipe-ingredients").type("Składnik 1, Składnik 2");

  // 4. Zapisz
  cy.dataCy("save-button").click();

  // 5. Sprawdź rezultat
  cy.url().should("include", "/recipes");
  cy.contains("Testowy przepis").should("be.visible");
});
```

### 2. Test responsywności

```typescript
it("powinien działać na urządzeniach mobilnych", () => {
  cy.viewport("iphone-6");
  cy.visit("/");

  // Test nawigacji mobilnej
  cy.dataCy("mobile-menu-button").click();
  cy.dataCy("mobile-menu").should("be.visible");
});
```

### 3. Test obsługi błędów

```typescript
it("powinien obsłużyć błędne dane", () => {
  cy.visit("/recipes/new");

  // Próba zapisu pustego formularza
  cy.dataCy("save-button").click();

  // Sprawdź komunikaty błędów
  cy.contains("Nazwa przepisu jest wymagana").should("be.visible");
});
```

## 🚨 Rozwiązywanie problemów

### Częste problemy

1. **Test nie może znaleźć elementu**

   ```bash
   # Sprawdź czy element faktycznie istnieje
   # Dodaj data-cy atrybuty
   # Sprawdź czy strona została załadowana
   ```

2. **Test jest niestabilny**

   ```bash
   # Użyj should() zamiast wait()
   # Sprawdź czy test nie zależy od innych testów
   # Dodaj właściwe asercje
   ```

3. **Długie czasy wykonania**

   ```bash
   # Zwiększ timeouty w konfiguracji
   # Optymalizuj selektory
   # Usuń niepotrzebne wait()
   ```

4. **Błędy w środowisku kontenerowym**
   ```bash
   # Używaj DISPLAY=:99 xvfb-run dla testów headless
   # Sprawdź czy wszystkie zależności systemowe są zainstalowane
   ```

## 📚 Przydatne linki

- [Dokumentacja Cypress](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)
- [Real World App (przykłady)](https://github.com/cypress-io/cypress-realworld-app)

---

## 📋 Checklist dla agenta

Po wprowadzeniu zmian w aplikacji:

- [ ] Uruchom `npm run build`
- [ ] Uruchom `npm run start` w tle
- [ ] Wykonaj `npm run test:e2e` lub ręcznie testy Cypress
- [ ] Sprawdź rezultat w przeglądarce `http://localhost:3000`
- [ ] Przeanalizuj wyniki testów (screenshots/video przy błędach)
- [ ] W razie błędów - popraw kod i powtórz proces

**Status konfiguracji: ✅ GOTOWE - Cypress skonfigurowany i działający**
