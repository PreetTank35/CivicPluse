import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './styles/components.css';
import './styles/localvoice.css';
import 'leaflet/dist/leaflet.css';
import App from './App';
import { initializeStore } from './data/store';

// Initialize mock data on first load
initializeStore();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
