import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid var(--bloom-light-warm)',
              color: 'var(--bloom-charcoal)',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
            },
          }}
        />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
