# SonarQube

When running the project, it is necessary to have the correct dependencies. Before making any adjustments or running any code, the following command must be executed to install the required dependencies:

```bash
npm install --save-dev sonarqube-scanner
```

The SonarQube setup can be done in multiple ways: either by running it locally in another container or on a dedicated server. However, if you want a free and easy-to-use version, SonarCloud is a good option.

---

## SonarCloud

SonarCloud can run and visualize SonarQube’s results in a clear and meaningful way. It is free to set up, and once it is in use, it can be used without requiring a local SonarQube installation. It requires the user to create a token on SonarCloud, which is then referenced in the workflow code and added to GitHub Actions secrets.  

All of this ensures that the code can be analyzed securely and easily.
