import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import DownloadPage from './pages/Download.jsx'
import { AppProvider } from './context/AppContext.jsx'
import './styles/globals.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/*" element={
          <AppProvider>
            <App />
          </AppProvider>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)