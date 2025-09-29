!!! Hey Listen!
We will never ask you for your private keys, or mnemonic phrase.
Never share this information with anyone else.
!!!

# FAQ

Information for people who have questions about Dither and how it works.

## How does dither work?

Dither works by pushing messages to the AtomOne blockchain with a specific format.

Specifically for posting it's `dither.Post("My message goes here")`

As long as it goes to the `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep` address, it will be indexed.

## Can I upload images?

No, instead you can link to other third-party providers who will be image hosts. This prevents nefarious content from being uploaded to the chain. It's important to understand that Dither is a text-only service.

## How do I post without Keplr?

If you are using a cli application like `atomoned` you can do a simple bank transfer to `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep` with `dither.Post("My message goes here")` to post a message.

## Why does dither cost PHOTON?

In order to index your message and keep the service alive we take a very tiny fee for indexing, and the validators will get the rest of the fees for indexing the data on-chain.

## Can messages be deleted?

No, they cannot be deleted. However, Dither does reserve the right to hide a message. However, you as a user will always have access to these messages as they are **always available on-chain, if you go looking for them**.