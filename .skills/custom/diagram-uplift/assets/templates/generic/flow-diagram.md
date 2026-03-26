# Flow diagram template — Generic

Use this template for process flows, request lifecycles, and data pipelines in projects that do not use the Scientific Luxury design system.

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
graph LR
    A[Request received] ==>|payload| B{Validate input}
    B -->|valid| C[Process logic]
    B -->|invalid| D[400 Bad request]
    C -->|query| E[(Database)]
    E -->|result| F{Check result}
    F -->|found| G[Format response]
    F -->|not found| H[404 Not found]
    G ==>|JSON payload| I[200 Success]

    style A fill:#9C27B0,stroke:#6A1B9A,color:#ffffff
    style B fill:#FF9800,stroke:#E65100,color:#ffffff
    style C fill:#4CAF50,stroke:#2E7D32,color:#ffffff
    style D fill:#F44336,stroke:#C62828,color:#ffffff
    style E fill:#2196F3,stroke:#1565C0,color:#ffffff
    style F fill:#FF9800,stroke:#E65100,color:#ffffff
    style G fill:#4CAF50,stroke:#2E7D32,color:#ffffff
    style H fill:#F44336,stroke:#C62828,color:#ffffff
    style I fill:#4CAF50,stroke:#2E7D32,color:#ffffff
````

## Colour legend

| Colour | Meaning |
|--------|---------|
| Teal `#2196F3` | Data stores and lookups |
| Green `#4CAF50` | Processing stages and success outcomes |
| Orange `#FF9800` | Decision points and validation gates |
| Red `#F44336` | Error responses and failure paths |
| Purple `#9C27B0` | Entry points and external triggers |

## Customisation notes

Replace node labels with your specific process steps. Thick arrows (`==>`) mark the critical happy path. Dotted arrows (`-.->`) indicate asynchronous side effects. Add subgraphs when the flow crosses service boundaries.
