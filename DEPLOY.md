# GitHub Pages Deployment

## Setup Instructions

### 1. Enable GitHub Pages
1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**

### 2. Deploy
Push to the `main` branch:
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
- Build the project
- Deploy to GitHub Pages
- Your site will be available at: `https://[username].github.io/mri-viewer/`

### 3. Custom Domain (Optional)
To use a custom domain:
1. Add a `CNAME` file to the `public/` folder with your domain
2. Configure DNS settings in your domain registrar
3. Enable HTTPS in GitHub Pages settings

## Local Testing
Test the production build locally with the correct base path:
```bash
npm run build
npm run preview
```

## Notes
- The app uses base path `/mri-viewer/` for GitHub Pages
- COOP/COEP headers are configured in the Vite preview server
- GitHub Pages may not support these headers - consider Vercel/Netlify for full functionality
