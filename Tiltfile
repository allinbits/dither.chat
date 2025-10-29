# -*- mode: Python -*

docker_compose('docker-compose.yml')

docker_build('ditherchat/api-main', '.',
  dockerfile = './packages/api-main/Dockerfile',
  live_update = [
    sync('./packages/api-main/src', '/app'),
    run('pnpm install', trigger='package.json'),
    restart_container(),
  ])

docker_build('ditherchat/reader-main', '.',
  dockerfile = './packages/reader-main/Dockerfile',
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
    resource_deps=['api-main'],
    deps=[
        './packages/frontend-main/src',
        './packages/frontend-main/package.json',
        './packages/frontend-main/vite.config.ts'
    ]
)
