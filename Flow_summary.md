# Service Provider Broker Documentation

## Infrastructure

### Broker
The broker is a web application that acts as a single source of truth for user authentication (and often authorization). The broker handles all contact with identity providers and service providers, acting as a bridge between the two. For the broker to act as a source of authentication for service providers, it needs to be implemented as an oauth 2.0 authorization server.

The broker will need to implement the following endpoints:
- /oauth/authorize
- /oauth/token

As well as a jwks endpoint for public key verification if asymmetric signing is used.
- /.well-known/jwks.json

A database with at least two tables is needed. One for trusted clients (oauth_clients) and one for authorization codes and related data (oauth_codes)

The oauth_clients table should have the following columns:
- client_id (usually a UUID, Primary Key)
- client_secret (a unique random string)
- client_name (the name of the client)
- redirect_uri (the specific callback URI for the client. Example: https://myapp.com/callback)

The oauth_codes table should have the following columns:
- code (the authorization code sent to the client)
- client_id (foreign key to oauth_clients)
- redirect_uri (the specific callback URI for the client. Example: https://myapp.com/callback)
- expires_at (the expiration time of the authorization code)
- user_id (the id of the, in the broker, logged in user)
- code_challenge (the code challenge sent to the client)
- code_challenge_method (the code challenge method used, should always be S256)


### Service Provider

A callback route is needed for the service provider to receive the authorization code from the broker. A route or function that is called when doing the initial redirect is also needed. Store client id and client secret in a secure location if possible. In public clients, a way to increase security is to make sure URIs, client id and secret are hardcoded and static - this prevents some possible tampering.

## Suggested auth flow

This document is meant to document the suggested new auth flow for service providers (including how the identity broker needs to be built) going forward to simplifiy adding new service providers and identity providers.

### Suggested flow

The suggested auth flow is following the oauth 2.0 authorization framework with proof key for code exchange (PKCE).
This flow is well documented in their Request for Comments (RFC) documents: [Oauth 2.0 Auth Framework](https://datatracker.ietf.org/doc/html/rfc6749) and [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636). 

Using PKCE is recommended when service providers might be running in public clients (e.g. mobile apps, web apps, etc.). Cloey.Client is currently a public client, for example. 

All service providers need to be registered as trusted clients in the identity broker, with their correct callback URI (redirect URI) added to the client registration table. 

#### oauth 2.0 authorization code flow with pkce summary

Below flow is assuming user is not logged in to the identity broker nor has a valid session in the service provider.

1. The service provider notices it lacks a valid session. Either the user triggers the login process or the service provider automatically starts the authorization work flow. 
2. The service provider generates a code verifier and a code challenge. [Read more here](https://docs.cotter.app/sdk-reference/api-for-other-mobile-apps/api-for-mobile-apps#step-1-create-a-code-verifier)
3. The service provider generates a random state/nonce. Usually a 128-bit random string but if URL length is a concern, it can be shorter.
4. The service provider redirects the user to the identity broker's '/oauth/authorize' endpoint with the following parameters:
    - client_id: The service provider's client id
    - redirect_uri: The service provider's redirect uri
    - response_type: code
    - scope: The scope of the authorization request
    - state: The state/nonce generated in step 3
    - code_challenge: The code challenge generated in step 2
    - code_challenge_method: S256
5. The service providers stores the verifier and the state in session storage or as HttpOnly cookies when possible.
6. The Identity broker checks that all paramters are available and valid. If valid, the broker will check if the client is trusted and if the redirect uri is the same as the one registered for the client. 
7. Assuming there is NOT a valid session already, the user is redirected to the identity brokers login page where the user can pick their desired identity provider and log in. After being logged in, the broker redirects the user back to the broker's '/oauth/authorize' endpoint with the parameters from before.
8. The broker now creates a new code and inserts it into the oauth_codes table.
9. The broker redirects the user back to the service provider's redirect uri with the following parameters:
    - code: The authorization code created in step 8
    - state: The state/nonce generated in step 3
10. The service provider checks that the code exists as a parameter and state matches the ones stored before. 
11. The service provider does a http POST request to the /oauth/token endpoint, with a x-www-form-urlencoded content type header and a body containing the following URL parameters:
    - grant_type: authorization_code
    - code: The authorization code created in step 8
    - redirect_uri: The service provider's redirect uri
    - client_id: The service provider's client id
    - code_verifier: The code verifier generated in step 2
12. The broker checks all parameters are available and gets the stored authorization code from the oauth_codes table. It checks if the code exists, haven't expired and if the client id matches the one saved for that specific code.
13. The broker validates the code verifier against the code challenge. 
14. The broker can now send back a JWT with the information you want to share with the service provider. This JWT is signed with the broker's private key and can be verified using the broker's public key.
15. The service provider can now verify the JWT and use the information it contains.
