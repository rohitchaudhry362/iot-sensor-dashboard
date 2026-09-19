import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/700.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppThemeProvider } from './components/common';
import { AuthProvider } from './context/AuthContext';
import { queryClient } from './lib/queryClient';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

ReactDOM.createRoot(container).render(
  <StrictMode>
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppThemeProvider>
  </StrictMode>,
);
