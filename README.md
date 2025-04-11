# Dither Service

Dither Service is a provider engine for individual front-end applications to listen to the Dither Protcol.

The Dither Service uses event-sourcing data to rebuild application state from Cosmos based chains, specifically AtomOne.

Dither itself takes the information from the chain as it is created, and indexes it into compartmentalized databases.

The entire repository is built as a micro-service architecture meant to evolve and scale at a rapid pace.

## Usage

```
docker compose up --build
```

## Project Structure Explanation

### [api-feed](./packages/api-feed/README.md)

A REST Endpoint Provider for post feeds, and looking up individual posts.

### [api-likes](./packages/api-likes/README.md)

A REST Endpoint Provider for looking up likes by post hash, or reply hash.

### [indexer-feed](./packages/indexer-feed/README.md)

A mini-indexer that parses memos from a given starting block, and builds feed data into a separate MongoDB database.

### [indexer-likes](./packages/indexer-likes/README.md)

A mini-indexer that parses memos from a given starting block, and builds vote data into a separate MongoDB database.

### [indexer-search](./packages/indexer-search/README.md)

TBD.

### [indexer-users](./packages/indexer-users/README.md)

A mini-indexer that parses memos from a given starting block, and builds follower data into a separate MongoDB database.

### nginx

Just an nginx configuration for gateway access to APIs

## Infrastructure Question(s)

Q. Why would running multiple MongoDB instances be a good idea?

A. Resilience and fault tolerance which allows for the database structure to scale for its individual lane. Meaning that if feeds is only feeds, then that's all it is ever worried about.

Q. What happens during traffic spikes?

A. If there is a traffic spike, this infrastructure allows additional instances to easily be added to continue querying data quickly. Additionally, more databases can be introduced with the exact same data sets to horizontally scale the availability of the data. Additionally, MongoDB supports sharding. We can scale quickly.

Q. What happens when a service fails?

A. Depending on the individual service it will only fail partially, and not effect the entire service. This allows for services to fail, be fixed, and work independently from each other. For example if a Database server goes down, it only effects the individual service. However, if we sharded the service into another region then the service can failover to the next database with the same data in the same lane.