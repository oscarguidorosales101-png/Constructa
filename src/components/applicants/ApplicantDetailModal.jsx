import React, { useState } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Clock,
  History,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CalendarPlus,
  UserCheck,
  Edit,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck,
  Building2
} from 'lucide-react';

export default function ApplicantDetailModal({
  applicant,
  isOpen,
  onClose,
  onOpenScheduleInterview,
  onOpenConvertToEmployee,
  onOpenEdit
}) {
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'experience' | 'education' | 'history'

  if (!isOpen || !applicant) return null;

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Seleccionado':
        return <Badge variant="success">Seleccionado</Badge>;
      case 'Entrevista programada':
        return <Badge variant="info">Entrevista Programada</Badge>;
      case 'Preseleccionado':
        return <Badge variant="warning">Preseleccionado</Badge>;
      case 'En revisión':
        return <Badge variant="warning">En Revisión</Badge>;
      case 'Entrevistado':
        return <Badge variant="info">Entrevistado</Badge>;
      case 'No seleccionado':
        return <Badge variant="danger">No Seleccionado</Badge>;
      case 'Retirado':
        return <Badge variant="neutral">Retirado</Badge>;
      default:
        return <Badge variant="neutral">Recibida</Badge>;
    }
  };

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div 
        className="constructa-modal constructa-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden'
        }}
      >
        {/* Header Modal */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                {applicant.id}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                {applicant.nombre}
              </h2>
              {getStatusBadge(applicant.estado)}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              Aspirante al puesto de <strong style={{ color: 'var(--color-gold)' }}>{applicant.puestoSolicitado}</strong> • {applicant.area || 'Operaciones'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{ color: 'var(--color-text-muted)' }}
            title="Cerrar expediente"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--color-bg-page)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<CalendarPlus size={15} />}
              onClick={() => {
                onClose();
                onOpenScheduleInterview(applicant);
              }}
            >
              Programar Entrevista
            </Button>

            {applicant.estado === 'Seleccionado' && !applicant.empleadoId && (
              <Button
                variant="primary"
                size="sm"
                icon={<UserCheck size={15} />}
                onClick={() => {
                  onClose();
                  onOpenConvertToEmployee(applicant);
                }}
              >
                Dar de Alta como Empleado
              </Button>
            )}

            {applicant.empleadoId && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--color-emerald)',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle2 size={14} /> Empleado en Nómina ({applicant.empleadoId})
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<Edit size={14} />}
            onClick={() => {
              onClose();
              onOpenEdit(applicant);
            }}
          >
            Editar Expediente
          </Button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '0 24px',
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'curriculum', label: 'Currículum y Perfil', icon: <FileText size={14} /> },
            { id: 'experience', label: `Experiencia Laboral (${applicant.experiencias?.length || 0})`, icon: <Briefcase size={14} /> },
            { id: 'education', label: 'Formación y Habilidades', icon: <GraduationCap size={14} /> },
            { id: 'documents', label: `Documentos (${applicant.documentos?.length || 1})`, icon: <FileCheck size={14} /> },
            { id: 'history', label: 'Bitácora del Proceso', icon: <History size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-gold)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* TAB 1: CURRÍCULUM Y PERFIL */}
          {activeTab === 'curriculum' && (
            <>
              {/* Personal Data Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                padding: '16px',
                background: 'var(--color-bg-page)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Identificación / DNI</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{applicant.dni || 'No especificado'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Teléfono Móvil</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    <Phone size={13} style={{ color: 'var(--color-gold)' }} />
                    {applicant.telefono || '—'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Correo Electrónico</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    <Mail size={13} style={{ color: 'var(--color-gold)' }} />
                    {applicant.email || '—'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Ubicación</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    <MapPin size={13} style={{ color: 'var(--color-gold)' }} />
                    {applicant.ubicacion || '—'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Años de Experiencia</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-gold)' }}>
                    {applicant.experienciaAnios ? `${applicant.experienciaAnios} años comprobados` : 'No especificada'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Disponibilidad</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-emerald)' }}>{applicant.disponibilidad || 'Inmediata'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Jornada Solicitada</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{applicant.tipoJornada || 'Tiempo Completo'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Fecha de Postulación</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{applicant.fechaPostulacion}</span>
                </div>
              </div>

              {/* Professional Profile */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', marginBottom: '8px' }}>
                  Extracto y Perfil Profesional
                </h4>
                <div style={{
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  color: 'var(--color-text-primary)'
                }}>
                  {applicant.perfilProfesional || 'Sin extracto profesional registrado.'}
                </div>
              </div>

              {/* Previous Company & Role */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px'
              }}>
                <div style={{
                  padding: '14px',
                  background: 'var(--color-bg-page)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Último Puesto Desempeñado</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {applicant.ultimoPuesto || 'No registrado'}
                  </div>
                </div>
                <div style={{
                  padding: '14px',
                  background: 'var(--color-bg-page)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Última Empresa</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {applicant.ultimaEmpresa || 'No registrada'}
                  </div>
                </div>
              </div>

              {/* Professional References */}
              {applicant.referencias && applicant.referencias.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                    Referencias Laborales
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {applicant.referencias.map((ref, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          background: 'var(--color-bg-page)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{ref.nombre}</div>
                        <div style={{ color: 'var(--color-gold)', fontSize: '0.8rem' }}>{ref.empresa} • {ref.relacion}</div>
                        <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                          Tel: {ref.telefono}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: EXPERIENCIA LABORAL ESTRUCTURADA */}
          {activeTab === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(!applicant.experiencias || applicant.experiencias.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  No se registraron experiencias laborales anteriores en el expediente.
                </div>
              ) : (
                applicant.experiencias.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    style={{
                      padding: '18px',
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
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-gold)', margin: 0 }}>
                          {exp.puesto}
                        </h4>
                        <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                          <strong>{exp.empresa}</strong>
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {exp.fechaInicio} al {exp.fechaFin || 'Actual'} • {exp.duracion || 'Tiempo en plaza'}
                      </div>
                    </div>

                    {exp.responsabilidades && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>Responsabilidades clave:</strong> {exp.responsabilidades}
                      </div>
                    )}

                    {exp.logros && (
                      <div style={{
                        fontSize: '0.82rem',
                        color: 'var(--color-emerald)',
                        background: 'rgba(16, 185, 129, 0.05)',
                        borderLeft: '2px solid var(--color-emerald)',
                        padding: '6px 12px',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                      }}>
                        <strong>Logro destacado:</strong> {exp.logros}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: FORMACIÓN Y HABILIDADES */}
          {activeTab === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Academic Training */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', marginBottom: '10px' }}>
                  Estudios y Certificaciones Oficiales
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(!applicant.formacion || applicant.formacion.length === 0) ? (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sin formación registrada.</div>
                  ) : (
                    applicant.formacion.map((edu, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px',
                          background: 'var(--color-bg-page)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                            {edu.titulo}
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                            {edu.institucion} {edu.tipo ? `• ${edu.tipo}` : ''}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                          {edu.anio || 'Certificado'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', marginBottom: '10px' }}>
                  Habilidades Técnicas y Destrezas Operativas
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(!applicant.habilidades || applicant.habilidades.length === 0) ? (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sin habilidades registradas.</div>
                  ) : (
                    applicant.habilidades.map((hab, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.84rem',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        {hab}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTOS Y EXPEDIENTE DIGITAL */}
          {activeTab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', margin: 0 }}>
                  Expediente de Documentación Digital
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {applicant.documentos?.length || 1} archivo(s) registrado(s)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(!applicant.documentos || applicant.documentos.length === 0) ? (
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={22} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                          CV_{applicant.nombre?.replace(/\s+/g, '_') || 'Candidato'}.pdf
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                          Currículum Vitae Principal • 245.0 KB • {applicant.fechaPostulacion || 'Reciente'}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        color: 'var(--color-emerald)',
                        background: 'rgba(16, 185, 129, 0.08)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <CheckCircle2 size={14} /> Expediente Base Digital
                    </span>
                  </div>
                ) : (
                  applicant.documentos.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      style={{
                        padding: '14px 18px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={22} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                            {doc.nombre}
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                            {doc.categoria || 'Documento Oficial'} • {doc.tamanio || 'PDF'} • {doc.fecha || applicant.fechaPostulacion}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-emerald)',
                          background: 'rgba(16, 185, 129, 0.08)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          fontWeight: 600
                        }}
                      >
                        {doc.tipo || 'PDF'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HISTORIAL DEL PROCESO */}
          {activeTab === 'history' && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-gold)', marginBottom: '14px' }}>
                Línea de Tiempo del Proceso de Selección
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(!applicant.historial || applicant.historial.length === 0) ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No hay registros en la bitácora.</div>
                ) : (
                  applicant.historial.map((ev, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        padding: '12px 16px',
                        background: 'var(--color-bg-page)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{
                        minWidth: '95px',
                        fontSize: '0.78rem',
                        color: 'var(--color-text-muted)',
                        paddingTop: '2px'
                      }}>
                        {ev.fecha}
                      </div>
                      <div style={{ color: 'var(--color-text-primary)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                        {ev.evento}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <Button variant="secondary" onClick={onClose}>
            Cerrar Expediente
          </Button>
        </div>
      </div>
    </div>
  );
}
