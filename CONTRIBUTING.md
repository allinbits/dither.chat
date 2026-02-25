# Contributing to Dither.chat

This guide will help you set up a local development environment for Dither.chat.

## Prerequisites

- Go 1.21+
- Node.js 20+
- Bun

## Setting Up a Local Network

You can run a local instance of the AtomOne blockchain to test Dither.chat.

### 1. Clone and Build AtomOne

```bash
git clone https://github.com/atomone-hub/atomone
cd atomone
make build
```

### 2. Start the Local Network

```bash
make localnet-start
```

### 3. Copy the Mnemonics

Look at the logs output and find the mnemonic phrases for the test accounts. Copy them for later use.

### 4. Enable CORS

Stop the running process, then run the following command to enable CORS for local development:

```bash
./build/atomoned --home ~/.atomone-localnet config set app api.enabled-unsafe-cors true
```

### 5. Restart the Local Network

```bash
make localnet-restart
```

### 6. Configure the Network Spammer (Optional)

If you want to generate test data, configure the network spammer tool:

```bash
cd packages/tool-network-spammer
```

Create a `.env` file with the following content:

```env
MNEMONIC="your mnemonic phrase here"
RPC_ENDPOINT="http://localhost:26657"
INTERVAL_MS=10000
```

Replace `your mnemonic phrase here` with one of the mnemonics from step 3.

## Running the Application

Start the services in the following order (each in a new terminal):

### 1. Start the API

```bash
docker run -d --name dither-postgres -p 5432:5432 -v dither_postgres_data:/var/lib/postgresql/data -e POSTGRES_USER=default -e POSTGRES_PASSWORD=password -e POSTGRES_DB=postgres postgres:16
cd packages/api-main
bun start
```

### 2. Start the Reader

```bash
cd packages/reader-main
API_URLS=http://localhost:1317 bun start
```

The reader will start indexing blockchain data and populating the database.

### 3. Start the Spammer (Optional)

To generate test data:

```bash
cd packages/tool-network-spammer
bun start
```

### 4. Start the Frontend

```bash
cd packages/frontend-main
VITE_SKIP_CSP=true VITE_ENVIRONMENT_TYPE=localnet bun dev
```
