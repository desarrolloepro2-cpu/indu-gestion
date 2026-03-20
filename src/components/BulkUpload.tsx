import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X,
  Database,
  Users,
  Briefcase,
  Target,
  History
} from 'lucide-react';

interface EntityConfig {
  id: string;
  name: string;
  table: string;
  icon: any;
  template: string[];
  description: string;
}

const ENTITIES: EntityConfig[] = [
  { 
    id: 'empleados', 
    name: 'Empleados', 
    table: 'empleados',
    icon: Users,
    template: ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'numero_documento', 'correo_electronico', 'telefono', 'direccion', 'apodo', 'esta_activo'],
    description: 'Cargar lista de personal principal con sus documentos y correos.'
  },
  { 
    id: 'centros_costos', 
    name: 'Centros de Costo', 
    table: 'centros_costos',
    icon: Database,
    template: ['codigo', 'nombre_centro', 'descripcion', 'presupuesto', 'horas_ingenieria', 'horas_tecnicos', 'horas_siso', 'horas_otros', 'habilitado'],
    description: 'Actualizar presupuestos y códigos de centros operativos.'
  },
  { 
    id: 'tareas', 
    name: 'Tareas', 
    table: 'tareas',
    icon: Target,
    template: ['nombre', 'descripcion', 'habilitado'],
    description: 'Cargar catálogo general de tareas disponibles para el personal.'
  },
  { 
    id: 'cargos', 
    name: 'Cargos', 
    table: 'cargos',
    icon: Briefcase,
    template: ['nombre_cargo', 'sigla_cargo', 'descripcion_cargo', 'salario_cargo', 'habilitado', 'aprobado'],
    description: 'Listado de cargos o posiciones funcionales.'
  }
];

const BulkUpload: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<EntityConfig | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('historico_cargues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setUploadHistory(data);
  };

  const downloadTemplate = (entity: EntityConfig) => {
    const header = entity.template.join(',');
    const example = entity.template.map(col => {
      if (col.includes('activo') || col === 'habilitado') return 'true';
      if (col.includes('correo')) return 'ejemplo@dominio.com';
      if (col.includes('presupuesto')) return '1000000';
      return `Dato_${col}`;
    }).join(',');
    
    const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `plantilla_${entity.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = async () => {
    if (!file || !selectedEntity) return;
    
    setIsProcessing(true);
    setResults(null);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const successData: any[] = [];
      const errorsList: string[] = [];
      
      // Validar headers
      const missing = selectedEntity.template.filter(t => !headers.includes(t.toLowerCase()));
      if (missing.length > 0) {
        throw new Error(`Columnas faltantes: ${missing.join(', ')}`);
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj: any = {};
        
        headers.forEach((h, idx) => {
          let val: any = values[idx];
          if (val === 'true') val = true;
          if (val === 'false') val = false;
          if (!isNaN(val) && val !== '' && h !== 'numero_documento' && h !== 'codigo') val = Number(val);
          obj[h] = val;
        });

        const { error } = await supabase.from(selectedEntity.table).insert([obj]);
        if (error) {
          errorsList.push(`Fila ${i+1}: ${error.message}`);
        } else {
          successData.push(obj);
        }
      }

      setResults({
        success: successData.length,
        failed: errorsList.length,
        errors: errorsList.slice(0, 10) // Mostrar solo 10 errores
      });

      // Guardar en histórico
      await supabase.from('historico_cargues').insert([{
        entidad: selectedEntity.name,
        nombre_archivo: file.name,
        registros_exitosos: successData.length,
        registros_fallidos: errorsList.length,
        detalles_error: errorsList.length > 0 ? { errors: errorsList } : null,
        estado: errorsList.length === 0 ? 'procesado' : 'procesado_con_errores'
      }]);

      fetchHistory();
    } catch (err: any) {
      setResults({ success: 0, failed: 1, errors: [err.message] });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '30px' }}>
        
        {/* Panel Principal */}
        <section className="glass-card" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Cargue Masivo de Información</h3>
            <p className="sub-index">Selecciona una entidad para subir datos desde un archivo .csv</p>
          </div>

          {!selectedEntity ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {ENTITIES.map(entity => (
                <div 
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity)}
                  className="glass-card hover-glow"
                  style={{ 
                    padding: '24px', 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '15px', 
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'var(--accent-primary)'
                  }}>
                    <entity.icon size={30} />
                  </div>
                  <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>{entity.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entity.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-slide-up">
              <button 
                onClick={() => { setSelectedEntity(null); setFile(null); setResults(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', marginBottom: '20px', fontWeight: 700 }}
              >
                <X size={18} /> Volver a selección
              </button>

              <div style={{ backgroundColor: 'rgba(0, 212, 255, 0.03)', padding: '24px', borderRadius: '16px', border: '1px dashed var(--accent-primary)', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                  <selectedEntity.icon size={48} color="var(--accent-primary)" style={{ opacity: 0.5, margin: '0 auto' }} />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '12px' }}>Importando: {selectedEntity.name}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Asegúrate de que las columnas coincidan con la plantilla.</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '24px' }}>
                  <button 
                    onClick={() => downloadTemplate(selectedEntity)}
                    className="glass-card neon-btn-active"
                    style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    <Download size={18} /> Descargar Plantilla .CSV
                  </button>
                  
                  <label className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <FileSpreadsheet size={18} />
                    {file ? file.name : "Seleccionar Archivo"}
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                {file && (
                  <button 
                    onClick={processFile}
                    disabled={isProcessing}
                    className="neon-btn"
                    style={{ width: '100%', height: '50px', fontSize: '1rem', fontWeight: 800, marginTop: '10px' }}
                  >
                    {isProcessing ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Loader2 className="animate-spin" size={20} /> Procesando datos...
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Upload size={20} /> Iniciar Carga Masiva
                      </span>
                    )}
                  </button>
                )}
              </div>

              {results && (
                <div className="animate-scale-in" style={{ marginTop: '24px', padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{results.success}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Éxitosos</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--error)' }}>{results.failed}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fallidos</div>
                    </div>
                  </div>

                  {results.errors.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '12px', borderLeft: '3px solid var(--error)' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--error)', marginBottom: '8px' }}>Errores Detectados:</p>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {results.errors.map((err, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{err}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Historial Lateral */}
        <aside>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 800, marginBottom: '20px' }}>
              <History size={20} color="var(--accent-primary)" /> Cargues Recientes
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {uploadHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No hay cargues registrados.
                </div>
              ) : (
                uploadHistory.map(h => (
                  <div key={h.id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{h.entidad}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nombre_archivo}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--success)', fontWeight: 800 }}>
                        <CheckCircle size={10} /> {h.registros_exitosos}
                      </span>
                      {h.registros_fallidos > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--error)', fontWeight: 800 }}>
                          <AlertCircle size={10} /> {h.registros_fallidos}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BulkUpload;
