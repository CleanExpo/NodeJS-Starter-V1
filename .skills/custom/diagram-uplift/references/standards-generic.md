# Standards — Generic diagram styling

Portable styling conventions for Mermaid diagrams that are not tied to the Scientific Luxury design system. These standards produce professional, dark-mode-friendly diagrams that render well in any Markdown viewer, IDE preview, or documentation site. Apply these alongside the diagram rules in `SKILL.md`.


## Colour palette

The generic palette uses muted, high-contrast colours that work against both dark and light backgrounds, with a preference for dark-mode readability. The palette avoids the neon intensity of the Scientific Luxury spectral colours in favour of balanced saturation that does not overwhelm in standard contexts.

### Background

Primary background: `#1a1a2e` — deep navy-black that works on dark-mode sites without the pure-OLED requirement. Fallback for renderers that ignore background settings is acceptable — the node colours are chosen to remain legible on both dark and light backgrounds.

### Node colours

| Node type | Colour | Hex | Style directive |
|-----------|--------|-----|-----------------|
| Data / storage | Teal | `#2196F3` | `fill:#2196F3,stroke:#1565C0,color:#ffffff` |
| Success / output | Green | `#4CAF50` | `fill:#4CAF50,stroke:#2E7D32,color:#ffffff` |
| Decision / logic | Orange | `#FF9800` | `fill:#FF9800,stroke:#E65100,color:#ffffff` |
| Error / failure | Red | `#F44336` | `fill:#F44336,stroke:#C62828,color:#ffffff` |
| External / integration | Purple | `#9C27B0` | `fill:#9C27B0,stroke:#6A1B9A,color:#ffffff` |

These colours maintain the same semantic mapping as the Scientific Luxury palette — data is always a cool colour, errors are always red, decisions are always warm, external systems are always a distinct hue. The mapping is consistent so that readers who encounter both styling systems can transfer their understanding.

### Text colours

Node text: `#ffffff` against all node backgrounds. Arrow labels: `#cccccc`. Subgraph titles: `#aaaaaa`.


## Theme init block

```
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#2196F3', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': '#333333',
  'lineColor': '#666666',
  'secondaryColor': '#4CAF50', 'tertiaryColor': '#FF9800',
  'background': '#1a1a2e', 'mainBkg': '#252540',
  'nodeBorder': '#333333',
  'fontFamily': 'Consolas, Monaco, monospace', 'fontSize': '14px'
}}}%%
```

The `theme: 'base'` declaration prevents Mermaid's built-in themes from overriding these values. The border colours use visible grey tones rather than semi-transparent white, which renders more consistently across Markdown viewers that may not support rgba values.


## Node shapes

The same shape conventions apply as in the Scientific Luxury standards, providing structural reinforcement of the colour semantics:

| Shape | Syntax | Use for |
|-------|--------|---------|
| Rectangle | `[Label]` | Services, components, processing stages |
| Rounded rectangle | `(Label)` | User-facing endpoints, entry/exit points |
| Diamond | `{Label}` | Decision points, conditional branches |
| Cylinder | `[(Label)]` | Databases, persistent storage |
| Stadium | `([Label])` | Queues, buffers, temporary storage |
| Hexagon | `{{Label}}` | External systems, third-party integrations |


## Subgraph styling

Subgraph backgrounds use `#252540` — slightly lighter than the diagram background. Borders use `#333333` for a clean, visible boundary. Titles use `#aaaaaa` to establish hierarchy below node labels.

```
subgraph Title
    style Title fill:#252540,stroke:#333333,color:#aaaaaa
end
```

Subgraph naming follows the same conventions as Scientific Luxury: name the boundary, not the contents, using 1-3 word architectural terms.


## Arrow styling

The three arrow types carry the same semantic meaning across both styling systems:

| Style | Syntax | Meaning |
|-------|--------|---------|
| Solid | `-->` | Synchronous call, direct dependency |
| Dotted | `-.->` | Asynchronous message, eventual delivery |
| Thick | `==>` | Critical path, primary flow |

Arrow labels use 1-3 words in sentence case. The default line colour `#666666` provides adequate contrast against both the diagram background and most node colours.


## Font configuration

The generic font stack uses widely available monospace fonts: `Consolas, Monaco, "Courier New", monospace`. This ensures consistent rendering across Windows, macOS, and Linux without requiring JetBrains Mono installation.

Font size: 14px for all diagram text. This balances readability against layout density — smaller sizes become illegible in exported images, while larger sizes cause node overflow in diagrams with many labelled edges.


## Sequence diagram specifics

Participant boxes use the generic node colour mapping. External actors (users, clients) use Purple `#9C27B0`. Internal services use Teal `#2196F3` or Green `#4CAF50` depending on their role.

Message labels follow the standard brevity rule: 1-3 words. Activation bars use a slightly lighter shade of the participant's colour to maintain visual association.


## ER diagram specifics

Entity names use PascalCase. Relationship labels use lowercase verbs. The generic theme renders entity boxes in Teal by default (via `primaryColor`), which suits the data-storage semantic of most ER diagram entities.

For entities that represent external integrations (e.g., a Stripe payment record that mirrors external state), override the fill to Purple to signal the external dependency.


## Compatibility notes

The generic palette has been tested against these common rendering environments:

- GitHub Markdown preview (dark and light mode)
- VS Code Markdown preview with default dark theme
- Mermaid Live Editor (https://mermaid.live)
- GitLab Markdown rendering
- Docusaurus with standard dark theme

The rgba transparency values used in Scientific Luxury standards are intentionally avoided here because several of these renderers do not support them consistently. Solid hex colours with explicit border colours provide more predictable results across environments.
