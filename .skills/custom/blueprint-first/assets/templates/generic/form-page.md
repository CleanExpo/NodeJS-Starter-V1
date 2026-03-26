# ASCII Blueprint Template: Form Page (Generic)

> Portable form page wireframe. Replace with your design system tokens.

```
BLUEPRINT: Form Page
═══════════════════════════════════════════════════════

DESKTOP LAYOUT
┌─────────────────────────────────────────────────────┐
│  NAVBAR                                              │
│  [Logo]                           [Back / Nav links] │
├─────────────────────────────────────────────────────┤
│                                                      │
│        FORM CONTAINER [max-w centred]                 │
│        ┌──────────────────────────────────┐          │
│        │                                  │          │
│        │  H2: [Form Title]                │          │
│        │  p:  [Description / instructions]│          │
│        │                                  │          │
│        │  ┌──────────────────────────┐    │          │
│        │  │  Label                    │    │          │
│        │  │  [Input field]            │    │          │
│        │  └──────────────────────────┘    │          │
│        │                                  │          │
│        │  ┌──────────────────────────┐    │          │
│        │  │  Label                    │    │          │
│        │  │  [Input field]            │    │          │
│        │  └──────────────────────────┘    │          │
│        │                                  │          │
│        │  ┌──────────────────────────┐    │          │
│        │  │  Label                    │    │          │
│        │  │  [Input field]            │    │          │
│        │  └──────────────────────────┘    │          │
│        │                                  │          │
│        │  [Error / success message area]  │          │
│        │                                  │          │
│        │  [Submit Button — full width]    │          │
│        │  [Secondary action link]         │          │
│        │                                  │          │
│        └──────────────────────────────────┘          │
│                                                      │
└─────────────────────────────────────────────────────┘

MOBILE LAYOUT (< 768px)
  Form container: full width, px-4
  Fields: full width, stacked
  Submit button: full width
  No side padding on form container

STATES
  Default:  Fields empty, no messages
  Loading:  Submit button disabled, loading indicator
  Error:    Error message above submit, field highlighted
  Success:  Success message, redirect or next step

═══════════════════════════════════════════════════════
```
