// ProjectsPage.js
import React, { useState, useEffect } from 'react';
import './Project.css';
import './Workspace.css'; // shared tokens (colors, ws-btn, ws-input)
import WsModal from './Modal';
import MobileWarning from './MobileWarning';
import { useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem('Projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects).map(project => ({
        ...project,
        created: new Date(project.created),
        modified: new Date(project.modified),
      }));
      setProjects(parsedProjects);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('Projects', JSON.stringify(projects));
    }
  }, [projects]);

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setProjectName('');
    setNameError('');
    setSelectedProjectIndex(null);
  };

  const handleAddProject = () => {
    const trimmed = projectName.trim();
    if (!trimmed) {
      setNameError('Enter a project name.');
      return;
    }
    if (projects.some(project => project.name === trimmed)) {
      setNameError('A project with this name already exists.');
      return;
    }
    const newProject = { name: trimmed, created: new Date(), modified: new Date() };
    setProjects([...projects, newProject]);
    closeProjectModal();
  };

  const handleDeleteProject = () => {
    const deleteName = projects[deleteIndex].name;
    localStorage.removeItem(`${deleteName}Entries`);
    localStorage.removeItem(`${deleteName}Divs`);
    const updatedProjectList = projects.filter((_, index) => index !== deleteIndex);
    setProjects(updatedProjectList);
    localStorage.setItem('Projects', JSON.stringify(updatedProjectList));
    setShowDeleteModal(false);
  };

  const openDeleteModal = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const openProject = (index) => {
    sessionStorage.setItem('project', projects[index].name);
    navigate('/Editor');
  };

  return (
    <div className="projects-page">
      <MobileWarning />

      <div className="projects-header">
        <div>
          <div className="brand"><span className="bracket">[</span>SRT Creator<span className="bracket">]</span></div>
          <div className="sub">{projects.length} project{projects.length === 1 ? '' : 's'}</div>
        </div>
        <button className="ws-btn primary" onClick={() => setShowProjectModal(true)}>+ New project</button>
      </div>

      {projects.length === 0 ? (
        <div className="projects-empty">
          <div className="headline">No projects yet</div>
          <div className="subline">Create a project to start timing subtitles.</div>
          <button className="ws-btn primary" onClick={() => setShowProjectModal(true)}>+ New project</button>
        </div>
      ) : (
        <div className="projects-container">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-placeholder">{project.name.charAt(0).toUpperCase()}</div>
              <div className="card-content">
                <div className="project-name">{project.name}</div>
                <div className="card-meta">Created {project.created.toLocaleDateString()}</div>
                <div className="card-meta">Modified {project.modified.toLocaleDateString()}</div>
                <div className="card-actions">
                  <button className="ws-btn danger" onClick={() => openDeleteModal(index)}>Delete</button>
                  <button className="ws-btn primary" onClick={() => openProject(index)}>Open</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <WsModal show={showProjectModal} onClose={closeProjectModal} title="New project">
        <WsModal.Body>
          <div className="ws-form-group">
            <label>Project name</label>
            <input
              className="ws-input"
              value={projectName}
              onChange={(e) => { setProjectName(e.target.value); setNameError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddProject(); }}
              placeholder="e.g. episode_04"
              autoFocus
            />
            {nameError && <div className="ws-form-error">{nameError}</div>}
          </div>
        </WsModal.Body>
        <WsModal.Footer>
          <button className="ws-btn" onClick={closeProjectModal}>Cancel</button>
          <button className="ws-btn primary" onClick={handleAddProject}>Create project</button>
        </WsModal.Footer>
      </WsModal>

      {/* Delete Project Modal */}
      <WsModal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete project" tone="danger">
        <WsModal.Body>
          <p>
            Are you sure you want to delete{' '}
            <strong>{deleteIndex !== null ? projects[deleteIndex]?.name : 'this project'}</strong>? Its cues and video reference will be removed permanently.
          </p>
        </WsModal.Body>
        <WsModal.Footer>
          <button className="ws-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button className="ws-btn danger-solid" onClick={handleDeleteProject}>Delete</button>
        </WsModal.Footer>
      </WsModal>
    </div>
  );
};

export default ProjectsPage;