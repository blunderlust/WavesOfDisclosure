import UAP_DATABASE from './uap-database.js';

// Application State
const STATE = {
  currentView: 'home',
  selectedRecord: null,
  filters: {
    search: '',
    release: '',
    category: '',
    type: ''
  },
  cart: [],
  // Mock Tactical Debriefing Comments for Videos
  videoComments: {
    'DOW-UAP-001': [
      { agent: 'Agent Vance', time: '14:32:10', msg: 'Tactical analysis confirms non-inertial flight paths. G-forces calculated at over 400g.' },
      { agent: 'Analyst Reyes', time: '15:10:45', msg: 'Radar cross-section matches the Wave 01 Sandia Base unsealed logs.' }
    ],
    'DOW-UAP-002': [
      { agent: 'Agent Miller', time: '09:12:04', msg: 'Supersonic acceleration signature confirmed. Zero thermal exhaust registered on IR sensors.' },
      { agent: 'OSINT Specialist Chen', time: '11:44:20', msg: 'Visual frames demonstrate high metallic reflectivity under solar angle.' }
    ],
    'DOW-UAP-003': [
      { agent: 'Director Hayes', time: '16:05:12', msg: 'Declassified aircraft tracking confirms speed parameters exceeding standard flight envelope.' },
      { agent: 'Tactical Lead Vance', time: '16:48:30', msg: 'Visual shape details match the Sandia Base Wave 2 declassification logs.' }
    ]
  }
};

// Category Definitions
const CATEGORY_NAMES = {
  'UAP-MSF': { name: 'Military Sensor Footage & Encounters', icon: 'zap' },
  'UAP-NWS': { name: 'Nuclear Facility & Weapons Security', icon: 'shield' },
  'UAP-IAD': { name: 'Intelligence & Agency Dossiers', icon: 'folder' },
  'UAP-SEA': { name: 'Space Exploration Anomalies', icon: 'globe' },
  'UAP-HAL': { name: 'High-Altitude & Atmospheric Logs', icon: 'wind' },
  'UAP-CBR': { name: 'Consciousness & Biological Research', icon: 'activity' }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSearch();
  initFilters();
  initMobileFiltersDrawer();
  initStore();
  initWatchRoomNavigation();
  initAgentCommentsForm();
  renderApp();
  
  // Set default terminal message
  logTerminal("SECURE DECLASSIFIED TERMINAL BOOTUP... SUCCESS.");
  logTerminal("ESTABLISHING PURSUE ENCRYPTED DATASTREAM... SUCCESS.");
  logTerminal(`222 UAP RECORDS SYNCHRONIZED [WAVE 1: 158, WAVE 2: 64].`);
});

// View Routing & Navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .btn-route, .mobile-nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-route');
      if (targetView) {
        switchView(targetView);
      }
    });
  });

  // Logo home navigation
  const logo = document.querySelector('.logo-container');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('home');
    });
  }
}

export function switchView(viewName, recordId = null) {
  STATE.currentView = viewName;
  
  if (recordId) {
    STATE.selectedRecord = UAP_DATABASE.find(r => r.id === recordId) || null;
  }

  // Update navbar active states
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-route') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update mobile bottom nav active states
  document.querySelectorAll('.mobile-nav-item').forEach(link => {
    if (link.getAttribute('data-route') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Toggle active views in DOM
  document.querySelectorAll('.view-container').forEach(view => {
    if (view.id === `${viewName}-view`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Special viewport scroll top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  renderView(viewName);
}

// Global Search System
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      STATE.filters.search = e.target.value.toLowerCase();
      renderBrowserList();
    });
  }
}

// Side Filters
function initFilters() {
  // Setup click triggers for sidebar categories, releases, and types
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-filter-type');
      const val = btn.getAttribute('data-filter-value');

      // Toggle logic
      if (STATE.filters[type] === val) {
        STATE.filters[type] = ''; // clear filter if clicked again
        btn.classList.remove('active');
      } else {
        STATE.filters[type] = val;
        // deactivate other buttons in group
        document.querySelectorAll(`.filter-btn[data-filter-type="${type}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }

      renderBrowserList();
    });
  });
}

// Mobile Filter Drawer Handlers
function initMobileFiltersDrawer() {
  const btnToggleFilters = document.getElementById('btn-toggle-filters');
  const btnCloseFilters = document.getElementById('btn-close-filters');
  const btnApplyFilters = document.getElementById('btn-apply-filters');
  const filtersSidebar = document.getElementById('archives-sidebar');
  const filtersBackdrop = document.getElementById('filters-backdrop');

  if (btnToggleFilters && filtersSidebar && filtersBackdrop) {
    const openDrawer = () => {
      filtersSidebar.classList.add('active');
      filtersBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    };
    
    const closeDrawer = () => {
      filtersSidebar.classList.remove('active');
      filtersBackdrop.classList.remove('active');
      document.body.style.overflow = ''; // restore scrolling
    };

    btnToggleFilters.addEventListener('click', openDrawer);
    if (btnCloseFilters) btnCloseFilters.addEventListener('click', closeDrawer);
    if (btnApplyFilters) btnApplyFilters.addEventListener('click', closeDrawer);
    filtersBackdrop.addEventListener('click', closeDrawer);
  }
}

// Render Master Controller
function renderApp() {
  renderHomeStats();
  renderHomeCategories();
  renderBrowserList();
  renderNews();
}

function renderView(viewName) {
  if (viewName === 'home') {
    renderHomeStats();
    renderHomeCategories();
  } else if (viewName === 'browser') {
    renderBrowserList();
    updateSidebarBadges();
  } else if (viewName === 'detail') {
    renderReadingRoom();
  } else if (viewName === 'news') {
    renderNews();
  } else if (viewName === 'media') {
    renderWatchRoom();
  }
}

// 1. Home Panel Data
function renderHomeStats() {
  const wave1Count = UAP_DATABASE.filter(r => r.release_date === '5/8/26').length;
  const wave2Count = UAP_DATABASE.filter(r => r.release_date === '5/22/26').length;
  const totalCount = UAP_DATABASE.length;

  const elTotal = document.getElementById('stat-total-files');
  const elWave1 = document.getElementById('stat-wave1-files');
  const elWave2 = document.getElementById('stat-wave2-files');

  if (elTotal) elTotal.innerText = totalCount;
  if (elWave1) elWave1.innerText = wave1Count;
  if (elWave2) elWave2.innerText = wave2Count;
}

function renderHomeCategories() {
  const container = document.getElementById('home-category-grid');
  if (!container) return;

  container.innerHTML = '';
  
  Object.keys(CATEGORY_NAMES).forEach(catId => {
    const cat = CATEGORY_NAMES[catId];
    const count = UAP_DATABASE.filter(r => r.category === catId).length;
    
    // Select specific icon based on category
    let iconSvg = '';
    if (catId === 'UAP-MSF') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    } else if (catId === 'UAP-NWS') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    } else if (catId === 'UAP-IAD') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
    } else if (catId === 'UAP-SEA') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    } else if (catId === 'UAP-HAL') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
    }

    const card = document.createElement('div');
    card.className = 'glass-panel category-card';
    card.innerHTML = `
      <div class="category-icon-box">${iconSvg}</div>
      <div class="category-info">
        <h3 class="category-title">${cat.name}</h3>
        <p class="category-meta">${count} Files Available</p>
      </div>
      <div class="category-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    `;

    card.addEventListener('click', () => {
      // Set active category filter
      STATE.filters.category = catId;
      
      // Update sidebar filter active button in DOM
      document.querySelectorAll('.filter-btn[data-filter-type="category"]').forEach(b => {
        if (b.getAttribute('data-filter-value') === catId) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      
      switchView('browser');
    });

    container.appendChild(card);
  });
}

// 2. Interactive Document Browser
function renderBrowserList() {
  const container = document.getElementById('browser-document-list');
  if (!container) return;

  container.innerHTML = '';

  // Get sort order
  const sortSelect = document.getElementById('sort-select');
  const sortVal = sortSelect ? sortSelect.value : 'id-asc';

  // Apply filters
  let filtered = UAP_DATABASE.filter(r => {
    // Search match (title, description, incident location, agency, or ID)
    const matchesSearch = !STATE.filters.search || 
      r.title.toLowerCase().includes(STATE.filters.search) ||
      r.description.toLowerCase().includes(STATE.filters.search) ||
      r.id.toLowerCase().includes(STATE.filters.search) ||
      r.agency.toLowerCase().includes(STATE.filters.search) ||
      r.incident_location.toLowerCase().includes(STATE.filters.search);
      
    const matchesRelease = !STATE.filters.release || r.release_date === STATE.filters.release;
    const matchesCategory = !STATE.filters.category || r.category === STATE.filters.category;
    const matchesType = !STATE.filters.type || r.type === STATE.filters.type;

    return matchesSearch && matchesRelease && matchesCategory && matchesType;
  });

  // Apply sort
  filtered.sort((a, b) => {
    if (sortVal === 'id-asc') return a.id.localeCompare(b.id);
    if (sortVal === 'id-desc') return b.id.localeCompare(a.id);
    if (sortVal === 'title-asc') return a.title.localeCompare(b.title);
    return 0;
  });

  // Update counts
  const countEl = document.getElementById('results-count-number');
  if (countEl) countEl.innerText = `${filtered.length} files matched`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="text-align: center; padding: 48px; color: var(--text-muted);">
        <p style="font-size: 16px; margin-bottom: 8px;">No declassified records found matching your filters.</p>
        <button id="btn-clear-filters" class="btn btn-primary" style="margin-top: 16px;">Reset Active Filters</button>
      </div>
    `;
    const resetBtn = document.getElementById('btn-clear-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', clearAllFilters);
    }
    return;
  }

  filtered.forEach((r, idx) => {
    const card = document.createElement('div');
    card.className = 'doc-card';
    
    const hasLink = r.link && r.link.trim() !== '';
    const downloadBtnHtml = hasLink 
      ? `<a class="doc-download-btn" href="${r.link}" target="_blank" title="Download raw declassified dossier file">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
         </a>`
      : `<button class="doc-download-btn restricted" title="Raw file restricted / Wave processing" disabled style="opacity: 0.25; cursor: not-allowed; border: none; background: transparent; pointer-events: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
         </button>`;

    card.innerHTML = `
      <div class="doc-badge-index">${idx + 1}</div>
      <div class="doc-card-main">
        <div class="doc-card-header">
          <span class="doc-type-badge ${r.type.toLowerCase()}">${r.type}</span>
          <h4 class="doc-card-title">${r.id}: ${r.title}</h4>
        </div>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4;">
          ${r.description.slice(0, 150)}${r.description.length > 150 ? '...' : ''}
        </p>
        <div class="doc-card-meta">
          <span><strong>Agency:</strong> ${r.agency}</span>
          <span><strong>Date:</strong> ${r.incident_date}</span>
          <span><strong>Location:</strong> ${r.incident_location}</span>
          <span><strong>Release:</strong> ${r.release_date === '5/8/26' ? 'Wave 01' : 'Wave 02'}</span>
        </div>
      </div>
      ${downloadBtnHtml}
    `;

    // Click on card routes to Reading Room
    card.addEventListener('click', (e) => {
      // If clicked download button, don't open details
      if (e.target.closest('.doc-download-btn')) {
        return;
      }
      switchView('detail', r.id);
    });

    container.appendChild(card);
  });
}

function clearAllFilters() {
  STATE.filters = { search: '', release: '', category: '', type: '' };
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  renderBrowserList();
  updateSidebarBadges();
}

function updateSidebarBadges() {
  // Update the count numbers dynamically next to the filter items
  Object.keys(CATEGORY_NAMES).forEach(catId => {
    const badge = document.querySelector(`.filter-btn[data-filter-value="${catId}"] .filter-badge`);
    if (badge) {
      const count = UAP_DATABASE.filter(r => r.category === catId).length;
      badge.innerText = count;
    }
  });

  document.querySelectorAll('.filter-btn[data-filter-type="release"]').forEach(btn => {
    const relVal = btn.getAttribute('data-filter-value');
    const badge = btn.querySelector('.filter-badge');
    if (badge) {
      const count = UAP_DATABASE.filter(r => r.release_date === relVal).length;
      badge.innerText = count;
    }
  });

  document.querySelectorAll('.filter-btn[data-filter-type="type"]').forEach(btn => {
    const tVal = btn.getAttribute('data-filter-value');
    const badge = btn.querySelector('.filter-badge');
    if (badge) {
      const count = UAP_DATABASE.filter(r => r.type === tVal).length;
      badge.innerText = count;
    }
  });
}

// 3. Declassified Reading Room (Single Document Viewer)
function renderReadingRoom() {
  const r = STATE.selectedRecord;
  if (!r) {
    switchView('browser');
    return;
  }

  // Set Title and Breadcrumb with safe DOM checks to prevent crash
  const elDocId = document.getElementById('reading-room-doc-id');
  const elDocTitle = document.getElementById('reading-room-doc-title');
  const elMetaTitle = document.getElementById('reading-room-meta-title');
  const elMetaAgency = document.getElementById('reading-room-meta-agency');
  const elMetaDate = document.getElementById('reading-room-meta-date');
  const elMetaLocation = document.getElementById('reading-room-meta-location');
  const elMetaType = document.getElementById('reading-room-meta-type');
  const elMetaRelease = document.getElementById('reading-room-meta-release');

  if (elDocId) elDocId.innerText = r.id;
  if (elDocTitle) elDocTitle.innerText = r.title;
  if (elMetaTitle) elMetaTitle.innerText = r.title;
  if (elMetaAgency) elMetaAgency.innerText = r.agency;
  if (elMetaDate) elMetaDate.innerText = r.incident_date || 'N/A';
  if (elMetaLocation) elMetaLocation.innerText = r.incident_location || 'N/A';
  if (elMetaType) elMetaType.innerText = r.type;
  if (elMetaRelease) elMetaRelease.innerText = r.release_date === '5/8/26' ? 'Wave 01 (May 8, 2026)' : 'Wave 02 (May 22, 2026)';
  
  const rawDownload = document.getElementById('reading-room-btn-raw');
  if (rawDownload) {
    if (r.link && r.link.trim() !== '') {
      rawDownload.setAttribute('href', r.link);
      rawDownload.style.opacity = '1';
      rawDownload.style.pointerEvents = 'auto';
      rawDownload.style.cursor = 'pointer';
      rawDownload.innerText = 'Download Raw Dossier File';
    } else {
      rawDownload.removeAttribute('href');
      rawDownload.style.opacity = '0.4';
      rawDownload.style.pointerEvents = 'none';
      rawDownload.style.cursor = 'not-allowed';
      rawDownload.innerText = 'Raw Dossier Restricted / Wave Processing';
    }
  }

  // Populate Agent Summary and Key Topics safely
  const elSummary = document.getElementById('reading-room-agent-summary');
  if (elSummary) elSummary.innerText = r.agent_summary;
  
  const topicsContainer = document.getElementById('reading-room-key-topics');
  if (topicsContainer) {
    topicsContainer.innerHTML = '';
    r.key_topics.forEach(topic => {
      const li = document.createElement('div');
      li.className = 'key-topic-item';
      li.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.886H3.888l4.854 3.528L6.83 18.3 12 14.772l5.17 3.528-1.912-5.886 4.854-3.528h-6.2L12 3z"/></svg>
        <span>${topic}</span>
      `;
      topicsContainer.appendChild(li);
    });
  }

  // Render Viewer Content based on Tabs safely
  const transcriptText = document.getElementById('reading-room-transcript-text');
  if (transcriptText) {
    transcriptText.innerText = r.transcript_preview || "No transcript preview text available.";
  }

  // Manage Media Player rendering
  const viewerBox = document.getElementById('reading-room-media-viewer');
  if (viewerBox) {
    viewerBox.innerHTML = '';
    
    if (r.type === 'VID' || r.type === 'AUD') {
      if (r.dvids_video_id) {
        // High premium responsive DVIDS secure iframe player integration
        viewerBox.innerHTML = `
          <iframe 
            src="https://www.dvidshub.net/video/embed/${r.dvids_video_id}" 
            class="w-full h-full" 
            frameborder="0" 
            allowfullscreen
            allow="autoplay; encrypted-media; picture-in-picture">
          </iframe>
        `;
      } else if (r.link && r.link.trim() !== '' && !r.link.toLowerCase().endsWith('.pdf')) {
        // Standard video player with playsinline and muted for maximum mobile compatibility
        viewerBox.innerHTML = `
          <video controls autoplay playsinline muted class="w-full h-full">
            <source src="${r.link}" type="video/mp4">
            Your browser does not support declassified video streams.
          </video>
        `;
      } else {
        // Mock classification placeholder
        viewerBox.innerHTML = `
          <div class="media-placeholder-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(11, 121, 120, 0.4))"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <h3>VIDEO DATASTREAM CLASSIFIED</h3>
            <p>Dossier Reference ID: <strong>${r.id}</strong></p>
            <p style="font-size:12px; margin-top:14px; opacity:0.8;">The raw video feed for this file is unsealed on AARO's DVIDS distribution network. Standard OCR transcript is detailed in the tab above.</p>
          </div>
        `;
      }
    } else if (r.type === 'IMG') {
      // Display the actual declassified image directly in the viewer
      viewerBox.innerHTML = `
        <div class="media-image-wrapper">
          <img src="${r.link || r.modal_image}" alt="${r.title}" loading="lazy">
        </div>
      `;
    } else {
      // PDF or general document: Check if a document thumbnail (modal_image) exists
      if (r.modal_image && r.modal_image.trim() !== '') {
        viewerBox.innerHTML = `
          <div class="media-pdf-preview" onclick="if (event.target.tagName !== 'A') window.open('${r.link}', '_blank');">
            <img src="${r.modal_image}" alt="${r.title} Document Snapshot" loading="lazy">
            <div class="preview-overlay">
              ${r.link ? `<a class="btn btn-primary" href="${r.link}" target="_blank" style="pointer-events:auto; text-decoration:none;">Open Raw Document Source</a>` : '<span class="mono-text" style="color:#fff;">Raw File Restricted</span>'}
            </div>
            <p style="font-family:var(--font-mono); font-size:10px; color:var(--text-muted); margin-top:12px; letter-spacing:0.05em;">DECLASSIFIED DOSSIER PREVIEW (TAP/HOVER TO VIEW RAW)</p>
          </div>
        `;
      } else {
        // Fallback to default PDF placeholder
        viewerBox.innerHTML = `
          <div class="media-placeholder-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(11, 121, 120, 0.4))"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h3>DECLASSIFIED DOSSIER</h3>
            <p>Dossier Reference ID: <strong>${r.id}</strong></p>
            <p style="font-size:12px; margin-top:14px; opacity:0.8;">Full transcript OCR rendering is detailed below. To read the official original PDF scanner snapshot, click "Download Raw Dossier" below.</p>
            ${r.link ? `<a class="btn btn-secondary" href="${r.link}" target="_blank" style="margin-top:20px;">Open Raw Document Source</a>` : ''}
          </div>
        `;
      }
    }
  }

  // Setup viewer tabs safely
  const btnViewer = document.getElementById('btn-view-media');
  const btnTranscript = document.getElementById('btn-view-transcript');
  const panelMedia = document.getElementById('reading-room-media-panel');
  const panelText = document.getElementById('reading-room-text-panel');

  if (btnViewer && btnTranscript && panelMedia && panelText) {
    // default tab
    if (r.type === 'VID' || r.type === 'AUD') {
      btnViewer.classList.add('active');
      btnTranscript.classList.remove('active');
      panelMedia.style.display = 'block';
      panelText.style.display = 'none';
    } else {
      btnViewer.classList.remove('active');
      btnTranscript.classList.add('active');
      panelMedia.style.display = 'none';
      panelText.style.display = 'block';
    }

    btnViewer.addEventListener('click', () => {
      btnViewer.classList.add('active');
      btnTranscript.classList.remove('active');
      panelMedia.style.display = 'block';
      panelText.style.display = 'none';
    });

    btnTranscript.addEventListener('click', () => {
      btnViewer.classList.remove('active');
      btnTranscript.classList.add('active');
      panelMedia.style.display = 'none';
      panelText.style.display = 'block';
    });
  }

  // Generate Related Recommendations Carousel
  const recsContainer = document.getElementById('reading-room-related-records');
  if (recsContainer) {
    recsContainer.innerHTML = '';
    // Find records in same category, exclude current
    const related = UAP_DATABASE.filter(rec => rec.category === r.category && rec.id !== r.id).slice(0, 4);
    
    if (related.length === 0) {
      recsContainer.innerHTML = `<p style="font-size: 13px; color:var(--text-muted); font-style:italic;">No other files found in this category.</p>`;
    } else {
      related.forEach(rec => {
        const item = document.createElement('div');
        item.style.cssText = 'background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); padding:12px; border-radius:8px; cursor:pointer; transition:all 0.2s;';
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span class="doc-type-badge ${rec.type.toLowerCase()}" style="font-size:8px;">${rec.type}</span>
            <span style="font-family:var(--font-mono); font-size:9px; color:var(--text-muted);">${rec.id}</span>
          </div>
          <h5 style="font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">${rec.title}</h5>
        `;
        
        item.addEventListener('mouseenter', () => {
          item.style.borderColor = 'var(--color-teal)';
          item.style.background = 'rgba(11,121,120,0.05)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.borderColor = 'rgba(255,255,255,0.04)';
          item.style.background = 'rgba(255,255,255,0.02)';
        });
        
        item.addEventListener('click', () => {
          switchView('detail', rec.id);
        });
        recsContainer.appendChild(item);
      });
    }
  }
}

// ==================== 6. DECLASSIFIED WATCH ROOM LOGIC ====================
const WATCH_STATE = {
  activeVideoId: null
};

function renderWatchRoom() {
  const container = document.getElementById('watch-playlist-container');
  if (!container) return;

  // Filter only VID records
  const videos = UAP_DATABASE.filter(r => r.type === 'VID');

  container.innerHTML = '';

  if (videos.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:13px; font-style:italic; padding: 16px; text-align: center;">No declassified videos available.</p>`;
    return;
  }

  // If no video is active, default to the first one
  if (!WATCH_STATE.activeVideoId && videos.length > 0) {
    WATCH_STATE.activeVideoId = videos[0].id;
  }

  videos.forEach(v => {
    const isActive = v.id === WATCH_STATE.activeVideoId;
    const item = document.createElement('div');
    item.className = `playlist-item ${isActive ? 'active' : ''}`;
    
    item.innerHTML = `
      <div class="playlist-icon-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${isActive ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
      <div class="playlist-info">
        <h4 class="playlist-title">${v.id}: ${v.title}</h4>
        <span class="playlist-meta">${v.agency} // ${v.incident_date}</span>
      </div>
    `;

    item.addEventListener('click', () => {
      WATCH_STATE.activeVideoId = v.id;
      renderWatchRoom();
      // Smoothly scroll back up to the video player container
      const playerBox = document.querySelector('.featured-player-box');
      if (playerBox) {
        playerBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    container.appendChild(item);
  });

  // Render active featured video details
  const activeVideo = videos.find(v => v.id === WATCH_STATE.activeVideoId);
  if (activeVideo) {
    const playerEl = document.getElementById('watch-featured-player');
    const idEl = document.getElementById('watch-doc-id');
    const titleEl = document.getElementById('watch-doc-title');
    const descEl = document.getElementById('watch-doc-desc');
    const agencyEl = document.getElementById('watch-doc-agency');
    const dateEl = document.getElementById('watch-doc-date');
    const locationEl = document.getElementById('watch-doc-location');

    if (idEl) idEl.innerText = activeVideo.id;
    if (titleEl) titleEl.innerText = activeVideo.title;
    if (descEl) descEl.innerText = activeVideo.description;
    if (agencyEl) agencyEl.innerText = activeVideo.agency;
    if (dateEl) dateEl.innerText = activeVideo.incident_date || 'N/A';
    if (locationEl) locationEl.innerText = activeVideo.incident_location || 'N/A';

    if (playerEl) {
      if (activeVideo.dvids_video_id) {
        playerEl.innerHTML = `
          <iframe 
            src="https://www.dvidshub.net/video/embed/${activeVideo.dvids_video_id}" 
            class="w-full h-full" 
            frameborder="0" 
            allowfullscreen
            allow="autoplay; encrypted-media; picture-in-picture">
          </iframe>
        `;
      } else if (activeVideo.link && activeVideo.link.trim() !== '' && !activeVideo.link.toLowerCase().endsWith('.pdf')) {
        playerEl.innerHTML = `
          <video controls autoplay playsinline muted class="w-full h-full">
            <source src="${activeVideo.link}" type="video/mp4">
            Your browser does not support declassified video streams.
          </video>
        `;
      } else {
        playerEl.innerHTML = `
          <div class="media-placeholder-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(11, 121, 120, 0.4))"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <h3>VIDEO DATASTREAM CLASSIFIED</h3>
            <p>Dossier Reference ID: <strong>${activeVideo.id}</strong></p>
            <p style="font-size:12px; margin-top:14px; opacity:0.8;">The raw video feed for this file is unsealed on AARO's DVIDS distribution network. Standard OCR transcript is detailed in the main Archives browser.</p>
          </div>
        `;
      }
    }

    // Render button navigation states & counter
    const activeIndex = videos.findIndex(v => v.id === WATCH_STATE.activeVideoId);
    const prevBtn = document.getElementById('watch-btn-prev');
    const nextBtn = document.getElementById('watch-btn-next');
    const counterEl = document.getElementById('watch-video-counter');
    
    if (counterEl) {
      counterEl.innerText = `Video ${activeIndex + 1} of ${videos.length}`;
    }
    if (prevBtn) {
      if (activeIndex > 0) {
        prevBtn.removeAttribute('disabled');
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
      } else {
        prevBtn.setAttribute('disabled', 'true');
        prevBtn.style.opacity = '0.4';
        prevBtn.style.pointerEvents = 'none';
      }
    }
    if (nextBtn) {
      if (activeIndex < videos.length - 1) {
        nextBtn.removeAttribute('disabled');
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
      } else {
        nextBtn.setAttribute('disabled', 'true');
        nextBtn.style.opacity = '0.4';
        nextBtn.style.pointerEvents = 'none';
      }
    }

    // Render active comments thread
    renderAgentComments(activeVideo.id);
  }
}

// 4. Merch & Affiliate Storefront
function initStore() {
  const storeGrid = document.getElementById('store-products-grid');
  if (!storeGrid) return;

  const PRODUCTS = [
    // UFO Merch
    { id: 'm1', type: 'merch', title: 'PURSUE Operations Tactical Hoodie', desc: 'Sleek black techwear hoodie with glowing neon green tactical circular print of the Presidential UAP directive. Soft and durable.', price: 54.99, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop' },
    { id: 'm2', type: 'merch', title: 'Manhattan Project / Sandia Base 1948 Tee', desc: 'Vintage wash grey tee celebrating the historical declassified declassification waves at Sandia Nuclear weapons base. 100% cotton.', price: 29.99, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop' },
    { id: 'm3', type: 'merch', title: 'Official Declassification Stamp Hat', desc: 'Adjustable strap black cap with high density red 3D embroidery saying DECLASSIFIED / TOP SECRET.', price: 24.99, img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop' },
    { id: 'm4', type: 'merch', title: 'PURSUE Declassified Thermal Mug', desc: 'Matt black stainless steel thermal travel mug. Reveals glowing declassification coordinates when hot water is poured.', price: 19.99, img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop' },
    
    // Amazon Affiliate Gear
    { id: 'a1', type: 'affiliate', title: 'Solomark Night Vision Binoculars 4K', desc: 'Perfect for UAP night sky tracking. High fidelity infrared sensor with declassified grade digital recording capabilities.', price: 169.99, img: 'https://images.unsplash.com/photo-1608962714022-8094b8e23f03?q=80&w=400&auto=format&fit=crop' },
    { id: 'a2', type: 'affiliate', title: 'Celestron AstroMaster 130EQ Telescope', desc: 'Powerful Newtonian Reflector telescope. Track and capture high-altitude orbital anomalies with maximum resolution.', price: 349.99, img: 'https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?q=80&w=400&auto=format&fit=crop' },
    { id: 'a3', type: 'affiliate', title: 'The UFO Primer: Declassified History', desc: 'Authoritative OSINT handbook detailing the history of government cover-ups, FBI Vault sightings, and Manhattan Project records.', price: 18.99, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop' },
    { id: 'a4', type: 'affiliate', title: 'RTL-SDR Tactical Radio Receiver Kit', desc: 'Monitor high-altitude transponder anomalies and VHF aviation frequencies to spot anomalous aircraft entries.', price: 39.99, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' }
  ];

  storeGrid.innerHTML = '';

  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-panel product-card';
    card.innerHTML = `
      <span class="product-tag ${p.type === 'affiliate' ? 'affiliate' : ''}">
        ${p.type === 'affiliate' ? 'Official Gear (Amazon)' : 'Exclusive Merch'}
      </span>
      <div class="product-img-box">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
      </div>
      <div class="product-info">
        <h4 class="product-title">${p.title}</h4>
        <p class="product-desc">${p.desc}</p>
        <div class="product-price-row">
          <span class="product-price">$${p.price}</span>
          <button class="btn btn-orange btn-add-cart" data-id="${p.id}" data-type="${p.type}">
            ${p.type === 'affiliate' ? 'Buy on Amazon' : 'Add To Cart'}
          </button>
        </div>
      </div>
    `;

    // Buy / Add to cart trigger
    const btn = card.querySelector('.btn-add-cart');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (p.type === 'affiliate') {
        // Amazon Affiliate trigger
        logTerminal(`AFFILIATE UPLINK: CONNECTING TO AMAZON SECURE HUB [PRODUCT: ${p.id}]...`);
        window.open('https://www.amazon.com', '_blank');
      } else {
        // Merch add to cart
        STATE.cart.push(p);
        logTerminal(`CART UPDATE: ADDED ${p.title.toUpperCase()} - PRICE: $${p.price}`);
        alert(`Successfully added "${p.title}" to your cart!\nTotal Cart Items: ${STATE.cart.length}`);
      }
    });

    storeGrid.appendChild(card);
  });
}

// 5. Encrypted Terminal News Updates
function renderNews() {
  const feed = document.getElementById('terminal-news-feed');
  if (!feed) return;

  const NEWS = [
    { date: 'MAY 22, 2026', time: '18:00 UTC', author: 'AGENTIC SECURE FEED', title: 'WAVE 02 DECLASSIFICATION BUNDLE UPLOADED', content: 'The Department of War has unsealed 64 new files. This batch includes the historic ODNI narrative from a senior intelligence official detailing a May 2025 multi-orb encounter at a nuclear weapons depot, alongside 51 declassified military jet tracking recordings.' },
    { date: 'MAY 18, 2026', time: '14:30 UTC', author: 'OSINT WATCH', title: 'AARO CONGRESSIONAL BRIEFING TRANSCRIPTS SYNCHRONIZED', content: 'Completed full-text OCR alignment of congressional testimonies from late 2025. Records clarify high-speed visual anomalies reported near Sandia Base and Los Alamos facilities.' },
    { date: 'MAY 08, 2026', time: '09:00 UTC', author: 'AGENTIC SECURE FEED', title: 'WAVE 01 PRESIDENTIAL DIRECTIVE DECLASSIFIED', content: 'Historic day. At the instruction of the President, PURSUE unseals the first massive tranche of declassified records (158 files) dating back to 1947. FBI case files and general Manhattan Project correspondence are now public.' }
  ];

  feed.innerHTML = '';

  NEWS.forEach(item => {
    const el = document.createElement('div');
    el.className = 'news-item';
    el.innerHTML = `
      <div class="news-item-meta">> [${item.date} // ${item.time}] // BY: ${item.author}</div>
      <h4 class="news-item-title">${item.title}</h4>
      <p class="news-item-content">${item.content}</p>
    `;
    feed.appendChild(el);
  });
}

// Comments & Navigation Systems for Watch Room
function getCommentsForVideo(videoId) {
  if (!STATE.videoComments) {
    STATE.videoComments = {};
  }
  if (!STATE.videoComments[videoId]) {
    STATE.videoComments[videoId] = [
      { agent: 'Intelligence Analyst', time: '08:30:15', msg: `Initiating multi-agency sensor log analysis for UAP record ${videoId}.` },
      { agent: 'Aviation Safety Inspector', time: '09:15:44', msg: 'No active transponder signature recorded during visual contact window.' }
    ];
  }
  return STATE.videoComments[videoId];
}

function renderAgentComments(videoId) {
  const thread = document.getElementById('agent-comments-thread');
  if (!thread) return;
  
  const comments = getCommentsForVideo(videoId);
  thread.innerHTML = '';
  
  comments.forEach(c => {
    const div = document.createElement('div');
    div.style.cssText = 'background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:8px 10px; border-radius:6px; font-size:12px; margin-bottom: 8px;';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-family:var(--font-mono); font-size:10px; color:var(--color-teal); font-weight:bold;">
        <span>> ${c.agent}</span>
        <span style="color:var(--text-muted); font-weight:normal;">[${c.time}]</span>
      </div>
      <div style="color:var(--text-primary); line-height:1.4;">${c.msg}</div>
    `;
    thread.appendChild(div);
  });
  
  thread.scrollTop = thread.scrollHeight;
}

function initWatchRoomNavigation() {
  const prevBtn = document.getElementById('watch-btn-prev');
  const nextBtn = document.getElementById('watch-btn-next');
  
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      const videos = UAP_DATABASE.filter(r => r.type === 'VID');
      const activeIndex = videos.findIndex(v => v.id === WATCH_STATE.activeVideoId);
      if (activeIndex > 0) {
        WATCH_STATE.activeVideoId = videos[activeIndex - 1].id;
        renderWatchRoom();
        const playerBox = document.querySelector('.featured-player-box');
        if (playerBox) playerBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    nextBtn.addEventListener('click', () => {
      const videos = UAP_DATABASE.filter(r => r.type === 'VID');
      const activeIndex = videos.findIndex(v => v.id === WATCH_STATE.activeVideoId);
      if (activeIndex < videos.length - 1) {
        WATCH_STATE.activeVideoId = videos[activeIndex + 1].id;
        renderWatchRoom();
        const playerBox = document.querySelector('.featured-player-box');
        if (playerBox) playerBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

function initAgentCommentsForm() {
  const form = document.getElementById('agent-comment-form');
  const input = document.getElementById('agent-comment-input');
  
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msgText = input.value.trim();
      if (!msgText) return;
      
      const activeVideoId = WATCH_STATE.activeVideoId || (UAP_DATABASE.filter(r => r.type === 'VID')[0] || {}).id;
      if (!activeVideoId) return;
      
      const comments = getCommentsForVideo(activeVideoId);
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      comments.push({
        agent: 'OSINT Citizen Agent',
        time: timeStr,
        msg: msgText
      });
      
      input.value = '';
      renderAgentComments(activeVideoId);
      logTerminal(`OSINT DEBRIEF UPLOADED: UAP REFERENCE ${activeVideoId}`);
    });
  }
}

// Log message to news page terminal header console!
function logTerminal(msg) {
  const terminalLogs = document.getElementById('terminal-console-logs');
  if (terminalLogs) {
    const line = document.createElement('p');
    line.style.cssText = 'font-size:11px; margin-top:4px; opacity:0.8;';
    line.innerText = `> [${new Date().toLocaleTimeString()}] ${msg}`;
    terminalLogs.appendChild(line);
    
    // limit lines to 5
    while (terminalLogs.children.length > 5) {
      terminalLogs.removeChild(terminalLogs.firstChild);
    }
  }
}
