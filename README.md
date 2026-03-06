# ENERGY 2100 User Manual — GitHub Pages deploy

This folder contains a static HTML documentation site exported from HelpNDoc. To publish on GitHub Pages:

1. Create a GitHub repository and set it as `origin` for this folder.
2. Commit and push the files to the `main` branch (root).

Example commands:

```bash
cd "c:\ENERGY 2100 User Manual"
git init
git add .
git commit -m "Add documentation site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

3. On GitHub: open the repository → Settings → Pages. Under "Build and deployment" choose "Branch: main" and folder "/(root)" then Save. GitHub will publish at `https://<your-username>.github.io/<repo>/`.

Notes:
- An `index.html` redirect was added to point to `ENERGY 2100 User Manual.html` so the site root opens the manual.
- Assets are referenced with relative paths (e.g., `vendors/`, `css/`, `lib/`), so hosting from the repo root should preserve links.
- To preview locally before pushing:

```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

If you'd like, I can create a branch with these files pre-committed or prepare a `.gitignore`/`CNAME` as needed.
