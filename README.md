# nodejs SSE passthru from redis pubsub
config envs:
```
LISTEN_HOST=127.0.0.1
LISTEN_PORT=8081
# https://www.npmjs.com/package/ioredis
REDIS_URL=redis://username:authpassword@127.0.0.1:8081  
```

Docker container will use and expose 80 port by default

## Prepare local container
    
```
docker build -t node-sse .
docker run -d -p 8081:80 --name=node-sse --add-host=host.docker.internal:host-gateway -e REDIS_URL=redis://host.docker.internal:6379 node-sse
```
