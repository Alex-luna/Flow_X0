# Product Requirements Document (PRD): Funnel Mapping Tool (MVP)

## 1. Introduction/Overview
A Funnel Mapping Tool is a visual application for creating and simulating marketing funnels and flowcharts. The tool allows users to draw, connect, and validate hypotheses and conversion scenarios in a simple, practical, and visual way. It is inspired by tools like Funnel Lytics and Geru, but aims to be simpler and more accessible, going beyond diagramming tools like Whimsical or Draw.io by enabling scenario simulation and funnel logic.

## 2. Goals
- Enable users to visually create and edit marketing funnels and flowcharts.
- Allow users to simulate conversion scenarios (e.g., X people enter, Y% convert, etc.).
- Provide a simple, intuitive, and responsive UI for rapid prototyping and validation.
- Allow export of funnel diagrams as PDF, PNG, or JPG.
- Support basic project/folder organization (mocked, no backend).
- Allow sharing of funnel diagrams via a mock URL.

## 3. User Stories
- As a marketing manager, I want to visually draw a funnel so I can validate conversion hypotheses.
- As a user, I want to drag blocks onto the canvas to quickly build flowcharts.
- As an analyst, I want to export the created funnel as a PDF so I can share it with my team.

## 4. Functional Requirements
1. The system must provide an infinite canvas for drawing funnels and flowcharts.
2. The system must allow users to add, move, and delete nodes/blocks (pre-made and custom/freeform).
3. The system must support animated connectors (dashed lines, animated flow indicator).
4. The system must provide a sidebar with draggable/clickable blocks for adding to the canvas.
5. The system must include a mini-map for canvas navigation.
6. The system must provide a header for navigation and mock project/folder management.
7. The system must allow exporting the canvas as PDF, PNG, or JPG.
8. The system must allow sharing a mock URL for viewing a funnel (no real backend).
9. The system must provide funnel presets/templates for quick use.
10. The system must allow adding a URL to a node and display a snapshot of the page in the node (mocked).
11. The system must provide both pre-made blocks (e.g., web page, CTA, email, funnel step) and freeform blocks (custom size, text, color, etc.).
12. The system must handle invalid connections, empty canvas export, and invalid URLs gracefully.

## 5. Non-Goals (Out of Scope)
- Real backend (no persistence, authentication, or real-time collaboration)
- Database integration
- Real sharing/collaboration (only mock URLs)
- Collaborative editing

## 6. Design Considerations
- Follow perfect_UI_UX.mdc guidelines:
  - Clarity, strong visual hierarchy, mobile-first responsiveness
  - Microinteractions and visual feedback for all actions
  - Loading states for actions >200ms
  - Accessibility: keyboard navigation, minimum 4.5:1 contrast, dark mode
  - Consistent visuals, minimum 1rem spacing, reusable components
  - Skeletons for loading, clear error messages
  - Touch targets ≥ 48x48px
- Use a clear and readable typography, Lucide icons, and support both light and dark modes.
- Use shadcn/ui or TailwindCSS for component styling and layout.

## 7. Technical Considerations
- UI only, must run locally and in the browser
- Use React + Next.js, TailwindCSS, Zustand or Context API for state (no backend)
- Use React Flow, Konva.js, or custom SVG/HTML5 Canvas for the drawing area
- Use html2canvas and jsPDF for export functionality
- Modular, scalable, and componentized codebase
- Microanimations via Framer Motion or CSS

## 8. Success Metrics
- Users can create, connect, and edit blocks on the canvas
- Export to PDF/PNG/JPG works as expected
- UI is responsive, clear, and accessible
- Microanimations and visual feedback are present
- Mock project/folder management and sharing are functional

## 9. Open Questions
- Should the tool support undo/redo actions in the MVP?
- What level of customization is required for block appearance (color, icons, etc.)?
- Should the export include the mini-map or only the main canvas?
- Are there any specific funnel templates that must be included as presets?

---

**End of PRD** 