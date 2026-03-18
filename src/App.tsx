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
