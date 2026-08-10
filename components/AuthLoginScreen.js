import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { newGameBackgroundImage } from './backgrounds/NewGameBackgroundImage';

const AuthLoginScreen = ({ onLogin, onStartRegistration }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const result = await onLogin({ email: email.trim(), password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error || 'Login fehlgeschlagen');
    }
  };

  return (_jsx("div", { className: "w-full h-full bg-cover bg-center", style: { backgroundImage: `url(${newGameBackgroundImage})` }, children: _jsx("div", { className: "w-full h-full flex items-center justify-center bg-black bg-opacity-40 p-8", children: _jsxs("div", { className: "bg-gray-900 bg-opacity-90 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-6 font-cinzel text-amber-400", children: "Account Login" }), _jsx("p", { className: "text-sm text-gray-300 mb-6 text-center", children: "Beim ersten Start bitte zuerst registrieren. Danach kannst du dich hier einloggen." }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: "E-Mail" }), _jsx("input", { value: email, onChange: e => setEmail(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none", placeholder: "name@example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: "Passwort" }), _jsx("input", { type: "password", value: password, onChange: e => setPassword(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none", placeholder: "Passwort" })] })] }), error && _jsx("p", { className: "mt-4 text-sm text-red-300", children: error }), _jsxs("div", { className: "mt-6 space-y-3", children: [_jsx("button", { onClick: handleLogin, disabled: loading, className: "w-full bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider hover:bg-amber-400 transition-all disabled:opacity-60", children: loading ? 'Bitte warten...' : 'Einloggen' }), _jsx("button", { onClick: onStartRegistration, className: "w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-sm text-sm uppercase tracking-wider hover:bg-gray-600 transition-all", children: "Erstes Mal hier? Jetzt registrieren" })] })] }) }) }));
};

export default AuthLoginScreen;
