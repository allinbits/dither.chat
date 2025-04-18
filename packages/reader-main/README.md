# Reader Main

This is a fork of ChronoSync that simply reads the content from the chain, and the re-routes it through an event system.

## Messages

These are the messages / memos this service is parsing.

```
dither.*
```

## Tech

- ChronoState

**Docker is required** to easily spin up and tear down this service.

## Usage

```
docker-compose up
```

```
docker-compose down
```

Environment variables can be modified inside of `docker-compose.yml`

## Local Development

If you're trying to build locally, starting the docker container with the command below ensures everything is rebuilt each time.

```
docker compose up --build
```