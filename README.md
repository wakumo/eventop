
### Architecture

![diagram](/docs/images/diagram.jpg)

### Setup

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
