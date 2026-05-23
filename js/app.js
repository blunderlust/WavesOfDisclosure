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
  cart: []
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
  initStore();
  renderApp();
  
  // Set default terminal message
  logTerminal("SECURE DECLASSIFIED TERMINAL BOOTUP... SUCCESS.");
  logTerminal("ESTABLISHING PURSUE ENCRYPTED DATASTREAM... SUCCESS.");
  logTerminal(`222 UAP RECORDS SYNCHRONIZED [WAVE 1: 158, WAVE 2: 64].`);
});

// View Routing & Navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .btn-route');
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
      <a class="doc-download-btn" href="${r.link}" target="_blank" title="Download raw dossier file">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </a>
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

  // Set Title and Breadcrumb
  document.getElementById('reading-room-doc-id').innerText = r.id;
  document.getElementById('reading-room-doc-title').innerText = r.title;
  document.getElementById('reading-room-meta-title').innerText = r.title;
  document.getElementById('reading-room-meta-agency').innerText = r.agency;
  document.getElementById('reading-room-meta-date').innerText = r.incident_date;
  document.getElementById('reading-room-meta-location').innerText = r.incident_location;
  document.getElementById('reading-room-meta-type').innerText = r.type;
  document.getElementById('reading-room-meta-release').innerText = r.release_date === '5/8/26' ? 'Wave 01 (May 8, 2026)' : 'Wave 02 (May 22, 2026)';
  
  const rawDownload = document.getElementById('reading-room-btn-raw');
  if (rawDownload) rawDownload.setAttribute('href', r.link);

  // Populate Agent Summary and Key Topics
  document.getElementById('reading-room-agent-summary').innerText = r.agent_summary;
  
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

  // Render Viewer Content based on Tabs
  const transcriptText = document.getElementById('reading-room-transcript-text');
  if (transcriptText) {
    transcriptText.innerText = r.transcript_preview || "No transcript preview text available.";
  }

  // Manage Media Player rendering
  const viewerBox = document.getElementById('reading-room-media-viewer');
  if (viewerBox) {
    viewerBox.innerHTML = '';
    
    if (r.type === 'VID') {
      // Render standard Video Player streaming from CDN link!
      viewerBox.innerHTML = `
        <video controls autoplay class="w-full h-full">
          <source src="${r.link}" type="video/mp4">
          Your browser does not support declassified video streams.
        </video>
      `;
    } else {
      // PDF or Image placeholder
      viewerBox.innerHTML = `
        <div class="media-placeholder-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(11, 121, 120, 0.4))"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <h3>DECLASSIFIED DOSSIER</h3>
          <p>Dossier Reference ID: <strong>${r.id}</strong></p>
          <p style="font-size:12px; margin-top:14px; opacity:0.8;">Full transcript OCR rendering is detailed below. To read the official original PDF scanner snapshot, click "Download Raw Dossier" below.</p>
          <a class="btn btn-secondary" href="${r.link}" target="_blank" style="margin-top:20px;">Open Raw Document Source</a>
        </div>
      `;
    }
  }

  // Setup viewer tabs
  const btnViewer = document.getElementById('btn-view-media');
  const btnTranscript = document.getElementById('btn-view-transcript');
  const panelMedia = document.getElementById('reading-room-media-panel');
  const panelText = document.getElementById('reading-room-text-panel');

  if (btnViewer && btnTranscript && panelMedia && panelText) {
    // default tab
    if (r.type === 'VID') {
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
