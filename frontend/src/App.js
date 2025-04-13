import React, { useState } from 'react';
import Login from './components/Login';
import Shortener from './components/Shortener';
import './style.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    return (
        <div className="app">
            <h1>URL Shortener</h1>
            {!token ? (
                <Login setToken={setToken} />
            ) : (
                <Shortener token={token} setToken={setToken} />
            )}
        </div>
    );
}

export default App;