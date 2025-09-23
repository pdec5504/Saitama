import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const buttonStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-secondary)',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    opacity: 0.7,
};

const activeButtonStyle = {
    ...buttonStyle,
    opacity: 1,
    color: 'var(--color-text-primary)',
    textDecoration: 'underline',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button 
        style={i18n.language === 'pt' ? activeButtonStyle : buttonStyle} 
        onClick={() => i18n.changeLanguage('pt')}
      >
        PT-BR
      </button>
      <div style={{color: 'var(--color-text-secondary)'}}>|</div>
      <button 
        style={i18n.language === 'en' ? activeButtonStyle : buttonStyle} 
        onClick={() => i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;