# FHE Sports Prediction Platform

A decentralized sports prediction and voting platform powered by Zama's Fully Homomorphic Encryption (FHE) technology. This application enables users to create sports predictions and submit votes that remain completely private and encrypted on the blockchain until the prediction is closed, ensuring fairness and preventing manipulation.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why Zama Sports Prediction?](#why-zama-sports-prediction)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Problems We Solve](#problems-we-solve)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running Locally](#running-locally)
  - [Deployment](#deployment)
- [Smart Contract](#smart-contract)
- [Frontend Application](#frontend-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Use Cases](#use-cases)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support & Resources](#support--resources)

## Overview

FHE Sports Prediction is a cutting-edge decentralized application (dApp) that revolutionizes sports predictions by leveraging Fully Homomorphic Encryption (FHE). Unlike traditional prediction platforms where votes are public or can be manipulated, our platform ensures that all votes remain encrypted on the blockchain throughout the voting period. This creates a fair, transparent, and tamper-proof environment for sports predictions.

The platform consists of two main components:
1. **Smart Contract**: A Solidity-based contract deployed on Ethereum (Sepolia testnet) that handles prediction creation, encrypted vote submission, and vote tallying
2. **Frontend dApp**: A React-based web application that provides an intuitive interface for users to interact with the smart contract through their Web3 wallets

## Key Features

### Fully Homomorphic Encryption (FHE)
- **Private Voting**: All votes are encrypted client-side before submission and remain encrypted on-chain
- **Computation on Encrypted Data**: Vote tallying happens on encrypted values without revealing individual votes
- **Zero-Knowledge**: No one, not even the contract owner or blockchain validators, can see individual votes until the prediction is closed

### Prediction Management
- **Create Predictions**: Anyone can create a new sports prediction by specifying a title, home team, and away team
- **Three Voting Options**: Each prediction supports three outcomes - Home Win, Away Win, or Draw
- **Active/Inactive States**: Predictions can be active (accepting votes) or closed (votes revealed)
- **Tamper-Proof**: Once submitted, encrypted votes cannot be changed or manipulated

### User Experience
- **Web3 Wallet Integration**: Seamless connection via RainbowKit supporting multiple wallet providers (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- **Real-Time Updates**: Live prediction feed with instant status updates
- **Duplicate Vote Prevention**: Smart contract ensures each address can only vote once per prediction
- **Responsive Design**: Modern, clean UI that works across all devices

### Transparency & Fairness
- **On-Chain Verification**: All transactions are recorded on Ethereum blockchain
- **Decentralized**: No central authority controls the predictions or votes
- **Verifiable Results**: Once closed, anyone with proper permissions can decrypt and verify vote tallies
- **Event Emission**: All major actions emit blockchain events for transparency and off-chain indexing

## Why Zama Sports Prediction?

### The Problem with Traditional Prediction Platforms

Traditional sports prediction and polling platforms suffer from several critical issues:

1. **Vote Manipulation**: Centralized platforms can alter votes without detection
2. **Privacy Concerns**: User voting choices are often visible or can be leaked
3. **Herd Mentality**: Visible voting patterns influence later voters, skewing results
4. **Trust Issues**: Users must trust platform operators not to manipulate outcomes
5. **Front-Running**: Early vote visibility allows strategic voting based on current trends

### Our Solution

Zama Sports Prediction addresses these issues through:

- **Cryptographic Privacy**: FHE ensures votes remain secret during voting period
- **Decentralization**: Smart contracts eliminate single points of failure or control
- **Immutability**: Blockchain records provide permanent, auditable history
- **Mathematical Guarantees**: FHE provides provable security properties
- **Fair Disclosure**: Results only revealed when prediction is officially closed

## How It Works

### 1. Creating a Prediction

Any connected wallet can create a new prediction:
1. User specifies a prediction title (e.g., "Champions League Final 2025")
2. Defines the home team name
3. Defines the away team name
4. Smart contract creates a new prediction with zeroed encrypted vote counters
5. Prediction ID is assigned and prediction becomes active

### 2. Submitting Encrypted Votes

When a user wants to vote:
1. Frontend generates three encrypted values using Zama's Relayer SDK:
   - `homeVote`: 1 if voting for home team, 0 otherwise
   - `awayVote`: 1 if voting for away team, 0 otherwise
   - `drawVote`: 1 if voting for draw, 0 otherwise
2. Encrypted values are submitted to the smart contract with cryptographic proofs
3. Smart contract verifies the user hasn't already voted
4. Contract adds the encrypted votes to the running encrypted totals using FHE operations
5. Vote is recorded on-chain in fully encrypted form

### 3. Closing and Revealing Results

When a prediction is closed:
1. Any user can call `closePrediction(predictionId)`
2. Contract marks prediction as inactive (no more votes accepted)
3. Contract grants the caller permission to decrypt the vote totals
4. Caller can use Zama SDK to decrypt and view final vote counts
5. Results become verifiable while individual votes remain private

### 4. Privacy Guarantees

Throughout the entire process:
- Individual votes never exist in unencrypted form on-chain
- Vote tallies are computed using FHE arithmetic on encrypted values
- Only after closing and receiving explicit permission can results be decrypted
- Even after closing, individual votes remain encrypted and private

## Technology Stack

### Smart Contract Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | ^0.8.24 | Smart contract programming language |
| **FHEVM** | ^0.8.0 | Zama's FHE-enabled Ethereum Virtual Machine library |
| **Hardhat** | ^2.26.0 | Ethereum development environment for compilation, testing, and deployment |
| **TypeScript** | ^5.8.3 | Type-safe development and scripting |
| **Ethers.js** | ^6.15.0 | Ethereum blockchain interaction library |

### Frontend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.1.1 | UI framework for building interactive interfaces |
| **TypeScript** | ^5.8.3 | Type-safe JavaScript development |
| **Vite** | ^7.1.6 | Fast build tool and development server |
| **Wagmi** | ^2.17.0 | React hooks for Ethereum interactions |
| **RainbowKit** | ^2.2.8 | Wallet connection UI and management |
| **TanStack Query** | ^5.89.0 | Data fetching and state management |
| **Viem** | ^2.37.6 | Modern Ethereum library for blockchain interactions |
| **Zama Relayer SDK** | ^0.2.0 | Client-side FHE encryption and decryption |

### Testing & Development Tools

| Tool | Purpose |
|------|---------|
| **Mocha** | Test framework for smart contracts |
| **Chai** | Assertion library for testing |
| **Hardhat Deploy** | Deterministic contract deployment management |
| **TypeChain** | TypeScript bindings for smart contracts |
| **Solhint** | Solidity code linter |
| **ESLint** | JavaScript/TypeScript code linter |
| **Prettier** | Code formatter |

### Blockchain Infrastructure

- **Network**: Ethereum Sepolia Testnet (with local Hardhat network support)
- **RPC Provider**: Infura (configurable)
- **Block Explorer**: Etherscan (for contract verification)

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite)                               │  │
│  │  ├─ RainbowKit (Wallet Connection)                   │  │
│  │  ├─ Wagmi (Blockchain Hooks)                         │  │
│  │  ├─ Zama Relayer SDK (FHE Encryption)               │  │
│  │  └─ TanStack Query (State Management)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS + Web3
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Ethereum Sepolia Testnet                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ZamaSportsPrediction Smart Contract                 │  │
│  │  ├─ createPrediction()                               │  │
│  │  ├─ submitPrediction() [FHE]                         │  │
│  │  ├─ closePrediction()                                │  │
│  │  ├─ getPrediction()                                  │  │
│  │  └─ hasPredicted()                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Encrypted Storage                                    │  │
│  │  ├─ Prediction Data (public metadata)                │  │
│  │  ├─ Encrypted Vote Counters (euint32)               │  │
│  │  └─ Voting Records (address => bool)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

The `ZamaSportsPrediction` contract follows a simple yet secure architecture:

**Data Structures:**
- `Prediction` struct: Stores prediction metadata and encrypted vote counters
- `_predictions` array: Stores all predictions
- `_hasPredicted` mapping: Tracks which addresses have voted on each prediction

**Key Functions:**
- `createPrediction()`: Creates new prediction (public, anyone can call)
- `submitPrediction()`: Submits encrypted vote (public, one vote per address per prediction)
- `closePrediction()`: Closes prediction and grants decryption permissions (public)
- `getPrediction()`: Retrieves prediction data (view function)
- `hasPredicted()`: Checks if address has voted (view function)
- `getPredictionCount()`: Returns total number of predictions (view function)

**Security Features:**
- Custom errors for gas efficiency: `InvalidPrediction`, `PredictionInactive`, `AlreadyPredicted`
- State validation on all operations
- Single-vote enforcement per address
- FHE permission management for encrypted data

### Frontend Architecture

**Component Hierarchy:**
```
App
└── PredictionApp
    ├── Header (Wallet Connection)
    ├── CreatePredictionForm
    │   └── Form Fields (title, homeTeam, awayTeam)
    └── PredictionList
        └── PredictionCard (multiple)
            ├── Prediction Info Display
            ├── Voting Interface
            └── Close Prediction Button
```

**State Management:**
- TanStack Query for blockchain data fetching and caching
- React local state for form inputs and UI state
- Wagmi hooks for wallet and blockchain state

**Hooks:**
- `useAccount()`: Access connected wallet address
- `usePublicClient()`: Read-only blockchain interactions
- `useEthersSigner()`: Get signer for write operations
- `useZamaInstance()`: Initialize Zama FHE instance
- `useQuery()`: Fetch and cache prediction data

## Problems We Solve

### 1. Vote Manipulation & Trust

**Problem**: Traditional prediction platforms require users to trust a central authority that could manipulate votes, change outcomes, or engage in fraudulent behavior.

**Solution**: Our smart contract-based approach removes the need for trust. All operations are executed on-chain with cryptographic guarantees. The code is open-source and verifiable, and the blockchain provides an immutable audit trail.

### 2. Privacy in On-Chain Voting

**Problem**: Standard blockchain voting systems expose all votes publicly, leading to privacy concerns and strategic voting based on visible trends.

**Solution**: Zama's FHE technology allows votes to be encrypted while still enabling on-chain computation. Votes remain private throughout the voting period, preventing herd mentality and strategic voting.

### 3. Front-Running & MEV Exploitation

**Problem**: In traditional on-chain voting, miners or validators could observe pending votes and front-run them to gain advantages.

**Solution**: Because votes are encrypted, even block producers cannot see vote contents. This eliminates front-running opportunities and MEV (Miner Extractable Value) attacks related to voting.

### 4. Result Integrity

**Problem**: Centralized platforms can claim any result they want without users being able to verify accuracy.

**Solution**: Our platform provides verifiable results through blockchain transparency. Anyone can verify the vote count matches the blockchain records, and the FHE operations provide mathematical guarantees of correctness.

### 5. Censorship Resistance

**Problem**: Centralized platforms can censor users, delete predictions, or prevent participation based on arbitrary criteria.

**Solution**: As a decentralized application, no single party can censor predictions or participants. Anyone with an Ethereum wallet can create predictions and vote.

### 6. Data Availability & Permanence

**Problem**: Centralized platforms can shut down, lose data, or selectively delete historical records.

**Solution**: All data lives on Ethereum blockchain, ensuring permanent availability and historical record preservation as long as the blockchain exists.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **npm**: Version 7.0.0 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **MetaMask or compatible Web3 wallet**: For interacting with the dApp
- **Sepolia ETH**: Test ETH for transactions ([Get from faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/zama-sport.git
cd zama-sport
```

2. **Install smart contract dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd frontend
npm install
cd ..
```

### Configuration

#### Smart Contract Configuration

1. **Set up Hardhat environment variables**

```bash
# Set your wallet mnemonic (use a test wallet, never your main wallet!)
npx hardhat vars set MNEMONIC

# Set your Infura API key for Sepolia access
npx hardhat vars set INFURA_API_KEY

# Optional: Set Etherscan API key for contract verification
npx hardhat vars set ETHERSCAN_API_KEY
```

Alternatively, create a `.env` file in the project root:

```env
MNEMONIC="your twelve word mnemonic phrase here"
INFURA_API_KEY="your-infura-api-key"
ETHERSCAN_API_KEY="your-etherscan-api-key"
```

#### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_PREDICTION_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id
```

**Getting Configuration Values:**
- **Contract Address**: Obtained after deploying the smart contract (see deployment section)
- **WalletConnect Project ID**: Get free ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

### Running Locally

#### Option 1: Local Hardhat Network (Recommended for Development)

1. **Start local Hardhat node** (Terminal 1)

```bash
npm run chain
```

This starts a local Ethereum node with FHEVM support.

2. **Deploy contracts to local network** (Terminal 2)

```bash
npm run deploy:localhost
```

Copy the deployed contract address from the output.

3. **Update frontend configuration** (Terminal 2)

```bash
cd frontend
# Update .env with the deployed contract address
```

4. **Start frontend development server** (Terminal 3)

```bash
cd frontend
npm run dev
```

5. **Access the application**

Open your browser to `http://localhost:5173`

6. **Configure MetaMask**

- Add local network: RPC URL `http://localhost:8545`, Chain ID `31337`
- Import one of the test accounts from the Hardhat node output (copy private key)

#### Option 2: Sepolia Testnet

1. **Compile contracts**

```bash
npm run compile
```

2. **Deploy to Sepolia**

```bash
npm run deploy:sepolia
```

Save the contract address from the output.

3. **Verify contract on Etherscan** (Optional but recommended)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

4. **Update frontend configuration**

```bash
cd frontend
# Update VITE_PREDICTION_CONTRACT_ADDRESS in .env
```

5. **Start frontend**

```bash
npm run dev
```

6. **Access and test**

- Open browser to `http://localhost:5173`
- Connect your MetaMask wallet (ensure you're on Sepolia network)
- Get Sepolia ETH from a faucet if needed
- Create predictions and vote!

### Deployment

#### Production Frontend Deployment

1. **Build frontend**

```bash
cd frontend
npm run build
```

2. **Deploy to hosting service**

The `dist` folder contains your production-ready static files. Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag `dist` folder to Netlify dashboard
- **IPFS**: `ipfs add -r dist` (for fully decentralized hosting)
- **GitHub Pages**: Copy `dist` contents to `gh-pages` branch

#### Smart Contract Deployment Verification

After deploying, verify your contract on Etherscan:

```bash
npm run verify:sepolia
```

This makes your contract source code publicly viewable and verifiable.

## Smart Contract

### Contract: `ZamaSportsPrediction.sol`

Location: `contracts/ZamaSportsPrediction.sol`

#### Core Functions

##### `createPrediction(string memory title, string memory homeTeam, string memory awayTeam)`

Creates a new sports prediction.

**Parameters:**
- `title`: Description of the match/event
- `homeTeam`: Name of the home team
- `awayTeam`: Name of the away team

**Returns:** `predictionId` (uint256)

**Events:** Emits `PredictionCreated`

**Example:**
```solidity
uint256 id = contract.createPrediction(
    "Champions League Final 2025",
    "Real Madrid",
    "Bayern Munich"
);
```

##### `submitPrediction(uint256 predictionId, externalEuint32 homeVoteHandle, externalEuint32 awayVoteHandle, externalEuint32 drawVoteHandle, bytes calldata inputProof)`

Submits an encrypted vote for a prediction.

**Parameters:**
- `predictionId`: ID of the prediction to vote on
- `homeVoteHandle`: Encrypted vote for home team (1 or 0)
- `awayVoteHandle`: Encrypted vote for away team (1 or 0)
- `drawVoteHandle`: Encrypted vote for draw (1 or 0)
- `inputProof`: Cryptographic proof from Zama Relayer SDK

**Requirements:**
- Prediction must exist and be active
- Caller must not have already voted
- Exactly one of the three votes should be 1 (enforced client-side)

**Events:** Emits `PredictionVoted`

##### `closePrediction(uint256 predictionId)`

Closes a prediction and grants caller permission to decrypt results.

**Parameters:**
- `predictionId`: ID of the prediction to close

**Requirements:**
- Prediction must exist and be active

**Events:** Emits `PredictionClosed`

**Post-conditions:**
- Prediction marked as inactive (no more votes accepted)
- Caller receives FHE permissions to decrypt vote totals

##### View Functions

**`getPrediction(uint256 predictionId)`**

Returns full prediction data including encrypted vote counters.

**`hasPredicted(uint256 predictionId, address account)`**

Returns whether an address has already voted.

**`getPredictionCount()`**

Returns the total number of predictions created.

#### Events

```solidity
event PredictionCreated(
    uint256 indexed predictionId,
    address indexed creator,
    string title,
    string homeTeam,
    string awayTeam
);

event PredictionVoted(
    uint256 indexed predictionId,
    address indexed voter
);

event PredictionClosed(
    uint256 indexed predictionId,
    address indexed closer
);
```

#### Custom Errors

```solidity
error InvalidPrediction(uint256 predictionId);
error PredictionInactive(uint256 predictionId);
error AlreadyPredicted(uint256 predictionId, address account);
```

## Frontend Application

### Main Components

#### `PredictionApp.tsx`

Main application component that orchestrates the entire UI.

**Responsibilities:**
- Manages prediction creation form
- Fetches and displays all predictions
- Handles Zama FHE instance initialization
- Coordinates blockchain interactions

**Key Features:**
- Real-time prediction fetching with TanStack Query
- Form validation and error handling
- Success/error message display
- Automatic refresh after actions

#### `PredictionCard.tsx`

Individual prediction display and interaction component.

**Features:**
- Display prediction details (teams, status, creator)
- Voting interface with three options (Home/Away/Draw)
- Vote encryption using Zama SDK
- Close prediction functionality
- Decrypt and display results for closed predictions
- Visual indicators for voted status

**Interaction Flow:**
1. User selects one of three voting options
2. Frontend encrypts selection using Zama SDK
3. Transaction sent to smart contract with encrypted values
4. Success/failure feedback displayed
5. Card updates to show voted status

#### `Header.tsx`

Application header with wallet connection.

**Features:**
- RainbowKit integration for wallet connection
- Display connected address
- Network status indication
- Responsive design

### Custom Hooks

#### `useZamaInstance.ts`

Initializes and manages the Zama FHE instance.

**Returns:**
- `instance`: Zama FHE instance for encryption/decryption
- `isLoading`: Loading state
- `error`: Error message if initialization fails

**Usage:**
```typescript
const { instance, isLoading, error } = useZamaInstance();
```

#### `useEthersSigner.ts`

Converts Wagmi client to Ethers.js signer for contract interactions.

**Returns:** Promise<Signer | undefined>

### Configuration Files

#### `config/contracts.ts`

Contains contract address and ABI for frontend interaction.

**Configuration:**
```typescript
export const CONTRACT_ADDRESS = import.meta.env.VITE_PREDICTION_CONTRACT_ADDRESS;
export const CONTRACT_ABI = [ /* ... */ ];
```

## Testing

### Smart Contract Tests

Location: `test/ZamaSportsPrediction.ts`

#### Running Tests

**Local network tests:**
```bash
npm run test
```

**Sepolia testnet tests:**
```bash
npm run test:sepolia
```

#### Test Coverage

Our test suite covers:

1. **Prediction Creation**
   - Creates predictions with correct metadata
   - Initializes encrypted vote counters to zero
   - Assigns incremental prediction IDs
   - Validates required fields

2. **Vote Submission**
   - Accepts valid encrypted votes
   - Correctly accumulates vote totals using FHE operations
   - Prevents duplicate votes from same address
   - Validates prediction exists and is active

3. **Prediction Closing**
   - Successfully closes active predictions
   - Grants decryption permissions to caller
   - Prevents voting on closed predictions
   - Emits appropriate events

4. **Vote Decryption**
   - Authorized users can decrypt results after closing
   - Decrypted values match submitted votes
   - FHE operations preserve vote integrity

#### Example Test

```typescript
it("records encrypted votes and decrypts totals after closing", async function () {
  // Create prediction
  await contract.createPrediction("Final", "Home", "Away");

  // Alice votes for home team (option 1)
  const encryptedAlice = await encryptChoice(alice, 1);
  await contract.connect(alice).submitPrediction(0, ...encryptedAlice);

  // Bob votes for away team (option 2)
  const encryptedBob = await encryptChoice(bob, 2);
  await contract.connect(bob).submitPrediction(0, ...encryptedBob);

  // Close and decrypt
  await contract.closePrediction(0);
  const homeVotes = await fhevm.userDecryptEuint(...);
  const awayVotes = await fhevm.userDecryptEuint(...);

  expect(homeVotes).to.eq(1);
  expect(awayVotes).to.eq(1);
});
```

### Code Coverage

Generate coverage report:

```bash
npm run coverage
```

View coverage report in `coverage/index.html`

### Linting & Code Quality

**Run all linting:**
```bash
npm run lint
```

**Solidity linting:**
```bash
npm run lint:sol
```

**TypeScript linting:**
```bash
npm run lint:ts
```

**Format code:**
```bash
npm run prettier:write
```

## Project Structure

```
zama-sport/
├── contracts/                          # Smart contracts
│   └── ZamaSportsPrediction.sol       # Main prediction contract
├── deploy/                             # Deployment scripts
│   └── deploy.ts                      # Hardhat-deploy script
├── tasks/                              # Custom Hardhat tasks
│   ├── accounts.ts                    # Account management tasks
│   └── predictions.ts                 # Prediction interaction tasks
├── test/                               # Smart contract tests
│   ├── ZamaSportsPrediction.ts       # Local network tests
│   └── ZamaSportsPredictionSepolia.ts # Sepolia testnet tests
├── frontend/                           # React frontend application
│   ├── src/
│   │   ├── components/                # React components
│   │   │   ├── Header.tsx            # Wallet connection header
│   │   │   ├── PredictionApp.tsx     # Main app component
│   │   │   └── PredictionCard.tsx    # Individual prediction card
│   │   ├── config/                    # Configuration
│   │   │   └── contracts.ts          # Contract ABI and address
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useEthersSigner.ts   # Ethers.js signer hook
│   │   │   └── useZamaInstance.ts   # Zama FHE initialization
│   │   ├── styles/                    # CSS stylesheets
│   │   │   └── PredictionApp.css     # Main styles
│   │   ├── App.tsx                    # Root app component
│   │   ├── main.tsx                   # Application entry point
│   │   └── wagmi.ts                   # Wagmi configuration
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML template
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.ts                # Vite configuration
│   └── tsconfig.json                 # TypeScript config
├── hardhat.config.ts                  # Hardhat configuration
├── package.json                       # Root dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── .gitignore                         # Git ignore rules
├── .env.example                       # Example environment variables
└── README.md                          # This file
```

## Use Cases

### 1. Sports Prediction Markets

**Scenario**: Users want to predict outcomes of sports events without revealing their predictions to others.

**Implementation**:
- Create predictions for upcoming matches
- Users submit encrypted predictions
- After match concludes, close prediction and reveal aggregated results
- Individual predictions remain private

**Benefits**: Prevents herd mentality, ensures fair prediction gathering, no influence from early voters

### 2. Private Polling

**Scenario**: Organizations want to conduct internal polls where individual responses must remain confidential.

**Implementation**:
- Create poll as a "prediction" with custom options
- Employees vote using encrypted submissions
- Results only revealed when polling period ends
- Management sees aggregated results without individual identification

**Benefits**: Honest feedback, no fear of retaliation, verifiable results

### 3. Tournament Brackets

**Scenario**: Fantasy sports leagues want bracket predictions without showing other participants' picks.

**Implementation**:
- Create predictions for each tournament matchup
- Participants submit their encrypted bracket predictions
- Results revealed progressively as real matches conclude
- Final scoring based on correct predictions

**Benefits**: Fair competition, no copying other brackets, transparent scoring

### 4. Betting Pools

**Scenario** (Future): Friends create a betting pool for major sports events with cryptocurrency stakes.

**Implementation** (Requires Future Development):
- Create prediction with staking requirements
- Users submit encrypted votes with ETH stakes
- Smart contract holds funds in escrow
- Winners receive proportional payouts based on encrypted vote distribution

**Benefits**: Trustless betting, no manual payout calculations, provably fair

### 5. Research & Data Collection

**Scenario**: Researchers collecting sensitive opinion data on controversial topics.

**Implementation**:
- Create predictions for various opinion questions
- Participants submit encrypted responses
- Researchers receive aggregated statistics only
- Individual privacy preserved while gathering valuable data

**Benefits**: Higher participation rates, honest responses, regulatory compliance

## Security Considerations

### Smart Contract Security

1. **Access Control**
   - No admin/owner privileges (fully decentralized)
   - Any address can create predictions
   - Any address can close predictions
   - This design prioritizes openness; consider adding access controls for production use cases

2. **Reentrancy Protection**
   - Not applicable as contract doesn't handle ETH transfers
   - All state changes occur before external calls
   - FHE operations are internal library calls

3. **Integer Overflow/Underflow**
   - Using Solidity 0.8.24+ with built-in overflow checks
   - FHE operations maintain encrypted value integrity

4. **Front-Running**
   - Encrypted votes prevent front-running attacks
   - Miners/validators cannot see vote contents
   - MEV attacks on voting are not possible

### Frontend Security

1. **Private Key Management**
   - Never stores private keys
   - All signing happens in user's wallet
   - Follows Web3 best practices

2. **Input Validation**
   - Validates all form inputs before submission
   - Checks contract address configuration
   - Verifies wallet connection state

3. **Environment Variables**
   - Sensitive data in `.env` files (not committed)
   - Contract addresses configurable per environment
   - API keys properly scoped

### Cryptographic Security

1. **FHE Security**
   - Leverages Zama's battle-tested FHE implementation
   - Encrypted values indistinguishable from random
   - Homomorphic operations preserve encryption

2. **Input Proofs**
   - All encrypted inputs include cryptographic proofs
   - Contract verifies proofs before accepting votes
   - Prevents invalid encrypted value submission

### Known Limitations

1. **Prediction Closing**
   - Currently anyone can close any prediction
   - Production deployment should add creator-only or time-based closing
   - Consider adding minimum vote thresholds

2. **Vote Validation**
   - Client-side enforcement that only one option is selected
   - No smart contract enforcement of vote format (trust users to follow protocol)
   - Consider adding FHE-based validation (advanced)

3. **Gas Costs**
   - FHE operations are more expensive than standard operations
   - Vote submission costs ~300k-500k gas
   - Consider optimizing for production scale

4. **Sepolia Testnet**
   - Current deployment on testnet only
   - Mainnet deployment requires additional auditing
   - Consider Layer 2 solutions for lower fees

## Future Roadmap

### Phase 1: Enhanced Functionality (Q2 2025)

- **Timed Predictions**: Automatic closing based on timestamp
- **Creator Controls**: Ability for prediction creators to close their own predictions
- **Category System**: Organize predictions by sport type (football, basketball, baseball, etc.)
- **Multi-Option Predictions**: Support for more than 3 voting options
- **Prediction Templates**: Quick creation templates for common sports events

### Phase 2: Economic Layer (Q3 2025)

- **Token Rewards**: ERC-20 token rewards for accurate predictions
- **Staking System**: Stake tokens on predictions with payout pools
- **NFT Badges**: Achievement NFTs for prediction accuracy milestones
- **Reputation System**: On-chain reputation scores for predictors
- **Tournament Seasons**: Competitive seasons with leaderboards

### Phase 3: Oracle Integration (Q4 2025)

- **Chainlink Sports Oracles**: Automated result verification from trusted data feeds
- **Automatic Settlement**: Immediate result determination and reward distribution
- **Real-Time Odds**: Dynamic odds calculation based on encrypted vote distribution
- **Live Events**: Support for in-game predictions (next goal, next point, etc.)

### Phase 4: Advanced Features (Q1 2026)

- **Mobile Applications**: Native iOS and Android apps
- **Social Features**: Follow predictors, create private groups, share predictions
- **Advanced Analytics**: Historical performance tracking and statistics
- **Multi-Chain Support**: Deploy to Ethereum L2s (Optimism, Arbitrum, Polygon)
- **DAO Governance**: Community governance for platform parameters
- **Prediction Composability**: Combine multiple predictions (parlays, accumulators)

### Phase 5: Enterprise & Integration (Q2 2026)

- **White-Label Solutions**: Customizable platforms for sports organizations
- **API Access**: Developer APIs for third-party integrations
- **Embedded Widgets**: Embeddable prediction widgets for sports websites
- **Broadcasting Integration**: Live voting during sports broadcasts
- **Partnership Program**: Official partnerships with sports leagues

### Research & Innovation

- **Privacy-Preserving Analytics**: FHE-based analytics without decrypting individual votes
- **Zero-Knowledge Proofs**: Additional privacy layers using ZK-SNARKs
- **Cross-Chain Bridges**: Enable predictions across multiple blockchains
- **AI-Powered Insights**: Machine learning models trained on encrypted aggregated data
- **Decentralized Storage**: IPFS/Arweave integration for prediction metadata

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue describing the bug and steps to reproduce
2. **Suggest Features**: Propose new features or improvements via issues
3. **Submit Pull Requests**: Fix bugs, add features, or improve documentation
4. **Improve Documentation**: Help make our docs clearer and more comprehensive
5. **Write Tests**: Add test coverage for untested scenarios
6. **Community Support**: Help other users in discussions and issues

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Write/update tests**: Ensure all tests pass
5. **Lint your code**: `npm run lint`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Standards

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript/React**: Follow Airbnb style guide
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)
- **Tests**: Maintain >80% code coverage
- **Documentation**: Update docs for any user-facing changes

### Pull Request Guidelines

- Provide clear description of changes
- Reference related issues
- Include test coverage
- Ensure CI passes
- Request review from maintainers

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### Key Points

- ✅ Free to use, modify, and distribute
- ✅ Commercial use allowed
- ✅ Must include license and copyright notice
- ❌ No patent rights granted
- ❌ No warranty provided

See the [LICENSE](LICENSE) file for full details.

## Support & Resources

### Documentation

- **Zama FHEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama Getting Started**: [https://docs.zama.ai/protocol/solidity-guides/getting-started](https://docs.zama.ai/protocol/solidity-guides/getting-started)
- **Hardhat Documentation**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **Wagmi Documentation**: [https://wagmi.sh/](https://wagmi.sh/)
- **RainbowKit Docs**: [https://rainbowkit.com/](https://rainbowkit.com/)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/zama-sport/issues)
- **Zama Discord**: [Join the Zama community](https://discord.gg/zama)
- **Zama Community Forum**: [https://community.zama.ai/](https://community.zama.ai/)
- **Twitter/X**: Follow [@zama_fhe](https://twitter.com/zama_fhe) for updates

### Getting Help

1. **Check Documentation**: Most questions are answered in the docs
2. **Search Issues**: Your question may already be answered
3. **Ask in Discord**: Quick questions and community support
4. **Open an Issue**: For bugs, feature requests, or detailed questions

### Useful Links

- **Sepolia Faucet**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
- **Sepolia Etherscan**: [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
- **WalletConnect Cloud**: [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
- **Infura Dashboard**: [https://infura.io/dashboard](https://infura.io/dashboard)

### Acknowledgments

This project is built with and inspired by:

- **Zama**: For pioneering FHEVM technology and making FHE accessible to developers
- **Ethereum Foundation**: For the robust blockchain infrastructure
- **Hardhat Team**: For the excellent development framework
- **RainbowKit/Wagmi Teams**: For simplifying Web3 wallet integration
- **Open Source Community**: For the countless libraries and tools that make this possible

---

**Built with privacy and fairness in mind, powered by Zama's Fully Homomorphic Encryption.**

*For questions, feedback, or collaboration opportunities, please open an issue or reach out to the maintainers.*
