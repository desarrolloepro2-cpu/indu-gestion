import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bot, Send, User, ChevronDown, Activity, DollarSign, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const AIAssistantChat = ({ onClose, currentUser }: { onClose: () => void, currentUser: any }) => {
  const { } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `¡Hola ${currentUser?.primer_nombre}! Soy tu Asistente Analista. Pregúntame sobre empleados activos, costos, horas trabajadas o lo que necesites de las estadísticas de Indutrónica.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          question: userMessage.text,
          user_role: currentUser?.role_name,
          user_id: currentUser?.id
        }
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || 'Error de la función de IA');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data?.answer || 'Lo siento, no pude procesar la respuesta adecuadamente.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Lo siento, ocurrió un error temporal intentando buscar esa información. (${err.message})`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="glass-card" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '550px',
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02))',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 255, 0.2)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9999,
      animation: 'slideUp 0.3s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Indutrónica IA</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>En línea (Groq Llama-3)</span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
          }}>
            {msg.sender === 'ai' ? (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)', flexShrink: 0 }}>
                <Bot size={16} />
              </div>
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', flexShrink: 0 }}>
                <User size={16} />
              </div>
            )}
            <div style={{
              background: msg.sender === 'user' ? 'rgba(0, 240, 255, 0.15)' : 'var(--border)',
              padding: '10px 15px',
              borderRadius: '12px',
              borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
              borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
              maxWidth: '85%'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.text}</p>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>{msg.time}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)', flexShrink: 0 }}>
              <Bot size={16} />
            </div>
            <div className="typing-indicator" style={{ display: 'flex', gap: '4px', background: 'var(--border)', padding: '10px 15px', borderRadius: '12px', borderBottomLeftRadius: '2px' }}>
              <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
              <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
              <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Array - horizontally scrollable */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', overflowX: 'auto', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <button 
          onClick={() => handleQuickQuestion('¿Cuáles son los 3 trabajadores con más horas registradas esta semana?')}
          style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <Users size={12} /> Top Horas
        </button>
        <button 
          onClick={() => handleQuickQuestion('¿Cuál es el centro de costo que más horas de trabajo ha consumido?')}
          style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <DollarSign size={12} /> Tops Costos
        </button>
        <button 
          onClick={() => handleQuickQuestion('¿Cuántos empleados activos tenemos ahora mismo?')}
          style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <Activity size={12} /> Activos
        </button>
      </div>

      {/* Input */}
      <div style={{ padding: '15px', backgroundColor: 'var(--surface)', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu pregunta..."
          style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 15px', color: 'var(--text-primary)', outline: 'none' }}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
          style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (isLoading || !inputValue.trim()) ? 0.5 : 1 }}
        >
          <Send size={18} />
        </button>
      </div>
      <style>
        {`
          @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        `}
      </style>
    </div>
  );
};

export default AIAssistantChat;
