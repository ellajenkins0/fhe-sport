import { useEffect, useMemo, useState } from 'react';
import { Contract, JsonRpcSigner } from 'ethers';
import { useReadContract } from 'wagmi';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import '../styles/PredictionCard.css';

type Choice = 'home' | 'away' | 'draw';

export type Prediction = {
  id: bigint;
  title: string;
  homeTeam: string;
  awayTeam: string;
  creator: string;
  isActive: boolean;
  homeVotes: string;
  awayVotes: string;
  drawVotes: string;
};

type PredictionCardProps = {
  prediction: Prediction;
  account?: `0x${string}`;
  signerPromise?: Promise<JsonRpcSigner>;
  instance: any;
  zamaLoading: boolean;
  onActionComplete: () => Promise<unknown>;
};

export function PredictionCard({
  prediction,
  account,
  signerPromise,
  instance,
  zamaLoading,
  onActionComplete,
}: PredictionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<{ home: number; away: number; draw: number } | null>(null);

  useEffect(() => {
    if (prediction.isActive) {
      setResults(null);
    }
  }, [prediction.isActive]);

  const {
    data: hasPredictedData,
    refetch: refetchHasPredicted,
    isLoading: hasPredictedLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasPredicted',
    args: account ? [prediction.id, account] : undefined,
    query: {
      enabled: Boolean(account),
    },
  });

  const alreadyPredicted = useMemo(() => Boolean(hasPredictedData), [hasPredictedData]);

  const handleVote = async () => {
    if (!prediction.isActive) {
      return;
    }
    if (!selectedChoice) {
      setError('Select an outcome before submitting your vote.');
      return;
    }
    if (!account) {
      setError('Connect your wallet to submit a vote.');
      return;
    }
    if (!instance || zamaLoading) {
      setError('Encryption service is still loading. Please try again.');
      return;
    }
    if (!signerPromise) {
      setError('No signer available. Ensure your wallet is connected.');
      return;
    }

    setVoteLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer unavailable');
      }

      const builder = instance.createEncryptedInput(CONTRACT_ADDRESS, account);
      builder.add32(selectedChoice === 'home' ? 1 : 0);
      builder.add32(selectedChoice === 'away' ? 1 : 0);
      builder.add32(selectedChoice === 'draw' ? 1 : 0);
      const encrypted = await builder.encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.submitPrediction(
        prediction.id,
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.handles[2],
        encrypted.inputProof,
      );

      await tx.wait();

      setSelectedChoice(null);
      setSuccess('Vote submitted successfully.');
      setResults(null);
      await onActionComplete();
      await refetchHasPredicted();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit vote.';
      setError(message);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleClose = async () => {
    if (!prediction.isActive) {
      return;
    }
    if (!account) {
      setError('Connect your wallet to close the prediction.');
      return;
    }
    if (!signerPromise) {
      setError('No signer available. Ensure your wallet is connected.');
      return;
    }

    setCloseLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer unavailable');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.closePrediction(prediction.id);
      await tx.wait();

      setSuccess('Prediction closed. You can now decrypt the totals.');
      await onActionComplete();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close prediction.';
      setError(message);
    } finally {
      setCloseLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (prediction.isActive) {
      setError('Close the prediction before decrypting totals.');
      return;
    }
    if (!instance || zamaLoading) {
      setError('Encryption service is still loading. Please try again.');
      return;
    }
    if (!account) {
      setError('Connect your wallet to decrypt the totals.');
      return;
    }
    if (!signerPromise) {
      setError('No signer available. Ensure your wallet is connected.');
      return;
    }

    setDecryptLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer unavailable');
      }

      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const handleContractPairs = [
        { handle: prediction.homeVotes, contractAddress: CONTRACT_ADDRESS },
        { handle: prediction.awayVotes, contractAddress: CONTRACT_ADDRESS },
        { handle: prediction.drawVotes, contractAddress: CONTRACT_ADDRESS },
      ];

      const decrypted = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        account,
        startTimestamp,
        durationDays,
      );

      setResults({
        home: Number(decrypted[prediction.homeVotes] ?? 0),
        away: Number(decrypted[prediction.awayVotes] ?? 0),
        draw: Number(decrypted[prediction.drawVotes] ?? 0),
      });
      setSuccess('Totals decrypted successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decrypt totals.';
      setError(message);
    } finally {
      setDecryptLoading(false);
    }
  };

  return (
    <div className="prediction-card">
      <div className="prediction-header">
        <div>
          <h3 className="prediction-title">{prediction.title}</h3>
          <div className="prediction-footer">
            <span>
              Created by <strong>{prediction.creator}</strong>
            </span>
            <span>ID: {prediction.id.toString()}</span>
          </div>
        </div>
        <span className={`status-badge ${prediction.isActive ? 'status-active' : 'status-closed'}`}>
          {prediction.isActive ? 'Active' : 'Closed'}
        </span>
      </div>

      <div className="prediction-teams">
        <div className="team-row">
          <span className="team-label">Home</span>
          <span>{prediction.homeTeam}</span>
        </div>
        <div className="team-row">
          <span className="team-label">Away</span>
          <span>{prediction.awayTeam}</span>
        </div>
      </div>

      <div className="prediction-actions">
        {prediction.isActive ? (
          <>
            <div className="choice-buttons">
              <button
                type="button"
                className={`choice-button ${selectedChoice === 'home' ? 'selected' : ''}`}
                onClick={() => setSelectedChoice('home')}
                disabled={voteLoading || closeLoading || alreadyPredicted}
              >
                Home Win
              </button>
              <button
                type="button"
                className={`choice-button ${selectedChoice === 'away' ? 'selected' : ''}`}
                onClick={() => setSelectedChoice('away')}
                disabled={voteLoading || closeLoading || alreadyPredicted}
              >
                Away Win
              </button>
              <button
                type="button"
                className={`choice-button ${selectedChoice === 'draw' ? 'selected' : ''}`}
                onClick={() => setSelectedChoice('draw')}
                disabled={voteLoading || closeLoading || alreadyPredicted}
              >
                Draw
              </button>
            </div>

            <div className="card-buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={handleVote}
                disabled={voteLoading || closeLoading || alreadyPredicted || hasPredictedLoading}
              >
                {voteLoading ? 'Submitting...' : alreadyPredicted ? 'Vote recorded' : 'Submit Vote'}
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleClose}
                disabled={closeLoading || voteLoading}
              >
                {closeLoading ? 'Closing...' : 'Close Prediction'}
              </button>
            </div>

            {alreadyPredicted && (
              <span className="info-text">You have already voted on this prediction.</span>
            )}
          </>
        ) : (
          <div className="card-buttons">
            <button
              type="button"
              className="outline-button"
              onClick={handleDecrypt}
              disabled={decryptLoading}
            >
              {decryptLoading ? 'Decrypting...' : 'Decrypt Totals'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && !error && <div className="success-banner">{success}</div>}

      {results && !prediction.isActive && (
        <div className="results-grid">
          <div className="result-card">
            <span className="result-label">Home votes</span>
            <span className="result-value">{results.home}</span>
          </div>
          <div className="result-card">
            <span className="result-label">Away votes</span>
            <span className="result-value">{results.away}</span>
          </div>
          <div className="result-card">
            <span className="result-label">Draw votes</span>
            <span className="result-value">{results.draw}</span>
          </div>
        </div>
      )}
    </div>
  );
}
