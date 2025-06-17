# Paleta Dark Theme - App de Funis FX
## Sistema de Cores Otimizado para Dark Mode

### Análise da Interface Atual
Observando a tela atual, identifiquei os principais problemas:
- Falta de hierarquia visual clara
- Contraste inadequado entre elementos
- Sidebar muito escura sem diferenciação
- Área de trabalho (canvas) com fundo confuso
- Botões sem states visuais adequados

---

## Nova Paleta Dark Theme

### Cores Base do Sistema
| Elemento | Cor | RGB | HEX | Aplicação |
|----------|-----|-----|-----|-----------|
| **Background Principal** | Cinza Escuro Suave | `rgb(26, 32, 44)` | `#1A202C` | Fundo geral da aplicação |
| **Background Sidebar** | Cinza Mais Escuro | `rgb(20, 25, 36)` | `#141924` | Barra lateral de componentes |
| **Background Canvas** | Cinza Médio Escuro | `rgb(45, 55, 72)` | `#2D3748` | Área de trabalho principal |
| **Background Cards/Modals** | Cinza Elevado | `rgb(35, 42, 58)` | `#232A3A` | Cards, modais, elementos elevados |

### Cores da Marca (baseadas na logo FX)
| Cor | RGB | HEX | Uso |
|-----|-----|-----|-----|
| **Vermelho Principal** | `rgb(215, 49, 32)` | `#D73120` | CTAs principais, logo |
| **Vermelho Hover** | `rgb(195, 45, 28)` | `#C32D1C` | Estado hover do vermelho |
| **Vermelho Suave** | `rgb(215, 49, 32, 0.1)` | `#D7312019` | Backgrounds sutis, highlights |

### Cores Funcionais
| Função | Cor | RGB | HEX |
|--------|-----|-----|-----|
| **Sucesso** | Verde Dark | `rgb(56, 178, 93)` | `#38B25D` |
| **Atenção** | Âmbar Dark | `rgb(236, 158, 36)` | `#EC9E24` |
| **Informação** | Azul Dark | `rgb(66, 153, 225)` | `#4299E1` |
| **Perigo** | Vermelho Marca | `rgb(215, 49, 32)` | `#D73120` |

### Tons de Texto
| Tipo | Cor | RGB | HEX | Aplicação |
|------|-----|-----|-----|-----------|
| **Texto Principal** | Branco Suave | `rgb(245, 247, 250)` | `#F5F7FA` | Títulos, texto importante |
| **Texto Secundário** | Cinza Claro | `rgb(160, 174, 192)` | `#A0AEC0` | Subtítulos, descrições |
| **Texto Terciário** | Cinza Médio | `rgb(113, 128, 150)` | `#718096` | Placeholders, texto auxiliar |
| **Texto Desabilitado** | Cinza Escuro | `rgb(74, 85, 104)` | `#4A5568` | Elementos inativos |

---

## Aplicação Específica na Interface

### 1. Header/Barra Superior
```css
background: #1A202C
border-bottom: 1px solid #2D3748

/* Logo FX */
color: #D73120 (manter vermelho original)

/* Nome do Funil */
color: #F5F7FA
background: #232A3A (pill/badge)

/* Botão Share */
background: #D73120
color: #FFFFFF
hover: #C32D1C

/* Botão Export */
background: transparent
border: 1px solid #4A5568
color: #A0AEC0
hover: border-color: #D73120, color: #D73120

/* Status Auto-saved */
color: #38B25D (verde sucesso)
```

### 2. Sidebar de Componentes
```css
background: #141924
border-right: 1px solid #2D3748

/* Abas (Blocos/Funnel Steps) */
active: background: #D7312019, color: #D73120
inactive: color: #A0AEC0, hover: color: #F5F7FA

/* Ícones dos Componentes */
background: #232A3A
border: 1px solid #2D3748
color: #A0AEC0
hover: border-color: #D73120, color: #F5F7FA

/* Labels dos Componentes */
color: #A0AEC0
```

### 3. Área de Trabalho (Canvas)
```css
background: #2D3748
/* Padrão de grid sutil */
background-image: 
  radial-gradient(circle, #4A5568 1px, transparent 1px);
background-size: 20px 20px;
opacity: 0.3;
```

### 4. Toolbar Lateral (Zoom/Controles)
```css
background: #232A3A
border: 1px solid #2D3748
border-radius: 8px

/* Botões */
color: #A0AEC0
hover: color: #F5F7FA, background: #D7312019
```

### 5. Painel de Propriedades (Direita)
```css
background: #1A202C
border-left: 1px solid #2D3748

/* Cards internos */
background: #232A3A
border: 1px solid #2D3748
border-radius: 6px
```

### 6. Notificação de Issue
```css
background: #EC9E24
color: #1A202C
border-radius: 20px
```

---

## Estados Interativos

### Botões
| Estado | Estilo |
|--------|--------|
| **Default** | `bg: #D73120, color: #FFFFFF` |
| **Hover** | `bg: #C32D1C, transform: translateY(-1px)` |
| **Active** | `bg: #B22818, transform: translateY(0)` |
| **Disabled** | `bg: #4A5568, color: #718096, opacity: 0.6` |

### Cards/Componentes
| Estado | Estilo |
|--------|--------|
| **Default** | `bg: #232A3A, border: #2D3748` |
| **Hover** | `border: #D73120, box-shadow: 0 4px 12px rgba(215, 49, 32, 0.15)` |
| **Selected** | `border: #D73120, bg: #D7312008` |
| **Active** | `border: #D73120, bg: #D7312015` |

### Inputs/Forms
| Estado | Estilo |
|--------|--------|
| **Default** | `bg: #2D3748, border: #4A5568, color: #F5F7FA` |
| **Focus** | `border: #D73120, box-shadow: 0 0 0 3px rgba(215, 49, 32, 0.1)` |
| **Error** | `border: #D73120, bg: rgba(215, 49, 32, 0.05)` |
| **Success** | `border: #38B25D` |

---

## Melhorias de UX Sugeridas

### 1. Hierarquia Visual
- **Contraste claro** entre sidebar, canvas e painel de propriedades
- **Elevação visual** através de sombras sutis em elementos interativos
- **Agrupamento** de elementos relacionados com backgrounds diferenciados

### 2. Feedback Visual
- **Estados hover** mais evidentes em todos os elementos clicáveis
- **Transições suaves** (0.2s ease) em mudanças de estado
- **Indicadores visuais** claros para elementos selecionados/ativos

### 3. Redução de Fadiga Visual
- **Contrastes suaves** entre elementos adjacentes
- **Espaçamento consistente** (8px, 16px, 24px, 32px)
- **Cantos arredondados** (4px para pequenos, 8px para médios, 12px para grandes)

### 4. Consistência da Marca
- **Vermelho da logo** usado estrategicamente apenas em elementos importantes
- **Gradações sutis** do vermelho para criar hierarquia
- **Paleta limitada** mas bem aplicada para evitar poluição visual

---

## Implementação Gradual

### Fase 1: Backgrounds e Estrutura
1. Aplicar novos backgrounds nas áreas principais
2. Ajustar contrastes de texto
3. Implementar bordas sutis

### Fase 2: Estados Interativos
1. Implementar estados hover/active
2. Adicionar transições suaves
3. Melhorar feedback visual

### Fase 3: Refinamentos
1. Ajustar sombras e elevações
2. Polir detalhes de espaçamento
3. Testar acessibilidade

---

## Checklist de Acessibilidade

✅ **Contraste adequado** (mínimo 4.5:1 para texto normal)  
✅ **Estados focus** visíveis para navegação por teclado  
✅ **Cores não são única forma** de transmitir informação  
✅ **Elementos interativos** têm tamanho mínimo adequado  
✅ **Texto legível** em todos os backgrounds  

---

*Esta paleta foi desenvolvida especificamente para otimizar a experiência dark theme do FX, mantendo a identidade visual da marca enquanto melhora significativamente a usabilidade e hierarquia visual.*