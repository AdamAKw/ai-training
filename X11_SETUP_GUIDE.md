# X11 Forwarding Setup Guide

## Instrukcje konfiguracji X11 forwarding dla Cypress GUI

### 🖥️ **Linux Host**

1. **Przygotowanie hosta:**

   ```bash
   # Uruchom skrypt konfiguracyjny
   ./setup-x11.sh

   # Lub skonfiguruj ręcznie:
   xhost +local:
   export DISPLAY=:0
   ```

2. **Rebuild devcontainer:**

   - Otwórz Command Palette (`Ctrl+Shift+P`)
   - Wybierz "Dev Containers: Rebuild Container"

3. **Test X11:**

   ```bash
   npm run x11:test    # Sprawdź DISPLAY i xauth
   npm run x11:apps    # Test z xclock
   ```

4. **Uruchom Cypress GUI:**
   ```bash
   npm run cypress:open      # Samo Cypress
   npm run test:gui         # Dev server + Cypress
   ```

### 🍎 **macOS Host**

1. **Zainstaluj XQuartz:**

   ```bash
   # Via Homebrew
   brew install --cask xquartz

   # Lub pobierz z: https://www.xquartz.org/
   ```

2. **Konfiguracja XQuartz:**

   - Uruchom XQuartz
   - Preferences → Security
   - ✅ "Allow connections from network clients"

3. **Przygotowanie hosta:**

   ```bash
   ./setup-x11.sh
   ```

4. **Aktualizuj docker-compose.yml:**
   ```yaml
   environment:
     - DISPLAY=host.docker.internal:0
   ```

### 🐧 **WSL2 (Windows)**

1. **Zainstaluj X Server na Windows:**

   - VcXsrv lub X410

2. **Konfiguracja WSL:**
   ```bash
   export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2; exit;}'):0.0
   ```

## 📋 **Dostępne komendy**

### GUI Cypress:

```bash
npm run cypress:open         # Otwórz Cypress GUI
npm run cypress:open:desktop # Z jawnym DISPLAY
npm run test:gui            # Dev server + Cypress GUI
```

### Headless Cypress:

```bash
npm run test:e2e            # Standardowe testy E2E
npm run cypress:run         # Headless Cypress
```

### Narzędzia X11:

```bash
npm run x11:test           # Test połączenia X11
npm run x11:apps           # Uruchom xclock (test GUI)
```

## 🔧 **Troubleshooting**

### Problem: "cannot connect to X server"

```bash
# Sprawdź DISPLAY
echo $DISPLAY

# Sprawdź uprawnienia
xauth list

# Reset uprawnień (na hoście)
xhost +local:
```

### Problem: "No protocol specified"

```bash
# Sprawdź właściciela .Xauthority
ls -la ~/.Xauthority

# Popraw uprawnienia
chmod 600 ~/.Xauthority
```

### Problem: Cypress nie otwiera się

```bash
# Test podstawowej aplikacji GUI
npm run x11:apps

# Sprawdź logi Cypress
DISPLAY=$DISPLAY cypress open --verbose
```

## 🎯 **Workflow dla agenta**

### Automatyczny workflow:

```bash
# 1. Zbuduj aplikację
npm run build

# 2. Uruchom testy headless
npm run test:e2e

# 3. W razie problemów - otwórz GUI
npm run test:gui
```

### Debugowanie:

```bash
# Start serwera w tle
npm run dev &

# Otwórz Cypress GUI
npm run cypress:open

# Debug konkretnego testu
npx cypress run --spec "cypress/e2e/specific-test.cy.ts" --headed
```

## 📝 **Uwagi**

- GUI działa tylko gdy host ma działający X server
- W środowisku CI używaj `npm run test:e2e` (headless)
- macOS wymaga XQuartz
- Windows wymaga WSL2 + X server
