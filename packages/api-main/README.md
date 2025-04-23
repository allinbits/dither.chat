# API Main

This uses elysia to serve data from the relevant database.

## Tech Stack

-   [REST API - ElysiaJS](https://elysiajs.com)
-   [Database - PostgreSQL](https://www.postgresql.org)
-   [SQL ORM - Drizzle](https://orm.drizzle.team)

## Usage

Start the PostgreSQL Database

```
docker compose up
```

Push Table Structure to PostgreSQL from Drizzle

_This should only be ran once, and ran each time you clear the `data` folder._

```
pnpm db:push
```

Run the application

```
pnpm install
pnpm start
```

All data for postgres is stored in the `data` directory.

## Testing

> [!Caution]  
> When running tests all tables will be cleaned out for a clean test environment. You've been warned.

Start the PostgreSQL Database

```
docker compose up
```

Push Table Structure to PostgreSQL from Drizzle

_This should only be ran once, and ran each time you clear the `data` folder._

```
pnpm db:push
```

Run the Tests

```
pnpm install
pnpm test
```
