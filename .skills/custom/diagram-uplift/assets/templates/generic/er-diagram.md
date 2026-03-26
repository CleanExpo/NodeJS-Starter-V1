# ER diagram template — Generic

Use this template for entity-relationship diagrams in projects that do not use the Scientific Luxury design system.

````mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#2196F3', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': '#333333',
  'lineColor': '#666666',
  'secondaryColor': '#4CAF50', 'tertiaryColor': '#FF9800',
  'background': '#1a1a2e', 'mainBkg': '#252540',
  'nodeBorder': '#333333',
  'fontFamily': 'Consolas, Monaco, monospace', 'fontSize': '14px'
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

| Notation | Meaning |
|----------|---------|
| `\|\|--o{` | One to many (zero or more) |
| `\|\|--\|\|` | One to one (exactly one) |
| `}o--o{` | Many to many |
| `\|\|--\|{` | One to many (one or more) |

## Customisation notes

Replace entities and attributes with your actual data model. Entity names use PascalCase. Attribute types should reflect database column types. Relationship labels use lowercase verbs describing the domain relationship. The generic palette renders entity boxes in Teal by default, maintaining the data-storage semantic mapping.
