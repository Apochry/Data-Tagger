# Contributing to AI Tagger

Thank you for considering contributing to AI Tagger! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## 🐛 Reporting Issues

### Before Submitting an Issue

1. Check if the issue already exists
2. Verify you're using the latest version
3. Test in a clean environment if possible

### Submitting a Good Issue

Include:
- **Clear title**: Describe the problem concisely
- **Steps to reproduce**: Numbered list of actions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, version
- **Screenshots**: If applicable
- **Console errors**: Check browser console

## 💻 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern web browser
- API key from at least one provider (for testing)

### Setup Steps

```bash
# Fork and clone
git clone https://github.com/yourusername/ai-tagger.git
cd ai-tagger

# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Commit**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Formatting
   - `refactor:` - Code restructuring
   - `test:` - Adding tests
   - `chore:` - Maintenance

4. **Push and PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

## 📝 Code Style

### JavaScript/React

- Use functional components with hooks
- Prefer `const` over `let`
- Use descriptive variable names
- Add comments for non-obvious code
- Keep components focused and small
- Extract reusable logic

### Example

```javascript
// Good
const calculateTokenEstimate = (text) => {
  return Math.ceil(text.length / 4)
}

// Avoid
const calc = (t) => Math.ceil(t.length/4)
```

### File Organization

- One component per file
- Name files after the component (PascalCase)
- Group related components in folders
- Keep utility functions separate

## 🧪 Testing

Currently, the project doesn't have automated tests. When adding tests:

1. Test user-facing functionality
2. Test error conditions
3. Test edge cases
4. Provide meaningful test descriptions

## 🎨 UI/UX Guidelines

- Maintain minimalist aesthetic
- Use gray-scale color palette
- Ensure responsive design
- Add loading states
- Show clear error messages
- Provide user feedback

## 🔐 Security Guidelines

**Critical**:
- ⚠️ **NEVER** persist API keys to localStorage
- ⚠️ **NEVER** log API keys to console
- ⚠️ **ALWAYS** use HTTPS for API calls
- ⚠️ **ALWAYS** pass API keys in headers, not URLs

See [SECURITY.md](SECURITY.md) for detailed security requirements.

## 📚 Documentation

When adding features:

1. Update README.md
2. Add JSDoc comments to functions
3. Update CHANGELOG.md
4. Include inline code comments
5. Update SECURITY.md if security-related

## 🎯 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style
- [ ] Changes are tested locally
- [ ] No console errors
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots
If applicable

## Checklist
- [ ] Code reviewed myself
- [ ] Tested locally
- [ ] Updated documentation
- [ ] No breaking changes (or documented if so)
```

## 🏗️ Adding New Features

### Adding a New AI Provider

1. Add provider config to `ModelSelectionStep.jsx`
2. Implement `fetch[Provider]Models()` function
3. Add `call[Provider]AI()` in `ProcessingStep.jsx`
4. Test with real API key
5. Update documentation

### Adding New UI Components

1. Create component in `src/components/`
2. Follow existing component patterns
3. Use Tailwind for styling
4. Ensure responsive design
5. Add to appropriate step

## 🚀 Release Process

Maintainers will:

1. Review and merge PRs
2. Update version in package.json
3. Update CHANGELOG.md
4. Create GitHub release
5. Deploy to production

## 💬 Getting Help

- Open a [Discussion](https://github.com/yourusername/ai-tagger/discussions) for questions
- Join our community channels (if available)
- Check existing issues and PRs
- Read the documentation

## 🎖️ Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Appreciated in the community!

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AI Tagger! 🎉**

