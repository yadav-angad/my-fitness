import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as ServiceWorkerRegistration from '../serviceWorkerRegistration';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

ServiceWorkerRegistration.register({
  onUpdate: () => {
    alert('New version available. Please refresh.')
  }
})

