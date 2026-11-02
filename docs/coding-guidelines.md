# Coding Guidelines

## Principles

- **Follow SOLID principles**
  - Single Responsibility: each module/function/component has one reason to change.
  - Open/Closed: extend behavior without modifying existing code.
  - Liskov Substitution: subtypes must be usable wherever their base types are.
  - Interface Segregation: prefer small, focused interfaces over large ones.
  - Dependency Inversion: depend on abstractions, not concrete implementations.
- **Follow the DRY principle**: avoid duplicating logic; extract shared code into reusable functions, modules, or components.
- **Follow TDD**: write a failing test first, make it pass with minimal code, then refactor. See [Testing Guidelines](./testing-guidelines.md).

## Linting

- Use common, best-practice linting rules for the relevant tech stack (e.g., ESLint for JavaScript/React).
- Code must pass linting with no errors before being committed.
