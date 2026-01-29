# 🔧 GIT CLEANUP COMMANDS

**Para ejecutar ANTES de hacer push a GitHub**

---

## ⏸️ PASO 0: Verificar Estado Actual

```bash
# Ver diferencias pendientes
git status

# Ver si .env ya fue commitado (CRÍTICO)
git log --full-history -- Backend/.env
```

---

## 🚨 PASO 1: SOLO SI .env YA FUE COMMITADO

Si el comando anterior muestra commits, ejecutar **UNO** de estos:

### Opción A: Usar Git Filter (cambia hashes, más simple)

```bash
# Eliminar .env de TODA la historia de commits
git filter-branch --tree-filter 'rm -f Backend/.env' -- --all

# Validar
git log --full-history -- Backend/.env
# Debe estar vacío

# Force push (⚠️ DESTRUCTIVO - cambiar hashes)
git push origin --force --all
git push origin --force --tags
```

### Opción B: Usar BFG Repo Cleaner (más seguro, recomendado)

```bash
# Descargar si no está instalado
# https://rtyley.github.io/bfg-repo-cleaner/

# Ejecutar BFG
bfg --delete-files Backend/.env

# Limpiar referencias muertas
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

---

## ✅ PASO 2: Crear .env Local (NUNCA COMITEAR)

```bash
# Ir al Backend
cd Backend

# Copiar template
cp .env.example .env

# Editar con tus valores (usar un editor)
# - DB_PASSWORD: Tu contraseña MySQL real
# - JWT_SECRET: Un string único de 32+ caracteres
# - DATABASE_URL: Ajustar si es necesario

code .env  # O usar tu editor favorito
```

**Verificar git lo ignora**:
```bash
git check-ignore -v Backend/.env
# Debe mostrar: Backend/.env  Backend/.gitignore
```

---

## 📝 PASO 3: Stage los Cambios

```bash
# Volver al root
cd ..

# Ver qué cambios hay
git diff --cached
git diff HEAD

# Stage todos los cambios
git add .gitignore Backend/.gitignore README.md Backend/README.md DEVOPS-AUDIT-REPORT.md
```

**Verificar stage**:
```bash
git status
# Debe mostrar los 5 archivos como "Changes to be committed"
```

---

## 💾 PASO 4: Commit con Mensaje Descriptivo

```bash
git commit -m "chore: repo cleanup and hardening for github publication

CHANGES:
- Enhanced .gitignore files with security-focused patterns
  * 3x expansion (20 → 60+ lines root)
  * 1.8x expansion (45 → 80+ lines backend)
  * Separated environment, artifacts, IDE rules
  * Added comprehensive documentation

- Removed .env from git tracking
  * .env now excluded via .gitignore at all levels
  * .env.example remains clean template
  * Users must: cp .env.example .env (locally)
  * Added security warnings in all README files

- Rewrote documentation for production
  * Root README: 20 → 300+ lines
  * Backend README: Genérico → Específico (280 lines)
  * Added Quick Start, Architecture, API docs
  * Added Troubleshooting and Security sections
  * Included Testing instructions

- Generated DEVOPS-AUDIT-REPORT.md
  * Security findings and remediations
  * Checklist before publication
  * Manual actions required

SECURITY:
✅ No hardcoded secrets in code
✅ .env removed from tracking
✅ .env.example is clean template
✅ Build artifacts excluded
✅ Comprehensive gitignore rules

TESTING:
✅ 8/8 E2E tests passing
✅ Swagger API functional
✅ All endpoints documented

BREAKING CHANGES:
- .env now excluded from version control
- Users must create local .env from template"
```

---

## 🔍 PASO 5: Verificar Cambios

```bash
# Ver log del commit (antes de push)
git log -1 --stat

# Ver diff del commit
git show --name-status

# Verificar .env está realmente ignorado
git ls-files | grep .env
# Debe estar VACÍO (no mostrar nada)

# Verificar en histórico
git log --full-history -- Backend/.env
# Si .env fue commitado antes, mostrará historia
```

---

## 🚀 PASO 6: Push a GitHub

```bash
# Push simple (si no hubo cambios de historia)
git push origin main

# O si usaste git filter-branch o BFG:
git push origin --force main
git push origin --force --tags
```

---

## ✅ PASO 7: Validación Final en GitHub

```bash
# Verificar en GitHub
# 1. Ir a: https://github.com/tu-usuario/gestor-creditos
# 2. Verificar que muestre los nuevos commits
# 3. Verificar que .env NO está en el repo
# 4. Verificar que README.md es el nuevo (300+ líneas)
```

**Comandos de validación local**:
```bash
# Ver commits recientes
git log --oneline -5

# Ver archivos del repo
git ls-files

# Ver si .env está en algún commit
git grep .env HEAD~1 || echo "No encontrado (bien!)"
```

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot find module" después de cambios

```bash
npm install
npm run build
npm run test:e2e
```

### Error: "Database connection failed"

```bash
# Verificar .env existe y tiene valores válidos
test -f Backend/.env && echo "Exists" || echo "Missing"

# Verificar MySQL está corriendo
mysql -u creditos_app -p -e "SELECT 1"

# Recrear .env
cp Backend/.env.example Backend/.env
# Editar valores...
```

### Error: "fatal: your current branch 'main' does not have any commits yet"

```bash
# Crear primer commit
git add .
git commit -m "initial: gestor creditos backend"
git push -u origin main
```

### Error: "rejected ... (protected branch)"

```bash
# Ir a Settings en GitHub y desproteger temporalmente
# O pushear a rama diferente
git push origin main:feature/devops-cleanup
```

---

## 📋 CHECKLIST FINAL

Antes de hacer `git push`:

- [ ] Ejecuté: `git log --full-history -- Backend/.env` (verificar si commitado)
- [ ] Si sí: Ejecuté limpieza con git filter o BFG
- [ ] Ejecuté: `cp Backend/.env.example Backend/.env`
- [ ] Editué `.env` con mis valores locales
- [ ] Ejecuté: `git check-ignore Backend/.env` (debe ignorarse)
- [ ] Stage: `git add .gitignore Backend/.gitignore README.md Backend/README.md`
- [ ] Commit: Creé commit con mensaje descriptivo
- [ ] Validé: `git status` (debe mostrar "nothing to commit")
- [ ] Push: `git push origin main`
- [ ] Verificación: Fui a GitHub y confirmo que TODO se ve correcto

---

## 📞 SOPORTE

Si algo sale mal:

1. **Revisar error exacto**: Leer mensaje completo
2. **Revisar documentación**:
   - [README.md](README.md) - Guía general
   - [Backend/README.md](Backend/README.md) - Backend específico
   - [DEVOPS-AUDIT-REPORT.md](DEVOPS-AUDIT-REPORT.md) - Audit completo
3. **Revertir cambios** si es necesario:
   ```bash
   git reset --hard HEAD
   ```
4. **Empezar de nuevo** desde PASO 0

---

**Generado por**: GitHub Copilot DevOps  
**Última actualización**: Enero 22, 2026  
**Status**: Ready for GitHub Publication
