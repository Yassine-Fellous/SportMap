import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const mainColor = "#7CBDF8";

export default function AuthPage() {
  const [active, setActive] = useState(false); // false = login, true = register
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Pour la démo, on simule la connexion/inscription
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!loginData.username || !loginData.password) {
      setError("Tous les champs sont requis.");
      return;
    }
    // TODO: appel API
    navigate('/verification', { state: { email: loginData.username } });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    if (!registerData.username || !registerData.email || !registerData.password) {
      setError("Tous les champs sont requis.");
      return;
    }
    // TODO: appel API
    navigate('/verification', { state: { email: registerData.email } });
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-[#f6f8fa]">
      <div className={`auth-container${active ? " active" : ""}`}>
        {/* Login */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Connexion</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Nom d'utilisateur ou Email"
                value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
              <FaUser />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Mot de passe"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <FaLock />
            </div>
            <div className="forgot-link">
              <a href="#">Mot de passe oublié ?</a>
            </div>
            <button type="submit" className="btn">Connexion</button>
            {error && <div className="error-msg">{error}</div>}
          </form>
        </div>

        {/* Register */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Inscription</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={registerData.username}
                onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                required
              />
              <FaUser />
            </div>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />
              <FaEnvelope />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Mot de passe"
                value={registerData.password}
                onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />
              <FaLock />
            </div>
            <button type="submit" className="btn">S'inscrire</button>
            {error && <div className="error-msg">{error}</div>}
          </form>
        </div>

        {/* Toggle panels */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Bienvenue !</h1>
            <p>Pas encore de compte ?</p>
            <button className="btn" onClick={() => setActive(true)}>Inscription</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Content de vous revoir !</h1>
            <p>Déjà inscrit ?</p>
            <button className="btn" onClick={() => setActive(false)}>Connexion</button>
          </div>
        </div>
        
        {/* Styles */}
        <style>{`
          .auth-container {
            position: relative;
            width: 100%;
            max-width: 850px;
            height: 550px;
            background: #fff;
            margin: 40px auto;
            border-radius: 30px;
            box-shadow: 0 0 30px rgba(0,0,0,.12);
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            transition: box-shadow .3s;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            width: 100vw;
            min-height: 100vh;
            background: #f6f8fa;
            box-sizing: border-box;
          }
          
          @media (max-width: 900px) {
            .auth-container { max-width: 98vw; }
          }
          
          /* === DESKTOP STYLES === */
          @media (min-width: 651px) {
            .form-box {
              position: absolute;
              right: 0;
              width: 50%;
              height: 100%;
              background: #fff;
              display: flex;
              align-items: center;
              color: #333;
              text-align: center;
              padding: 40px;
              z-index: 1;
              transition: .6s ease-in-out 1.2s, visibility 0s 1s;
            }
            .auth-container.active .form-box { right: 50%; }
            .form-box.register { visibility: hidden; }
            .auth-container.active .form-box.register { visibility: visible; }
            
            .toggle-box::before {
              content: '';
              position: absolute;
              left: -250%;
              width: 300%;
              height: 100%;
              background: ${mainColor};
              border-radius: 150px;
              z-index: 2;
              transition: 1.8s ease-in-out;
            }
            .auth-container.active .toggle-box::before { left: 50%; }
            
            .toggle-panel {
              position: absolute;
              width: 50%;
              height: 100%;
              color: #fff;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 2;
              transition: .6s ease-in-out;
            }
            .toggle-panel.toggle-left { left: 0; transition-delay: 1.2s; }
            .auth-container.active .toggle-panel.toggle-left { left: -50%; transition-delay: .6s; }
            .toggle-panel.toggle-right { right: -50%; transition-delay: .6s; }
            .auth-container.active .toggle-panel.toggle-right { right: 0; transition-delay: 1.2s; }
          }
          
          /* === MOBILE STYLES (VERTICAL ANIMATION) === */
          @media (max-width: 650px) {
            .auth-container { 
              width: 100vw; 
              height: 100vh; 
              min-height: 100vh;
              margin: 0;
              border-radius: 0;
              flex-direction: column;
            }
            
            .form-box {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 60%;
              background: #fff;
              display: flex;
              align-items: center;
              color: #333;
              text-align: center;
              padding: 20px;
              z-index: 1;
              transition: .6s ease-in-out 1.2s, visibility 0s 1s;
              border-radius: 30px 30px 0 0;
            }
            
            /* Animation verticale pour mobile */
            .auth-container.active .form-box { 
              bottom: 40%; 
            }
            
            .form-box.register { 
              visibility: hidden; 
            }
            
            .auth-container.active .form-box.register { 
              visibility: visible; 
            }
            
            .toggle-box::before {
              content: '';
              position: absolute;
              top: -250%;
              left: 0;
              width: 100%;
              height: 300%;
              background: ${mainColor};
              border-radius: 50px;
              z-index: 2;
              transition: 1.8s ease-in-out;
            }
            
            .auth-container.active .toggle-box::before { 
              top: 60%; 
            }
            
            .toggle-panel {
              position: absolute;
              width: 100%;
              height: 40%;
              color: #fff;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 2;
              transition: .6s ease-in-out;
            }
            
            .toggle-panel.toggle-left { 
              top: 0; 
              transition-delay: 1.2s; 
            }
            
            .auth-container.active .toggle-panel.toggle-left { 
              top: -40%; 
              transition-delay: .6s; 
            }
            
            .toggle-panel.toggle-right { 
              bottom: -40%; 
              transition-delay: .6s; 
            }
            
            .auth-container.active .toggle-panel.toggle-right { 
              bottom: 0; 
              transition-delay: 1.2s; 
            }
          }
          
          @media (max-width: 400px) {
            .form-box { padding: 15px; }
            .toggle-panel h1 { font-size: 1.5rem; }
            .form-box h1 { font-size: 1.8rem; }
          }
          
          /* === COMMON STYLES === */
          form { width: 100%; }
          .form-box h1 { font-size: 2.2rem; margin-bottom: 10px; }
          .form-box p { font-size: 1rem; margin: 15px 0; }
          
          .input-box {
            position: relative;
            margin: 30px 0;
          }
          
          .input-box input {
            width: 100%;
            padding: 13px 50px 13px 20px;
            background: #eee;
            border-radius: 8px;
            border: none;
            outline: none;
            font-size: 16px;
            color: #222;
            font-weight: 500;
            box-sizing: border-box;
          }
          
          .input-box input::placeholder {
            color: #888;
            font-weight: 400;
          }
          
          .input-box svg {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
            color: ${mainColor};
          }
          
          .forgot-link { margin: -15px 0 15px; }
          .forgot-link a { font-size: 14.5px; color: #333; text-decoration: none; }
          
          .btn {
            width: 100%;
            height: 48px;
            background: ${mainColor};
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,.08);
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #fff;
            font-weight: 600;
            margin-bottom: 10px;
            transition: background .2s;
          }
          
          .btn:hover { background: #5bb0f7; }
          
          .toggle-box {
            position: absolute;
            width: 100%;
            height: 100%;
          }
          
          .toggle-panel p { margin-bottom: 20px; }
          
          .toggle-panel .btn {
            width: 160px;
            height: 46px;
            background: transparent;
            border: 2px solid #fff;
            box-shadow: none;
          }
          
          .error-msg {
            color: #e53e3e;
            margin-top: 10px;
            font-size: 15px;
          }
          
          @media (max-width: 650px) {
            .form-box,
            .form-box.login,
            .form-box.register {
              min-height: 60%;
              height: 60%;
              width: 100%;
              box-sizing: border-box;
              overflow-y: auto;
              /* Empêche le bloc de changer de taille pendant la transition */
              transition: bottom .6s ease-in-out 1.2s, min-height 0s, height 0s;
            }
          }
        `}</style>
      </div>
    </div>
  );
}