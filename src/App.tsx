import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PasswordChangeForce from './components/PasswordChangeForce';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

function MainApp() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  useEffect(() => {
    fetchAppAppearance();
    checkSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setRequirePasswordChange(false);
        // Clear hash on logout to ensure clean state
        if (window.location.hash) {
          window.location.hash = '';
        }
      }
    });

    // Multi-tab logout sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('supabase.auth.token') || e.key === 'dashboardTab') {
        checkSessionAndProfile();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkSessionAndProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session) {
      await checkProfile(session.user.id);
    } else {
      setLoading(false);
    }
  };

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('debe_cambiar_password')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setRequirePasswordChange(data.debe_cambiar_password);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppAppearance = async () => {
    const { data } = await supabase.from('configuracion_apariencia').select('*').eq('id', 1).single();
    if (data) {
      if (data.nombre_organizacion) document.title = `${data.nombre_organizacion} | InduConocimiento`;

      // Inject dynamic CSS to support both Light and Dark definitions seamlessly without overriding inline styles that break themes
      let styleEl = document.getElementById('dynamic-appearance');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-appearance';
        document.head.appendChild(styleEl);
      }

      styleEl.innerHTML = `
        :root {
          --bg-color: ${data.color_fondo || '#05070a'};
          --accent-primary: ${data.color_primario || '#00d4ff'};
          --accent-secondary: ${data.color_secundario || '#3b82f6'};
          --shadow-neon: 0 0 25px ${data.color_primario || '#00d4ff'}4d;
        }
        :root[data-theme='light'] {
          --bg-color: ${data.color_fondo_claro || '#ffffff'};
          --accent-primary: ${data.color_primario_claro || '#2563eb'};
          --accent-secondary: ${data.color_secundario_claro || '#1d4ed8'};
          --shadow-neon: 0 10px 30px ${data.color_primario_claro || '#2563eb'}26;
        }
      `;
      
      // Cleanup any previously set inline styles that might conflict
      const root = document.documentElement;
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-secondary');
      root.style.removeProperty('--bg-color');
      root.style.removeProperty('--shadow-neon');
    }
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--accent-primary)' }}>
        <div className="animate-fade-in">INICIANDO SISTEMA...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app-container">
        <Login />
      </div>
    );
  }

  if (requirePasswordChange) {
    return (
      <div className="app-container">
        <PasswordChangeForce onPasswordChanged={() => setRequirePasswordChange(false)} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Dashboard session={session} />
    </div>
  );
}

export default App;
