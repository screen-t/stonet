# TASK: FE-001 - Frontend Development Environment Setup

**Assigned To:** All Frontend Team  
**Priority:** CRITICAL  
**Estimate:** 4 hours  
**Deadline:** February 6, 2026  
**Status:** Not Started  
**Dependencies:** None  
**Created:** February 5, 2026

---

## Objective

Set up local development environments for all frontend team members to ensure consistency and productivity across the team.

## Prerequisites

- Computer with Windows, macOS, or Linux
- Internet connection
- Administrative access to install software
- Basic knowledge of Node.js and React

## Instructions

### Step 1: Install Required Software

#### Node.js and npm
1. Download Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Install using the installer
3. Verify installation:
   ```bash
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 8.0.0 or higher
   ```

#### Git
1. Download Git from [git-scm.com](https://git-scm.com/)
2. Install with default settings
3. Configure Git:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

#### VS Code (Recommended)
1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install with default settings

### Step 2: Install VS Code Extensions

Install these essential extensions:

```bash
# Core extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-json

# React/Frontend specific
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension ms-vscode.vscode-react-native
```

### Step 3: Clone Project Repository

```bash
# Clone the repository
git clone https://github.com/your-org/b2b-network.git
cd b2b-network/frontend

# Or if using SSH
git clone git@github.com:your-org/b2b-network.git
cd b2b-network/frontend
```

### Step 4: Install Project Dependencies

```bash
# Install dependencies using npm (or yarn/bun if preferred)
npm install

# Or using bun (if preferred)
bun install
```

### Step 5: Environment Configuration

#### Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment variables
code .env.local
```

#### Configure Environment Variables

Update `.env.local` with your values:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=http://localhost:8002

# Environment
VITE_ENVIRONMENT=development

# OAuth Configuration (for testing)
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
VITE_GITHUB_OAUTH_CLIENT_ID=your_github_client_id
VITE_LINKEDIN_OAUTH_CLIENT_ID=your_linkedin_client_id
```

### Step 6: VS Code Workspace Configuration

Create `.vscode/settings.json` in the project root:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    "cn\\(([^)]*)\\)",
    "cva\\([^)]*(class:\\s*['\"]([^'\"]*)['\"])",
    "clsx\\(([^)]*)\\)"
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Step 7: Prettier Configuration

Create `.prettierrc` in the frontend directory:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "useTabs": false,
  "endOfLine": "auto"
}
```

Create `.prettierignore`:

```
node_modules/
dist/
build/
.next/
coverage/
*.min.js
*.min.css
package-lock.json
yarn.lock
bun.lockb
```

### Step 8: ESLint Configuration

Verify `eslint.config.js` has proper rules:

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-explicit-any': ['warn'],
    },
  },
)
```

### Step 9: Test Development Server

```bash
# Start the development server
npm run dev

# Or using bun
bun run dev

# The server should start on http://localhost:3000
```

#### Verify Everything Works

1. **Hot Reload Test:**
   - Edit `src/App.tsx`
   - Change some text
   - Verify changes appear immediately in browser

2. **TypeScript Test:**
   - Create a TypeScript error intentionally
   - Verify VS Code shows the error
   - Verify terminal shows the error

3. **Tailwind Test:**
   - Add a Tailwind class to an element
   - Verify autocomplete works
   - Verify styles apply correctly

### Step 10: Install Additional Development Tools

#### React Developer Tools
- Install the browser extension for your browser:
  - [Chrome/Edge](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
  - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

#### Package Manager (Optional)
If you prefer Yarn or Bun:

```bash
# Install Yarn (optional)
npm install -g yarn

# Install Bun (optional) - faster alternative
curl -fsSL https://bun.sh/install | bash
```

### Step 11: Development Scripts

Verify these scripts work in `package.json`:

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Step 12: Git Configuration

Set up Git hooks (optional but recommended):

```bash
# Install husky for git hooks
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm run type-check"
```

## Deliverables

- [ ] Node.js 18+ installed and verified
- [ ] Git installed and configured
- [ ] VS Code installed with required extensions
- [ ] Project repository cloned
- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Development server running on localhost:3000
- [ ] Hot reload working
- [ ] TypeScript integration working
- [ ] ESLint and Prettier configured
- [ ] Tailwind CSS working with autocomplete
- [ ] React Developer Tools installed

## Acceptance Criteria

1. **Environment Setup:**
   - Node.js version 18+ installed
   - npm or alternative package manager working
   - Git configured with correct user info

2. **IDE Configuration:**
   - VS Code with all required extensions
   - Proper syntax highlighting and autocomplete
   - Error detection working
   - Code formatting on save working

3. **Project Running:**
   - `npm run dev` starts server without errors
   - Application loads at http://localhost:3000
   - Hot reload works when files are changed
   - No TypeScript errors in terminal
   - No console errors in browser

4. **Development Features:**
   - Tailwind CSS classes have autocomplete
   - ESLint shows errors and warnings
   - Prettier formats code on save
   - React Developer Tools working in browser

5. **Build Process:**
   - `npm run build` completes successfully
   - `npm run preview` serves production build
   - No build errors or warnings

## Common Issues and Solutions

### Node Version Issues
```bash
# Use nvm to manage Node versions
# Install nvm first, then:
nvm install 18
nvm use 18
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Module Resolution Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### VS Code Extensions Not Working
```bash
# Reload VS Code window
Ctrl+Shift+P -> "Developer: Reload Window"

# Check extension status
Ctrl+Shift+P -> "Extensions: Show Installed Extensions"
```

## Testing Checklist

- [ ] Can create new React component without errors
- [ ] TypeScript autocomplete works
- [ ] Tailwind classes have autocomplete
- [ ] ESLint catches common errors
- [ ] Prettier formats code consistently
- [ ] Import statements work with path resolution
- [ ] Environment variables accessible in code
- [ ] Hot reload works for all file types
- [ ] Build process completes without errors
- [ ] Can import and use external libraries

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Frontend Lead:** [TBD]
- **Technical Lead:** [TBD]

## Next Steps After Completion

1. Verify all team members have working environments
2. Share common development practices and standards
3. Begin FE-002 (Authentication UI Components)
4. Set up team code review process
5. Create shared component library documentation

---

**Status Updates:**
- [ ] Started: _________
- [ ] Node.js/Git Installed: _________
- [ ] VS Code Configured: _________
- [ ] Project Cloned: _________
- [ ] Dependencies Installed: _________
- [ ] Environment Variables: _________
- [ ] Development Server Working: _________
- [ ] All Tools Tested: _________
- [ ] Completed: _________