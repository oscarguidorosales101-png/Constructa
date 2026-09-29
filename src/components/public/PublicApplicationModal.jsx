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
  ArrowLeft
} from 'lucide-react';

export default function PublicApplicationModal({ vacancy, isOpen, onClose }) {
  const { saveApplicant } = useConstructa();

  // Multi-step tab state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdApplicantId, setCreatedApplicantId] = useState('');
  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ubicacion: '',
    puestoSolicitado: vacancy?.puesto || '',
    area: vacancy?.area || 'Operaciones en Obra',
    disponibilidad: 'Inmediata',
    tipoJornada: vacancy?.tipoJornada || 'Tiempo Completo',
    perfilProfesional: '',
    experiencias: [
      {
        puesto: '',
        empresa: '',
        fechaInicio: '',
        fechaFin: '',
        responsabilidades: ''
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
    habilidades: ['Supervisión de Obra', 'Interpretación de Planos'],
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
      if (!formData.nombre.trim()) newErrors.nombre = 'El nombre completo es obligatorio.';
      if (!formData.email.trim()) {
        newErrors.email = 'El correo electrónico es obligatorio.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Ingresa un correo electrónico con formato válido.';
      }
      if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono de contacto es obligatorio.';
      if (!formData.ubicacion.trim()) newErrors.ubicacion = 'La ciudad o residencia es obligatoria.';
    }

    if (step === 2) {
      if (!formData.perfilProfesional.trim()) {
        newErrors.perfilProfesional = 'Por favor redacta un breve resumen de tu perfil profesional.';
      }
      if (formData.experiencias.length > 0) {
        const first = formData.experiencias[0];
        if (!first.puesto.trim() || !first.empresa.trim()) {
          newErrors.experiencia = 'Indica al menos el puesto y la empresa de tu experiencia principal.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
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
        { puesto: '', empresa: '', fechaInicio: '', fechaFin: '', responsabilidades: '' }
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

    const newDocs = files.map((file) => ({
      id: 'DOC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      nombre: file.name,
      tipo: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENTO',
      tamanio: `${(file.size / 1024).toFixed(1)} KB`,
      fecha: new Date().toISOString().split('T')[0],
      categoria: file.name.toLowerCase().includes('cv') ? 'Currículum Vitae' : 'Certificado / Anexo'
    }));

    setFormData((prev) => ({
      ...prev,
      documentos: [...prev.documentos, ...newDocs]
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
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    // Clean data payload for saveApplicant
    const cleanExperiencias = formData.experiencias.filter((e) => e.puesto || e.empresa);
    const cleanFormacion = formData.formacion.filter((f) => f.titulo || f.institucion);
    const cleanCertificaciones = formData.certificaciones.filter((c) => c.titulo);

    // Calculate approximate experience years
    const expYears = Math.max(cleanExperiencias.length * 2, 2);

    const payload = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      ubicacion: formData.ubicacion.trim(),
      puestoSolicitado: formData.puestoSolicitado || vacancy?.puesto || 'Puesto Operativo',
      area: formData.area || vacancy?.area || 'Operaciones en Obra',
      disponibilidad: formData.disponibilidad,
      tipoJornada: formData.tipoJornada,
      experienciaAnios: expYears,
      perfilProfesional: formData.perfilProfesional.trim(),
      experiencias: cleanExperiencias,
      formacion: cleanFormacion,
      habilidades: formData.habilidades,
      certificaciones: cleanCertificaciones,
      documentos: formData.documentos,
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
        style={{ maxWidth: '800px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
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
            style={{ color: 'var(--color-text-muted)' }}
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
                color: 'var(--color-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 10px 0' }}>
              Postulación recibida
            </h3>

            <p style={{ maxWidth: '520px', margin: '0 auto 18px auto', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.65' }}>
              Hemos recibido tu información y expediente curricular correctamente. Nuestro equipo de Recursos Humanos revisará tu perfil y continuará el proceso de selección cuando corresponda.
            </p>

            {createdApplicantId && (
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border)',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.86rem',
                  color: 'var(--color-gold)',
                  marginBottom: '24px'
                }}
              >
                Folio de seguimiento: <strong>{createdApplicantId}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                className="public-btn public-btn-primary"
                onClick={handleResetAndClose}
              >
                Finalizar y regresar al sitio
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step Indicator */}
            <div className="public-steps-nav">
              {[
                { num: 1, label: 'Datos Personales' },
                { num: 2, label: 'Perfil y Experiencia' },
                { num: 3, label: 'Formación y Habilidades' },
                { num: 4, label: 'Documentos' }
              ].map((step) => (
                <div
                  key={step.num}
                  className={`public-step-item ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                  onClick={() => {
                    if (step.num < currentStep || validateStep(currentStep)) {
                      setCurrentStep(step.num);
                    }
                  }}
                >
                  <div className="public-step-number">
                    {currentStep > step.num ? <CheckCircle2 size={13} /> : step.num}
                  </div>
                  <span className="public-step-name">{step.label}</span>
                </div>
              ))}
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* STEP 1: INFORMACIÓN PERSONAL */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="public-form-grid-2">
                    <div className="public-form-field">
                      <label className="public-form-label">
                        Nombre completo <span style={{ color: 'var(--color-danger)' }}>*</span>
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
                        Correo electrónico <span style={{ color: 'var(--color-danger)' }}>*</span>
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
                  </div>

                  <div className="public-form-grid-2">
                    <div className="public-form-field">
                      <label className="public-form-label">
                        Teléfono / WhatsApp <span style={{ color: 'var(--color-danger)' }}>*</span>
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

                    <div className="public-form-field">
                      <label className="public-form-label">
                        Ciudad / Ubicación de residencia <span style={{ color: 'var(--color-danger)' }}>*</span>
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
                  </div>

                  <div className="public-form-grid-2">
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

                    <div className="public-form-field">
                      <label className="public-form-label">Modalidad de Jornada Deseada</label>
                      <select
                        value={formData.tipoJornada}
                        onChange={(e) => setFormData({ ...formData, tipoJornada: e.target.value })}
                        className="public-form-select"
                      >
                        <option value="Tiempo Completo">Tiempo Completo en Obra</option>
                        <option value="Por Proyecto">Por Contrato de Proyecto</option>
                        <option value="Medio Tiempo">Medio Tiempo</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PERFIL PROFESIONAL Y EXPERIENCIA */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div className="public-form-field">
                    <label className="public-form-label">
                      Resumen o Extracto Profesional <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe brevemente tus años de experiencia, especialidad (edificación, obra civil, acabados) y fortalezas profesionales..."
                      value={formData.perfilProfesional}
                      onChange={(e) => setFormData({ ...formData, perfilProfesional: e.target.value })}
                      className={`public-form-textarea ${errors.perfilProfesional ? 'has-error' : ''}`}
                    />
                    {errors.perfilProfesional && <span className="public-form-error">{errors.perfilProfesional}</span>}
                  </div>

                  {/* Multiple Experience Items */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={16} /> Experiencia Laboral en Obra o Proyectos
                      </h4>
                      <button
                        type="button"
                        onClick={addExperience}
                        className="public-btn-sm-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Agregar otra experiencia
                      </button>
                    </div>

                    {errors.experiencia && (
                      <div className="public-form-error" style={{ marginBottom: '10px' }}>{errors.experiencia}</div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {formData.experiencias.map((exp, idx) => (
                        <div key={idx} className="public-dynamic-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                              Experiencia #{idx + 1}
                            </span>
                            {formData.experiencias.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperience(idx)}
                                className="btn-icon"
                                style={{ color: 'var(--color-danger)' }}
                                title="Eliminar experiencia"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          <div className="public-form-grid-2">
                            <input
                              type="text"
                              placeholder="Puesto o Cargo desempeñado *"
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
                              placeholder="Periodo inicio (ej. 2022 o Ene 2022)"
                              value={exp.fechaInicio}
                              onChange={(e) => updateExperience(idx, 'fechaInicio', e.target.value)}
                              className="public-form-input"
                            />
                            <input
                              type="text"
                              placeholder="Periodo término (ej. 2025 o Actual)"
                              value={exp.fechaFin}
                              onChange={(e) => updateExperience(idx, 'fechaFin', e.target.value)}
                              className="public-form-input"
                            />
                          </div>

                          <textarea
                            rows={2}
                            placeholder="Principales responsabilidades, tipo de obra y resultados..."
                            value={exp.responsabilidades}
                            onChange={(e) => updateExperience(idx, 'responsabilidades', e.target.value)}
                            className="public-form-textarea"
                            style={{ marginTop: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: FORMACIÓN, HABILIDADES Y CERTIFICACIONES */}
              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Education */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GraduationCap size={16} /> Formación Académica
                      </h4>
                      <button
                        type="button"
                        onClick={addEducation}
                        className="public-btn-sm-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Agregar estudio
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {formData.formacion.map((edu, idx) => (
                        <div key={idx} className="public-dynamic-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Grado #{idx + 1}</span>
                            {formData.formacion.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEducation(idx)}
                                className="btn-icon"
                                style={{ color: 'var(--color-danger)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className="public-form-grid-3">
                            <input
                              type="text"
                              placeholder="Título o Carrera (ej. Ingeniería Civil)"
                              value={edu.titulo}
                              onChange={(e) => updateEducation(idx, 'titulo', e.target.value)}
                              className="public-form-input"
                            />
                            <input
                              type="text"
                              placeholder="Institución o Universidad"
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

                  {/* Skills tags */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--color-gold)' }}>
                      Habilidades y Competencias Técnicas
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Ej. Control de Bitácora, AutoCAD, Cimentaciones..."
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
                      <button type="button" onClick={addSkill} className="public-btn public-btn-outline" style={{ padding: '0 16px' }}>
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

                  {/* Certifications */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} /> Certificaciones Oficiales o DC-3
                      </h4>
                      <button
                        type="button"
                        onClick={addCertification}
                        className="public-btn-sm-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Agregar certificación
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formData.certificaciones.map((cert, idx) => (
                        <div key={idx} className="public-form-grid-3">
                          <input
                            type="text"
                            placeholder="Nombre del curso / certificación"
                            value={cert.titulo}
                            onChange={(e) => updateCertification(idx, 'titulo', e.target.value)}
                            className="public-form-input"
                          />
                          <input
                            type="text"
                            placeholder="Entidad emisora / STPS"
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
                                style={{ color: 'var(--color-danger)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENTOS Y CV */}
              {currentStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                        <Upload size={28} />
                      </div>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                        Selecciona o arrastra tu Currículum Vitae y documentos
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        Formatos aceptados: PDF, JPG, PNG, DOCX (Máx. 15MB por archivo).
                      </p>
                      <span className="public-btn public-btn-outline" style={{ marginTop: '12px', pointerEvents: 'none' }}>
                        Examinar archivos en tu equipo
                      </span>
                    </label>
                  </div>

                  {/* Attached Documents List */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                      Documentos anexados ({formData.documentos.length})
                    </h4>

                    {formData.documentos.length === 0 ? (
                      <div className="public-empty-docs-box">
                        <FileText size={22} style={{ color: 'var(--color-text-muted)' }} />
                        <span>Aún no has adjuntado archivos. Puedes anexar tu CV en formato PDF.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formData.documentos.map((doc) => (
                          <div key={doc.id} className="public-attached-doc-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FileText size={18} style={{ color: 'var(--color-gold)' }} />
                              <div>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                                  {doc.nombre}
                                </strong>
                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                  {doc.categoria} • {doc.tamanio} • {doc.fecha}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(doc.id)}
                              className="btn-icon"
                              style={{ color: 'var(--color-danger)' }}
                              title="Remover archivo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    className="public-btn public-btn-outline"
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
                  className="public-btn public-btn-outline"
                  onClick={handleResetAndClose}
                >
                  Cancelar
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    className="public-btn public-btn-primary"
                    onClick={handleNext}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Siguiente <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="public-btn public-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} /> Enviar Postulación
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
