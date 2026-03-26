# Sequence diagram template — Generic

Use this template for interaction diagrams in projects that do not use the Scientific Luxury design system.

````mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#2196F3', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': '#333333',
  'lineColor': '#666666',
  'secondaryColor': '#4CAF50', 'tertiaryColor': '#FF9800',
  'background': '#1a1a2e', 'mainBkg': '#252540',
  'nodeBorder': '#333333',
  'fontFamily': 'Consolas, Monaco, monospace', 'fontSize': '14px',
  'actorBkg': '#9C27B0', 'actorTextColor': '#ffffff', 'actorBorder': '#6A1B9A',
  'activationBorderColor': '#333333', 'activationBkgColor': '#252540',
  'signalColor': '#666666', 'signalTextColor': '#ffffff',
  'noteBkgColor': '#252540', 'noteBorderColor': '#333333', 'noteTextColor': '#ffffff'
}}}%%
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as API gateway
    participant Auth as Auth service
    participant DB as Database

    User->>FE: Submit credentials
    activate FE
    FE->>API: POST /auth/login
    activate API
    API->>Auth: Validate token
    activate Auth
    Auth->>DB: Query user
    activate DB
    DB-->>Auth: User record
    deactivate DB
    Auth-->>API: JWT token
    deactivate Auth
    API-->>FE: Set-Cookie
    deactivate API
    FE-->>User: Redirect to dashboard
    deactivate FE

    Note over Auth,DB: Sync query
    Note over API,FE: HttpOnly cookie
````

## Participant roles

| Participant | Colour mapping | Purpose |
|-------------|---------------|---------|
| User (actor) | Purple `#9C27B0` | External actor initiating the flow |
| Frontend | Teal `#2196F3` | Client-side application |
| API gateway | Green `#4CAF50` | Request routing and orchestration |
| Auth service | Orange `#FF9800` | Decision and validation logic |
| Database | Teal `#2196F3` | Data storage and retrieval |

## Customisation notes

Replace participants with your actual service names. Solid arrows (`->>`) represent synchronous requests; dashed arrows (`-->>`) represent responses. Add activation bars to show which service is actively processing. Keep message labels to 1-3 words.
