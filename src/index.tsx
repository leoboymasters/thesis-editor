import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadFiles } from './lib/persistence';
import { useProjectStore } from './store/projectStore';

import { AuthProvider } from './components/Auth/AuthProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const bootstrap = async () => {
  try {
    const files = await loadFiles(1);
    if (Object.keys(files).length > 0) {
      useProjectStore.setState({ files });
    }
  } catch (err) {
    console.error('[ThesisFlow] Failed to restore from IndexedDB:', err);
  }
};

bootstrap().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
});
