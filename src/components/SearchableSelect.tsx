import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search, Check, User } from 'lucide-react';

interface Option {
  id: string | number;
  label: string;
  image?: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  showAvatar?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled = false, 
  required = false,
  showAvatar = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find((opt: any) => opt.id?.toString() === value?.toString());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 300;
      const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      setDropdownPos({
        top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt: any) => 
    opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="input-group" style={{ position: 'relative' }}>
      <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>{label} {required && <span style={{ color: 'var(--accent-primary)' }}>*</span>}</span>
        {selectedOption && <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', opacity: 0.8, fontWeight: 700 }}>VERIFICADO</span>}
      </label>
      <div 
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`neon-input ${disabled ? 'disabled' : ''} ${isOpen ? 'active' : ''}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          minHeight: '52px',
          padding: '0 16px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          {showAvatar && selectedOption?.image && (
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
              <img src={selectedOption.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          {showAvatar && !selectedOption?.image && selectedOption && label.toLowerCase().includes('responsable') && (
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} color="rgba(255,255,255,0.2)" />
            </div>
          )}
          <span style={{ 
            color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: '0.95rem',
            fontWeight: selectedOption ? 600 : 400
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} style={{ 
          color: 'var(--text-secondary)',
          transform: isOpen ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
        }} />
      </div>

      {isOpen && ReactDOM.createPortal(
        <div ref={dropdownRef} className="glass-card animate-scale-in" style={{ 
          position: 'fixed', 
          top: dropdownPos.top, 
          left: dropdownPos.left, 
          width: dropdownPos.width, 
          zIndex: 99999, 
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'rgba(15, 15, 25, 0.98)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', opacity: 0.6 }} />
              <input 
                autoFocus
                className="neon-input" 
                placeholder="Filtrar opciones..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '40px', 
                  height: '42px', 
                  fontSize: '0.9rem', 
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', opacity: 0.5 }}>
                <Search size={32} style={{ marginBottom: '10px', opacity: 0.2 }} />
                <p>Sin resultados disponibles</p>
              </div>
            ) : (
              filteredOptions.map((opt: any) => (
                <div 
                  key={opt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{ 
                    padding: '10px 14px', 
                    cursor: 'pointer', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: value?.toString() === opt.id.toString() ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value?.toString() === opt.id.toString() ? 'rgba(0, 212, 255, 0.1)' : 'transparent'}
                >
                  {showAvatar && opt.image ? (
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={opt.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    showAvatar && label.toLowerCase().includes('responsable') && (
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="rgba(255,255,255,0.2)" />
                      </div>
                    )
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: value?.toString() === opt.id.toString() ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: value?.toString() === opt.id.toString() ? '700' : '500',
                      fontSize: '0.9rem'
                    }}>{opt.label}</div>
                  </div>
                  {value?.toString() === opt.id.toString() && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--accent-primary); }
        .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0, 0, 0.2, 1); }
        @keyframes scaleIn { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default SearchableSelect;
