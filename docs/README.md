# **About Dither**

Dither is a public protocol for publishing messages onchain**.** It is designed to be simple, durable, and open to extension by anyone.

At its core, Dither is a read-optimized, event-sourced messaging protocol. It indexes a specific subset of memos from any compatible blockchain (currently AtomOne), reconstructs application state from those events, and exposes that state through a public API.

There are two main components:

* **Dither Service**  
  A backend that monitors the blockchain, processes memo events, and reconstructs user and post data. This state is made available through a REST API.

* **Dither Website**  
  A lightweight frontend that connects to the API and lets users post, browse, follow others, and reflect content. It is fully stateless and open source.

These components are designed to be decoupled. Anyone can run their own version of the service, build their own client, or use the protocol in a completely different way. Dither is not a platform. It is a protocol and reference implementation.

Dither avoids algorithmic feeds, editing tools, and moderation queues. It is minimal by design. All content is public and stored permanently onchain. This structure creates space for users and communities to define their own norms, tooling, and experience. Developers can run their own indexers, fork the client, or build custom frontends using the public API.