import { useState, useEffect } from 'react';
import { useFirebaseMock, EditableText } from '../../context/FirebaseMockContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { ShieldCheck, AlertCircle, Upload, Clock } from 'lucide-react';

export default function Auth({ onAuthSuccess, onCancelVisitor, initialTab = 'login' }) {
  const { login, signup, categories } = useFirebaseMock();
  const [tab, setTab] = useState(initialTab); // 'login' or 'register'
  
  // Registration Role selector
  const [selectedRole, setSelectedRole] = useState('client'); // client, seller, provider, organizer, motoboy

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');

  // Role Specific Fields
  const [cnpj, setCnpj] = useState('');
  const [cpf, setCpf] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Guia Turístico');
  const [storeCategory, setStoreCategory] = useState('Artesanato');
  const [licenseFileName, setLicenseFileName] = useState('');
  const [commissionerCode, setCommissionerCode] = useState('');

  // Sync category once loaded
  useEffect(() => {
    const storeCategories = (categories || []).filter(c => c.type === 'lojas');
    if (storeCategories.length > 0 && !storeCategories.some(c => (c.key || c.label) === storeCategory)) {
      setStoreCategory(storeCategories[0].key || storeCategories[0].label);
    }
    const serviceCategories = (categories || []).filter(c => c.type === 'servicos');
    if (serviceCategories.length > 0 && !serviceCategories.some(c => (c.key || c.label) === serviceCategory)) {
      setServiceCategory(serviceCategories[0].key || serviceCategories[0].label);
    }
  }, [categories]);

  const [rememberMe, setRememberMe] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsTab, setTermsTab] = useState('terms'); // 'terms' or 'privacy'

  // Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Mask helpers
  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCPF = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatCNPJ = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const formatCPFOrCNPJ = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 11) {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
    }
  };

  const formatCEP = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  // Autocomplete address using ViaCEP API
  useEffect(() => {
    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length === 8) {
      fetch(`https://viacep.com.br/ws/${rawCep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            const formattedAddress = `${data.logradouro}${data.logradouro ? ', ' : ''}${data.bairro}${data.bairro ? ', ' : ''}${data.localidade} - ${data.uf}`;
            setAddress(formattedAddress);
            showToast('Endereço preenchido uai!');
          } else {
            showToast('CEP não encontrado!');
          }
        })
        .catch(() => {
          if (rawCep.startsWith('35400')) {
            setAddress('Rua Direita, Centro, Ouro Preto - MG');
            showToast('Conexão offline. Endereço simulado!');
          }
        });
    }
  }, [cep]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Preencha e-mail e senha, uai!');
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      showToast('Bem-vindo de volta!');
      onAuthSuccess(res.user);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!acceptTerms) {
      setErrorMsg('Você precisa aceitar os Termos de Uso para criar sua conta, uai!');
      return;
    }

    if (!email || !password || !name || (selectedRole !== 'client' && !phone)) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    let extraData = {};
    if (selectedRole === 'seller') {
      if (!cnpj || !companyName || !address) {
        setErrorMsg('Preencha CPF ou CNPJ, Nome da Empresa e Endereço da loja!');
        return;
      }
      extraData = { cnpj, companyName, address, category: storeCategory };
    } else if (selectedRole === 'provider') {
      if (!cpf || !address) {
        setErrorMsg('Preencha CPF ou CNPJ e seu Endereço para atendimento!');
        return;
      }
      extraData = { cpf, address, serviceCategory };
    } else if (selectedRole === 'organizer') {
      if (!cnpj || !companyName || !address) {
        setErrorMsg('Preencha CPF ou CNPJ, Nome da Produtora e Endereço!');
        return;
      }
      extraData = { cnpj, companyName, address };
    } else if (selectedRole === 'motoboy') {
      if (!cpf || !address || !licenseFileName) {
        setErrorMsg('Preencha CPF ou CNPJ, Endereço e anexe sua carteira de habilitação!');
        return;
      }
      extraData = { cpf, address, licenseFileName };
    } else if (selectedRole === 'commissioner') {
      if (!cpf || !commissionerCode) {
        setErrorMsg('Preencha CPF ou CNPJ e defina seu Código de Comissário!');
        return;
      }
      extraData = { cpf, commissionerCode: commissionerCode.toUpperCase() };
    }

    const res = await signup({
      email,
      password,
      role: selectedRole,
      name,
      phone: selectedRole === 'client' ? '' : phone,
      ...extraData
    });

    if (res.success) {
      showToast('Conta criada com sucesso!');
      onAuthSuccess(res.user);
    } else {
      setErrorMsg(res.message);
    }
  };

  const simulateLicenseUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFileName(e.target.files[0].name);
      showToast('Documento anexado!');
    }
  };

  const storeCategories = (categories || []).filter(c => c.type === 'lojas');
  const serviceCategories = (categories || []).filter(c => c.type === 'servicos');

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#ffffff',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '24px 16px',
      boxSizing: 'border-box',
      position: 'relative'
    }} className="animate-fade-in custom-scroll">
      
      <style>{`
        .auth-card-input {
          width: 100%;
          padding: 14px 20px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background-color: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .auth-card-input:focus {
          border-color: #ffffff;
          background-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }
        .auth-card-input::placeholder {
          color: rgba(255, 255, 255, 0.65);
        }
        .auth-card-select {
          width: 100%;
          padding: 14px 20px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background-color: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 40px;
        }
        .auth-card-select option {
          background-color: #ffffff;
          color: #2d2d2d;
        }
        .form-group label.auth-card-label {
          display: block;
          font-weight: 400;
          font-size: 0.88rem;
          color: #ffffff !important;
          margin-bottom: 6px;
          padding-left: 4px;
        }
        .auth-btn {
          width: 100%;
          height: 48px;
          border-radius: 24px;
          background-color: #ffffff;
          color: #f28d1a;
          font-weight: 400;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
        }
        .auth-btn:active {
          transform: scale(1.0);
        }
      `}</style>
      
      {toastMsg && <div className="toast">{toastMsg}</div>}

      <div style={{
        background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
        borderRadius: '28px',
        padding: '36px 24px',
        boxShadow: '0 12px 36px rgba(242, 141, 26, 0.15)',
        width: '100%',
        maxWidth: '400px',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '32px',
        flexShrink: 0
      }}>
        {/* Logo container: White circle with brand logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '10px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <img 
              src="/logo.png" 
              alt="Connecta+" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} 
            />
          </div>
        </div>

        {/* Greetings Header */}
        {!showRecovery && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 400, color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              {tab === 'login' ? (
                <EditableText textId="auth_login_title" defaultText="Olá! Seja bem-vindo!" />
              ) : (
                <EditableText textId="auth_register_title" defaultText="Crie sua conta" />
              )}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#ffffff', opacity: 0.9, margin: 0, fontWeight: 400 }}>
              {tab === 'login' ? (
                <EditableText textId="auth_login_subtitle" defaultText="Faça login para acessar sua conta." />
              ) : (
                <EditableText textId="auth_register_subtitle" defaultText="Junte-se à nossa comunidade." />
              )}
            </p>
          </div>
        )}

        {/* Selector Tabs (Glassmorphism layout) */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); setShowRecovery(false); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '20px',
              backgroundColor: tab === 'login' && !showRecovery ? '#ffffff' : 'transparent',
              color: tab === 'login' && !showRecovery ? '#f28d1a' : '#ffffff',
              fontWeight: 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); setShowRecovery(false); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '20px',
              backgroundColor: tab === 'register' && !showRecovery ? '#ffffff' : 'transparent',
              color: tab === 'register' && !showRecovery ? '#f28d1a' : '#ffffff',
              fontWeight: 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Cadastre-se
          </button>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(255, 94, 91, 0.15)',
            border: '1px solid rgba(255, 94, 91, 0.3)',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '16px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            lineHeight: 1.3
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {showRecovery ? (
          /* PASSWORD RECOVERY FORM */
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!recoveryEmail) return;
            try {
              await sendPasswordResetEmail(auth, recoveryEmail);
              showToast(`E-mail de recuperação enviado para ${recoveryEmail}!`);
              setShowRecovery(false);
              setRecoveryEmail('');
            } catch (error) {
              if (error.code === 'auth/user-not-found') {
                setErrorMsg('E-mail não cadastrado.');
              } else {
                showToast(`E-mail de recuperação enviado para ${recoveryEmail}!`);
                setShowRecovery(false);
                setRecoveryEmail('');
              }
            }
          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 400, color: '#ffffff', textAlign: 'center', marginBottom: '2px' }}>
              Recuperar senha
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#ffffff', opacity: 0.9, textAlign: 'center', marginBottom: '8px', lineHeight: 1.3 }}>
              Digite seu e-mail cadastrado que te mandamos as instruções de recuperação na hora!
            </p>
            
            <div className="form-group">
              <label className="auth-card-label">E-mail</label>
              <input
                type="email"
                placeholder="nome@exemplo.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="auth-card-input"
                required
              />
            </div>

            <button type="submit" className="auth-btn" style={{ marginTop: '8px' }}>
              Enviar e-mail de recuperação
            </button>

            <button
              type="button"
              onClick={() => setShowRecovery(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 400,
                alignSelf: 'center',
                marginTop: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '8px 16px'
              }}
            >
              Voltar para o login
            </button>
          </form>
        ) : tab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="auth-card-label">E-mail</label>
              <input
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-card-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="auth-card-label">Senha</label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-card-input"
                required
              />
            </div>

            {/* Remember me and Forgot password section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#ffffff' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                />
                Lembrar-me
              </label>
              
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 400,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: 0
                }}
              >
                Recuperar senha
              </button>
            </div>

            <button type="submit" className="auth-btn" style={{ height: '52px', marginTop: '6px' }}>
              Entrar
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Role selector inside Registration */}
            <div className="form-group">
              <label className="auth-card-label">Eu sou:</label>
              <select
                value={selectedRole}
                onChange={(e) => { setSelectedRole(e.target.value); setErrorMsg(''); }}
                className="auth-card-select"
              >
                <option value="client">Cliente</option>
                <option value="seller">Loja (Vendedor)</option>
                <option value="provider">Prestador de Serviços</option>
                <option value="organizer">Organizador de Eventos</option>
                <option value="motoboy">Entregador</option>
                <option value="commissioner">Comissário de Eventos</option>
              </select>
            </div>

            {/* Common Registration fields */}
            <div className="form-group">
              <label className="auth-card-label">Nome completo</label>
              <input
                type="text"
                placeholder="Como quer ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-card-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="auth-card-label">E-mail</label>
              <input
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-card-input"
                required
              />
            </div>

            {selectedRole !== 'client' && (
              <div className="form-group">
                <label className="auth-card-label">Telefone</label>
                <input
                  type="tel"
                  placeholder="(31) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="auth-card-input"
                  required
                />
              </div>
            )}

            {/* Role specific inputs */}

            {/* SELLER: CNPJ, Company, CEP, Address */}
            {selectedRole === 'seller' && (
              <>
                <div className="form-group">
                  <label className="auth-card-label">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="Digite aqui..."
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCPFOrCNPJ(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Nome Comercial da Loja</label>
                  <input
                    type="text"
                    placeholder="Ex: Artesanatos Tiradentes"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Categoria da Loja</label>
                  <select
                    value={storeCategory}
                    onChange={(e) => setStoreCategory(e.target.value)}
                    className="auth-card-select"
                    required
                  >
                    {storeCategories.map(cat => (
                      <option key={cat.id} value={cat.key || cat.label}>
                        {cat.label}
                      </option>
                    ))}
                    {storeCategories.length === 0 && (
                      <>
                        <option value="Artesanato">Artesanato</option>
                        <option value="Lembranças">Lembranças</option>
                        <option value="Gastronomia">Gastronomia</option>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="auth-card-label">CEP</label>
                  <input
                    type="text"
                    placeholder="35400-000"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Endereço</label>
                  <input
                    type="text"
                    placeholder="Rua, número, Centro..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="auth-card-input"
                    required
                  />
                </div>
              </>
            )}

            {/* PROVIDER: CPF/CNPJ, Category, CEP, Address */}
            {selectedRole === 'provider' && (
              <>
                <div className="form-group">
                  <label className="auth-card-label">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="Digite aqui..."
                    value={cpf}
                    onChange={(e) => setCpf(formatCPFOrCNPJ(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Categoria de Serviço</label>
                  <select
                     value={serviceCategory}
                     onChange={(e) => setServiceCategory(e.target.value)}
                     className="auth-card-select"
                     required
                  >
                    {serviceCategories.map(cat => (
                      <option key={cat.id} value={cat.key || cat.label}>
                        {cat.label}
                      </option>
                    ))}
                    {serviceCategories.length === 0 && (
                      <>
                        <option value="Guia Turístico">Guia Turístico / Roteiros</option>
                        <option value="Fotógrafo">Fotógrafo</option>
                        <option value="Diarista">Diarista / Faxina</option>
                        <option value="Marido de Aluguel">Manutenção Geral</option>
                        <option value="Fretes">Entregas Grandes / Mudanças</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="auth-card-label">CEP</label>
                  <input
                    type="text"
                    placeholder="35400-000"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Endereço</label>
                  <input
                    type="text"
                    placeholder="Ex: Centro, Barra, Bauxita..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="auth-card-input"
                    required
                  />
                </div>
              </>
            )}

            {/* ORGANIZER: CNPJ, Company, CEP, Address */}
            {selectedRole === 'organizer' && (
              <>
                <div className="form-group">
                  <label className="auth-card-label">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="Digite aqui..."
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCPFOrCNPJ(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Nome da Produtora</label>
                  <input
                    type="text"
                    placeholder="Ex: República Pasárgada"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">CEP</label>
                  <input
                    type="text"
                    placeholder="35400-000"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Endereço</label>
                  <input
                    type="text"
                    placeholder="Rua, número, bairro..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="auth-card-input"
                    required
                  />
                </div>
              </>
            )}

            {/* MOTOBOY: CPF, CEP, Address, CNH Attachment */}
            {selectedRole === 'motoboy' && (
              <>
                <div className="form-group">
                  <label className="auth-card-label">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="Digite aqui..."
                    value={cpf}
                    onChange={(e) => setCpf(formatCPFOrCNPJ(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="auth-card-label">CEP</label>
                  <input
                    type="text"
                    placeholder="35400-000"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Endereço</label>
                  <input
                    type="text"
                    placeholder="Rua, número, Ouro Preto..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="auth-card-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="auth-card-label">Anexar Habilitação (CNH - PDF/Foto)</label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '16px',
                      borderRadius: '20px',
                      border: '2px dashed rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      color: '#ffffff',
                      fontWeight: 400,
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Upload size={18} />
                    {licenseFileName || 'Escolher arquivo CNH'}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={simulateLicenseUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </>
            )}

            {selectedRole === 'commissioner' && (
              <>
                <div className="form-group">
                  <label className="auth-card-label">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="Digite aqui..."
                    value={cpf}
                    onChange={(e) => setCpf(formatCPFOrCNPJ(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="auth-card-label">Telefone celular</label>
                  <input
                    type="text"
                    placeholder="(31) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="auth-card-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="auth-card-label">Código de Comissário (Ex: VITIN10)</label>
                  <input
                    type="text"
                    placeholder="Ex: VITIN10"
                    value={commissionerCode}
                    onChange={(e) => setCommissionerCode(e.target.value)}
                    className="auth-card-input"
                    required
                  />
                  <span style={{ fontSize: '0.62rem', color: '#ffeaad', marginTop: '4px', display: 'block' }}>
                    Código promocional para computar suas vendas de ingressos.
                  </span>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="auth-card-label">Senha</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-card-input"
                required
              />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 14px 0', cursor: 'pointer', fontSize: '0.82rem', color: '#ffffff' }}>
              <input
                type="checkbox"
                id="accept-terms-checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#ffffff',
                  cursor: 'pointer'
                }}
                required
              />
              <label htmlFor="accept-terms-checkbox" style={{ cursor: 'pointer', display: 'inline', color: '#ffffff', fontWeight: 400, paddingLeft: 0, margin: 0 }}>
                Li e aceito os{' '}
                <button
                  type="button"
                  onClick={() => { setTermsTab('terms'); setShowTerms(true); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: 'inherit',
                    fontWeight: 400,
                    cursor: 'pointer',
                    display: 'inline'
                  }}
                >
                  Termos de Uso
                </button>
                {' '}e a{' '}
                <button
                  type="button"
                  onClick={() => { setTermsTab('privacy'); setShowTerms(true); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: 'inherit',
                    fontWeight: 400,
                    cursor: 'pointer',
                    display: 'inline'
                  }}
                >
                  Política de Privacidade
                </button>
              </label>
            </div>

            <button type="submit" className="auth-btn" style={{ height: '52px', marginTop: '10px' }}>
              Criar conta
            </button>
          </form>
        )}
        {onCancelVisitor && (
          <button
            type="button"
            onClick={onCancelVisitor}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 400,
              alignSelf: 'center',
              marginTop: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '8px'
            }}
          >
            Voltar ao aplicativo (Visitante)
          </button>
        )}
      </div>

      {showTerms && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            boxSizing: 'border-box'
          }}>
            {/* Header com Abas */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eaeaea', marginBottom: '16px', paddingBottom: '8px', justifyContent: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setTermsTab('terms')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: termsTab === 'terms' ? '#f28d1a' : '#888',
                  borderBottom: termsTab === 'terms' ? '2.5px solid #f28d1a' : 'none',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Termos de Uso
              </button>
              <button
                type="button"
                onClick={() => setTermsTab('privacy')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: termsTab === 'privacy' ? '#f28d1a' : '#888',
                  borderBottom: termsTab === 'privacy' ? '2.5px solid #f28d1a' : 'none',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Política de Privacidade
              </button>
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.78rem',
              color: '#444444',
              lineHeight: 1.6,
              paddingRight: '8px',
              marginBottom: '20px',
              textAlign: 'left'
            }} className="custom-scroll">
              {termsTab === 'terms' ? (
                <>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '10px' }}>Termos e Condições Gerais de Uso</h3>
                  <p style={{ marginBottom: '10px' }}>
                    Estes Termos e Condições Gerais de Uso regem a utilização da plataforma Connecta+, um marketplace multi-merchant local de Ouro Preto - MG, acessível por meio de seu website e aplicativo. Ao cadastrar-se e utilizar a plataforma, o usuário aceita integralmente e sem reservas as regras estabelecidas a seguir.
                  </p>
                  
                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>1. Objeto e Descrição dos Serviços</h4>
                  <p style={{ marginBottom: '10px' }}>
                    O Connecta+ atua exclusivamente como provedor de tecnologia e intermediador de negócios, oferecendo uma infraestrutura digital que conecta consumidores finais, comerciantes locais (vendedores de produtos físicos), prestadores de serviços autônomos, organizadores de eventos presenciais e virtuais, e entregadores logísticos parceiros na cidade de Ouro Preto e região adjacente.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>2. Cadastro, Elegibilidade e Validação</h4>
                  <p style={{ marginBottom: '10px' }}>
                    Para a utilização dos serviços da plataforma, é obrigatório o preenchimento completo dos dados cadastrais com informações verdadeiras, exatas e atualizadas. Contas comerciais (vendedores, prestadores de serviços, organizadores de eventos e entregadores) estão sujeitas à auditoria interna de dados e verificação de documentos legais, tais como CPF, CNPJ e alvarás, reservando-se à plataforma o direito de suspender cadastros inconsistentes.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>3. Modelo Tarifário e Comissões</h4>
                  <p style={{ marginBottom: '10px' }}>
                    A intermediação comercial na plataforma está sujeita a uma taxa de comissão administrativa acordada, que é descontada diretamente e na fonte sobre o montante bruto de cada venda de produto, agendamento de serviço ou venda de ingresso. Os repasses financeiros são processados e pagos aos parceiros de acordo com as regras de liberação estabelecidas no painel administrativo.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>4. Responsabilidade Civil das Partes</h4>
                  <p style={{ marginBottom: '10px' }}>
                    Considerando a natureza de intermediação da plataforma, a Connecta+ não assume qualquer responsabilidade civil pela fabricação, garantia, entrega, vícios de qualidade ou quantidade dos produtos comercializados; pela execução técnica e pontualidade dos serviços contratados; pela integridade física e segurança dos eventos organizados; nem tampouco pela conduta civil ou acidentes de trânsito envolvendo os entregadores logísticos independentes. Cada parceiro responde integralmente por suas respectivas atividades comerciais e condutas.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>5. Política de Reembolso e Cancelamento</h4>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>Produtos Físicos:</strong> O direito de arrependimento e devolução das mercadorias compradas em canais eletrônicos respeitará o prazo legal de até 7 dias corridos a contar do recebimento, devendo ser solicitado e acordado diretamente com o lojista comercial responsável.
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>Ingressos de Eventos:</strong> Conforme a legislação aplicável, o reembolso do ingresso em caso de arrependimento da compra será efetuado pelo organizador caso a solicitação seja realizada em até 7 dias a contar da data de compra da entrada, com limite máximo de antecedência de até 48h do início efetivo do evento. Situações divergentes ficam sob a exclusiva deliberação do produtor do respectivo evento.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>6. Moderação de Conteúdo e Suspensão de Contas</h4>
                  <p style={{ marginBottom: '10px' }}>
                    A administração da plataforma se reserva o direito de remover qualquer publicação inadequada e banir sumariamente usuários e lojistas que descumprirem as diretrizes comunitárias, leis locais ou praticarem atos fraudulentos.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>7. Legislação Aplicável e Foro</h4>
                  <p style={{ marginBottom: '10px' }}>
                    Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para a resolução de litígios decorrentes do presente instrumento, fica eleito o Foro da Comarca de Ouro Preto - MG, com renúncia expressa a qualquer outro por mais privilegiado que seja.
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '10px' }}>Diretrizes da Política de Privacidade</h3>
                  <p style={{ marginBottom: '10px' }}>
                    A sua privacidade é fundamental para a Connecta+. Esta Política de Privacidade descreve as práticas adotadas pela nossa plataforma para a coleta, tratamento, uso, compartilhamento e eliminação de seus dados pessoais em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>1. Informações Coletadas</h4>
                  <p style={{ marginBottom: '10px' }}>
                    Coletamos dados necessários para a prestação de nossos serviços tecnológicos, divididos em:
                  </p>
                  <ul style={{ paddingLeft: '16px', marginBottom: '10px' }}>
                    <li><strong>Dados cadastrais:</strong> Nome completo, endereço de e-mail, número de celular, CPF/CNPJ, endereços de entrega e dados bancários para repasses financeiros.</li>
                    <li><strong>Dados de uso e geolocalização:</strong> Histórico de pedidos, dados de navegação no aplicativo e localização geográfica precisa em tempo real (obrigatória para entregadores e opcional para consumidores).</li>
                  </ul>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>2. Finalidade do Tratamento de Dados</h4>
                  <p style={{ marginBottom: '10px' }}>
                    Os dados coletados são tratados exclusivamente para os fins de: viabilização técnica das compras e entregas de mercadorias; processamento de pagamentos eletrônicos seguros; liberação e rastreamento de fretes de entregadores; auditoria interna de novos parceiros comerciais; segurança cibernética contra atividades fraudulentas; e envio de avisos e notificações urgentes sobre pedidos.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>3. Compartilhamento de Dados com Terceiros</h4>
                  <p style={{ marginBottom: '10px' }}>
                    Para operacionalizar o fluxo de marketplace, compartilhamos os dados indispensáveis dos usuários compradores com os vendedores responsáveis pelos produtos e com os entregadores encarregados da logística de entrega. Também podemos compartilhar dados com intermediadores financeiros integrados para processamento de transações, ou sob ordem de autoridades públicas em cumprimento de obrigações legais.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>4. Armazenamento Seguro e Criptografia</h4>
                  <p style={{ marginBottom: '10px' }}>
                    Todos os dados coletados são hospedados em servidores de nuvem de alto padrão de segurança digital, contando com firewalls e criptografia de ponta a ponta. Adotamos as melhores práticas técnicas para assegurar a inviolabilidade física e lógica de seus dados.
                  </p>

                  <h4 style={{ color: '#2d2d2d', fontWeight: 600, margin: '12px 0 4px 0' }}>5. Direitos dos Titulares de Dados</h4>
                  <p style={{ marginBottom: '10px' }}>
                    O usuário possui pleno controle de seus dados e, nos termos da LGPD, pode a qualquer momento requerer a retificação de inconsistências cadastrais ou solicitar a exclusão permanente de todas as suas informações da nossa base de dados. Para tal, basta entrar em contato com o nosso canal integrado de ouvidoria e suporte técnico nas configurações do perfil do usuário.
                  </p>
                </>
              )}
              
              <p style={{ marginTop: '16px', fontWeight: 500, color: '#f28d1a' }}>
                Última atualização: Junho de 2026.
              </p>
            </div>

            <button
              onClick={() => { setShowTerms(false); setAcceptTerms(true); }}
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', borderRadius: '24px', fontWeight: 500, cursor: 'pointer' }}
            >
              Li e Aceito os Termos
            </button>
            
            <button
              onClick={() => setShowTerms(false)}
              style={{ width: '100%', alignSelf: 'center', marginTop: '8px', cursor: 'pointer', fontWeight: 400, fontSize: '0.85rem', color: '#888888', border: 'none', background: 'transparent' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT FOR CADASTRO EM ANÁLISE / STATUS ---
export function AuthStatus({ user, onBackToLogin }) {

  if (user.registrationStatus === 'pending') {
    return (
      <div style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 24px',
        boxSizing: 'border-box',
        textAlign: 'center'
      }} className="animate-fade-in">
        
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: '#fffcf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f28d1a',
          marginBottom: '24px',
          animation: 'pulseGlow 2s infinite'
        }}>
          <Clock size={40} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
          Analisando seu cadastro, sô!
        </h2>
        
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, marginBottom: '24px' }}>
          Eita que a nossa equipe de Ouro Preto já está conferindo seus documentos com todo carinho. Segura a ansiedade que logo mais te notificamos!
        </p>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eaeaea',
          borderRadius: '16px',
          padding: '16px',
          width: '100%',
          marginBottom: '30px',
          fontSize: '0.82rem',
          color: '#555',
          textAlign: 'left'
        }}>
          <span style={{ fontWeight: 500 }}>Dados enviados:</span>
          <div style={{ marginTop: '6px' }}><span style={{ fontWeight: 500 }}>Nome:</span> {user.name}</div>
          <div><span style={{ fontWeight: 500 }}>E-mail:</span> {user.email}</div>
          <div><span style={{ fontWeight: 500 }}>Tipo de conta:</span> {user.role === 'seller' ? 'Loja Vendedora' : user.role === 'provider' ? 'Prestador de Serviço' : user.role === 'organizer' ? 'Organizador de Eventos' : 'Entregador'}</div>
        </div>

        <button onClick={onBackToLogin} className="btn btn-secondary" style={{ width: '100%' }}>
          voltar para login
        </button>

        <div style={{
          marginTop: '40px',
          borderTop: '1px solid #eee',
          paddingTop: '16px',
          fontSize: '0.78rem',
          color: '#d4730d',
          fontWeight: 400
        }}>
          Dica de Teste: Vá no Painel Admin lateral, aprove este cadastro e faça login novamente!
        </div>
      </div>
    );
  }

  if (user.registrationStatus === 'refused') {
    return (
      <div style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 24px',
        boxSizing: 'border-box',
        textAlign: 'center'
      }} className="animate-fade-in">
        
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: '#ff5e5b15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff5e5b',
          marginBottom: '24px'
        }}>
          <AlertCircle size={40} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
          Deu ruim no cadastro...
        </h2>
        
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, marginBottom: '24px' }}>
          Eita! Alguma informação não bateu na nossa revisão de segurança. Mas não desanima não, uai! Dá uma olhada e tente de novo.
        </p>

        <div style={{
          backgroundColor: '#ff5e5b08',
          border: '1px solid #ff5e5b30',
          borderRadius: '16px',
          padding: '16px',
          width: '100%',
          marginBottom: '30px',
          fontSize: '0.82rem',
          color: '#ff5e5b',
          textAlign: 'left'
        }}>
          <span style={{ fontWeight: 500 }}>Motivo da recusa:</span>
          <div style={{ marginTop: '6px' }}>Documentos ilegíveis ou CNPJ/CPF com divergência cadastral. Por favor, crie uma nova solicitação com dados válidos.</div>
        </div>

        <button onClick={onBackToLogin} className="btn btn-primary" style={{ width: '100%' }}>
          criar novo cadastro
        </button>
      </div>
    );
  }

  // If approved but somehow showing here
  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 24px',
      boxSizing: 'border-box',
      textAlign: 'center'
    }} className="animate-fade-in">
      <div style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        backgroundColor: '#e6f7f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#2ec4b6',
        marginBottom: '24px'
      }}>
        <ShieldCheck size={40} />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
        Cadastro Aprovado!
      </h2>
      
      <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, marginBottom: '24px' }}>
        Tudo certo, uai! Sua conta foi aprovada e você já faz parte do Connecta+. Bora faturar ou encher o carrinho?
      </p>

      <button onClick={onBackToLogin} className="btn btn-primary" style={{ width: '100%' }}>
        Bora começar!
      </button>
    </div>
  );
}
