# CI/CD Process

The CI/CD process for the project is designed to perform continuous testing of the project's functionality when creating the necessary pull requests and merges. This approach helps improve the quality, stability, and security of the product. It is especially important when working on multiple feature or fix branches simultaneously.

---

## Continuous Integration (CI) Process

This process runs on each commit associated with a pull request, allowing users to verify whether the system is functioning as intended after the code changes are committed. This helps limit the number of changes that could unexpectedly break the project or cause undesired outcomes.

---

## Continuous Delivery (CD) Process

When changes are pushed to the main branch, the necessary tests are run to ensure everything works as intended. These tests are generally more thorough and deeper compared to the CI tests, as they are executed less frequently in this project. Once the tests pass successfully, the project is deployed to GitHub Packages in its containerized form, making it available for deployment and use as needed.

---

## CI/CD Dockerized Setup

When pushing changes to the `main` branch, there is a GitHub Action script, **DockerCDSetup.yml**, which builds Docker images, runs tests, and deploys the images to GitHub’s container registry (GHCR).  

This setup provides several benefits:  
- Every change lives in one ecosystem under the umbrella of GitHub.  
- You can define who is allowed to read or write to the container images.  

However, there are also drawbacks:  
- If you want to move to another environment, the images must be rebuilt.  
- Personal accounts have limitations on bandwidth and storage.  

Once properly configured, if the `docker-compose.yml` files are accurate, you don’t need to build the images manually. Instead, you can simply pull the images from GHCR to run the services.  

Additionally, when reusing GHCR images in different CI/CD jobs, tests can be executed against the **published images**, rather than rebuilding everything from scratch in each workflow run.


## Setup: Push Your Own Docker Image to GitHub Container Registry

When forking this project and setting it up for the first time, the GitHub Actions workflow will most likely fail because GHCR is not yet configured.  

To fix this, follow these steps:  

1. **Ensure you have a GitHub account** (required to fork).  
2. **Update the `docker-compose.yml` files**:  
   - Adjust the image names to match your GitHub username.  
   - Use only **lowercase letters** (GHCR does not allow uppercase in image names).  
3. **Create a Personal Access Token (PAT):**  
   - Go to [GitHub Token Settings](https://github.com/settings/tokens).  
   - Create a **Personal Access Token (classic)**.  
   - Enable the following scopes:  
     - `write:packages`  
     - `read:packages`  
     - `delete:packages`  
4. **Add the token as a repository secret:**  
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.  
   - Name the secret `GHCR_PAT`.  
   - Paste in the token you created.  

That’s it — once this is set up, GitHub Actions will be able to build and push your Docker images to GHCR.

---
