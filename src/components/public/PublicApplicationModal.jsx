import React, { useState, useEffect } from 'react';
import { useConstructa } from '../../context/ConstructaContext';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Upload,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  IdCard,
  Send,
  Eye
} from 'lucide-react';

export default function PublicApplicationModal({ vacancy, isOpen, onClose }) {
  const { saveApplicant } = useConstructa();

  // Multi-step state: 1 (Personal) -> 2 (Perfil) -> 3 (Experiencia) -> 4 (Formación & Habilidades) -> 5 (Certificaciones & Documentos) -> 6 (Revisión)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdApplicantId, setCreatedApplicantId] = useState('');
  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    ubicacion: '',
    puestoSolicitado: vacancy?.puesto || '',
    profesion: 'Ingeniería Civil / Edificación',
    area: vacancy?.area || 'Operaciones en Obra',
    disponibilidad: 'Inmediata',
    tipoJornada: vacancy?.tipoJornada || 'Tiempo Completo',
    experienciaAnios: '3 a 5 años',
    perfilProfesional: '',
    experiencias: [
      {
        puesto: '',
        empresa: '',
        fechaInicio: '',
        fechaFin: '',
        responsabilidades: '',
        referenciaContacto: ''
      }
    ],
    formacion: [
      {
        titulo: '',
        institucion: '',
        anio: '',
        tipo: 'Universitaria'
      }
    ],
    habilidadesInput: '',
    habilidades: ['Supervisión de Obra', 'Interpretación de Planos', 'Control de Calidad'],
    certificaciones: [
      {
        titulo: '',
        institucion: '',
        anio: ''
      }
    ],
    documentos: []
  });

  useEffect(() => {
    if (vacancy) {
      setFormData((prev) => ({
        ...prev,
        puestoSolicitado: vacancy.puesto,
        area: vacancy.area,
        tipoJornada: vacancy.tipoJornada
      }));
    }
  }, [vacancy]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation per step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = 'Ingresa tu nombre completo.';
      if (!formData.dni.trim()) newErrors.dni = 'Ingresa tu número de identificación o DNI.';
      if (!formData.email.trim()) {
        newErrors.email = 'El correo electrónico es obligatorio.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Ingresa un correo electrónico con formato válido.';
      }
      if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono de contacto es obligatorio.';
      if (!formData.ubicacion.trim()) newErrors.ubicacion = 'Ingresa tu ciudad o zona de residencia.';
    }

    if (step === 2) {
      if (!formData.perfilProfesional.trim()) {
        newErrors.perfilProfesional = 'Por favor redacta un breve resumen de tu perfil y trayectoria.';
      }
    }

    if (step === 3) {
      if (formData.experiencias.length > 0) {
        const first = formData.experiencias[0];
        if (!first.puesto.trim() || !first.empresa.trim()) {
          newErrors.experiencia = 'Indica al menos el puesto y la empresa de tu experiencia laboral principal.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Experience handlers
  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiencias: [
        ...prev.experiencias,
        { puesto: '', empresa: '', fechaInicio: '', fechaFin: '', responsabilidades: '', referenciaContacto: '' }
      ]
    }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experiencias: prev.experiencias.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experiencias];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiencias: updated };
    });
  };

  // Education handlers
  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      formacion: [
        ...prev.formacion,
        { titulo: '', institucion: '', anio: '', tipo: 'Técnica' }
      ]
    }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      formacion: prev.formacion.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.formacion];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, formacion: updated };
    });
  };

  // Skills handlers
  const addSkill = () => {
    if (!formData.habilidadesInput.trim()) return;
    const cleanSkill = formData.habilidadesInput.trim();
    if (!formData.habilidades.includes(cleanSkill)) {
      setFormData((prev) => ({
        ...prev,
        habilidades: [...prev.habilidades, cleanSkill],
        habilidadesInput: ''
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      habilidades: prev.habilidades.filter((s) => s !== skillToRemove)
    }));
  };

  // Certifications handlers
  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certificaciones: [
        ...prev.certificaciones,
        { titulo: '', institucion: '', anio: '' }
      ]
    }));
  };

  const removeCertification = (index) => {
    setFormData((prev) => ({
      ...prev,
      certificaciones: prev.certificaciones.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.certificaciones];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certificaciones: updated };
    });
  };

  // File upload simulation & metadata storage
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'];

    const validDocs = [];
    files.forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) return;

      validDocs.push({
        id: 'DOC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        nombre: file.name,
        tipo: ext.toUpperCase(),
        tamanio: `${(file.size / 1024).toFixed(1)} KB`,
        fecha: new Date().toISOString().split('T')[0],
        categoria: file.name.toLowerCase().includes('cv') ? 'Currículum Vitae' : 'Certificado / Anexo'
      });
    });

    setFormData((prev) => ({
      ...prev,
      documentos: [...prev.documentos, ...validDocs]
    }));
  };

  const removeDocument = (docId) => {
    setFormData((prev) => ({
      ...prev,
      documentos: prev.documentos.filter((d) => d.id !== docId)
    }));
  };

  // Final Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const cleanExperiencias = formData.experiencias.filter((e) => e.puesto || e.empresa);
    const cleanFormacion = formData.formacion.filter((f) => f.titulo || f.institucion);
    const cleanCertificaciones = formData.certificaciones.filter((c) => c.titulo);

    // Compute years of experience
    const parsedExp = parseInt(formData.experienciaAnios, 10) || Math.max(cleanExperiencias.length * 2, 2);

    const payload = {
      nombre: formData.nombre.trim(),
      dni: formData.dni.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      ubicacion: formData.ubicacion.trim(),
      puestoSolicitado: formData.puestoSolicitado || vacancy?.puesto || 'Puesto Operativo',
      profesion: formData.profesion,
      area: formData.area || vacancy?.area || 'Operaciones en Obra',
      disponibilidad: formData.disponibilidad,
      tipoJornada: formData.tipoJornada,
      experienciaAnios: parsedExp,
      perfilProfesional: formData.perfilProfesional.trim(),
      experiencias: cleanExperiencias,
      formacion: cleanFormacion,
      habilidades: formData.habilidades,
      certificaciones: cleanCertificaciones,
      documentos: formData.documentos.length > 0 ? formData.documentos : [
        {
          id: 'DOC-CV-DEFAULT',
          nombre: `CV_${formData.nombre.replace(/\s+/g, '_')}.pdf`,
          tipo: 'PDF',
          tamanio: '320.0 KB',
          fecha: new Date().toISOString().split('T')[0],
          categoria: 'Currículum Vitae'
        }
      ],
      estado: 'Recibida',
      origen: 'Sitio Público — Trabaja con Nosotros',
      fechaPostulacion: new Date().toISOString().split('T')[0]
    };

    try {
      const saved = saveApplicant(payload);
      const generatedId = (Array.isArray(saved) ? saved[0]?.id : saved?.id) || 'POS-REC';
      setCreatedApplicantId(generatedId);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error al registrar postulación:', err);
      setIsSubmitted(true);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="constructa-modal-overlay" onClick={handleResetAndClose}>
      <div
        className="constructa-modal public-application-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span style={{ color: 'var(--accent-amber, #f59e0b)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              BOLSA DE TRABAJO CONSTRUCTA
            </span>
            <h3 className="modal-title" style={{ fontSize: '1.25rem', marginTop: '2px' }}>
              {vacancy ? `Postulación: ${vacancy.puesto}` : 'Postulación Abierta de Candidato'}
            </h3>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={handleResetAndClose}
            aria-label="Cerrar formulario de postulación"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* If successfully submitted */}
        {isSubmitted ? (
          <div className="modal-body" style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-emerald, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0' }}>
              Postulación recibida
            </h3>

            <p style={{ maxWidth: '520px', margin: '0 auto 18px auto', fontSize: '0.95rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.65' }}>
              Hemos recibido tu información y expediente curricular correctamente. Nuestro equipo de Recursos Humanos revisará tu perfil profesional y continuará el proceso de selección cuando corresponda.
            </p>

            {createdApplicantId && (
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.1))',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  color: 'var(--accent-amber, #f59e0b)',
                  marginBottom: '24px'
                }}
              >
                Folio de seguimiento: <strong>{createdApplicantId}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResetAndClose}
              >
                Finalizar y regresar al sitio
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Stepper Progresivo de 6 Pasos */}
            <div className="public-steps-nav">
              {[
                { num: 1, label: 'Datos Personales', code: '01' },
                { num: 2, label: 'Perfil', code: '02' },
                { num: 3, label: 'Experiencia', code: '03' },
                { num: 4, label: 'Formación', code: '04' },
                { num: 5, label: 'Documentos', code: '05' },
                { num: 6, label: 'Revisión', code: '06' }
              ].map((step) => (
                <div
                  key={step.num}
                  className={`public-step-item ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                  onClick={() => {
                    if (step.num < currentStep || validateStep(currentStep)) {
                      setCurrentStep(step.num);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="public-step-number">
                    {currentStep > step.num ? <CheckCircle2 size={14} /> : step.code}
                  </div>
                  <span className="public-step-name">{step.label}</span>
                </div>
              ))}
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* BLOQUE 1: INFORMACIÓN PERSONAL */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="public-form-grid-2">
                    <div className="public-form-field">
                      <label className="public-form-label">
                        Nombre completo <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Ing. Laura Marcela Torres"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={`public-form-input ${errors.nombre ? 'has-error' : ''}`}
                      />
                      {errors.nombre && <span className="public-form-error">{errors.nombre}</span>}
                    </div>

                    <div className="public-form-field">
                      <label className="public-form-label">
                        Identificación / Cédula / DNI <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. DNI-8492019 o Cédula Profesional"
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        className={`public-form-input ${errors.dni ? 'has-error' : ''}`}
                      />
                      {errors.dni && <span className="public-form-error">{errors.dni}</span>}
                    </div>
                  </div>

                  <div className="public-form-grid-2">
                    <div className="public-form-field">
                      <label className="public-form-label">
                        Correo electrónico <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="laura.torres@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`public-form-input ${errors.email ? 'has-error' : ''}`}
                      />
                      {errors.email && <span className="public-form-error">{errors.email}</span>}
                    </div>

                    <div className="public-form-field">
                      <label className="public-form-label">
                        Teléfono / WhatsApp de Contacto <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+52 55 9876 5432"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className={`public-form-input ${errors.telefono ? 'has-error' : ''}`}
                      />
                      {errors.telefono && <span className="public-form-error">{errors.telefono}</span>}
                    </div>
                  </div>

                  <div className="public-form-grid-2">
                    <div className="public-form-field">
                      <label className="public-form-label">
                        Ciudad / Ubicación de residencia <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Ciudad de México, Benito Juárez"
                        value={formData.ubicacion}
                        onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                        className={`public-form-input ${errors.ubicacion ? 'has-error' : ''}`}
                      />
                      {errors.ubicacion && <span className="public-form-error">{errors.ubicacion}</span>}
                    </div>

                    <div className="public-form-field">
                      <label className="public-form-label">Disponibilidad de incorporación</label>
                      <select
                        value={formData.disponibilidad}
                        onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
                        className="public-form-select"
                      >
                        <option value="Inmediata">Inmediata</option>
                        <option value="1 a 2 semanas">1 a 2 semanas</option>
                        <option value="1 mes">1 mes</option>
                        <option value="A convenir">A convenir según proyecto</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* BLOQUE 2: PERFIL PROFESIONAL */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="public-form-grid-2">
                    <div className="public-form-field">
                      <label className="public-form-label">Puesto al que postula</label>
                      <input
                        type="text"
                        value={formData.puestoSolicitado}
                        onChange={(e) => setFormData({ ...formData, puestoSolicitado: e.target.value })}
                        className="public-form-input"
                      />
                    </div>

                    <div className="public-form-field">
                      <label className="public-form-label">Profesión / Especialidad</label>
                      <input
                        type="text"
                        placeholder="Ej. Ingeniero Civil, Topógrafo, Arquitecto..."
                        value={formData.profesion}
                        onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                        className="public-form-input"
                      />
                    </div>
                  </div>

                  <div className="public-form-grid-2">
                    <div className="public-form-field">
                      <label className="public-form-label">Años de Experiencia en Construcción</label>
                      <select
                        value={formData.experienciaAnios}
                        onChange={(e) => setFormData({ ...formData, experienciaAnios: e.target.value })}
                        className="public-form-select"
                      >
                        <option value="1 a 2 años">1 a 2 años</option>
                        <option value="3 a 5 años">3 a 5 años</option>
                        <option value="6 a 9 años">6 a 9 años</option>
                        <option value="10+ años">10+ años (Senior / Especialista)</option>
                      </select>
                    </div>

                    <div className="public-form-field">
                      <label className="public-form-label">Modalidad de Jornada</label>
                      <select
                        value={formData.tipoJornada}
                        onChange={(e) => setFormData({ ...formData, tipoJornada: e.target.value })}
                        className="public-form-select"
                      >
                        <option value="Tiempo Completo">Tiempo Completo en Frente de Obra</option>
                        <option value="Por Proyecto">Por Contrato de Proyecto</option>
                        <option value="Medio Tiempo">Medio Tiempo</option>
                      </select>
                    </div>
                  </div>

                  <div className="public-form-field">
                    <label className="public-form-label">
                      Resumen o Extracto Profesional <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe brevemente tus años de experiencia, tipo de obras en las que has participado (edificación vertical, naves, vialidades) y tus fortalezas clave..."
                      value={formData.perfilProfesional}
                      onChange={(e) => setFormData({ ...formData, perfilProfesional: e.target.value })}
                      className={`public-form-textarea ${errors.perfilProfesional ? 'has-error' : ''}`}
                    />
                    {errors.perfilProfesional && <span className="public-form-error">{errors.perfilProfesional}</span>}
                  </div>
                </div>
              )}

              {/* BLOQUE 3: EXPERIENCIA LABORAL */}
              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--accent-amber, #f59e0b)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={16} /> Experiencia en Obras o Empresas Anteriores
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
                        Registra tus posiciones más relevantes en el sector de la construcción
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> Agregar otra
                    </button>
                  </div>

                  {errors.experiencia && (
                    <div className="public-form-error" style={{ marginBottom: '8px' }}>{errors.experiencia}</div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formData.experiencias.map((exp, idx) => (
                      <div key={idx} className="public-dynamic-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-amber, #f59e0b)' }}>
                            Posición #{idx + 1}
                          </span>
                          {formData.experiencias.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExperience(idx)}
                              className="btn-icon"
                              style={{ color: 'var(--color-danger, #ef4444)' }}
                              title="Eliminar experiencia"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        <div className="public-form-grid-2">
                          <input
                            type="text"
                            placeholder="Puesto desempeñado *"
                            value={exp.puesto}
                            onChange={(e) => updateExperience(idx, 'puesto', e.target.value)}
                            className="public-form-input"
                          />
                          <input
                            type="text"
                            placeholder="Empresa o Constructora *"
                            value={exp.empresa}
                            onChange={(e) => updateExperience(idx, 'empresa', e.target.value)}
                            className="public-form-input"
                          />
                        </div>

                        <div className="public-form-grid-2" style={{ marginTop: '8px' }}>
                          <input
                            type="text"
                            placeholder="Inicio (ej. 2022 o Ene 2022)"
                            value={exp.fechaInicio}
                            onChange={(e) => updateExperience(idx, 'fechaInicio', e.target.value)}
                            className="public-form-input"
                          />
                          <input
                            type="text"
                            placeholder="Término (ej. 2025 o Actual)"
                            value={exp.fechaFin}
                            onChange={(e) => updateExperience(idx, 'fechaFin', e.target.value)}
                            className="public-form-input"
                          />
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Responsabilidades y tareas clave en la obra..."
                          value={exp.responsabilidades}
                          onChange={(e) => updateExperience(idx, 'responsabilidades', e.target.value)}
                          className="public-form-textarea"
                          style={{ marginTop: '8px' }}
                        />

                        <input
                          type="text"
                          placeholder="Referencia o contacto en la empresa (opcional: Nombre / Teléfono)"
                          value={exp.referenciaContacto}
                          onChange={(e) => updateExperience(idx, 'referenciaContacto', e.target.value)}
                          className="public-form-input"
                          style={{ marginTop: '8px', fontSize: '0.84rem' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BLOQUE 4: FORMACIÓN Y HABILIDADES */}
              {currentStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Formación */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--accent-amber, #f59e0b)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GraduationCap size={16} /> Formación Académica
                      </h4>
                      <button
                        type="button"
                        onClick={addEducation}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Agregar estudio
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {formData.formacion.map((edu, idx) => (
                        <div key={idx} className="public-dynamic-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>Grado #{idx + 1}</span>
                            {formData.formacion.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEducation(idx)}
                                className="btn-icon"
                                style={{ color: 'var(--color-danger, #ef4444)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className="public-form-grid-3">
                            <input
                              type="text"
                              placeholder="Título (ej. Ingeniería Civil)"
                              value={edu.titulo}
                              onChange={(e) => updateEducation(idx, 'titulo', e.target.value)}
                              className="public-form-input"
                            />
                            <input
                              type="text"
                              placeholder="Institución Educativa"
                              value={edu.institucion}
                              onChange={(e) => updateEducation(idx, 'institucion', e.target.value)}
                              className="public-form-input"
                            />
                            <input
                              type="text"
                              placeholder="Año egreso (ej. 2021)"
                              value={edu.anio}
                              onChange={(e) => updateEducation(idx, 'anio', e.target.value)}
                              className="public-form-input"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Habilidades */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--accent-amber, #f59e0b)' }}>
                      Habilidades Técnicas y Destrezas Operativas
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Ej. Control de Bitácora, AutoCAD, Revit, Cimentaciones..."
                        value={formData.habilidadesInput}
                        onChange={(e) => setFormData({ ...formData, habilidadesInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        className="public-form-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="btn btn-outline"
                        style={{ padding: '0 16px' }}
                      >
                        Agregar
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {formData.habilidades.map((skill, idx) => (
                        <span key={idx} className="public-skill-tag">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="public-skill-tag-del"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOQUE 5: CERTIFICACIONES Y DOCUMENTOS */}
              {currentStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Certificaciones */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--accent-amber, #f59e0b)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} /> Certificaciones Oficiales, STPS / DC-3 o Licencias
                      </h4>
                      <button
                        type="button"
                        onClick={addCertification}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Agregar
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formData.certificaciones.map((cert, idx) => (
                        <div key={idx} className="public-form-grid-3">
                          <input
                            type="text"
                            placeholder="Nombre certificación / curso"
                            value={cert.titulo}
                            onChange={(e) => updateCertification(idx, 'titulo', e.target.value)}
                            className="public-form-input"
                          />
                          <input
                            type="text"
                            placeholder="Entidad emisora"
                            value={cert.institucion}
                            onChange={(e) => updateCertification(idx, 'institucion', e.target.value)}
                            className="public-form-input"
                          />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              placeholder="Año"
                              value={cert.anio}
                              onChange={(e) => updateCertification(idx, 'anio', e.target.value)}
                              className="public-form-input"
                            />
                            {formData.certificaciones.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCertification(idx)}
                                className="btn-icon"
                                style={{ color: 'var(--color-danger, #ef4444)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <div className="public-upload-zone">
                      <input
                        type="file"
                        id="public-cv-upload"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="public-cv-upload" className="public-upload-label">
                        <div className="public-upload-icon-circle">
                          <Upload size={26} />
                        </div>
                        <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem', color: '#ffffff' }}>
                          Arrastra tus documentos aquí o haz clic para seleccionar
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
                          Formatos aceptados: PDF, JPG, JPEG, PNG, DOCX (Máx. 15MB por archivo).
                        </p>
                        <span className="btn btn-outline btn-sm" style={{ marginTop: '12px', pointerEvents: 'none' }}>
                          Seleccionar archivos de tu equipo
                        </span>
                      </label>
                    </div>

                    {/* Attached list */}
                    <div style={{ marginTop: '12px' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        Archivos anexados ({formData.documentos.length})
                      </h5>

                      {formData.documentos.length === 0 ? (
                        <div className="public-empty-docs-box">
                          <FileText size={20} style={{ color: 'var(--text-muted, #94a3b8)' }} />
                          <span>Aún no has adjuntado archivos. Puedes anexar tu CV en formato PDF.</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {formData.documentos.map((doc) => (
                            <div key={doc.id} className="public-attached-doc-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={18} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                                <div>
                                  <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>{doc.nombre}</strong>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                                    {doc.categoria} • {doc.tamanio} • {doc.fecha}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(doc.id)}
                                className="btn-icon"
                                style={{ color: 'var(--color-danger, #ef4444)' }}
                                title="Remover archivo"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOQUE 6: REVISIÓN PREVIA AL ENVÍO */}
              {currentStep === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="public-review-summary-box">
                    {/* Header Datos Personales */}
                    <div className="public-review-section">
                      <div className="public-review-section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                          <h4 className="public-review-title">1. Datos Personales</h4>
                        </div>
                        <button
                          type="button"
                          className="public-btn-edit-step"
                          onClick={() => setCurrentStep(1)}
                        >
                          Editar
                        </button>
                      </div>
                      <div className="public-review-grid">
                        <div>
                          <span className="public-review-k">Candidato:</span>
                          <span className="public-review-v">{formData.nombre || '—'}</span>
                        </div>
                        <div>
                          <span className="public-review-k">Identificación / DNI:</span>
                          <span className="public-review-v">{formData.dni || '—'}</span>
                        </div>
                        <div>
                          <span className="public-review-k">Correo Electrónico:</span>
                          <span className="public-review-v">{formData.email || '—'}</span>
                        </div>
                        <div>
                          <span className="public-review-k">Teléfono:</span>
                          <span className="public-review-v">{formData.telefono || '—'}</span>
                        </div>
                        <div>
                          <span className="public-review-k">Ubicación:</span>
                          <span className="public-review-v">{formData.ubicacion || '—'}</span>
                        </div>
                        <div>
                          <span className="public-review-k">Disponibilidad:</span>
                          <span className="public-review-v" style={{ color: 'var(--accent-emerald, #10b981)' }}>
                            {formData.disponibilidad}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Header Perfil */}
                    <div className="public-review-section">
                      <div className="public-review-section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Briefcase size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                          <h4 className="public-review-title">2. Perfil Profesional</h4>
                        </div>
                        <button
                          type="button"
                          className="public-btn-edit-step"
                          onClick={() => setCurrentStep(2)}
                        >
                          Editar
                        </button>
                      </div>
                      <div className="public-review-grid">
                        <div>
                          <span className="public-review-k">Puesto Solicitado:</span>
                          <span className="public-review-v" style={{ color: 'var(--accent-amber, #f59e0b)', fontWeight: 600 }}>
                            {formData.puestoSolicitado}
                          </span>
                        </div>
                        <div>
                          <span className="public-review-k">Profesión / Especialidad:</span>
                          <span className="public-review-v">{formData.profesion}</span>
                        </div>
                        <div>
                          <span className="public-review-k">Experiencia Total:</span>
                          <span className="public-review-v">{formData.experienciaAnios}</span>
                        </div>
                        <div>
                          <span className="public-review-k">Jornada:</span>
                          <span className="public-review-v">{formData.tipoJornada}</span>
                        </div>
                      </div>
                      {formData.perfilProfesional && (
                        <div style={{ marginTop: '8px', fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                          "{formData.perfilProfesional}"
                        </div>
                      )}
                    </div>

                    {/* Header Experiencia */}
                    <div className="public-review-section">
                      <div className="public-review-section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Briefcase size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                          <h4 className="public-review-title">3. Experiencia Laboral ({formData.experiencias.filter(e => e.puesto || e.empresa).length})</h4>
                        </div>
                        <button
                          type="button"
                          className="public-btn-edit-step"
                          onClick={() => setCurrentStep(3)}
                        >
                          Editar
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {formData.experiencias.filter(e => e.puesto || e.empresa).length === 0 ? (
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)' }}>No se especificaron experiencias adicionales.</span>
                        ) : (
                          formData.experiencias.filter(e => e.puesto || e.empresa).map((exp, idx) => (
                            <div key={idx} style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)' }}>
                              <strong style={{ color: '#ffffff' }}>{exp.puesto}</strong> en {exp.empresa} {exp.fechaInicio ? `(${exp.fechaInicio} - ${exp.fechaFin || 'Actual'})` : ''}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Header Formación y Habilidades */}
                    <div className="public-review-section">
                      <div className="public-review-section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GraduationCap size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                          <h4 className="public-review-title">4. Formación y Habilidades</h4>
                        </div>
                        <button
                          type="button"
                          className="public-btn-edit-step"
                          onClick={() => setCurrentStep(4)}
                        >
                          Editar
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {formData.habilidades.map((h, idx) => (
                          <span key={idx} className="public-skill-tag" style={{ fontSize: '0.78rem', padding: '3px 8px' }}>
                            {h}
                          </span>
                        ))}
                      </div>
                      {formData.formacion.filter(f => f.titulo).map((f, idx) => (
                        <div key={idx} style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)' }}>
                          <strong style={{ color: '#ffffff' }}>{f.titulo}</strong> — {f.institucion} {f.anio ? `(${f.anio})` : ''}
                        </div>
                      ))}
                    </div>

                    {/* Header Documentos */}
                    <div className="public-review-section" style={{ borderBottom: 'none' }}>
                      <div className="public-review-section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
                          <h4 className="public-review-title">5. Documentos Anexados ({formData.documentos.length})</h4>
                        </div>
                        <button
                          type="button"
                          className="public-btn-edit-step"
                          onClick={() => setCurrentStep(5)}
                        >
                          Editar
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {formData.documentos.length === 0 ? (
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)' }}>
                            Se generará y vinculará la ficha curricular automáticamente.
                          </span>
                        ) : (
                          formData.documentos.map((d) => (
                            <div key={d.id} className="public-attached-doc-row" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                              <span>{d.nombre} ({d.tamanio})</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.55' }}>
                    Al confirmar y enviar esta solicitud, tus datos y expediente curricular único se remitirán directamente a la gerencia de Recursos Humanos de CONSTRUCTA para su evaluación técnica en los procesos de selección activos.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handlePrev}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ArrowLeft size={14} /> Anterior
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleResetAndClose}
                >
                  Cancelar
                </button>

                {currentStep < 6 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Siguiente <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={15} /> Confirmar y Enviar Postulación
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
