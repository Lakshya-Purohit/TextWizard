# DevWizard V4 --- Product Development Prompt

You are a **Senior Product Architect, Staff Software Engineer, and UI/UX
Designer**. Build **DevWizard V4**, a production-grade, all-in-one
developer productivity platform.

## Product Vision

DevWizard should be a unified developer workspace for common tasks
involving:

-   Data conversion and transformation
-   JSON/XML/YAML formatting and parsing
-   Encoding/decoding
-   API testing
-   JWT inspection
-   Text utilities
-   SQL utilities
-   File conversion
-   Diff/comparison
-   Developer debugging utilities

It should feel like a combination of **DevToys, Postman, JWT.io,
CyberChef, and IDE tooling**, while having its own clean product
identity.

**Tagline:** `One Workspace. Every Developer Utility.`

Prioritize **speed, privacy, extensibility, keyboard-first UX, and
professional developer experience**.

## Core Features

### 1. Universal Tool Workspace

Every tool should follow a consistent IDE-style workspace with: -
Monaco-style editor - Input/output panels - Syntax highlighting -
Validation and error locations - Format, convert, copy, download, clear,
fullscreen - Resizable panels - Keyboard shortcuts - Drag-and-drop where
applicable

### 2. Data Transformation Engine

Create a reusable/extensible conversion engine instead of implementing
every converter independently.

Support: - JSON ↔ XML - JSON ↔ YAML - JSON ↔ CSV - XML ↔ CSV - String ↔
JSON - File ↔ Base64 - Image ↔ Base64 - Text ↔ Base64 - Text ↔ Hex -
Text ↔ Binary - URL/HTML/Unicode encoding and decoding

New converters should be addable without changing the core engine.

### 3. JSON Toolkit

Include: - Formatter / Minifier - Validator - Tree viewer - JSON →
XML/YAML/CSV - JSON Diff - JSON Path tester - Escape/Unescape

Show precise errors with line and column information.

### 4. XML Toolkit

Include: - Formatter / Minifier - Validator - Tree viewer - XML ↔ JSON -
XML ↔ CSV - XPath tester - Structural XML Diff

### 5. Developer Tools

Include: - JWT decoder and claims viewer - Regex tester - Unix
timestamp/date converter - Hash generator: MD5, SHA-1, SHA-256,
SHA-512 - Text transformation utilities - Connection-string parser - SQL
formatter/minifier - SQL ↔ JSON/CSV helpers

### 6. API Workspace

Build a lightweight API testing environment supporting: - GET, POST,
PUT, PATCH, DELETE, HEAD, OPTIONS - URL and query parameters - Headers -
Authentication - JSON/XML/Text/Form bodies - Response status, headers,
timing, and formatted body - cURL import/export

### 7. Diff Engine

Create one reusable diff engine supporting: - Text - JSON - XML - SQL

Provide side-by-side and unified views, change navigation, search, and
structural JSON/XML differences.

### 8. Magic Input

Automatically detect common input types locally.

Examples: - JSON detected - XML detected - JWT detected - Base64
detected - URL detected - UUID detected - Unix timestamp detected

Show contextual actions without modifying the input automatically.

## Product Features

### Dashboard

Include: - Global search - Recently used tools - Favorites - Popular
tools - Quick actions - Saved workflows - Keyboard shortcut reference

### Command Palette

Use `Ctrl/Cmd + K` to search tools, actions, history, favorites, and
settings.

### History

Maintain local history of operations while avoiding raw sensitive data
by default.

### Favorites

Allow users to pin frequently used tools.

### Saved Workflows

Allow chained operations such as:

`JSON → Validate → Format → Convert XML → Download`

Design workflows so they can later support automation.

## Privacy & Security

DevWizard should be **local-first** whenever possible.

Sensitive data such as JWTs, API tokens, credentials, API responses, and
configuration files should remain in the browser unless the user
explicitly performs a server-side operation.

Show:

> `Processed locally — your data stays in your browser.`

Never log: - Passwords - JWTs - Authorization headers - API
credentials - Sensitive request bodies

Implement secure file handling, input validation, XSS protection, CSP,
safe request handling, credential masking, and rate limiting for
server-side operations.

## Performance

Optimize for large JSON, XML, CSV, and text files.

Use where appropriate: - Web Workers - Lazy loading - Code splitting -
Virtualized tree rendering - Efficient diff algorithms - Debounced
validation

The UI must remain responsive during large transformations.

## Architecture

Use clean modular architecture:

`UI → Tool Framework → Parser/Validator → Transformation Engine → Execution → Result Renderer`

Separate: - Tool definitions - Editors - Parsers - Validators -
Conversion engines - API clients - State management - History -
Favorites - Settings - Security - Utilities

Use a common tool contract so new tools can be added independently.

## UX / Design

Create a modern developer-IDE experience.

Use: - Dark / Light / System themes - Compact toolbars - Tabs -
Resizable panels - Command palette - Keyboard navigation - Clear status
indicators - Contextual actions

Avoid: - Generic SaaS dashboard layouts - Excessive gradients - Huge
cards - Unnecessary animations - Excessive whitespace

Desktop is the primary experience, with proper tablet and mobile
adaptations.

## Accessibility

Support: - Keyboard-only navigation - ARIA labels - Focus management -
Screen readers - High contrast - Visible focus states

## Offline / PWA

Make local utilities available offline where practical using a PWA
architecture and cached application shell.

## Testing

Provide: - Unit tests for transformation engines - Integration tests for
APIs - UI tests for critical workflows - Validation tests for
malformed/empty/large inputs - Unicode and special-character tests

## Documentation

Provide: - Tool documentation - Architecture documentation -
Security/privacy documentation - API documentation - Contribution
guide - Tool/plugin development guide

## Future-Ready Design

Design the architecture for a future plugin ecosystem:

`DevWizard Core → JSON Plugin → XML Plugin → JWT Plugin → SQL Plugin → API Plugin → Custom Plugins`

A public marketplace is not required in V4, but the architecture must
support future extensions.

## V4 Quality Bar

DevWizard V4 must behave like a **real production developer product**,
not a collection of demo pages.

A developer should be able to open one workspace and quickly:

-   Format JSON/XML
-   Convert JSON/XML/YAML/CSV
-   Decode JWT
-   Convert Base64/files
-   Compare JSON/XML
-   Test regex
-   Format SQL
-   Test APIs
-   Parse connection strings
-   Convert timestamps
-   Encode/decode data
-   Perform common text transformations

Build incrementally:

**Design System → Tool Framework → Transformation Engine → Core Tools →
Advanced Tools → API Workspace → History/Favorites/Workflows →
Security/Performance/Accessibility/Testing → Production Hardening**
