# Standards — Scientific Luxury diagram styling

Styling conventions for Mermaid diagrams produced within the Scientific Luxury design system. These standards apply alongside the diagram rules in `SKILL.md` and add the OLED-first, spectral-colour visual layer.


## Foundation

The Scientific Luxury design system treats diagrams as precision instruments, not decoration. Every colour, line weight, and layout decision encodes architectural information. A well-styled diagram should communicate system structure to a reader who does not speak the same language as the labels — colour and shape alone should convey node type, flow direction, and boundary membership.


## Mermaid theme init block

Every Scientific Luxury Mermaid diagram must begin with this exact init block, placed before the graph direction declaration.

```
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#00F5FF', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': 'rgba(255,255,255,0.1)',
  'lineColor': 'rgba(255,255,255,0.3)',
  'secondaryColor': '#00FF88', 'tertiaryColor': '#FFB800',
  'background': '#050505', 'mainBkg': '#0a0a0a',
  'nodeBorder': 'rgba(255,255,255,0.1)',
  'fontFamily': 'JetBrains Mono, monospace', 'fontSize': '14px'
}}}%%
```

The `theme: 'base'` declaration tells Mermaid to use only the variables provided, ignoring its built-in theme colours. This prevents the default grey from leaking into any node or edge.


## Node colour mapping

The spectral palette assigns colours by semantic role, not by visual preference. The mapping is authoritative — agents and authors must not reassign colours based on aesthetics.

| Node type | Colour name | Hex | Style directive | Usage examples |
|-----------|-------------|-----|-----------------|----------------|
| Data / storage | Cyan | `#00F5FF` | `fill:#00F5FF,stroke:rgba(255,255,255,0.1),color:#ffffff` | PostgreSQL, Redis, S3 buckets, message queues, state stores, caches |
| Success / output | Emerald | `#00FF88` | `fill:#00FF88,stroke:rgba(255,255,255,0.1),color:#ffffff` | API responses, completed workflows, healthy services, output endpoints |
| Decision / logic | Amber | `#FFB800` | `fill:#FFB800,stroke:rgba(255,255,255,0.1),color:#ffffff` | Auth gates, validation checks, routing decisions, feature flags, conditionals |
| Error / failure | Red | `#FF4444` | `fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff` | Error states, rejected requests, circuit breakers, dead letter queues, rollbacks |
| External / integration | Magenta | `#FF00FF` | `fill:#FF00FF,stroke:rgba(255,255,255,0.1),color:#ffffff` | Browser clients, third-party APIs, external webhooks, user-facing endpoints |

When a node's role is ambiguous, choose the colour that matches its primary architectural purpose in the diagram's context. A Redis instance used as a cache is Cyan (data). A Redis instance used as a pub/sub broker might be Emerald (output) if it represents the successful delivery path.


## Node shapes

Mermaid supports multiple node shapes. Use them to reinforce the semantic colouring:

| Shape | Syntax | Use for |
|-------|--------|---------|
| Rectangle | `[Label]` | Services, components, processing stages |
| Rounded rectangle | `(Label)` | User-facing endpoints, entry/exit points |
| Diamond | `{Label}` | Decision points, conditional branches |
| Cylinder | `[(Label)]` | Databases, persistent storage |
| Stadium | `([Label])` | Queues, buffers, temporary storage |
| Hexagon | `{{Label}}` | External systems, third-party integrations |


## Subgraph styling

Subgraphs group nodes into bounded contexts. The subgraph background must be one shade lighter than the page background to create visual containment without harsh borders.

```
subgraph Title
    style Title fill:#0a0a0a,stroke:rgba(255,255,255,0.05),color:rgba(255,255,255,0.6)
end
```

Subgraph titles use `rgba(255,255,255,0.6)` — dimmer than node labels to establish visual hierarchy. The boundary stroke at `rgba(255,255,255,0.05)` is barely visible, creating a subtle grouping effect rather than a rigid box.

Subgraph naming conventions:

- Name the boundary, not the contents: "Frontend" not "Frontend components"
- Use architectural terms: "Auth service", "Data layer", "Processing pipeline"
- Maximum 3 words in the subgraph title


## Arrow styling

Arrows encode communication semantics. Three styles cover the vast majority of system diagrams:

| Style | Syntax | Meaning | Example |
|-------|--------|---------|---------|
| Solid | `-->` | Synchronous call, direct dependency | API request, function call, database query |
| Dotted | `-.->` | Asynchronous message, eventual delivery | Queue publish, webhook notification, event emit |
| Thick | `==>` | Critical path, primary flow | Main request lifecycle, happy path |

Arrow labels describe what flows across the connection, using 1-3 words: "JWT token", "user data", "error response". Labels use sentence case and no punctuation.

The default line colour is `rgba(255,255,255,0.3)` — visible against the OLED background but subordinate to node colours. Do not override this unless a specific arrow requires emphasis.


## Font configuration

All diagram text uses JetBrains Mono at 14px. This monospace font ensures consistent label widths, which helps Mermaid's layout engine produce balanced diagrams. The monospace alignment is especially important for sequence diagrams where message labels must align vertically across parallel lifelines.

Node labels: `#ffffff` — full white for maximum readability against spectral backgrounds.

Arrow labels: Inherit from `lineColor` at `rgba(255,255,255,0.3)`, which Mermaid typically renders at higher opacity for text. If arrow labels are hard to read, override with `rgba(255,255,255,0.7)`.

Subgraph titles: `rgba(255,255,255,0.6)` — dimmer than node labels to signal that the title is organisational, not structural.


## Sequence diagram specifics

Sequence diagrams use participant declarations rather than node shapes. Apply spectral colouring to participant boxes:

```
participant A as "Auth service"
```

Mermaid's sequence diagram theme variables map as follows:

- `actorBkg`: Use Magenta `#FF00FF` for external actors (users, clients)
- `actorTextColor`: `#ffffff`
- `activationBorderColor`: `rgba(255,255,255,0.1)`
- `signalColor`: `rgba(255,255,255,0.3)` for standard messages
- `noteBkgColor`: `#0a0a0a` with `noteBorderColor`: `rgba(255,255,255,0.1)`

Message labels follow the same brevity rule: 1-3 words describing what is transmitted.


## ER diagram specifics

Entity-relationship diagrams use the `erDiagram` syntax. Apply the theme init block as usual. Entity names use PascalCase to match database model conventions. Relationship labels use lowercase verbs: "has", "belongs to", "references".

Attribute types are rendered in JetBrains Mono by default (inherited from the font configuration). Keep entity names under 3 words — use the model name, not a description.
