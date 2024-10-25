
DockerHub Link: https://hub.docker.com/r/registrywkm/eventop

### Architecture

### Setup

### Build & Deploy

```
docker build --platform linux/amd64 -t registrywkm/eventop:<tag-version> .
```

- Using `docker login` cli to login account: https://start.1password.com/open/i?a=VC6IISJJFJE2VPYHCWW5K2HBSM&v=yuxny46dkvbpnlbsisq2442uli&i=bjth42febagm32c4qixq2gdkg4&h=wakumovietnamcoltd.1password.com

```
docker push registrywkm/eventop:<tag>
```

#### Tracking New Event

1. Add new event into src/scripts/seeds/events/events.ts
2. Run this cmd
```
yarn execute seed:events --env [dev/prod]
yarn execute seed:networks
yarn execute job:scan_events -c 97 // Scan event blockchain bst testnet
// Note: Using "yarn execute-tsnode" on development to rebuild
```

Rescan  by cmd:
```
yarn execute job:rescan_events -c <chain_id> -f <from-block> -t <to-block>
```
