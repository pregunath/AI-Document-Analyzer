'use client';

import { FormEvent, useEffect, useState } from 'react';
import { confirmSignUp, getCurrentUser, signIn, signUp } from 'aws-amplify/auth';
import { authConfigured } from '@/lib/auth';

type AuthMode = 'signIn' | 'signUp' | 'confirm';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authConfigured) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'signUp') {
        const result = await signUp({ username: email, password, options: { userAttributes: { email } } });
        setMode(result.nextStep.signUpStep === 'CONFIRM_SIGN_UP' ? 'confirm' : 'signIn');
      } else if (mode === 'confirm') {
        await confirmSignUp({ username: email, confirmationCode: code });
        setMode('signIn');
      } else {
        await signIn({ username: email, password });
        setAuthenticated(true);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.');
    }
  };

  if (loading) return <div className="auth-loading">Loading your workspace...</div>;
  if (!authConfigured) return <div className="auth-loading">Configure Cognito environment variables to continue.</div>;
  if (authenticated) return children;

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-mark">✦</div>
        <p className="eyebrow">Clearframe workspace</p>
        <h1>{mode === 'signUp' ? 'Create your workspace' : mode === 'confirm' ? 'Check your inbox' : 'Welcome back'}</h1>
        <p className="auth-copy">
          {mode === 'confirm' ? `Enter the confirmation code sent to ${email}.` : 'Turn dense documents into clear decisions.'}
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode !== 'confirm' && (
            <>
              <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>Password<input required minLength={12} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            </>
          )}
          {mode === 'confirm' && <label>Confirmation code<input required inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} /></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-dark" type="submit">{mode === 'signUp' ? 'Create account' : mode === 'confirm' ? 'Confirm email' : 'Sign in'}</button>
        </form>
        {mode !== 'confirm' && (
          <button className="auth-switch" type="button" onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>
            {mode === 'signIn' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        )}
      </section>
    </main>
  );
}