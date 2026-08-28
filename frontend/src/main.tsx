import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import App from './App.tsx'
import Room from './room.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
