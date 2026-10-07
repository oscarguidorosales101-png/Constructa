import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from '../../components/common/SearchInput.jsx';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';
import { aiService, OUT_OF_SCOPE_RESPONSE, classifyQuestionRelevance } from '../../services/aiService.js';
import fs from 'fs';
import path from 'path';

describe('Auditoría Funcional y Visual Automatizada de CONSTRUCTA', () => {
  it('1. SearchInput: Permite escribir, borrar con botón X y emite strings limpios', () => {
    let capturedValue = '';
    const handleChange = vi.fn((val) => {
      capturedValue = val;
    });

    const { rerender } = render(
      <SearchInput
        value={capturedValue}
        onChange={handleChange}
        placeholder="Buscar obra..."
      />
    );

    const input = screen.getByPlaceholderText('Buscar obra...');
    expect(input).toBeDefined();

    // Escribir en el buscador
    fireEvent.change(input, { target: { value: 'Torre Altavista' } });
    expect(handleChange).toHaveBeenCalledWith('Torre Altavista', expect.anything());

    // Rerender con el nuevo valor
    rerender(
      <SearchInput
        value="Torre Altavista"
        onChange={handleChange}
        placeholder="Buscar obra..."
      />
    );

    // Botón de limpiar debe existir
    const clearBtn = screen.getByTitle('Limpiar búsqueda');
    expect(clearBtn).toBeDefined();

    // Click en botón de limpiar
    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith('', expect.anything());
  });

  it('2. Video Institucional: Configurado con el archivo audiovisual moderno', () => {
    expect(COMPANY_CONFIG.video.src).toBe('/video/CONSTRUCTA__Visión_Moderna.mp4');
    expect(COMPANY_CONFIG.video.mimeType).toBe('video/mp4');

    // Verificar existencia del archivo en el sistema de archivos
    const videoFilePath = path.resolve(process.cwd(), 'public/video/CONSTRUCTA__Visión_Moderna.mp4');
    expect(fs.existsSync(videoFilePath)).toBe(true);

    const stats = fs.statSync(videoFilePath);
    expect(stats.size).toBeGreaterThan(15 * 1024 * 1024); // Mayor a 15 MB
  });

  it('3. IA Restringida: Rechaza estrictamente consultas fuera del alcance de CONSTRUCTA', () => {
    const q1 = classifyQuestionRelevance('¿Quién es Goku?');
    expect(q1.isOutOfScope).toBe(true);

    const q2 = classifyQuestionRelevance('¿Cuál es la capital de Francia?');
    expect(q2.isOutOfScope).toBe(true);

    const q3 = classifyQuestionRelevance('Cuéntame un chiste');
    expect(q3.isOutOfScope).toBe(true);

    const q4 = classifyQuestionRelevance('¿Quién es la Bebita Vaca?');
    expect(q4.isOutOfScope).toBe(true);
  });

  it('4. IA Restringida: Aísla consultas híbridas y responde sólo la parte de CONSTRUCTA', () => {
    const mockProjects = [
      { id: 'PRJ-001', nombre: 'Torre Altavista Residencial', presupuesto: 4500000 }
    ];
    const qHybrid = classifyQuestionRelevance(
      '¿Quién es Goku y cuánto cuesta actualmente la obra Torre Altavista?',
      mockProjects
    );

    expect(qHybrid.isOutOfScope).toBe(false);
    expect(qHybrid.isHybrid).toBe(true);
    expect(qHybrid.activeQuery.toLowerCase()).toContain('torre altavista');
    expect(qHybrid.activeQuery.toLowerCase()).not.toContain('goku');
  });

  it('5. Cero emojis en SearchInput y archivos de componentes principales', () => {
    const searchInputSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/common/SearchInput.jsx'),
      'utf-8'
    );
    // Verificar que no contenga emojis comunes
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    expect(emojiRegex.test(searchInputSrc)).toBe(false);
  });
});
