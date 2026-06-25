import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './responsive.css'
import App from './App'
import { startKeepAlive } from './utils/keepAlive'

startKeepAlive()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)