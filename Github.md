# Direct Push (only if known changes)

1. Ensure you are on the main branch
   - `git checkout main`
2. Modify code
   - edit files locally
   - save your changes
3. Stage and commit
   - `git add .`
   - `git commit -m "Direct push for known changes"`
4. Push directly to main
   - `git push origin main`

# GitHub Workflow

1. Create a new branch
   - `git checkout -b branch-name`
   - or use your own branch name: `git checkout -b my-feature-branch`

2. Modify code
   - edit files locally
   - save your changes

3. Stage and commit
   - `git add .`
   - `git commit -m "Update README and workflow instructions"`

4. Push the branch to GitHub
   - `git push -u origin update-readme`

5. Create a pull request
   - open the repository on GitHub
   - click "Compare & pull request"
   - add a summary and create the PR

6. CI/CD behavior
   - when the PR is opened or updated, GitHub Actions or your configured pipeline will run automatically
   - merge to the default branch after checks pass
   - the workflow will usually deploy or validate the code after merge

7. Notes
   - branch names should be descriptive
   - keep commits small and focused
   - check the repository README or `.github/workflows` folder for specific CI/CD details
