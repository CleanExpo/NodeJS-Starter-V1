# ER diagram template — Scientific Luxury

Use this template for entity-relationship diagrams showing database schema, data model relationships, and table structures. ER diagrams use Mermaid's `erDiagram` syntax, which has its own relationship notation.

````mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#00F5FF', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': 'rgba(255,255,255,0.1)',
  'lineColor': 'rgba(255,255,255,0.3)',
  'secondaryColor': '#00FF88', 'tertiaryColor': '#FFB800',
  'background': '#050505', 'mainBkg': '#0a0a0a',
  'nodeBorder': 'rgba(255,255,255,0.1)',
  'fontFamily': 'JetBrains Mono, monospace', 'fontSize': '14px'
}}}%%
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ AgentRun : "initiates"
    User {
        uuid id PK
        string email
        string password_hash
        string role
        timestamp created_at
    }

    Session ||--o{ Message : "contains"
    Session {
        uuid id PK
        uuid user_id FK
        string title
        timestamp created_at
        timestamp updated_at
    }

    AgentRun ||--o{ ToolCall : "executes"
    AgentRun {
        uuid id PK
        uuid user_id FK
        uuid session_id FK
        string agent_type
        string status
        jsonb state
        timestamp started_at
        timestamp completed_at
    }

    Message {
        uuid id PK
        uuid session_id FK
        string role
        text content
        timestamp created_at
    }

    ToolCall {
        uuid id PK
        uuid run_id FK
        string tool_name
        jsonb arguments
        jsonb result
        timestamp executed_at
    }
````

## Relationship notation

Mermaid ER diagrams use a specific cardinality syntax:

| Notation | Meaning |
|----------|---------|
| `\|\|--o{` | One to many (zero or more) |
| `\|\|--\|\|` | One to one (exactly one) |
| `}o--o{` | Many to many |
| `\|\|--\|{` | One to many (one or more) |

## Customisation notes

Replace entities and attributes with your actual data model. Entity names use PascalCase to match SQLAlchemy model conventions. Attribute types should reflect the database column types (uuid, string, text, jsonb, timestamp, integer, boolean). Relationship labels use lowercase verbs that describe the domain relationship: "has", "initiates", "contains", "executes".

The theme init block ensures entity boxes render with Cyan backgrounds on the OLED black surface, maintaining the data-storage semantic colour mapping from the spectral palette.
