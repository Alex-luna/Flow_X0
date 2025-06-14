# Git TLDR

## Comandos mais usados

```sh
# Inicializar repositório
git init

# Clonar repositório
git clone <url-do-repo>

# Verificar status
git status

# Adicionar arquivos para commit
git add <arquivo-ou-pasta>
# Adicionar tudo
git add .

# Fazer commit
git commit -m "mensagem do commit"

# Ver histórico de commits
git log --oneline

# Ver branches
git branch

# Criar nova branch
git checkout -b nome-da-branch

# Trocar de branch
git checkout nome-da-branch

# Deletar branch local
git branch -d nome-da-branch

# Verificar URL do repositório remoto
git remote -v

# Alterar URL do repositório remoto
# (exemplo: mudar para SSH)
git remote set-url origin git@github.com:usuario/repo.git

# Adicionar repositório remoto
# (caso não exista)
git remote add origin <url-do-repo>

# Enviar branch para o remoto
# (primeiro push de uma branch nova)
git push -u origin nome-da-branch
# Push normal
git push

# Buscar atualizações do remoto
# (não altera arquivos locais)
git fetch

# Atualizar branch local com remoto
git pull

# Mesclar branch (merge)
git merge nome-da-branch

# Resolver conflitos: edite os arquivos, depois
#
git add <arquivo-resolvido>
git commit
```

## Como adicionar pasta vazia ao Git
O Git não versiona pastas vazias. Solução:

```sh
mkdir minha-pasta-vazia
cd minha-pasta-vazia
touch .gitkeep
cd ..
git add minha-pasta-vazia/.gitkeep
git commit -m "adiciona pasta vazia com .gitkeep"
```

## Cuidados importantes
- **Nunca** suba arquivos sensíveis (.env, senhas, etc)
- Use `.gitignore` para ignorar arquivos/pastas
- Commits pequenos e frequentes
- Sempre escreva mensagens de commit claras
- Antes de subir código, faça `git pull` para evitar conflitos
- Use branches para novas features ou correções

## Dicas rápidas
- Ver arquivos modificados: `git status`
- Desfazer alterações não commitadas: `git checkout -- <arquivo>`
- Remover arquivo do stage: `git reset <arquivo>`
- Desfazer último commit (mantendo alterações): `git reset --soft HEAD~1`
- Stash (guardar alterações temporárias):
  - `git stash`
  - `git stash pop`

---

Copie e cole os comandos conforme sua necessidade. Para mais detalhes, consulte a [documentação oficial do Git](https://git-scm.com/doc). 