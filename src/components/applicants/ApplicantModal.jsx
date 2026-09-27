import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { X, UserPlus, Save, Briefcase, User, GraduationCap } from 'lucide-react';
import { useConstructa } from '../../context/ConstructaContext';

const INITIAL_FORM = {
  nombre: '',
  dni: '',
  email: '',
  telefono: '',
  ubicacion: '',
  fechaNacimiento: '',
  puestoSolicitado: '',
  area: 'Estructuras y Obra Civil',
  experienciaAnios: 3,
  ultimoPuesto: '',
  ultimaEmpresa: '',
  disponibilidad: 'Inmediata',
  tipoJornada: 'Tiempo Completo',
  proyectoAsignadoTentativo: 'PRJ-001',
  estado: 'Recibida',
  perfilProfesional: '',
  habilidadesText: '',
  formacionTitulo: '',
  formacionInstitucion: '',
  formacionAnio: '2020',
  expEmpresa: '',
  expPuesto: '',
  expDuracion: '2 años',
  expResp: '',
};

export default function ApplicantModal({
  isOpen,
  onClose,
  applicant = null,
  onSave
}) {
  const { data } = useConstructa();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [activeSection, setActiveSection] = useState('general'); // 'general' | 'experience'

  useEffect(() => {
    if (applicant) {
      setFormData({
        ...INITIAL_FORM,
        ...applicant,
        habilidadesText: applicant.habilidades ? applicant.habilidades.join(', ') : '',
        formacionTitulo: applicant.formacion?.[0]?.titulo || '',
        formacionInstitucion: applicant.formacion?.[0]?.institucion || '',
        formacionAnio: applicant.formacion?.[0]?.anio || '2020',
        expEmpresa: applicant.experiencias?.[0]?.empresa || '',
        expPuesto: applicant.experiencias?.[0]?.puesto || '',
        expDuracion: applicant.experiencias?.[0]?.duracion || '2 años',
        expResp: applicant.experiencias?.[0]?.responsabilidades || '',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [applicant, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse skills
    const habilidades = formData.habilidadesText
      ? formData.habilidadesText.split(',').map((s) => s.trim()).filter(Boolean)
      : applicant?.habilidades || [];

    // Parse training
    const formacion = formData.formacionTitulo
      ? [
          {
            titulo: formData.formacionTitulo,
            institucion: formData.formacionInstitucion || 'Centro de Estudios',
            anio: formData.formacionAnio || '2022',
            tipo: 'Educación Técnica / Profesional',
          },
          ...(applicant?.formacion?.slice(1) || []),
        ]
      : applicant?.formacion || [];

    // Parse experience
    const experiencias = formData.expEmpresa
      ? [
          {
            id: applicant?.experiencias?.[0]?.id || 'EXP-001',
            empresa: formData.expEmpresa,
            puesto: formData.expPuesto || formData.puestoSolicitado,
            fechaInicio: '2022',
            fechaFin: '2025',
            duracion: formData.expDuracion,
            responsabilidades: formData.expResp,
            logros: applicant?.experiencias?.[0]?.logros || 'Cumplimiento continuo de normas de calidad y entrega a tiempo.',
          },
          ...(applicant?.experiencias?.slice(1) || []),
        ]
      : applicant?.experiencias || [];

    const payload = {
      ...applicant,
      nombre: formData.nombre,
      dni: formData.dni,
      email: formData.email,
      telefono: formData.telefono,
      ubicacion: formData.ubicacion,
      fechaNacimiento: formData.fechaNacimiento,
      puestoSolicitado: formData.puestoSolicitado,
      area: formData.area,
      experienciaAnios: Number(formData.experienciaAnios) || 0,
      ultimoPuesto: formData.ultimoPuesto || formData.expPuesto,
      ultimaEmpresa: formData.ultimaEmpresa || formData.expEmpresa,
      disponibilidad: formData.disponibilidad,
      tipoJornada: formData.tipoJornada,
      proyectoAsignadoTentativo: formData.proyectoAsignadoTentativo,
      estado: formData.estado,
      perfilProfesional: formData.perfilProfesional,
      habilidades,
      formacion,
      experiencias,
      referencias: applicant?.referencias || [],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="constructa-modal-overlay" onClick={onClose}>
      <div
        className="constructa-modal constructa-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '750px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                {applicant ? 'Editar Expediente de Postulante' : 'Registrar Nuevo Postulante'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Ingreso de expediente profesional y perfil laboral para selección
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Section Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 24px',
            background: 'var(--color-bg-page)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveSection('general')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeSection === 'general' ? 'var(--color-gold)' : 'transparent',
              color: activeSection === 'general' ? '#000000' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            1. Datos Personales y Puesto
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('experience')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeSection === 'experience' ? 'var(--color-gold)' : 'transparent',
              color: activeSection === 'experience' ? '#000000' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            2. Currículum y Experiencia
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
            {activeSection === 'general' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className="constructa-input"
                      placeholder="Ej. Juan Manuel Pérez Soto"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Identificación / DNI *
                    </label>
                    <input
                      type="text"
                      name="dni"
                      className="constructa-input"
                      placeholder="Ej. DNI-84920192"
                      value={formData.dni}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="constructa-input"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Teléfono Móvil *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      className="constructa-input"
                      placeholder="+52 55 1234 5678"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Ubicación / Ciudad
                    </label>
                    <input
                      type="text"
                      name="ubicacion"
                      className="constructa-input"
                      placeholder="Ej. Ciudad de México / Naucalpan"
                      value={formData.ubicacion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Puesto al que se Postula *
                    </label>
                    <input
                      type="text"
                      name="puestoSolicitado"
                      className="constructa-input"
                      placeholder="Ej. Electricista Industrial"
                      value={formData.puestoSolicitado}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Área Técnica / Especialidad
                    </label>
                    <select
                      name="area"
                      className="constructa-input"
                      value={formData.area}
                      onChange={handleChange}
                    >
                      <option value="Estructuras y Obra Civil">Estructuras y Obra Civil</option>
                      <option value="Instalaciones Eléctricas y Especiales">Instalaciones Eléctricas y Especiales</option>
                      <option value="Acabados y Carpintería">Acabados y Carpintería</option>
                      <option value="Maquinaria Pesada y Maniobras">Maquinaria Pesada y Maniobras</option>
                      <option value="Administración y Control Financiero">Administración y Control Financiero</option>
                      <option value="Seguridad, Salud y Medio Ambiente (SSOMA)">Seguridad e Higiene (SSOMA)</option>
                      <option value="Trazo y Nivelación">Trazo y Topografía</option>
                      <option value="Dirección y Supervisión de Obra">Dirección y Residencia de Obra</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      name="experienciaAnios"
                      min="0"
                      max="40"
                      className="constructa-input"
                      value={formData.experienciaAnios}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Estado del Proceso
                    </label>
                    <select
                      name="estado"
                      className="constructa-input"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      <option value="Recibida">Recibida</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Preseleccionado">Preseleccionado</option>
                      <option value="Entrevista programada">Entrevista programada</option>
                      <option value="Entrevistado">Entrevistado</option>
                      <option value="Seleccionado">Seleccionado</option>
                      <option value="No seleccionado">No seleccionado</option>
                      <option value="Retirado">Retirado</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Disponibilidad
                    </label>
                    <select
                      name="disponibilidad"
                      className="constructa-input"
                      value={formData.disponibilidad}
                      onChange={handleChange}
                    >
                      <option value="Inmediata">Inmediata</option>
                      <option value="15 días">Aviso previo (15 días)</option>
                      <option value="1 mes">1 mes</option>
                      <option value="A convenir">A convenir</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Proyecto Tentativo
                    </label>
                    <select
                      name="proyectoAsignadoTentativo"
                      className="constructa-input"
                      value={formData.proyectoAsignadoTentativo}
                      onChange={handleChange}
                    >
                      {data.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'experience' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                    Perfil / Extracto Profesional
                  </label>
                  <textarea
                    name="perfilProfesional"
                    className="constructa-input"
                    rows="3"
                    placeholder="Descripción resumida del perfil, trayectoria y especialización en el ramo..."
                    value={formData.perfilProfesional}
                    onChange={handleChange}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Última Empresa donde Laboró
                    </label>
                    <input
                      type="text"
                      name="expEmpresa"
                      className="constructa-input"
                      placeholder="Ej. Constructora del Norte S.A."
                      value={formData.expEmpresa}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Último Cargo / Puesto
                    </label>
                    <input
                      type="text"
                      name="expPuesto"
                      className="constructa-input"
                      placeholder="Ej. Cabo de Fierrería"
                      value={formData.expPuesto}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Tiempo Laborado en la Empresa
                    </label>
                    <input
                      type="text"
                      name="expDuracion"
                      className="constructa-input"
                      placeholder="Ej. 3 años y 4 meses"
                      value={formData.expDuracion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                    Responsabilidades y Logros Anteriores
                  </label>
                  <textarea
                    name="expResp"
                    className="constructa-input"
                    rows="2"
                    placeholder="Supervisión de cuadrillas, control de materiales, cumplimiento de bitácora..."
                    value={formData.expResp}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Estudios / Carrera Técnica / Certificación
                    </label>
                    <input
                      type="text"
                      name="formacionTitulo"
                      className="constructa-input"
                      placeholder="Ej. Técnico Superior en Electricidad / Certificado STPS DC-3"
                      value={formData.formacionTitulo}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                      Año de Conclusión
                    </label>
                    <input
                      type="text"
                      name="formacionAnio"
                      className="constructa-input"
                      placeholder="2021"
                      value={formData.formacionAnio}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                    Habilidades Clave (separadas por comas)
                  </label>
                  <input
                    type="text"
                    name="habilidadesText"
                    className="constructa-input"
                    placeholder="Lectura de planos, Empalmes alta tensión, Soldadura SMAW, Trabajo en alturas"
                    value={formData.habilidadesText}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.01)',
            }}
          >
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" icon={<Save size={16} />}>
              Guardar Expediente
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
