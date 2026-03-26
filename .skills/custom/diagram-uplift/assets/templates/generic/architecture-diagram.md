# Architecture diagram template — Generic

Use this template for system architecture diagrams in projects that do not use the Scientific Luxury design system. The colour palette is professional and renders well in both dark and light Markdown viewers.

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
graph TD
    subgraph Client
        A[Browser client] -->|HTTP request| B[Frontend app]
    end

    subgraph API Layer
        C[API gateway] -->|validate| D{Auth middleware}
        D -->|authorised| E[Route handler]
        D -->|rejected| F[401 response]
    end

    subgraph Services
        G[Service A] -->|query| H[(Primary DB)]
        G -->|cache read| I[(Cache layer)]
        J[Service B] -->|publish| K([Message queue])
    end

    subgraph External
        L{{Third-party API}}
        M{{Webhook endpoint}}
    end

    B ==>|API call| C
    E -->|delegate| G
    E -->|delegate| J
    G -.->|notify| M
    J -->|integrate| L
    K -.->|consume| G

    style A fill:#9C27B0,stroke:#6A1B9A,color:#ffffff
    style B fill:#2196F3,stroke:#1565C0,color:#ffffff
    style C fill:#4CAF50,stroke:#2E7D32,color:#ffffff
    style D fill:#FF9800,stroke:#E65100,color:#ffffff
    style E fill:#4CAF50,stroke:#2E7D32,color:#ffffff
    style F fill:#F44336,stroke:#C62828,color:#ffffff
    style G fill:#4CAF50,stroke:#2E7D32,color:#ffffff
    style H fill:#2196F3,stroke:#1565C0,color:#ffffff
    style I fill:#2196F3,stroke:#1565C0,color:#ffffff
    style J fill:#4CAF50,stroke:#2E7D32,color:#ffffff
    style K fill:#2196F3,stroke:#1565C0,color:#ffffff
    style L fill:#9C27B0,stroke:#6A1B9A,color:#ffffff
    style M fill:#9C27B0,stroke:#6A1B9A,color:#ffffff
````

## Colour legend

| Colour | Meaning |
|--------|---------|
| Teal `#2196F3` | Data stores and caches |
| Green `#4CAF50` | Internal services and handlers |
| Orange `#FF9800` | Decision points and gates |
| Red `#F44336` | Error states and rejections |
| Purple `#9C27B0` | External systems and client endpoints |

## Customisation notes

Replace placeholder service names with your actual components. Add or remove subgraphs to match your service boundaries. The generic palette uses solid hex colours and explicit border colours for maximum compatibility across Markdown renderers.
