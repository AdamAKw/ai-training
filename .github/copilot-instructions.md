# Project Context: Cooking App

## 1. High-Level Overview

**Project Name:** Cooking

**Core Purpose:** This application is designed to simplify meal planning. It helps users create meal plans for specific time blocks, generates a corresponding shopping list that accounts for items already in the pantry, and includes a meal-prep feature to optimize and minimize time spent in the kitchen.

**Key Users/Actors:**
- **Primary User:** Individuals who want to better manage their meal plans, save time, and reduce money spent on cooking and food waste.

## 2. Core Functionality & Workflows

**Main Features (User Stories):**
- As a user, I want to be able to add, edit, and delete recipes in my recipe catalog.
- As a user, I want to be able to create meal plans for different time periods using my defined recipes.
- As a user, I want to be able to add and remove items in the pantry so that this is reflected in the shopping list.
- As a user, I expect that items from a completed shopping list will be automatically moved to the pantry.


## 3. Tech Stack & Architecture

- **Languages & Frameworks:** React, TypeScript, Next.js, shadcn/ui.
- **Database:** MongoDB.
- **Architecture:** A monolithic application built with Next.js. Backend logic is handled within Next.js using Server Components and Server Actions.

## CODING_PRACTICES

### Guidelines for SUPPORT_LEVEL

#### SUPPORT_BEGINNER

- When running in agent mode, execute up to 3 actions at a time and ask for approval or course correction afterwards.
- Write code with clear variable names and include explanatory comments for non-obvious logic. Avoid shorthand syntax and complex patterns.
- Provide full implementations rather than partial snippets. Include import statements, required dependencies, and initialization code.
- Add defensive coding patterns and clear error handling. Include validation for user inputs and explicit type checking.
- Suggest simpler solutions first, then offer more optimized versions with explanations of the trade-offs.
- Briefly explain why certain approaches are used and link to relevant documentation or learning resources.
- When suggesting fixes for errors, explain the root cause and how the solution addresses it to build understanding. Ask for confirmation before proceeding.
- Offer introducing basic test cases that demonstrate how the code works and common edge cases to consider.


### Guidelines for STATIC_ANALYSIS

#### ESLINT

- Configure project-specific rules in eslint.config.js to enforce consistent coding standards
- Use shareable configs like eslint-config-airbnb or eslint-config-standard as a foundation
- Implement custom rules for {{project_specific_patterns}} to maintain codebase consistency
- Configure integration with Prettier to avoid rule conflicts for code formatting
- Use the --fix flag in CI/CD pipelines to automatically correct fixable issues
- Implement staged linting with husky and lint-staged to prevent committing non-compliant code

#### PRETTIER

- Define a consistent .prettierrc configuration across all {{project_repositories}}
- Configure editor integration to format on save for immediate feedback
- Use .prettierignore to exclude generated files, build artifacts, and {{specific_excluded_patterns}}
- Set printWidth based on team preferences (80-120 characters) to improve code readability
- Configure consistent quote style and semicolon usage to match team conventions
- Implement CI checks to ensure all committed code adheres to the defined style


## FRONTEND

### Guidelines for REACT

#### NEXT_JS

- Use App Router and Server Components for improved performance and SEO
- Implement route handlers for API endpoints instead of the pages/api directory
- Use server actions for form handling and data mutations from Server Components
- Leverage Next.js Image component with proper sizing for core web vitals optimization
- Implement the Metadata API for dynamic SEO optimization
- Use React Server Components for {{data_fetching_operations}} to reduce client-side JavaScript
- Implement Streaming and Suspense for improved loading states
- Use the new Link component without requiring a child <a> tag
- Leverage parallel routes for complex layouts and parallel data fetching
- Implement intercepting routes for modal patterns and nested UIs


### Guidelines for STYLING

#### TAILWIND

- Use the @layer directive to organize styles into components, utilities, and base layers
- Implement Just-in-Time (JIT) mode for development efficiency and smaller CSS bundles
- Use arbitrary values with square brackets (e.g., w-[123px]) for precise one-off designs
- Leverage the @apply directive in component classes to reuse utility combinations
- Implement the Tailwind configuration file for customizing theme, plugins, and variants
- Use component extraction for repeated UI patterns instead of copying utility classes
- Leverage the theme() function in CSS for accessing Tailwind theme values
- Implement dark mode with the dark: variant
- Use responsive variants (sm:, md:, lg:, etc.) for adaptive designs
- Leverage state variants (hover:, focus:, active:, etc.) for interactive elements


## DATABASE

### Guidelines for NOSQL

#### MONGODB

- Use the aggregation framework for complex queries instead of multiple queries
- Implement schema validation to ensure data consistency for {{document_types}}
- Use indexes for frequently queried fields to improve performance

---

## ADDITIONAL BEST PRACTICES

### MOBILE-FIRST APPROACH

- **Design and implement UI components with a mobile-first mindset.** Start with styles and layouts optimized for small screens, then progressively enhance for larger devices using responsive design techniques.
- **Use Tailwind's responsive utilities** (e.g., `sm:`, `md:`, `lg:`) to adapt layouts and font sizes.
- **Prioritize touch-friendly UI elements** (larger tap targets, spacing, and mobile-optimized navigation).
- **Test all features on real mobile devices and emulators** to ensure usability and performance.
- **Optimize images and assets** for mobile bandwidth and screen sizes.

### ACCESSIBILITY (A11Y)

- **Ensure all interactive elements are keyboard accessible.**
- **Use semantic HTML** and ARIA attributes where appropriate.
- **Provide sufficient color contrast** and support for dark mode.
- **Test with screen readers** and other assistive technologies.

### TESTING

- **Write unit tests** for core logic and utility functions.
- **Implement integration tests** for key workflows (e.g., adding recipes, generating shopping lists).
- **Use E2E tests** (e.g., with Cypress or Playwright) to validate user flows.
- **Include basic test cases** for edge scenarios and error handling.

### DOCUMENTATION

- **Document all public functions, components, and APIs** using JSDoc or TypeScript doc comments.
- **Maintain a clear README** with setup, usage, and contribution guidelines.
- **Update documentation** as features evolve.

### ERROR HANDLING & USER FEEDBACK

- **Provide clear, actionable error messages** for all user-facing errors.
- **Validate user input** on both client and server sides.
- **Show loading and success states** for all async actions.
- **Log errors** for debugging, but avoid exposing sensitive details to users.



