import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import App from './App.jsx'
import './global.css'
import './i18n.js';
import { Suspense } from 'react';

const loadingMarkup = (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Loading...</h2>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={loadingMarkup}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
)
