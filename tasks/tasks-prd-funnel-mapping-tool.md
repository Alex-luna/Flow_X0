## Relevant Files

- `components/Canvas.tsx` - Componente principal do canvas infinito para desenhar funis e fluxogramas com drag & drop corrigido.
- `components/Sidebar.tsx` - Biblioteca de blocos arrastáveis/clicáveis completamente redesenhada com layout limpo.
- `components/MiniMap.tsx` - Mini mapa para navegação do canvas.
- `components/Header.tsx` - Header para navegação e mock de projetos/pastas.
- `components/ExportMenu.tsx` - Exportação do canvas (PDF/PNG/JPG/JSON) e importação de fluxos.
- `components/ShareModal.tsx` - Compartilhamento de URL (mock).
- `components/Node.tsx` - Blocos/nodes customizáveis com composição de layers corrigida e tamanhos proporcionais.
- `components/ComposedBlockIcon.tsx` - Componente para composição de ícones base + overlay com z-index correto.
- `components/icons/` - Diretório com todos os 16 ícones SVG convertidos para React components.
- `lib/utils/canvasHelpers.ts` - Funções utilitárias para manipulação do canvas e serialização/deserialização de fluxos.
- `lib/utils/jsonSchema.ts` - Schema e helpers para exportação/importação JSON (compatível com n8n).
- `styles/` - Estilos globais e de componentes (Tailwind ou shadcn/ui).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Implement Infinite Canvas and Node System
- [x] 2.0 Build Sidebar with Draggable/Clickable Blocks
- [ ] 3.0 Add Mini Map for Canvas Navigation
- [ ] 4.0 Create Header with Project/Folder Mock Management
- [ ] 5.0 Implement Export, Import, and Share Functionality
- [ ] 6.0 Implement Data Persistency (Local Storage)

---

### Sub-Tasks

- [x] 1.0 Implement Infinite Canvas and Node System
  - [x] 1.1 Infinite canvas component using React Flow
  - [x] 1.2 Basic node types (blocks, triggers, etc.)
  - [x] 1.3 Node connections and flow logic
  - [x] 1.4 Implement selection, multi-select, and node editing (text, color, etc.)
  - [x] 1.5 Handle edge cases (invalid connections, dragging outside canvas)
  - [x] 1.6 Add keyboard navigation and accessibility features

- [x] 2.0 Build Sidebar with Draggable/Clickable Blocks
  - [x] 2.1 Create pre-made blocks library with SVG icons converted to React components
    - [x] Convert all 16 SVG files to React components:
      - [x] ThankyouIcon.tsx (thank you page interface)
      - [x] UserIcon.tsx (user profile interface)  
      - [x] PostIcon.tsx (content/blog post interface)
      - [x] PopupIcon.tsx (popup/modal interface)
      - [x] CommentsIcon.tsx (comments/feedback interface)
      - [x] CTA1Icon.tsx (call-to-action with video player)
      - [x] CTA2Icon.tsx (call-to-action variant 2)
      - [x] CTA3Icon.tsx (call-to-action variant 3)
      - [x] ScreenIcon.tsx (base screen template)
      - [x] UrlIcon.tsx (URL redirect interface)
      - [x] SurveyIcon.tsx (survey/form interface)
      - [x] SignupIcon.tsx (registration form interface)
      - [x] CheckoutIcon.tsx (payment/checkout interface)
      - [x] GenericIcon.tsx (generic page template)
      - [x] CalendarIcon.tsx (calendar/scheduling interface)
      - [x] DownloadIcon.tsx (download/file interface)
    - [x] Update Sidebar.tsx to use React components instead of direct SVG imports
    - [x] Fixed TypeScript compatibility and import paths
    - [x] Verified all components render correctly in development environment
  - [x] 2.2 Implement drag-and-drop from sidebar to canvas
    - [x] Fixed drag-and-drop data transfer to correctly pass node type and properties
    - [x] Improved sidebar layout with proper spacing and grid layout (2x2 for funnel steps)
    - [x] Enhanced visual design with better borders, shadows, and hover effects
    - [x] Increased icon sizes from 56px to 80px for better visibility
    - [x] Improved node rendering with specific layouts for funnel steps vs traditional blocks
    - [x] Fixed node selection visual feedback with proper borders and shadows
    - [x] Enhanced ComposedBlockIcon component for better icon composition
    - [x] Added proper TypeScript interfaces for custom node properties
    - [x] Implemented correct icon mapping for each funnel step type
  - [x] 2.3 Click-to-add blocks functionality
    - [x] Both drag-and-drop and click-to-add work correctly
    - [x] Proper node type identification and rendering
    - [x] Correct label display and editing functionality
  - [x] 2.4 Fix proportions and visual issues (HOTFIX)
    - [x] **Nodes Resized**: Funnel steps now 100x120px (down from 160x200px) 
    - [x] **Traditional blocks**: 80x30px (down from 140x60px)
    - [x] **SVG Layers Fixed**: Removed interfering white background, proper z-index (base: 1, overlay: 2)
    - [x] **Sidebar Redesigned**: Clean layout with 208px width, proper tabs, better spacing
    - [x] **Icon Sizes**: Sidebar icons 24px, canvas icons 50px (proper proportions)
    - [x] **Labels Positioning**: Labels now positioned below icons with backdrop-blur background
    - [x] **Selection Visual**: Removed misaligned rectangles, added ring-based selection
    - [x] **Drag & Drop Fixed**: Added proper error handling and console logging
    - [x] **TypeScript Fixed**: Corrected drag event types and Canvas interfaces
  - [x] 2.5 Final proportions and functionality corrections (FINAL FIX)
    - [x] **Node Sizes Updated**: Funnel steps now 105x135px (as requested by user)
    - [x] **Sidebar Width**: Increased to 220px for better spacing
    - [x] **Grid Spacing**: Added proper 4px gaps between sidebar elements
    - [x] **Grid Alignment**: Fixed 2x2 grid alignment with proper padding
    - [x] **SVG Layer Positioning**: Fixed z-index hierarchy (base: 10, overlay: 20, label: 30)
    - [x] **Drag & Drop Circular JSON Error**: Fixed by creating serializable drag data objects
    - [x] **Selection Visual**: Proper separation of layers with correct spacing
    - [x] **Icon Sizes**: Optimized to 32px in sidebar, 64px in canvas for better visibility
    - [x] **Component Integration**: Updated MainAppClient.tsx to work with new interfaces
    - [x] **TypeScript Errors**: Fixed all linter errors and type definitions
  - [x] 2.6 CRITICAL FIXES
    - [x] **Edges Animados**: Linhas pontilhadas azuis com animação contínua
    - [x] **Prevenção de Auto-conexão**: Nodes não podem se conectar a si mesmos
    - [x] **Prevenção de Duplicatas**: Evita conexões duplicadas entre os mesmos nodes
    - [x] **Estilo Personalizado**: Stroke azul (#2563eb), largura 2px, dash pattern 6-4
    - [x] **Toggle Funcional**: Checkbox para ligar/desligar snap to grid
    - [x] **Grid 16x16**: Espaçamento otimizado para alinhamento
    - [x] **Controles Visuais**: Barra de controles no topo do canvas
    - [x] **Estado Persistente**: Mantém configuração durante a sessão
    - [x] **Data Transfer Duplo**: JSON + text/plain para compatibilidade
    - [x] **Logging Melhorado**: Emojis para debug visual (🚀✅❌)
    - [x] **Error Handling**: Try/catch em todas as operações
    - [x] **Accessibility**: ARIA labels e role="button"
    - [x] **Tamanho Exato**: Node container 105x135px = SVG size
    - [x] **Zero Padding**: Eliminado espaço entre SVG e máscara
    - [x] **Posicionamento Absoluto**: SVG preenche 100% do container
    - [x] **Labels Externos**: Posicionados -bottom-6 para não interferir
    - [x] **Ring Selection**: Seleção externa com ring-offset-2
    - [x] **Overlay Centralizado**: Ícones perfeitamente centralizados no screen
    - [x] **Handles Otimizados**: Tamanhos adequados (3x3px funnel, 2x2px blocos)
    - [x] **Background Grid**: 16px gap para melhor visualização
    - [x] **Controls Bar**: Interface limpa com instruções para o usuário
    - [x] **Add Node Button**: Botão para adicionar nodes programaticamente
    - [x] **Pan & Zoom**: Controles de navegação melhorados
    - [x] **Node Extent**: Área limitada para evitar nodes perdidos
    - [x] **Mini Map**: Navegação visual do canvas
  - [x] 2.7 Perfect SVG-Container Size Match
    - [x] **ScreenIcon Resized**: Exact 105x135px dimensions
    - [x] **Container Match**: Removed padding/borders for seamless appearance
    - [x] **preserveAspectRatio**: Added "none" for perfect scaling
    - [x] **Visual Unity**: SVG and container appear as single element
  - [x] 2.8 Fix Critical Connection and Visual Issues (PRIORITY 1)
    - [x] 2.8.1 Restore connection handles visibility and functionality
    - [x] 2.8.2 Fix node labels disappearing on canvas
    - [x] 2.8.3 Fix drag & drop functionality from sidebar to canvas
  - [x] 2.9 Enhance Inner SVG Content (PRIORITY 2)
    - [x] 2.9.1 Increase overlay icon size by 4x within screen boundaries
    - [x] 2.9.2 Ensure proper spacing and visual balance
    - [x] 2.9.3 Maintain responsive scaling
  - [x] 2.10 Implement Edge Deletion Functionality (PRIORITY 2)
    - [x] 2.10.1 Add click-to-delete edges functionality
    - [x] 2.10.2 Add keyboard shortcut for edge deletion (Delete/Backspace)
    - [x] 2.10.3 Add visual feedback for edge selection/hover
    - [x] 2.10.4 Implement edge context menu with delete option
  - [ ] 2.11 Implement Node Properties Panel (PRIORITY 3)
    - [ ] 2.11.1 Create right sidebar panel component
    - [ ] 2.11.2 Add node selection state management
    - [ ] 2.11.3 Implement name editing functionality
    - [ ] 2.11.4 Add color picker for node customization
    - [ ] 2.11.5 Add connector direction toggle (horizontal/vertical)
    - [ ] 2.11.6 Integrate panel with node selection events

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

**Task 2.6 CRITICAL FIXES Completion Summary:**
✅ **Todas as Funcionalidades Essenciais Restauradas e Melhoradas**

**🔗 Linhas Pontilhadas Animadas:**
- **Edges Animados**: Linhas pontilhadas azuis com animação contínua
- **Prevenção de Auto-conexão**: Nodes não podem se conectar a si mesmos
- **Prevenção de Duplicatas**: Evita conexões duplicadas entre os mesmos nodes
- **Estilo Personalizado**: Stroke azul (#2563eb), largura 2px, dash pattern 6-4

**⚙️ Snap to Grid UI:**
- **Toggle Funcional**: Checkbox para ligar/desligar snap to grid
- **Grid 16x16**: Espaçamento otimizado para alinhamento
- **Controles Visuais**: Barra de controles no topo do canvas
- **Estado Persistente**: Mantém configuração durante a sessão

**🎯 Drag & Drop Corrigido:**
- **Data Transfer Duplo**: JSON + text/plain para compatibilidade
- **Logging Melhorado**: Emojis para debug visual (🚀✅❌)
- **Error Handling**: Try/catch em todas as operações
- **Accessibility**: ARIA labels e role="button"

**📐 Espaçamento SVG Eliminado:**
- **Tamanho Exato**: Node container 105x135px = SVG size
- **Zero Padding**: Eliminado espaço entre SVG e máscara
- **Posicionamento Absoluto**: SVG preenche 100% do container
- **Labels Externos**: Posicionados -bottom-6 para não interferir
- **Ring Selection**: Seleção externa com ring-offset-2

**🎨 Melhorias Visuais:**
- **Overlay Centralizado**: Ícones perfeitamente centralizados no screen
- **Handles Otimizados**: Tamanhos adequados (3x3px funnel, 2x2px blocos)
- **Background Grid**: 16px gap para melhor visualização
- **Controls Bar**: Interface limpa com instruções para o usuário

**🔧 Funcionalidades Adicionais:**
- **Add Node Button**: Botão para adicionar nodes programaticamente
- **Pan & Zoom**: Controles de navegação melhorados
- **Node Extent**: Área limitada para evitar nodes perdidos
- **Mini Map**: Navegação visual do canvas

**Resultado:** Interface completamente funcional com todas as funcionalidades essenciais restauradas, proporções perfeitas conforme referência visual, e experiência de usuário otimizada.

**Next Steps:** Ready for Task 3.0 (Mini Map implementation) when user approves. 