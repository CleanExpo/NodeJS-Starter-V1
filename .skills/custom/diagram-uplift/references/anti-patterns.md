# Anti-patterns reference

Detailed before/after examples for each of the 8 banned diagram defaults. Use these to calibrate detection and correction.


## 1. Default Mermaid theme

**Before**:
````mermaid
graph TD
    A[User] --> B[Login Page]
    B --> C[Backend API]
    C --> D[Database]
    D --> C
    C --> E[JWT Token]
    E --> A
````

**Why it fails**: The default theme renders every node in the same grey with black text on a white background. There is no visual distinction between the user (an external actor), the login page (a frontend component), the backend API (a service), and the database (a data store). The reader must read every label to understand the diagram's structure, which defeats the purpose of a visual representation.

**After**:
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
    A[User] -->|credentials| B[Login page]
    B -->|POST /auth| C[Backend API]
    C -->|query| D[(Database)]
    D -->|user record| C
    C -->|JWT token| A

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: A Mermaid block that lacks a `%%{init}%%` configuration. Any diagram where all nodes render in the same default colour.


## 2. Grey nodes with black text

**Before**:
````mermaid
graph TD
    A[API Gateway] --> B[Auth Service]
    A --> C[User Service]
    A --> D[Payment Service]
    B --> E[Token Store]
    C --> F[User DB]
    D --> G[Stripe API]
````

**Why it fails**: Six nodes, all identical grey rectangles with black text. The reader cannot distinguish services from data stores from external integrations without reading every label. On a dark-themed IDE or documentation site, the black text on grey becomes nearly illegible.

**After**:
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
    A[API gateway] -->|route| B[Auth service]
    A -->|route| C[User service]
    A -->|route| D[Payment service]
    B -->|read/write| E[(Token store)]
    C -->|read/write| F[(User DB)]
    D -->|API call| G[Stripe API]

    style A fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: Nodes rendering in the browser's default Mermaid grey (`#ECECFF` or `#f9f9f9`). Any node where text colour is `#333` or `#000` against a coloured background.


## 3. Single-colour diagrams

**Before**:
````mermaid
graph LR
    A[Ingest] --> B[Validate]
    B --> C[Transform]
    C --> D[Enrich]
    D --> E[Load]
    E --> F[Index]
    F --> G[Serve]

    style A fill:#4a90d9,color:#fff
    style B fill:#4a90d9,color:#fff
    style C fill:#4a90d9,color:#fff
    style D fill:#4a90d9,color:#fff
    style E fill:#4a90d9,color:#fff
    style F fill:#4a90d9,color:#fff
    style G fill:#4a90d9,color:#fff
````

**Why it fails**: The author added colour, but used the same shade of blue for every node. This is marginally better than grey but still encodes no information. The reader cannot distinguish the validation gate from the data transformation from the final serving layer. It looks like a to-do list with boxes rather than a data pipeline with distinct processing stages.

**After**:
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
    A[Ingest] -->|raw data| B{Validate}
    B -->|valid| C[Transform]
    B -->|invalid| R[Reject]
    C -->|normalised| D[Enrich]
    D -->|enriched| E[(Data store)]
    E -->|indexed| F[Serve]

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style R fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: All `style` directives using the same `fill` value. Count distinct fill colours — if fewer than three, the diagram fails the spectral colouring requirement.


## 4. TD direction for everything

**Before**:
````mermaid
graph TD
    A[Receive request] --> B[Authenticate]
    B --> C[Validate payload]
    C --> D[Process business logic]
    D --> E[Write to database]
    E --> F[Format response]
    F --> G[Send response]
````

**Why it fails**: This is a sequential request lifecycle — each step follows the previous in time. Rendering it top-down creates a tall, narrow diagram that wastes horizontal space and makes the flow feel like a checklist rather than a pipeline. Sequential, temporal processes read more naturally left-to-right, matching how timelines and process flows are conventionally drawn.

**After**:
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
    A[Receive request] -->|token| B{Authenticate}
    B -->|valid| C{Validate payload}
    B -->|invalid| X[401 Unauthorised]
    C -->|valid| D[Process logic]
    C -->|invalid| Y[400 Bad request]
    D -->|result| E[(Database)]
    E -->|confirm| F[Send response]

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style X fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
    style Y fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: A `graph TD` or `flowchart TD` declaration where the diagram describes a sequential process (request handling, data pipeline, workflow steps). Look for nodes that represent temporal steps rather than hierarchical relationships.


## 5. No subgraph grouping

**Before**:
````mermaid
graph LR
    A[Browser] --> B[Next.js]
    B --> C[API route]
    C --> D[FastAPI]
    D --> E[Auth middleware]
    E --> F[LangGraph agent]
    F --> G[Tool executor]
    G --> H[PostgreSQL]
    G --> I[Redis]
    F --> J[Response formatter]
    J --> C
````

**Why it fails**: Ten nodes with no visual grouping. The reader cannot tell where the frontend boundary ends and the backend begins, which nodes belong to the AI agent subsystem, or which are data stores. The diagram is technically accurate but architecturally opaque — it shows connections without showing boundaries.

**After**:
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
        A[Browser] -->|request| B[Next.js]
        B -->|API call| C[API route]
    end

    subgraph Backend
        D[FastAPI] -->|validate| E{Auth middleware}
    end

    subgraph AI Agent
        F[LangGraph agent] -->|invoke| G[Tool executor]
        F -->|format| J[Response formatter]
    end

    subgraph Data
        H[(PostgreSQL)]
        I[(Redis)]
    end

    C -->|HTTP| D
    E -->|authorised| F
    G -->|query| H
    G -->|cache| I
    J -->|response| C

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style H fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style I fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style J fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: A diagram with more than six nodes and zero `subgraph` declarations. Also watch for diagrams where nodes from different architectural layers (frontend, backend, database) are mixed without boundaries.


## 6. Default arrow styles

**Before**:
````mermaid
graph LR
    A[Client] --> B[API]
    B --> C[Auth]
    B --> D[Queue]
    D --> E[Worker]
    E --> F[DB]
    E --> G[Webhook]
````

**Why it fails**: Every arrow is identical — solid, thin, unlabelled. The reader cannot tell whether the client-to-API connection is synchronous or asynchronous, whether the queue is a fire-and-forget message or a request-reply pattern, or whether the webhook call is critical or best-effort. The arrows show topology without semantics.

**After**:
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
    A[Client] ==>|HTTP request| B[API gateway]
    B -->|validate token| C{Auth check}
    C -->|authorised| B
    B -.->|enqueue job| D[(Job queue)]
    D -.->|dequeue| E[Worker]
    E -->|write result| F[(Database)]
    E -.->|notify| G[Webhook endpoint]

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: All arrows using the same `-->` syntax with no labels. Diagrams containing both synchronous and asynchronous communication but no visual distinction between them (solid vs dotted lines).


## 7. LR for hierarchical processes

**Before**:
````mermaid
graph LR
    A[App] --> B[Auth module]
    A --> C[User module]
    A --> D[Payment module]
    B --> E[JWT handler]
    B --> F[OAuth provider]
    C --> G[Profile service]
    C --> H[Preferences service]
    D --> I[Stripe client]
    D --> J[Invoice generator]
````

**Why it fails**: This is a dependency tree — the application depends on modules, and modules depend on services. Tree structures read naturally top-down because parent-child relationships map to vertical hierarchy in most readers' mental models. Forcing LR creates a wide, shallow diagram that scrolls horizontally and obscures the depth of the dependency chain.

**After**:
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
    A[Application] --> B[Auth module]
    A --> C[User module]
    A --> D[Payment module]

    B --> E[JWT handler]
    B --> F[OAuth provider]

    C --> G[Profile service]
    C --> H[Preferences service]

    D --> I[Stripe client]
    D --> J[Invoice generator]

    style A fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style F fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style G fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style H fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style I fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style J fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: A `graph LR` declaration where the node relationships form a tree (one root, branching children). Count the "depth" of the longest path — if it exceeds 2 levels, TD is almost certainly the correct direction.


## 8. Text-heavy nodes

**Before**:
````mermaid
graph TD
    A[User submits login credentials via the form] --> B[Backend validates the email format and password strength]
    B --> C[System checks credentials against the PostgreSQL database]
    C --> D[JWT token is generated with user ID and role claims]
    D --> E[Token is stored in an HttpOnly secure cookie]
````

**Why it fails**: Each node label reads like a sentence, creating oversized boxes that dominate the visual space. The diagram's structural information — which node connects to which — is buried under walls of text. Diagrams communicate structure; prose communicates detail. Mixing them degrades both.

**After**:
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
    A[Submit credentials] -->|email + password| B{Validate input}
    B -->|valid| C[(User lookup)]
    C -->|match| D[Generate JWT]
    D -->|HttpOnly cookie| E[Auth complete]

    style A fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style B fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff
    style C fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff
    style D fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
    style E fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff
````

**Detection cue**: Any node label containing more than 4 words. Count the words in each node's square brackets — if any exceed 4, the label needs compression. Move the detail into arrow labels or a prose legend below the diagram.
