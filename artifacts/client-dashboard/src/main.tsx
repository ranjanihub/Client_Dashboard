import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { getClientAuth } from './lib/auth';
import App from './App';
import './index.css';

setAuthTokenGetter(() => {
  const auth = getClientAuth();
  return auth?.email || null;
});

createRoot(document.getElementById('root')!).render(<App />);
