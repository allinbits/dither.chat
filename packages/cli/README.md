# cli

This application simply reads the last 100 blocks to extract any `dither.` messages from memos.

## Requirements

- golang

## Usage

```sh
go mod tidy
```

```sh
go run main.go
```

## Endpoint

Modify `config.json` to change the `rpc` endpoint.