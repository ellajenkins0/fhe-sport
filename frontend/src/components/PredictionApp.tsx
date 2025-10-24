import { useMemo, useState, type FormEvent } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Contract } from 'ethers';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { PredictionCard, type Prediction } from './PredictionCard';
import '../styles/PredictionApp.css';

type FormState = {
  title: string;
  homeTeam: string;
  awayTeam: string;
};

export function PredictionApp() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const [formState, setFormState] = useState<FormState>({ title: '', homeTeam: '', awayTeam: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const predictionsQuery = useQuery<Prediction[]>({
    queryKey: ['predictions'],
    queryFn: async () => {
      if (!publicClient) {
        return [];
      }

      const count = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPredictionCount',
      })) as bigint;

      const total = Number(count);
      const items: Prediction[] = [];

      for (let i = 0; i < total; i += 1) {
        const index = BigInt(i);
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getPrediction',
          args: [index],
        });

        const [
          title,
          homeTeam,
          awayTeam,
          creator,
          isActive,
          homeVotes,
          awayVotes,
          drawVotes,
        ] = result as readonly [
          string,
          string,
          string,
          `0x${string}`,
          boolean,
          `0x${string}`,
          `0x${string}`,
          `0x${string}`
        ];

        items.push({
          id: index,
          title,
          homeTeam,
          awayTeam,
          creator,
          isActive,
          homeVotes,
          awayVotes,
          drawVotes,
        });
      }

      return items.sort((a, b) => Number(b.id - a.id));
    },
    enabled: Boolean(publicClient),
  });

  const predictions = useMemo(() => predictionsQuery.data ?? [], [predictionsQuery.data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = formState.title.trim();
    const trimmedHome = formState.homeTeam.trim();
    const trimmedAway = formState.awayTeam.trim();

    if (!trimmedTitle || !trimmedHome || !trimmedAway) {
      setFormError('Fill in all fields before creating a prediction.');
      return;
    }

    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setFormError('Set VITE_PREDICTION_CONTRACT_ADDRESS in the frontend environment.');
      return;
    }

    if (!signerPromise) {
      setFormError('Connect your wallet to create a prediction.');
      return;
    }

    setCreating(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer unavailable');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.createPrediction(trimmedTitle, trimmedHome, trimmedAway);
      await tx.wait();

      setFormSuccess('Prediction created successfully.');
      setFormState({ title: '', homeTeam: '', awayTeam: '' });
      await predictionsQuery.refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create prediction.';
      setFormError(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="prediction-app">
      <div className="prediction-layout">
        <section className="form-card">
          <div className="form-header">
            <h2 className="form-title">Create a prediction</h2>
            <p className="form-subtitle">
              Define a match and let the community vote securely with Zama FHE.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="input-group">
            <div className="input-field">
              <label className="input-label" htmlFor="title">Prediction title</label>
              <input
                id="title"
                className="text-input"
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Championship Final"
              />
            </div>

            <div className="input-field">
              <label className="input-label" htmlFor="home">Home team</label>
              <input
                id="home"
                className="text-input"
                value={formState.homeTeam}
                onChange={(event) => setFormState((prev) => ({ ...prev, homeTeam: event.target.value }))}
                placeholder="Home Legends"
              />
            </div>

            <div className="input-field">
              <label className="input-label" htmlFor="away">Away team</label>
              <input
                id="away"
                className="text-input"
                value={formState.awayTeam}
                onChange={(event) => setFormState((prev) => ({ ...prev, awayTeam: event.target.value }))}
                placeholder="Away Warriors"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={creating}>
                {creating ? 'Creating...' : 'Create prediction'}
              </button>
            </div>

            {formError && <div className="error-message">{formError}</div>}
            {formSuccess && !formError && <div className="success-banner">{formSuccess}</div>}
          </form>
        </section>

        <section className="prediction-section">
          <div>
            <h2 className="section-title">Predictions</h2>
            <p className="section-description">
              Vote for your winner. All selections remain encrypted until a prediction is closed.
            </p>
          </div>

          {predictionsQuery.isLoading && <div className="info-text">Loading predictions...</div>}
          {predictionsQuery.isError && (
            <div className="error-message">Failed to load predictions. Refresh the page.</div>
          )}

          {!predictionsQuery.isLoading && predictions.length === 0 && (
            <div className="empty-state">
              <strong>No predictions yet</strong>
              <span>Create the first match above and invite others to vote.</span>
            </div>
          )}

          {predictions.map((prediction) => (
            <PredictionCard
              key={prediction.id.toString()}
              prediction={prediction}
              account={address as `0x${string}` | undefined}
              signerPromise={signerPromise}
              instance={instance}
              zamaLoading={zamaLoading}
              onActionComplete={predictionsQuery.refetch}
            />
          ))}

          {zamaError && <div className="error-message">{zamaError}</div>}
        </section>
      </div>
    </div>
  );
}
