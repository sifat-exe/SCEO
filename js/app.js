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
    activeRoomInModal: null,
    heatmapMetric: 'kwhPerOccupiedHour', // 'kwhPerOccupiedHour' | 'totalKWh' | 'estimatedWasteKWh'
    heatmapSort: 'metricDesc', // 'metricDesc' | 'wasteDesc' | 'totalDesc' | 'idAsc'
    consumptionChart: null,
    distributionChart: null,
    chartJsAvailable: typeof Chart !== 'undefined',

    // Step 3: Classroom Analytics State
    selectedClassroom: 'ENG-101',
    comparedClassroom: 'ENG-102',
    classroomDateRange: '7d', // '7d' | '30d'
    classroomBuildingFilter: 'all', // 'all' | 'engineering' | 'science' | 'business'
    comparisonMetric: 'kwhPerOccupiedHour', // 'kwhPerOccupiedHour' | 'estimatedWasteKWh' | 'totalKWh'
    tableSearchQuery: '',
    caDailyChart: null,
    caOccupancyChart: null,
    caComparisonChart: null
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
    heatmapView: document.getElementById('heatmapView'),
    placeholderView: document.getElementById('placeholderView'),
    btnReturnOverview: document.getElementById('btnReturnOverview'),

    // Heatmap Controls & Summaries
    heatmapBuildingFilter: document.getElementById('heatmapBuildingFilter'),
    hmBtnRange7d: document.getElementById('hmBtnRange7d'),
    hmBtnRange30d: document.getElementById('hmBtnRange30d'),
    btnMetricIntensity: document.getElementById('btnMetricIntensity'),
    btnMetricTotal: document.getElementById('btnMetricTotal'),
    btnMetricWaste: document.getElementById('btnMetricWaste'),
    heatmapSortSelect: document.getElementById('heatmapSortSelect'),
    hmSummaryTotalEnergy: document.getElementById('hmSummaryTotalEnergy'),
    hmSummaryTotalSub: document.getElementById('hmSummaryTotalSub'),
    hmSummaryHighPriority: document.getElementById('hmSummaryHighPriority'),
    hmSummaryHighSub: document.getElementById('hmSummaryHighSub'),
    hmSummaryAvoidableEnergy: document.getElementById('hmSummaryAvoidableEnergy'),
    hmSummaryAvoidablePercent: document.getElementById('hmSummaryAvoidablePercent'),
    hmSummaryHighestRoom: document.getElementById('hmSummaryHighestRoom'),
    hmSummaryHighestRate: document.getElementById('hmSummaryHighestRate'),
    hmSummaryHighestDelta: document.getElementById('hmSummaryHighestDelta'),
    hmSummaryHighestSub: document.getElementById('hmSummaryHighestSub'),
    heatmapGridContainer: document.getElementById('heatmapGridContainer'),

    // Room Detail Modal Elements
    roomDetailModal: document.getElementById('roomDetailModal'),
    roomModalBuildingBadge: document.getElementById('roomModalBuildingBadge'),
    roomModalZone: document.getElementById('roomModalZone'),
    roomModalTitle: document.getElementById('roomModalTitle'),
    roomModalCloseBtn: document.getElementById('roomModalCloseBtn'),
    btnModalCloseRoom: document.getElementById('btnModalCloseRoom'),
    btnViewClassroomAnalytics: document.getElementById('btnViewClassroomAnalytics'),
    roomModalStatusBadge: document.getElementById('roomModalStatusBadge'),
    roomModalTypeTag: document.getElementById('roomModalTypeTag'),
    roomModalTotalKWh: document.getElementById('roomModalTotalKWh'),
    roomModalPeriodLabel: document.getElementById('roomModalPeriodLabel'),
    roomModalOccupiedHours: document.getElementById('roomModalOccupiedHours'),
    roomModalIntensity: document.getElementById('roomModalIntensity'),
    roomModalIntensitySub: document.getElementById('roomModalIntensitySub'),
    roomModalWasteKWh: document.getElementById('roomModalWasteKWh'),
    roomModalWastePercent: document.getElementById('roomModalWastePercent'),
    roomModalBenchmarkDesc: document.getElementById('roomModalBenchmarkDesc'),
    roomModalBenchmarkDelta: document.getElementById('roomModalBenchmarkDelta'),
    roomModalMeasuredBar: document.getElementById('roomModalMeasuredBar'),
    roomModalMeasuredBarVal: document.getElementById('roomModalMeasuredBarVal'),
    roomModalTargetBar: document.getElementById('roomModalTargetBar'),
    roomModalTargetBarVal: document.getElementById('roomModalTargetBarVal'),
    roomModalCausesList: document.getElementById('roomModalCausesList'),
    roomModalActionsList: document.getElementById('roomModalActionsList'),

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

    // Step 3: Classroom Analytics View Elements
    classroomAnalyticsView: document.getElementById('classroomAnalyticsView'),
    caBuildingFilter: document.getElementById('caBuildingFilter'),
    caRoomSelect: document.getElementById('caRoomSelect'),
    caBtnRange7d: document.getElementById('caBtnRange7d'),
    caBtnRange30d: document.getElementById('caBtnRange30d'),
    caCompareSelect: document.getElementById('caCompareSelect'),
    caRoomMetaBanner: document.getElementById('caRoomMetaBanner'),

    // Classroom KPI Cards
    caKpiTotalEnergy: document.getElementById('caKpiTotalEnergy'),
    caKpiTotalBadge: document.getElementById('caKpiTotalBadge'),
    caKpiTotalSub: document.getElementById('caKpiTotalSub'),
    caKpiIntensity: document.getElementById('caKpiIntensity'),
    caKpiIntensityBadge: document.getElementById('caKpiIntensityBadge'),
    caKpiIntensitySub: document.getElementById('caKpiIntensitySub'),
    caKpiOccupiedHours: document.getElementById('caKpiOccupiedHours'),
    caKpiOccupiedPercent: document.getElementById('caKpiOccupiedPercent'),
    caKpiOccupiedSub: document.getElementById('caKpiOccupiedSub'),
    caKpiAvoidableEnergy: document.getElementById('caKpiAvoidableEnergy'),
    caKpiAvoidablePercent: document.getElementById('caKpiAvoidablePercent'),
    caKpiAvoidableSub: document.getElementById('caKpiAvoidableSub'),
    caKpiBenchmarkDelta: document.getElementById('caKpiBenchmarkDelta'),
    caKpiBenchmarkUnit: document.getElementById('caKpiBenchmarkUnit'),
    caKpiBenchmarkBadge: document.getElementById('caKpiBenchmarkBadge'),
    caKpiBenchmarkSub: document.getElementById('caKpiBenchmarkSub'),

    // Classroom Charts
    caDailyChartCanvas: document.getElementById('caDailyChart'),
    caDailyChartSub: document.getElementById('caDailyChartSub'),
    caDailyChartFallback: document.getElementById('caDailyChartFallback'),
    caOccupancyChartCanvas: document.getElementById('caOccupancyChart'),
    caOccupancyCallout: document.getElementById('caOccupancyCallout'),
    caOccupancyChartFallback: document.getElementById('caOccupancyChartFallback'),
    caComparisonChartCanvas: document.getElementById('caComparisonChart'),
    caComparisonChartSub: document.getElementById('caComparisonChartSub'),
    caComparisonSummaryBar: document.getElementById('caComparisonSummaryBar'),
    caComparisonChartFallback: document.getElementById('caComparisonChartFallback'),
    btnCompIntensity: document.getElementById('btnCompIntensity'),
    btnCompWaste: document.getElementById('btnCompWaste'),
    btnCompTotal: document.getElementById('btnCompTotal'),

    // Insights & Recommendations
    caInsightsList: document.getElementById('caInsightsList'),
    caBtnViewInHeatmap: document.getElementById('caBtnViewInHeatmap'),

    // Estimator
    estAvoidableKW: document.getElementById('estAvoidableKW'),
    estHoursPerDay: document.getElementById('estHoursPerDay'),
    estDays: document.getElementById('estDays'),
    estTariff: document.getElementById('estTariff'),
    btnEstPreset7d: document.getElementById('btnEstPreset7d'),
    btnEstPreset30d: document.getElementById('btnEstPreset30d'),
    btnEstPreset90d: document.getElementById('btnEstPreset90d'),
    btnEstPreset180d: document.getElementById('btnEstPreset180d'),
    btnLoadRoomWaste: document.getElementById('btnLoadRoomWaste'),
    estResultKWh: document.getElementById('estResultKWh'),
    estResultKWhSub: document.getElementById('estResultKWhSub'),
    estResultCost: document.getElementById('estResultCost'),
    estResultCostSub: document.getElementById('estResultCostSub'),
    estResultCO2: document.getElementById('estResultCO2'),

    // Table
    caTableSearchInput: document.getElementById('caTableSearchInput'),
    caTableCountBadge: document.getElementById('caTableCountBadge'),
    caRoomsTableBody: document.getElementById('caRoomsTableBody'),
    caTableEmptyState: document.getElementById('caTableEmptyState'),

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
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Campus Overview';
      elements.topBreadcrumb.textContent = 'Campus Management / Overview';
    } else if (viewKey === 'energy-heatmap') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'block';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Energy Waste Heatmap';
      elements.topBreadcrumb.textContent = 'Campus Management / Energy Waste Heatmap';

      // Sync building selector & date controls
      if (elements.heatmapBuildingFilter) {
        elements.heatmapBuildingFilter.value = state.selectedBuilding;
      }
      syncHeatmapDateButtons();
      renderHeatmap();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewKey === 'classroom-analytics') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'block';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Classroom Analytics';
      elements.topBreadcrumb.textContent = 'Campus Management / Classroom Analytics';

      // Sync building filter and date buttons
      if (elements.caBuildingFilter) {
        elements.caBuildingFilter.value = state.classroomBuildingFilter;
      }
      syncClassroomDateButtons();
      populateClassroomSelectors();
      renderClassroomAnalytics();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show Coming Soon Placeholder
      const modInfo = SCEO_DATA.navigationModules[viewKey] || {
        title: 'Module',
        code: 'MODULE',
        description: 'Under development.',
        nextStepFeatures: []
      };

      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      elements.placeholderView.style.display = 'block';

      elements.placeholderCode.textContent = modInfo.code || 'NEXT STAGE';
      elements.placeholderTitle.textContent = modInfo.title;
      elements.placeholderDesc.textContent = `${modInfo.description} Full interactive modeling will be implemented in the next build stage.`;
      
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
   * Helper: Sync Heatmap date range buttons with active state
   */
  function syncHeatmapDateButtons() {
    if (!elements.hmBtnRange7d || !elements.hmBtnRange30d) return;
    if (state.dateRange === '7d') {
      elements.hmBtnRange7d.classList.add('active');
      elements.hmBtnRange30d.classList.remove('active');
    } else {
      elements.hmBtnRange30d.classList.add('active');
      elements.hmBtnRange7d.classList.remove('active');
    }
  }

  /**
   * Render Energy Waste Heatmap (Step 2 Implementation)
   */
  function renderHeatmap() {
    if (!elements.heatmapGridContainer) return;

    const periodKey = state.dateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const periodLabel = state.dateRange === '30d' ? 'Last 30 Days' : 'Last 7 Days';

    // 1. Filter classrooms by current building scope
    const allRooms = SCEO_DATA.classrooms;
    const filteredRooms = allRooms.filter(room => {
      if (state.selectedBuilding === 'all') return true;
      return room.buildingId === state.selectedBuilding;
    });

    // 2. Calculate dynamic summary values from filtered dataset
    const totalKWh = filteredRooms.reduce((acc, r) => acc + (r[periodKey]?.totalKWh || 0), 0);
    const avoidableWasteKWh = filteredRooms.reduce((acc, r) => acc + (r[periodKey]?.estimatedWasteKWh || 0), 0);
    const avoidablePercent = totalKWh > 0 ? ((avoidableWasteKWh / totalKWh) * 100).toFixed(1) : '0.0';
    const highPriorityCount = filteredRooms.filter(r => {
      const s = r[periodKey]?.status;
      return s === 'red' || s === 'orange';
    }).length;

    // Find room with highest energy per occupied hour
    let highestRoom = null;
    let maxIntensity = -1;
    filteredRooms.forEach(r => {
      const intensity = r[periodKey]?.kwhPerOccupiedHour || 0;
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
        highestRoom = r;
      }
    });

    // Update Summary Cards DOM
    if (elements.hmSummaryTotalEnergy) {
      elements.hmSummaryTotalEnergy.textContent = formatNumber(totalKWh);
      elements.hmSummaryTotalSub.textContent = `Across ${filteredRooms.length} classrooms (${periodLabel})`;
    }
    if (elements.hmSummaryHighPriority) {
      elements.hmSummaryHighPriority.textContent = highPriorityCount;
      elements.hmSummaryHighSub.textContent = highPriorityCount > 0
        ? `${highPriorityCount} rooms in orange/red status`
        : 'All rooms within acceptable thresholds';
    }
    if (elements.hmSummaryAvoidableEnergy) {
      elements.hmSummaryAvoidableEnergy.textContent = formatNumber(avoidableWasteKWh);
      elements.hmSummaryAvoidablePercent.textContent = `${avoidablePercent}%`;
    }
    if (elements.hmSummaryHighestRoom) {
      if (highestRoom) {
        elements.hmSummaryHighestRoom.textContent = highestRoom.id;
        elements.hmSummaryHighestRate.textContent = `${highestRoom[periodKey].kwhPerOccupiedHour} kWh/hr`;
        const benchmark = highestRoom[periodKey].benchmarkKwhPerHour;
        const delta = Math.round(((highestRoom[periodKey].kwhPerOccupiedHour - benchmark) / benchmark) * 100);
        elements.hmSummaryHighestDelta.textContent = `${delta >= 0 ? '+' : ''}${delta}%`;
        elements.hmSummaryHighestDelta.className = delta > 20 ? 'trend-badge warning' : 'trend-badge positive';
        elements.hmSummaryHighestSub.textContent = `Target: ${benchmark} kWh/hr (${highestRoom.roomType})`;
      } else {
        elements.hmSummaryHighestRoom.textContent = 'None';
        elements.hmSummaryHighestRate.textContent = '-';
        elements.hmSummaryHighestDelta.textContent = '-';
        elements.hmSummaryHighestSub.textContent = 'No rooms available';
      }
    }

    // 3. Sort classrooms
    const sortedRooms = [...filteredRooms].sort((a, b) => {
      const mA = a[periodKey];
      const mB = b[periodKey];
      if (state.heatmapSort === 'wasteDesc') {
        return (mB.estimatedWasteKWh || 0) - (mA.estimatedWasteKWh || 0);
      } else if (state.heatmapSort === 'totalDesc') {
        return (mB.totalKWh || 0) - (mA.totalKWh || 0);
      } else if (state.heatmapSort === 'idAsc') {
        return a.id.localeCompare(b.id);
      } else {
        // Default: metricDesc based on selected heatmapMetric
        if (state.heatmapMetric === 'totalKWh') {
          return (mB.totalKWh || 0) - (mA.totalKWh || 0);
        } else if (state.heatmapMetric === 'estimatedWasteKWh') {
          return (mB.estimatedWasteKWh || 0) - (mA.estimatedWasteKWh || 0);
        } else {
          return (mB.kwhPerOccupiedHour || 0) - (mA.kwhPerOccupiedHour || 0);
        }
      }
    });

    // 4. Group by building & build HTML
    elements.heatmapGridContainer.innerHTML = '';

    if (sortedRooms.length === 0) {
      elements.heatmapGridContainer.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center; color: var(--color-text-muted);">
          <h3>No classrooms match the current filter criteria.</h3>
        </div>
      `;
      return;
    }

    // Determine building groups to render
    const buildingsToRender = state.selectedBuilding === 'all'
      ? SCEO_DATA.buildings
      : SCEO_DATA.buildings.filter(b => b.id === state.selectedBuilding);

    buildingsToRender.forEach(bldg => {
      const bldgRooms = sortedRooms.filter(r => r.buildingId === bldg.id);
      if (bldgRooms.length === 0) return;

      const groupWrapper = document.createElement('div');
      groupWrapper.className = 'heatmap-building-group';

      const bldgTotalKWh = bldgRooms.reduce((acc, r) => acc + (r[periodKey]?.totalKWh || 0), 0);
      const bldgWasteKWh = bldgRooms.reduce((acc, r) => acc + (r[periodKey]?.estimatedWasteKWh || 0), 0);

      // Building Group Banner
      const header = document.createElement('div');
      header.className = 'building-group-header';
      header.innerHTML = `
        <div class="building-group-title-box">
          <span class="bldg-badge-code" style="background-color: rgba(255, 255, 255, 0.2); color: #FFF;">${bldg.code}</span>
          <span class="building-group-name">${bldg.name}</span>
          <span style="font-size: 12px; opacity: 0.8;">(${bldgRooms.length} Classrooms Monitored)</span>
        </div>
        <div class="building-group-stats">
          <span>Baseline: <strong>${bldg.currentBaselineKW} kW</strong></span>
          <span>Period Consumption: <strong>${formatNumber(bldgTotalKWh)} kWh</strong></span>
          <span style="color: #FCD34D;">Est. Waste: <strong>${formatNumber(bldgWasteKWh)} kWh</strong></span>
        </div>
      `;
      groupWrapper.appendChild(header);

      // Grid of Cards
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'heatmap-cards-grid';

      bldgRooms.forEach(room => {
        const metrics = room[periodKey];
        const status = metrics.status || 'green';
        const card = document.createElement('div');
        card.id = `roomCard-${room.id}`;
        card.className = `room-card status-${status}`;
        card.setAttribute('data-room-id', room.id);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${room.name}, status ${metrics.statusLabel}`);

        // Spotlight metric based on state.heatmapMetric
        let spotlightLabel = 'Energy / Occupied Hr';
        let spotlightValue = `${metrics.kwhPerOccupiedHour}`;
        let spotlightUnit = 'kWh/hr';
        let spotlightDeltaHtml = '';

        if (state.heatmapMetric === 'totalKWh') {
          spotlightLabel = 'Total Energy';
          spotlightValue = formatNumber(metrics.totalKWh);
          spotlightUnit = 'kWh';
          const pct = ((metrics.totalKWh / bldgTotalKWh) * 100).toFixed(1);
          spotlightDeltaHtml = `<span class="spotlight-delta" style="color: var(--color-primary);">${pct}% of bldg</span>`;
        } else if (state.heatmapMetric === 'estimatedWasteKWh') {
          spotlightLabel = 'Estimated Waste';
          spotlightValue = formatNumber(metrics.estimatedWasteKWh);
          spotlightUnit = 'kWh';
          spotlightDeltaHtml = `<span class="spotlight-delta" style="color: ${metrics.estimatedWasteKWh > 10 ? 'var(--color-danger)' : 'var(--color-warning)'};">${metrics.wastePercentage}% waste</span>`;
        } else {
          // Default: kwhPerOccupiedHour
          spotlightLabel = 'Energy / Occupied Hr';
          spotlightValue = `${metrics.kwhPerOccupiedHour}`;
          spotlightUnit = 'kWh/hr';
          const diff = metrics.kwhPerOccupiedHour - metrics.benchmarkKwhPerHour;
          const diffPct = Math.round((diff / metrics.benchmarkKwhPerHour) * 100);
          const deltaColor = diff > 0 ? (diffPct > 35 ? 'var(--color-danger)' : 'var(--color-warning)') : 'var(--color-success)';
          spotlightDeltaHtml = `<span class="spotlight-delta" style="color: ${deltaColor};">${diffPct >= 0 ? '+' : ''}${diffPct}% vs target</span>`;
        }

        card.innerHTML = `
          <div class="room-card-header">
            <div class="room-card-id-box">
              <span class="room-id-tag">${room.id}</span>
              <span class="room-meta-sub">${room.roomType} • ${room.capacity} seats • ${room.floor}</span>
            </div>
            <span class="room-status-pill ${status}">
              ${metrics.statusLabel}
            </span>
          </div>

          <div class="room-metric-spotlight">
            <div class="spotlight-metric-info">
              <span class="spotlight-metric-label">${spotlightLabel}</span>
              <div class="spotlight-metric-val">
                ${spotlightValue} <span>${spotlightUnit}</span>
              </div>
            </div>
            ${spotlightDeltaHtml}
          </div>

          <div class="room-micro-metrics">
            <div class="micro-metric-item">
              <span class="micro-metric-label">Occupied</span>
              <span class="micro-metric-value">${metrics.occupiedHours} hrs</span>
            </div>
            <div class="micro-metric-item">
              <span class="micro-metric-label">Gross Draw</span>
              <span class="micro-metric-value">${metrics.totalKWh} kWh</span>
            </div>
            <div class="micro-metric-item">
              <span class="micro-metric-label">Est. Waste</span>
              <span class="micro-metric-value" style="color: ${metrics.estimatedWasteKWh > 0 ? 'var(--color-danger)' : 'var(--color-success)'};">
                ${metrics.estimatedWasteKWh} kWh
              </span>
            </div>
          </div>

          <div class="room-card-footer">
            <div class="room-telemetry-tag">
              <span style="width: 7px; height: 7px; border-radius: 50%; background-color: ${status === 'red' ? '#DC2626' : (status === 'orange' ? '#EA580C' : (status === 'yellow' ? '#CA8A04' : '#16A34A'))};"></span>
              <span>${room.hvacStatus}</span>
            </div>
            <span class="room-inspect-link">
              Inspect Room
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </div>
        `;

        card.addEventListener('click', () => openRoomModal(room.id));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openRoomModal(room.id);
          }
        });

        cardsGrid.appendChild(card);
      });

      groupWrapper.appendChild(cardsGrid);
      elements.heatmapGridContainer.appendChild(groupWrapper);
    });
  }

  /**
   * Open Classroom Detail Modal (Step 2)
   */
  function openRoomModal(roomId) {
    const room = SCEO_DATA.classrooms.find(r => r.id === roomId);
    if (!room || !elements.roomDetailModal) return;

    state.activeRoomInModal = room;
    const periodKey = state.dateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const periodLabel = state.dateRange === '30d' ? 'Last 30 Days' : 'Last 7 Days';
    const metrics = room[periodKey];

    // Populate Header & Meta
    elements.roomModalBuildingBadge.textContent = room.buildingName;
    elements.roomModalZone.textContent = `${room.hvacZone} • ${room.floor}`;
    elements.roomModalTitle.textContent = `${room.name}`;

    elements.roomModalStatusBadge.className = `room-status-badge ${metrics.status}`;
    elements.roomModalStatusBadge.textContent = metrics.statusLabel;
    elements.roomModalTypeTag.textContent = `${room.roomType} • Capacity: ${room.capacity} Seats • ${room.occupancyState}`;

    // Populate 4 Stats Cards
    elements.roomModalTotalKWh.textContent = formatNumber(metrics.totalKWh);
    elements.roomModalPeriodLabel.textContent = periodLabel;
    elements.roomModalOccupiedHours.textContent = metrics.occupiedHours;
    elements.roomModalIntensity.textContent = metrics.kwhPerOccupiedHour;
    
    const intensityDiff = metrics.kwhPerOccupiedHour - metrics.benchmarkKwhPerHour;
    const intensityDiffPct = Math.round((intensityDiff / metrics.benchmarkKwhPerHour) * 100);
    elements.roomModalIntensitySub.textContent = `${intensityDiffPct >= 0 ? '+' : ''}${intensityDiffPct}% vs benchmark`;

    elements.roomModalWasteKWh.textContent = formatNumber(metrics.estimatedWasteKWh);
    elements.roomModalWastePercent.textContent = `${metrics.wastePercentage}% of room consumption`;

    // Benchmark Comparison
    elements.roomModalBenchmarkDesc.textContent = `Expected efficient target for ${room.roomType} (${room.capacity} seats): ${metrics.benchmarkKwhPerHour} kWh/hr.`;
    
    const deltaKWh = (metrics.kwhPerOccupiedHour - metrics.benchmarkKwhPerHour).toFixed(2);
    if (deltaKWh > 0) {
      elements.roomModalBenchmarkDelta.className = 'benchmark-delta-pill';
      elements.roomModalBenchmarkDelta.textContent = `+${deltaKWh} kWh/hr above benchmark (+${intensityDiffPct}%)`;
    } else {
      elements.roomModalBenchmarkDelta.className = 'benchmark-delta-pill optimal';
      elements.roomModalBenchmarkDelta.textContent = `${Math.abs(deltaKWh)} kWh/hr below baseline (Efficient)`;
    }

    // Benchmark Progress Bars
    const maxBarRate = Math.max(metrics.kwhPerOccupiedHour, metrics.benchmarkKwhPerHour, 6) * 1.15;
    const measuredPct = Math.min(100, Math.round((metrics.kwhPerOccupiedHour / maxBarRate) * 100));
    const targetPct = Math.min(100, Math.round((metrics.benchmarkKwhPerHour / maxBarRate) * 100));

    elements.roomModalMeasuredBar.style.width = `${measuredPct}%`;
    elements.roomModalMeasuredBar.style.backgroundColor = metrics.status === 'red' ? '#DC2626' : (metrics.status === 'orange' ? '#EA580C' : (metrics.status === 'yellow' ? '#CA8A04' : '#16A34A'));
    elements.roomModalMeasuredBarVal.textContent = `${metrics.kwhPerOccupiedHour} kWh/hr`;

    elements.roomModalTargetBar.style.width = `${targetPct}%`;
    elements.roomModalTargetBarVal.textContent = `${metrics.benchmarkKwhPerHour} kWh/hr`;

    // Populate Causes of Waste List
    elements.roomModalCausesList.innerHTML = '';
    if (metrics.wasteCauses && metrics.wasteCauses.length > 0) {
      metrics.wasteCauses.forEach(cause => {
        const li = document.createElement('li');
        li.textContent = cause;
        elements.roomModalCausesList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.style.color = 'var(--color-success-text)';
      li.textContent = 'No significant waste indicators detected; operating within efficient envelope.';
      elements.roomModalCausesList.appendChild(li);
    }

    // Populate Recommended Actions List
    elements.roomModalActionsList.innerHTML = '';
    if (metrics.recommendedActions && metrics.recommendedActions.length > 0) {
      metrics.recommendedActions.forEach(action => {
        const li = document.createElement('li');
        li.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${action}</span>
        `;
        elements.roomModalActionsList.appendChild(li);
      });
    }

    // Show Modal
    elements.roomDetailModal.classList.add('active');
  }

  /**
   * Close Classroom Detail Modal
   */
  function closeRoomModal() {
    if (!elements.roomDetailModal) return;
    elements.roomDetailModal.classList.remove('active');
    state.activeRoomInModal = null;
  }

  /* ==========================================================================
     CLASSROOM ANALYTICS (Step 3 Implementation)
     ========================================================================== */

  /**
   * Sync Date Range Buttons for Classroom Analytics
   */
  function syncClassroomDateButtons() {
    if (!elements.caBtnRange7d || !elements.caBtnRange30d) return;
    if (state.classroomDateRange === '7d') {
      elements.caBtnRange7d.classList.add('active');
      elements.caBtnRange30d.classList.remove('active');
    } else {
      elements.caBtnRange7d.classList.remove('active');
      elements.caBtnRange30d.classList.add('active');
    }
  }

  /**
   * Populate Classroom and Comparison Selectors based on Building Filter
   */
  function populateClassroomSelectors() {
    if (!elements.caRoomSelect || !elements.caCompareSelect) return;

    const bldgFilter = state.classroomBuildingFilter;
    const availableRooms = bldgFilter === 'all'
      ? SCEO_DATA.classrooms
      : SCEO_DATA.classrooms.filter(r => r.buildingId === bldgFilter);

    // If currently selected room is not in available rooms, default to first available
    const hasSelected = availableRooms.some(r => r.id === state.selectedClassroom);
    if (!hasSelected && availableRooms.length > 0) {
      state.selectedClassroom = availableRooms[0].id;
    }

    // Populate Target Classroom Selector
    elements.caRoomSelect.innerHTML = '';
    availableRooms.forEach(room => {
      const opt = document.createElement('option');
      opt.value = room.id;
      opt.textContent = `${room.id} - ${room.roomType} (${room.capacity} seats)`;
      if (room.id === state.selectedClassroom) opt.selected = true;
      elements.caRoomSelect.appendChild(opt);
    });

    // Populate Comparison Classroom Selector (includes all campus rooms)
    elements.caCompareSelect.innerHTML = '';
    const compRooms = SCEO_DATA.classrooms;
    if (!state.comparedClassroom || state.comparedClassroom === state.selectedClassroom) {
      const other = compRooms.find(r => r.id !== state.selectedClassroom) || compRooms[0];
      state.comparedClassroom = other ? other.id : '';
    }

    compRooms.forEach(room => {
      const opt = document.createElement('option');
      opt.value = room.id;
      opt.textContent = `${room.id} (${room.roomType}, ${room.capacity} seats)`;
      if (room.id === state.comparedClassroom) opt.selected = true;
      elements.caCompareSelect.appendChild(opt);
    });
  }

  /**
   * Master Renderer for Classroom Analytics
   */
  function renderClassroomAnalytics() {
    if (!elements.classroomAnalyticsView) return;

    // Get active room
    let room = SCEO_DATA.classrooms.find(r => r.id === state.selectedClassroom);
    if (!room) {
      room = SCEO_DATA.classrooms[0];
      if (room) state.selectedClassroom = room.id;
    }
    if (!room) return;

    // Get comparison room
    let comparedRoom = SCEO_DATA.classrooms.find(r => r.id === state.comparedClassroom);
    if (!comparedRoom || comparedRoom.id === room.id) {
      comparedRoom = SCEO_DATA.classrooms.find(r => r.id !== room.id) || room;
      state.comparedClassroom = comparedRoom.id;
    }

    renderClassroomMetaBanner(room);
    renderClassroomSummaryCards(room);
    renderClassroomDailyChart(room);
    renderClassroomOccupancyChart(room);
    renderClassroomComparisonChart(room, comparedRoom);
    renderClassroomInsights(room, comparedRoom);
    renderClassroomComparisonTable();
    calculateSavingOpportunity();
  }

  /**
   * Render Room Meta Banner
   */
  function renderClassroomMetaBanner(room) {
    if (!elements.caRoomMetaBanner) return;

    const periodKey = state.classroomDateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const periodData = room[periodKey] || room.sevenDays;
    const status = periodData.status || 'green';

    let statusPillClass = 'green';
    let statusPillLabel = 'Low Relative Consumption';
    if (status === 'red') {
      statusPillClass = 'red';
      statusPillLabel = 'Very High / Waste Issue';
    } else if (status === 'orange') {
      statusPillClass = 'orange';
      statusPillLabel = 'High Consumption';
    } else if (status === 'yellow') {
      statusPillClass = 'yellow';
      statusPillLabel = 'Moderate Consumption';
    }

    elements.caRoomMetaBanner.innerHTML = `
      <div class="room-meta-info-left">
        <div class="room-meta-title-group">
          <h3>${room.name}</h3>
        </div>
        <div class="room-meta-badges">
          <span class="room-meta-chip primary">${room.buildingName}</span>
          <span class="room-meta-chip">${room.roomType}</span>
          <span class="room-meta-chip">${room.capacity} Seats</span>
          <span class="room-meta-chip">${room.floor} • ${room.hvacZone}</span>
        </div>
      </div>
      <div class="room-meta-info-right">
        <div class="telemetry-live-pill" title="Simulated real-time draw">
          <span class="dot"></span>
          <span>Live Draw: ${room.currentPowerKW} kW</span>
        </div>
        <span class="room-status-badge ${statusPillClass}">${statusPillLabel}</span>
      </div>
    `;
  }

  /**
   * Render 5 Performance Summary Cards
   */
  function renderClassroomSummaryCards(room) {
    const is30d = state.classroomDateRange === '30d';
    const periodKey = is30d ? 'thirtyDays' : 'sevenDays';
    const periodData = room[periodKey] || room.sevenDays || {};

    const totalKWh = Number(periodData.totalKWh) || 0;
    const occupiedHours = Number(periodData.occupiedHours) || 0;
    const avoidableKWh = Number(periodData.estimatedWasteKWh) || 0;
    const wastePercent = Number(periodData.wastePercentage) || 0;
    const benchmark = Number(periodData.benchmarkKwhPerHour) || 4.5;

    // Safe Intensity Calculation (prevent divide-by-zero)
    const intensity = occupiedHours > 0
      ? (totalKWh / occupiedHours).toFixed(1)
      : (periodData.kwhPerOccupiedHour ? periodData.kwhPerOccupiedHour.toFixed(1) : '0.0');

    // 1. Total Energy Consumed
    if (elements.caKpiTotalEnergy) elements.caKpiTotalEnergy.textContent = totalKWh.toLocaleString('en-US');
    if (elements.caKpiTotalSub) elements.caKpiTotalSub.textContent = `Period total (${is30d ? '30 days' : '7 days'})`;
    if (elements.caKpiTotalBadge) {
      elements.caKpiTotalBadge.textContent = 'Simulated Draw';
      elements.caKpiTotalBadge.className = 'trend-badge positive';
    }

    // 2. Energy per Occupied Hour
    if (elements.caKpiIntensity) elements.caKpiIntensity.textContent = intensity;
    if (elements.caKpiIntensitySub) elements.caKpiIntensitySub.textContent = `Benchmark target: ${benchmark} kWh/hr`;
    if (elements.caKpiIntensityBadge) {
      const diffVsTarget = benchmark > 0 ? Math.round(((parseFloat(intensity) - benchmark) / benchmark) * 100) : 0;
      if (diffVsTarget > 15) {
        elements.caKpiIntensityBadge.textContent = `+${diffVsTarget}% vs target`;
        elements.caKpiIntensityBadge.className = 'trend-badge warning';
      } else if (diffVsTarget <= 0) {
        elements.caKpiIntensityBadge.textContent = `${diffVsTarget}% efficient`;
        elements.caKpiIntensityBadge.className = 'trend-badge positive';
      } else {
        elements.caKpiIntensityBadge.textContent = `+${diffVsTarget}% acceptable`;
        elements.caKpiIntensityBadge.className = 'trend-badge';
      }
    }

    // 3. Occupied Hours
    if (elements.caKpiOccupiedHours) elements.caKpiOccupiedHours.textContent = occupiedHours.toLocaleString('en-US');
    if (elements.caKpiOccupiedPercent) {
      const maxAcademicHrs = is30d ? 200 : 50;
      const utilPct = maxAcademicHrs > 0 ? Math.min(100, Math.round((occupiedHours / maxAcademicHrs) * 100)) : 0;
      elements.caKpiOccupiedPercent.textContent = `${utilPct}% Utilized`;
      elements.caKpiOccupiedPercent.className = 'trend-badge positive';
    }
    if (elements.caKpiOccupiedSub) elements.caKpiOccupiedSub.textContent = 'Timetable + PIR schedule';

    // 4. Estimated Avoidable Energy
    if (elements.caKpiAvoidableEnergy) elements.caKpiAvoidableEnergy.textContent = avoidableKWh.toLocaleString('en-US');
    if (elements.caKpiAvoidablePercent) {
      elements.caKpiAvoidablePercent.textContent = `${wastePercent}% Waste`;
      elements.caKpiAvoidablePercent.className = wastePercent > 12 ? 'trend-badge warning' : 'trend-badge positive';
    }
    if (elements.caKpiAvoidableSub) elements.caKpiAvoidableSub.textContent = 'Estimated recoverable waste';

    // 5. Performance Compared with Similar Classrooms
    const similarRooms = SCEO_DATA.classrooms.filter(r => r.roomType === room.roomType);
    const roomsToCompare = similarRooms.length > 1 ? similarRooms : SCEO_DATA.classrooms;

    let totalSimIntensity = 0;
    let validCount = 0;
    roomsToCompare.forEach(r => {
      const m = r[periodKey] || r.sevenDays;
      if (m && m.kwhPerOccupiedHour) {
        totalSimIntensity += m.kwhPerOccupiedHour;
        validCount++;
      }
    });

    const categoryAvgIntensity = validCount > 0 ? (totalSimIntensity / validCount) : benchmark;
    const diffPct = categoryAvgIntensity > 0
      ? Math.round(((parseFloat(intensity) - categoryAvgIntensity) / categoryAvgIntensity) * 100)
      : 0;

    if (elements.caKpiBenchmarkDelta) {
      elements.caKpiBenchmarkDelta.textContent = `${diffPct >= 0 ? '+' : ''}${diffPct}%`;
    }
    if (elements.caKpiBenchmarkUnit) {
      elements.caKpiBenchmarkUnit.textContent = `vs ${room.roomType}s`;
    }
    if (elements.caKpiBenchmarkSub) {
      elements.caKpiBenchmarkSub.textContent = `Category avg: ${categoryAvgIntensity.toFixed(1)} kWh/hr`;
    }
    if (elements.caKpiBenchmarkBadge) {
      if (diffPct > 15) {
        elements.caKpiBenchmarkBadge.textContent = 'High Relative Draw';
        elements.caKpiBenchmarkBadge.className = 'trend-badge warning';
      } else if (diffPct < -5) {
        elements.caKpiBenchmarkBadge.textContent = 'Better Than Avg';
        elements.caKpiBenchmarkBadge.className = 'trend-badge positive';
      } else {
        elements.caKpiBenchmarkBadge.textContent = 'Typical Performance';
        elements.caKpiBenchmarkBadge.className = 'trend-badge';
      }
    }
  }

  /**
   * Helper: Generate Daily Readings for a Classroom that sum exactly to totalKWh
   */
  function generateRoomDailyData(room, is30d) {
    const periodKey = is30d ? 'thirtyDays' : 'sevenDays';
    const periodData = room[periodKey] || room.sevenDays;
    const totalKWh = periodData.totalKWh || 100;
    const isWasteful = periodData.status === 'red' || periodData.status === 'orange';

    if (!is30d) {
      // 7 days weights: Mon, Tue, Wed, Thu, Fri, Sat, Sun
      const weights = isWasteful
        ? [0.16, 0.17, 0.18, 0.17, 0.16, 0.08, 0.08]
        : [0.18, 0.19, 0.20, 0.19, 0.18, 0.03, 0.03];
      
      let sum = 0;
      const daily = weights.map((w, idx) => {
        if (idx === weights.length - 1) {
          return Math.max(1, totalKWh - sum);
        }
        const val = Math.round(totalKWh * w);
        sum += val;
        return val;
      });

      // Baseline target curve
      const baselineVal = Math.round((periodData.benchmarkKwhPerHour || 4.5) * (periodData.occupiedHours / 5) * 0.9);
      const baseline = daily.map((_, i) => (i >= 5 ? Math.round(baselineVal * 0.25) : baselineVal));

      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        consumption: daily,
        baseline: baseline
      };
    } else {
      // 30 days
      const labels = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);
      const baseDaily = totalKWh / 30;
      let sum = 0;
      const daily = labels.map((_, i) => {
        const isWeekend = (i % 7 >= 5);
        const factor = isWeekend ? (isWasteful ? 0.6 : 0.25) : 1.15;
        if (i === 29) {
          return Math.max(1, totalKWh - sum);
        }
        const val = Math.round(baseDaily * factor);
        sum += val;
        return val;
      });

      const baselineDaily = Math.round(baseDaily * 0.75);
      const baseline = labels.map((_, i) => (i % 7 >= 5 ? Math.round(baselineDaily * 0.3) : baselineDaily));

      return {
        labels: labels,
        consumption: daily,
        baseline: baseline
      };
    }
  }

  /**
   * Render Chart A: Daily Energy Consumption
   */
  function renderClassroomDailyChart(room) {
    const is30d = state.classroomDateRange === '30d';
    const dailyData = generateRoomDailyData(room, is30d);

    if (elements.caDailyChartSub) {
      elements.caDailyChartSub.textContent = `Daily energy consumed (${is30d ? '30 days' : '7 days'}) for ${room.id} vs baseline target`;
    }

    if (state.chartJsAvailable && elements.caDailyChartCanvas) {
      if (elements.caDailyChartFallback) elements.caDailyChartFallback.style.display = 'none';
      elements.caDailyChartCanvas.style.display = 'block';

      if (state.caDailyChart) {
        state.caDailyChart.data.labels = dailyData.labels;
        state.caDailyChart.data.datasets[0].data = dailyData.consumption;
        state.caDailyChart.data.datasets[0].label = `${room.id} Daily kWh`;
        state.caDailyChart.data.datasets[1].data = dailyData.baseline;
        state.caDailyChart.update();
      } else {
        const ctx = elements.caDailyChartCanvas.getContext('2d');
        state.caDailyChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: dailyData.labels,
            datasets: [
              {
                type: 'bar',
                label: `${room.id} Daily kWh`,
                data: dailyData.consumption,
                backgroundColor: 'rgba(23, 107, 115, 0.85)',
                hoverBackgroundColor: '#12545A',
                borderRadius: 4,
                order: 2
              },
              {
                type: 'line',
                label: 'Baseline Target',
                data: dailyData.baseline,
                borderColor: '#94A3B8',
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: '#94A3B8',
                pointRadius: is30d ? 0 : 3,
                fill: false,
                tension: 0.2,
                order: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0F172A',
                titleFont: { family: 'Inter', size: 12 },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                callbacks: {
                  label: (context) => ` ${context.dataset.label}: ${context.parsed.y} kWh`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' }
              },
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(226, 232, 240, 0.8)' },
                ticks: {
                  font: { family: 'Inter', size: 11 },
                  color: '#64748B',
                  callback: (value) => `${value} kWh`
                }
              }
            }
          }
        });
      }
    } else if (elements.caDailyChartFallback) {
      elements.caDailyChartCanvas.style.display = 'none';
      elements.caDailyChartFallback.style.display = 'flex';
      elements.caDailyChartFallback.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: flex-end; height: 180px; width: 100%; padding: 10px;">
          ${dailyData.consumption.slice(0, 7).map((val, i) => `
            <div style="flex: 1; text-align: center;">
              <div style="background: #176B73; height: ${Math.min(140, Math.max(10, val * 3))}px; border-radius: 4px;"></div>
              <div style="font-size: 11px; margin-top: 4px; color: #64748B;">${dailyData.labels[i]}</div>
              <div style="font-size: 10px; font-weight: 600;">${val}k</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  /**
   * Render Chart B: Occupancy vs. Energy Profile (24h Typical Day)
   */
  function renderClassroomOccupancyChart(room) {
    const periodKey = state.classroomDateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const periodData = room[periodKey] || room.sevenDays;
    const isWasteful = periodData.status === 'red' || periodData.status === 'orange';

    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    
    // Scheduled occupancy: 1 = Occupied (classes in session), 0 = Empty
    const occupancySchedule = [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0];

    // Power curve generation (kW)
    const peakKW = parseFloat((room.capacity * 0.045 + 2.2).toFixed(1));
    const idleKW = isWasteful ? parseFloat((peakKW * 0.65).toFixed(1)) : parseFloat((peakKW * 0.15).toFixed(1));
    const nightKW = isWasteful ? parseFloat((peakKW * 0.45).toFixed(1)) : parseFloat((peakKW * 0.08).toFixed(1));

    const powerReadings = [
      nightKW, nightKW, nightKW, parseFloat((nightKW * 1.1).toFixed(1)),
      parseFloat((peakKW * 0.5).toFixed(1)), // 08:00 morning warmup
      peakKW,                                // 10:00 class peak
      parseFloat((peakKW * 0.9).toFixed(1)), // 12:00 midday class
      peakKW,                                // 14:00 afternoon class
      parseFloat((peakKW * 0.95).toFixed(1)),// 16:00 late class
      idleKW,                                // 18:00 after classes finish (leakage in wasteful rooms!)
      parseFloat((idleKW * 0.9).toFixed(1)), // 20:00 evening idle
      nightKW                                // 22:00 night baseload
    ];

    if (state.chartJsAvailable && elements.caOccupancyChartCanvas) {
      if (elements.caOccupancyChartFallback) elements.caOccupancyChartFallback.style.display = 'none';
      elements.caOccupancyChartCanvas.style.display = 'block';

      if (state.caOccupancyChart) {
        state.caOccupancyChart.data.datasets[0].data = powerReadings;
        state.caOccupancyChart.data.datasets[0].label = `${room.id} Power Draw (kW)`;
        state.caOccupancyChart.data.datasets[1].data = occupancySchedule;
        state.caOccupancyChart.update();
      } else {
        const ctx = elements.caOccupancyChartCanvas.getContext('2d');
        state.caOccupancyChart = new Chart(ctx, {
          data: {
            labels: hours,
            datasets: [
              {
                type: 'bar',
                label: `${room.id} Power Draw (kW)`,
                data: powerReadings,
                backgroundColor: 'rgba(2, 132, 199, 0.75)',
                hoverBackgroundColor: '#0284C7',
                borderRadius: 4,
                yAxisID: 'y',
                order: 2
              },
              {
                type: 'line',
                label: 'Scheduled Occupancy',
                data: occupancySchedule,
                borderColor: '#16A34A',
                backgroundColor: 'rgba(22, 163, 74, 0.12)',
                borderWidth: 2.5,
                stepped: 'before',
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#16A34A',
                yAxisID: 'y1',
                order: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0F172A',
                titleFont: { family: 'Inter', size: 12 },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                callbacks: {
                  label: (ctx) => {
                    if (ctx.datasetIndex === 0) return ` Power Draw: ${ctx.parsed.y} kW`;
                    return ` Status: ${ctx.parsed.y === 1 ? 'Classes Active (Occupied)' : 'No Classes (Empty)'}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                grid: { color: 'rgba(226, 232, 240, 0.8)' },
                ticks: {
                  font: { family: 'Inter', size: 11 },
                  color: '#64748B',
                  callback: (value) => `${value} kW`
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                max: 1.4,
                grid: { drawOnChartArea: false },
                ticks: {
                  font: { family: 'Inter', size: 10 },
                  color: '#16A34A',
                  stepSize: 1,
                  callback: (value) => (value === 1 ? 'Occupied' : (value === 0 ? 'Empty' : ''))
                }
              }
            }
          }
        });
      }
    }

    // Populate Callout box with 3 required pattern indicators
    if (elements.caOccupancyCallout) {
      const afterHoursNote = isWasteful
        ? `Draw persists at ${idleKW} kW between 18:00 and 22:00 after classes dismiss due to override.`
        : `Power drops cleanly to ${idleKW} kW standby immediately upon 18:00 class dismissal.`;

      const emptyPeriodNote = isWasteful
        ? `Overnight baseline remains elevated at ${nightKW} kW (target eco-standby is 0.5 kW).`
        : `Overnight baseline draw sits at an efficient ${nightKW} kW standby level.`;

      elements.caOccupancyCallout.innerHTML = `
        <div class="pattern-pill">
          <div class="pattern-icon green">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="pattern-text-group">
            <span class="pattern-title">High Draw During Occupancy</span>
            <span class="pattern-desc">Peak ${peakKW} kW draw during 09:00-17:00 teaching timetable.</span>
          </div>
        </div>

        <div class="pattern-pill">
          <div class="pattern-icon ${isWasteful ? 'amber' : 'green'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="pattern-text-group">
            <span class="pattern-title">After-Hours (Classes Concluded)</span>
            <span class="pattern-desc">${afterHoursNote}</span>
          </div>
        </div>

        <div class="pattern-pill">
          <div class="pattern-icon ${isWasteful ? 'red' : 'green'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="pattern-text-group">
            <span class="pattern-title">Unoccupied Night Periods</span>
            <span class="pattern-desc">${emptyPeriodNote}</span>
          </div>
        </div>
      `;
    }
  }

  /**
   * Render Chart C: Classroom Comparison (Fair Benchmarking)
   */
  function renderClassroomComparisonChart(room, comparedRoom) {
    const periodKey = state.classroomDateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const p1 = room[periodKey] || room.sevenDays;
    const p2 = comparedRoom[periodKey] || comparedRoom.sevenDays;

    // Category Average (similar rooms)
    const similarRooms = SCEO_DATA.classrooms.filter(r => r.roomType === room.roomType);
    const roomsToAverage = similarRooms.length > 0 ? similarRooms : SCEO_DATA.classrooms;

    let avgIntensity = 0;
    let avgWaste = 0;
    let avgTotal = 0;

    roomsToAverage.forEach(r => {
      const m = r[periodKey] || r.sevenDays;
      avgIntensity += (m.kwhPerOccupiedHour || 0);
      avgWaste += (m.estimatedWasteKWh || 0);
      avgTotal += (m.totalKWh || 0);
    });

    avgIntensity = parseFloat((avgIntensity / roomsToAverage.length).toFixed(1));
    avgWaste = Math.round(avgWaste / roomsToAverage.length);
    avgTotal = Math.round(avgTotal / roomsToAverage.length);

    let metricLabel = 'Energy / Occupied Hr (kWh/hour)';
    let val1 = p1.kwhPerOccupiedHour || 0;
    let val2 = p2.kwhPerOccupiedHour || 0;
    let valAvg = avgIntensity;
    let unit = 'kWh/hr';

    if (state.comparisonMetric === 'estimatedWasteKWh') {
      metricLabel = 'Estimated Avoidable Energy (kWh)';
      val1 = p1.estimatedWasteKWh || 0;
      val2 = p2.estimatedWasteKWh || 0;
      valAvg = avgWaste;
      unit = 'kWh';
    } else if (state.comparisonMetric === 'totalKWh') {
      metricLabel = 'Total Energy Consumed (kWh)';
      val1 = p1.totalKWh || 0;
      val2 = p2.totalKWh || 0;
      valAvg = avgTotal;
      unit = 'kWh';
    }

    const labels = [
      `${room.id} (${room.roomType})`,
      `${comparedRoom.id} (${comparedRoom.roomType})`,
      `${room.roomType} Category Avg`
    ];

    if (state.chartJsAvailable && elements.caComparisonChartCanvas) {
      if (elements.caComparisonChartFallback) elements.caComparisonChartFallback.style.display = 'none';
      elements.caComparisonChartCanvas.style.display = 'block';

      if (state.caComparisonChart) {
        state.caComparisonChart.data.labels = labels;
        state.caComparisonChart.data.datasets[0].data = [val1, val2, valAvg];
        state.caComparisonChart.data.datasets[0].label = metricLabel;
        state.caComparisonChart.update();
      } else {
        const ctx = elements.caComparisonChartCanvas.getContext('2d');
        state.caComparisonChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: metricLabel,
                data: [val1, val2, valAvg],
                backgroundColor: ['#176B73', '#0284C7', '#94A3B8'],
                hoverBackgroundColor: ['#12545A', '#0369A1', '#64748B'],
                borderRadius: 6,
                maxBarThickness: 60
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0F172A',
                titleFont: { family: 'Inter', size: 12 },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                callbacks: {
                  label: (ctx) => ` ${metricLabel}: ${ctx.parsed.y} ${unit}`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 11 }, color: '#475569' }
              },
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(226, 232, 240, 0.8)' },
                ticks: {
                  font: { family: 'Inter', size: 11 },
                  color: '#64748B',
                  callback: (value) => `${value} ${unit}`
                }
              }
            }
          }
        });
      }
    }

    // Comparison summary bar explaining fair benchmarking
    if (elements.caComparisonSummaryBar) {
      const intensity1 = p1.kwhPerOccupiedHour || 0;
      const intensity2 = p2.kwhPerOccupiedHour || 0;
      const diffVsCompared = intensity2 > 0 ? Math.round(((intensity1 - intensity2) / intensity2) * 100) : 0;
      const diffVsCat = avgIntensity > 0 ? Math.round(((intensity1 - avgIntensity) / avgIntensity) * 100) : 0;

      let explanationText = '';
      let barClass = 'comparison-summary-bar';

      if (diffVsCat > 20) {
        barClass += ' warning';
        explanationText = `<strong>Fair Benchmark Analysis:</strong> ${room.id} (${room.capacity} seats) draws <strong>${intensity1} kWh/hr</strong>, which is <strong>${diffVsCompared >= 0 ? '+' : ''}${diffVsCompared}%</strong> compared to ${comparedRoom.id} (${intensity2} kWh/hr) and <strong>+${diffVsCat}%</strong> above the ${room.roomType} campus benchmark (${avgIntensity} kWh/hr). Normalizing by occupied hours confirms that elevated consumption is driven by after-hours leakage, not high class attendance.`;
      } else {
        explanationText = `<strong>Fair Benchmark Analysis:</strong> ${room.id} draws <strong>${intensity1} kWh/hr</strong>, comparing favorably with ${comparedRoom.id} (${intensity2} kWh/hr) and the ${room.roomType} average (${avgIntensity} kWh/hr). Utilization intensity remains within optimal operational baselines.`;
      }

      elements.caComparisonSummaryBar.className = barClass;
      elements.caComparisonSummaryBar.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div>${explanationText}</div>
      `;
    }
  }

  /**
   * Render Automated Insights and Recommendations
   */
  function renderClassroomInsights(room, comparedRoom) {
    if (!elements.caInsightsList) return;

    const periodKey = state.classroomDateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const periodData = room[periodKey] || room.sevenDays;
    const is30d = state.classroomDateRange === '30d';

    const intensity = periodData.kwhPerOccupiedHour || 0;
    const benchmark = periodData.benchmarkKwhPerHour || 4.5;
    const wasteKWh = periodData.estimatedWasteKWh || 0;
    const wastePct = periodData.wastePercentage || 0;

    const insights = [];

    // 1. Benchmark Comparison Insight
    const diffPct = benchmark > 0 ? Math.round(((intensity - benchmark) / benchmark) * 100) : 0;
    if (diffPct > 10) {
      insights.push({
        type: 'amber',
        tag: `${diffPct}% Over Benchmark`,
        title: 'Energy Intensity Exceeds Target Baseline',
        desc: `This room consumes ${intensity} kWh per occupied hour, which is ${diffPct}% higher than the standard target benchmark (${benchmark} kWh/hr) for ${room.roomType} spaces.`
      });
    } else {
      insights.push({
        type: 'green',
        tag: 'Within Target',
        title: 'Energy Intensity Operating at Efficient Level',
        desc: `This room's draw of ${intensity} kWh per occupied hour aligns with or performs better than the standard benchmark of ${benchmark} kWh/hr.`
      });
    }

    // 2. Unoccupied Leakage / Simulated Occupancy Pattern
    if (wasteKWh > 10) {
      insights.push({
        type: 'red',
        tag: 'Unscheduled Consumption',
        title: 'Electricity Consumption Outside Scheduled Occupancy',
        desc: `Simulated telemetry indicates ${wasteKWh} kWh (${wastePct}% of room total) occurs outside scheduled lecture hours, primarily during evening idle and weekend standby.`
      });
    } else {
      insights.push({
        type: 'blue',
        tag: 'Tight Schedule Alignment',
        title: 'Minimal Standby & After-Hours Consumption',
        desc: `Standby electricity draw after academic periods remains low (${wasteKWh} kWh estimated idle), indicating reliable shutdown compliance.`
      });
    }

    // 3. Operational Cause from Dataset
    const primaryCause = (periodData.wasteCauses && periodData.wasteCauses[0])
      ? periodData.wasteCauses[0]
      : 'Continuous standby load detected when room is empty.';
    insights.push({
      type: 'amber',
      tag: 'Primary Root Cause',
      title: 'Observed Telemetry Anomaly',
      desc: primaryCause
    });

    // 4. Remediation Practice from Dataset
    const primaryAction = (periodData.recommendedActions && periodData.recommendedActions[0])
      ? periodData.recommendedActions[0]
      : 'Review lighting and air-conditioning shutdown practices after classes.';
    insights.push({
      type: 'blue',
      tag: 'Recommended Action',
      title: 'Actionable Remediation Procedure',
      desc: primaryAction
    });

    // 5. Estimated Financial & CO2 Impact
    const costSavings = (wasteKWh * 0.18).toFixed(2);
    const co2Savings = Math.round(wasteKWh * 0.42);
    insights.push({
      type: 'green',
      tag: 'Opportunity',
      title: 'Estimated Energy Conservation Recovery',
      desc: `Eliminating avoidable waste in ${room.id} recovers an estimated $${costSavings} and prevents ${co2Savings} kg CO₂ emissions across ${is30d ? '30 days' : '7 days'}.`
    });

    // Render list
    elements.caInsightsList.innerHTML = '';
    insights.forEach(item => {
      const card = document.createElement('div');
      card.className = `insight-card-item ${item.type}`;
      card.innerHTML = `
        <div class="insight-icon-box ${item.type}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <div class="insight-content-box">
          <div class="insight-header-row">
            <span class="insight-title">${item.title}</span>
            <span class="insight-tag ${item.type}">${item.tag}</span>
          </div>
          <p class="insight-desc">${item.desc}</p>
        </div>
      `;
      elements.caInsightsList.appendChild(card);
    });
  }

  /**
   * Render Room Comparison Table
   */
  function renderClassroomComparisonTable() {
    if (!elements.caRoomsTableBody) return;

    const bldgFilter = state.classroomBuildingFilter;
    const query = (state.tableSearchQuery || '').toLowerCase();
    const periodKey = state.classroomDateRange === '30d' ? 'thirtyDays' : 'sevenDays';

    let rooms = SCEO_DATA.classrooms;

    // Filter by building
    if (bldgFilter !== 'all') {
      rooms = rooms.filter(r => r.buildingId === bldgFilter);
    }

    // Filter by search query
    if (query) {
      rooms = rooms.filter(r => 
        r.id.toLowerCase().includes(query) ||
        r.name.toLowerCase().includes(query) ||
        r.roomType.toLowerCase().includes(query) ||
        r.buildingName.toLowerCase().includes(query)
      );
    }

    // Update count badge
    if (elements.caTableCountBadge) {
      elements.caTableCountBadge.textContent = `Showing ${rooms.length} of ${SCEO_DATA.classrooms.length} rooms`;
    }

    // Empty state handling
    if (rooms.length === 0) {
      elements.caRoomsTableBody.innerHTML = '';
      if (elements.caTableEmptyState) elements.caTableEmptyState.style.display = 'block';
      return;
    }

    if (elements.caTableEmptyState) elements.caTableEmptyState.style.display = 'none';

    elements.caRoomsTableBody.innerHTML = '';

    rooms.forEach(room => {
      const m = room[periodKey] || room.sevenDays;
      const isSelected = room.id === state.selectedClassroom;
      const status = m.status || 'green';

      let statusBadgeHtml = '';
      if (status === 'green') {
        statusBadgeHtml = `<span class="table-status-pill efficient">Efficient</span>`;
      } else if (status === 'yellow') {
        statusBadgeHtml = `<span class="table-status-pill typical">Typical</span>`;
      } else if (status === 'orange') {
        statusBadgeHtml = `<span class="table-status-pill review">Needs Review</span>`;
      } else {
        statusBadgeHtml = `<span class="table-status-pill priority">High Priority</span>`;
      }

      const tr = document.createElement('tr');
      if (isSelected) tr.className = 'selected-room-row';
      tr.setAttribute('data-room-id', room.id);

      tr.innerHTML = `
        <td>
          <div class="room-id-cell">
            ${isSelected ? '<span class="table-active-indicator" title="Currently Selected"></span>' : ''}
            <span>${room.id}</span>
          </div>
        </td>
        <td>${room.buildingName}</td>
        <td>${room.roomType} (${room.capacity} seats)</td>
        <td style="font-weight: 600;">${(m.totalKWh || 0).toLocaleString('en-US')} kWh</td>
        <td>${m.occupiedHours || 0} hrs</td>
        <td style="font-weight: 600; color: ${m.kwhPerOccupiedHour > (m.benchmarkKwhPerHour || 4.5) ? 'var(--color-warning-text)' : 'inherit'};">
          ${m.kwhPerOccupiedHour || 0} kWh/hr
        </td>
        <td>
          <span style="font-weight: 600; color: ${m.estimatedWasteKWh > 15 ? 'var(--color-danger-text)' : 'inherit'};">
            ${m.estimatedWasteKWh || 0} kWh
          </span>
          <span style="font-size: 11px; color: var(--color-text-muted);">(${m.wastePercentage || 0}%)</span>
        </td>
        <td>${statusBadgeHtml}</td>
        <td style="text-align: right;">
          <button type="button" class="btn-select-room-row" data-room-id="${room.id}">
            ${isSelected ? 'Active' : 'Select'}
          </button>
        </td>
      `;

      // Row click selection
      tr.addEventListener('click', () => {
        selectClassroom(room.id);
      });

      elements.caRoomsTableBody.appendChild(tr);
    });
  }

  /**
   * Action: Select a classroom and update Classroom Analytics
   */
  function selectClassroom(roomId) {
    const room = SCEO_DATA.classrooms.find(r => r.id === roomId);
    if (!room) return;

    state.selectedClassroom = roomId;
    if (elements.caRoomSelect) elements.caRoomSelect.value = roomId;

    renderClassroomAnalytics();
    showToast(`Loaded analytics for ${room.id} (${room.name})`, 'info');
  }

  /**
   * Interactive Saving Opportunity Estimator Calculation
   */
  function calculateSavingOpportunity() {
    if (!elements.estAvoidableKW || !elements.estHoursPerDay || !elements.estDays || !elements.estTariff) return;

    let kw = parseFloat(elements.estAvoidableKW.value);
    let hours = parseFloat(elements.estHoursPerDay.value);
    let days = parseFloat(elements.estDays.value);
    let tariff = parseFloat(elements.estTariff.value);

    // Validation & Safe Sanitization
    if (isNaN(kw) || kw < 0) kw = 0;
    if (isNaN(hours) || hours < 0) hours = 0;
    if (hours > 24) hours = 24;
    if (isNaN(days) || days < 1) days = 1;
    if (isNaN(tariff) || tariff < 0) tariff = 0;

    const potentialSavingsKWh = kw * hours * days;
    const estimatedCostSavings = potentialSavingsKWh * tariff;
    const co2Reduction = potentialSavingsKWh * 0.42;

    if (elements.estResultKWh) elements.estResultKWh.textContent = Math.round(potentialSavingsKWh).toLocaleString('en-US');
    if (elements.estResultKWhSub) elements.estResultKWhSub.textContent = `${kw.toFixed(1)} kW × ${hours.toFixed(1)} hrs/day × ${days} days`;
    if (elements.estResultCost) elements.estResultCost.textContent = `$${estimatedCostSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elements.estResultCostSub) elements.estResultCostSub.textContent = `at $${tariff.toFixed(2)} per kWh`;
    if (elements.estResultCO2) elements.estResultCO2.textContent = Math.round(co2Reduction).toLocaleString('en-US');
  }

  /**
   * Sync Selected Room's Parameters to Estimator
   */
  function syncSelectedRoomToEstimator() {
    const room = SCEO_DATA.classrooms.find(r => r.id === state.selectedClassroom);
    if (!room) return;

    const is30d = state.classroomDateRange === '30d';
    const periodKey = is30d ? 'thirtyDays' : 'sevenDays';
    const periodData = room[periodKey] || room.sevenDays;

    const wasteKWh = periodData.estimatedWasteKWh || 15;
    const durationDays = is30d ? 30 : 7;
    const hoursPerDay = 4.0;
    const computedKW = Math.max(0.5, parseFloat((wasteKWh / (durationDays * hoursPerDay)).toFixed(1)));

    if (elements.estAvoidableKW) elements.estAvoidableKW.value = computedKW;
    if (elements.estHoursPerDay) elements.estHoursPerDay.value = hoursPerDay;
    if (elements.estDays) elements.estDays.value = durationDays;

    // Update preset pills active state
    const presets = [elements.btnEstPreset7d, elements.btnEstPreset30d, elements.btnEstPreset90d, elements.btnEstPreset180d];
    presets.forEach(btn => {
      if (btn) {
        if (parseInt(btn.getAttribute('data-days'), 10) === durationDays) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    calculateSavingOpportunity();
    showToast(`Loaded waste parameters from ${room.id} (${computedKW} kW @ 4h/day)`, 'success');
  }

  /**
   * Action: Locate Selected Classroom in Energy Heatmap
   */
  function locateRoomInHeatmap(roomId) {
    const room = SCEO_DATA.classrooms.find(r => r.id === roomId) || SCEO_DATA.classrooms[0];
    if (!room) return;

    // Switch view to energy-heatmap
    switchView('energy-heatmap');

    // Filter heatmap to that building
    state.selectedBuilding = room.buildingId;
    if (elements.buildingSelector) elements.buildingSelector.value = room.buildingId;
    if (elements.heatmapBuildingFilter) elements.heatmapBuildingFilter.value = room.buildingId;
    renderHeatmap();

    // Scroll to room card and highlight
    setTimeout(() => {
      const card = document.getElementById(`roomCard-${room.id}`) || document.querySelector(`[data-room-id="${room.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlight-target');
        setTimeout(() => card.classList.remove('highlight-target'), 3500);
      }
      showToast(`Located ${room.id} in Energy Heatmap`, 'info');
    }, 150);
  }

  /**
   * Handle Building Scope Change
   */
  function handleBuildingChange(buildingId) {
    state.selectedBuilding = buildingId;
    if (elements.buildingSelector) elements.buildingSelector.value = buildingId;
    if (elements.heatmapBuildingFilter) elements.heatmapBuildingFilter.value = buildingId;

    updateKPIs();
    renderConsumptionChart();
    renderBuildingDistribution();
    renderPriorityActions();
    renderRecentAlerts();
    renderBuildingsTable();

    if (state.currentView === 'energy-heatmap') {
      renderHeatmap();
    }

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
      elements.btnRange7d?.classList.add('active');
      elements.btnRange30d?.classList.remove('active');
      elements.hmBtnRange7d?.classList.add('active');
      elements.hmBtnRange30d?.classList.remove('active');
      showToast('Switched energy telemetry to Last 7 Days', 'info');
    } else {
      elements.btnRange30d?.classList.add('active');
      elements.btnRange7d?.classList.remove('active');
      elements.hmBtnRange30d?.classList.add('active');
      elements.hmBtnRange7d?.classList.remove('active');
      showToast('Switched energy telemetry to Last 30 Days', 'info');
    }

    updateKPIs();
    renderConsumptionChart();

    if (state.currentView === 'energy-heatmap') {
      renderHeatmap();
    }
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

    // 3. Building Selector Change (Topbar)
    elements.buildingSelector.addEventListener('change', (e) => {
      handleBuildingChange(e.target.value);
    });

    // Heatmap Building Filter Change
    if (elements.heatmapBuildingFilter) {
      elements.heatmapBuildingFilter.addEventListener('change', (e) => {
        handleBuildingChange(e.target.value);
      });
    }

    // 4. Date Range Buttons (Topbar & Overview)
    elements.btnRange7d.addEventListener('click', () => handleDateRangeChange('7d'));
    elements.btnRange30d.addEventListener('click', () => handleDateRangeChange('30d'));

    // Heatmap Date Range Buttons
    if (elements.hmBtnRange7d) {
      elements.hmBtnRange7d.addEventListener('click', () => handleDateRangeChange('7d'));
    }
    if (elements.hmBtnRange30d) {
      elements.hmBtnRange30d.addEventListener('click', () => handleDateRangeChange('30d'));
    }

    // 5. Heatmap Metric Switcher Buttons
    const metricBtns = [
      { btn: elements.btnMetricIntensity, metric: 'kwhPerOccupiedHour', label: 'Energy per Occupied Hour' },
      { btn: elements.btnMetricTotal, metric: 'totalKWh', label: 'Total Energy (kWh)' },
      { btn: elements.btnMetricWaste, metric: 'estimatedWasteKWh', label: 'Estimated Waste (kWh)' }
    ];

    metricBtns.forEach(item => {
      if (item.btn) {
        item.btn.addEventListener('click', () => {
          if (state.heatmapMetric === item.metric) return;
          state.heatmapMetric = item.metric;
          metricBtns.forEach(m => m.btn.classList.remove('active'));
          item.btn.classList.add('active');
          renderHeatmap();
          showToast(`Heatmap metric set to: ${item.label}`, 'info');
        });
      }
    });

    // Heatmap Sort Dropdown
    if (elements.heatmapSortSelect) {
      elements.heatmapSortSelect.addEventListener('change', (e) => {
        state.heatmapSort = e.target.value;
        renderHeatmap();
      });
    }

    // 6. Notifications Dropdown Toggle
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

    // 7. Action Detail Modal Controls (Priority Actions)
    elements.modalCloseBtn.addEventListener('click', closeActionModal);
    elements.modalDismissBtn.addEventListener('click', closeActionModal);
    elements.modalResolveBtn.addEventListener('click', resolveCurrentAction);

    // Close modal on backdrop click
    elements.actionModal.addEventListener('click', (e) => {
      if (e.target === elements.actionModal) {
        closeActionModal();
      }
    });

    // 8. Classroom Detail Modal Controls (Step 2)
    if (elements.roomModalCloseBtn) {
      elements.roomModalCloseBtn.addEventListener('click', closeRoomModal);
    }
    if (elements.btnModalCloseRoom) {
      elements.btnModalCloseRoom.addEventListener('click', closeRoomModal);
    }
    if (elements.roomDetailModal) {
      elements.roomDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.roomDetailModal) {
          closeRoomModal();
        }
      });
    }

    // "View Classroom Analytics" action inside Classroom Modal
    if (elements.btnViewClassroomAnalytics) {
      elements.btnViewClassroomAnalytics.addEventListener('click', () => {
        const room = state.activeRoomInModal || SCEO_DATA.classrooms[0];
        closeRoomModal();
        state.selectedClassroom = room.id;
        state.classroomBuildingFilter = 'all';
        if (elements.caBuildingFilter) elements.caBuildingFilter.value = 'all';
        switchView('classroom-analytics');
        showToast(`Viewing Classroom Analytics for ${room.id}`, 'info');
      });
    }

    // 10. Classroom Analytics Controls (Step 3)
    if (elements.caBuildingFilter) {
      elements.caBuildingFilter.addEventListener('change', (e) => {
        state.classroomBuildingFilter = e.target.value;
        populateClassroomSelectors();
        renderClassroomAnalytics();
      });
    }

    if (elements.caRoomSelect) {
      elements.caRoomSelect.addEventListener('change', (e) => {
        selectClassroom(e.target.value);
      });
    }

    if (elements.caCompareSelect) {
      elements.caCompareSelect.addEventListener('change', (e) => {
        state.comparedClassroom = e.target.value;
        const room = SCEO_DATA.classrooms.find(r => r.id === state.selectedClassroom);
        const comp = SCEO_DATA.classrooms.find(r => r.id === state.comparedClassroom);
        if (room && comp) {
          renderClassroomComparisonChart(room, comp);
          renderClassroomInsights(room, comp);
        }
      });
    }

    // Classroom Analytics Date Range Buttons
    if (elements.caBtnRange7d) {
      elements.caBtnRange7d.addEventListener('click', () => {
        if (state.classroomDateRange === '7d') return;
        state.classroomDateRange = '7d';
        syncClassroomDateButtons();
        renderClassroomAnalytics();
      });
    }

    if (elements.caBtnRange30d) {
      elements.caBtnRange30d.addEventListener('click', () => {
        if (state.classroomDateRange === '30d') return;
        state.classroomDateRange = '30d';
        syncClassroomDateButtons();
        renderClassroomAnalytics();
      });
    }

    // Comparison Metric Switcher
    const compMetricBtns = [
      { btn: elements.btnCompIntensity, metric: 'kwhPerOccupiedHour' },
      { btn: elements.btnCompWaste, metric: 'estimatedWasteKWh' },
      { btn: elements.btnCompTotal, metric: 'totalKWh' }
    ];

    compMetricBtns.forEach(item => {
      if (item.btn) {
        item.btn.addEventListener('click', () => {
          if (state.comparisonMetric === item.metric) return;
          state.comparisonMetric = item.metric;
          compMetricBtns.forEach(m => {
            if (m.btn) m.btn.classList.remove('active');
          });
          item.btn.classList.add('active');
          const room = SCEO_DATA.classrooms.find(r => r.id === state.selectedClassroom);
          const comp = SCEO_DATA.classrooms.find(r => r.id === state.comparedClassroom);
          if (room && comp) renderClassroomComparisonChart(room, comp);
        });
      }
    });

    // View in Energy Heatmap button
    if (elements.caBtnViewInHeatmap) {
      elements.caBtnViewInHeatmap.addEventListener('click', () => {
        locateRoomInHeatmap(state.selectedClassroom);
      });
    }

    // Saving Opportunity Estimator Real-time Reactive Listeners
    const estimatorInputs = [elements.estAvoidableKW, elements.estHoursPerDay, elements.estDays, elements.estTariff];
    estimatorInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', calculateSavingOpportunity);
      }
    });

    // Estimator Preset Buttons
    const estPresetBtns = [
      { btn: elements.btnEstPreset7d, days: 7 },
      { btn: elements.btnEstPreset30d, days: 30 },
      { btn: elements.btnEstPreset90d, days: 90 },
      { btn: elements.btnEstPreset180d, days: 180 }
    ];

    estPresetBtns.forEach(p => {
      if (p.btn) {
        p.btn.addEventListener('click', () => {
          if (elements.estDays) elements.estDays.value = p.days;
          estPresetBtns.forEach(b => {
            if (b.btn) b.btn.classList.remove('active');
          });
          p.btn.classList.add('active');
          calculateSavingOpportunity();
        });
      }
    });

    // Load Room Waste button
    if (elements.btnLoadRoomWaste) {
      elements.btnLoadRoomWaste.addEventListener('click', syncSelectedRoomToEstimator);
    }

    // Classroom Table Search Filter
    if (elements.caTableSearchInput) {
      elements.caTableSearchInput.addEventListener('input', (e) => {
        state.tableSearchQuery = e.target.value;
        renderClassroomComparisonTable();
      });
    }

    // 11. Global Keyboard Handlers (Escape closes open overlays)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.actionModal.classList.contains('active')) {
          closeActionModal();
        }
        if (elements.roomDetailModal && elements.roomDetailModal.classList.contains('active')) {
          closeRoomModal();
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
    renderHeatmap();
    populateClassroomSelectors();
    initEventListeners();

    // Initial welcome toast
    setTimeout(() => {
      showToast('Welcome to Smart Campus Energy Optimizer (SCEO) • Step 3 Loaded', 'info');
    }, 400);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
