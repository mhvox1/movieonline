import React, { useState } from 'react';
import { newGameBackgroundImage } from './backgrounds/NewGameBackgroundImage';

interface AuthLoginScreenProps {
  onLogin: (payload: { username: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  onStartRegistration: () => void;
}

const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin, onStartRegistration }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const result = await onLogin({ username: username.trim(), password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error || 'Login fehlgeschlagen');
    }
  };

  return (
    <div
      className="w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${newGameBackgroundImage})` }}
    >
      <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-40 p-8">
        <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700">
          <h2 className="text-4xl font-bold text-center mb-6 font-cinzel text-amber-400">Account Login</h2>
          <p className="text-sm text-gray-300 mb-6 text-center">
            Beim ersten Start bitte zuerst registrieren. Danach kannst du dich hier einloggen.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nutzername</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="dein Nutzername"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Passwort"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <div className="mt-6 space-y-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider hover:bg-amber-400 transition-all disabled:opacity-60"
            >
              {loading ? 'Bitte warten...' : 'Einloggen'}
            </button>
            <button
              onClick={onStartRegistration}
              className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-sm text-sm uppercase tracking-wider hover:bg-gray-600 transition-all"
            >
              Erstes Mal hier? Jetzt registrieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoginScreen;
