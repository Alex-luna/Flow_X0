# Takeaways - Flow X Development Journey

## 🚨 Problemas Encontrados

### 1. Erro de Módulo Não Encontrado (Convex)
**Erro:** `Module not found: Can't resolve 'convex/server'` e `Module not found: Can't resolve 'convex/react'`

**Contexto:** Durante a implementação da Task 6.0 (Data Persistency), após criar o schema Convex e funções de backend, o app não conseguia resolver os módulos do Convex.

### 2. Configuração Incompleta do Convex
**Problema:** O Convex estava instalado mas não havia sido propriamente configurado com `npx convex dev`.

**Sintomas:**
- Arquivos `convex/_generated/` ausentes
- Variáveis de ambiente não configuradas
- Deployment não provisionado

### 3. Modais Mock vs Reais (Task 9.0)
**Erro:** `Cannot read properties of undefined (reading 'isLoading')`

**Problema:** Header.tsx estava usando modais mock em vez dos componentes reais CreateFolderModal/CreateProjectModal.

**Sintomas:**
- Modais existiam mas não funcionavam
- Hooks de loading não estavam definidos
- "API not ready" errors nos botões

### 4. React Hydration Mismatch Errors
**Erro:** `Text content does not match server-rendered HTML` e `Hydration failed because the initial UI does not match`

**Problema:** Diferenças entre renderização server-side e client-side causando erros de hidratação.

**Sintomas:**
- App funcionava mas console cheio de erros
- Warnings sobre suppressHydrationWarning
- Elementos aparecendo/desaparecendo durante carregamento

### 5. Convex Schema Validation Errors
**Erro:** `ValidationError: Value does not match any variant of union`

**Problema:** Dados existentes no banco não compatíveis com schema atualizado.

**Sintomas:**
- Convex não conseguia validar dados existentes
- Campos obrigatórios ausentes em registros antigos
- Deployment falhando na validação

### 6. Convex Directory Problem - ROOT CAUSE
**Erro:** `Error: Could not find package.json in the current directory or any parent directory`

**Problema:** Convex estava sendo executado do diretório errado (`/Flow_X0` em vez de `/my_app`).

**Sintomas:**
- Todos os comandos Convex falhavam
- Hooks sempre retornavam undefined
- Mock functions sendo usadas em vez de APIs reais

### 7. Hook Integration Issues
**Problema:** useProjects.ts usando funções mock em vez de APIs Convex reais.

**Sintomas:**
- Loading sempre true
- Funções retornando undefined
- Nenhuma integração real com backend

### 8. Hydration Attribute Mismatches
**Erro:** `data-arp=""` attribute mismatches entre server e client

**Problema:** Elementos HTML com atributos diferentes entre server e client rendering.

**Sintomas:**
- Console errors sobre HTML attribute mismatches
- useCanvasSync tentando importar useProjectContext inexistente

### 9. 🔥 CRITICAL: Canvas Auto-Save Bug - Flow Data Loss
**Erro:** Fluxos desenhados no canvas eram perdidos ao trocar de projeto

**Problema:** Condição no `useCanvasSync.ts` impedia salvamento de flows vazios ou com poucos nodes.

**Código Problemático:**
```typescript
// LINHA 109 - useCanvasSync.ts (PROBLEMA)
if (!activeFlowId || !currentProject || nodes.length === 0) {
  console.log('⚠️ Skipping save: no flow, project, or empty nodes');
  return;
}
```

**Root Cause:** A condição `nodes.length === 0` impedia que:
- Flows vazios fossem salvos (após usuário remover todos os nodes)
- Auto-save funcionasse corretamente em estados intermediários
- Mudanças fossem persistidas no Convex quando canvas ficasse vazio

**Sintomas:**
- ✅ Usuário desenha fluxo → funciona
- ❌ Usuário troca de projeto → dados perdidos
- ❌ Usuário volta ao projeto → canvas vazio
- ❌ Auto-save não funciona para flows com 0 nodes
- ❌ Remoção de todos os nodes não é persistida

**Impacto:** **CRÍTICO** - Perda total de dados do usuário ao navegar entre projetos

## 🔍 Diagnóstico e Investigação

### Passos Seguidos:
1. **Verificação de Dependências**: Confirmamos que o Convex estava listado no `package.json`
2. **Teste de Módulo**: Usamos `node -e "console.log(require('convex/react'))"` para verificar se o módulo estava acessível
3. **Análise de Cache**: Identificamos possível problema de cache do Next.js
4. **Verificação de Arquivos Gerados**: Confirmamos que `convex/_generated/` estava incompleto
5. **Análise de Modais**: Descobrimos imports incorretos (mock vs real components)
6. **Debug de Hidratação**: Identificamos diferenças server/client rendering
7. **Validação de Schema**: Testamos dados existentes contra schema atualizado
8. **Directory Analysis**: Descobrimos Convex rodando do diretório errado
9. **Hook Investigation**: Encontramos funções mock sendo usadas em vez de APIs reais
10. **Hydration Deep Dive**: Rastreamos todos os pontos de mismatch HTML

## ✅ Soluções Aplicadas

### 1. Atualização do Convex
```bash
npm install convex@latest
```
- Atualizou para versão 1.24.8
- Garantiu compatibilidade com React/Next.js

### 2. Limpeza Completa de Cache
```bash
rm -rf .next && rm -rf node_modules && npm install
```
- Removeu cache corrompido do Next.js
- Reinstalou todas as dependências do zero
- Eliminou conflitos de módulos

### 3. Configuração Completa do Convex
```bash
npx convex dev --once
```
- Provisionou deployment de desenvolvimento
- Gerou arquivos `convex/_generated/`
- Configurou variáveis de ambiente (.env.local)
- Criou URL do deployment: `https://next-gopher-397.convex.cloud`

### 4. Correção do ConvexProvider
```typescript
// Antes (problemático)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "mock";

// Depois (correto)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
```

### 5. Correção de Imports dos Modais
```typescript
// Antes (Header.tsx)
import { CreateFolderModal } from './modals/MockCreateFolderModal';
import { CreateProjectModal } from './modals/MockCreateProjectModal';

// Depois
import { CreateFolderModal } from './modals/CreateFolderModal';
import { CreateProjectModal } from './modals/CreateProjectModal';

// Correção dos hooks
const { isLoading: isFolderLoading } = useFolders(); // era 'loading'
const { isLoading: isProjectLoading } = useProjects(); // era 'loading'
```

### 6. Resolução de Hidratação - ThemeContext
```typescript
// Implementação hydration-safe
const [theme, setTheme] = useState<'light' | 'dark'>('light');
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(savedTheme || systemTheme);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    setIsHydrated(true);
  }, 100);

  return () => clearTimeout(timer);
}, []);
```

### 7. Resolução de Hidratação - ProjectContext
```typescript
// Acesso seguro ao localStorage
useEffect(() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('currentProject');
      if (saved) {
        setCurrentProject(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading project from localStorage:', error);
    }
  }
}, []);
```

### 8. Wrapper HydrationSafeApp
```typescript
const HydrationSafeApp = ({ children }: { children: React.ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
```

### 9. Correção de Schema Convex
```typescript
// Tornar campos opcionais para compatibilidade
export default defineSchema({
  projects: defineTable({
    name: v.string(),
    folderId: v.optional(v.id("folders")),
    isDeleted: v.optional(v.boolean()), // Antes obrigatório
    createdAt: v.optional(v.number()),  // Antes obrigatório
    updatedAt: v.optional(v.number()),  // Antes obrigatório
    // ... outros campos opcionais
  }),
  // ... outras tabelas com campos opcionais
});
```

### 10. Correção de Diretório Convex
```bash
cd /Users/alexluna/Documents/Luna-Labs-Cursor/Flow_X0/my_app
npx convex dev
```
- Executar Convex do diretório correto com package.json
- Verificar `.env.local` com configurações corretas

### 11. Integração Real de Hooks
```typescript
// useProjects.ts - Antes (mock)
const createProject = async () => undefined;
const isLoading = true;

// Depois (real Convex)
const createProject = useMutation(api.projects.createProject);
const isLoading = createProject.isLoading;
```

### 12. Resolução Final de Hidratação
```typescript
// Layout.tsx
<html lang="en" suppressHydrationWarning>
  <body className={inter.className} suppressHydrationWarning>

// page.tsx
export default function Home() {
  return (
    <HydrationSafeApp>
      <NoSSR>
        <MainAppClient />
      </NoSSR>
    </HydrationSafeApp>
  );
}

// NoSSR Component
const NoSSR = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};
```

### 13. Simplificação para Desenvolvimento
```typescript
// Hooks simplificados para mock data
const useProjects = () => ({
  projects: mockProjects,
  createProject: async (data: any) => { /* mock */ },
  isLoading: false,
  error: null
});

const useFolders = () => ({
  folders: mockFolders,
  createFolder: async (data: any) => { /* mock */ },
  isLoading: false,
  error: null
});
```

### 14. 🔥 HOTFIX: Canvas Auto-Save Bug Resolution
**Problema Identificado:** Condição restritiva bloqueava salvamento de flows vazios

**Solução Aplicada:**
```typescript
// ANTES (PROBLEMÁTICO) - Linha 109 useCanvasSync.ts
const saveToConvex = useCallback(async () => {
  if (!activeFlowId || !currentProject || nodes.length === 0) {
    console.log('⚠️ Skipping save: no flow, project, or empty nodes');
    return;
  }
  // ... resto da função
}, [activeFlowId, currentProject, nodes, edges, viewport, saveBatchFlow]);

// DEPOIS (CORRIGIDO)
const saveToConvex = useCallback(async () => {
  if (!activeFlowId || !currentProject) {
    console.log('⚠️ Skipping save: no flow or project');
    return;
  }
  // ... resto da função (mesmo código)
}, [activeFlowId, currentProject, nodes, edges, viewport, saveBatchFlowData]);
```

**Mudanças Específicas:**
1. **Removida condição:** `|| nodes.length === 0`
2. **Corrigido nome da função:** `saveBatchFlow` → `saveBatchFlowData`
3. **Simplificada lógica:** Apenas verificar se flow e projeto existem

**Impacto da Correção:**
- ✅ **Flows vazios agora salvam:** Quando usuário remove todos os nodes
- ✅ **Auto-save universal:** Funciona com qualquer quantidade de nodes (0, 1, 100+)
- ✅ **Persistência garantida:** Troca de projetos não perde dados
- ✅ **Estados intermediários:** Salvamento contínuo durante edição
- ✅ **UX melhorado:** Usuário nunca perde trabalho

**Teste de Validação:**
```bash
# 1. Criar fluxo com nodes
# 2. Trocar para outro projeto  
# 3. Voltar ao projeto original
# 4. ✅ Fluxo deve estar salvo e carregado
```

### 15. 🚨 CRITICAL: Node Disappearing Bug - Race Condition Fix
**Erro:** `ArgumentValidationError: Value does not match validator. Path: .flowId`

**Problema:** Race condition entre criação local de nodes e queries reativas do Convex que sobrescreviam estado local.

**Root Cause Identificado:**
1. **Usuário adiciona node** → setNodes() local
2. **Convex query reativa dispara** → carrega dados antigos sem o novo node
3. **useEffect sobrescreve** → estado local perdido
4. **Node desaparece** → usuário vê node por 1 segundo e depois some

**Sintomas:**
- ❌ Nodes aparecem por 1 segundo e desaparecem
- ❌ Auto-save funciona mas dados não persistem visualmente
- ❌ ID fake sendo criado: `"flow-js7fgj8qgfra0ctngbm8hcv8k57j3ve6"`
- ❌ Convex espera `Id<"flows">` válido do banco

**Solução Implementada - Sistema de Bloqueio Inteligente:**
```typescript
// 1. Detectar novo node e bloquear loading reativo
if (hasNewNodes && lastLoadedProject !== 'SAVING_BLOCK') {
  console.log('🛑 New nodes detected, blocking reactive loading');
  setLastLoadedProject('SAVING_BLOCK');
  
  // 2. Trigger immediate save com ID válido do Convex
  setTimeout(async () => {
    try {
      await saveToConvex(); // Usa createFlowMutation para ID válido
      console.log('✅ Save completed, re-enabling data loading');
      if (currentProject) {
        setLastLoadedProject(currentProject.id); // Desbloqueia loading
      }
    } catch (error) {
      console.error('❌ Save failed, re-enabling anyway:', error);
      if (currentProject) {
        setLastLoadedProject(currentProject.id);
      }
    }
  }, 100);
}

// 3. Skip loading durante bloqueio
if (lastLoadedProject === 'SAVING_BLOCK') {
  console.log('🛑 Skipping data load - save in progress');
  return;
}
```

**Componentes da Solução:**
1. **Bloqueio Temporal**: `'SAVING_BLOCK'` previne loading durante save
2. **IDs Válidos**: Usa `createFlowMutation` em vez de strings fake
3. **Try/Catch**: Garante desbloqueio mesmo se save falhar
4. **Timeout**: Permite render local antes do save
5. **Logs Detalhados**: Debug visual com emojis

**Impacto da Correção:**
- ✅ **Nodes persistem visualmente:** Não desaparecem após criação
- ✅ **Race condition resolvida:** Loading reativo não interfere com estado local
- ✅ **IDs válidos:** Convex aceita todos os IDs gerados
- ✅ **Auto-save robusto:** Funciona com qualquer cenário
- ✅ **UX perfeito:** Usuário vê feedback imediato e persistente

**Teste de Validação:**
```bash
# 1. Adicionar node do sidebar → deve aparecer imediatamente
# 2. Node deve permanecer visível (não desaparecer)
# 3. Trocar de projeto → node deve estar salvo
# 4. Console deve mostrar: "🛑 New nodes detected" → "✅ Save completed"
```

## 🎯 Auto-Conexão de Nodes - Tasks 1, 2, 3 e 4 Implementadas

### **Data**: 2024-12-19
### **Funcionalidade**: Auto-conexão com feedback visual e performance otimizada

#### **Task 1 - Detecção de hover durante conexão** ✅

1. **Novos imports do ReactFlow**:
   ```typescript
   import { OnConnectStart, OnConnectEnd } from 'reactflow';
   ```

2. **Estado para rastrear conexão em progresso**:
   ```typescript
   const [connectionInProgress, setConnectionInProgress] = useState<{
     isConnecting: boolean;
     sourceNode: string | null;
     sourceHandle: string | null;
     hoveredNode: string | null;
     mousePosition: { x: number; y: number } | null;
   }>({
     isConnecting: false,
     sourceNode: null,
     sourceHandle: null,
     hoveredNode: null,
     mousePosition: null,
   });
   ```

3. **Handler onConnectStart**: Detecta quando usuário inicia uma conexão
4. **Handler onConnectEnd**: Detecta quando usuário termina uma conexão
5. **Função getNodeAtPosition**: Collision detection
6. **Handler handleMouseMove**: Rastreia movimento durante conexão
7. **Event Listener dinâmico**: Adiciona/remove mousemove listener
8. **Integração com ReactFlow**: Adicionados novos props

#### **Task 2 - Lógica de conexão automática aprimorada** ✅

1. **Função calculateBestTargetHandle**: Calcula handle ideal baseado na posição
   ```typescript
   const calculateBestTargetHandle = useCallback(
     (sourceNodeId: string, targetNodeId: string, sourceHandle: string) => {
       const sourceNode = nodes.find(n => n.id === sourceNodeId);
       const targetNode = nodes.find(n => n.id === targetNodeId);
       
       // Calcular posições centrais dos nodes
       const sourceCenterX = sourceNode.position.x + 52.5; // 105/2
       const targetCenterX = targetNode.position.x + 52.5;
       
       // Lógica inteligente baseada na posição relativa
       if (sourceCenterX < targetCenterX) {
         return sourceHandle === 'source-right' ? 'target-left' : 'source-right'; 
       } else {
         return sourceHandle === 'target-left' ? 'source-right' : 'target-left';
       }
     },
     [nodes]
   );
   ```

2. **Prevenção de conexões duplicadas**: Verificação de conexões existentes
   ```typescript
   const existingConnection = edges.find(edge => 
     (edge.source === sourceNode && edge.target === hoveredNode) ||
     (edge.source === hoveredNode && edge.target === sourceNode)
   );
   ```

3. **Logs aprimorados**: Melhor debug e rastreamento

#### **Task 3 - Feedback visual durante conexão** ✅

1. **Interface atualizada do Node**: Adicionada prop `isConnectionTarget`
   ```typescript
   interface CustomNodeData {
     label: string;
     type: string;
     color?: string;
     overlay?: React.ComponentType<any>;
     isConnectionTarget?: boolean; // Para highlight durante conexão
   }
   ```

2. **Estilos visuais para highlight**: 
   - **Funnel Steps**: Ring verde pulsante com scale transform
   - **Traditional Nodes**: Border verde com ring e scale
   ```css
   ring-4 ring-green-400 ring-offset-2 shadow-lg transform scale-105 animate-pulse
   ```

3. **highlightedNodes useMemo**: Atualização reativa dos nodes
   ```typescript
   const highlightedNodes = React.useMemo(() => {
     if (!connectionInProgress.isConnecting || !connectionInProgress.hoveredNode) {
       return nodes;
     }
     
     return nodes.map(node => ({
       ...node,
       data: {
         ...node.data,
         isConnectionTarget: node.id === connectionInProgress.hoveredNode && 
                           node.id !== connectionInProgress.sourceNode
       }
     }));
   }, [nodes, connectionInProgress.isConnecting, connectionInProgress.hoveredNode, connectionInProgress.sourceNode]);
   ```

4. **Integração com ReactFlow**: `nodes={highlightedNodes}`

#### **Task 4 - Otimização de collision detection** ✅

1. **Hook personalizado de debounce**: Previne flickering
   ```typescript
   const useDebounce = <T,>(value: T, delay: number): T => {
     const [debouncedValue, setDebouncedValue] = useState<T>(value);
     React.useEffect(() => {
       const handler = setTimeout(() => {
         setDebouncedValue(value);
       }, delay);
       return () => clearTimeout(handler);
     }, [value, delay]);
     return debouncedValue;
   };
   ```

2. **Função getNodeDimensions**: Cálculo preciso de bounds por tipo
   ```typescript
   const getNodeDimensions = useCallback((nodeType: string) => {
     switch (nodeType) {
       case 'generic': case 'url': /* ... funnel steps */
         return { width: 105, height: 175 };
       default:
         return { width: 80, height: 32 }; // Traditional nodes
     }
   }, []);
   ```

3. **Cache otimizado de bounds**: useMemo com ordenação
   ```typescript
   const nodesBoundsCache = useMemo(() => {
     // ... criar bounds para cada node
     bounds.sort((a, b) => a.x - b.x); // Ordenar por X para early exit
     return bounds;
   }, [nodes, getNodeDimensions]);
   ```

4. **Sistema de spatial grid**: Para performance com muitos nodes (20+)
   ```typescript
   const spatialGrid = useMemo(() => {
     if (nodes.length < 20) return null; // Só usar com muitos nodes
     
     const GRID_SIZE = 200;
     const grid = new Map<string, NodeBounds[]>();
     // ... dividir nodes em células do grid
     return { grid, gridSize: GRID_SIZE };
   }, [nodesBoundsCache, nodes.length]);
   ```

5. **Collision detection adaptivo**: 
   - **< 20 nodes**: Busca linear otimizada com early exit
   - **≥ 20 nodes**: Spatial grid com O(1) lookup por célula

6. **Debounce de mouse move**: 10ms para suavizar atualizações
   ```typescript
   const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
   const debouncedMousePosition = useDebounce(mousePosition, 10);
   ```

7. **Performance monitoring**: Logs automáticos se collision detection > 1ms

#### **Como funciona a experiência completa:**
1. **Início**: Usuário clica e arrasta handle → highlight inicia
2. **Durante**: Mouse move DEBOUNCED detecta nodes → **highlight verde pulsante** em tempo real  
3. **Performance**: Sistema adapta entre linear search e spatial grid automaticamente
4. **Prevenção**: Sistema verifica conexões duplicadas automaticamente
5. **Inteligência**: Calcula melhor handle baseado na posição relativa
6. **Finalização**: Conexão automática + reset de estados + feedback visual

#### **Benefícios alcançados:**
- ✅ **UX intuitiva**: Feedback visual claro e imediato
- ✅ **Conexões inteligentes**: Handle selection baseado na geometria
- ✅ **Prevenção de erros**: Evita conexões duplicadas
- ✅ **Performance escalável**: O(n) para poucos nodes, O(1) para muitos
- ✅ **Animações suaves**: Transições CSS com transform e animate-pulse
- ✅ **Compatibilidade total**: Funciona com funnel steps e traditional nodes
- ✅ **Zero flickering**: Debounce elimina atualizações excessivas
- ✅ **Auto-adaptive**: Sistema escolhe algoritmo ótimo baseado na quantidade de nodes

#### **Próximos passos:**
- Task 5: Testes e refinamentos (edge cases, mobile, stress testing)

### **Lições aprendidas:**
1. **ReactFlow oferece hooks poderosos** para interceptar conexões
2. **Collision detection** precisa considerar viewport transform
3. **Event listeners globais** devem ser gerenciados cuidadosamente
4. **Estado reativo** permite UX fluida sem rerender excessivo
5. **Logs estratégicos** são essenciais para debug de interações complexas
6. **CSS transforms + animate-pulse** criam feedback visual profissional
7. **useMemo é crítico** para performance em componentes que re-renderizam frequentemente
8. **Geometria simples** pode resolver problemas complexos de UX
9. **Debounce é essencial** para evitar flickering em interactions de alta frequência
10. **Spatial indexing** vale a pena apenas para datasets grandes (20+ items)
11. **Performance adaptativa** é melhor que otimização prematura
12. **Early exit optimization** pode melhorar 2-3x a performance em busca linear

---

## Outros Takeaways

### Performance Optimization
- Smart positioning evita sobreposição de nodes
- Lazy loading de componentes com dynamic import
- Otimização de re-renders com useMemo e useCallback
- useMemo para highlightedNodes evita recalculos desnecessários
- Spatial grid para collision detection escalável
- Debounce para reduzir frequency de updates
- Sorted arrays para early exit optimization

### State Management
- Convex sync hook para persistência automática
- Context providers para estado global
- Local state para interações de UI
- Estado de conexão centralizado para coordenação
- Debounced state para performance

### User Experience  
- Snap to grid para alinhamento preciso
- Visual feedback com indicadores de status
- Keyboard shortcuts para produtividade
- Feedback visual imediato durante interações
- Animações CSS otimizadas para performance
- Zero flickering com debounce
- Adaptive performance baseado na complexidade

## 📚 Lições Aprendidas

### 1. **Ordem de Configuração é Crítica**
- Sempre executar `npx convex dev` ANTES de usar os módulos
- O Convex precisa estar configurado para gerar tipos e clientes
- **CRÍTICO**: Executar Convex do diretório correto com package.json

### 2. **Cache do Next.js Pode Mascarar Problemas**
- Limpar `.next` regularmente durante desenvolvimento
- Usar `rm -rf .next` quando houver problemas estranhos de módulos

### 3. **Verificação de Módulos Node.js**
- Usar `node -e "console.log(require('module'))"` para testar módulos
- Verificar se módulos estão realmente disponíveis antes de usar

### 4. **Variáveis de Ambiente são Essenciais**
- `NEXT_PUBLIC_CONVEX_URL` deve estar definida
- `CONVEX_DEPLOYMENT` é gerada automaticamente
- Verificar `.env.local` após configuração

### 5. **Arquivos Gerados São Dinâmicos**
- `convex/_generated/` é criado pelo CLI
- Não versionar esses arquivos
- Regenerar após mudanças no schema

### 6. **Mock vs Real Components - Naming Matters**
- Usar nomes consistentes entre mock e real components
- Verificar imports cuidadosamente
- Propriedades de hooks devem ser consistentes (isLoading vs loading)

### 7. **React Hydration é Crítico**
- **Server vs Client**: Garantir renderização idêntica
- **localStorage**: Só acessar após hidratação (useEffect)
- **window/document**: Verificar `typeof window !== 'undefined'`
- **suppressHydrationWarning**: Usar apenas quando necessário
- **Loading States**: Implementar durante hidratação

### 8. **Schema Evolution Requires Backward Compatibility**
- Novos campos devem ser opcionais
- Dados existentes podem não ter novos campos
- Usar migrações quando possível
- Testar com dados reais antes de deploy

### 9. **Directory Context Matters**
- Sempre verificar working directory para comandos CLI
- package.json deve estar no diretório correto
- Convex precisa encontrar configuração adequada
- Usar `pwd` para confirmar localização

### 10. **Hook Integration Debugging**
- Verificar se hooks retornam valores corretos
- Loading states devem refletir operações reais
- Mock functions devem ser substituídas gradualmente
- Testar via CLI para confirmar backend funcionando

### 11. **Hydration Debugging Process**
- **Identificar**: Usar console.error para encontrar mismatches
- **Isolar**: Comentar componentes problemáticos
- **Gradual**: Resolver um componente por vez
- **Test**: Verificar cada fix antes de continuar
- **Wrapper**: Usar NoSSR para componentes problemáticos

### 12. **Development vs Production Strategies**
- **Mock Data**: Útil para desenvolvimento quando backend não está pronto
- **Gradual Migration**: Substituir mocks por APIs reais progressivamente
- **Error Boundaries**: Implementar para capturar problemas
- **Loading States**: Sempre mostrar feedback visual

### 13. **Canvas Auto-Save Implementation Best Practices**
- **Condições Mínimas**: Apenas verificar essenciais (flowId, projectId)
- **Nunca bloquear por conteúdo**: Auto-save deve funcionar com 0 ou N nodes
- **Estados vazios são válidos**: Usuário pode querer salvar canvas limpo
- **Debouncing adequado**: 2-3 segundos para evitar spam de requests
- **Logging detalhado**: Console.log para debug de condições de save
- **Error handling**: Try/catch em todas as operações async
- **Feedback visual**: Loading states durante salvamento
- **Teste casos extremos**: 0 nodes, 1 node, muitos nodes, remoção total

### 14. **Race Condition Prevention in Real-Time Apps**
- **Identificar conflitos**: Estado local vs queries reativas
- **Sistema de bloqueio**: Flags temporários para prevenir overwrites
- **IDs válidos**: Sempre usar IDs gerados pelo backend, nunca fake
- **Timeout estratégico**: Permitir render local antes de operações async
- **Logging com emojis**: Debug visual para identificar fluxo de execução
- **Fallback garantido**: Sempre desbloquear mesmo em caso de erro
- **Teste de race conditions**: Simular operações rápidas e concorrentes

### 15. **Convex Integration Best Practices**
- **Validação de tipos**: Sempre usar `Id<"tableName">` em vez de strings
- **Queries condicionais**: Usar "skip" quando dados não estão prontos
- **Loading states**: Verificar `undefined` vs `null` vs dados reais
- **Error boundaries**: Implementar para capturar falhas de validação
- **Mutations vs Queries**: Nunca misturar responsabilidades
- **Real-time sync**: Considerar conflitos entre estado local e remoto

**❌ Anti-patterns para Auto-Save:**
```typescript
// NUNCA bloquear por quantidade de conteúdo
if (nodes.length === 0) return; // ❌ ERRADO

// NUNCA assumir que conteúdo vazio = não salvar
if (!content || content.length === 0) return; // ❌ ERRADO

// NUNCA ignorar estados de transição
if (isLoading || isTransitioning) return; // ❌ ERRADO (pode ser válido salvar)
```

**✅ Boas práticas para Auto-Save:**
```typescript
// Apenas verificar dependências essenciais
if (!flowId || !projectId) return; // ✅ CORRETO

// Sempre salvar, independente do conteúdo
await saveBatchFlowData({ flowId, nodes, edges, viewport }); // ✅ CORRETO

// Logging para debug
console.log('💾 Saving:', { flowId, nodes: nodes.length, edges: edges.length }); // ✅ CORRETO
```

**🎯 Testes Obrigatórios para Auto-Save:**
1. **Teste de Canvas Vazio**: Criar projeto → não adicionar nada → trocar projeto → voltar
2. **Teste de Adição**: Adicionar nodes → trocar projeto → voltar
3. **Teste de Remoção**: Adicionar nodes → remover todos → trocar projeto → voltar
4. **Teste de Edição**: Modificar nodes existentes → trocar projeto → voltar
5. **Teste de Conexões**: Criar edges → trocar projeto → voltar

## 🛠️ Processo de Debug Recomendado

### Para Problemas de Módulo Convex:
1. **Verificar instalação**: `npm list convex`
2. **Testar módulo**: `node -e "console.log(require('convex/react'))"`
3. **Limpar cache**: `rm -rf .next node_modules && npm install`
4. **Verificar diretório**: `pwd` e confirmar package.json presente
5. **Reconfigurar**: `npx convex dev --once`
6. **Verificar env**: Checar `.env.local`

### Para Problemas de Build:
1. **Verificar schema**: Sintaxe correta em `convex/schema.ts`
2. **Verificar funções**: Validators corretos nas funções
3. **Verificar imports**: Caminhos corretos para `_generated`
4. **Testar incrementalmente**: Comentar código problemático

### Para Problemas de Modais:
1. **Verificar imports**: Mock vs real components
2. **Verificar hooks**: Propriedades corretas (isLoading vs loading)
3. **Testar isoladamente**: Renderizar modal sozinho
4. **Verificar estado**: Loading states e error handling

### Para Problemas de Hidratação:
1. **Identificar fonte**: Console errors específicos
2. **Isolar componente**: Comentar seções problemáticas
3. **Verificar localStorage**: Acesso apenas client-side
4. **Verificar window/document**: Usar typeof checks
5. **Implementar loading**: Estados durante hidratação
6. **Usar wrappers**: NoSSR para casos extremos

### Para Problemas de Schema:
1. **Backup dados**: Exportar antes de mudanças
2. **Campos opcionais**: Novos campos devem ser opcionais
3. **Testar localmente**: Verificar com dados existentes
4. **Migração gradual**: Atualizar dados progressivamente

### Para Problemas de Directory:
1. **Verificar pwd**: Confirmar diretório atual
2. **Localizar package.json**: Deve estar no diretório de trabalho
3. **Verificar .env**: Arquivos de configuração no local correto
4. **Testar comandos**: CLI tools do diretório correto

### Para Problemas de Auto-Save (Canvas):
1. **Verificar condições de save**: 
   ```typescript
   console.log('🔍 Save check:', { 
     activeFlowId: !!activeFlowId, 
     currentProject: !!currentProject,
     nodes: nodes.length,
     hasUnsavedChanges 
   });
   ```
2. **Testar salvamento manual**: Chamar `manualSave()` e verificar se funciona
3. **Verificar debouncing**: Auto-save pode estar sendo cancelado por mudanças rápidas
4. **Testar backend**: Usar CLI do Convex para verificar se dados chegam ao banco
5. **Verificar dependencies**: Array de dependências do useCallback pode estar incorreto
6. **Testar casos extremos**: Canvas vazio, 1 node, muitos nodes
7. **Verificar loading states**: isLoading pode estar interferindo
8. **Logs de network**: DevTools → Network → verificar requests para Convex

### Para Problemas de Race Condition:
1. **Identificar timing**: 
   ```typescript
   console.log('🕐 State change:', { 
     trigger: 'USER_ACTION', 
     localState: nodes.length,
     timestamp: Date.now()
   });
   ```

## Nova Funcionalidade: Edição de Títulos de Nodes ✅

### Data: [Atual]
**Problema Resolvido:** Usuários não conseguiam editar títulos de nodes após criá-los no canvas.

### Implementação Completa

#### 1. **Funcionalidades Implementadas:**
- ✅ **Edição Inline**: Duplo clique no node para editar o título
- ✅ **Controles de Teclado**: 
  - `Enter` para salvar
  - `Escape` para cancelar
  - Setas para mover node (quando não editando)
- ✅ **Salvamento Automático**: Mudanças são salvas automaticamente no servidor (Convex)
- ✅ **Feedback Visual**: 
  - Indicador de salvamento (💾)
  - Animações de carregamento
  - Estados visuais claros
- ✅ **Tratamento de Erro**: Reversão automática em caso de falha
- ✅ **Sincronização**: Estado local sincroniza com dados do servidor

#### 2. **Arquivos Modificados:**

**`my_app/components/Canvas.tsx`:**
```typescript
// Adicionado handler para atualização individual de nodes
const handleNodeDataUpdate = useCallback(async (nodeId: string, newData: any) => {
  // Atualiza estado local imediatamente (UX responsiva)
  setNodes(prevNodes => /* ... */);
  
  // Salva no servidor usando mutation específica
  if (activeFlowId) {
    await saveNodeMutation(updateData);
  }
}, [nodes, setNodes, activeFlowId, saveNodeMutation]);

// Node types agora recebem o dataUpdater
const nodeTypesWithUpdater = useMemo(() => ({
  custom: (props: any) => <CustomNode {...props} dataUpdater={handleNodeDataUpdate} />,
}), [handleNodeDataUpdate]);
```

**`my_app/components/Node.tsx`:**
```typescript
// Estados para controle de edição
const [editing, setEditing] = useState(false);
const [label, setLabel] = useState(data.label || '');
const [isSaving, setIsSaving] = useState(false);

// Sincronização com dados externos
React.useEffect(() => {
  if (!editing) {
    setLabel(data.label || '');
  }
}, [data.label, editing]);

// Salvamento com tratamento de erro
const handleBlur = async () => {
  if (props.dataUpdater && label.trim() !== data.label) {
    setIsSaving(true);
    try {
      await props.dataUpdater(id, { ...data, label: label.trim() });
    } catch (error) {
      setLabel(data.label || ''); // Reverte em caso de erro
    } finally {
      setIsSaving(false);
    }
  }
};
```

#### 3. **Como Usar:**

1. **Criar um Node**: Arraste qualquer elemento da sidebar para o canvas
2. **Editar Título**: 
   - Duplo clique no node
   - Digite o novo título
   - Pressione `Enter` para salvar ou `Escape` para cancelar
3. **Feedback Visual**: 
   - Ícone de salvamento (💾) aparece durante o save
   - Animações indicam estado de carregamento
4. **Tratamento de Erro**: Se o save falhar, o título reverte automaticamente

#### 4. **Benefícios Técnicos:**

- **Performance**: Updates são feitos individualmente (não salva todo o canvas)
- **UX Responsiva**: Estado local atualiza imediatamente, salvamento acontece em background  
- **Robustez**: Tratamento de erros com reversão automática
- **Consistência**: Funciona tanto para funnel steps quanto para nodes tradicionais
- **Acessibilidade**: Suporte completo a teclado e feedback visual

#### 5. **Padrões Arquiteturais Utilizados:**

- **Optimistic Updates**: UI atualiza imediatamente, servidor sincroniza depois
- **Error Boundary Pattern**: Falhas não quebram a experiência do usuário  
- **Single Responsibility**: Função específica para cada tipo de update
- **State Synchronization**: Estado local e servidor mantém consistência

### Próximos Passos Sugeridos:
- [ ] Implementar edição de cores via UI
- [ ] Adicionar validação de títulos (ex: máximo de caracteres)
- [ ] Implementar undo/redo para mudanças
- [ ] Adicionar shortcuts de teclado para edição rápida

---

## Lições Aprendidas

### 1. **Convex Integration**
- Usar mutations específicas para updates individuais é mais eficiente
- `useCanvasSync` hook funciona bem para operações batch
- Individual node updates precisam de abordagem diferente

### 2. **React Flow + Estado Local**
- Sincronização entre estado local e externo requer cuidado especial
- Optimistic updates melhoram significativamente a UX
- `useCallback` e `useMemo` são essenciais para performance

### 3. **UX Patterns**
- Feedback visual imediato é crucial para edição inline
- Tratamento de erro deve ser transparente para o usuário
- Controles de teclado aumentam produtividade

### 4. **TypeScript Benefits**
- Tipagem forte ajudou a evitar bugs durante desenvolvimento
- Interface clara entre componentes facilita manutenção
- Props opcionais (`dataUpdater?`) mantém backward compatibility