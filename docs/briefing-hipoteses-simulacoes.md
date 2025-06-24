# Briefing: Sistema de Hipóteses e Simulações para Flow X

---

## 1. Resumo da Ideia

Evolução do Flow X para incluir um **sistema inteligente de hipóteses e simulações**, transformando a ferramenta de desenho de funis em uma **plataforma analítica completa**. Permite criar cenários hipotéticos, definir variáveis de entrada/saída, simular fluxos de conversão com dados numéricos, e visualizar resultados em tempo real.

### Core Innovation
- **Transformar blocos estáticos** em **calculadoras dinâmicas**
- **Hipóteses baseadas em dados** (taxas de conversão, volumes, custos)
- **Simulação em tempo real** com visualização de métricas
- **Análise de sensibilidade** para validar cenários
- **Comparação de variações** lado a lado

---

## 2. Análise das Prioridades de Desenvolvimento

### **Fase 1: Fundação Analítica** (MVP+)
1. **Sistema de Variáveis**: Inputs/outputs para cada bloco
2. **Painel de Controle**: Sidebar direita com configurações de hipóteses
3. **Simulador Básico**: Cálculos de conversão em tempo real
4. **Visualização de Fluxo**: Números animados nas conexões

### **Fase 2: Inteligência Analítica**
5. **Cenários Múltiplos**: A/B/C testing visual
6. **Análise de Sensibilidade**: "E se?" dinâmico
7. **Dashboards de Resultados**: Métricas consolidadas
8. **Comparação Visual**: Lado a lado de cenários

### **Fase 3: Automação Avançada**
9. **Otimização Automática**: Sugestões baseadas em performance
10. **Alertas Inteligentes**: Notificações de mudanças críticas
11. **Relatórios Automatizados**: Exports analíticos

---

## 3. Recomendações de Tecnologias

### **Adições Específicas para Simulação**
- **Cálculo:** Math.js ou similar para expressões dinâmicas
- **Gráficos:** Recharts ou Chart.js para visualização de dados
- **Animações:** Framer Motion para transições de números
- **Formulários:** React Hook Form para configurações de hipóteses
- **Validação:** Zod para validação de inputs numéricos

### **Stack Mantida**
- **Base:** React + Next.js + Tailwind + shadcn/ui
- **Canvas:** React Flow (já implementado)
- **Estado:** Mantém Convex para persistência

---

## 4. Aplicação do padrão @perfect_UI_UX.mdc

### **UX Específico para Análise**
- **Feedback Visual Imediato**: Números mudam conforme inputs
- **Hierarquia de Informação**: Destaque para métricas críticas
- **Progressão Intuitiva**: Dos inputs simples aos insights avançados
- **Validação em Tempo Real**: Erros e limitações claras

### **Microinterações Analíticas**
- **Números Animados**: CountUp em mudanças de valores
- **Loading States**: Skeletons durante cálculos
- **Transições Suaves**: Entre cenários e configurações
- **Feedback Haptic**: Validação de inputs críticos

---

## 5. Briefing Final

### **1. Problema/Objetivo**
Transformar o Flow X de ferramenta de desenho em **plataforma de validação analítica**, permitindo testar hipóteses de negócio, simular cenários de conversão e tomar decisões baseadas em dados antes da execução.

### **2. Usuário-alvo Expandido**
- **Growth Managers**: Validação de hipóteses antes de implementar
- **Analistas de Performance**: Modelagem de cenários
- **Empreendedores**: ROI forecasting para investimentos
- **Consultores**: Apresentação de projeções para clientes

### **3. Funcionalidades-chave (Sistema de Hipóteses)**

#### **3.1 Painel de Configuração de Hipóteses**
- **Sidebar Direita**: Configurações do bloco selecionado
- **Inputs Dinâmicos**: Volume entrada, taxa conversão, custo por ação
- **Fórmulas Customizáveis**: Cálculos personalizados por bloco
- **Validação em Tempo Real**: Erros e warnings instantâneos

#### **3.2 Sistema de Variáveis**
- **Variáveis Globais**: Budget total, CAC médio, LTV target
- **Variáveis por Bloco**: Específicas de cada etapa do funil
- **Dependências**: Outputs de um bloco como inputs de outro
- **Condicionais**: "Se conversão < X, então..."

#### **3.3 Simulador Visual**
- **Números nas Conexões**: Volume fluindo entre blocos
- **Animações de Fluxo**: Velocidade baseada no volume
- **Cores por Performance**: Verde/vermelho baseado em metas
- **Métricas em Tempo Real**: ROI, CAC, conversões totais

#### **3.4 Análise de Cenários**
- **Múltiplos Cenários**: Otimista, realista, pessimista
- **Comparação Side-by-Side**: Tabela de resultados
- **Análise de Sensibilidade**: Slider "E se mudar X%?"
- **Breakeven Analysis**: Ponto de equilíbrio automático

### **4. User Stories Expandidas**

> **Como Growth Manager**, quero configurar hipóteses de conversão por etapa do funil, para validar viabilidade antes de investir em tráfego.

> **Como Analista**, quero simular cenários otimista/realista/pessimista, para apresentar projeções seguras para stakeholders.

> **Como Empreendedor**, quero ver em tempo real o ROI projetado conforme ajusto variáveis, para tomar decisões de investimento informadas.

> **Como Consultor**, quero comparar múltiplas estratégias lado a lado, para recomendar a melhor abordagem para meu cliente.

### **5. Critérios de Aceite**

#### **Técnicos**
- [ ] Cada bloco aceita inputs numéricos (volume, conversão, custo)
- [ ] Cálculos fluem automaticamente entre blocos conectados
- [ ] Mudanças em variáveis atualizam toda a cadeia em <500ms
- [ ] Sistema valida inputs e mostra erros claros
- [ ] Múltiplos cenários persistem entre sessões

#### **UX**
- [ ] Interface intuitiva mesmo para não-analistas
- [ ] Feedback visual imediato em todas as mudanças
- [ ] Transições suaves entre diferentes cenários
- [ ] Tooltips explicativos em termos técnicos
- [ ] Modo "tutorial" para primeiros usuários

#### **Analíticos**
- [ ] Cálculos matematicamente precisos
- [ ] Suporte a fórmulas customizadas
- [ ] Análise de sensibilidade funcional
- [ ] Comparação de cenários side-by-side
- [ ] Export de dados analíticos

### **6. Fora de Escopo (Fase 1)**
- Integração com dados reais de APIs
- Aprendizado de máquina para otimização
- Colaboração em tempo real em cenários
- Versionamento de hipóteses
- Integração com ferramentas de BI

### **7. Dados Manipuláveis Expandidos**

#### **Por Bloco**
- **Inputs**: Volume entrada, custo aquisição, tempo médio
- **Conversões**: Taxa conversão (%), abandono (%)
- **Outputs**: Volume saída, receita gerada, LTV
- **Temporais**: Duração etapa, sazonalidade

#### **Globais**
- **Budget**: Total disponível, por canal, por período
- **Metas**: CAC máximo, ROI mínimo, conversões target
- **Cenários**: Multiplicadores por pessimista/otimista
- **Benchmarks**: Dados históricos ou setoriais

### **8. Design/UI Específico**

#### **Painel de Hipóteses (Sidebar Direita)**
```
┌─────────────────────────┐
│ 📊 Configurações        │
├─────────────────────────┤
│ 🎯 [BLOCO SELECIONADO]  │
│                         │
│ Volume Entrada: [1000]  │
│ Taxa Conversão: [15%]   │
│ Custo por Lead: [$5]    │
│                         │
│ ↓ RESULTADO CALCULADO   │
│ Leads Gerados: 150      │
│ Custo Total: $5,000     │
│ CAC: $33.33             │
├─────────────────────────┤
│ 🔄 Cenários             │
│ ○ Otimista   ○ Real     │
│ ● Pessimista            │
├─────────────────────────┤
│ 📈 Análise Sensibilidade│
│ "E se conversão variar  │
│  ±20%?" [SLIDER]        │
└─────────────────────────┘
```

#### **Visualização no Canvas**
- **Números Animados**: Em cima de cada conexão
- **Cores de Performance**: Verde/amarelo/vermelho
- **Progresso Bars**: Volume relativo entre etapas
- **Mini Gráficos**: Tendências dentro dos blocos

### **9. Edge Cases Específicos**
- **Divisão por Zero**: Quando conversão = 0%
- **Valores Negativos**: ROI negativo, prejuízo
- **Loops Infinitos**: Dependências circulares
- **Overflow Numérico**: Valores muito altos
- **Dados Inconsistentes**: Outputs > inputs possíveis

---

## 📦 Arquitetura Técnica

### **Componentes Novos**
```
components/
├── simulation/
│   ├── HypothesisPanel.tsx      # Sidebar direita
│   ├── VariableInput.tsx        # Inputs numéricos
│   ├── ScenarioCompare.tsx      # Comparação cenários
│   ├── SensitivityAnalysis.tsx  # Análise "E se"
│   └── FlowMetrics.tsx          # Métricas nos edges
├── charts/
│   ├── PerformanceChart.tsx     # Gráficos de performance
│   ├── ROICalculator.tsx        # Calculadora ROI
│   └── ConversionFunnel.tsx     # Funil com números
└── modals/
    ├── FormulaEditor.tsx        # Editor fórmulas custom
    ├── ScenarioModal.tsx        # Criar/editar cenários
    └── ExportAnalysis.tsx       # Export dados analíticos
```

### **Hooks Novos**
```
hooks/
├── useSimulation.ts         # Estado da simulação
├── useHypothesis.ts         # Gerenciamento hipóteses
├── useScenarios.ts          # Múltiplos cenários
├── useCalculation.ts        # Engine de cálculo
└── useSensitivity.ts        # Análise sensibilidade
```

### **Engine de Cálculo**
```typescript
// lib/simulation/
├── calculator.ts            # Core calculation engine
├── formulas.ts              # Biblioteca fórmulas
├── validators.ts            # Validação inputs
└── scenarios.ts             # Gerenciamento cenários
```

---

## 🎯 Roadmap de Implementação

### **Sprint 1: Fundação (2 semanas)**
- [ ] HypothesisPanel component (sidebar direita)
- [ ] Sistema básico de variáveis por bloco
- [ ] Engine de cálculo simples (input → output)
- [ ] Visualização de números nas conexões

### **Sprint 2: Simulação (2 semanas)**
- [ ] Múltiplos cenários (otimista/realista/pessimista)
- [ ] Análise de sensibilidade com sliders
- [ ] Validação e error handling
- [ ] Animações de números e transições

### **Sprint 3: Análise Avançada (2 semanas)**
- [ ] Comparação side-by-side de cenários
- [ ] Gráficos e visualizações
- [ ] Fórmulas customizáveis
- [ ] Export de análises

### **Sprint 4: Polish & Performance (1 semana)**
- [ ] Otimização de performance
- [ ] Testes e bug fixes
- [ ] Documentação e tutorials
- [ ] Integração com sistema existente

---

## 💡 Prompt Reutilizável

```
Evolua o Flow X adicionando sistema completo de hipóteses e simulações:

CORE: Transformar blocos estáticos em calculadoras dinâmicas com inputs/outputs, simulação em tempo real, múltiplos cenários (otimista/realista/pessimista), análise de sensibilidade.

COMPONENTES: HypothesisPanel (sidebar direita), VariableInput, ScenarioCompare, FlowMetrics (números animados nas conexões), SensitivityAnalysis.

FUNCIONALIDADES: Configuração de variáveis por bloco, cálculos em cadeia, comparação cenários, análise "E se?", visualização de performance.

UX: Feedback visual imediato, números animados, cores por performance, transições suaves, validação em tempo real.

STACK: Manter React+Next.js+shadcn/ui, adicionar Math.js para cálculos, Recharts para gráficos, animações com Framer Motion.

FOCO: Intuitividade para não-analistas, precisão matemática, performance <500ms, design consistente com app existente.
```

---

**Documento criado para evolução do Flow X**  
*Versão 1.0 - Sistema de Hipóteses e Simulações* 