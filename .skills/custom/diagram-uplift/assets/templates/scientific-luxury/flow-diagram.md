# Flow diagram template — Scientific Luxury

Use this template for process flows, request lifecycles, data pipelines, and workflow diagrams. The LR direction suits sequential processes where each step follows the previous in time.

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
graph LR
    A[Request received] ==>|payload| B{Validate input}
    B -->|valid| C[Process logic]
    B -->|invalid| D[400 Bad request]
    C -->|query| E[(Database)]
    E -->|result| F{Check result}
    F -->|found| G[Format response]
    F -->|not found| H[404 Not found]
    G ==>|JSON payload| I[200 Success]

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style H fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
    style I fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

## Colour legend

| Colour | Meaning |
|--------|---------|
| Cyan `#00F5FF` | Data stores and lookups |
| Emerald `#00FF88` | Processing stages and success outcomes |
| Amber `#FFB800` | Decision points and validation gates |
| Red `#FF4444` | Error responses and failure paths |
| Magenta `#FF00FF` | Entry points and external triggers |

## Customisation notes

Replace node labels with your specific process steps. The thick arrows (`==>`) mark the critical path — the happy-path flow from entry to success. Use dotted arrows (`-.->`) for asynchronous side effects such as logging, notifications, or cache warming. Add subgraphs if the flow spans multiple service boundaries.
