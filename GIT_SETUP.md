# Git Setup Documentation

This document describes the Git configuration and pre-commit hooks set up for the Rehash App.

## 🎣 Pre-Commit Hooks

A pre-commit hook has been configured to run automatically before each commit. This hook helps maintain code quality and prevent common mistakes.

### What the Pre-Commit Hook Checks:

1. **🔒 Security Checks**
   - Prevents `.env` files from being committed
   - Warns about potential API keys or secrets in code
   - Blocks commits with `debugger` statements

2. **📝 Code Quality**
   - Runs TypeScript type checking (if configured)
   - Runs linting (if configured)
   - Warns about `console.log` statements

3. **✅ Best Practices**
   - Ensures clean, production-ready code
   - Interactive prompts for warnings (can override if needed)

### Hook Location

The pre-commit hook is located at:
```
.git/hooks/pre-commit
```

### How It Works

When you run `git commit`, the hook automatically:
1. Scans staged files for issues
2. Runs checks and tests
3. Either allows or blocks the commit based on results
4. Provides clear feedback about any issues found

### Bypassing the Hook (Not Recommended)

In rare cases where you need to bypass the hook:
```bash
git commit --no-verify -m "Your commit message"
```

⚠️ **Warning:** Only use `--no-verify` when absolutely necessary!

## 📋 GitHub Templates

### Issue Templates

Two issue templates are available:

1. **Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.md`)
   - Structured format for reporting bugs
   - Includes environment details, steps to reproduce, screenshots

2. **Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`)
   - Structured format for proposing new features
   - Includes use cases, acceptance criteria, technical considerations

### Pull Request Template

Located at `.github/pull_request_template.md`, this template:
- Guides contributors through PR creation
- Ensures all necessary information is provided
- Includes checklists for code quality and testing
- Links to related issues

## 🤖 GitHub Actions (CI)

A basic CI workflow is configured at `.github/workflows/ci.yml`:

- Runs on push to `main` and `develop` branches
- Runs on all pull requests
- Performs type checking and linting
- Uses pnpm for fast, efficient builds

## 🚀 Recommended Workflow

### For New Features:
```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "feat: add my new feature"

# Push to GitHub
git push origin feature/my-new-feature

# Create Pull Request on GitHub
```

### For Bug Fixes:
```bash
# Create fix branch
git checkout -b fix/bug-description

# Make changes and commit
git add .
git commit -m "fix: resolve bug description"

# Push to GitHub
git push origin fix/bug-description

# Create Pull Request on GitHub
```

## 📝 Commit Message Convention

Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🔧 Customizing Hooks

To modify the pre-commit hook:
1. Edit `.git/hooks/pre-commit`
2. Make it executable: `chmod +x .git/hooks/pre-commit`
3. Test with a commit

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Last Updated:** October 2025

