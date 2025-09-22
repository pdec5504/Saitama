import React from 'react';
import { useTranslation } from 'react-i18next';

const buttonStyle = {
    background: 'none',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 5px'
};

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <button style={buttonStyle} onClick={() => i18n.changeLanguage('pt-BR')}>
        PT-BR
      </button>
      <button style={buttonStyle} onClick={() => i18n.changeLanguage('en')}>
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;