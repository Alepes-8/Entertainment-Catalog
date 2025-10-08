# Docker

The Docker setup is included in this project to ensure a high level of **environmental control**. With Docker, the container includes everything required for the project to run: the operating system, Node.js version, dependencies, and configuration.

While occasional updates may still be necessary, using a container ensures that the application behaves consistently across all environments — whether running locally or deployed on an external API service.

## Swagger UI

The current setup allows for the **Swagger UI** to be running along side the API system, allowing the users the understanding that if the **entertainment_api** container is running you will be able to se the swagger ui, unless issues has occured. Which in turn can be used to test the **entertainment_api** functionality.