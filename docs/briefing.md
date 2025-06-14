# Briefing: Funnel Mapping Tool (MVP)

## 1. Resumo da Ideia
Ferramenta visual para criação e simulação de funis e fluxogramas, permitindo desenhar, conectar, validar hipóteses e rodar cenários de conversão de forma simples, prática e visual. Inspirada em Funnel Lytics/Geru, mas mais simples e acessível, indo além de ferramentas como Whimsical ou Draw.io.

## 2. Análise das Prioridades de Desenvolvimento
1. Canvas infinito com nodes/blocos básicos e conectores animados
2. Sidebar de blocos (arrastar/clicar para adicionar)
3. Mini mapa de navegação
4. Header com navegação e mock de projetos/pastas
5. Exportação (PDF/PNG/JPG)
6. Compartilhamento (mock de URL)
7. Pressets de funis
8. Bloco de URL com snapshot

## 3. Recomendações de Tecnologias
- **UI:** React + Next.js, TailwindCSS, animações com Framer Motion ou CSS, ícones Lucide
- **Componentes:** shadcn/ui ou Magic UI para microanimações e acessibilidade
- **Canvas:** React Flow, Konva.js ou custom SVG/HTML5 Canvas
- **Exportação:** html2canvas, jsPDF
- **Estado:** Zustand ou Context API (local, sem backend)

## 4. Aplicação do padrão @perfect_UI_UX.mdc
- Clareza, hierarquia visual, responsividade (mobile-first)
- Microinterações e feedback visual em todas ações
- Loading states para ações >200ms
- Acessibilidade: navegação por teclado, contraste mínimo 4.5:1, dark mode
- Consistência visual, espaçamento mínimo 1rem, componentes reutilizáveis
- Skeletons para carregamento, mensagens de erro claras
- Touch targets ≥ 48x48px

## 5. Briefing Final

### 1. Problema/Objetivo
Facilitar a criação, visualização e simulação de funis e fluxogramas de marketing, permitindo validar hipóteses e cenários de conversão de forma visual, simples e prática.

### 2. Usuário-alvo
- Profissionais de marketing digital
- Gestores de tráfego
- Empreendedores
- Times de produto e growth

### 3. Funcionalidades-chave (MVP)
- Canvas infinito para desenhar funis/fluxogramas
- Nodes/blocos customizáveis (pré-criados e livres)
- Conectores animados (linhas trastejadas, bolinha animada)
- Sidebar de blocos (arrastar/clicar para adicionar)
- Mini mapa de navegação
- Mock de projetos/pastas
- Exportação (PDF/PNG/JPG)
- Compartilhamento de URL (mock)

### 4. User Stories
- Como gestor de marketing, quero desenhar um funil visualmente, para validar hipóteses de conversão.
- Como usuário, quero arrastar blocos para o canvas, para montar fluxogramas de forma rápida.
- Como analista, quero exportar o funil criado como PDF, para compartilhar com meu time.

### 5. Critérios de Aceite
- Usuário consegue criar, conectar e editar blocos no canvas
- Exportação funcional para PDF/PNG/JPG
- Interface responsiva, clara e acessível
- Microanimações e feedback visual presentes
- Mock de projetos/pastas e compartilhamento funcionando

### 6. Fora de Escopo
- Backend real (persistência, autenticação, colaboração real-time)
- Integração com banco de dados
- Compartilhamento real (apenas mock)
- Edição colaborativa

### 7. Dados Manipuláveis
- Blocos/nodes (tipo, texto, cor, tamanho, URL)
- Conexões entre blocos
- Estrutura de projetos/pastas (mock)

### 8. Design/UI
- Seguir padrões do perfect_UI_UX.mdc
- Paleta clara e escura (dark mode)
- Tipografia legível, ícones Lucide
- Microanimações e feedback visual

### 9. Edge Cases
- Conexão inválida entre blocos
- Exportação de canvas vazio
- Adição de URL inválida em bloco
- Arrastar bloco fora do canvas

## 📦 Requisitos Técnicos do MVP
- Rodar localmente e via navegador
- Apenas interface (UI), sem backend
- Microanimações, responsivo e leve
- shadcn/ui ou Tailwind, boas práticas de componentização
- Código modular e escalável

---

### Prompt Reutilizável
Crie um MVP de Funnel Mapping Tool: canvas infinito, nodes/blocos customizáveis, conectores animados, sidebar de blocos, mini mapa, exportação (PDF/PNG/JPG), mock de projetos/pastas e compartilhamento. Use React, Next.js, Tailwind, shadcn/ui/Magic UI, foco em UI/UX perfeito, responsivo, acessível, microanimações, sem backend. Siga as regras do perfect_UI_UX.mdc. 