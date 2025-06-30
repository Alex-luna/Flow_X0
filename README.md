# 🎯 Flow X0 - Funnel Mapping Tool

Uma ferramenta visual intuitiva para criação e simulação de funis e fluxogramas de marketing, permitindo validar hipóteses e cenários de conversão de forma simples, prática e visual.

![Flow X0 Banner](./Assets/banner.png)

## 📋 Sobre o Projeto

Flow X0 é um MVP focado em interface (sem backend) que permite aos profissionais de marketing digital, gestores de tráfego e empreendedores criarem funis visuais de forma rápida e eficiente. Inspirado em ferramentas como Funnel Lytics e Geru, mas com foco na simplicidade e acessibilidade.

### 🎯 Problema Resolvido
Facilitar a criação, visualização e simulação de funis e fluxogramas de marketing, permitindo validar hipóteses e cenários de conversão de forma visual, simples e prática.

### 👥 Usuários-alvo
- Profissionais de marketing digital
- Gestores de tráfego
- Empreendedores
- Times de produto e growth

## ✨ Funcionalidades Principais

### 🎨 Canvas Infinito
- Canvas infinito para desenhar funis e fluxogramas
- Drag & drop intuitivo
- Snap to grid opcional (16x16px)
- Navegação com zoom e pan

### 🧩 Biblioteca de Blocos
- **16 tipos de blocos pré-definidos:**
  - Thank You Page
  - User Profile
  - Content/Blog Post
  - Popup/Modal
  - Comments/Feedback
  - Call-to-Action (3 variações)
  - Base Screen Template
  - URL Redirect
  - Survey/Form
  - Registration Form
  - Payment/Checkout
  - Generic Page
  - Calendar/Scheduling
  - Download/File

### 🔗 Conectores Animados
- Linhas pontilhadas azuis com animação contínua
- Prevenção de auto-conexão
- Prevenção de conexões duplicadas
- Estilo personalizado e responsivo

### 🗺️ Navegação
- Mini mapa para navegação do canvas
- Controles de zoom e pan
- Barra de controles no topo

### 📤 Exportação
- Exportação em PDF, PNG e JPG
- Exportação em JSON (compatível com n8n)
- Importação de fluxos JSON
- Compartilhamento via URL (mock)

### 💾 Persistência Local
- Salvamento automático no localStorage
- Carregamento do último projeto
- Gerenciamento de projetos/pastas (mock)

### 🎯 Edição Inline
- Duplo clique para editar títulos de qualquer node

### ⚡ Performance
- Updates otimizados com sincronização em tempo real

## 🛠️ Stack Técnica

### Frontend
- **React 18** - Framework principal
- **Next.js 14** - Framework full-stack
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes de UI
- **Framer Motion** - Animações

### Canvas e Fluxo
- **React Flow** - Sistema de canvas e nodes
- **Lucide React** - Ícones
- **html2canvas** - Captura de canvas
- **jsPDF** - Geração de PDF

### Estado e Utilitários
- **Zustand** - Gerenciamento de estado
- **clsx** - Utilitário de classes CSS
- **React Hook Form** - Gerenciamento de formulários

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd Flow_X0

# Navegue até a aplicação
cd my_app

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev

# Ou com yarn
yarn install
yarn dev
```

### Build para Produção

```bash
# Build da aplicação
npm run build

# Execução da build
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
Flow_X0/
├── my_app/                 # Aplicação principal
│   ├── app/               # App Router (Next.js 14)
│   │   ├── components/        # Componentes React
│   │   │   ├── Canvas.tsx     # Canvas principal
│   │   │   ├── Sidebar.tsx    # Biblioteca de blocos
│   │   │   ├── Node.tsx       # Componente de node
│   │   │   ├── MiniMap.tsx    # Mini mapa
│   │   │   ├── Header.tsx     # Cabeçalho
│   │   │   └── icons/         # Ícones SVG customizados
│   │   ├── lib/              # Utilitários e helpers
│   │   │   └── utils/        # Funções auxiliares
│   │   └── styles/           # Estilos globais
│   ├── docs/                 # Documentação
│   ├── tasks/               # Documentos de planejamento
│   └── Assets/              # Assets do projeto
```

## 🎨 Design System

### Princípios de UI/UX
- **Clareza First:** Cada elemento serve um propósito claro
- **Hierarquia Visual:** Níveis de importância bem definidos
- **Responsividade:** Mobile-first design
- **Acessibilidade:** WCAG 2.1 AA compliance
- **Microinterações:** Feedback visual em todas as ações

### Cores Principais
- **Azul Principal:** `#2563eb` (conexões e elementos primários)
- **Cinza Neutro:** `#6b7280` (textos secundários)
- **Verde Sucesso:** `#10b981` (ações positivas)
- **Vermelho Erro:** `#ef4444` (erros e validações)

### Espaçamento
- **Grid Base:** 16px
- **Espaçamento Mínimo:** 1rem
- **Touch Targets:** Mínimo 48x48px

## 📱 Responsividade

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** > 1024px

### Adaptações
- Sidebar colapsível em mobile
- Controles de toque otimizados
- Canvas responsivo com gestos

## ♿ Acessibilidade

### Recursos Implementados
- Navegação completa por teclado
- ARIA labels e roles adequados
- Contraste mínimo 4.5:1
- Suporte a screen readers
- Indicadores de foco visuais
- Modo escuro automático

### Testes
- Auditoria Lighthouse contínua
- Testes com simuladores de daltonismo
- Validação com leitores de tela

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test Canvas.test.tsx

# Executar testes em modo watch
npm test --watch
```

## 📈 Status do Desenvolvimento

### ✅ Concluído
- [x] Canvas infinito com React Flow
- [x] Sistema de nodes customizáveis
- [x] Biblioteca de 16 blocos pré-definidos
- [x] Drag & drop funcional
- [x] Conectores animados
- [x] Snap to grid
- [x] Controles de navegação
- [x] Edição de títulos inline
- [x] Performance otimizada

### 🚧 Em Desenvolvimento
- [ ] Mini mapa
- [ ] Header com gerenciamento de projetos
- [ ] Sistema de exportação completo
- [ ] Modal de compartilhamento
- [ ] Persistência local

### 📋 Roadmap
- [ ] Painel de propriedades de nodes
- [ ] Presets de funis prontos
- [ ] Temas personalizáveis
- [ ] Colaboração em tempo real
- [ ] Integração com APIs de marketing

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, espaços em branco, etc.
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [React Flow](https://reactflow.dev/) - Sistema de canvas
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Lucide](https://lucide.dev/) - Biblioteca de ícones
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

## 📞 Contato

**Luna Labs** - [contato@lunalabs.com.br](mailto:contato@lunalabs.com.br)

**Link do Projeto:** [https://github.com/lunalabs/flow-x0](https://github.com/lunalabs/flow-x0)

---

<div align="center">
  <p>Feito com ❤️ por <strong>Luna Labs</strong></p>
  <p>🚀 Transformando ideias em fluxos visuais</p>
</div> 