// src/pages/RegisterPage.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const inputStyle = {
    width: '100%',
    padding: '12px',
    boxSizing: 'border-box',
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '4px',
    fontSize: '16px',
    marginBottom: '15px'
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold',
    fontSize: '16px',
    background: 'var(--color-primary)'
};


function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:8001/register', { email, password });
            toast.success('Registration successful! Please log in.');
            navigate('/'); //redirect to login page
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div style={{ maxWidth: '320px', margin: '60px auto' }}>
            <h2 style={{ textAlign: 'center' }}>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    style={inputStyle}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>Register</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Already have an account? <Link to="/" style={{ color: 'var(--color-primary)' }}>Login</Link>
            </p>
        </div>
    );
}

export default RegisterPage;