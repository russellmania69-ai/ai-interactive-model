
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'
import './index.css'

try {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Show error message to user
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: Arial; background: #fee; color: #c00; border-radius: 4px; margin: 20px;">
        <h2>Error Loading Application</h2>
        <p>The application failed to load. Please check the browser console for details.</p>
        <details>
          <summary>Error Details</summary>
          <pre>${String(error)}</pre>
        </details>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
}

