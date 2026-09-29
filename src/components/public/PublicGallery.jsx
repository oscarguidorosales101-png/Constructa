import React, { useState, useEffect } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import { Image, Maximize2, X, ChevronLeft, ChevronRight, MapPin, Tag } from 'lucide-react';

export default function PublicGallery({ config = COMPANY_CONFIG }) {
  const { gallery } = config;
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Extract distinct categories
  const categories = ['Todas', ...new Set(gallery.map((g) => g.category))];

  const filteredGallery = activeCategory === 'Todas'
    ? gallery
    : gallery.filter((g) => g.category === activeCategory);

  // Lightbox keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') setSelectedImageIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex]);

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : filteredGallery.length - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev < filteredGallery.length - 1 ? prev + 1 : 0));
  };

  const currentItem = selectedImageIndex !== null ? filteredGallery[selectedImageIndex] : null;

  return (
    <section id="galeria" className="public-section public-gallery-section">
      <div className="public-container">
        {/* Section Header */}
        <div className="public-section-header">
          <span className="public-section-badge">
            <Image size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Registro Fotográfico
          </span>
          <h2 className="public-section-title">Galería Visual de Frentes de Obra</h2>
          <p className="public-section-subtitle">
            Evidencia fotográfica de los procesos constructivos, supervisión estructural y acabados de nuestras obras.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="public-gallery-filter-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`public-gallery-filter-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <div className="public-gallery-grid">
          {filteredGallery.map((item, idx) => (
            <div
              key={item.id}
              className="public-gallery-card"
              onClick={() => setSelectedImageIndex(idx)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="public-gallery-img"
                loading="lazy"
              />
              <div className="public-gallery-card-overlay">
                <span className="public-gallery-card-tag">{item.category}</span>
                <h4 className="public-gallery-card-title">{item.title}</h4>
                <div className="public-gallery-card-meta">
                  <MapPin size={13} style={{ color: 'var(--color-gold)' }} />
                  <span>{item.location}</span>
                </div>
                <div className="public-gallery-card-zoom-icon">
                  <Maximize2 size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {currentItem && (
        <div className="public-lightbox-overlay" onClick={() => setSelectedImageIndex(null)}>
          <div className="public-lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              className="public-lightbox-close"
              onClick={() => setSelectedImageIndex(null)}
              aria-label="Cerrar vista ampliada"
            >
              <X size={22} />
            </button>

            {/* Nav Arrows */}
            <button
              type="button"
              className="public-lightbox-nav prev"
              onClick={handlePrev}
              aria-label="Fotografía anterior"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className="public-lightbox-nav next"
              onClick={handleNext}
              aria-label="Siguiente fotografía"
            >
              <ChevronRight size={28} />
            </button>

            {/* Main Visual */}
            <div className="public-lightbox-img-wrap">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="public-lightbox-img"
              />
            </div>

            {/* Caption Bar */}
            <div className="public-lightbox-caption">
              <div className="public-lightbox-tags">
                <span className="public-lightbox-category">{currentItem.category}</span>
                <span className="public-lightbox-counter">
                  {selectedImageIndex + 1} de {filteredGallery.length}
                </span>
              </div>
              <h3 className="public-lightbox-title">{currentItem.title}</h3>
              <p className="public-lightbox-desc">{currentItem.description}</p>
              <div className="public-lightbox-loc">
                <MapPin size={14} style={{ color: 'var(--color-gold)' }} />
                <span>{currentItem.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
