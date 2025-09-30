!!! Hey Listen!
We will never ask you for your private keys, or mnemonic phrase.
Never share this information with anyone else.
!!!

# FAQ

Information for people who have questions about Dither and how it works.

## How does dither work?

Dither pushes messages to the AtomOne blockchain using a specific format.

For posting, the memo must be `dither.Post("My message goes here")`

As long as the message is sent to the address `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep` it will be indexed.

## Can I upload images?

No, instead you can link to other third-party providers who will be image hosts. This prevents nefarious content from being uploaded to the chain. It's important to understand that Dither is a text-only service.

## How do I post without Keplr?

If you are using a cli application like `atomoned` you can do a simple bank transfer to `atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep` with `dither.Post("My message goes here")` to post a message.

## Why does dither cost PHOTON?

Dither's indexing fee is exceptionally small and a mere fraction of a cent. This fee is to cover the operational cost of keeping our service alive. This tiny fee allows us to index your message, reply, or like. The rest is paid to the network validators who process and permanently store the data on the blockchain.

## Can messages be deleted?

No, they cannot be deleted. However, Dither does reserve the right to hide a message. However, you as a user will always have access to these messages as they are **always available on-chain, if you go looking for them**.