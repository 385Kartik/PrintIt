import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

// Ping backend health check on app load
const pingBackend = async () => {
  try {
    let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    API_URL = API_URL.replace(/\/api/, "");

    await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
  } catch (error) {
    // Silently fail - this is just a wake-up ping
    console.debug('Backend health check:', error instanceof Error ? error.message : 'failed');
  }
};

// Ping immediately on load
pingBackend();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
