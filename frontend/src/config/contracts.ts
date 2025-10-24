export const CONTRACT_ADDRESS = (
  import.meta.env.VITE_PREDICTION_CONTRACT_ADDRESS ??
  "0x9b5F37131f4F5163393B2490b069cb4B1A76b68c"
) as `0x${string}`;

export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AlreadyPredicted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      }
    ],
    "name": "InvalidPrediction",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      }
    ],
    "name": "PredictionInactive",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "closer",
        "type": "address"
      }
    ],
    "name": "PredictionClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "homeTeam",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "awayTeam",
        "type": "string"
      }
    ],
    "name": "PredictionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "PredictionVoted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      }
    ],
    "name": "closePrediction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "homeTeam",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "awayTeam",
        "type": "string"
      }
    ],
    "name": "createPrediction",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      }
    ],
    "name": "getPrediction",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "homeTeam",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "awayTeam",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "euint32",
        "name": "homeVotes",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "awayVotes",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "drawVotes",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPredictionCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "count",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasPredicted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "predicted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "predictionId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint32",
        "name": "homeVoteHandle",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "awayVoteHandle",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "drawVoteHandle",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "submitPrediction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
