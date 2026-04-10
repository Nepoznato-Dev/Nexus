# Quick Commands Reference

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Preview build locally
npm run preview
```

## Git & Deployment

```bash
# Check git status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to main (auto-deploys on Netlify)
git push origin main

# View commit history
git log --oneline
```

## Legacy Scripts

If you need to run legacy build scripts, they're in `build-scripts/`:

```bash
# Run specific script
bash build-scripts/script-name.sh

# Or for Python scripts
python3 build-scripts/script-name.py
```

## Netlify Deployment

- **Status**: Automatic deployment on `git push`
- **URL**: <https://nexus-community-project.netlify.app/> (or your custom domain)
- **Dashboard**: <https://app.netlify.com>

## Project Structure

```
Nexus-Community-Project/
├── src/                           # Source code
│   ├── Components/                # Reusable components
│   ├── PagesDisplay/              # Page components
│   ├── App.js                     # Main component
│   └── index.js                   # Entry point
├── public/                        # Static files
├── build/                         # Production build (generated)
├── build-scripts/                 # Legacy build scripts
├── package.json                   # Dependencies & scripts
├── tailwind.config.js             # Tailwind CSS config
└── netlify.toml                   # Netlify config
```

## Useful Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com)

## Environment

- **Node Version**: Check with `node --version` (need v16+)
- **Package Manager**: npm
- **Build Tool**: Create React App
- **Hosting**: Netlify

## Tips

- Use `git add .` before committing
- Write clear commit messages
- Push regularly to backup to GitHub
- Check Netlify build logs if deployment fails
- Clear browser cache if changes don't appear (Ctrl+Shift+Delete)
