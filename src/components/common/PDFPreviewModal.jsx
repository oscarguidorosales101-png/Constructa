import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, AlertTriangle, X, ShieldCheck, Printer, Clock } from 'lucide-react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

/**
 * Modal de Vista Previa y Descarga de Documentos PDF
 * Implementa el flujo: Preparar -> Generar -> Vista Previa -> Confirmar -> Descargar
 */
export const PDFPreviewModal = ({
  isOpen,
  onClose,
  pdfResult, // { ok: true, preview: {...}, doc, filename }
  onDownloaded,
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setIsDownloading(false);
      const timer = setTimeout(() => {
        setIsGenerating(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!pdfResult || !pdfResult.ok) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error en Generación" maxWidth="500px">
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <AlertTriangle size={42} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No hay información suficiente</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
            {pdfResult?.error || 'No fue posible estructurar los datos para emitir este documento oficial.'}
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const { preview, doc, filename } = pdfResult;

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      try {
        if (doc && doc.save) {
          doc.save(filename || 'CONSTRUCTA_Documento_Oficial.pdf');
        }
        if (onDownloaded) {
          onDownloaded(filename);
        }
      } catch (err) {
        console.error('Error al descargar PDF:', err);
      } finally {
        setIsDownloading(false);
        onClose();
      }
    }, 200);
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
        <ShieldCheck size={16} color="#10b981" />
        <span>Documento certificado con validez técnica oficial</span>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button variant="secondary" onClick={onClose} disabled={isDownloading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          icon={<Download size={16} />}
          onClick={handleDownload}
          disabled={isDownloading || isGenerating}
        >
          {isDownloading ? 'Descargando...' : 'Descargar PDF Oficial'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vista Previa del Documento"
      maxWidth="820px"
      footer={footer}
    >
      {isGenerating ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '3px solid rgba(245, 158, 11, 0.2)',
              borderTop: '3px solid var(--color-gold)',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <h4 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '1.05rem' }}>Generando documento oficial...</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
            Estructurando partidas técnicas, tablas financieras y firmas autorizadas de CONSTRUCTA.
          </p>
        </div>
      ) : (
        <div className="pdf-preview-sheet" style={{ background: '#0b1120', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          {/* Encabezado Documento */}
          <div style={{ background: '#0f172a', padding: '1.25rem 1.5rem', borderBottom: '2px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.05em' }}>
                  CONSTRUCTA
                </span>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  OFICIAL
                </span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '2px' }}>
                SISTEMA INTEGRAL DE GESTIÓN Y SUPERVISIÓN DE OBRA
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <div><strong style={{ color: '#ffffff' }}>FOLIO:</strong> <span style={{ fontFamily: 'monospace', color: '#f59e0b' }}>{preview.folio}</span></div>
              <div style={{ marginTop: '2px' }}><strong>EMISIÓN:</strong> {preview.fecha}</div>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Título Principal */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {preview.tipo}
              </span>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: '3px 0 6px 0', fontWeight: 800 }}>
                {preview.titulo}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
                {preview.subtitulo}
              </p>
            </div>

            {/* Metadatos en dos columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Proyecto */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Datos de la Obra / Solicitud
                </span>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong style={{ color: '#ffffff' }}>Código:</strong> {preview.proyecto.codigo}</div>
                  <div><strong style={{ color: '#ffffff' }}>Ubicación:</strong> {preview.proyecto.ubicacion}</div>
                  <div><strong style={{ color: '#ffffff' }}>Director:</strong> {preview.proyecto.director}</div>
                  <div><strong style={{ color: '#ffffff' }}>Avance Físico:</strong> {preview.proyecto.avanceFisico}</div>
                </div>
              </div>

              {/* Cliente */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Datos del Cliente Propietario
                </span>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong style={{ color: '#ffffff' }}>Titular:</strong> {preview.cliente.nombre}</div>
                  <div><strong style={{ color: '#ffffff' }}>Empresa:</strong> {preview.cliente.empresa}</div>
                  <div><strong style={{ color: '#ffffff' }}>Email:</strong> {preview.cliente.email}</div>
                  <div><strong style={{ color: '#ffffff' }}>Teléfono:</strong> {preview.cliente.telefono}</div>
                </div>
              </div>
            </div>

            {/* Tabla de Conceptos */}
            <div style={{ marginBottom: '1.25rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    {preview.tabla.columnas.map((col, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: '8px 10px',
                          textAlign: idx >= 2 ? 'right' : 'left',
                          color: '#f59e0b',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.tabla.filas.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: i % 2 === 1 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '8px 10px',
                            textAlign: cIdx >= 2 ? 'right' : 'left',
                            color: cIdx === 0 ? '#ffffff' : '#cbd5e1',
                            fontWeight: cIdx === 0 ? 600 : 400,
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales y Resumen */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <div
                style={{
                  minWidth: '280px',
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                }}
              >
                {preview.resumenFinanciero.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      padding: '3px 0',
                      borderTop: i === preview.resumenFinanciero.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                      marginTop: i === preview.resumenFinanciero.length - 1 ? '4px' : '0',
                    }}
                  >
                    <span style={{ color: i === preview.resumenFinanciero.length - 1 ? '#ffffff' : '#94a3b8', fontWeight: i === preview.resumenFinanciero.length - 1 ? 700 : 400 }}>
                      {item.label}:
                    </span>
                    <strong style={{ color: i === preview.resumenFinanciero.length - 1 ? '#f59e0b' : '#ffffff', fontSize: i === preview.resumenFinanciero.length - 1 ? '0.92rem' : '0.82rem' }}>
                      {item.valor}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Observaciones Legales */}
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', borderLeft: '3px solid #f59e0b', paddingLeft: '10px', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              <strong>Términos y Condiciones:</strong> {preview.observaciones}
            </div>

            {/* Firmas Autorizadas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {preview.firmas.map((f, i) => (
                <div key={i}>
                  <div style={{ width: '160px', height: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 auto 6px' }} />
                  <div style={{ color: '#ffffff', fontSize: '0.82rem', fontWeight: 700 }}>{f.nombre}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{f.cargo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PDFPreviewModal;
