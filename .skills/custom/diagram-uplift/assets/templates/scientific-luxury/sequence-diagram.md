# Sequence diagram template — Scientific Luxury

Use this template for interaction diagrams showing message exchange between actors and services over time. Sequence diagrams inherently flow top-down (time axis), so direction is not configurable.

````mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#00F5FF', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': 'rgba(255,255,255,0.1)',
  'lineColor': 'rgba(255,255,255,0.3)',
  'secondaryColor': '#00FF88', 'tertiaryColor': '#FFB800',
  'background': '#050505', 'mainBkg': '#0a0a0a',
  'nodeBorder': 'rgba(255,255,255,0.1)',
  'fontFamily': 'JetBrains Mono, monospace', 'fontSize': '14px',
  'actorBkg': '#FF00FF', 'actorTextColor': '#ffffff', 'actorBorder': 'rgba(255,255,255,0.1)',
  'activationBorderColor': 'rgba(255,255,255,0.1)', 'activationBkgColor': '#0a0a0a',
  'signalColor': 'rgba(255,255,255,0.3)', 'signalTextColor': '#ffffff',
  'noteBkgColor': '#0a0a0a', 'noteBorderColor': 'rgba(255,255,255,0.1)', 'noteTextColor': '#ffffff'
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

| Participant | Spectral mapping | Purpose |
|-------------|-----------------|---------|
| User (actor) | Magenta `#FF00FF` | External actor initiating the flow |
| Frontend | Cyan `#00F5FF` | Client-side application |
| API gateway | Emerald `#00FF88` | Request routing and orchestration |
| Auth service | Amber `#FFB800` | Decision and validation logic |
| Database | Cyan `#00F5FF` | Data storage and retrieval |

## Customisation notes

Replace participants with your actual service names. Use solid arrows (`->>`) for synchronous requests and dashed arrows (`-->>`) for responses. Activation bars show which service is actively processing. Notes annotate significant implementation details that the arrow labels cannot convey. Keep message labels to 1-3 words.
