# Architecture diagram template — Scientific Luxury

Use this template for system architecture diagrams, component diagrams, and infrastructure maps. Replace placeholder labels with project-specific names. Adjust subgraph boundaries to match your bounded contexts.

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
graph TD
    subgraph Client
        A[Browser client] -->|HTTP request| B[Next.js frontend]
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

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style H fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style I fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style J fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style K fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style L fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style M fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
````

## Colour legend

| Colour | Meaning |
|--------|---------|
| Cyan `#00F5FF` | Data stores and caches |
| Emerald `#00FF88` | Internal services and handlers |
| Amber `#FFB800` | Decision points and gates |
| Red `#FF4444` | Error states and rejections |
| Magenta `#FF00FF` | External systems and client endpoints |

## Customisation notes

Replace "Service A" and "Service B" with your actual service names. Add or remove subgraphs to match your bounded contexts. Use TD (top-down) for hierarchical architectures and LR (left-to-right) if the primary flow is a pipeline. Keep node labels under 4 words — use arrow labels for detail.
