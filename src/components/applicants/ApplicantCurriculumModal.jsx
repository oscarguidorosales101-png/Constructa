import React from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  X,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  Globe2,
  Info,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  User,
  CalendarClock,
  Edit
} from 'lucide-react';

export default function ApplicantCurriculumModal({
  applicant,
  isOpen,
  onClose,
  onOpenInfo,
  onOpenInterview,
  onOpenEdit,
  onOpenSchedule
}) {
  if (!isOpen || !applicant) return null;

  // Extract academic education vs certifications if present
  const rawFormacion = applicant.formacion || [];
  const formacionAcademica = rawFormacion.filter(
    (f) => f.tipo !== 'Certificación' && !f.titulo?.toLowerCase().includes('certificaci')
  );
  const certificaciones = [
    ...rawFormacion.filter(
      (f) => f.tipo === 'Certificación' || f.titulo?.toLowerCase().includes('certificaci')
    ),
    ...(applicant.certificaciones || [])
  ];

  // Languages default or custom
  const idiomas = applicant.idiomas || [
    { idioma: 'Español', nivel: 'Nativo / Lengua materna' },
    ...(applicant.experienciaAnios > 5 ? [{ idioma: 'Inglés Técnico', nivel: 'Lectura de manuales y especificaciones' }] : [])
  ];

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div
        className="constructa-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 700 }}>
                  CV • {applicant.id}
                </span>
                <h3 className="modal-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                  Currículum Vitae — {applicant.nombre}
                </h3>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                {applicant.puestoSolicitado} • {applicant.area || 'Operaciones en Obra'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-icon"
              style={{ color: 'var(--color-text-muted)' }}
              title="Cerrar currículum"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Navigation Strip (Context Switching without Stacking) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            {onOpenInfo && (
              <Button
                variant="ghost"
                size="sm"
                icon={<User size={13} />}
                onClick={() => {
                  onClose();
                  onOpenInfo(applicant);
                }}
              >
                Ficha General
              </Button>
            )}
            {onOpenInterview && (
              <Button
                variant="ghost"
                size="sm"
                icon={<CalendarClock size={13} />}
                onClick={() => {
                  onClose();
                  onOpenInterview(applicant);
                }}
              >
                Ver Entrevista
              </Button>
            )}
            {onOpenEdit && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit size={13} />}
                onClick={() => {
                  onClose();
                  onOpenEdit(applicant);
                }}
              >
                Editar
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <span>Estado:</span>
            <Badge variant={applicant.estado === 'Seleccionado' ? 'success' : applicant.estado === 'Entrevista programada' ? 'info' : 'warning'}>
              {applicant.estado}
            </Badge>
          </div>
        </div>

        {/* Modal Scrollable Body - INTERNAL SCROLLING ONLY */}
        <div
          className="modal-body"
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '22px'
          }}
        >
          {/* SECCIÓN 1: PERFIL PROFESIONAL */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <User size={16} style={{ color: 'var(--color-gold)' }} />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Perfil Profesional
              </h4>
            </div>
            <div
              style={{
                padding: '16px 18px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                lineHeight: '1.65',
                color: 'var(--color-text-primary)'
              }}
            >
              {applicant.perfilProfesional || 'Sin extracto profesional registrado en el expediente.'}
            </div>
          </section>

          {/* SECCIÓN 2: EXPERIENCIA LABORAL */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={16} style={{ color: 'var(--color-gold)' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Experiencia Laboral
                </h4>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg-page)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                {applicant.experienciaAnios ? `${applicant.experienciaAnios} años de experiencia total` : 'Sin años especificados'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(!applicant.experiencias || applicant.experiencias.length === 0) ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--color-bg-page)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem'
                }}>
                  {applicant.ultimoPuesto ? (
                    <div>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{applicant.ultimoPuesto}</strong> en <span>{applicant.ultimaEmpresa || 'Empresa previa'}</span>
                    </div>
                  ) : (
                    'No se registraron posiciones laborales previas en el currículum.'
                  )}
                </div>
              ) : (
                applicant.experiencias.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    style={{
                      padding: '16px 18px',
                      background: 'var(--color-bg-page)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {exp.puesto}
                        </h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '0.86rem', color: 'var(--color-gold)' }}>
                          <Building2 size={14} />
                          <strong>{exp.empresa}</strong>
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-border)',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          color: 'var(--color-text-secondary)'
                        }}
                      >
                        {exp.fechaInicio} — {exp.fechaFin || 'Presente'} {exp.duracion ? `(${exp.duracion})` : ''}
                      </div>
                    </div>

                    {exp.responsabilidades && (
                      <div style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Responsabilidades y tareas: </span>
                        {exp.responsabilidades}
                      </div>
                    )}

                    {exp.logros && (
                      <div
                        style={{
                          fontSize: '0.83rem',
                          color: 'var(--color-emerald)',
                          background: 'rgba(16, 185, 129, 0.06)',
                          borderLeft: '3px solid var(--color-emerald)',
                          padding: '6px 12px',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                          lineHeight: '1.45'
                        }}
                      >
                        <strong>Logro destacado en obra:</strong> {exp.logros}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SECCIÓN 3: FORMACIÓN ACADÉMICA */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <GraduationCap size={16} style={{ color: 'var(--color-gold)' }} />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                3. Formación Académica
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formacionAcademica.length === 0 ? (
                <div style={{ padding: '14px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Sin formación técnica o profesional registrada.
                </div>
              ) : (
                formacionAcademica.map((edu, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--color-bg-page)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                        {edu.titulo}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                        {edu.institucion} {edu.tipo ? `• ${edu.tipo}` : ''}
                      </div>
                    </div>
                    {edu.anio && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontWeight: 600, background: 'rgba(245, 158, 11, 0.08)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        {edu.anio}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SECCIÓN 4: CERTIFICACIONES */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Award size={16} style={{ color: 'var(--color-gold)' }} />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                4. Certificaciones y Licencias
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {certificaciones.length === 0 ? (
                <div style={{ padding: '14px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Sin certificaciones oficiales o DC-3 anexadas.
                </div>
              ) : (
                certificaciones.map((cert, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(16, 185, 129, 0.03)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>
                          {cert.titulo || cert.nombre || cert}
                        </div>
                        {cert.institucion && (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                            Emisor: {cert.institucion}
                          </div>
                        )}
                      </div>
                    </div>
                    {cert.anio && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-emerald)', fontWeight: 600 }}>
                        Vigente / {cert.anio}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SECCIÓN 5: HABILIDADES TÉCNICAS */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Wrench size={16} style={{ color: 'var(--color-gold)' }} />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                5. Habilidades y Competencias
              </h4>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(!applicant.habilidades || applicant.habilidades.length === 0) ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sin competencias registradas.</div>
              ) : (
                applicant.habilidades.map((hab, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.84rem',
                      color: 'var(--color-text-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-gold)' }} />
                    {hab}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* SECCIÓN 6: IDIOMAS */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Globe2 size={16} style={{ color: 'var(--color-gold)' }} />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                6. Idiomas
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {idiomas.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--color-bg-page)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                    {typeof item === 'string' ? item : item.idioma}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {typeof item === 'string' ? 'Competencia laboral' : item.nivel}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 7: INFORMACIÓN ADICIONAL */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Info size={16} style={{ color: 'var(--color-gold)' }} />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                7. Información Adicional y Referencias
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Disponibilidad de Ingreso</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-emerald)' }}>{applicant.disponibilidad || 'Inmediata'}</strong>
              </div>
              <div style={{ padding: '12px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Jornada Laboral</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{applicant.tipoJornada || 'Tiempo Completo'}</strong>
              </div>
              <div style={{ padding: '12px', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Residencia / Movilidad</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{applicant.ubicacion || 'Zona metropolitana'}</strong>
              </div>
            </div>

            {/* References */}
            {applicant.referencias && applicant.referencias.length > 0 && (
              <div>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Referencias Laborales Comprobadas
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                  {applicant.referencias.map((ref, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        background: 'var(--color-bg-page)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{ref.nombre}</div>
                      <div style={{ color: 'var(--color-gold)', fontSize: '0.8rem', marginTop: '2px' }}>
                        {ref.empresa} • {ref.relacion}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {ref.telefono}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.01)',
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            CONSTRUCTA RH • Expediente curricular digital
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {onOpenSchedule && (
              <Button
                variant="secondary"
                size="sm"
                icon={<CalendarClock size={14} />}
                onClick={() => {
                  onClose();
                  onOpenSchedule(applicant);
                }}
              >
                Agendar Entrevista
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Cerrar Currículum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
