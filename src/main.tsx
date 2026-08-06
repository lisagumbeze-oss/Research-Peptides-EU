import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './i18n';
import App from './App.tsx';
import './index.css';

import { HelmetProvider } from 'react-helmet-async';
// #region agent log
import { agentLog, installRequestTracker, installScrollTracker } from './debug/agentLog';
import { installStaleChunkRecovery } from './components/RouteChunkErrorBoundary';

installRequestTracker();
installScrollTracker();
installStaleChunkRecovery();
agentLog('boot', 'main.tsx:11', 'app boot — instrumentation loaded', {
  href: window.location.href,
  origin: window.location.origin,
  userAgent: navigator.userAgent,
});
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
