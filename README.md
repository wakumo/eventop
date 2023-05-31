
### Architecture

![diagram](/docs/images/diagram.jpg)

### Setup

#### Tracking New Event

1. Add new event into src/scripts/seeds/events/events.ts
2. Run this cmd
```
yarn execute seed:events
yarn execute seed:networks
yarn execute job:delete_delivered_messages
yarn execute job:scan_events -c 97 // Scan event blockchain bst testnet
// Note: Using "yarn execute-tsnode" on development to avoid rebuild
```

Rescan  by cmd:
```
yarn execute job:scan_events -c <chain_id> -f <from-block> -t <to-block>
```