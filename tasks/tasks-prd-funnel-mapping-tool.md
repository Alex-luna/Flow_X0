## Relevant Files

- `components/Canvas.tsx` - Componente principal do canvas infinito para desenhar funis e fluxogramas.
- `components/Sidebar.tsx` - Biblioteca de blocos arrastáveis/clicáveis.
- `components/MiniMap.tsx` - Mini mapa para navegação do canvas.
- `components/Header.tsx` - Header para navegação e mock de projetos/pastas.
- `components/ExportMenu.tsx` - Exportação do canvas (PDF/PNG/JPG/JSON) e importação de fluxos.
- `components/ShareModal.tsx` - Compartilhamento de URL (mock).
- `components/Node.tsx` - Blocos/nodes customizáveis.
- `lib/utils/canvasHelpers.ts` - Funções utilitárias para manipulação do canvas e serialização/deserialização de fluxos.
- `lib/utils/jsonSchema.ts` - Schema e helpers para exportação/importação JSON (compatível com n8n).
- `styles/` - Estilos globais e de componentes (Tailwind ou shadcn/ui).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Implement Infinite Canvas and Node System
- [ ] 2.0 Build Sidebar with Draggable/Clickable Blocks
- [ ] 3.0 Add Mini Map for Canvas Navigation
- [ ] 4.0 Create Header with Project/Folder Mock Management
- [ ] 5.0 Implement Export, Import, and Share Functionality
- [ ] 6.0 Implement Data Persistency (Local Storage)

---

### Sub-Tasks

- [x] 1.0 Implement Infinite Canvas and Node System
  - [x] 1.1 Set up the canvas area using React Flow, Konva.js, or SVG/HTML5 Canvas
  - [ ] 1.2 Implement logic for adding, moving, and deleting nodes/blocks
  - [ ] 1.3 Implement connectors (dashed lines, animated flow indicator)
  - [ ] 1.4 Implement selection, multi-select, and node editing (text, color, etc.)
  - [ ] 1.5 Handle edge cases (invalid connections, dragging outside canvas)
  - [ ] 1.6 Add keyboard navigation and accessibility features

- [ ] 2.0 Build Sidebar with Draggable/Clickable Blocks
  - [ ] 2.1 Create a library of pre-made blocks (web page, CTA, email, funnel step)
  - [ ] 2.2 Implement freeform/custom block creation
  - [ ] 2.3 Enable drag-and-drop and click-to-add functionality
  - [ ] 2.4 Add icons and microanimations for feedback

- [ ] 3.0 Add Mini Map for Canvas Navigation
  - [ ] 3.1 Implement a mini map component synchronized with the main canvas
  - [ ] 3.2 Allow navigation and zoom via the mini map
  - [ ] 3.3 Ensure responsiveness and accessibility

- [ ] 4.0 Create Header with Project/Folder Mock Management
  - [ ] 4.1 Implement header layout and navigation
  - [ ] 4.2 Add mock project/folder creation, selection, and deletion (UI only)
  - [ ] 4.3 Display current project/folder name and status

- [ ] 5.0 Implement Export, Import, and Share Functionality
  - [ ] 5.1 Implement export of canvas as PDF, PNG, and JPG
  - [ ] 5.2 Implement export of flow as JSON (n8n-compatible schema)
  - [ ] 5.3 Implement import of flow from JSON (n8n-compatible schema)
  - [ ] 5.4 Implement share modal for mock URL sharing
  - [ ] 5.5 Handle export/import errors and edge cases (empty canvas, invalid JSON)

- [ ] 6.0 Implement Data Persistency (Local Storage)
  - [ ] 6.1 Save current flow/project state to local storage automatically
  - [ ] 6.2 Load last opened flow/project from local storage on app start
  - [ ] 6.3 Provide UI feedback for save/load actions
  - [ ] 6.4 Add option to reset/clear local storage data

---

I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed. 