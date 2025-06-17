# 📖 Manual de Uso - Flow X

## 🎯 Visão Geral

Flow X é uma ferramenta visual para criação de funis de marketing e fluxogramas. Com interface drag-and-drop, salvamento automático em nuvem via Convex, e recursos avançados de exportação e colaboração.

---

## 🚀 Primeiros Passos

### 1. **Iniciando o App**
- Acesse o app no navegador
- Aguarde o **Splash Screen** com logo animado (3 segundos)
- A interface principal será carregada automaticamente

### 2. **Interface Principal**
O app é dividido em 4 áreas principais:
- **Header**: Navegação, projetos, exportação e tema
- **Sidebar**: Biblioteca de blocos arrastáveis
- **Canvas**: Área de trabalho infinita
- **Admin Panel**: Gerenciamento de dados (canto inferior direito)

---

## 🎨 Usando o Canvas

### **Navegação no Canvas**
- **Pan (Mover)**: Clique e arraste no fundo
- **Zoom**: Use scroll do mouse ou controles `+/-`
- **Fit View**: Botão para centralizar todo o conteúdo
- **Mini Map**: Navegação visual (canto inferior direito)

### **Adicionando Blocos**
Existem 2 formas de adicionar blocos:

#### **1. Drag & Drop (Arrastar e Soltar)**
1. Escolha um bloco na sidebar
2. Clique e arraste até o canvas
3. Solte na posição desejada
4. O bloco será criado automaticamente

#### **2. Click to Add (Clique para Adicionar)**
1. Clique uma vez em qualquer bloco da sidebar
2. O bloco será adicionado no centro do canvas
3. Mova conforme necessário

### **Tipos de Blocos Disponíveis**

#### **🎯 Funnel Steps (Etapas de Funil)**
- **Landing Page** - Página de captura
- **Thank You** - Página de agradecimento  
- **Checkout** - Página de pagamento
- **Signup** - Formulário de cadastro
- **Survey** - Pesquisa/questionário
- **Download** - Página de download
- **Calendar** - Agendamento
- **User Profile** - Perfil do usuário

#### **📝 Traditional Blocks (Blocos Tradicionais)**
- **CTA (Call to Action)** - 3 variantes disponíveis
- **Post** - Conteúdo/blog
- **Comments** - Comentários/feedback
- **Popup** - Modal/popup
- **URL** - Redirecionamento
- **Generic** - Bloco genérico

### **Conectando Blocos**
1. **Hover** sobre um bloco para ver os **handles** (pontos de conexão)
2. **Clique e arraste** de um handle para outro bloco
3. A **linha pontilhada azul animada** será criada
4. Conexões **não podem** ser feitas no mesmo bloco
5. Conexões **duplicadas** são automaticamente prevenidas

### **Editando Blocos**
- **Clique** em um bloco para selecioná-lo
- **Duplo clique** para editar o texto/label
- Use **setas do teclado** para mover blocos selecionados
- **Delete** para remover blocos selecionados

### **Deletando Conexões**
1. **Clique** na linha de conexão para selecioná-la
2. Pressione **Delete** ou **Backspace**
3. A conexão será removida

### **Snap to Grid**
- **Toggle** no controle superior do canvas
- Grade de **16x16px** para alinhamento preciso
- Estado salvo durante a sessão

---

## 📁 Gerenciamento de Projetos

### **Seletor de Projetos (Header)**
- **Projeto Atual**: Exibido com nome e pasta
- **Dropdown**: Clique para ver todos os projetos
- **Filtros**: Por pasta (Marketing, Sales, Product, Support)
- **Status**: Active, Draft, Archived

### **Estrutura de Pastas Mock**
- **Marketing** (azul) - 5 projetos
- **Sales** (verde) - 3 projetos  
- **Product** (amarelo) - 8 projetos
- **Support** (vermelho) - 2 projetos

### **Projetos Exemplo**
- **Lead Generation Funnel** (Marketing, Active)
- **Product Onboarding** (Product, Draft)
- **Sales Pipeline** (Sales, Active)
- **Customer Support Flow** (Support, Archived)

---

## 💾 Sistema de Salvamento (Convex)

### **Auto-Save Automático**
- **Debouncing**: 2 segundos após última alteração
- **Sincronização**: Real-time com backend Convex
- **Indicadores Visuais**: 
  - ⏳ "Salvando..." durante sync
  - ✅ "Salvo" quando completo
  - ⚠️ "Alterações não salvas" se pendente

### **Dados Salvos Automaticamente**
- **Nodes**: Posição, tipo, label, estilo
- **Edges**: Conexões entre blocos
- **Viewport**: Posição e zoom do canvas
- **Metadata**: Timestamps, projeto associado

### **Backend Convex**
- **Deployment**: `dev:next-gopher-397`
- **URL**: `https://next-gopher-397.convex.cloud`
- **Tabelas**: projects, flows, nodes, edges, folders
- **Real-time**: Sincronização instantânea

---

## 🔧 Admin Panel

O **Admin Panel** é uma ferramenta de desenvolvimento/administração localizada no **canto inferior direito**.

### **Acessando o Admin Panel**
1. **Botão ⚙️**: Círculo vermelho fixo no canto inferior direito
2. **Clique** para abrir o painel
3. **✕** para fechar

### **Funcionalidades Disponíveis**

#### **🌱 Seed Database**
- **Função**: Popula o banco com dados de exemplo
- **Conteúdo**: 4 pastas, 12 projetos, flows de exemplo
- **Dados Mock**: 
  - Landing pages com CTAs
  - Checkout flows
  - Survey forms
  - Conexões animadas
- **Uso**: Ideal para testar funcionalidades

#### **📊 Get Stats**
- **Função**: Mostra estatísticas do banco
- **Informações**: 
  - Número de pastas
  - Total de projetos  
  - Flows existentes
  - Nodes criados
  - Edges conectados
- **Uso**: Monitoramento de uso

#### **🗑️ Clear Database**
- **Função**: Remove TODOS os dados
- **Confirmação**: Modal de segurança obrigatório
- **Aviso**: ⚠️ **IRREVERSÍVEL** - use com cuidado
- **Uso**: Reset completo para desenvolvimento

### **Estados do Admin Panel**
- **Loading**: ⏳ Mostra durante operações
- **Success**: ✅ Confirmação de sucesso
- **Error**: ❌ Mensagens de erro detalhadas
- **Info**: 💡 Dica de uso no rodapé

---

## 📤 Exportação e Importação

### **Menu de Exportação**
Acesse via **botão "Export"** no header.

#### **Formatos de Exportação**
- **📄 PDF**: Documento para apresentação
- **🖼️ PNG**: Imagem com fundo transparente
- **📸 JPG**: Imagem comprimida
- **📊 JSON**: Dados estruturados (compatível n8n)

#### **Exportação JSON**
```json
{
  "name": "Nome do Projeto",
  "nodes": [...],
  "connections": {...},
  "version": "1.0",
  "createdAt": "2024-01-XX"
}
```

### **Importação de Flows**
1. **Menu Export** → **Import**
2. Selecione arquivo **JSON**
3. Validação automática do formato
4. **Sucesso**: Flow carregado no canvas
5. **Erro**: Mensagem de formato inválido

---

## 🔗 Compartilhamento

### **Share Modal**
- **Botão "Share"** no header
- **URL Mockada**: Para demonstração
- **Funcional**: Interface pronta para implementação real
- **Recursos**: Copy link, social sharing (mock)

---

## 🌓 Temas e Personalização

### **Theme Toggle**
- **Botão** no header (☀️/🌙)
- **Light Mode**: Tema claro profissional
- **Dark Mode**: Tema escuro moderno (Monokai/Dracula inspired)

### **Cores do Sistema**
#### **Dark Theme**
- **Primary**: #1F2937 (cinza escuro)
- **Accent**: #FE5F55 (coral suave)  
- **Success**: #6EEB83 (verde)
- **Danger**: #D73120 (vermelho logo)
- **Warning**: #FFAE03 (laranja)

#### **Canvas Colors**
- **Background**: Grid pattern responsivo
- **Edges**: Azul animado (#2563eb)
- **Selection**: Ring com offset
- **Handles**: Tamanhos otimizados

---

## ⌨️ Atalhos do Teclado

### **Navegação**
- **Espaço + Drag**: Pan no canvas
- **Scroll**: Zoom in/out
- **Setas**: Mover blocos selecionados

### **Edição**
- **Delete/Backspace**: Remover blocos/edges selecionados
- **Duplo clique**: Editar texto do bloco
- **Esc**: Cancelar edição/seleção

### **Seleção**
- **Clique**: Selecionar bloco/edge
- **Ctrl + A**: Selecionar tudo (futuro)
- **Clique + Drag**: Multi-seleção (futuro)

---

## 🔍 Recursos Avançados

### **Mini Map**
- **Localização**: Canto inferior direito do canvas
- **Função**: Navegação visual em flows grandes
- **Interação**: Clique para mover viewport
- **Toggle**: Show/hide disponível

### **Controls Bar**
- **Zoom In/Out**: Botões + e -
- **Fit View**: Centralize todo conteúdo
- **Lock**: Previne movimentação acidental
- **Snap Grid**: Toggle de alinhamento

### **Background Grid**
- **Padrão**: Dots/lines responsivo
- **Espaçamento**: 16px otimizado
- **Tema**: Adapta-se ao light/dark mode
- **Performance**: Renderização otimizada

---

## 🐛 Solução de Problemas

### **Canvas não carrega**
1. Verifique conexão com internet
2. Aguarde sincronização Convex
3. Recarregue a página (F5)
4. Verifique Admin Panel para stats

### **Drag & Drop não funciona**
1. Certifique-se que o canvas está visível
2. Tente usar "Click to Add" como alternativa
3. Verifique console do navegador (F12)
4. Recarregue se necessário

### **Salvamento falhou**
1. Verifique indicador visual no canvas
2. Use Admin Panel para verificar stats
3. Tente salvar manualmente via botão
4. Verifique conexão de rede

### **Exportação não funciona**
1. Certifique-se que há conteúdo no canvas
2. Tente formato diferente (PNG → PDF)
3. Verifique permissões de download
4. Use versão mais recente do navegador

---

## 📊 Monitoramento e Performance

### **Indicadores de Estado**
- **Loading States**: Para todas operações assíncronas
- **Save Status**: Visual feedback de sync
- **Error Messages**: Mensagens detalhadas
- **Success Confirmations**: Feedback positivo

### **Performance Tips**
- **Flows Grandes**: Use Mini Map para navegação
- **Muitos Blocos**: Considere dividir em múltiplos projects
- **Auto-save**: 2s debouncing evita saves excessivos
- **Memory**: Navegador moderno recomendado

---

## 🔮 Funcionalidades Futuras

### **Em Desenvolvimento (Tasks 7.0-8.0)**
- **Node Properties Panel**: Customização avançada
- **Colaboração Real-time**: Múltiplos usuários
- **Templates**: Flows pré-construídos
- **Analytics**: Métricas de uso
- **API Integration**: Conectores externos

### **Roadmap**
- **Authentication**: Login/registro
- **Teams**: Workspaces colaborativos
- **Versioning**: Histórico de alterações
- **Comments**: Anotações nos flows
- **Mobile**: Versão responsiva

---

## 🆘 Suporte

### **Documentação**
- **Takeaways**: `/docs/takeaways.md`
- **Color Guide**: `/docs/Color Palette Guide - Marketing App.md`
- **Tasks**: `/tasks/tasks-prd-funnel-mapping-tool.md`

### **Debug**
- **Console**: F12 para logs detalhados
- **Admin Panel**: Stats e controles
- **Network Tab**: Verificar requests Convex

### **GitHub**
- **Repository**: Flow_X0
- **Issues**: Reportar bugs
- **Commits**: Histórico de mudanças

---

## ✅ Checklist de Uso

### **Primeiro Uso**
- [ ] Abrir app e aguardar splash screen
- [ ] Explorar interface (Header, Sidebar, Canvas)
- [ ] Usar Admin Panel para Seed Database
- [ ] Criar primeiro flow drag & drop
- [ ] Testar conexões entre blocos
- [ ] Verificar auto-save funcionando

### **Uso Diário**
- [ ] Selecionar projeto apropriado
- [ ] Criar/editar flows conforme necessário
- [ ] Usar snap-to-grid para alinhamento
- [ ] Exportar para apresentações
- [ ] Verificar stats no Admin Panel

### **Troubleshooting**
- [ ] Recarregar página em caso de problemas
- [ ] Verificar stats do database
- [ ] Limpar cache do navegador se necessário
- [ ] Reportar bugs com console logs

---

## 🎉 Conclusão

Flow X é uma ferramenta poderosa e intuitiva para criação de funis visuais. Com backend Convex confiável, interface moderna e recursos avançados, oferece tudo necessário para criar fluxogramas profissionais.

**Dúvidas?** Consulte os logs do console (F12) ou use o Admin Panel para verificar o estado do sistema.

**Happy Flow Building! 🚀** 