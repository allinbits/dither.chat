test:
	cd packages/api-main && docker compose down
	cd packages/api-main && docker compose up -d
	sleep 5
	cd packages/api-main && PG_URI="postgresql://default:password@localhost:5432/postgres" pnpm db:push:force || true
	cd packages/api-main && NODE_OPTIONS="--experimental-global-webcrypto" pnpm test
	cd packages/api-main && docker compose down
