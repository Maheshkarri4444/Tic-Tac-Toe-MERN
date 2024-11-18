import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";

import './index.css'
import App from './App.jsx'

// import { Buffer } from 'buffer';

// // Make Buffer available globally
// window.Buffer = Buffer;


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
