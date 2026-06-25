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
                  onClick={() => setShowTerms(true)}
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
            maxWidth: '480px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '12px', textAlign: 'center' }}>
              Termos de Uso - Connecta+
            </h2>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.85rem',
              color: '#555555',
              lineHeight: 1.5,
              paddingRight: '8px',
              marginBottom: '20px',
              textAlign: 'left'
            }} className="custom-scroll">
              <p style={{ marginBottom: '12px' }}>
                Bem-vindo ao <span style={{ fontWeight: 500 }}>Connecta+</span>, o marketplace e rede social oficial de Ouro Preto - MG. Ao se cadastrar em nossa plataforma, você concorda com as seguintes condições:
              </p>
              
              <h4 style={{ color: '#2d2d2d', fontWeight: 500, margin: '14px 0 6px 0' }}>1. Descrição do Serviço</h4>
              <p style={{ marginBottom: '12px' }}>
                O Connecta+ é uma plataforma que conecta consumidores, comerciantes locais, prestadores de serviços, organizadores de eventos e entregadores parceiros na cidade de Ouro Preto e região.
              </p>

              <h4 style={{ color: '#2d2d2d', fontWeight: 500, margin: '14px 0 6px 0' }}>2. Comissões e Taxas</h4>
              <p style={{ marginBottom: '12px' }}>
                A intermediação de vendas e ingressos está sujeita a uma taxa de comissão administrativa retida automaticamente sobre o valor total de cada pedido aprovado. Prestadores de serviços e organizadores de eventos também concordam com a retenção conforme as taxas acordadas previamente.
              </p>

              <h4 style={{ color: '#2d2d2d', fontWeight: 500, margin: '14px 0 6px 0' }}>3. Moderação e Segurança</h4>
              <p style={{ marginBottom: '12px' }}>
                A administração do Connecta+ reserva-se o direito de moderar, suspender ou banir contas que infrinjam a segurança, publiquem conteúdo inadequado ou prestem serviços em desacordo com as leis locais. Novos cadastros comerciais passam por auditoria documental (CNPJ/CPF).
              </p>

              <h4 style={{ color: '#2d2d2d', fontWeight: 500, margin: '14px 0 6px 0' }}>4. Responsabilidade de Entrega</h4>
              <p style={{ marginBottom: '12px' }}>
                As entregas são realizadas por entregadores autônomos parceiros. A plataforma atua apenas como facilitadora de conexão e rastreamento de entregas.
              </p>
              
              <p style={{ marginTop: '16px', fontWeight: 400, color: '#f28d1a' }}>
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
