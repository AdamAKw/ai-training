FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install MongoDB command line tools - though mongo-database-tools not available on arm64
ARG MONGO_TOOLS_VERSION=6.0
RUN . /etc/os-release \
    && curl -sSL "https://www.mongodb.org/static/pgp/server-${MONGO_TOOLS_VERSION}.asc" | gpg --dearmor > /usr/share/keyrings/mongodb-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] http://repo.mongodb.org/apt/debian ${VERSION_CODENAME}/mongodb-org/${MONGO_TOOLS_VERSION} main" | tee /etc/apt/sources.list.d/mongodb-org-${MONGO_TOOLS_VERSION}.list \
    && apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y mongodb-mongosh \
    && if [ "$(dpkg --print-architecture)" = "amd64" ]; then apt-get install -y mongodb-database-tools; fi \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Cypress system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y \
    # Core GTK libraries
    libgtk2.0-0 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    # Graphics and rendering
    libgbm-dev \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    # Audio
    libasound2 \
    libasound2-dev \
    # Notifications and UI
    libnotify-dev \
    libatk1.0-0 \
    libcairo-gobject2 \
    libpangocairo-1.0-0 \
    # Security and networking
    libnss3-dev \
    libxss1 \
    libcups2 \
    # Input and testing
    libxtst6 \
    # X11 and display
    xauth \
    xvfb \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"



