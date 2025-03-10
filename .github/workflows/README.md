# GitHub Actions Workflows

This directory contains GitHub Actions workflow configurations that automate various tasks for the Stripe Checkout Autofill Extension.

## Available Workflows

### `release.yml`

This workflow automatically creates a new GitHub release with a ZIP file containing the extension files whenever changes are pushed to the master branch.

#### How it works:

1. Triggers on any push to the master branch
2. Extracts the version number from the extension's manifest.json
3. Creates a ZIP archive of the repository (excluding .git and .github directories)
4. Creates a new GitHub release tagged with the version
5. Attaches the ZIP file to the release

#### Usage:

No manual action is required. The workflow runs automatically when code is pushed to the master branch.

To update the version:
1. Modify the `"version"` field in `manifest.json`
2. Commit and push your changes
3. A new release will be automatically created

## Notes

- The workflow uses the GitHub-provided `GITHUB_TOKEN` for authentication, so no additional setup is required
- You can find the created releases in the "Releases" section of your GitHub repository