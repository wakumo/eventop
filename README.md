
# EventOp - Blockchain Event Monitoring & Distribution System

**DockerHub Link:** https://hub.docker.com/r/registrywkm/eventop

## Overview

EventOp is a high-performance blockchain event monitoring and distribution system that acts as a centralized service for tracking and delivering smart contract events to multiple microservices. Instead of each microservice connecting directly to blockchain nodes, EventOp provides:

- **Centralized Blockchain Monitoring**: Single point of connection to blockchain nodes (Ethereum, BSC, Polygon, etc.)
- **Event Distribution via RabbitMQ**: Reliable message queue for broadcasting events to subscribed services
- **Efficient Resource Usage**: Reduces blockchain RPC calls by centralizing event scanning
- **Real-time Event Delivery**: Automatic detection and forwarding of blockchain events
- **Historical Event Rescanning**: Support for reprocessing past events when needed
- **Multi-chain Support**: Track events across multiple blockchain networks simultaneously

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Blockchain Networks                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Ethereum   │  │     BSC      │  │   Polygon    │  ...         │
│  │     Node     │  │     Node     │  │     Node     │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ Web3/RPC
          ┌──────────────────▼──────────────────┐
          │                                     │
          │            EventOp Service          │
          │                                     │
          │  ┌─────────────────────────────┐   │
          │  │  Event Scanner Service      │   │
          │  │  - Block monitoring         │   │
          │  │  - Event detection          │   │
          │  │  - Contract event parsing   │   │
          │  │  - Coin transfer tracking   │   │
          │  └──────────┬──────────────────┘   │
          │             │                       │
          │  ┌──────────▼──────────────────┐   │
          │  │  Event Message Service      │   │
          │  │  - Message formatting       │   │
          │  │  - Retry logic              │   │
          │  │  - Status tracking          │   │
          │  └──────────┬──────────────────┘   │
          │             │                       │
          │  ┌──────────▼──────────────────┐   │
          │  │  PostgreSQL Database        │   │
          │  │  - Events configuration     │   │
          │  │  - Processed blocks         │   │
          │  │  - Event messages queue     │   │
          │  │  - Network metadata         │   │
          │  └─────────────────────────────┘   │
          │                                     │
          └──────────────────┬──────────────────┘
                             │ Publish Events
          ┌──────────────────▼──────────────────┐
          │                                     │
          │         RabbitMQ (EventMQ)          │
          │                                     │
          │  Exchange: configurable (topic)     │
          │  Routing Key Format:                │
          │    {app}.events.{service}.{event}   │
          │                                     │
          │  Example routing keys:              │
          │    my_app.events.wallet.transfer    │
          │    my_app.events.wallet.coin_xfer   │
          │                                     │
          └──────────┬──────────┬───────────────┘
                     │          │
          ┏━━━━━━━━━━┷━━┓    ┏━━┷━━━━━━━━━━━━┓
          ┃              ┃    ┃               ┃
          ┃ Microservice ┃    ┃ Microservice  ┃  ...
          ┃      A       ┃    ┃      B        ┃
          ┃              ┃    ┃               ┃
          ┃ Subscribe:   ┃    ┃ Subscribe:    ┃
          ┃ *.wallet.*   ┃    ┃ *.*.transfer  ┃
          ┃              ┃    ┃               ┃
          ┗━━━━━━━━━━━━━━┛    ┗━━━━━━━━━━━━━━━┛
```

### Data Flow

1. **Event Configuration**
   - Register events to monitor via database seeding
   - Configure contract addresses, event signatures, and target chains

2. **Blockchain Scanning**
   - EventOp periodically fetches latest blocks from configured blockchain nodes
   - Parses block receipts for contract events and coin transfers
   - Extracts relevant event data based on registered event configurations

3. **Message Queueing**
   - Detected events are formatted and stored in PostgreSQL
   - Messages are published to RabbitMQ with appropriate routing keys
   - Failed messages are automatically retried

4. **Event Distribution**
   - Microservices subscribe to RabbitMQ queues with routing key patterns
   - Messages are delivered based on chain ID and event name matching
   - Services process events independently and asynchronously

## Integration Guide

### For Microservices: How to Receive Events

#### Step 1: Register Events in EventOp

Add your events to the configuration file (default: `events.seed.json` or use `EVENTS_FILE_PATH` env var):

```json
{
  "service_name": "my_service",
  "name": "Transfer(address,address,uint256)",
  "routing_key": "my_app.events.my_service.token_transfer",
  "abi": {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  "chain_ids": [97],
  "contract_addresses": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]
}
```

Then seed the database:
```bash
yarn execute seed:events --env [dev/prod]
yarn execute job:scan_events -c 97
```

#### Step 2: Subscribe to RabbitMQ

Connect your microservice to RabbitMQ and subscribe to relevant routing keys:

**Routing Key Patterns:**

Routing keys are fully customizable in the events configuration file. Common patterns:
- `{app}.events.{service}.{event_type}` - Your custom format
- `my_app.events.my_service.token_transfer` - Specific event
- `my_app.events.wallet.*` - All wallet service events
- `*.events.*.coin_transfer` - Coin transfers from all services

**Example (NestJS):**

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

export class EventConsumerService {
  @RabbitSubscribe({
    exchange: 'your_exchange_name', // Use your configured exchange
    routingKey: 'my_app.events.my_service.token_transfer',
    queue: 'my-service-transfer-queue',
  })
  async handleTransferEvent(message: EventMessage) {
    console.log('Received Transfer event:', message);
    // Process the event
  }

  @RabbitSubscribe({
    exchange: 'your_exchange_name',
    routingKey: 'my_app.events.wallet.native_coin_transfer',
    queue: 'my-service-coin-queue',
  })
  async handleCoinTransfer(message: EventMessage) {
    console.log('Received coin transfer:', message);
    // Process the transfer
  }
}
```

#### Step 3: Process Event Messages

**Message Format:**

```typescript
interface EventMessage {
  id: number;                    // Unique message ID
  payload: object;               // Parsed event parameters (decoded from blockchain)
  serviceName: string;           // Service name from event configuration
  eventName: string;             // Event name/signature (e.g., 'Transfer(address,address,uint256)')
  eventTopic: string;            // Event topic hash (keccak256 of signature)
  chainId: number;               // Chain ID (e.g., 97 for BSC Testnet)
  txId: string;                  // Transaction hash
  logIndex: number;              // Log index in the transaction
  blockNo: number;               // Block number where event occurred
  contractAddress: string;       // Contract address that emitted the event
  timestamp: string;             // Block timestamp (as bigint string)
  from: string | null;           // Sender address (for transfers)
  to: string | null;             // Receiver address (for transfers)
}
```

**Example payload for Transfer event:**

```typescript
{
  id: 12345,
  payload: {
    from: "0x1234...",
    to: "0x5678...",
    value: "1000000000000000000"
  },
  serviceName: "my_service",
  eventName: "Transfer(address,address,uint256)",
  eventTopic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  chainId: 97,
  txId: "0xabc123...",
  logIndex: 0,
  blockNo: 12345678,
  contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  timestamp: "1634567890",
  from: "0x1234...",
  to: "0x5678..."
}
```

**Response Handling:**

Your microservice doesn't need to send a response back to EventOp. Simply:
- **ACK** the message if processing succeeds
- **NACK/REJECT** the message if processing fails (triggers retry in RabbitMQ)

RabbitMQ will handle redelivery based on your queue configuration.

### Supported Event Types

1. **Smart Contract Events**: Any custom event emitted by smart contracts
2. **Coin Transfers**: Native coin transfers (ETH, BNB, MATIC, etc.)
3. **Token Transfers**: ERC20/BEP20 token transfers (via Transfer events)

## Setup

### Environment Variables

#### Event Configuration

**`EVENTS_FILE_PATH`** - Path to events configuration JSON file
- Specifies which blockchain events to monitor and how to route them
- Default: `events.seed.json` (in project root)
- Example: `EVENTS_FILE_PATH=/path/to/my-events.json`
- See `events.seed.example.json` for file format reference

**Event Configuration File Format:**

Each event in the JSON array must have:
- `service_name` (string): Name of the microservice that will consume this event
- `name` (string): Event signature (e.g., `Transfer(address,address,uint256)`) or `coin_transfer` for native transfers
- `routing_key` (string): RabbitMQ routing key for message distribution
- `chain_ids` (array): List of blockchain network IDs to monitor (1=Ethereum, 56=BSC, 97=BSC Testnet, 137=Polygon)
- `abi` (object, optional): Event ABI definition (not needed for `coin_transfer`)
- `contract_addresses` (array, optional): Specific contract addresses to monitor. If omitted, monitors all contracts emitting this event

```json
{
  "service_name": "my_service",
  "name": "Transfer(address,address,uint256)",
  "routing_key": "my_app.events.my_service.token_transfer",
  "abi": { /* Event ABI */ },
  "chain_ids": [1, 56, 137],
  "contract_addresses": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]
}
```

#### Event Message Retention

- `KEEP_SENT_MESSAGES=1` - Keep sent messages as DELIVERED status for debugging
- `KEEP_SENT_MESSAGES=0` or unset - Delete messages immediately after sending (legacy behavior, default)
- `EVENT_MESSAGE_RETENTION_HOURS=24` - Retention period in hours (default: 24 = 1 day)
  - Examples: `12` (12 hours), `48` (2 days), `72` (3 days)
- When `KEEP_SENT_MESSAGES=1`, run cleanup job periodically: `yarn execute job:delete_delivered_messages`

#### Scan Schedule Control (Development Only)

**`SCAN_SCHEDULE_PATTERN`** - Schedule pattern for automatically enabling/disabling event scanning in development environments

This feature only works when `NODE_ENV !== 'production'`. In production, scanning runs 24/7.

**Format:** `TZ=<timezone>|<day>[<time-range|all|off>],<day>[<time-range|all|off>],...`

**Components:**
- `TZ=<timezone>` - Timezone offset: `+HH:MM` or `-HH:MM` (e.g., `+07:00` for Vietnam, `-05:00` for US Eastern)
- `<day>` - Day name: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun` (case-insensitive)
- `<time-range>` - `HH:MM-HH:MM` format (24-hour, start-end times)
- `all` - Keyword to scan all day (equivalent to `00:00-23:59`)
- `off` - Keyword to disable scanning for that day
- **Default behavior**: Days not listed in pattern default to scanning all day

**Examples:**

```bash
# Vietnam business hours (Mon-Fri 8am-6pm, weekends off)
SCAN_SCHEDULE_PATTERN="TZ=+07:00|mon[08:00-18:00],tue[08:00-18:00],wed[08:00-18:00],thu[08:00-18:00],fri[08:00-18:00],sat[off],sun[off]"

# Different hours per day (Mon/Wed/Fri 8am-6pm, Tue/Thu 9am-5pm, weekends off)
SCAN_SCHEDULE_PATTERN="TZ=+07:00|mon[08:00-18:00],tue[09:00-17:00],wed[08:00-18:00],thu[09:00-17:00],fri[08:00-18:00],sat[off],sun[off]"

# Only configure specific days (Mon 8am-6pm, Tue off, Wed 9am-5pm - other days scan all day by default)
SCAN_SCHEDULE_PATTERN="TZ=+07:00|mon[08:00-18:00],tue[off],wed[09:00-17:00]"

# 24/7 scanning (all days enabled - can omit all days or use [all])
SCAN_SCHEDULE_PATTERN="TZ=+00:00|"
# or
SCAN_SCHEDULE_PATTERN="TZ=+00:00|mon[all],tue[all],wed[all],thu[all],fri[all],sat[all],sun[all]"

# US Eastern business hours
SCAN_SCHEDULE_PATTERN="TZ=-05:00|mon[09:00-17:00],tue[09:00-17:00],wed[09:00-17:00],thu[09:00-17:00],fri[09:00-17:00],sat[off],sun[off]"
```

**Running the Schedule Control Job:**

```bash
# Run the schedule control job (one-time execution)
yarn execute job:schedule_scan_control
```

**How it works:**
- Job runs once, checks current time against the schedule pattern, then exits
- Scheduling frequency is controlled by Kubernetes CronJob (e.g., run every hour)
- When schedule indicates scan should stop: sets `is_stop_scan = true` for all networks
- When schedule indicates scan should start: deletes all `ProcessedBlockEntity` records, then sets `is_stop_scan = false`
- This ensures fresh start from current blockchain state when resuming scans

### Build & Deploy

```
docker build --platform linux/amd64 -t registrywkm/eventop:<tag-version> .
```

- Using `docker login` cli to login registrywkm account

```
docker push registrywkm/eventop:<tag>
```

### Tracking New Events

#### Step 1: Configure Events

Add new events to your events configuration file (default: `events.seed.json` or use `EVENTS_FILE_PATH` env var):

```json
[
  {
    "service_name": "my_service",
    "name": "Transfer(address,address,uint256)",
    "routing_key": "my_app.events.my_service.token_transfer",
    "abi": { /* Event ABI from contract */ },
    "chain_ids": [97],
    "contract_addresses": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]
  }
]
```

See `events.seed.example.json` for more examples.

#### Step 2: Seed Database

Run the following commands to register events and start monitoring:

```bash
# Register events from configuration file
yarn execute seed:events --env [dev/prod]

# Register blockchain networks (if not already done)
yarn execute seed:networks

# Start scanning for events on specific chain
yarn execute job:scan_events -c 97  # BSC Testnet
yarn execute job:scan_events -c 56  # BSC Mainnet
yarn execute job:scan_events -c 137 # Polygon
yarn execute job:scan_events -c 1   # Ethereum Mainnet

# Note: Use "yarn execute-tsnode" in development to rebuild
```

#### Step 3: Rescan Historical Events (Optional)

If you need to reprocess past events:

```bash
yarn execute job:rescan_events -c <chain_id> -f <from-block> -t <to-block>

# Example: Rescan BSC Testnet from block 1000000 to 1001000
yarn execute job:rescan_events -c 97 -f 1000000 -t 1001000
```

### Common Chain IDs

- `1` - Ethereum Mainnet
- `56` - BNB Smart Chain (BSC) Mainnet
- `97` - BSC Testnet
- `137` - Polygon Mainnet
- `80001` - Polygon Mumbai Testnet
