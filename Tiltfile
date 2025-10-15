# -*- mode: Python -*

docker_compose('docker-compose.yml')

docker_build('ditherchat_api-main', './packages/api-main',
  live_update = [
    sync('./packages/api-main/src', '/app'),
    run('pnpm install', trigger='package.json'),
    restart_container(),
  ])

docker_build('ditherchat_reader-main', './packages/reader-main',
  live_update = [
    sync('./packages/reader-main/src', '/app'),
    run('pnpm install', trigger='package.json'),
    restart_container(),
  ])

local_resource(
    name='frontend-main',
    dir='./packages/frontend-main',
    cmd='pnpm install',
    serve_cmd='cd ./packages/frontend-main && pnpm run dev',
    deps=[
        './packages/frontend-main/src',
        './packages/frontend-main/package.json',
        './packages/frontend-main/src/vite.config.ts'
    ]
)
