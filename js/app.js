/**
 * Smart Campus Energy Optimizer (SCEO)
 * Application Controller & Interactions - Step 1 Foundation
 */

(function () {
  'use strict';

  // Application State
  const state = {
    currentView: 'overview',
    selectedBuilding: 'all',
    dateRange: '7d', // '7d' | '30d'
    resolvedActions: new Set(),
    readAlerts: new Set(),
    activeActionInModal: null,
    consumptionChart: null,
    distributionChart: null,
    chartJsAvailable: typeof Chart !== 'undefined'
  };

  // DOM Elements Cache
  const elements = {
    // Top Bar & Navigation
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    sidebarNavList: document.getElementById('sidebarNavList'),
    topBreadcrumb: document.getElementById('topBreadcrumb'),
    topHeading: document.getElementById('topHeading'),
    buildingSelector: document.getElementById('buildingSelector'),
    notificationsBtn: document.getElementById('notificationsBtn'),
    notificationPopover: document.getElementById('notificationPopover'),
    notifBadge: document.getElementById('notifBadge'),
    notifPopoverList: document.getElementById('notifPopoverList'),
    clearAllNotifsBtn: document.getElementById('clearAllNotifsBtn'),

    // Views
    overviewView: document.getElementById('overviewView'),
    placeholderView: document.getElementById('placeholderView'),
    btnReturnOverview: document.getElementById('btnReturnOverview'),

    // Placeholder View Elements
    placeholderCode: document.getElementById('placeholderCode'),
    placeholderTitle: document.getElementById('placeholderTitle'),
    placeholderDesc: document.getElementById('placeholderDesc'),
    placeholderFeatureList: document.getElementById('placeholderFeatureList'),
    placeholderIconBox: document.getElementById('placeholderIconBox'),

    // Dashboard Controls & KPIs
    btnRange7d: document.getElementById('btnRange7d'),
    btnRange30d: document.getElementById('btnRange30d'),
    kpiTotalEnergy: document.getElementById('kpiTotalEnergy'),
    kpiTotalEnergySub: document.getElementById('kpiTotalEnergySub'),
    kpiPotentialSavings: document.getElementById('kpiPotentialSavings'),
    kpiSavingsSub: document.getElementById('kpiSavingsSub'),
    kpiActiveAlerts: document.getElementById('kpiActiveAlerts'),
    kpiAlertsSub: document.getElementById('kpiAlertsSub'),
    kpiMonitoredRooms: document.getElementById('kpiMonitoredRooms'),
    kpiRoomsSub: document.getElementById('kpiRoomsSub'),

    // Charts
    chartMainTitle: document.getElementById('chartMainTitle'),
    chartMainSubtitle: document.getElementById('chartMainSubtitle'),
    chartBuildingScope: document.getElementById('chartBuildingScope'),
    consumptionChartCanvas: document.getElementById('consumptionChart'),
    buildingDistributionCanvas: document.getElementById('buildingDistributionChart'),
    chartFallback: document.getElementById('chartFallback'),
    fallbackBarsContainer: document.getElementById('fallbackBarsContainer'),
    buildingComparisonList: document.getElementById('buildingComparisonList'),

    // Operational Sections
    priorityActionsList: document.getElementById('priorityActionsList'),
    actionsCountBadge: document.getElementById('actionsCountBadge'),
    recentAlertsList: document.getElementById('recentAlertsList'),
    alertsFilterStatus: document.getElementById('alertsFilterStatus'),
    buildingsTableBody: document.getElementById('buildingsTableBody'),

    // Modal
    actionModal: document.getElementById('actionModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalDismissBtn: document.getElementById('modalDismissBtn'),
    modalResolveBtn: document.getElementById('modalResolveBtn'),
    modalCategory: document.getElementById('modalCategory'),
    modalTitle: document.getElementById('modalTitle'),
    modalSeverity: document.getElementById('modalSeverity'),
    modalBuilding: document.getElementById('modalBuilding'),
    modalSavings: document.getElementById('modalSavings'),
    modalDetails: document.getElementById('modalDetails'),
    modalRooms: document.getElementById('modalRooms'),
    modalAction: document.getElementById('modalAction'),
    modalImpact: document.getElementById('modalImpact'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Helper: Format number with commas
   */
  function formatNumber(num) {
    return Number(num).toLocaleString('en-US');
  }

  /**
   * Toast Notification Dispatcher
   */
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-message">${message}</div>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto-remove after 3.8s
    setTimeout(() => {
      toast.style.transition = 'opacity 300ms ease, transform 300ms ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  /**
   * Navigation View Switcher
   */
  function switchView(viewKey) {
    state.currentView = viewKey;

    // Update active nav link
    const navItems = elements.sidebarNavList.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.view === viewKey) {
        item.classList.add('active');
        item.querySelector('.nav-link').setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active');
        item.querySelector('.nav-link').removeAttribute('aria-current');
      }
    });

    // Close mobile drawer if open
    elements.sidebar.classList.remove('mobile-open');
    elements.sidebarOverlay.classList.remove('active');

    if (viewKey === 'overview') {
      elements.overviewView.style.display = 'block';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Campus Overview';
      elements.topBreadcrumb.textContent = 'Campus Management / Overview';
    } else {
      // Show Coming Soon Placeholder
      const modInfo = SCEO_DATA.navigationModules[viewKey] || {
        title: 'Module',
        code: 'MODULE',
        description: 'Under development.',
        nextStepFeatures: []
      };

      elements.overviewView.style.display = 'none';
      elements.placeholderView.style.display = 'block';

      elements.placeholderCode.textContent = modInfo.code || 'NEXT STAGE';
      elements.placeholderTitle.textContent = modInfo.title;
      elements.placeholderDesc.textContent = `${modInfo.description} Full interactive modeling will be implemented in Step 2.`;
      
      elements.topHeading.textContent = modInfo.title;
      elements.topBreadcrumb.textContent = `Campus Management / ${modInfo.title}`;

      // Render planned features
      elements.placeholderFeatureList.innerHTML = '';
      if (modInfo.nextStepFeatures && modInfo.nextStepFeatures.length) {
        modInfo.nextStepFeatures.forEach(feature => {
          const li = document.createElement('li');
          li.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${feature}</span>
          `;
          elements.placeholderFeatureList.appendChild(li);
        });
      }

      // Render nice matching SVG icon
      elements.placeholderIconBox.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `;

      // Scroll top of view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Calculate KPIs based on current state (Building + Date Range)
   */
  function updateKPIs() {
    const is30d = state.dateRange === '30d';
    let totalKWh = 0;
    let potentialSavings = 0;
    let activeAlerts = 0;
    let monitoredRooms = 0;
    let sublabelTotal = '';
    let sublabelSavings = '';

    if (state.selectedBuilding === 'all') {
      // Use baseline exact metrics required in prompt for 7-day All Buildings
      if (!is30d) {
        totalKWh = SCEO_DATA.metadata.defaultKPIs.totalEnergy7Days;       // 2,480 kWh
        potentialSavings = SCEO_DATA.metadata.defaultKPIs.potentialSavings7Days; // 186 kWh
        activeAlerts = SCEO_DATA.metadata.defaultKPIs.activeAlertsCount - state.resolvedActions.size;
        monitoredRooms = SCEO_DATA.metadata.defaultKPIs.monitoredClassroomsCount; // 24
        sublabelTotal = 'vs. 2,695 kWh previous week';
        sublabelSavings = 'Identified recoverable waste';
      } else {
        totalKWh = SCEO_DATA.metadata.defaultKPIs.totalEnergy30Days;
        potentialSavings = SCEO_DATA.metadata.defaultKPIs.potentialSavings30Days;
        activeAlerts = SCEO_DATA.metadata.defaultKPIs.activeAlertsCount - state.resolvedActions.size;
        monitoredRooms = SCEO_DATA.metadata.defaultKPIs.monitoredClassroomsCount;
        sublabelTotal = 'vs. 11,420 kWh previous month';
        sublabelSavings = 'Estimated 30-day savings potential';
      }
    } else {
      const bldg = SCEO_DATA.buildings.find(b => b.id === state.selectedBuilding);
      if (bldg) {
        const kpiSource = is30d ? bldg.kpi30Days : bldg.kpi7Days;
        totalKWh = kpiSource.totalKWh;
        potentialSavings = kpiSource.potentialSavingsKWh;
        monitoredRooms = kpiSource.monitoredRooms;

        // Count alerts for this building minus resolved
        const bldgAlerts = SCEO_DATA.recentAlerts.filter(a => a.buildingId === state.selectedBuilding).length;
        const bldgResolved = Array.from(state.resolvedActions).filter(actId => {
          const act = SCEO_DATA.priorityActions.find(p => p.id === actId);
          return act && act.buildingId === state.selectedBuilding;
        }).length;

        activeAlerts = Math.max(0, bldgAlerts - bldgResolved);
        sublabelTotal = `Within ${bldg.name}`;
        sublabelSavings = `Facility efficiency potential`;
      }
    }

    // Update DOM
    elements.kpiTotalEnergy.textContent = formatNumber(totalKWh);
    elements.kpiTotalEnergySub.textContent = sublabelTotal;

    elements.kpiPotentialSavings.textContent = formatNumber(potentialSavings);
    elements.kpiSavingsSub.textContent = sublabelSavings;

    elements.kpiActiveAlerts.textContent = formatNumber(Math.max(0, activeAlerts));
    elements.kpiMonitoredRooms.textContent = formatNumber(monitoredRooms);

    // Update Topbar Badge
    elements.notifBadge.textContent = Math.max(0, activeAlerts);
    if (activeAlerts === 0) {
      elements.notifBadge.style.backgroundColor = '#64748B';
    } else {
      elements.notifBadge.style.backgroundColor = '#DC2626';
    }
  }

  /**
   * Render Large Electricity Consumption Chart (Chart.js or Fallback)
   */
  function renderConsumptionChart() {
    const is30d = state.dateRange === '30d';
    let labels = [];
    let consumptionData = [];
    let baselineData = [];
    let scopeName = 'All Campus Buildings';

    if (state.selectedBuilding === 'all') {
      const source = is30d ? SCEO_DATA.dailyAggregated30Days : SCEO_DATA.dailyAggregated7Days;
      labels = is30d ? source.labels : source.shortLabels;
      consumptionData = source.consumption;
      baselineData = source.baseline;
      scopeName = 'All Campus Buildings';
    } else {
      const bldg = SCEO_DATA.buildings.find(b => b.id === state.selectedBuilding);
      if (bldg) {
        scopeName = bldg.name;
        if (is30d) {
          labels = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);
          consumptionData = bldg.dailyReadings30Days;
          baselineData = bldg.dailyReadings30Days.map(val => Math.round(val * 0.9));
        } else {
          labels = SCEO_DATA.dailyAggregated7Days.shortLabels;
          consumptionData = bldg.dailyReadings7Days;
          baselineData = bldg.dailyReadings7Days.map(val => Math.round(val * 0.9));
        }
      }
    }

    // Update scope label in card header
    elements.chartBuildingScope.textContent = scopeName;
    elements.chartMainSubtitle.textContent = `Electricity telemetry (${is30d ? '30 days' : '7 days'}) for ${scopeName} with efficient baseline`;

    // 1. If Chart.js is loaded and functional
    if (state.chartJsAvailable && elements.consumptionChartCanvas) {
      elements.chartFallback.style.display = 'none';
      elements.consumptionChartCanvas.style.display = 'block';

      if (state.consumptionChart) {
        state.consumptionChart.data.labels = labels;
        state.consumptionChart.data.datasets[0].data = consumptionData;
        state.consumptionChart.data.datasets[1].data = baselineData;
        state.consumptionChart.data.datasets[0].label = `${scopeName} Consumption (kWh)`;
        state.consumptionChart.update();
      } else {
        const ctx = elements.consumptionChartCanvas.getContext('2d');

        // Create sleek gradient fill for main series
        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, 'rgba(23, 107, 115, 0.35)');
        gradient.addColorStop(1, 'rgba(23, 107, 115, 0.02)');

        state.consumptionChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: `${scopeName} Consumption (kWh)`,
                data: consumptionData,
                borderColor: '#176B73',
                backgroundColor: gradient,
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#176B73',
                pointBorderWidth: 2,
                pointRadius: is30d ? 2 : 4,
                pointHoverRadius: 6
              },
              {
                label: 'Baseline Target',
                data: baselineData,
                borderColor: '#94A3B8',
                borderWidth: 1.8,
                borderDash: [5, 5],
                fill: false,
                tension: 0.2,
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false // Using custom accessible legend below
              },
              tooltip: {
                backgroundColor: '#0F172A',
                titleFont: { family: 'Inter', size: 12 },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function (context) {
                    return ` ${context.dataset.label}: ${context.parsed.y} kWh`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  font: { family: 'Inter', size: 11 },
                  color: '#64748B'
                }
              },
              y: {
                grid: {
                  color: '#F1F5F9'
                },
                ticks: {
                  font: { family: 'Inter', size: 11 },
                  color: '#64748B',
                  callback: function (val) {
                    return val + ' kWh';
                  }
                }
              }
            }
          }
        });
      }
    } else {
      // 2. Graceful Fallback if Chart.js is unavailable
      renderGracefulFallback(labels, consumptionData);
    }
  }

  /**
   * Fallback visual if Chart.js CDN is blocked or fails
   */
  function renderGracefulFallback(labels, data) {
    if (!elements.fallbackBarsContainer) return;

    elements.consumptionChartCanvas.style.display = 'none';
    elements.chartFallback.style.display = 'flex';
    elements.fallbackBarsContainer.innerHTML = '';

    const maxVal = Math.max(...data, 1);

    // Limit to 7 items if 30 to keep fallback readable
    const displayLabels = data.length > 7 ? labels.filter((_, i) => i % 4 === 0) : labels;
    const displayData = data.length > 7 ? data.filter((_, i) => i % 4 === 0) : data;

    displayData.forEach((val, idx) => {
      const heightPercent = Math.round((val / maxVal) * 90);
      const col = document.createElement('div');
      col.className = 'fallback-bar-col';
      col.innerHTML = `
        <div class="fallback-bar" style="height: ${heightPercent}%;" data-kwh="${val}"></div>
        <span class="fallback-label">${displayLabels[idx]}</span>
      `;
      elements.fallbackBarsContainer.appendChild(col);
    });
  }

  /**
   * Render Building Energy Distribution Chart & Progress Breakdown
   */
  function renderBuildingDistribution() {
    const buildingColors = {
      engineering: '#12304A', // Deep Navy
      science: '#176B73',     // Teal Accent
      business: '#38BDF8'     // Light Blue Accent
    };

    const bldgNames = SCEO_DATA.buildings.map(b => b.name);
    const bldgShares = SCEO_DATA.buildings.map(b => b.sharePercentage);
    const bldgKWh = SCEO_DATA.buildings.map(b => b.kpi7Days.totalKWh);

    // Render Progress Bar Breakdown
    if (elements.buildingComparisonList) {
      elements.buildingComparisonList.innerHTML = '';
      SCEO_DATA.buildings.forEach(bldg => {
        const color = buildingColors[bldg.id] || '#176B73';
        const isSelected = state.selectedBuilding === bldg.id;

        const item = document.createElement('div');
        item.className = 'comparison-item';
        item.style.opacity = (state.selectedBuilding === 'all' || isSelected) ? '1' : '0.4';
        
        item.innerHTML = `
          <div class="comparison-meta">
            <span class="comparison-name">
              <span class="comparison-dot" style="background-color: ${color};"></span>
              ${bldg.name} ${isSelected ? '(Selected)' : ''}
            </span>
            <span class="comparison-value">${formatNumber(bldg.kpi7Days.totalKWh)} kWh (${bldg.sharePercentage}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${bldg.sharePercentage}%; background-color: ${color};"></div>
          </div>
        `;
        elements.buildingComparisonList.appendChild(item);
      });
    }

    // Render Chart.js Doughnut if available
    if (state.chartJsAvailable && elements.buildingDistributionCanvas) {
      if (state.distributionChart) {
        state.distributionChart.update();
      } else {
        const ctx = elements.buildingDistributionCanvas.getContext('2d');
        state.distributionChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: bldgNames,
            datasets: [{
              data: bldgShares,
              backgroundColor: ['#12304A', '#176B73', '#38BDF8'],
              borderColor: '#FFFFFF',
              borderWidth: 2,
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#0F172A',
                callbacks: {
                  label: function (ctx) {
                    return ` ${ctx.label}: ${ctx.raw}% (${bldgKWh[ctx.dataIndex]} kWh)`;
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  /**
   * Render Priority Actions
   */
  function renderPriorityActions() {
    if (!elements.priorityActionsList) return;

    elements.priorityActionsList.innerHTML = '';

    // Filter actions if a specific building is chosen
    const actions = SCEO_DATA.priorityActions.filter(action => {
      if (state.selectedBuilding === 'all') return true;
      return action.buildingId === state.selectedBuilding;
    });

    const activeCount = actions.filter(a => !state.resolvedActions.has(a.id)).length;
    elements.actionsCountBadge.textContent = `${activeCount} Active`;

    if (actions.length === 0) {
      elements.priorityActionsList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #64748B; font-size: 13px;">
          No active priority actions for this building.
        </div>
      `;
      return;
    }

    actions.forEach(action => {
      const isResolved = state.resolvedActions.has(action.id);
      const card = document.createElement('div');
      card.className = 'action-card-item';
      if (isResolved) {
        card.style.opacity = '0.55';
      }

      card.innerHTML = `
        <div class="action-item-header">
          <div class="action-item-title-box">
            <span class="action-category-tag">${action.category} • ${action.buildingName}</span>
            <h4 class="action-item-title">${action.title}</h4>
          </div>
          <span class="severity-pill ${action.severity}">
            ${isResolved ? 'Resolved' : action.severityLabel}
          </span>
        </div>
        <p class="action-item-desc">${action.summary}</p>
        <div class="action-item-footer">
          <span class="action-savings-est">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Est. Savings: ${action.estimatedSavings}
          </span>
          <button type="button" class="btn-sm-action" data-action-id="${action.id}">
            <span>${isResolved ? 'View Details' : 'Investigate'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      `;

      // Attach button listener
      const btn = card.querySelector('.btn-sm-action');
      btn.addEventListener('click', () => openActionModal(action));

      elements.priorityActionsList.appendChild(card);
    });
  }

  /**
   * Open Action Detail Modal
   */
  function openActionModal(action) {
    state.activeActionInModal = action;
    const isResolved = state.resolvedActions.has(action.id);

    elements.modalCategory.textContent = `${action.category} • Incident ID #${action.id.toUpperCase()}`;
    elements.modalTitle.textContent = action.title;
    elements.modalSeverity.className = `severity-pill ${action.severity}`;
    elements.modalSeverity.textContent = isResolved ? 'Resolved' : action.severityLabel;
    elements.modalBuilding.textContent = action.buildingName;
    elements.modalSavings.textContent = action.estimatedSavings;
    elements.modalDetails.textContent = action.details;
    elements.modalAction.textContent = action.recommendedAction;
    elements.modalImpact.textContent = action.impactEstimate;

    // Render Affected Rooms
    elements.modalRooms.innerHTML = '';
    action.roomsInvolved.forEach(room => {
      const roomBadge = document.createElement('span');
      roomBadge.className = 'alert-room-tag';
      roomBadge.style.fontSize = '12px';
      roomBadge.textContent = room;
      elements.modalRooms.appendChild(roomBadge);
    });

    // Update Resolve Button State
    if (isResolved) {
      elements.modalResolveBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -2px;"><polyline points="20 6 9 17 4 12"/></svg>
        Already Addressed
      `;
      elements.modalResolveBtn.disabled = true;
      elements.modalResolveBtn.style.opacity = '0.6';
    } else {
      elements.modalResolveBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; vertical-align: -2px;"><polyline points="20 6 9 17 4 12"/></svg>
        Mark as Addressed
      `;
      elements.modalResolveBtn.disabled = false;
      elements.modalResolveBtn.style.opacity = '1';
    }

    elements.actionModal.classList.add('active');
  }

  /**
   * Close Action Modal
   */
  function closeActionModal() {
    elements.actionModal.classList.remove('active');
    state.activeActionInModal = null;
  }

  /**
   * Mark Current Modal Action as Addressed
   */
  function resolveCurrentAction() {
    if (!state.activeActionInModal) return;

    const action = state.activeActionInModal;
    state.resolvedActions.add(action.id);

    closeActionModal();
    renderPriorityActions();
    updateKPIs();

    showToast(`Action updated: "${action.title}" marked as resolved.`, 'success');
  }

  /**
   * Render Recent Alerts List
   */
  function renderRecentAlerts() {
    if (!elements.recentAlertsList) return;

    elements.recentAlertsList.innerHTML = '';

    const filteredAlerts = SCEO_DATA.recentAlerts.filter(alert => {
      if (state.selectedBuilding === 'all') return true;
      return alert.buildingId === state.selectedBuilding;
    });

    elements.alertsFilterStatus.textContent = state.selectedBuilding === 'all'
      ? `${filteredAlerts.length} Active Feeds`
      : `${filteredAlerts.length} in Building`;

    if (filteredAlerts.length === 0) {
      elements.recentAlertsList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #64748B; font-size: 13px;">
          No active telemetry anomalies reported for this building.
        </div>
      `;
      return;
    }

    filteredAlerts.forEach(alert => {
      const isRead = state.readAlerts.has(alert.id);
      const row = document.createElement('div');
      row.className = 'alert-item-row';
      if (isRead) row.style.opacity = '0.65';

      let statusDotClass = 'info';
      if (alert.severity === 'critical') statusDotClass = 'critical';
      else if (alert.severity === 'warning') statusDotClass = 'warning';

      row.innerHTML = `
        <span class="alert-status-dot ${statusDotClass}"></span>
        <div class="alert-content">
          <div class="alert-meta-top">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="alert-room-tag">${alert.room}</span>
              <span class="alert-category-label">${alert.category} • ${alert.buildingName}</span>
            </div>
            <span class="alert-timestamp">${alert.timestamp}</span>
          </div>
          <p class="alert-message">${alert.message} <strong style="color: var(--color-text-main);">Current Draw: ${alert.currentDraw}</strong></p>
        </div>
      `;

      elements.recentAlertsList.appendChild(row);
    });
  }

  /**
   * Render Buildings Performance Table
   */
  function renderBuildingsTable() {
    if (!elements.buildingsTableBody) return;

    elements.buildingsTableBody.innerHTML = '';

    SCEO_DATA.buildings.forEach(bldg => {
      const isSelected = state.selectedBuilding === bldg.id;
      const tr = document.createElement('tr');
      if (isSelected) {
        tr.className = 'highlighted-row';
      }

      tr.innerHTML = `
        <td>
          <div class="bldg-name-cell">
            <span class="bldg-badge-code">${bldg.code}</span>
            <span>${bldg.name}</span>
          </div>
        </td>
        <td>${bldg.totalRooms} classrooms</td>
        <td>${formatNumber(bldg.squareMeters)} m²</td>
        <td><strong>${formatNumber(bldg.kpi7Days.totalKWh)}</strong></td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="progress-track" style="width: 70px; display: inline-block;">
              <div class="progress-fill" style="width: ${bldg.sharePercentage}%; background-color: var(--color-primary);"></div>
            </div>
            <span>${bldg.sharePercentage}%</span>
          </div>
        </td>
        <td>
          <span class="status-tag ${bldg.statusColor}">
            ${bldg.efficiencyRating} (${bldg.efficiencyScore}/100)
          </span>
        </td>
        <td>
          <button type="button" class="btn-filter-bldg" data-bldg-id="${bldg.id}">
            ${isSelected ? 'Active Scope' : 'Filter Focus'}
          </button>
        </td>
      `;

      // Quick filter button
      const filterBtn = tr.querySelector('.btn-filter-bldg');
      filterBtn.addEventListener('click', () => {
        elements.buildingSelector.value = bldg.id;
        handleBuildingChange(bldg.id);
      });

      elements.buildingsTableBody.appendChild(tr);
    });
  }

  /**
   * Render Notification Popover Dropdown Items
   */
  function renderNotificationsPopover() {
    if (!elements.notifPopoverList) return;

    elements.notifPopoverList.innerHTML = '';

    SCEO_DATA.recentAlerts.forEach(alert => {
      const isRead = state.readAlerts.has(alert.id);
      const item = document.createElement('div');
      item.className = `notif-popover-item ${isRead ? '' : 'unread'}`;

      let dotColor = '#0284C7';
      if (alert.severity === 'critical') dotColor = '#DC2626';
      else if (alert.severity === 'warning') dotColor = '#D97706';

      item.innerHTML = `
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${dotColor}; margin-top: 5px; flex-shrink: 0;"></span>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: var(--color-text-main); font-size: 12px;">${alert.room} - ${alert.category}</strong>
            <span style="color: var(--color-text-muted); font-size: 11px;">${alert.timestamp}</span>
          </div>
          <span style="color: var(--color-text-secondary); font-size: 11px; line-height: 1.3;">${alert.message}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        state.readAlerts.add(alert.id);
        item.classList.remove('unread');
        updateKPIs();
      });

      elements.notifPopoverList.appendChild(item);
    });
  }

  /**
   * Handle Building Scope Change
   */
  function handleBuildingChange(buildingId) {
    state.selectedBuilding = buildingId;

    updateKPIs();
    renderConsumptionChart();
    renderBuildingDistribution();
    renderPriorityActions();
    renderRecentAlerts();
    renderBuildingsTable();

    const selectedName = buildingId === 'all'
      ? 'All Campus Buildings'
      : (SCEO_DATA.buildings.find(b => b.id === buildingId) || {}).name || buildingId;

    showToast(`Campus view filtered to: ${selectedName}`, 'info');
  }

  /**
   * Handle Date Range Change
   */
  function handleDateRangeChange(range) {
    if (state.dateRange === range) return;
    state.dateRange = range;

    if (range === '7d') {
      elements.btnRange7d.classList.add('active');
      elements.btnRange30d.classList.remove('active');
      showToast('Switched energy telemetry to Last 7 Days', 'info');
    } else {
      elements.btnRange30d.classList.add('active');
      elements.btnRange7d.classList.remove('active');
      showToast('Switched energy telemetry to Last 30 Days', 'info');
    }

    updateKPIs();
    renderConsumptionChart();
  }

  /**
   * Setup Event Listeners
   */
  function initEventListeners() {
    // 1. Sidebar Navigation
    elements.sidebarNavList.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (!navItem) return;

      const view = navItem.dataset.view;
      if (view) {
        switchView(view);
      }
    });

    // Return to overview button from placeholder
    elements.btnReturnOverview.addEventListener('click', () => {
      switchView('overview');
    });

    // 2. Mobile Drawer Toggle
    elements.mobileMenuBtn.addEventListener('click', () => {
      elements.sidebar.classList.toggle('mobile-open');
      elements.sidebarOverlay.classList.toggle('active');
    });

    elements.sidebarOverlay.addEventListener('click', () => {
      elements.sidebar.classList.remove('mobile-open');
      elements.sidebarOverlay.classList.remove('active');
    });

    // 3. Building Selector Change
    elements.buildingSelector.addEventListener('change', (e) => {
      handleBuildingChange(e.target.value);
    });

    // 4. Date Range Buttons
    elements.btnRange7d.addEventListener('click', () => handleDateRangeChange('7d'));
    elements.btnRange30d.addEventListener('click', () => handleDateRangeChange('30d'));

    // 5. Notifications Dropdown Toggle
    elements.notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = elements.notificationPopover.classList.toggle('active');
      elements.notificationsBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
      if (!elements.notificationPopover.contains(e.target) && !elements.notificationsBtn.contains(e.target)) {
        elements.notificationPopover.classList.remove('active');
        elements.notificationsBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Clear all notifications
    elements.clearAllNotifsBtn.addEventListener('click', () => {
      SCEO_DATA.recentAlerts.forEach(a => state.readAlerts.add(a.id));
      renderNotificationsPopover();
      updateKPIs();
      showToast('All notifications marked as read', 'success');
    });

    // 6. Action Detail Modal Controls
    elements.modalCloseBtn.addEventListener('click', closeActionModal);
    elements.modalDismissBtn.addEventListener('click', closeActionModal);
    elements.modalResolveBtn.addEventListener('click', resolveCurrentAction);

    // Close modal on backdrop click
    elements.actionModal.addEventListener('click', (e) => {
      if (e.target === elements.actionModal) {
        closeActionModal();
      }
    });

    // 7. Global Keyboard Handlers (Escape closes open overlays)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.actionModal.classList.contains('active')) {
          closeActionModal();
        }
        if (elements.notificationPopover.classList.contains('active')) {
          elements.notificationPopover.classList.remove('active');
        }
        if (elements.sidebar.classList.contains('mobile-open')) {
          elements.sidebar.classList.remove('mobile-open');
          elements.sidebarOverlay.classList.remove('active');
        }
      }
    });
  }

  /**
   * Application Initialization
   */
  function init() {
    updateKPIs();
    renderConsumptionChart();
    renderBuildingDistribution();
    renderPriorityActions();
    renderRecentAlerts();
    renderBuildingsTable();
    renderNotificationsPopover();
    initEventListeners();

    // Initial welcome toast
    setTimeout(() => {
      showToast('Welcome to Smart Campus Energy Optimizer (SCEO) • Foundation Loaded', 'info');
    }, 400);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
