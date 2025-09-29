# Introducing Dither

_A Public Protocol for Thought_

The internet used to feel different. Before the timelines, the algorithms, the performative haze, there was honesty in how we shared. Words mattered. You didn’t need a strategy to speak your mind. That’s what we’re building towards again.

All in Bits is proud to present **Dither**, a small but determined experiment in reclaiming what the internet used to feel like. Today, we’ve launched the first live version: a minimal but functional application stack that shows how the protocol works, how people can start using it, and how builders can extend it.

There’s no algorithm. No timeline tricks. No edits. Just posts, preserved forever on-chain.

## **What Dither Is**

At its core, Dither is a read-optimized, event-sourced messaging protocol. It indexes a specific subset of memos on any compatible blockchain (currently [AtomOne](https://atom.one/)), reconstructs logical state from those events, and exposes a public API. 

It has two main parts:

* **Dither Service**: the backend that reads blockchain data, reconstructs user and post state, and serves that through a public API.

* **Dither Website**: a lightweight client that connects to the service and lets users browse, post, follow, and interact with content.

This separation means anyone can run their own version of the service, create new clients, or build entirely new interfaces on top of the Dither protocol. It’s a toolset for building digital spaces.

## **We’re Just Getting Started**

Here is what’s built so far, and what’s coming next.

### **Phase 1: Launch (now)**

* Live backend indexing memos on AtomOne

* Basic client for posting, following, searching, and reflecting

* No login required, but supports passkey and wallet connections

* All content is public and preserved on-chain

### **Phase 2: Onboarding and Community (soon)**

* A user-friendly faucet system for new accounts

* Passkey onboarding with temporary delegated posting rights

* Metadata improvements for rich previews in apps like Discord

* Feedback loops to improve UX and guide feature development

### **Phase 3: Scaling and Specialization (later)**

* Tools for moderation and shared community policies

* Permissionless portal creation and custom clients

* Growth through builders, not gatekeepers

## **Protocols Need People**

Dither is a public protocol that anyone can build on. It is early days, but the foundation is live and ready for real-world use. We are looking for people who care about creating better spaces online and want to shape what comes next.

If you believe the internet should have places owned by the people who use them, places where communication is open, public, and resilient, this is your chance to help build and grow one. 

**Developers** can contribute directly. Fork the repos, run your own service, extend the protocol, or build your own frontend. The core is open, composable, and designed to be remixed.

If you’re **not a builder**, you can still help. Go post\! Use it. Share your posts. Bring in new voices. Tell us what’s missing. Every real use case helps improve Dither.

We’re building Dither in the open, and your participation now will help guide the future. The internet was a better place without algorithms. Let's rebuild a corner of it again.
