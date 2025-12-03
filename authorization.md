# Authorization

## Confidential clients (Clients that store their secrets and tokens server-side)

Confidential clients are not a great concern when it comes to authorization. After following the oauth2.0 framework and storing the token server-side (with continous validation of the token), we can be fairly certain that the client is authorized to access the resources it claims to have access to. In an echo-system with only confidential clients (or an echo system where confidential clients share the same API key, separate from the one used by public clients), a secret API key is often enough to authorize the client.

## Public clients (Clients that store their secrets and tokens client-side - accessible to the user)

Public clients, e.g SPAs, mobile apps, etc. requires more care when it comes to authorization. In these, even env variables are accessible to the user, and it is not possible to store secrets server-side. Because of these reasons, one should assume that malicious actors always have access to UI elements that might be "protected" by a user's claims. Those UI elements cannot directly implement access to any secure resource and we shouldn't assume any API calls containing the API key for public clients are automatically valid. Another layer of security needs to be added at first. 

TL;DR For public clients, assume EVERYTHING is accessible to the user. 

### All API calls for public clients go through the Identity Broker (BFF or Hybrid BFF)

By having all API calls for public clients go through the broker, public clients do not need to store any API keys or other secrets. They don't actually ever need them at all. We may still store a token in the client, with information about the user's identity and claims. The client can still do checks against the token to know things like: "Is the user logged in?" or "What should be shown to the user?". For the everyday user, this is also enough to convey the information they need (what they can do and if they are logged in). 

A malicious user may still change the token (or the variables that uses the token information) to whatever value they like. Such a user might change their claims to that of an admin or a regular user and the client will allow that user to see UI elements related to their faked role. 

But by making sure all UI elements that need access to some resource we consider protected, go through the broker, no actual functionallity is being made accessible unless you have a valid session in the broker. 

#### The flow

The public client makes an API call for a protected resource, but in reality, that request is sent to a broker endpoint, not the actual API. The broker can now validate their session and check if the user is allowed to fetch the protected resource. If they are, the broker will forward the request to the actual API and return the response to the client. At this point, the client can render the fetched protected resource. 
