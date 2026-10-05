/**
 * CONSTRUCTA - projectService
 * Arquitectura: Componente -> projectService -> API (/api/projects) -> db.json
 * 
 * Gestiona la creación, actualización y baja de proyectos con persistencia real en db.json.
 */

import storageService from './storageService.js';
import dataService from './dataService.js';

const STORAGE_KEY = 'proyectos';

export const projectService = {
  /**
   * Obtiene todos los proyectos desde el backend simulado
   */
  async getProjects() {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const projects = await res.json();
        if (Array.isArray(projects)) {
          storageService.set(STORAGE_KEY, projects);
          return projects;
        }
      }
    } catch (_) {}
    return dataService.getProjects();
  },

  /**
   * Crea o actualiza un proyecto en el backend simulado (db.json)
   */
  async saveProject(projectData) {
    const isNew = !projectData.id;
    const url = isNew ? '/api/projects' : `/api/projects/${projectData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...projectData,
      nombre: (projectData.nombre || '').trim(),
      estado: projectData.estado || 'Planificación',
      progreso: Number(projectData.progreso) || 0
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        return {
          ok: false,
          error: 'No se pudo guardar la información. Verifica la conexión con el sistema.'
        };
      }

      const result = await res.json();
      const savedProject = result.project || result.data || payload;
      const updatedList = result.projects || (await this.getProjects());

      storageService.set(STORAGE_KEY, updatedList);

      return {
        ok: true,
        project: savedProject,
        projects: updatedList
      };
    } catch (err) {
      return {
        ok: false,
        error: 'No se pudo guardar la información. Verifica la conexión con el sistema.'
      };
    }
  },

  /**
   * Elimina un proyecto en el backend simulado (db.json)
   */
  async deleteProject(id) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        return {
          ok: false,
          error: 'No se pudo eliminar el proyecto. Verifica la conexión con el sistema.'
        };
      }

      const result = await res.json();
      const updatedList = result.projects || (await this.getProjects());
      storageService.set(STORAGE_KEY, updatedList);

      return {
        ok: true,
        projects: updatedList
      };
    } catch (err) {
      return {
        ok: false,
        error: 'No se pudo eliminar el proyecto. Verifica la conexión con el sistema.'
      };
    }
  }
};

export default projectService;
