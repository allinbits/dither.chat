# Indexer Search

This is a mini-indexer that parses feed data and inserts it into the database.


## Messages

TO BE DETERMINED

```
dither.User.
```

## Tech

- MongoDB
- ChronoState

**Docker is required** to easily spin up and tear down this service.

## Usage

Keep in mind that when building the `data.sqlite` file will automatically be copied over if present.

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