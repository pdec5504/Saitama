import { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AnimatedPage from '../components/AnimatedPage';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await apiClient.post('/api/auth/register', { email, password });
            toast.success(t('toasts.registrationSuccess'));
            navigate('/'); //redirect to login page
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.message || t('toasts.registrationFailed'));
        }
    };

    return (
        <AnimatedPage>
            <div style={{ maxWidth: '320px', margin: '60px auto' }}>
                <h2 style={{ textAlign: 'center' }}>{t('registerTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        required
                        style={inputStyle}
                    />
                    <button type="submit" style={buttonStyle}>{t('registerButton')}</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    {t('hasAccount')} <Link to="/" style={{ color: 'var(--color-primary)' }}>{t('loginLink')}</Link>
                </p>
            </div>
        </AnimatedPage>
    );
}

export default RegisterPage;