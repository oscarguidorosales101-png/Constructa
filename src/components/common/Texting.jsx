import React, { useState, useEffect, useRef } from 'react';

/**
 * CONSTRUCTA - Componente Texting
 * Efecto de escritura progresiva letra por letra nativo sin librerías externas.
 * 
 * Propiedades:
 * - text (string): Texto completo a escribir
 * - speed (number): Milisegundos entre cada caracter (default: 35)
 * - cursor (boolean): Mostrar cursor parpadeante (default: true)
 * - delay (number): Milisegundos de espera antes de iniciar (default: 100)
 * - onComplete (function): Callback ejecutado al terminar la escritura
 * - className (string): Clases CSS adicionales
 */
export const Texting = ({
  text = '',
  speed = 35,
  cursor = true,
  delay = 100,
  onComplete,
  className = '',
  style = {}
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // 1. Detección de preferencia de reducción de movimiento del sistema o accesibilidad
    const prefersReducedMotion =
      (typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      document.documentElement.getAttribute('data-reduced-motion') === 'true';

    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsFinished(true);
      if (onComplete) onComplete();
      return;
    }

    // 2. Reiniciar estado al cambiar el texto
    setDisplayedText('');
    setIsFinished(false);
    setIsTyping(true);
    indexRef.current = 0;

    if (!text) {
      setIsTyping(false);
      setIsFinished(true);
      return;
    }

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayedText(text.slice(0, indexRef.current));
        timerRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    };

    // Iniciar después del delay inicial
    timerRef.current = setTimeout(typeNextChar, delay);

    // 3. Limpieza estricta de temporizadores al desmontar o cambiar dependencias
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, speed, delay]);

  return (
    <span
      className={`constructa-texting ${className}`}
      style={{
        display: 'inline',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...style
      }}
    >
      {displayedText}
      {cursor && !isFinished && (
        <span
          className="constructa-texting-cursor"
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1.1em',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
            backgroundColor: 'var(--accent-amber, #f59e0b)',
            animation: 'textingBlink 0.8s infinite'
          }}
        />
      )}
    </span>
  );
};

export default Texting;
