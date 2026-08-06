import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './i18n';
import App from './App.tsx';
import './index.css';

import { HelmetProvider } from 'react-helmet-async';
import { installStaleChunkRecovery } from './components/RouteChunkErrorBoundary';

installStaleChunkRecovery();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
