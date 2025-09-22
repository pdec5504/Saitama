import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';

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

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8001/login', { email, password });
            localStorage.setItem('token', response.data.token);
            toast.success('Login successful!');
            navigate('/routines');
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
        }
    }

    return (
        <AnimatedPage>
            <div style={{ maxWidth: '320px', margin: '60px auto' }}>
                <h2 style={{ textAlign: 'center' }}>Login</h2>
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
                    <button type="submit" style={buttonStyle}>Login</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)' }}>Register</Link>
                </p>
            </div>
        </AnimatedPage>
    );
}

export default LoginPage;