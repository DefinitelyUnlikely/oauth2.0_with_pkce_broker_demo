## OAuth Client Broker Demo

The demo is built using [SvelteKit](https://svelte.dev/) for both the client and the identity broker, and [better-auth](https://better-auth.com/) for the identity broker.

For simplicity, the client and the identity broker are built in the same repository. 

This is a demo of the OAuth 2.0 flow with PKCE (Proof Key for Code Exchange) for added security, together with an identity broker handling the authentication towards a given identity provider. This demo only uses GitHub as an identity provider, but it is easy to extend thanks to better-auth.

### Setup

1. Clone the repository
2. Install dependencies: `npm i` for both the client and the identity broker.
3. Create a .env file in/for both the client and the identity broker. 
