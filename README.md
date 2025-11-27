# OAuth Client <-> Identity Broker <-> Identity Provider Demo

## Overview

The demo is built using [Svelte](https://svelte.dev/) for the client and [better-auth](https://better-auth.com/) for the identity broker. GitHub is used as the identity provider in this demo. But better-auth supports multiple identity providers, making it suitable to act as the identity broker for service providers that might to make use of multiple identity providers at the same time.

For simplicity, the client and the identity broker are built in the same repository. 

This project is a demo for the authentication flow I implemented for a project at an internship - Were the goal was to research possible solutions for an SSO system using multiple identity providers. A key aspect was to make it as simple as possible to add more service providers as well as identity providers as needs evolve.

With the current implementation, adding a new identity provider is simply a matter of registering the provider in the identity broker and adding the necessary environment variables, as well as dealing with any configurations needed on the identity provider side (Usually a callback URL). Adding a new service provider requries you to add the service to the brokers trusted origins list as well as to a database table containing the service providers client id, client secret and redirect uri.

### Built with

- [![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=fff&style=for-the-badge)](https://svelte.dev/)
- [![better-auth](https://img.shields.io/badge/Better%20Auth-FFF?logo=betterauth&logoColor=000&style=for-the-badge)](https://better-auth.com/)

### Setup

1. Clone the repository
2. Install dependencies: `npm i` for both the client and the identity broker.
3. Create a .env file in/for both the client and the identity broker. 
