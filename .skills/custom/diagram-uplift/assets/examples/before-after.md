# Before/after examples

Three side-by-side comparisons demonstrating the most impactful diagram corrections. Each example shows the same architectural concept expressed first in default Mermaid style, then in the Scientific Luxury uplift style. Examples use real architectural patterns from the NodeJS-Starter-V1 project.


## Example 1: Authentication flow — default to spectral

### Before

````mermaid
graph TD
    A[User] --> B[Login Form]
    B --> C[Next.js API Route]
    C --> D[FastAPI Backend]
    D --> E[Check Password]
    E --> F[Generate JWT]
    F --> G[Set Cookie]
    G --> H[Redirect to Dashboard]
    E --> I[Return Error]
````

### Why the before version fails

Every node is the same default grey rectangle with black text. The diagram uses TD direction for what is clearly a sequential authentication flow, creating a tall, narrow column that wastes horizontal space. There is no visual distinction between the user (an external actor), the frontend (Next.js), the backend (FastAPI), the decision point (password check), and the outcome states (success redirect vs error). All arrows are identical, so the reader cannot tell which path is the happy path and which is the error path. Node labels like "Check Password" use title case and some exceed 4 words when the full context is considered.

### After

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
    subgraph Frontend
        A[User] ==>|credentials| B[Login form]
        B ==>|POST /auth| C[API route]
    end

    subgraph Backend
        D[FastAPI handler] -->|bcrypt compare| E{Password valid}
        E -->|yes| F[Generate JWT]
        E -->|no| G[401 Unauthorised]
    end

    subgraph Response
        F -->|HttpOnly cookie| H[Dashboard redirect]
    end

    C ==>|HTTP request| D

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
    style H fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

### What changed

The flow direction changed from TD to LR, matching the sequential nature of a request lifecycle. Subgraphs separate the frontend, backend, and response boundaries. The password validation is now a diamond-shaped decision node in Amber, making the branching point visually obvious. The error path (401 Unauthorised) is Red, immediately distinguishable from the success path (Emerald). Thick arrows mark the critical happy path. Node labels were compressed — "Redirect to Dashboard" became "Dashboard redirect", "Check Password" became a decision diamond with the label "Password valid". The user node is Magenta (external actor), data/frontend nodes are Cyan, and services are Emerald.


## Example 2: Agent orchestration — flat to bounded

### Before

````mermaid
graph TD
    A[User Message] --> B[Orchestrator]
    B --> C[Planner Agent]
    C --> D[Tool Selection]
    D --> E[Code Search Tool]
    D --> F[File Read Tool]
    D --> G[Web Search Tool]
    E --> H[Result Aggregator]
    F --> H
    G --> H
    H --> I[Response Generator]
    I --> J[Quality Check]
    J --> K[Final Response]
    J --> C
````

### Why the before version fails

Twelve nodes with no grouping. The diagram is technically accurate — it shows the LangGraph agent orchestration loop — but architecturally opaque. The reader cannot tell which nodes belong to the planning phase, which to the execution phase, and which to the evaluation phase. The feedback loop from "Quality Check" back to "Planner Agent" is buried among identical arrows. Every node is the same shape and colour, so the tools (which are execution primitives) look identical to the orchestrator (which is a coordination layer). The labels "Tool Selection" and "Result Aggregator" are generic rather than specific to the system.

### After

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
    subgraph Planning
        A[User message] ==>|input| B[Orchestrator]
        B -->|plan| C{Select tools}
    end

    subgraph Execution
        D[Code search] -->|results| G[Aggregate results]
        E[File read] -->|results| G
        F[Web search] -->|results| G
    end

    subgraph Evaluation
        H[Generate response] -->|draft| I{Quality gate}
        I -->|pass| J[Final response]
        I -.->|retry| B
    end

    C -->|invoke| D
    C -->|invoke| E
    C -->|invoke| F
    G ==>|context| H

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style H fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style I fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style J fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

### What changed

Three subgraphs — Planning, Execution, Evaluation — map to the agent's processing phases. The tool selection node is now an Amber diamond (decision point), and the three tools are Cyan nodes (data retrieval), making their shared purpose visible at a glance. The quality gate is another Amber diamond with a dotted retry arrow back to the orchestrator, clearly showing the feedback loop. The critical happy path from user message through to final response uses thick arrows. The direction changed to LR because the agent pipeline is a sequential process, not a hierarchy.


## Example 3: API routing — unstyled to themed

### Before

````mermaid
graph TD
    A[HTTP Request] --> B[Next.js Middleware]
    B --> C[Check JWT]
    C --> D[Valid Token]
    C --> E[Invalid Token]
    D --> F[API Route Handler]
    E --> G[Redirect to Login]
    F --> H[FastAPI Proxy]
    H --> I[Database Query]
    I --> J[JSON Response]
````

### Why the before version fails

The default theme makes this diagram look like a generic flowchart rather than a system architecture diagram. All nodes are grey rectangles — the middleware, the JWT check, the database query, and the JSON response all look identical despite serving fundamentally different architectural roles. "Valid Token" and "Invalid Token" are not decision outcomes drawn as separate nodes; they should be branches from a single decision diamond. The labels mix concerns: "Check JWT" describes an action, "Valid Token" describes a state, and "JSON Response" describes an artefact.

### After

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
    subgraph Edge
        A[HTTP request] ==>|headers| B[Next.js middleware]
        B -->|extract token| C{JWT valid}
    end

    subgraph Application
        D[API route] ==>|proxy| E[FastAPI handler]
        E -->|query| F[(PostgreSQL)]
        F -->|rows| E
    end

    C -->|yes| D
    C -->|no| G[Login redirect]
    E ==>|JSON payload| H[200 Response]

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
    style H fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

### What changed

The JWT check is now a single Amber decision diamond ("JWT valid") with yes/no branches, replacing the two separate nodes "Valid Token" and "Invalid Token". The login redirect is Red (error/rejection path), immediately visible as the failure case. Subgraphs separate the edge layer (middleware) from the application layer (API routes and FastAPI). The database uses a cylinder shape and Cyan colour (data store), distinguishing it from services (Emerald rectangles). Direction changed to LR for the sequential request lifecycle. Arrow labels describe what flows between nodes — "headers", "extract token", "proxy", "JSON payload" — rather than restating the node names.
