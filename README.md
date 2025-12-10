
DockerHub Link: https://hub.docker.com/r/registrywkm/eventop

### Architecture

### Setup

#### Environment Variables

**Event Message Retention:**
- `KEEP_SENT_MESSAGES=1` - Keep sent messages as DELIVERED status for debugging
- `KEEP_SENT_MESSAGES=0` or unset - Delete messages immediately after sending (legacy behavior, default)
- `EVENT_MESSAGE_RETENTION_HOURS=24` - Retention period in hours (default: 24 = 1 day)
  - Examples: `12` (12 hours), `48` (2 days), `72` (3 days)
- When `KEEP_SENT_MESSAGES=1`, run cleanup job periodically: `yarn execute job:delete_delivered_messages`

### Build & Deploy

```
docker build --platform linux/amd64 -t registrywkm/eventop:<tag-version> .
```

- Using `docker login` cli to login registrywkm account

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
