# nodejs SSE passthru from redis pubsub
config envs:
```
LISTEN_HOST=127.0.0.1
LISTEN_PORT=8081
# https://www.npmjs.com/package/ioredis
REDIS_URL=redis://username:authpassword@127.0.0.1:8081  
# cause some other libs can use pubsub channels internaly (ex: Bull queues)
CHANNEL_PREFIX="sse/"
```

## Docker
Docker container will use and expose 80 port by default

### Prebuilt
```
docker pull buldezir/node-redis-sse:latest
docker run -d -p 8081:80 --name=node-sse --add-host=host.docker.internal:host-gateway -e REDIS_URL=redis://host.docker.internal:6379 buldezir/node-redis-sse
```

### Build local container
    
```
docker build -t node-sse .
docker run -d -p 8081:80 --name=node-sse --add-host=host.docker.internal:host-gateway -e REDIS_URL=redis://host.docker.internal:6379 node-sse
```
