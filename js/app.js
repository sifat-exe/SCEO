/**
 * Smart Campus Energy Optimizer (SCEO)
 * Application Controller & Interactions - Step 1 Foundation
 */

(function () {
  'use strict';

  // ==========================================================================
  // SCEO Core Calculation Functions (Mathematical Models & Guardrails)
  // Audited for test cases: Intensity, Potential Savings, Tariffs & Improvement
  // ==========================================================================
  const SCEO_CALCULATIONS = {
    /**
     * A. Energy Intensity (kWh per occupied hour)
     * Consumption (kWh) / Occupied hours (hrs)
     * Edge cases: zero occupied hours, negative, null, or empty data -> returns 0.0
     */
    calculateEnergyIntensity: function (consumptionKWh, occupiedHours) {
      const consumption = Number(consumptionKWh);
      const hours = Number(occupiedHours);
      if (isNaN(consumption) || isNaN(hours) || hours <= 0 || consumption <= 0) {
        return 0.0;
      }
      return Math.round((consumption / hours) * 10) / 10;
    },

    /**
     * B. Potential Energy Savings (kWh)
     * Avoidable power (kW) * Avoidable operating time (hours) * days
     * Edge cases: negative or NaN inputs -> safely returns 0.0
     */
    calculatePotentialSavings: function (avoidableKW, avoidableOperatingHours, days = 1) {
      const kw = Number(avoidableKW);
      const hours = Number(avoidableOperatingHours);
      const d = Number(days);
      if (isNaN(kw) || isNaN(hours) || kw <= 0 || hours <= 0) {
        return 0.0;
      }
      const safeDays = isNaN(d) || d < 1 ? 1 : d;
      const res = kw * hours * safeDays;
      return Math.round(res * 100) / 100;
    },

    /**
     * C. Estimated Cost Savings (Currency Units / $)
     * Estimated savings (kWh) * Electricity tariff ($/kWh)
     * Edge cases: missing/negative rate or zero savings -> safely returns 0.0
     */
    calculateCostSavings: function (savingsKWh, tariff) {
      const savings = Number(savingsKWh);
      const rate = Number(tariff);
      if (isNaN(savings) || isNaN(rate) || savings <= 0 || rate <= 0) {
        return 0.0;
      }
      return Math.round(savings * rate * 100) / 100;
    },

    /**
     * D. Improvement (% Reduction)
     * ((Baseline - Current) / Baseline) * 100
     * Edge cases: missing baseline (null/undefined), baseline <= 0, or missing current
     * -> safely returns null (rendered as "N/A — No Baseline", never NaN or Infinity)
     */
    calculateImprovement: function (baselineKWh, currentKWh) {
      if (baselineKWh === null || baselineKWh === undefined || isNaN(Number(baselineKWh))) {
        return null;
      }
      const base = Number(baselineKWh);
      if (base <= 0) return null;
      if (currentKWh === null || currentKWh === undefined || isNaN(Number(currentKWh))) {
        return null;
      }
      const curr = Number(currentKWh);
      const pct = ((base - curr) / base) * 100;
      return Math.round(pct * 10) / 10;
    },

    /**
     * Dataset Average Helper
     * Safe average calculation for arrays, preventing NaN or division by zero on empty sets
     */
    calculateDatasetAverages: function (items, key) {
      if (!Array.isArray(items) || items.length === 0) return 0.0;
      let sum = 0;
      let count = 0;
      items.forEach(item => {
        const val = item && typeof item === 'object' ? Number(item[key]) : Number(item);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      return count > 0 ? Math.round((sum / count) * 10) / 10 : 0.0;
    }
  };

  // Expose on window for direct verification, automated tests, and console audit
  window.SCEO_CALCULATIONS = SCEO_CALCULATIONS;

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
    heatmapPriority: 'all', // 'all' | 'low' | 'medium' | 'high' | 'nodata'
    heatmapSearch: '',
    selectedRoomId: null,
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
    caComparisonChart: null,

    // Step 4: Timetable Optimizer State
    timetableBuildingFilter: 'all', // 'all' | 'engineering' | 'science' | 'business'
    timetableDay: 'Mon', // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'all'
    timetableWeek: 'week-6',
    timetableCurrentView: 'day', // 'day' | 'week'
    timetableSearchQuery: '',
    timetableOccupiedOnly: false,
    simulatedConflictActive: false,
    acceptedSuggestions: new Set(),
    dismissedSuggestions: new Set(),
    activeSuggestionInModal: null,
    activeClassInModal: null,

    // Step 5: Alerts & Actions State
    alertBuildingFilter: 'all', // 'all' | 'engineering' | 'science' | 'business'
    alertSeverityFilter: 'all', // 'all' | 'critical' | 'high' | 'medium' | 'low'
    alertStatusFilter: 'all', // 'all' | 'new' | 'acknowledged' | 'resolved'
    alertDateFilter: 'all', // 'all' | 'today' | 'yesterday' | 'older'
    alertSearchQuery: '',
    alertViewMode: 'cards', // 'cards' | 'table'
    alertStatuses: {}, // alertId -> 'new' | 'acknowledged' | 'resolved'
    activeAlertInModal: null,
    generatedDynamicAlerts: [],

    // Step 6: Smart Controls Simulator State
    scSimRunning: true, // Simulation engine active
    scSimMode: 'manual', // 'manual' | 'automatic'
    scBuildingFilter: 'all', // 'all' | 'engineering' | 'science' | 'business'
    scRoomFilter: 'all', // 'all' | roomId
    scStatusFilter: 'all', // 'all' | 'on_only' | 'shutdown_recommended' | 'overridden_only' | 'essential_only'
    scAutoShutdownDelay: 4, // seconds
    scRoomsData: [], // 24 simulated rooms with devices
    scEventLogs: [], // Chronological event log entries
    scRealizedSavingsKWh: 0.0, // Realized simulated savings (kWh)
    scRealizedSavingsCost: 0.0, // Realized simulated savings ($)
    scActiveCountdowns: {}, // deviceId -> remaining seconds
    scSimulationIntervalId: null, // Timer interval ID
    scPendingAutoSimTransition: false,

    // Step 7: Preventive Maintenance & Department Challenge State
    maintFilterBuilding: 'all', // 'all' | 'engineering' | 'science' | 'business'
    maintFilterType: 'all', // 'all' | 'air_conditioner' | 'fans' | 'lighting' | 'projector' | 'specialized'
    maintFilterStatus: 'all', // 'all' | 'urgent_review' | 'maintenance_due' | 'inspection_recommended' | 'good' | 'status_open' | 'status_scheduled' | 'status_in_progress' | 'status_completed'
    maintSearchQuery: '',
    maintViewMode: 'table', // 'table' | 'cards'
    maintTasks: [], // Loaded from storage or SCEO_DATA.maintenanceModule.initialEquipment
    activeMaintTaskInModal: null,

    deptActivePeriod: 'month', // 'month' | 'semester' | 'academic_year'
    deptActiveDeptId: 'dept_science',
    deptData: [], // Loaded from storage or SCEO_DATA.departmentChallengeModule.departments

    // Step 8: Savings Reports & Settings State
    reportsBuildingFilter: 'all', // 'all' | 'engineering' | 'science' | 'business'
    reportsDateRange: '7d', // '7d' | '30d' | 'custom'
    reportsCustomStartDate: '2026-10-01',
    reportsCustomEndDate: '2026-10-21',
    reportsMetricFilter: 'all', // 'all' | 'avoidable' | 'total' | 'intensity' | 'cost'
    reportsBldgSortCol: 'consumption',
    reportsBldgSortDir: 'desc',
    reportsClassroomSearch: '',
    reportsClassroomSort: 'avoidable_desc',
    savingsTrendChart: null,

    tariffUSD: 0.18, // Contracted $/kWh rate (editable in Settings)
    demandChargeUSD: 14.50, // $/kW capacity charge
    carbonFactor: 0.42, // kg CO2e / kWh grid intensity

    // Step 10: Competition Guided Demo Mode State
    guidedDemoActive: false,
    guidedDemoStage: 1,
    activeSpotlightElement: null
  };

  // DOM Elements Cache
  const elements = {
    // Step 10: Competition Guided Demo Elements
    btnStartGuidedDemo: document.getElementById('btnStartGuidedDemo'),
    btnTopStartDemo: document.getElementById('btnTopStartDemo'),
    guidedDemoDock: document.getElementById('guidedDemoDock'),
    demoStagePill: document.getElementById('demoStagePill'),
    demoViewPill: document.getElementById('demoViewPill'),
    demoScenarioTag: document.getElementById('demoScenarioTag'),
    btnDemoResetScenario: document.getElementById('btnDemoResetScenario'),
    btnDemoSkip: document.getElementById('btnDemoSkip'),
    btnDemoSkipText: document.getElementById('btnDemoSkipText'),
    demoProgressTrack: document.getElementById('demoProgressTrack'),
    demoStageTitle: document.getElementById('demoStageTitle'),
    demoTextWhatSeeing: document.getElementById('demoTextWhatSeeing'),
    demoTextWhyMatters: document.getElementById('demoTextWhyMatters'),
    demoTextNextAction: document.getElementById('demoTextNextAction'),
    btnDemoPrev: document.getElementById('btnDemoPrev'),
    btnDemoNext: document.getElementById('btnDemoNext'),
    btnDemoNextText: document.getElementById('btnDemoNextText'),
    demoResetConfirmModal: document.getElementById('demoResetConfirmModal'),
    btnCancelDemoReset: document.getElementById('btnCancelDemoReset'),
    btnCancelDemoResetSecondary: document.getElementById('btnCancelDemoResetSecondary'),
    btnConfirmDemoReset: document.getElementById('btnConfirmDemoReset'),

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
    heatmapPriorityFilter: document.getElementById('heatmapPriorityFilter'),
    heatmapSearchInput: document.getElementById('heatmapSearchInput'),
    btnHeatmapClearFilters: document.getElementById('btnHeatmapClearFilters'),
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
    roomModalAlertsBox: document.getElementById('roomModalAlertsBox'),
    roomModalEquipmentList: document.getElementById('roomModalEquipmentList'),

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

    // Step 4: Timetable Optimizer View Elements
    timetableOptimizerView: document.getElementById('timetableOptimizerView'),
    ttBuildingFilter: document.getElementById('ttBuildingFilter'),
    ttDaySelector: document.getElementById('ttDaySelector'),
    ttWeekSelect: document.getElementById('ttWeekSelect'),
    btnTtViewDay: document.getElementById('btnTtViewDay'),
    btnTtViewWeek: document.getElementById('btnTtViewWeek'),
    btnTtToggleConflict: document.getElementById('btnTtToggleConflict'),
    btnTtToggleConflictText: document.getElementById('btnTtToggleConflictText'),
    btnTtResetDemo: document.getElementById('btnTtResetDemo'),

    // Timetable KPIs
    ttKpiScheduledClasses: document.getElementById('ttKpiScheduledClasses'),
    ttKpiScheduledClassesSub: document.getElementById('ttKpiScheduledClassesSub'),
    ttKpiRoomsInUse: document.getElementById('ttKpiRoomsInUse'),
    ttKpiRoomsInUseSub: document.getElementById('ttKpiRoomsInUseSub'),
    ttKpiConsolidatable: document.getElementById('ttKpiConsolidatable'),
    ttKpiConsolidatableSub: document.getElementById('ttKpiConsolidatableSub'),
    ttKpiSavings: document.getElementById('ttKpiSavings'),
    ttKpiSavingsSub: document.getElementById('ttKpiSavingsSub'),

    // Timetable Conflict Panel
    ttConflictPanel: document.getElementById('ttConflictPanel'),

    // Timetable Matrix
    ttMatrixHeading: document.getElementById('ttMatrixHeading'),
    ttMatrixScopeBadge: document.getElementById('ttMatrixScopeBadge'),
    ttSearchInput: document.getElementById('ttSearchInput'),
    ttFilterOccupiedOnly: document.getElementById('ttFilterOccupiedOnly'),
    ttTimetableMatrix: document.getElementById('ttTimetableMatrix'),
    ttMatrixEmptyState: document.getElementById('ttMatrixEmptyState'),

    // Suggestions Panel
    ttSuggestionsCountBadge: document.getElementById('ttSuggestionsCountBadge'),
    ttSuggestionsList: document.getElementById('ttSuggestionsList'),
    ttSuggestionsEmptyState: document.getElementById('ttSuggestionsEmptyState'),
    btnTtRestoreSuggestions: document.getElementById('btnTtRestoreSuggestions'),

    // Suggestion Detail Modal
    suggestionDetailModal: document.getElementById('suggestionDetailModal'),
    sugModalCloseBtn: document.getElementById('sugModalCloseBtn'),
    sugModalCategory: document.getElementById('sugModalCategory'),
    sugModalTitle: document.getElementById('sugModalTitle'),
    sugModalEnergyVal: document.getElementById('sugModalEnergyVal'),
    sugModalCostVal: document.getElementById('sugModalCostVal'),
    sugModalConfidence: document.getElementById('sugModalConfidence'),
    sugModalTime: document.getElementById('sugModalTime'),
    sugModalDuration: document.getElementById('sugModalDuration'),
    sugModalComparisonTbody: document.getElementById('sugModalComparisonTbody'),
    sugModalFormulaText: document.getElementById('sugModalFormulaText'),
    sugModalReasonText: document.getElementById('sugModalReasonText'),
    sugModalConfidenceReason: document.getElementById('sugModalConfidenceReason'),
    sugModalConstraintsList: document.getElementById('sugModalConstraintsList'),
    btnSugGoCurrentRoom: document.getElementById('btnSugGoCurrentRoom'),
    btnSugGoProposedRoom: document.getElementById('btnSugGoProposedRoom'),
    btnSugModalDismiss: document.getElementById('btnSugModalDismiss'),
    btnSugModalAccept: document.getElementById('btnSugModalAccept'),

    // Class Detail Modal
    classDetailModal: document.getElementById('classDetailModal'),
    classModalCloseBtn: document.getElementById('classModalCloseBtn'),
    classModalDept: document.getElementById('classModalDept'),
    classModalTitle: document.getElementById('classModalTitle'),
    classModalPowerKW: document.getElementById('classModalPowerKW'),
    classModalEnergyKWh: document.getElementById('classModalEnergyKWh'),
    classModalEnrollment: document.getElementById('classModalEnrollment'),
    classModalOccupancyPercent: document.getElementById('classModalOccupancyPercent'),
    classModalSlot: document.getElementById('classModalSlot'),
    classModalDay: document.getElementById('classModalDay'),
    classModalRoomId: document.getElementById('classModalRoomId'),
    classModalRoomType: document.getElementById('classModalRoomType'),
    classModalBuilding: document.getElementById('classModalBuilding'),
    classModalInstructor: document.getElementById('classModalInstructor'),
    classModalEquipment: document.getElementById('classModalEquipment'),
    classModalConsolidationNotice: document.getElementById('classModalConsolidationNotice'),
    classModalConsolidationText: document.getElementById('classModalConsolidationText'),
    btnClassGoHeatmap: document.getElementById('btnClassGoHeatmap'),
    btnClassGoAnalytics: document.getElementById('btnClassGoAnalytics'),
    btnClassModalClose: document.getElementById('btnClassModalClose'),

    // Step 5: Alerts & Actions View Elements
    alertsActionsView: document.getElementById('alertsActionsView'),
    btnRunAlertAnalysis: document.getElementById('btnRunAlertAnalysis'),
    btnResetAlertStates: document.getElementById('btnResetAlertStates'),
    alertBuildingFilter: document.getElementById('alertBuildingFilter'),
    alertSeverityFilter: document.getElementById('alertSeverityFilter'),
    alertStatusFilter: document.getElementById('alertStatusFilter'),
    alertDateFilter: document.getElementById('alertDateFilter'),
    alertSearchInput: document.getElementById('alertSearchInput'),

    // Alerts KPIs
    kpiTotalActiveAlerts: document.getElementById('kpiTotalActiveAlerts'),
    kpiTotalActiveAlertsSub: document.getElementById('kpiTotalActiveAlertsSub'),
    kpiCriticalHighAlerts: document.getElementById('kpiCriticalHighAlerts'),
    kpiCriticalHighAlertsSub: document.getElementById('kpiCriticalHighAlertsSub'),
    kpiAwaitingActionAlerts: document.getElementById('kpiAwaitingActionAlerts'),
    kpiAwaitingActionAlertsSub: document.getElementById('kpiAwaitingActionAlertsSub'),
    kpiResolvedAlerts: document.getElementById('kpiResolvedAlerts'),
    kpiResolvedAlertsSub: document.getElementById('kpiResolvedAlertsSub'),

    // Alerts Stream & Actions
    alertsCountBadge: document.getElementById('alertsCountBadge'),
    btnAlertsViewCards: document.getElementById('btnAlertsViewCards'),
    btnAlertsViewTable: document.getElementById('btnAlertsViewTable'),
    alertsStreamContainer: document.getElementById('alertsStreamContainer'),
    alertsEmptyState: document.getElementById('alertsEmptyState'),
    btnClearAlertFilters: document.getElementById('btnClearAlertFilters'),
    recActionsCountBadge: document.getElementById('recActionsCountBadge'),
    recActionsList: document.getElementById('recActionsList'),

    // Alert Detail Modal
    alertDetailModal: document.getElementById('alertDetailModal'),
    alertModalCloseBtn: document.getElementById('alertModalCloseBtn'),
    alertModalCategory: document.getElementById('alertModalCategory'),
    alertModalTitle: document.getElementById('alertModalTitle'),
    alertModalSeverity: document.getElementById('alertModalSeverity'),
    alertModalId: document.getElementById('alertModalId'),
    alertModalStatus: document.getElementById('alertModalStatus'),
    alertModalTimestamp: document.getElementById('alertModalTimestamp'),
    alertModalDraw: document.getElementById('alertModalDraw'),
    alertModalStandby: document.getElementById('alertModalStandby'),
    alertModalWaste: document.getElementById('alertModalWaste'),
    alertModalCost: document.getElementById('alertModalCost'),
    alertModalRoom: document.getElementById('alertModalRoom'),
    alertModalBuilding: document.getElementById('alertModalBuilding'),
    alertModalRoomType: document.getElementById('alertModalRoomType'),
    alertModalDataQualityNotice: document.getElementById('alertModalDataQualityNotice'),
    alertModalDetails: document.getElementById('alertModalDetails'),
    alertModalRuleTriggered: document.getElementById('alertModalRuleTriggered'),
    alertModalAction: document.getElementById('alertModalAction'),
    btnAlertModalHeatmap: document.getElementById('btnAlertModalHeatmap'),
    btnAlertModalAnalytics: document.getElementById('btnAlertModalAnalytics'),
    btnAlertModalAck: document.getElementById('btnAlertModalAck'),
    btnAlertModalResolve: document.getElementById('btnAlertModalResolve'),
    btnAlertModalClose: document.getElementById('btnAlertModalClose'),

    // Step 6: Smart Controls Simulator View Elements
    smartControlsView: document.getElementById('smartControlsView'),
    simStatusPill: document.getElementById('simStatusPill'),
    simStatusText: document.getElementById('simStatusText'),
    btnModeManual: document.getElementById('btnModeManual'),
    btnModeAutomatic: document.getElementById('btnModeAutomatic'),
    btnRunSimulation: document.getElementById('btnRunSimulation'),
    btnPauseSimulation: document.getElementById('btnPauseSimulation'),
    btnResumeSimulation: document.getElementById('btnResumeSimulation'),
    btnResetSimulation: document.getElementById('btnResetSimulation'),
    scBuildingFilter: document.getElementById('scBuildingFilter'),
    scRoomSelect: document.getElementById('scRoomSelect'),
    scStatusFilter: document.getElementById('scStatusFilter'),
    scDelaySelect: document.getElementById('scDelaySelect'),

    // Smart Controls KPIs
    kpiScRoomsSimulated: document.getElementById('kpiScRoomsSimulated'),
    kpiScRoomsSimulatedSub: document.getElementById('kpiScRoomsSimulatedSub'),
    kpiScRoomsUnoccupied: document.getElementById('kpiScRoomsUnoccupied'),
    kpiScRoomsUnoccupiedSub: document.getElementById('kpiScRoomsUnoccupiedSub'),
    kpiScDevicesOn: document.getElementById('kpiScDevicesOn'),
    kpiScDevicesOnSub: document.getElementById('kpiScDevicesOnSub'),
    kpiScEnergySavings: document.getElementById('kpiScEnergySavings'),
    kpiScEnergySavingsSub: document.getElementById('kpiScEnergySavingsSub'),

    // Rooms Grid & Quick Actions
    scActiveRoomsBadge: document.getElementById('scActiveRoomsBadge'),
    btnScTurnAllOffScope: document.getElementById('btnScTurnAllOffScope'),
    scRoomsContainer: document.getElementById('scRoomsContainer'),
    scEmptyState: document.getElementById('scEmptyState'),
    btnScResetFilters: document.getElementById('btnScResetFilters'),

    // Estimator & Event Log
    scRealizedKWh: document.getElementById('scRealizedKWh'),
    scRealizedCost: document.getElementById('scRealizedCost'),
    scRealizedCO2: document.getElementById('scRealizedCO2'),
    scPotentialKWh: document.getElementById('scPotentialKWh'),
    scPotentialCost: document.getElementById('scPotentialCost'),
    scEventLogCountBadge: document.getElementById('scEventLogCountBadge'),
    btnClearSimLog: document.getElementById('btnClearSimLog'),
    scEventLogFeed: document.getElementById('scEventLogFeed'),

    // Confirmation Modals
    autoSimConfirmModal: document.getElementById('autoSimConfirmModal'),
    autoSimModalCloseBtn: document.getElementById('autoSimModalCloseBtn'),
    btnCancelAutoSim: document.getElementById('btnCancelAutoSim'),
    btnConfirmAutoSim: document.getElementById('btnConfirmAutoSim'),
    resetSimConfirmModal: document.getElementById('resetSimConfirmModal'),
    resetSimModalCloseBtn: document.getElementById('resetSimModalCloseBtn'),
    btnCancelResetSim: document.getElementById('btnCancelResetSim'),
    btnConfirmResetSim: document.getElementById('btnConfirmResetSim'),
    clearLogConfirmModal: document.getElementById('clearLogConfirmModal'),
    clearLogModalCloseBtn: document.getElementById('clearLogModalCloseBtn'),
    btnCancelClearLog: document.getElementById('btnCancelClearLog'),
    btnConfirmClearLog: document.getElementById('btnConfirmClearLog'),

    // Step 7: Preventive Maintenance Elements
    maintenanceView: document.getElementById('maintenanceView'),
    maintStatusPill: document.getElementById('maintStatusPill'),
    maintStatusText: document.getElementById('maintStatusText'),
    btnOpenAddMaintenanceModal: document.getElementById('btnOpenAddMaintenanceModal'),
    btnResetMaintDemo: document.getElementById('btnResetMaintDemo'),
    maintSearchInput: document.getElementById('maintSearchInput'),
    maintBuildingFilter: document.getElementById('maintBuildingFilter'),
    maintTypeFilter: document.getElementById('maintTypeFilter'),
    maintStatusFilter: document.getElementById('maintStatusFilter'),
    kpiMaintTotalRecords: document.getElementById('kpiMaintTotalRecords'),
    kpiMaintTotalRecordsSub: document.getElementById('kpiMaintTotalRecordsSub'),
    kpiMaintDue: document.getElementById('kpiMaintDue'),
    kpiMaintDueSub: document.getElementById('kpiMaintDueSub'),
    kpiMaintOpenIssues: document.getElementById('kpiMaintOpenIssues'),
    kpiMaintOpenIssuesSub: document.getElementById('kpiMaintOpenIssuesSub'),
    kpiMaintCompleted: document.getElementById('kpiMaintCompleted'),
    kpiMaintCompletedSub: document.getElementById('kpiMaintCompletedSub'),
    maintCountBadge: document.getElementById('maintCountBadge'),
    btnMaintViewTable: document.getElementById('btnMaintViewTable'),
    btnMaintViewCards: document.getElementById('btnMaintViewCards'),
    maintTableContainer: document.getElementById('maintTableContainer'),
    maintTableBody: document.getElementById('maintTableBody'),
    maintCardsContainer: document.getElementById('maintCardsContainer'),
    maintEmptyState: document.getElementById('maintEmptyState'),
    btnResetMaintFilters: document.getElementById('btnResetMaintFilters'),

    // Maintenance Detail Modal
    maintenanceDetailModal: document.getElementById('maintenanceDetailModal'),
    maintModalCloseBtn: document.getElementById('maintModalCloseBtn'),
    maintModalCategory: document.getElementById('maintModalCategory'),
    maintModalTitle: document.getElementById('maintModalTitle'),
    maintModalId: document.getElementById('maintModalId'),
    maintModalType: document.getElementById('maintModalType'),
    maintModalRoom: document.getElementById('maintModalRoom'),
    maintModalBuilding: document.getElementById('maintModalBuilding'),
    maintModalCondition: document.getElementById('maintModalCondition'),
    maintModalPriority: document.getElementById('maintModalPriority'),
    maintModalStatus: document.getElementById('maintModalStatus'),
    maintModalIssue: document.getElementById('maintModalIssue'),
    maintModalReason: document.getElementById('maintModalReason'),
    maintModalAction: document.getElementById('maintModalAction'),
    maintModalAssignedTeam: document.getElementById('maintModalAssignedTeam'),
    maintModalTargetDate: document.getElementById('maintModalTargetDate'),
    maintModalLastDate: document.getElementById('maintModalLastDate'),
    maintModalDueDate: document.getElementById('maintModalDueDate'),
    maintModalHistoryTimeline: document.getElementById('maintModalHistoryTimeline'),
    maintModalStatusBtnGroup: document.getElementById('maintModalStatusBtnGroup'),
    btnMaintSetScheduled: document.getElementById('btnMaintSetScheduled'),
    btnMaintSetInProgress: document.getElementById('btnMaintSetInProgress'),
    btnMaintSetCompleted: document.getElementById('btnMaintSetCompleted'),
    btnMaintSetReopen: document.getElementById('btnMaintSetReopen'),
    btnMaintModalAnalytics: document.getElementById('btnMaintModalAnalytics'),
    btnMaintModalHeatmap: document.getElementById('btnMaintModalHeatmap'),
    btnMaintModalClose: document.getElementById('btnMaintModalClose'),

    // Add Maintenance Modal
    addMaintenanceModal: document.getElementById('addMaintenanceModal'),
    addMaintModalCloseBtn: document.getElementById('addMaintModalCloseBtn'),
    addMaintForm: document.getElementById('addMaintForm'),
    addMaintValidationMsg: document.getElementById('addMaintValidationMsg'),
    addMaintRoomSelect: document.getElementById('addMaintRoomSelect'),
    addMaintEquipmentName: document.getElementById('addMaintEquipmentName'),
    addMaintTypeSelect: document.getElementById('addMaintTypeSelect'),
    addMaintPrioritySelect: document.getElementById('addMaintPrioritySelect'),
    addMaintConditionSelect: document.getElementById('addMaintConditionSelect'),
    addMaintTeamSelect: document.getElementById('addMaintTeamSelect'),
    addMaintTargetDate: document.getElementById('addMaintTargetDate'),
    addMaintIssue: document.getElementById('addMaintIssue'),
    addMaintReason: document.getElementById('addMaintReason'),
    addMaintRecommendedAction: document.getElementById('addMaintRecommendedAction'),
    btnCancelAddMaint: document.getElementById('btnCancelAddMaint'),
    btnSubmitAddMaint: document.getElementById('btnSubmitAddMaint'),

    // Step 7B: Department Energy Challenge Elements
    deptChallengeView: document.getElementById('deptChallengeView'),
    deptStatusPill: document.getElementById('deptStatusPill'),
    deptStatusText: document.getElementById('deptStatusText'),
    btnDeptPeriodMonth: document.getElementById('btnDeptPeriodMonth'),
    btnDeptPeriodSemester: document.getElementById('btnDeptPeriodSemester'),
    btnDeptPeriodYear: document.getElementById('btnDeptPeriodYear'),
    btnOpenRecordActionModal: document.getElementById('btnOpenRecordActionModal'),
    btnResetChallengeDemo: document.getElementById('btnResetChallengeDemo'),
    kpiDeptCount: document.getElementById('kpiDeptCount'),
    kpiDeptCountSub: document.getElementById('kpiDeptCountSub'),
    kpiDeptAvgReduction: document.getElementById('kpiDeptAvgReduction'),
    kpiDeptAvgReductionSub: document.getElementById('kpiDeptAvgReductionSub'),
    kpiDeptTotalActions: document.getElementById('kpiDeptTotalActions'),
    kpiDeptTotalActionsSub: document.getElementById('kpiDeptTotalActionsSub'),
    kpiDeptLeading: document.getElementById('kpiDeptLeading'),
    kpiDeptLeadingSub: document.getElementById('kpiDeptLeadingSub'),
    deptLeaderboardPeriodBadge: document.getElementById('deptLeaderboardPeriodBadge'),
    deptLeaderboardContainer: document.getElementById('deptLeaderboardContainer'),

    // Department Detail Panel
    deptDetailCard: document.getElementById('deptDetailCard'),
    deptDetailCode: document.getElementById('deptDetailCode'),
    deptDetailName: document.getElementById('deptDetailName'),
    deptDetailRankBadge: document.getElementById('deptDetailRankBadge'),
    deptDetailSub: document.getElementById('deptDetailSub'),
    deptDetailReductionTag: document.getElementById('deptDetailReductionTag'),
    deptDetailBaselineVal: document.getElementById('deptDetailBaselineVal'),
    deptDetailCurrentVal: document.getElementById('deptDetailCurrentVal'),
    deptDetailCurrentBar: document.getElementById('deptDetailCurrentBar'),
    deptDetailNormalizedBox: document.getElementById('deptDetailNormalizedBox'),
    deptDetailNormalizedRate: document.getElementById('deptDetailNormalizedRate'),
    deptPointsReduction: document.getElementById('deptPointsReduction'),
    deptPointsActions: document.getElementById('deptPointsActions'),
    deptPointsParticipation: document.getElementById('deptPointsParticipation'),
    deptPointsTotal: document.getElementById('deptPointsTotal'),
    deptDetailAchievements: document.getElementById('deptDetailAchievements'),
    btnQuickRecordActionForDept: document.getElementById('btnQuickRecordActionForDept'),
    deptActionsList: document.getElementById('deptActionsList'),
    deptRecommendationsList: document.getElementById('deptRecommendationsList'),

    // Record Action Modal
    recordActionModal: document.getElementById('recordActionModal'),
    recordActionModalCloseBtn: document.getElementById('recordActionModalCloseBtn'),
    recordActionForm: document.getElementById('recordActionForm'),
    recordActionValidationMsg: document.getElementById('recordActionValidationMsg'),
    recordActionDeptSelect: document.getElementById('recordActionDeptSelect'),
    recordActionTitle: document.getElementById('recordActionTitle'),
    recordActionCategory: document.getElementById('recordActionCategory'),
    recordActionPoints: document.getElementById('recordActionPoints'),
    recordActionDate: document.getElementById('recordActionDate'),
    recordActionStatus: document.getElementById('recordActionStatus'),
    recordActionNote: document.getElementById('recordActionNote'),
    btnCancelRecordAction: document.getElementById('btnCancelRecordAction'),
    btnSubmitRecordAction: document.getElementById('btnSubmitRecordAction'),

    // Reset Confirm Modals
    resetMaintConfirmModal: document.getElementById('resetMaintConfirmModal'),
    resetMaintModalCloseBtn: document.getElementById('resetMaintModalCloseBtn'),
    btnCancelResetMaint: document.getElementById('btnCancelResetMaint'),
    btnConfirmResetMaint: document.getElementById('btnConfirmResetMaint'),
    resetDeptConfirmModal: document.getElementById('resetDeptConfirmModal'),
    resetDeptModalCloseBtn: document.getElementById('resetDeptModalCloseBtn'),
    btnCancelResetDept: document.getElementById('btnCancelResetDept'),
    btnConfirmResetDept: document.getElementById('btnConfirmResetDept'),

    // Step 8: Savings Reports Elements
    savingsReportsView: document.getElementById('savingsReportsView'),
    reportsBuildingFilter: document.getElementById('reportsBuildingFilter'),
    reportsBtnRange7d: document.getElementById('reportsBtnRange7d'),
    reportsBtnRange30d: document.getElementById('reportsBtnRange30d'),
    reportsBtnRangeCustom: document.getElementById('reportsBtnRangeCustom'),
    reportsCustomDateWrap: document.getElementById('reportsCustomDateWrap'),
    reportsStartDate: document.getElementById('reportsStartDate'),
    reportsEndDate: document.getElementById('reportsEndDate'),
    reportsBtnApplyCustom: document.getElementById('reportsBtnApplyCustom'),
    reportsMetricFilter: document.getElementById('reportsMetricFilter'),
    btnTriggerExportReport: document.getElementById('btnTriggerExportReport'),
    btnPrintReport: document.getElementById('btnPrintReport'),
    reportsKpiTotalEnergy: document.getElementById('reportsKpiTotalEnergy'),
    reportsKpiTotalEnergySub: document.getElementById('reportsKpiTotalEnergySub'),
    reportsKpiAvoidableEnergy: document.getElementById('reportsKpiAvoidableEnergy'),
    reportsKpiAvoidableEnergySub: document.getElementById('reportsKpiAvoidableEnergySub'),
    reportsKpiSimulatedEnergy: document.getElementById('reportsKpiSimulatedEnergy'),
    reportsKpiSimulatedEnergySub: document.getElementById('reportsKpiSimulatedEnergySub'),
    reportsKpiCostSavings: document.getElementById('reportsKpiCostSavings'),
    reportsKpiCostSavingsSub: document.getElementById('reportsKpiCostSavingsSub'),
    savingsTrendChartCanvas: document.getElementById('savingsTrendChartCanvas'),
    savingsChartFallback: document.getElementById('savingsChartFallback'),
    reportsBldgSortSelect: document.getElementById('reportsBldgSortSelect'),
    reportsBuildingTableBody: document.getElementById('reportsBuildingTableBody'),
    reportsClassroomCountBadge: document.getElementById('reportsClassroomCountBadge'),
    reportsClassroomSearch: document.getElementById('reportsClassroomSearch'),
    reportsClassroomSortSelect: document.getElementById('reportsClassroomSortSelect'),
    reportsClassroomTableBody: document.getElementById('reportsClassroomTableBody'),
    reportsCurrentTariffDisplay: document.getElementById('reportsCurrentTariffDisplay'),
    btnGoToTariffSettings: document.getElementById('btnGoToTariffSettings'),
    btnExportBuildingsCsv: document.getElementById('btnExportBuildingsCsv'),
    btnExportRoomsCsv: document.getElementById('btnExportRoomsCsv'),
    btnExportAlertsCsv: document.getElementById('btnExportAlertsCsv'),
    btnExportMaintCsv: document.getElementById('btnExportMaintCsv'),
    btnExportDeptCsv: document.getElementById('btnExportDeptCsv'),
    btnExportSummaryCsv: document.getElementById('btnExportSummaryCsv'),

    // Step 8: Settings View Elements
    settingsView: document.getElementById('settingsView'),
    settingsForm: document.getElementById('settingsForm'),
    settingTariffInput: document.getElementById('settingTariffInput'),
    settingDemandInput: document.getElementById('settingDemandInput'),
    settingCarbonInput: document.getElementById('settingCarbonInput'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    btnResetTariffDefault: document.getElementById('btnResetTariffDefault'),
    btnOpenResetAllModal: document.getElementById('btnOpenResetAllModal'),
    btnLoadAnomalyScenario: document.getElementById('btnLoadAnomalyScenario'),

    // Master Reset Modal Elements
    resetAllDemoConfirmModal: document.getElementById('resetAllDemoConfirmModal'),
    resetAllModalCloseBtn: document.getElementById('resetAllModalCloseBtn'),
    btnCancelResetAll: document.getElementById('btnCancelResetAll'),
    btnConfirmResetAll: document.getElementById('btnConfirmResetAll'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Safe LocalStorage Helper for Prototype State
   */
  const TT_STORAGE_KEYS = {
    ACCEPTED: 'sceo_timetable_accepted_suggestions',
    DISMISSED: 'sceo_timetable_dismissed_suggestions'
  };

  const ALERT_STORAGE_KEYS = {
    STATUSES: 'sceo_alert_statuses',
    DYNAMIC: 'sceo_alert_dynamic'
  };

  const SC_STORAGE_KEYS = {
    ROOMS: 'sceo_sc_rooms',
    LOGS: 'sceo_sc_logs',
    SAVINGS: 'sceo_sc_savings',
    MODE: 'sceo_sc_mode'
  };

  const MAINT_STORAGE_KEYS = {
    TASKS: 'sceo_maint_tasks',
    VIEW_MODE: 'sceo_maint_view_mode'
  };

  const DEPT_STORAGE_KEYS = {
    DEPARTMENTS: 'sceo_dept_data',
    PERIOD: 'sceo_dept_period',
    ACTIVE_DEPT: 'sceo_dept_active_id'
  };

  const SETTINGS_STORAGE_KEYS = {
    TARIFF: 'sceo_settings_tariff',
    DEMAND: 'sceo_settings_demand',
    CARBON: 'sceo_settings_carbon'
  };

  function loadStoredObject(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const obj = JSON.parse(raw);
        if (typeof obj === 'object' && obj !== null) return obj;
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
    return {};
  }

  function saveStoredObject(key, obj) {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }

  function loadStoredArray(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
    return [];
  }

  function saveStoredArray(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadStoredSet(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
    return new Set();
  }

  function saveStoredSet(key, setObj) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }

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

    // Ensure all views are hidden before activating target view
    if (elements.overviewView) elements.overviewView.style.display = 'none';
    if (elements.heatmapView) elements.heatmapView.style.display = 'none';
    if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
    if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
    if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
    if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
    if (elements.maintenanceView) elements.maintenanceView.style.display = 'none';
    if (elements.deptChallengeView) elements.deptChallengeView.style.display = 'none';
    if (elements.savingsReportsView) elements.savingsReportsView.style.display = 'none';
    if (elements.settingsView) elements.settingsView.style.display = 'none';
    if (elements.placeholderView) elements.placeholderView.style.display = 'none';

    if (viewKey === 'overview') {
      elements.overviewView.style.display = 'block';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Campus Overview';
      elements.topBreadcrumb.textContent = 'Campus Management / Overview';
    } else if (viewKey === 'energy-heatmap') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'block';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
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
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
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
    } else if (viewKey === 'timetable-optimizer') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'block';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Timetable Optimizer';
      elements.topBreadcrumb.textContent = 'Campus Management / Timetable Optimizer';

      if (elements.ttBuildingFilter) {
        elements.ttBuildingFilter.value = state.timetableBuildingFilter;
      }
      renderTimetableOptimizer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewKey === 'alerts-actions') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'block';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Alerts & Actions';
      elements.topBreadcrumb.textContent = 'Campus Management / Alerts & Actions';

      if (elements.alertBuildingFilter) {
        elements.alertBuildingFilter.value = state.alertBuildingFilter;
      }
      if (elements.alertSeverityFilter) {
        elements.alertSeverityFilter.value = state.alertSeverityFilter;
      }
      if (elements.alertStatusFilter) {
        elements.alertStatusFilter.value = state.alertStatusFilter;
      }
      if (elements.alertDateFilter) {
        elements.alertDateFilter.value = state.alertDateFilter;
      }
      if (elements.alertSearchInput) {
        elements.alertSearchInput.value = state.alertSearchQuery;
      }

      renderAlertsAndActions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewKey === 'smart-controls') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'block';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Smart Controls Simulator';
      elements.topBreadcrumb.textContent = 'Campus Management / Smart Controls Simulator';

      populateSmartControlsRoomSelector();
      if (elements.scBuildingFilter) elements.scBuildingFilter.value = state.scBuildingFilter;
      if (elements.scRoomSelect) elements.scRoomSelect.value = state.scRoomFilter;
      if (elements.scStatusFilter) elements.scStatusFilter.value = state.scStatusFilter;
      if (elements.scDelaySelect) elements.scDelaySelect.value = state.scAutoShutdownDelay;

      renderSmartControls();
      startSimulationLoop();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewKey === 'maintenance') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      if (elements.deptChallengeView) elements.deptChallengeView.style.display = 'none';
      if (elements.maintenanceView) elements.maintenanceView.style.display = 'block';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Preventive Maintenance';
      elements.topBreadcrumb.textContent = 'Campus Management / Preventive Maintenance';

      if (elements.maintBuildingFilter) elements.maintBuildingFilter.value = state.maintFilterBuilding;
      if (elements.maintTypeFilter) elements.maintTypeFilter.value = state.maintFilterType;
      if (elements.maintStatusFilter) elements.maintStatusFilter.value = state.maintFilterStatus;
      if (elements.maintSearchInput) elements.maintSearchInput.value = state.maintSearchQuery;

      renderMaintenanceView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewKey === 'dept-challenge') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      if (elements.maintenanceView) elements.maintenanceView.style.display = 'none';
      if (elements.deptChallengeView) elements.deptChallengeView.style.display = 'block';
      elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Department Energy Challenge';
      elements.topBreadcrumb.textContent = 'Campus Management / Department Energy Challenge';

      syncDeptPeriodButtons();
      renderDepartmentChallengeView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewKey === 'savings-reports') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      if (elements.maintenanceView) elements.maintenanceView.style.display = 'none';
      if (elements.deptChallengeView) elements.deptChallengeView.style.display = 'none';
      if (elements.settingsView) elements.settingsView.style.display = 'none';
      if (elements.savingsReportsView) elements.savingsReportsView.style.display = 'block';
      if (elements.placeholderView) elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Energy Savings & Reports';
      elements.topBreadcrumb.textContent = 'Campus Management / Energy Savings & Reports';

      if (elements.reportsBuildingFilter) elements.reportsBuildingFilter.value = state.reportsBuildingFilter;
      if (elements.reportsMetricFilter) elements.reportsMetricFilter.value = state.reportsMetricFilter;
      syncReportsDateButtons();
      renderSavingsReportsView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewKey === 'settings') {
      elements.overviewView.style.display = 'none';
      if (elements.heatmapView) elements.heatmapView.style.display = 'none';
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      if (elements.maintenanceView) elements.maintenanceView.style.display = 'none';
      if (elements.deptChallengeView) elements.deptChallengeView.style.display = 'none';
      if (elements.savingsReportsView) elements.savingsReportsView.style.display = 'none';
      if (elements.settingsView) elements.settingsView.style.display = 'block';
      if (elements.placeholderView) elements.placeholderView.style.display = 'none';
      elements.topHeading.textContent = 'Settings & Demo Data';
      elements.topBreadcrumb.textContent = 'Campus Management / Settings & Demo Data';

      renderSettingsView();
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
      if (elements.classroomAnalyticsView) elements.classroomAnalyticsView.style.display = 'none';
      if (elements.timetableOptimizerView) elements.timetableOptimizerView.style.display = 'none';
      if (elements.alertsActionsView) elements.alertsActionsView.style.display = 'none';
      if (elements.smartControlsView) elements.smartControlsView.style.display = 'none';
      if (elements.maintenanceView) elements.maintenanceView.style.display = 'none';
      if (elements.deptChallengeView) elements.deptChallengeView.style.display = 'none';
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
        gradient.addColorStop(0, 'rgba(22, 140, 134, 0.25)');
        gradient.addColorStop(1, 'rgba(22, 140, 134, 0.02)');

        state.consumptionChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: `${scopeName} Consumption (kWh)`,
                data: consumptionData,
                borderColor: '#168C86',
                backgroundColor: gradient,
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#168C86',
                pointBorderWidth: 2,
                pointRadius: is30d ? 2 : 4,
                pointHoverRadius: 6
              },
              {
                label: 'Baseline Target',
                data: baselineData,
                borderColor: '#8598A8',
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
                backgroundColor: '#183B56',
                titleFont: { family: 'Inter', size: 12 },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 10,
                cornerRadius: 6,
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
                  color: '#647789'
                }
              },
              y: {
                grid: {
                  color: '#E1E8EE'
                },
                ticks: {
                  font: { family: 'Inter', size: 11 },
                  color: '#647789',
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
              backgroundColor: ['#183B56', '#168C86', '#647789'],
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
                backgroundColor: '#183B56',
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
   * Safe Priority & Energy Intensity Calculation for Heatmap Room Tiles
   * Formula: Energy intensity = energy consumed (kWh) / occupied hours
   * Safe guards for 0 occupied hours and missing readings (Never shows NaN or Infinity).
   */
  function getRoomPriorityInfo(room, periodKey) {
    const m = room ? room[periodKey] : null;

    // 1. Safe missing readings check
    if (!m || m.totalKWh === null || m.totalKWh === undefined || m.totalKWh === '') {
      return {
        level: 'NO_DATA',
        label: 'NO DATA',
        intensityText: 'No Data',
        intensityVal: -1,
        colorClass: 'priority-nodata',
        bg: '#E8EDF1',
        text: '#536574',
        border: '#D2DBE2',
        pillBg: '#536574'
      };
    }

    // 2. Safe energy intensity calculation (kWh / occupied hours)
    let intensity = m.kwhPerOccupiedHour;
    if (typeof intensity !== 'number' || isNaN(intensity)) {
      if (m.occupiedHours && m.occupiedHours > 0 && typeof m.totalKWh === 'number') {
        intensity = parseFloat((m.totalKWh / m.occupiedHours).toFixed(2));
      } else {
        intensity = 0.0;
      }
    }

    // Guard against Infinity or NaN
    if (!isFinite(intensity) || isNaN(intensity)) {
      intensity = 0.0;
    }

    const intensityFormatted = `${intensity.toFixed(2)} kWh/h`;

    // 3. Priority determination:
    // Reuses verified empirical dataset status & benchmark delta
    // LOW: Optimal efficiency within baseline envelope (status green)
    // MEDIUM: Moderate consumption / minor potential (status yellow)
    // HIGH: Elevated intensity relative to schedule or waste issue (status orange/red)
    const status = m.status;
    if (status === 'red' || status === 'orange') {
      return {
        level: 'HIGH',
        label: 'HIGH',
        intensityText: intensityFormatted,
        intensityVal: intensity,
        colorClass: 'priority-high',
        bg: '#F5D1D1',
        text: '#8B3030',
        border: '#E6AAAA',
        pillBg: '#8B3030'
      };
    } else if (status === 'yellow') {
      return {
        level: 'MEDIUM',
        label: 'MEDIUM',
        intensityText: intensityFormatted,
        intensityVal: intensity,
        colorClass: 'priority-medium',
        bg: '#FBE9B9',
        text: '#77500D',
        border: '#EBD38B',
        pillBg: '#77500D'
      };
    } else {
      return {
        level: 'LOW',
        label: 'LOW',
        intensityText: intensityFormatted,
        intensityVal: intensity,
        colorClass: 'priority-low',
        bg: '#D8F0DF',
        text: '#205D38',
        border: '#B3DCC0',
        pillBg: '#205D38'
      };
    }
  }

  /**
   * Reset Heatmap Filters & Search
   */
  function resetHeatmapFilters() {
    state.heatmapPriority = 'all';
    state.heatmapSearch = '';
    state.selectedBuilding = 'all';
    state.heatmapSort = 'metricDesc';
    state.heatmapMetric = 'kwhPerOccupiedHour';
    state.dateRange = '7d';

    if (elements.heatmapPriorityFilter) elements.heatmapPriorityFilter.value = 'all';
    if (elements.heatmapSearchInput) elements.heatmapSearchInput.value = '';
    if (elements.heatmapBuildingFilter) elements.heatmapBuildingFilter.value = 'all';
    if (elements.buildingSelector) elements.buildingSelector.value = 'all';
    if (elements.heatmapSortSelect) elements.heatmapSortSelect.value = 'metricDesc';

    // Reset metric buttons
    elements.btnMetricIntensity?.classList.add('active');
    elements.btnMetricTotal?.classList.remove('active');
    elements.btnMetricWaste?.classList.remove('active');

    // Reset date range buttons
    elements.btnRange7d?.classList.add('active');
    elements.btnRange30d?.classList.remove('active');
    elements.hmBtnRange7d?.classList.add('active');
    elements.hmBtnRange30d?.classList.remove('active');

    renderHeatmap();
    showToast('Heatmap filters cleared', 'info');
  }

  /**
   * Render Energy Waste Heatmap (Step 2 Implementation with Full-Color Priority Tiles)
   */
  function renderHeatmap() {
    if (!elements.heatmapGridContainer) return;

    const periodKey = state.dateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const periodLabel = state.dateRange === '30d' ? 'Last 30 Days' : 'Last 7 Days';

    // 1. Filter classrooms by current building, priority filter, and search query
    const allRooms = SCEO_DATA.classrooms;
    const filteredRooms = allRooms.filter(room => {
      // Building filter
      if (state.selectedBuilding !== 'all' && room.buildingId !== state.selectedBuilding) {
        return false;
      }

      const pInfo = getRoomPriorityInfo(room, periodKey);

      // Priority filter: 'all' | 'low' | 'medium' | 'high' | 'nodata'
      if (state.heatmapPriority && state.heatmapPriority !== 'all') {
        if (state.heatmapPriority === 'low' && pInfo.level !== 'LOW') return false;
        if (state.heatmapPriority === 'medium' && pInfo.level !== 'MEDIUM') return false;
        if (state.heatmapPriority === 'high' && pInfo.level !== 'HIGH') return false;
        if (state.heatmapPriority === 'nodata' && pInfo.level !== 'NO_DATA') return false;
      }

      // Search query filter (matches room identifier or name)
      if (state.heatmapSearch) {
        const query = state.heatmapSearch.toLowerCase();
        const matchesId = room.id.toLowerCase().includes(query);
        const matchesName = room.name && room.name.toLowerCase().includes(query);
        if (!matchesId && !matchesName) return false;
      }

      return true;
    });

    // 2. Calculate dynamic summary values from filtered dataset
    const totalKWh = filteredRooms.reduce((acc, r) => acc + (r[periodKey]?.totalKWh || 0), 0);
    const avoidableWasteKWh = filteredRooms.reduce((acc, r) => acc + (r[periodKey]?.estimatedWasteKWh || 0), 0);
    const avoidablePercent = totalKWh > 0 ? ((avoidableWasteKWh / totalKWh) * 100).toFixed(1) : '0.0';
    const highPriorityCount = filteredRooms.filter(r => {
      const pInfo = getRoomPriorityInfo(r, periodKey);
      return pInfo.level === 'HIGH';
    }).length;

    // Find room with highest energy per occupied hour
    let highestRoom = null;
    let maxIntensity = -1;
    filteredRooms.forEach(r => {
      const pInfo = getRoomPriorityInfo(r, periodKey);
      if (pInfo.intensityVal > maxIntensity) {
        maxIntensity = pInfo.intensityVal;
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
        ? `${highPriorityCount} room${highPriorityCount === 1 ? '' : 's'} with elevated waste`
        : 'All rooms within baseline';
    }
    if (elements.hmSummaryAvoidableEnergy) {
      elements.hmSummaryAvoidableEnergy.textContent = formatNumber(avoidableWasteKWh);
      elements.hmSummaryAvoidablePercent.textContent = `${avoidablePercent}%`;
    }
    if (elements.hmSummaryHighestRoom) {
      if (highestRoom) {
        const pInfo = getRoomPriorityInfo(highestRoom, periodKey);
        elements.hmSummaryHighestRoom.textContent = highestRoom.id;
        elements.hmSummaryHighestRate.textContent = pInfo.intensityText;
        const benchmark = highestRoom[periodKey]?.benchmarkKwhPerHour || 4.8;
        const delta = Math.round(((pInfo.intensityVal - benchmark) / benchmark) * 100);
        elements.hmSummaryHighestDelta.textContent = `${delta >= 0 ? '+' : ''}${delta}%`;
        elements.hmSummaryHighestDelta.className = delta > 20 ? 'trend-badge warning' : 'trend-badge positive';
        elements.hmSummaryHighestSub.textContent = `Target: ${benchmark} kWh/hr (${highestRoom.roomType})`;
      } else {
        elements.hmSummaryHighestRoom.textContent = 'None';
        elements.hmSummaryHighestRate.textContent = '-';
        elements.hmSummaryHighestDelta.textContent = '-';
        elements.hmSummaryHighestSub.textContent = 'No matching rooms';
      }
    }

    // 3. Sort classrooms
    const sortedRooms = [...filteredRooms].sort((a, b) => {
      const mA = a[periodKey] || {};
      const mB = b[periodKey] || {};
      if (state.heatmapSort === 'wasteDesc') {
        return (mB.estimatedWasteKWh || 0) - (mA.estimatedWasteKWh || 0);
      } else if (state.heatmapSort === 'totalDesc') {
        return (mB.totalKWh || 0) - (mA.totalKWh || 0);
      } else if (state.heatmapSort === 'idAsc') {
        return a.id.localeCompare(b.id);
      } else if (state.heatmapSort === 'metricAsc') {
        if (state.heatmapMetric === 'totalKWh') {
          return (mA.totalKWh || 0) - (mB.totalKWh || 0);
        } else if (state.heatmapMetric === 'estimatedWasteKWh') {
          return (mA.estimatedWasteKWh || 0) - (mB.estimatedWasteKWh || 0);
        } else {
          const pA = getRoomPriorityInfo(a, periodKey);
          const pB = getRoomPriorityInfo(b, periodKey);
          return (pA.intensityVal || 0) - (pB.intensityVal || 0);
        }
      } else {
        // Default: metricDesc based on selected heatmapMetric
        if (state.heatmapMetric === 'totalKWh') {
          return (mB.totalKWh || 0) - (mA.totalKWh || 0);
        } else if (state.heatmapMetric === 'estimatedWasteKWh') {
          return (mB.estimatedWasteKWh || 0) - (mA.estimatedWasteKWh || 0);
        } else {
          const pA = getRoomPriorityInfo(a, periodKey);
          const pB = getRoomPriorityInfo(b, periodKey);
          return (pB.intensityVal || 0) - (pA.intensityVal || 0);
        }
      }
    });

    // 4. Group by building & build HTML
    elements.heatmapGridContainer.innerHTML = '';

    if (sortedRooms.length === 0) {
      elements.heatmapGridContainer.innerHTML = `
        <div class="heatmap-empty-state card">
          <div style="width: 44px; height: 44px; border-radius: 50%; background-color: var(--color-surface-soft); color: var(--color-primary-navy); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 style="font-size: 15px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">No rooms match the selected criteria</h3>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 14px;">Try searching for a different room ID or resetting filters.</p>
          <button type="button" class="btn-secondary btn-sm" id="btnEmptyResetHeatmapFilters">Reset Heatmap Filters</button>
        </div>
      `;
      const btnReset = document.getElementById('btnEmptyResetHeatmapFilters');
      if (btnReset) {
        btnReset.addEventListener('click', resetHeatmapFilters);
      }
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
          <span style="font-size: 12px; opacity: 0.85;">(${bldgRooms.length} Room${bldgRooms.length === 1 ? '' : 's'})</span>
        </div>
        <div class="building-group-stats">
          <span>Baseline: <strong>${bldg.currentBaselineKW} kW</strong></span>
          <span>Period Draw: <strong>${formatNumber(bldgTotalKWh)} kWh</strong></span>
          <span style="color: #FCD34D;">Est. Waste: <strong>${formatNumber(bldgWasteKWh)} kWh</strong></span>
        </div>
      `;
      groupWrapper.appendChild(header);

      // Grid of Compact Full-Color Priority Tiles
      const tilesGrid = document.createElement('div');
      tilesGrid.className = 'heatmap-tiles-grid heatmap-cards-grid';

      bldgRooms.forEach(room => {
        const metrics = room[periodKey] || {};
        const pInfo = getRoomPriorityInfo(room, periodKey);

        const tile = document.createElement('div');
        tile.id = `roomCard-${room.id}`;
        tile.className = `heatmap-room-tile room-tile room-card ${pInfo.colorClass}`;
        if (state.selectedRoomId === room.id) {
          tile.classList.add('selected');
        }
        tile.setAttribute('data-room-id', room.id);
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', `Classroom ${room.id}, ${pInfo.label} Priority, ${pInfo.intensityText}`);

        // Small value to display based on active metric
        let displayMetricVal = pInfo.intensityText;
        let metricTitle = 'Energy Intensity';
        if (state.heatmapMetric === 'totalKWh' && metrics.totalKWh != null) {
          displayMetricVal = `${formatNumber(metrics.totalKWh)} kWh`;
          metricTitle = 'Total Energy';
        } else if (state.heatmapMetric === 'estimatedWasteKWh' && metrics.estimatedWasteKWh != null) {
          displayMetricVal = `${formatNumber(metrics.estimatedWasteKWh)} kWh`;
          metricTitle = 'Estimated Waste';
        }

        tile.innerHTML = `
          <div class="tile-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
              <path d="M14 12v.01"></path>
              <path d="M20 21H4"></path>
            </svg>
          </div>
          <div class="tile-room-id">${room.id}</div>
          <div class="tile-intensity" title="${metricTitle}">${displayMetricVal}</div>
          <div class="tile-priority-pill" aria-hidden="true">${pInfo.label}</div>
        `;

        tile.addEventListener('click', () => {
          state.selectedRoomId = room.id;
          document.querySelectorAll('.heatmap-room-tile, .room-tile').forEach(t => t.classList.remove('selected'));
          tile.classList.add('selected');
          openRoomModal(room.id);
        });

        tile.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            state.selectedRoomId = room.id;
            document.querySelectorAll('.heatmap-room-tile, .room-tile').forEach(t => t.classList.remove('selected'));
            tile.classList.add('selected');
            openRoomModal(room.id);
          }
        });

        tilesGrid.appendChild(tile);
      });

      groupWrapper.appendChild(tilesGrid);
      elements.heatmapGridContainer.appendChild(groupWrapper);
    });
  }

  /**
   * Open Classroom Detail Modal (Step 2 & Step 12 Interactivity)
   */
  function openRoomModal(roomId) {
    const room = SCEO_DATA.classrooms.find(r => r.id === roomId);
    if (!room || !elements.roomDetailModal) return;

    state.activeRoomInModal = room;
    const periodKey = state.dateRange === '30d' ? 'thirtyDays' : 'sevenDays';
    const periodLabel = state.dateRange === '30d' ? 'Last 30 Days' : 'Last 7 Days';
    const metrics = room[periodKey] || {};
    const pInfo = getRoomPriorityInfo(room, periodKey);

    // Populate Header & Meta
    elements.roomModalBuildingBadge.textContent = room.buildingName;
    elements.roomModalZone.textContent = `${room.hvacZone} • ${room.floor}`;
    elements.roomModalTitle.textContent = `${room.name}`;

    elements.roomModalStatusBadge.className = `room-status-badge ${pInfo.colorClass}`;
    elements.roomModalStatusBadge.textContent = `${pInfo.label} Priority • ${metrics.statusLabel || 'Monitored Room'}`;
    elements.roomModalTypeTag.textContent = `${room.roomType} • Capacity: ${room.capacity} Seats • ${room.occupancyState}`;

    // Populate 4 Stats Cards
    elements.roomModalTotalKWh.textContent = formatNumber(metrics.totalKWh || 0);
    elements.roomModalPeriodLabel.textContent = periodLabel;
    elements.roomModalOccupiedHours.textContent = metrics.occupiedHours || 0;
    elements.roomModalIntensity.textContent = metrics.kwhPerOccupiedHour != null ? metrics.kwhPerOccupiedHour : '-';

    const benchmark = metrics.benchmarkKwhPerHour || 4.8;
    const intensity = metrics.kwhPerOccupiedHour != null ? metrics.kwhPerOccupiedHour : 0;
    const intensityDiff = intensity - benchmark;
    const intensityDiffPct = Math.round((intensityDiff / benchmark) * 100);
    elements.roomModalIntensitySub.textContent = `${intensityDiffPct >= 0 ? '+' : ''}${intensityDiffPct}% vs benchmark`;

    elements.roomModalWasteKWh.textContent = formatNumber(metrics.estimatedWasteKWh || 0);
    elements.roomModalWastePercent.textContent = `${metrics.wastePercentage || 0}% of room consumption`;

    // Benchmark Comparison
    elements.roomModalBenchmarkDesc.textContent = `Expected efficient target for ${room.roomType} (${room.capacity} seats): ${benchmark} kWh/hr.`;

    const deltaKWh = (intensity - benchmark).toFixed(2);
    if (deltaKWh > 0) {
      elements.roomModalBenchmarkDelta.className = 'benchmark-delta-pill';
      elements.roomModalBenchmarkDelta.textContent = `+${deltaKWh} kWh/hr above benchmark (+${intensityDiffPct}%)`;
    } else {
      elements.roomModalBenchmarkDelta.className = 'benchmark-delta-pill optimal';
      elements.roomModalBenchmarkDelta.textContent = `${Math.abs(deltaKWh)} kWh/hr below baseline (Efficient)`;
    }

    // Benchmark Progress Bars
    const maxBarRate = Math.max(intensity, benchmark, 6) * 1.15;
    const measuredPct = Math.min(100, Math.round((intensity / maxBarRate) * 100));
    const targetPct = Math.min(100, Math.round((benchmark / maxBarRate) * 100));

    elements.roomModalMeasuredBar.style.width = `${measuredPct}%`;
    elements.roomModalMeasuredBar.style.backgroundColor = pInfo.level === 'HIGH' ? '#DC2626' : (pInfo.level === 'MEDIUM' ? '#CA8A04' : '#16A34A');
    elements.roomModalMeasuredBarVal.textContent = `${intensity} kWh/hr`;

    elements.roomModalTargetBar.style.width = `${targetPct}%`;
    elements.roomModalTargetBarVal.textContent = `${benchmark} kWh/hr`;

    // Populate Active Alerts Box (if room has active anomalies)
    if (elements.roomModalAlertsBox) {
      const roomAlerts = (SCEO_DATA.alerts || []).filter(a => a.roomId === room.id && state.alertStatuses[a.id] !== 'resolved');
      if (roomAlerts.length > 0) {
        elements.roomModalAlertsBox.style.display = 'flex';
        elements.roomModalAlertsBox.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <strong>Active Alert: ${roomAlerts[0].title} (${roomAlerts[0].severityLabel || 'Attention'})</strong>
            <span style="display: block; margin-top: 2px; opacity: 0.95;">${roomAlerts[0].reason}</span>
          </div>
        `;
      } else {
        elements.roomModalAlertsBox.style.display = 'none';
      }
    }

    // Populate Installed Equipment & Connected Systems
    if (elements.roomModalEquipmentList) {
      elements.roomModalEquipmentList.innerHTML = '';
      const scRoom = SCEO_DATA.smartControls?.rooms?.find(r => r.roomId === room.id);
      const devices = scRoom ? scRoom.devices : [];
      if (devices.length > 0) {
        devices.forEach(dev => {
          const devDiv = document.createElement('div');
          devDiv.className = 'room-modal-device-item';
          const isOn = dev.state === 'on';
          devDiv.innerHTML = `
            <div class="device-item-left">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${isOn ? 'var(--color-success)' : 'var(--color-text-muted)'};"></span>
              <strong>${dev.name}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--color-text-secondary); font-size: 11px;">${dev.powerKW} kW</span>
              <span class="device-state-pill ${isOn ? 'on' : 'off'}">${isOn ? 'ON' : 'OFF'}</span>
            </div>
          `;
          elements.roomModalEquipmentList.appendChild(devDiv);
        });
      } else {
        elements.roomModalEquipmentList.innerHTML = `<span style="font-size: 12px; color: var(--color-text-muted);">Standard classroom infrastructure (sub-metered circuit).</span>`;
      }
    }

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
                backgroundColor: 'rgba(22, 140, 134, 0.85)',
                hoverBackgroundColor: '#12736E',
                borderRadius: 4,
                order: 2
              },
              {
                type: 'line',
                label: 'Baseline Target',
                data: dailyData.baseline,
                borderColor: '#8598A8',
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: '#8598A8',
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
                backgroundColor: '#183B56',
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
                backgroundColor: 'rgba(22, 140, 134, 0.85)',
                hoverBackgroundColor: '#168C86',
                borderRadius: 4,
                yAxisID: 'y',
                order: 2
              },
              {
                type: 'line',
                label: 'Scheduled Occupancy',
                data: occupancySchedule,
                borderColor: '#23865B',
                backgroundColor: 'rgba(35, 134, 91, 0.15)',
                borderWidth: 2.5,
                stepped: 'before',
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#23865B',
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
                backgroundColor: '#183B56',
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
                backgroundColor: ['#168C86', '#183B56', '#8598A8'],
                hoverBackgroundColor: ['#12736E', '#224C6E', '#647789'],
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
                backgroundColor: '#183B56',
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
                ticks: { font: { family: 'Inter', size: 11 }, color: '#647789' }
              },
              y: {
                beginAtZero: true,
                grid: { color: '#E1E8EE' },
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

    const potentialSavingsKWh = SCEO_CALCULATIONS.calculatePotentialSavings(kw, hours, days);
    const estimatedCostSavings = SCEO_CALCULATIONS.calculateCostSavings(potentialSavingsKWh, tariff);
    const co2Reduction = Math.round(potentialSavingsKWh * 0.42);

    if (elements.estResultKWh) {
      elements.estResultKWh.textContent = Number.isInteger(potentialSavingsKWh)
        ? potentialSavingsKWh.toLocaleString('en-US')
        : (potentialSavingsKWh < 10 ? potentialSavingsKWh.toFixed(1) : Math.round(potentialSavingsKWh).toLocaleString('en-US'));
    }
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

  // ==========================================================================
  // STEP 4: TIMETABLE OPTIMIZER & ACADEMIC SCHEDULING CONTROLLER
  // Note: All schedules, room allocations, and energy calculations are simulated.
  // ==========================================================================

  /**
   * Resolve Dynamic Prototype Classes with Accepted Suggestions and Conflicts
   */
  function getEffectiveTimetableClasses() {
    if (!SCEO_DATA.timetable || !SCEO_DATA.timetable.classes) return [];

    // Clone base classes
    const classes = SCEO_DATA.timetable.classes.map(cls => ({ ...cls }));

    // Apply accepted suggestions
    state.acceptedSuggestions.forEach(sugId => {
      const sug = SCEO_DATA.timetable.suggestions?.find(s => s.id === sugId);
      if (!sug) return;
      const targetClass = classes.find(c => c.id === sug.classId);
      if (!targetClass) return;

      targetClass.originalRoomId = targetClass.roomId;
      targetClass.originalPowerKW = targetClass.powerKW;
      targetClass.originalSlotId = targetClass.slotId;

      targetClass.roomId = sug.proposedRoomId;
      targetClass.powerKW = sug.proposedPowerKW;
      targetClass.sessionKWh = Number((sug.proposedPowerKW * targetClass.durationHours).toFixed(1));

      if (sug.slotId && sug.slotId !== targetClass.slotId) {
        targetClass.slotId = sug.slotId;
        const slotObj = SCEO_DATA.timetable.timeslots.find(t => t.id === sug.slotId);
        if (slotObj) {
          targetClass.startTime = slotObj.start;
          targetClass.endTime = slotObj.end;
        }
      }

      targetClass.isRelocated = true;
      targetClass.relocatedFrom = sug.currentRoomId;
      targetClass.relocatedTo = sug.proposedRoomId;
      targetClass.acceptedSuggestionId = sug.id;
    });

    // In simulated conflict mode, add mock conflict classes for demonstration
    if (state.simulatedConflictActive) {
      // 1. Room Double Booking in ENG-101 on Mon slot-4 (14:00 - 16:00)
      classes.push({
        id: 'SIM-CONFLICT-01',
        courseCode: 'CS-490',
        courseName: 'Distributed Systems & Cloud Computing Seminar',
        department: 'Computer Science',
        instructor: 'Dr. Liam O\'Connor',
        roomId: 'ENG-101',
        buildingId: 'engineering',
        day: 'Mon',
        slotId: 'slot-4',
        startTime: '14:00',
        endTime: '16:00',
        durationHours: 2.0,
        enrolled: 48,
        roomTypeNeeded: 'Lecture Theater',
        equipmentNeeded: ['Tiered Seating', 'Dual AV'],
        powerKW: 6.8,
        sessionKWh: 13.6,
        isConflict: true,
        conflictType: 'OVERLAP',
        conflictDetails: 'Collision in ENG-101: Overlaps with ENGR-204 at 14:00 - 16:00'
      });

      // 2. Capacity Overflow in ENG-208 on Fri slot-1 (08:00 - 10:00)
      classes.push({
        id: 'SIM-CONFLICT-02',
        courseCode: 'MATH-420',
        courseName: 'Applied Differential Geometry & Manifolds',
        department: 'Mathematics & Eng.',
        instructor: 'Prof. Sarah Lin',
        roomId: 'ENG-208',
        buildingId: 'engineering',
        day: 'Fri',
        slotId: 'slot-1',
        startTime: '08:00',
        endTime: '10:00',
        durationHours: 2.0,
        enrolled: 62, // ENG-208 has only 40 seats capacity
        roomTypeNeeded: 'Seminar Room',
        equipmentNeeded: ['Whiteboards'],
        powerKW: 2.1,
        sessionKWh: 4.2,
        isConflict: true,
        conflictType: 'CAPACITY',
        conflictDetails: 'Capacity Overflow: 62 enrolled students exceeds ENG-208 capacity of 40 seats'
      });

      // 3. Missing Room Type Specification in SCI-305
      classes.push({
        id: 'SIM-CONFLICT-03',
        courseCode: 'BIO-499',
        courseName: 'Independent Molecular Biology Research',
        department: 'Biological Sciences',
        instructor: 'Prof. Elena Rostova',
        roomId: 'SCI-305',
        buildingId: 'science',
        day: 'Wed',
        slotId: 'slot-1',
        startTime: '08:00',
        endTime: '10:00',
        durationHours: 2.0,
        enrolled: 18,
        roomTypeNeeded: '', // Missing room type requirement
        equipmentNeeded: ['Microscopes'],
        powerKW: 1.6,
        sessionKWh: 3.2,
        isConflict: true,
        conflictType: 'MISSING_DATA',
        conflictDetails: 'Missing room-type specification requirement for experimental biology'
      });
    }

    return classes;
  }

  /**
   * Schedule Conflict Checker (Requirement 7)
   */
  function checkScheduleConflicts(classes) {
    const conflicts = [];
    const roomBookingMap = new Map();

    classes.forEach(cls => {
      // 1. Invalid or missing start/end times
      if (!cls.startTime || !cls.endTime || cls.startTime >= cls.endTime) {
        conflicts.push({
          type: 'INVALID_TIME',
          title: 'Invalid Schedule Timing',
          classId: cls.id,
          courseCode: cls.courseCode,
          roomId: cls.roomId,
          day: cls.day,
          description: `Class ${cls.courseCode} has invalid timing (${cls.startTime || 'missing'} to ${cls.endTime || 'missing'}).`
        });
      }

      // 2. Missing room definition or capacity data
      const room = SCEO_DATA.classrooms.find(r => r.id === cls.roomId);
      if (!room) {
        conflicts.push({
          type: 'MISSING_ROOM',
          title: 'Unrecognized Classroom ID',
          classId: cls.id,
          courseCode: cls.courseCode,
          roomId: cls.roomId,
          day: cls.day,
          description: `Class ${cls.courseCode} assigned to unmonitored room "${cls.roomId}".`
        });
      } else {
        // Missing room type needed
        if (!cls.roomTypeNeeded || cls.roomTypeNeeded.trim() === '') {
          conflicts.push({
            type: 'MISSING_DATA',
            title: 'Missing Room Type Specification',
            classId: cls.id,
            courseCode: cls.courseCode,
            roomId: cls.roomId,
            day: cls.day,
            description: `Class ${cls.courseCode} in ${cls.roomId} has no room-type requirements specified.`
          });
        }

        // 3. Room Capacity Overflow check
        if (cls.enrolled > room.capacity) {
          conflicts.push({
            type: 'CAPACITY',
            title: 'Room Capacity Exceeded',
            classId: cls.id,
            courseCode: cls.courseCode,
            roomId: cls.roomId,
            day: cls.day,
            description: `Enrollment for ${cls.courseCode} (${cls.enrolled} students) exceeds room ${cls.roomId} capacity (${room.capacity} seats by +${cls.enrolled - room.capacity} students).`
          });
        }
      }

      // 4. Overlapping classes in the same room (Double Booking)
      const bookingKey = `${cls.day}__${cls.roomId}__${cls.slotId}`;
      if (roomBookingMap.has(bookingKey)) {
        const existingClass = roomBookingMap.get(bookingKey);
        conflicts.push({
          type: 'OVERLAP',
          title: 'Room Double-Booking Collision',
          classId: cls.id,
          existingClassId: existingClass.id,
          courseCode: cls.courseCode,
          existingCode: existingClass.courseCode,
          roomId: cls.roomId,
          day: cls.day,
          slotId: cls.slotId,
          description: `Collision in room ${cls.roomId} on ${SCEO_DATA.timetable.dayLabels[cls.day] || cls.day} (${cls.startTime} - ${cls.endTime}): Course ${cls.courseCode} overlaps with ${existingClass.courseCode}.`
        });
      } else {
        roomBookingMap.set(bookingKey, cls);
      }
    });

    return conflicts;
  }

  /**
   * Render Schedule Conflict Panel (Requirement 7)
   */
  function renderConflictChecker(conflicts) {
    if (!elements.ttConflictPanel) return;

    if (conflicts && conflicts.length > 0) {
      elements.ttConflictPanel.style.display = 'block';
      elements.ttConflictPanel.className = 'tt-conflict-panel conflict-detected';
      elements.ttConflictPanel.innerHTML = `
        <div class="conflict-panel-header">
          <div class="conflict-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>Schedule Conflicts Detected (${conflicts.length})</span>
          </div>
          <button type="button" class="btn-secondary btn-sm" id="btnTtClearConflictPanel">
            ${state.simulatedConflictActive ? 'Clear Simulated Conflict' : 'Dismiss Alert'}
          </button>
        </div>
        <ul class="conflict-list">
          ${conflicts.map(c => `<li><strong>${c.title} (${c.roomId}):</strong> ${c.description}</li>`).join('')}
        </ul>
      `;

      const clearBtn = document.getElementById('btnTtClearConflictPanel');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (state.simulatedConflictActive) {
            state.simulatedConflictActive = false;
            if (elements.btnTtToggleConflictText) elements.btnTtToggleConflictText.textContent = 'Simulate Sample Conflict';
            elements.btnTtToggleConflict?.classList.remove('active');
            renderTimetableOptimizer();
            showToast('Simulated conflicts cleared. Schedule verified as conflict-free.', 'info');
          } else {
            elements.ttConflictPanel.style.display = 'none';
          }
        });
      }
    } else {
      elements.ttConflictPanel.style.display = 'block';
      elements.ttConflictPanel.className = 'tt-conflict-panel schedule-valid';
      elements.ttConflictPanel.innerHTML = `
        <div class="conflict-panel-header">
          <div class="conflict-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Schedule Conflict Check Passed: 0 Room Collisions &bull; 0 Capacity Violations</span>
          </div>
          <button type="button" class="btn-secondary btn-sm" id="btnTtTestConflictFromPanel">Test Conflict Checker</button>
        </div>
      `;

      const testBtn = document.getElementById('btnTtTestConflictFromPanel');
      if (testBtn) {
        testBtn.addEventListener('click', () => {
          state.simulatedConflictActive = true;
          if (elements.btnTtToggleConflictText) elements.btnTtToggleConflictText.textContent = 'Clear Scenario Conflict';
          elements.btnTtToggleConflict?.classList.add('active');
          renderTimetableOptimizer();
          showToast('Sample schedule optimization scenarios loaded.', 'warning');
        });
      }
    }
  }

  /**
   * Main Timetable Optimizer View Render Coordinator
   */
  function renderTimetableOptimizer() {
    const classes = getEffectiveTimetableClasses();
    const conflicts = checkScheduleConflicts(classes);

    renderConflictChecker(conflicts);
    renderTimetableKPIs();
    renderTimetableGrid();
    renderTimetableSuggestions();
  }

  /**
   * Calculate and Render Timetable Summary Cards (Requirement 1 & 6)
   */
  function renderTimetableKPIs() {
    const classes = getEffectiveTimetableClasses();

    // Filter classes matching active scope
    const scopedClasses = classes.filter(cls => {
      const matchDay = (state.timetableDay === 'all' || cls.day === state.timetableDay);
      const matchBuilding = (state.timetableBuildingFilter === 'all' || cls.buildingId === state.timetableBuildingFilter);
      return matchDay && matchBuilding;
    });

    // 1. Scheduled Classes
    const totalWeekly = classes.filter(c => !c.isConflict).length;
    if (elements.ttKpiScheduledClasses) {
      elements.ttKpiScheduledClasses.textContent = scopedClasses.length;
    }
    if (elements.ttKpiScheduledClassesSub) {
      const dayLabel = state.timetableDay === 'all' ? 'All Days' : (SCEO_DATA.timetable.dayLabels[state.timetableDay] || state.timetableDay);
      elements.ttKpiScheduledClassesSub.textContent = `On ${dayLabel} (${totalWeekly} total weekly classes)`;
    }

    // 2. Rooms in Use
    const activeRooms = new Set(scopedClasses.map(c => c.roomId));
    const allRoomsInBuilding = SCEO_DATA.classrooms.filter(r => {
      return (state.timetableBuildingFilter === 'all' || r.buildingId === state.timetableBuildingFilter);
    });
    const totalRoomsCount = allRoomsInBuilding.length || 24;
    const utilizationPct = totalRoomsCount > 0 ? Math.round((activeRooms.size / totalRoomsCount) * 100) : 0;

    if (elements.ttKpiRoomsInUse) {
      elements.ttKpiRoomsInUse.textContent = `${activeRooms.size} / ${totalRoomsCount}`;
    }
    if (elements.ttKpiRoomsInUseSub) {
      elements.ttKpiRoomsInUseSub.textContent = `${utilizationPct}% room utilization in active scope`;
    }

    // 3. Consolidatable Classes / Opportunities
    const suggestions = SCEO_DATA.timetable.suggestions || [];
    const scopedSuggestions = suggestions.filter(sug => {
      const matchDay = (state.timetableDay === 'all' || sug.day === state.timetableDay);
      const matchBuilding = (state.timetableBuildingFilter === 'all' || sug.buildingId === 'all' || sug.buildingId === state.timetableBuildingFilter);
      return matchDay && matchBuilding;
    });

    const activeScopedSuggestions = scopedSuggestions.filter(s => !state.dismissedSuggestions.has(s.id));
    const acceptedCount = scopedSuggestions.filter(s => state.acceptedSuggestions.has(s.id)).length;

    if (elements.ttKpiConsolidatable) {
      elements.ttKpiConsolidatable.textContent = activeScopedSuggestions.length;
    }
    if (elements.ttKpiConsolidatableSub) {
      elements.ttKpiConsolidatableSub.textContent = `${acceptedCount} accepted for demo &bull; ${suggestions.length} campus-wide`;
    }

    // 4. Estimated Potential Energy Savings (Transparent Formula)
    // Formula: Avoidable kWh = sum of potential avoided energy for active suggestions in scope
    let avoidableKWh = 0;
    activeScopedSuggestions.forEach(s => {
      avoidableKWh += (s.potentialEnergyKWh || 0);
    });
    const tariff = SCEO_DATA.timetable.metadata?.electricityTariff || 0.18;
    const costSavings = avoidableKWh * tariff;

    if (elements.ttKpiSavings) {
      elements.ttKpiSavings.textContent = avoidableKWh.toFixed(1);
    }
    if (elements.ttKpiSavingsSub) {
      elements.ttKpiSavingsSub.textContent = `$${costSavings.toFixed(2)} potential cost avoided @ $${tariff}/kWh`;
    }
  }

  /**
   * Render Timetable Grid (Day Room Grid vs Weekly Matrix - Requirement 2)
   */
  function renderTimetableGrid() {
    if (!elements.ttTimetableMatrix) return;

    const classes = getEffectiveTimetableClasses();
    const timeslots = SCEO_DATA.timetable.timeslots;
    const dayLabel = state.timetableDay === 'all' ? 'All Days' : (SCEO_DATA.timetable.dayLabels[state.timetableDay] || state.timetableDay);
    const buildingObj = SCEO_DATA.buildings.find(b => b.id === state.timetableBuildingFilter);
    const buildingLabel = buildingObj ? buildingObj.name : 'All Buildings';

    // Update Heading & Scope Badge
    if (elements.ttMatrixHeading) {
      elements.ttMatrixHeading.textContent = state.timetableCurrentView === 'day' 
        ? 'Classroom Schedule Matrix (Day Grid)' 
        : 'Weekly Schedule Overview Matrix';
    }
    if (elements.ttMatrixScopeBadge) {
      elements.ttMatrixScopeBadge.textContent = `${dayLabel} &bull; ${buildingLabel}`;
    }

    // Filter available rooms by building filter
    let rooms = SCEO_DATA.classrooms.filter(r => {
      return (state.timetableBuildingFilter === 'all' || r.buildingId === state.timetableBuildingFilter);
    });

    const searchQuery = state.timetableSearchQuery.trim().toLowerCase();

    // Mode A: Day Grid View (Room Rows vs 6 Timeslot Columns)
    if (state.timetableCurrentView === 'day') {
      const activeDay = state.timetableDay === 'all' ? 'Mon' : state.timetableDay;

      // Filter classes for this day
      const dayClasses = classes.filter(cls => cls.day === activeDay);

      // Filter rooms if occupied only
      if (state.timetableOccupiedOnly) {
        const activeRoomIds = new Set(dayClasses.map(c => c.roomId));
        rooms = rooms.filter(r => activeRoomIds.has(r.id));
      }

      // Filter by search query if present
      if (searchQuery) {
        rooms = rooms.filter(r => {
          const roomMatch = r.id.toLowerCase().includes(searchQuery) || r.name.toLowerCase().includes(searchQuery);
          const hasMatchingClass = dayClasses.some(c => 
            c.roomId === r.id && (
              c.courseCode.toLowerCase().includes(searchQuery) ||
              c.courseName.toLowerCase().includes(searchQuery) ||
              c.instructor.toLowerCase().includes(searchQuery)
            )
          );
          return roomMatch || hasMatchingClass;
        });
      }

      // Check empty state
      if (rooms.length === 0) {
        elements.ttTimetableMatrix.innerHTML = '';
        if (elements.ttMatrixEmptyState) elements.ttMatrixEmptyState.style.display = 'block';
        return;
      } else {
        if (elements.ttMatrixEmptyState) elements.ttMatrixEmptyState.style.display = 'none';
      }

      let html = `
        <table class="timetable-matrix-table" aria-label="Classroom schedule matrix for ${dayLabel}">
          <thead>
            <tr>
              <th scope="col" style="width: 140px;">Classroom</th>
              ${timeslots.map(slot => `
                <th scope="col" class="time-header">
                  <span class="slot-time-label">${slot.label}</span>
                  <span class="slot-period-sub">${slot.period}</span>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
      `;

      rooms.forEach(room => {
        html += `
          <tr>
            <td class="room-matrix-header">
              <button type="button" class="room-matrix-id-btn" data-room-id="${room.id}" title="Click to view granular energy analytics for ${room.id}">
                ${room.id}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              <div class="room-matrix-meta">
                <span>${room.type}</span><br>
                <span>${room.capacity} seats</span> &bull; 
                <span class="room-matrix-kw">${room.basePowerKW || 2.4} kW</span>
              </div>
            </td>
        `;

        timeslots.forEach(slot => {
          const matchedClass = dayClasses.find(c => c.roomId === room.id && c.slotId === slot.id);

          if (matchedClass) {
            let blockClass = 'class-session-block';
            let badgeHtml = '';

            if (matchedClass.isConflict) {
              blockClass += ' conflict-item';
              badgeHtml = `<span class="class-badge-tag badge-conflict">Conflict</span>`;
            } else if (matchedClass.isRelocated) {
              blockClass += ' relocated';
              badgeHtml = `<span class="class-badge-tag badge-relocated">Relocated</span>`;
            } else if (matchedClass.isConsolidatable) {
              blockClass += ' consolidatable';
              badgeHtml = `<span class="class-badge-tag badge-opp">Opportunity</span>`;
            }

            const occPct = room.capacity > 0 ? Math.round((matchedClass.enrolled / room.capacity) * 100) : 0;

            html += `
              <td>
                <div class="${blockClass}" data-class-id="${matchedClass.id}" role="button" tabindex="0" title="Click for course and telemetry details">
                  <div class="class-block-top">
                    <span class="class-code">${matchedClass.courseCode}</span>
                    ${badgeHtml}
                  </div>
                  <div class="class-name-truncated" title="${matchedClass.courseName}">${matchedClass.courseName}</div>
                  <div class="class-metrics-footer">
                    <span class="class-occupancy-pill" title="Enrolled students / capacity">${matchedClass.enrolled}/${room.capacity} (${occPct}%)</span>
                    <span class="class-power-pill" title="Estimated power demand during session">${matchedClass.powerKW} kW</span>
                  </div>
                </div>
              </td>
            `;
          } else {
            html += `
              <td>
                <div class="idle-slot-cell" title="Room idle &bull; 0 kW scheduled draw">
                  <span>Vacant</span>
                </div>
              </td>
            `;
          }
        });

        html += `</tr>`;
      });

      html += `
          </tbody>
        </table>
      `;

      elements.ttTimetableMatrix.innerHTML = html;
    } 
    // Mode B: Weekly View Matrix (Days on Rows vs 6 Timeslot Columns)
    else {
      const days = SCEO_DATA.timetable.days;
      let scopedClasses = classes;

      if (state.timetableBuildingFilter !== 'all') {
        scopedClasses = scopedClasses.filter(c => c.buildingId === state.timetableBuildingFilter);
      }

      if (searchQuery) {
        scopedClasses = scopedClasses.filter(c => 
          c.courseCode.toLowerCase().includes(searchQuery) ||
          c.courseName.toLowerCase().includes(searchQuery) ||
          c.roomId.toLowerCase().includes(searchQuery) ||
          c.instructor.toLowerCase().includes(searchQuery)
        );
      }

      let html = `
        <table class="timetable-matrix-table" aria-label="Weekly schedule overview matrix">
          <thead>
            <tr>
              <th scope="col" style="width: 140px;">Day</th>
              ${timeslots.map(slot => `
                <th scope="col" class="time-header">
                  <span class="slot-time-label">${slot.label}</span>
                  <span class="slot-period-sub">${slot.period}</span>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
      `;

      days.forEach(day => {
        const dayClasses = scopedClasses.filter(c => c.day === day);

        html += `
          <tr>
            <td class="room-matrix-header">
              <span class="slot-time-label" style="font-size: var(--font-size-sm);">${SCEO_DATA.timetable.dayLabels[day]}</span>
              <span class="room-matrix-meta">${dayClasses.length} sessions</span>
            </td>
        `;

        timeslots.forEach(slot => {
          const slotClasses = dayClasses.filter(c => c.slotId === slot.id);

          if (slotClasses.length > 0) {
            html += `<td><div style="display: flex; flex-direction: column; gap: 4px;">`;
            slotClasses.forEach(cls => {
              let blockClass = 'class-session-block';
              if (cls.isRelocated) blockClass += ' relocated';
              else if (cls.isConsolidatable) blockClass += ' consolidatable';

              html += `
                <div class="${blockClass}" data-class-id="${cls.id}" role="button" tabindex="0" title="${cls.courseName} (${cls.roomId})">
                  <div class="class-block-top">
                    <span class="class-code">${cls.courseCode} &bull; ${cls.roomId}</span>
                    ${cls.isRelocated ? '<span class="class-badge-tag badge-relocated">Relocated</span>' : (cls.isConsolidatable ? '<span class="class-badge-tag badge-opp">Opportunity</span>' : '')}
                  </div>
                  <div class="class-metrics-footer">
                    <span>${cls.enrolled} st.</span>
                    <span class="class-power-pill">${cls.powerKW} kW</span>
                  </div>
                </div>
              `;
            });
            html += `</div></td>`;
          } else {
            html += `<td><div class="idle-slot-cell"><span>Vacant</span></div></td>`;
          }
        });

        html += `</tr>`;
      });

      html += `
          </tbody>
        </table>
      `;

      elements.ttTimetableMatrix.innerHTML = html;
    }

    // Attach Room ID click listeners -> navigate to Classroom Analytics
    elements.ttTimetableMatrix.querySelectorAll('.room-matrix-id-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const roomId = btn.dataset.roomId;
        navigateToRoomAnalytics(roomId);
      });
    });

    // Attach Class Block click listeners -> open Class Detail Modal
    elements.ttTimetableMatrix.querySelectorAll('.class-session-block').forEach(card => {
      card.addEventListener('click', () => {
        const classId = card.dataset.classId;
        openClassModal(classId);
      });
    });
  }

  /**
   * Render Optimization Suggestions Panel (Requirements 3, 4, 5 & 6)
   */
  function renderTimetableSuggestions() {
    if (!elements.ttSuggestionsList) return;

    const suggestions = SCEO_DATA.timetable.suggestions || [];

    // Filter suggestions matching building and day filters
    const filteredSuggestions = suggestions.filter(sug => {
      const matchDay = (state.timetableDay === 'all' || sug.day === state.timetableDay);
      const matchBuilding = (state.timetableBuildingFilter === 'all' || sug.buildingId === 'all' || sug.buildingId === state.timetableBuildingFilter);
      return matchDay && matchBuilding;
    });

    // Filter out dismissed suggestions
    const visibleSuggestions = filteredSuggestions.filter(s => !state.dismissedSuggestions.has(s.id));

    // Update count badge
    if (elements.ttSuggestionsCountBadge) {
      elements.ttSuggestionsCountBadge.textContent = `${visibleSuggestions.length} Available`;
    }

    if (visibleSuggestions.length === 0) {
      elements.ttSuggestionsList.innerHTML = '';
      if (elements.ttSuggestionsEmptyState) elements.ttSuggestionsEmptyState.style.display = 'flex';
      return;
    } else {
      if (elements.ttSuggestionsEmptyState) elements.ttSuggestionsEmptyState.style.display = 'none';
    }

    let html = '';
    visibleSuggestions.forEach(sug => {
      const isAccepted = state.acceptedSuggestions.has(sug.id);
      const confClass = sug.confidence.toLowerCase() === 'high' ? 'high' : 'medium';

      html += `
        <div class="suggestion-card ${isAccepted ? 'accepted' : ''}" data-sug-id="${sug.id}">
          <div class="suggestion-card-header">
            <span class="sug-type-tag">${sug.type}</span>
            <span class="sug-confidence-pill ${confClass}" title="${sug.confidenceReason}">${sug.confidence} Confidence</span>
          </div>

          <h4 class="sug-title">${sug.title}</h4>

          <div class="sug-route-row">
            <span class="route-room" title="Current room">${sug.currentRoomId}</span>
            <span class="route-arrow">&rarr;</span>
            <span class="route-room" title="Proposed room">${sug.proposedRoomId}</span>
            <span class="sug-savings-badge" title="Estimated avoidable electricity">&#9889; ${sug.potentialEnergyKWh} kWh avoided</span>
          </div>

          <p class="sug-reason-text">${sug.reason}</p>

          <div class="sug-admin-constraint" title="Administrator verification requirement">
            <strong>Review Caveat:</strong> ${sug.adminConstraints[0]}
          </div>

          <div class="sug-actions-row">
            ${isAccepted ? `
              <div class="sug-accepted-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Accepted for Demo</span>
              </div>
              <button type="button" class="btn-sug-action btn-sug-undo" data-action="undo" data-sug-id="${sug.id}" title="Revert this simulation change">Undo</button>
              <button type="button" class="btn-sug-action btn-sug-details" data-action="details" data-sug-id="${sug.id}">Details</button>
            ` : `
              <button type="button" class="btn-sug-action btn-sug-dismiss" data-action="dismiss" data-sug-id="${sug.id}" title="Dismiss suggestion from active view">Dismiss</button>
              <button type="button" class="btn-sug-action btn-sug-details" data-action="details" data-sug-id="${sug.id}">View Details</button>
              <button type="button" class="btn-sug-action btn-sug-accept" data-action="accept" data-sug-id="${sug.id}" title="Test this room change in the prototype">Accept for Demo</button>
            `}
          </div>
        </div>
      `;
    });

    elements.ttSuggestionsList.innerHTML = html;

    // Attach card action button listeners
    elements.ttSuggestionsList.querySelectorAll('.btn-sug-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const sugId = btn.dataset.sugId;

        if (action === 'details') {
          openSuggestionModal(sugId);
        } else if (action === 'accept') {
          acceptSuggestion(sugId);
        } else if (action === 'dismiss') {
          dismissSuggestion(sugId);
        } else if (action === 'undo') {
          undoSuggestion(sugId);
        }
      });
    });
  }

  /**
   * Open Suggestion Detail Modal (Requirement 5)
   */
  function openSuggestionModal(sugId) {
    const sug = SCEO_DATA.timetable.suggestions?.find(s => s.id === sugId);
    if (!sug || !elements.suggestionDetailModal) return;

    state.activeSuggestionInModal = sug;

    // Set Header
    if (elements.sugModalCategory) elements.sugModalCategory.textContent = sug.type;
    if (elements.sugModalTitle) elements.sugModalTitle.textContent = sug.title;

    // Set Metrics
    if (elements.sugModalEnergyVal) elements.sugModalEnergyVal.textContent = `${sug.potentialEnergyKWh} kWh`;
    if (elements.sugModalCostVal) elements.sugModalCostVal.textContent = `$${sug.estimatedCostSavings.toFixed(2)} / session avoided`;
    if (elements.sugModalConfidence) elements.sugModalConfidence.textContent = `${sug.confidence} Confidence`;
    if (elements.sugModalTime) elements.sugModalTime.textContent = `${SCEO_DATA.timetable.dayLabels[sug.day] || sug.day} ${sug.timeRange}`;
    if (elements.sugModalDuration) elements.sugModalDuration.textContent = `${sug.avoidableHours} operating hours avoidable`;

    // Populate Comparison Table
    if (elements.sugModalComparisonTbody) {
      const capMargin = sug.proposedCapacity - sug.enrolled;
      const powerDelta = Number((sug.currentPowerKW - sug.proposedPowerKW).toFixed(1));

      elements.sugModalComparisonTbody.innerHTML = `
        <tr>
          <td><strong>Classroom</strong></td>
          <td>${sug.currentRoomId}</td>
          <td>${sug.proposedRoomId}</td>
          <td><span class="text-success font-semibold">Relocated</span></td>
        </tr>
        <tr>
          <td><strong>Room Type</strong></td>
          <td>${sug.currentRoomType}</td>
          <td>${sug.proposedRoomType}</td>
          <td>Compatible layout</td>
        </tr>
        <tr>
          <td><strong>Physical Capacity</strong></td>
          <td>${sug.currentCapacity} seats</td>
          <td>${sug.proposedCapacity} seats</td>
          <td>${capMargin >= 0 ? `+${capMargin} seat buffer` : '<span class="text-danger">Exceeded</span>'}</td>
        </tr>
        <tr>
          <td><strong>Cohort Enrollment</strong></td>
          <td>${sug.enrolled} students</td>
          <td>${sug.enrolled} students</td>
          <td>100% accommodated</td>
        </tr>
        <tr>
          <td><strong>Operating Power Draw</strong></td>
          <td>${sug.currentPowerKW} kW</td>
          <td>${sug.proposedPowerKW} kW</td>
          <td><span class="text-success font-semibold">-${powerDelta > 0 ? powerDelta : 0} kW lower load</span></td>
        </tr>
      `;
    }

    // Set Formula & Calculations
    if (elements.sugModalFormulaText) elements.sugModalFormulaText.textContent = sug.calculationFormula;
    if (elements.sugModalReasonText) elements.sugModalReasonText.textContent = sug.reason;
    if (elements.sugModalConfidenceReason) elements.sugModalConfidenceReason.textContent = sug.confidenceReason;

    // Populate Review Constraints List
    if (elements.sugModalConstraintsList) {
      elements.sugModalConstraintsList.innerHTML = sug.adminConstraints.map(c => `<li>${c}</li>`).join('');
    }

    // Modal Action Buttons
    const isAccepted = state.acceptedSuggestions.has(sug.id);
    if (elements.btnSugModalAccept) {
      elements.btnSugModalAccept.textContent = isAccepted ? 'Revert Suggestion' : 'Accept for Demo';
    }

    elements.suggestionDetailModal.classList.add('active');
  }

  function closeSuggestionModal() {
    if (elements.suggestionDetailModal) {
      elements.suggestionDetailModal.classList.remove('active');
    }
    state.activeSuggestionInModal = null;
  }

  /**
   * Open Class Detail Modal (Requirement 2 & 8)
   */
  function openClassModal(classId) {
    const classes = getEffectiveTimetableClasses();
    const cls = classes.find(c => c.id === classId);
    if (!cls || !elements.classDetailModal) return;

    state.activeClassInModal = cls;

    const room = SCEO_DATA.classrooms.find(r => r.id === cls.roomId) || {};
    const buildingObj = SCEO_DATA.buildings.find(b => b.id === cls.buildingId) || {};
    const occPct = room.capacity > 0 ? Math.round((cls.enrolled / room.capacity) * 100) : 0;

    if (elements.classModalDept) elements.classModalDept.textContent = cls.department;
    if (elements.classModalTitle) elements.classModalTitle.textContent = `${cls.courseCode}: ${cls.courseName}`;
    if (elements.classModalPowerKW) elements.classModalPowerKW.textContent = `${cls.powerKW} kW`;
    if (elements.classModalEnergyKWh) elements.classModalEnergyKWh.textContent = `${cls.sessionKWh} kWh / session`;
    if (elements.classModalEnrollment) elements.classModalEnrollment.textContent = `${cls.enrolled} / ${room.capacity || 'N/A'}`;
    if (elements.classModalOccupancyPercent) elements.classModalOccupancyPercent.textContent = `${occPct}% room utilization`;
    if (elements.classModalSlot) elements.classModalSlot.textContent = `${cls.startTime} - ${cls.endTime} (${cls.durationHours}h)`;
    if (elements.classModalDay) elements.classModalDay.textContent = SCEO_DATA.timetable.dayLabels[cls.day] || cls.day;
    if (elements.classModalRoomId) elements.classModalRoomId.textContent = cls.roomId;
    if (elements.classModalRoomType) elements.classModalRoomType.textContent = room.type || cls.roomTypeNeeded;
    if (elements.classModalBuilding) elements.classModalBuilding.textContent = buildingObj.name || cls.buildingId;
    if (elements.classModalInstructor) elements.classModalInstructor.textContent = cls.instructor;

    // Equipment tags
    if (elements.classModalEquipment) {
      if (cls.equipmentNeeded && cls.equipmentNeeded.length) {
        elements.classModalEquipment.innerHTML = cls.equipmentNeeded.map(eq => `<span class="equipment-pill">${eq}</span>`).join('');
      } else {
        elements.classModalEquipment.innerHTML = `<span class="equipment-pill">Standard Audio/Visual</span>`;
      }
    }

    // Consolidation Alert
    if (elements.classModalConsolidationNotice) {
      if (cls.isRelocated) {
        elements.classModalConsolidationNotice.style.display = 'block';
        if (elements.classModalConsolidationText) {
          elements.classModalConsolidationText.textContent = `Demo Accepted: Relocated from ${cls.relocatedFrom} into ${cls.roomId} to reduce HVAC loads.`;
        }
      } else if (cls.isConsolidatable) {
        elements.classModalConsolidationNotice.style.display = 'block';
        if (elements.classModalConsolidationText) {
          elements.classModalConsolidationText.textContent = `Identified for potential energy-saving consolidation in the suggestions panel.`;
        }
      } else {
        elements.classModalConsolidationNotice.style.display = 'none';
      }
    }

    elements.classDetailModal.classList.add('active');
  }

  function closeClassModal() {
    if (elements.classDetailModal) {
      elements.classDetailModal.classList.remove('active');
    }
    state.activeClassInModal = null;
  }

  /**
   * Action: Accept Suggestion for Demo (Requirement 5)
   */
  function acceptSuggestion(sugId) {
    const sug = SCEO_DATA.timetable.suggestions?.find(s => s.id === sugId);
    if (!sug) return;

    if (state.acceptedSuggestions.has(sugId)) {
      // Revert if already accepted
      state.acceptedSuggestions.delete(sugId);
      saveStoredSet(TT_STORAGE_KEYS.ACCEPTED, state.acceptedSuggestions);
      renderTimetableOptimizer();
      showToast(`Reverted suggestion: ${sug.title}`, 'info');
    } else {
      state.acceptedSuggestions.add(sugId);
      state.dismissedSuggestions.delete(sugId);
      saveStoredSet(TT_STORAGE_KEYS.ACCEPTED, state.acceptedSuggestions);
      saveStoredSet(TT_STORAGE_KEYS.DISMISSED, state.dismissedSuggestions);
      renderTimetableOptimizer();
      showToast(`Demo only: Rescheduled class into ${sug.proposedRoomId}. No real timetable changed.`, 'success');
    }

    if (elements.suggestionDetailModal?.classList.contains('active')) {
      closeSuggestionModal();
    }
  }

  /**
   * Action: Dismiss Suggestion (Requirement 5)
   */
  function dismissSuggestion(sugId) {
    state.dismissedSuggestions.add(sugId);
    state.acceptedSuggestions.delete(sugId);
    saveStoredSet(TT_STORAGE_KEYS.DISMISSED, state.dismissedSuggestions);
    saveStoredSet(TT_STORAGE_KEYS.ACCEPTED, state.acceptedSuggestions);
    renderTimetableOptimizer();
    showToast('Suggestion dismissed from active panel', 'info');

    if (elements.suggestionDetailModal?.classList.contains('active')) {
      closeSuggestionModal();
    }
  }

  /**
   * Action: Undo Suggestion (Requirement 5)
   */
  function undoSuggestion(sugId) {
    state.acceptedSuggestions.delete(sugId);
    state.dismissedSuggestions.delete(sugId);
    saveStoredSet(TT_STORAGE_KEYS.ACCEPTED, state.acceptedSuggestions);
    saveStoredSet(TT_STORAGE_KEYS.DISMISSED, state.dismissedSuggestions);
    renderTimetableOptimizer();
    showToast('Suggestion restored to original state', 'info');
  }

  /**
   * Reset All Timetable Prototype Demo States
   */
  function resetTimetableDemo() {
    state.acceptedSuggestions.clear();
    state.dismissedSuggestions.clear();
    state.simulatedConflictActive = false;
    saveStoredSet(TT_STORAGE_KEYS.ACCEPTED, state.acceptedSuggestions);
    saveStoredSet(TT_STORAGE_KEYS.DISMISSED, state.dismissedSuggestions);

    if (elements.btnTtToggleConflictText) elements.btnTtToggleConflictText.textContent = 'Simulate Sample Conflict';
    elements.btnTtToggleConflict?.classList.remove('active');

    renderTimetableOptimizer();
    showToast('Demo state reset: All schedules and suggestions restored to baseline.', 'info');
  }

  /**
   * Cross-Module Navigation: Locate Room in Analytics (Requirement 8)
   */
  function navigateToRoomAnalytics(roomId) {
    state.selectedClassroom = roomId;
    const room = SCEO_DATA.classrooms.find(r => r.id === roomId);
    if (room) {
      state.classroomBuildingFilter = room.buildingId;
    }
    switchView('classroom-analytics');
    showToast(`Switched to Classroom Analytics for ${roomId}`, 'info');
  }

  /**
   * Cross-Module Navigation: Locate Room in Heatmap (Requirement 8)
   */
  function navigateToRoomHeatmap(roomId) {
    const room = SCEO_DATA.classrooms.find(r => r.id === roomId);
    if (room) {
      state.selectedBuilding = room.buildingId;
    }
    switchView('energy-heatmap');
    locateRoomInHeatmap(roomId);
  }

  /* ==========================================================================
   * STEP 5: ALERTS & ACTIONS CONTROLLER & INTERACTIONS
   * ========================================================================== */

  /**
   * Get All Base and Dynamic Alerts merged with User Status Overrides
   */
  function getAllAlerts() {
    const baseAlerts = SCEO_DATA.alertsModule?.alerts || [];
    const dynamicAlerts = state.generatedDynamicAlerts || [];
    const combined = [...baseAlerts, ...dynamicAlerts];

    return combined.map(alert => {
      const persistedStatus = state.alertStatuses[alert.id];
      return {
        ...alert,
        status: persistedStatus || alert.status
      };
    });
  }

  /**
   * Get Alerts filtered by Building, Severity, Status, Recency, and Search
   */
  function getFilteredAlerts() {
    const allAlerts = getAllAlerts();

    return allAlerts.filter(alert => {
      // 1. Building filter
      if (state.alertBuildingFilter !== 'all' && alert.buildingId !== state.alertBuildingFilter) {
        return false;
      }

      // 2. Severity filter
      if (state.alertSeverityFilter !== 'all' && alert.severity !== state.alertSeverityFilter) {
        return false;
      }

      // 3. Status filter
      if (state.alertStatusFilter !== 'all' && alert.status !== state.alertStatusFilter) {
        return false;
      }

      // 4. Date / Recency filter
      if (state.alertDateFilter !== 'all' && alert.dateCategory !== state.alertDateFilter) {
        return false;
      }

      // 5. Search query
      if (state.alertSearchQuery) {
        const q = state.alertSearchQuery.toLowerCase().trim();
        const matchTitle = (alert.title || '').toLowerCase().includes(q);
        const matchId = (alert.id || '').toLowerCase().includes(q);
        const matchRoom = (alert.roomId || '').toLowerCase().includes(q);
        const matchBuilding = (alert.buildingName || '').toLowerCase().includes(q);
        const matchReason = (alert.reason || '').toLowerCase().includes(q);
        const matchRule = (alert.ruleTriggered || '').toLowerCase().includes(q);
        const matchCat = (alert.category || '').toLowerCase().includes(q);

        if (!matchTitle && !matchId && !matchRoom && !matchBuilding && !matchReason && !matchRule && !matchCat) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Dynamically Calculate and Render Summary KPI Cards (Requirement 1)
   */
  function renderAlertsKPIs() {
    const allAlerts = getAllAlerts();

    // Baseline scoped alerts respect building, date, and search filter
    const scopedAlerts = allAlerts.filter(alert => {
      if (state.alertBuildingFilter !== 'all' && alert.buildingId !== state.alertBuildingFilter) return false;
      if (state.alertDateFilter !== 'all' && alert.dateCategory !== state.alertDateFilter) return false;
      if (state.alertSearchQuery) {
        const q = state.alertSearchQuery.toLowerCase().trim();
        const match = (alert.title || '').toLowerCase().includes(q) ||
                      (alert.id || '').toLowerCase().includes(q) ||
                      (alert.roomId || '').toLowerCase().includes(q) ||
                      (alert.buildingName || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    const totalActive = scopedAlerts.filter(a => a.status !== 'resolved').length;
    const criticalHigh = scopedAlerts.filter(a => (a.severity === 'critical' || a.severity === 'high') && a.status !== 'resolved').length;
    const awaitingAction = scopedAlerts.filter(a => a.status === 'new').length;
    const resolved = scopedAlerts.filter(a => a.status === 'resolved').length;

    // 1. Total Active Alerts
    if (elements.kpiTotalActiveAlerts) elements.kpiTotalActiveAlerts.textContent = totalActive;
    if (elements.kpiTotalActiveAlertsSub) {
      elements.kpiTotalActiveAlertsSub.textContent = `${totalActive} of ${scopedAlerts.length} total alerts in scope`;
    }

    // 2. Critical & High-Priority Alerts
    if (elements.kpiCriticalHighAlerts) elements.kpiCriticalHighAlerts.textContent = criticalHigh;
    if (elements.kpiCriticalHighAlertsSub) {
      elements.kpiCriticalHighAlertsSub.textContent = criticalHigh > 0
        ? `${criticalHigh} require prompt administrator triage`
        : 'Zero critical or high anomalies in scope';
    }

    // 3. Alerts Awaiting Action
    if (elements.kpiAwaitingActionAlerts) elements.kpiAwaitingActionAlerts.textContent = awaitingAction;
    if (elements.kpiAwaitingActionAlertsSub) {
      elements.kpiAwaitingActionAlertsSub.textContent = `${awaitingAction} new alert${awaitingAction === 1 ? '' : 's'} pending review`;
    }

    // 4. Resolved Alerts
    if (elements.kpiResolvedAlerts) elements.kpiResolvedAlerts.textContent = resolved;
    if (elements.kpiResolvedAlertsSub) {
      elements.kpiResolvedAlertsSub.textContent = `${resolved} marked addressed this period`;
    }
  }

  /**
   * Render Alerts Stream: Card View vs Table View (Requirement 1, 2, 5)
   */
  function renderAlertsStream() {
    if (!elements.alertsStreamContainer) return;

    const filteredAlerts = getFilteredAlerts();

    // Update count badge
    if (elements.alertsCountBadge) {
      elements.alertsCountBadge.textContent = `${filteredAlerts.length} Alert${filteredAlerts.length === 1 ? '' : 's'}`;
    }

    // Handle empty state
    if (filteredAlerts.length === 0) {
      elements.alertsStreamContainer.style.display = 'none';
      if (elements.alertsEmptyState) elements.alertsEmptyState.style.display = 'block';
      return;
    }

    elements.alertsStreamContainer.style.display = 'block';
    if (elements.alertsEmptyState) elements.alertsEmptyState.style.display = 'none';

    if (state.alertViewMode === 'table') {
      renderAlertsTableView(filteredAlerts);
    } else {
      renderAlertsCardView(filteredAlerts);
    }
  }

  /**
   * Render Detailed Card View for Alerts
   */
  function renderAlertsCardView(alerts) {
    elements.alertsStreamContainer.innerHTML = '';
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'alerts-cards-list';

    alerts.forEach(alert => {
      const card = document.createElement('article');
      card.className = `alert-card border-${alert.severity}`;
      card.setAttribute('data-alert-id', alert.id);

      const statusLabel = alert.status === 'new' 
        ? 'New (Unreviewed)' 
        : (alert.status === 'acknowledged' ? 'Acknowledged' : 'Resolved');

      const severityLabel = alert.severityLabel || (alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1));

      // Telemetry Section
      let telemetryHtml = '';
      if (alert.isDataQuality || !alert.readingsAvailable) {
        telemetryHtml = `
          <div class="alert-data-quality-inline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <strong>Data Quality Notice:</strong>
              <span>Sub-meter offline &bull; Telemetry communication loss. Observability issue, not proof of energy waste.</span>
            </div>
          </div>
        `;
      } else {
        telemetryHtml = `
          <div class="alert-metrics-strip">
            <div class="metric-mini-item">
              <span class="m-mini-label">Active Demand</span>
              <span class="m-mini-val text-danger">${escapeHTML(alert.currentDraw)}</span>
            </div>
            <div class="metric-mini-item">
              <span class="m-mini-label">Standby Baseline</span>
              <span class="m-mini-val">${escapeHTML(alert.baselineStandby)}</span>
            </div>
            <div class="metric-mini-item">
              <span class="m-mini-label">Avoidable Waste</span>
              <span class="m-mini-val text-success">${alert.potentialWasteKWh} kWh <small>(~$${Number(alert.potentialSavingsCost).toFixed(2)})</small></span>
            </div>
          </div>
        `;
      }

      // Action Buttons
      let actionButtonsHtml = '';
      if (alert.status === 'new') {
        actionButtonsHtml = `
          <button type="button" class="btn-secondary btn-sm btn-ack-alert" data-alert-id="${alert.id}">Acknowledge</button>
          <button type="button" class="btn-primary btn-sm btn-resolve-alert" data-alert-id="${alert.id}">Resolve</button>
        `;
      } else if (alert.status === 'acknowledged') {
        actionButtonsHtml = `
          <button type="button" class="btn-primary btn-sm btn-resolve-alert" data-alert-id="${alert.id}">Resolve</button>
        `;
      } else {
        actionButtonsHtml = `
          <button type="button" class="btn-secondary btn-sm btn-reopen-alert" data-alert-id="${alert.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right: 3px; vertical-align: -1px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Reopen Alert
          </button>
        `;
      }

      card.innerHTML = `
        <div class="alert-card-header">
          <div class="alert-card-meta-row">
            <div class="alert-meta-left">
              <span class="alert-id-badge">${escapeHTML(alert.id)}</span>
              <span class="severity-pill ${alert.severity}">${escapeHTML(severityLabel)}</span>
              <span class="alert-category-tag">${escapeHTML(alert.category)}</span>
            </div>
            <div class="alert-meta-right">
              <span class="alert-timestamp">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${escapeHTML(alert.timestamp)}
              </span>
              <span class="status-pill ${alert.status}">${escapeHTML(statusLabel)}</span>
            </div>
          </div>
          <h4 class="alert-card-title">${escapeHTML(alert.title)}</h4>
          <div class="alert-location-strip">
            <button type="button" class="room-id-tag btn-route-analytics" data-room-id="${alert.roomId}" title="Examine classroom analytics for ${alert.roomId}">
              ${escapeHTML(alert.roomId)}
            </button>
            <span class="building-tag">${escapeHTML(alert.buildingName)}</span>
          </div>
        </div>

        <div class="alert-card-body">
          <p class="alert-reason-text">${escapeHTML(alert.reason)}</p>
          ${telemetryHtml}
          <div class="alert-rule-snippet">
            <span class="rule-label">Automated Trigger:</span>
            <code>${escapeHTML(alert.ruleTriggered)}</code>
          </div>
        </div>

        <div class="alert-card-footer">
          <div class="alert-nav-shortcuts">
            <button type="button" class="btn-link-subtle btn-route-heatmap" data-room-id="${alert.roomId}" title="Locate in Energy Waste Heatmap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              <span>Heatmap</span>
            </button>
            <button type="button" class="btn-link-subtle btn-route-analytics" data-room-id="${alert.roomId}" title="View Classroom Analytics">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10M6 10h10M6 14h6"></path></svg>
              <span>Analytics</span>
            </button>
          </div>
          <div class="alert-action-group">
            <button type="button" class="btn-secondary btn-sm btn-open-alert-modal" data-alert-id="${alert.id}">Inspect Details</button>
            ${actionButtonsHtml}
          </div>
        </div>
      `;

      cardsWrapper.appendChild(card);
    });

    elements.alertsStreamContainer.appendChild(cardsWrapper);
  }

  /**
   * Render Compact Table View for Alerts
   */
  function renderAlertsTableView(alerts) {
    elements.alertsStreamContainer.innerHTML = '';
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'alerts-table-wrapper';

    let tbodyRows = '';
    alerts.forEach(alert => {
      const statusLabel = alert.status === 'new' 
        ? 'New' 
        : (alert.status === 'acknowledged' ? 'Acknowledged' : 'Resolved');
      const severityLabel = alert.severityLabel || (alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1));

      const impactDisplay = alert.isDataQuality || !alert.readingsAvailable
        ? `<span class="text-muted" style="font-size: 11px;">Telemetry Lost</span>`
        : `<span class="text-success" style="font-weight: 600;">${alert.potentialWasteKWh} kWh</span> <span class="text-muted" style="font-size: 11px;">(~$${Number(alert.potentialSavingsCost).toFixed(2)})</span>`;

      let actionBtn = '';
      if (alert.status === 'new') {
        actionBtn = `
          <button type="button" class="btn-secondary btn-xs btn-ack-alert" data-alert-id="${alert.id}" title="Acknowledge alert">Ack</button>
          <button type="button" class="btn-primary btn-xs btn-resolve-alert" data-alert-id="${alert.id}" title="Resolve alert">Resolve</button>
        `;
      } else if (alert.status === 'acknowledged') {
        actionBtn = `
          <button type="button" class="btn-primary btn-xs btn-resolve-alert" data-alert-id="${alert.id}" title="Resolve alert">Resolve</button>
        `;
      } else {
        actionBtn = `
          <button type="button" class="btn-secondary btn-xs btn-reopen-alert" data-alert-id="${alert.id}" title="Reopen alert">Reopen</button>
        `;
      }

      tbodyRows += `
        <tr data-alert-id="${alert.id}">
          <td>
            <button type="button" class="table-id-link btn-open-alert-modal" data-alert-id="${alert.id}">${escapeHTML(alert.id)}</button>
          </td>
          <td>
            <span class="severity-pill ${alert.severity}">${escapeHTML(severityLabel)}</span>
          </td>
          <td>
            <div class="table-alert-title-cell">
              <span class="table-alert-title btn-open-alert-modal" data-alert-id="${alert.id}" style="cursor: pointer; font-weight: 600;">${escapeHTML(alert.title)}</span>
              <span class="table-alert-category">${escapeHTML(alert.category)} &bull; ${escapeHTML(alert.timestamp)}</span>
            </div>
          </td>
          <td>
            <button type="button" class="room-id-tag btn-route-analytics" data-room-id="${alert.roomId}">${escapeHTML(alert.roomId)}</button>
            <span class="building-tag" style="font-size: 10px; margin-left: 4px;">${escapeHTML(alert.buildingName)}</span>
          </td>
          <td>
            ${impactDisplay}
          </td>
          <td>
            <span class="status-pill ${alert.status}">${escapeHTML(statusLabel)}</span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button type="button" class="btn-secondary btn-xs btn-open-alert-modal" data-alert-id="${alert.id}">Details</button>
            ${actionBtn}
          </td>
        </tr>
      `;
    });

    tableWrapper.innerHTML = `
      <table class="alerts-table" aria-label="Alerts and Anomaly Events Table">
        <thead>
          <tr>
            <th scope="col" style="width: 80px;">ID</th>
            <th scope="col" style="width: 90px;">Severity</th>
            <th scope="col">Anomaly &amp; Issue Summary</th>
            <th scope="col" style="width: 140px;">Location</th>
            <th scope="col" style="width: 130px;">Impact</th>
            <th scope="col" style="width: 110px;">Status</th>
            <th scope="col" style="width: 150px; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tbodyRows}
        </tbody>
      </table>
    `;

    elements.alertsStreamContainer.appendChild(tableWrapper);
  }

  /**
   * Render Prioritized Recommended Actions Panel (Requirement 6)
   */
  function renderRecommendedActions() {
    if (!elements.recActionsList) return;

    const actions = SCEO_DATA.alertsModule?.recommendedActions || [];
    
    // Filter by building if applicable
    const scopedActions = actions.filter(act => {
      if (state.alertBuildingFilter !== 'all' && act.buildingId !== state.alertBuildingFilter) {
        return false;
      }
      return true;
    });

    if (elements.recActionsCountBadge) {
      elements.recActionsCountBadge.textContent = `${scopedActions.length} Action${scopedActions.length === 1 ? '' : 's'}`;
    }

    elements.recActionsList.innerHTML = '';

    if (scopedActions.length === 0) {
      elements.recActionsList.innerHTML = `
        <div class="empty-state-card" style="padding: 24px 16px; text-align: center;">
          <p class="text-muted" style="font-size: 13px;">No recommended actions for the selected building filter.</p>
        </div>
      `;
      return;
    }

    scopedActions.forEach(action => {
      const card = document.createElement('div');
      card.className = `rec-action-card priority-${action.priority}`;
      card.setAttribute('data-action-id', action.id);

      card.innerHTML = `
        <div class="rec-action-top-row">
          <span class="severity-pill ${action.priority}">${escapeHTML(action.priorityLabel)}</span>
          <span class="rec-action-category-label">${escapeHTML(action.category)}</span>
        </div>
        <h4 class="rec-action-heading">${escapeHTML(action.title)}</h4>
        <div class="rec-action-location">
          <button type="button" class="room-id-tag btn-route-analytics" data-room-id="${action.roomId}" title="View Analytics for ${action.roomId}">
            ${escapeHTML(action.roomId)}
          </button>
          <span class="building-tag">${escapeHTML(action.buildingName)}</span>
        </div>
        <p class="rec-action-reason-text">${escapeHTML(action.reason)}</p>
        <div class="rec-action-benefit-box">
          <div class="benefit-badge">Expected Benefit (Estimated):</div>
          <p class="benefit-description">${escapeHTML(action.expectedBenefit)}</p>
        </div>
        <div class="rec-action-footer-buttons">
          <button type="button" class="btn-secondary btn-sm btn-open-related-alert" data-alert-id="${action.relatedAlertId}" title="Inspect triggering alert">
            View Related Alert (${escapeHTML(action.relatedAlertId)})
          </button>
          <button type="button" class="btn-link-action btn-route-analytics" data-room-id="${action.roomId}">
            Room Analytics &rarr;
          </button>
        </div>
      `;

      elements.recActionsList.appendChild(card);
    });
  }

  /**
   * Main Coordinator: Render Alerts & Actions View
   */
  function renderAlertsAndActions() {
    renderAlertsKPIs();
    renderAlertsStream();
    renderRecommendedActions();
  }

  /**
   * Alert Management: Acknowledge (Requirement 5)
   */
  function acknowledgeAlert(alertId) {
    state.alertStatuses[alertId] = 'acknowledged';
    saveStoredObject(ALERT_STORAGE_KEYS.STATUSES, state.alertStatuses);
    renderAlertsAndActions();

    if (state.activeAlertInModal && state.activeAlertInModal.id === alertId) {
      openAlertModal(alertId);
    }

    showToast(`Alert ${alertId} marked as Acknowledged.`, 'info');
  }

  /**
   * Alert Management: Resolve (Requirement 5)
   */
  function resolveAlert(alertId) {
    state.alertStatuses[alertId] = 'resolved';
    saveStoredObject(ALERT_STORAGE_KEYS.STATUSES, state.alertStatuses);
    renderAlertsAndActions();

    if (state.activeAlertInModal && state.activeAlertInModal.id === alertId) {
      openAlertModal(alertId);
    }

    showToast(`Alert ${alertId} marked as Resolved.`, 'success');
  }

  /**
   * Alert Management: Reopen (Requirement 5)
   */
  function reopenAlert(alertId) {
    state.alertStatuses[alertId] = 'new';
    saveStoredObject(ALERT_STORAGE_KEYS.STATUSES, state.alertStatuses);
    renderAlertsAndActions();

    if (state.activeAlertInModal && state.activeAlertInModal.id === alertId) {
      openAlertModal(alertId);
    }

    showToast(`Alert ${alertId} reopened and returned to active queue.`, 'info');
  }

  /**
   * Open Alert Detail Modal (Requirement 4)
   */
  function openAlertModal(alertId) {
    const alerts = getAllAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    state.activeAlertInModal = alert;

    if (elements.alertModalCategory) elements.alertModalCategory.textContent = alert.category;
    if (elements.alertModalTitle) elements.alertModalTitle.textContent = alert.title;
    if (elements.alertModalId) elements.alertModalId.textContent = `ID #${alert.id}`;
    if (elements.alertModalTimestamp) elements.alertModalTimestamp.textContent = alert.timestamp;

    // Severity pill
    if (elements.alertModalSeverity) {
      elements.alertModalSeverity.className = `severity-pill ${alert.severity}`;
      elements.alertModalSeverity.textContent = alert.severityLabel || (alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1));
    }

    // Status pill
    if (elements.alertModalStatus) {
      const statusLabel = alert.status === 'new' 
        ? 'New (Unreviewed)' 
        : (alert.status === 'acknowledged' ? 'Acknowledged' : 'Resolved');
      elements.alertModalStatus.className = `status-pill ${alert.status}`;
      elements.alertModalStatus.textContent = statusLabel;
    }

    // Measurements & Data Quality Handling (Requirement 2 & 4)
    if (alert.isDataQuality || !alert.readingsAvailable) {
      if (elements.alertModalDraw) elements.alertModalDraw.textContent = 'Telemetry Offline';
      if (elements.alertModalStandby) elements.alertModalStandby.textContent = 'Baseline: Unknown';
      if (elements.alertModalWaste) elements.alertModalWaste.textContent = 'N/A';
      if (elements.alertModalCost) elements.alertModalCost.textContent = 'Observability Gap';
      if (elements.alertModalDataQualityNotice) elements.alertModalDataQualityNotice.style.display = 'flex';
    } else {
      if (elements.alertModalDraw) elements.alertModalDraw.textContent = alert.currentDraw;
      if (elements.alertModalStandby) elements.alertModalStandby.textContent = `Baseline: ${alert.baselineStandby}`;
      if (elements.alertModalWaste) elements.alertModalWaste.textContent = `${alert.potentialWasteKWh} kWh`;
      if (elements.alertModalCost) elements.alertModalCost.textContent = `~$${Number(alert.potentialSavingsCost).toFixed(2)} avoidable`;
      if (elements.alertModalDataQualityNotice) elements.alertModalDataQualityNotice.style.display = 'none';
    }

    // Location
    if (elements.alertModalRoom) elements.alertModalRoom.textContent = alert.roomId;
    if (elements.alertModalBuilding) elements.alertModalBuilding.textContent = alert.buildingName;

    const matchedRoom = SCEO_DATA.classrooms?.find(r => r.id === alert.roomId);
    if (elements.alertModalRoomType) {
      elements.alertModalRoomType.textContent = matchedRoom ? matchedRoom.type : 'Monitored Facility';
    }

    // Context & Rule Triggered
    if (elements.alertModalDetails) elements.alertModalDetails.textContent = alert.reason;
    if (elements.alertModalRuleTriggered) elements.alertModalRuleTriggered.textContent = alert.ruleTriggered;
    if (elements.alertModalAction) elements.alertModalAction.textContent = alert.recommendedAction;

    // Configure Modal Action Buttons
    if (elements.btnAlertModalAck && elements.btnAlertModalResolve) {
      if (alert.status === 'new') {
        elements.btnAlertModalAck.style.display = 'inline-flex';
        elements.btnAlertModalAck.textContent = 'Acknowledge';
        elements.btnAlertModalResolve.style.display = 'inline-flex';
        elements.btnAlertModalResolve.textContent = 'Resolve Alert';
      } else if (alert.status === 'acknowledged') {
        elements.btnAlertModalAck.style.display = 'none';
        elements.btnAlertModalResolve.style.display = 'inline-flex';
        elements.btnAlertModalResolve.textContent = 'Resolve Alert';
      } else {
        elements.btnAlertModalAck.style.display = 'none';
        elements.btnAlertModalResolve.style.display = 'inline-flex';
        elements.btnAlertModalResolve.textContent = 'Reopen Alert';
      }
    }

    if (elements.alertDetailModal) {
      elements.alertDetailModal.classList.add('active');
    }
  }

  /**
   * Close Alert Detail Modal
   */
  function closeAlertModal() {
    if (elements.alertDetailModal) {
      elements.alertDetailModal.classList.remove('active');
    }
    state.activeAlertInModal = null;
  }

  /**
   * Rule-Testing Control: Run Demo Alert Analysis (Requirement 7)
   */
  function runDemoAlertAnalysis() {
    const allAlerts = getAllAlerts();
    const dynamicExists = allAlerts.some(a => a.id === 'ALT-109');

    if (!dynamicExists) {
      // Create new simulated anomaly without duplicates
      const newSimulatedAlert = {
        id: "ALT-109",
        title: "Laboratory Autoclave Idle Heater Surge in SCI-301",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-301",
        category: "Equipment Standby",
        severity: "medium",
        severityLabel: "Medium",
        timestamp: "Just now (Rule Engine Scan)",
        dateCategory: "today",
        currentDraw: "3.4 kW",
        baselineStandby: "0.2 kW",
        reason: "Autoclave sterilizer steam pre-heat coil energized during unscheduled weekend interval. Sustained 3.4 kW draw with zero laboratory bookings.",
        ruleTriggered: "Standby Equipment Anomaly: Specialized thermal load active with no scheduled laboratory session (>1.5 kW threshold).",
        recommendedAction: "Instruct lab technician to isolate autoclave main disconnect switch or program automated 7-day timer relay.",
        status: "new",
        isDataQuality: false,
        potentialWasteKWh: 13.6,
        potentialSavingsCost: 2.45,
        readingsAvailable: true
      };

      state.generatedDynamicAlerts.push(newSimulatedAlert);
      saveStoredArray(ALERT_STORAGE_KEYS.DYNAMIC, state.generatedDynamicAlerts);
      renderAlertsAndActions();

      showToast('Demo Analysis Complete: 6 rule sets scanned 24 classrooms. 1 new anomaly identified in SCI-301. Existing alert statuses preserved.', 'success');
    } else {
      // Re-scan complete, no duplicates generated
      renderAlertsAndActions();
      const totalCount = getAllAlerts().length;
      showToast(`Demo Analysis Complete: 6 rule sets re-evaluated against 24 classrooms. 0 new anomalies detected (all ${totalCount} alerts up to date). No duplicate records generated.`, 'info');
    }
  }

  /**
   * Reset All Alert States to Baseline Demo Defaults
   */
  function resetAlertsDemo() {
    state.alertStatuses = {};
    state.generatedDynamicAlerts = [];

    try {
      localStorage.removeItem(ALERT_STORAGE_KEYS.STATUSES);
      localStorage.removeItem(ALERT_STORAGE_KEYS.DYNAMIC);
    } catch (e) {
      console.warn('localStorage clear error:', e);
    }

    renderAlertsAndActions();
    showToast('Demo state reset: All alert statuses and rule detections restored to baseline defaults.', 'info');
  }

  /* ==========================================================================
   * STEP 6: SMART CONTROLS SIMULATOR CONTROLLER & INTERACTIONS
   * ========================================================================== */

  /**
   * Initialize Smart Controls Data Model
   */
  function initSmartControlsData() {
    if (state.scRoomsData && state.scRoomsData.length > 0) return;

    // 1. Try to load persisted rooms
    const storedRooms = loadStoredArray(SC_STORAGE_KEYS.ROOMS);
    if (Array.isArray(storedRooms) && storedRooms.length === 24) {
      state.scRoomsData = storedRooms;
    } else {
      // Deep clone initial presets
      const rawInitial = SCEO_DATA.smartControlsModule?.initialRooms || [];
      state.scRoomsData = JSON.parse(JSON.stringify(rawInitial));
    }

    // 2. Try to load persisted logs
    const storedLogs = loadStoredArray(SC_STORAGE_KEYS.LOGS);
    if (Array.isArray(storedLogs) && storedLogs.length > 0) {
      state.scEventLogs = storedLogs;
    } else {
      const rawLogs = SCEO_DATA.smartControlsModule?.initialEventLogs || [];
      state.scEventLogs = JSON.parse(JSON.stringify(rawLogs));
    }

    // 3. Try to load persisted savings
    const storedSavings = loadStoredObject(SC_STORAGE_KEYS.SAVINGS);
    if (storedSavings && typeof storedSavings.realizedKWh === 'number') {
      state.scRealizedSavingsKWh = storedSavings.realizedKWh;
      state.scRealizedSavingsCost = storedSavings.realizedCost || (storedSavings.realizedKWh * 0.18);
    }

    // 4. Try to load persisted mode
    try {
      const storedMode = localStorage.getItem(SC_STORAGE_KEYS.MODE);
      if (storedMode === 'manual' || storedMode === 'automatic') {
        state.scSimMode = storedMode;
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
  }

  /**
   * Save Smart Controls State to LocalStorage
   */
  function saveSmartControlsState() {
    saveStoredArray(SC_STORAGE_KEYS.ROOMS, state.scRoomsData);
    saveStoredArray(SC_STORAGE_KEYS.LOGS, state.scEventLogs);
    saveStoredObject(SC_STORAGE_KEYS.SAVINGS, {
      realizedKWh: state.scRealizedSavingsKWh,
      realizedCost: state.scRealizedSavingsCost
    });
    try {
      localStorage.setItem(SC_STORAGE_KEYS.MODE, state.scSimMode);
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }

  /**
   * Populate Classroom Selector Dropdown
   */
  function populateSmartControlsRoomSelector() {
    if (!elements.scRoomSelect) return;

    const currentVal = state.scRoomFilter;
    elements.scRoomSelect.innerHTML = '<option value="all">All Classrooms (24 Rooms)</option>';

    const buildings = [
      { id: 'engineering', name: 'Engineering Building' },
      { id: 'science', name: 'Science Building' },
      { id: 'business', name: 'Business Building' }
    ];

    buildings.forEach(b => {
      const optGroup = document.createElement('optgroup');
      optGroup.label = b.name;

      const rooms = state.scRoomsData.filter(r => r.buildingId === b.id);
      rooms.forEach(room => {
        const opt = document.createElement('option');
        opt.value = room.roomId;
        opt.textContent = `${room.roomId} - ${room.roomName}`;
        optGroup.appendChild(opt);
      });

      elements.scRoomSelect.appendChild(optGroup);
    });

    elements.scRoomSelect.value = currentVal;
  }

  /**
   * Filter Classroom Cards by Building, Classroom, and Device States
   */
  function getFilteredSmartControlRooms() {
    return state.scRoomsData.filter(room => {
      // 1. Building Filter
      if (state.scBuildingFilter !== 'all' && room.buildingId !== state.scBuildingFilter) {
        return false;
      }

      // 2. Classroom Selector
      if (state.scRoomFilter !== 'all' && room.roomId !== state.scRoomFilter) {
        return false;
      }

      // 3. Device Status Filter
      if (state.scStatusFilter !== 'all') {
        if (state.scStatusFilter === 'on_only') {
          const hasOn = room.devices.some(d => d.state === 'on');
          if (!hasOn) return false;
        } else if (state.scStatusFilter === 'shutdown_recommended') {
          const hasRec = room.occupancyStatus === 'unoccupied' &&
            room.devices.some(d => d.state === 'on' && !d.manualOverride && !d.isEssential);
          if (!hasRec) return false;
        } else if (state.scStatusFilter === 'overridden_only') {
          const hasOvr = room.devices.some(d => d.manualOverride);
          if (!hasOvr) return false;
        } else if (state.scStatusFilter === 'essential_only') {
          const hasEss = room.devices.some(d => d.isEssential);
          if (!hasEss) return false;
        }
      }

      return true;
    });
  }

  /**
   * Render Smart Controls Summary KPI Cards (Requirement 1)
   */
  function renderSmartControlsKPIs() {
    const scopedRooms = state.scRoomsData.filter(r => {
      if (state.scBuildingFilter !== 'all' && r.buildingId !== state.scBuildingFilter) return false;
      return true;
    });

    const totalRooms = scopedRooms.length;
    const unoccupiedRooms = scopedRooms.filter(r => r.occupancyStatus === 'unoccupied').length;

    let devicesOn = 0;
    scopedRooms.forEach(r => {
      r.devices.forEach(d => {
        if (d.state === 'on') devicesOn++;
      });
    });

    // 1. Rooms Simulated
    if (elements.kpiScRoomsSimulated) elements.kpiScRoomsSimulated.textContent = totalRooms;
    if (elements.kpiScRoomsSimulatedSub) {
      elements.kpiScRoomsSimulatedSub.textContent = `${totalRooms} monitored campus spaces`;
    }

    // 2. Rooms Marked Unoccupied
    if (elements.kpiScRoomsUnoccupied) elements.kpiScRoomsUnoccupied.textContent = unoccupiedRooms;
    if (elements.kpiScRoomsUnoccupiedSub) {
      const pct = totalRooms > 0 ? Math.round((unoccupiedRooms / totalRooms) * 100) : 0;
      elements.kpiScRoomsUnoccupiedSub.textContent = `${pct}% of scope currently vacant`;
    }

    // 3. Simulated Devices On
    if (elements.kpiScDevicesOn) elements.kpiScDevicesOn.textContent = devicesOn;
    if (elements.kpiScDevicesOnSub) {
      elements.kpiScDevicesOnSub.textContent = `${devicesOn} active electrical load${devicesOn === 1 ? '' : 's'} in simulation`;
    }

    // 4. Estimated Energy Savings
    if (elements.kpiScEnergySavings) {
      elements.kpiScEnergySavings.textContent = state.scRealizedSavingsKWh.toFixed(1);
    }
    if (elements.kpiScEnergySavingsSub) {
      const cost = state.scRealizedSavingsKWh * 0.18;
      elements.kpiScEnergySavingsSub.textContent = `~$${cost.toFixed(2)} realized savings ($0.18/kWh)`;
    }
  }

  /**
   * Render Energy-Saving Estimator Panel (Requirement 7)
   */
  function renderSmartControlsEstimator() {
    // 1. Realized Savings
    const realizedKWh = state.scRealizedSavingsKWh;
    const realizedCost = realizedKWh * 0.18;
    const realizedCO2 = realizedKWh * 0.42;

    if (elements.scRealizedKWh) elements.scRealizedKWh.textContent = `${realizedKWh.toFixed(2)} kWh`;
    if (elements.scRealizedCost) elements.scRealizedCost.textContent = `~$${realizedCost.toFixed(2)} avoided cost`;
    if (elements.scRealizedCO2) elements.scRealizedCO2.textContent = `${realizedCO2.toFixed(2)} kg CO₂e offset`;

    // 2. Potential Avoidable Load: All active non-essential non-overridden devices in empty rooms
    let potentialLoadKW = 0;
    state.scRoomsData.forEach(r => {
      if (r.occupancyStatus === 'unoccupied') {
        r.devices.forEach(d => {
          if (d.state === 'on' && !d.manualOverride && !d.isEssential) {
            potentialLoadKW += d.powerKW;
          }
        });
      }
    });

    if (elements.scPotentialKWh) elements.scPotentialKWh.textContent = `${potentialLoadKW.toFixed(1)} kW`;
    if (elements.scPotentialCost) {
      const hourly = potentialLoadKW * 0.18;
      elements.scPotentialCost.textContent = `~$${hourly.toFixed(2)} / hr potential`;
    }
  }

  /**
   * Render Simulation Event Log Panel (Requirement 6)
   */
  function renderSmartControlsLog() {
    if (!elements.scEventLogFeed) return;

    if (elements.scEventLogCountBadge) {
      elements.scEventLogCountBadge.textContent = `${state.scEventLogs.length} Event${state.scEventLogs.length === 1 ? '' : 's'}`;
    }

    elements.scEventLogFeed.innerHTML = '';

    if (state.scEventLogs.length === 0) {
      elements.scEventLogFeed.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 13px;">
          No simulation events logged yet. Perform manual actions or run automatic simulation to generate events.
        </div>
      `;
      return;
    }

    state.scEventLogs.forEach(evt => {
      const item = document.createElement('div');
      item.className = 'sc-log-item';

      item.innerHTML = `
        <div class="sc-log-header">
          <div class="sc-log-tag-group">
            <span class="sc-log-tag ${escapeHTML(evt.tagClass || 'pill-teal')}">${escapeHTML(evt.tag || 'EVENT')}</span>
            ${evt.roomId && evt.roomId !== 'ALL' ? `<span class="room-id-tag" style="font-size: 10px; padding: 1px 6px;">${escapeHTML(evt.roomId)}</span>` : ''}
          </div>
          <span class="sc-log-time">${escapeHTML(evt.timestamp)}</span>
        </div>
        <p class="sc-log-message">${escapeHTML(evt.message)}</p>
      `;

      elements.scEventLogFeed.appendChild(item);
    });
  }

  /**
   * Helper: Add an Event to Simulation Event Log (Requirement 6)
   */
  function addSimulationLog(type, tag, tagClass, roomId, message) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // 'HH:MM:SS'

    const logEntry = {
      id: `EVT-${Date.now().toString().slice(-6)}`,
      timestamp: timeStr,
      type: type,
      tag: tag,
      tagClass: tagClass,
      roomId: roomId,
      message: message
    };

    state.scEventLogs.unshift(logEntry);

    // Keep log to max 60 entries to keep prototype lightweight
    if (state.scEventLogs.length > 60) {
      state.scEventLogs = state.scEventLogs.slice(0, 60);
    }

    saveSmartControlsState();
    renderSmartControlsLog();
  }

  /**
   * Render Classroom Device Cards Grid (Requirement 2 & 3)
   */
  function renderSmartControlsRooms() {
    if (!elements.scRoomsContainer) return;

    const filteredRooms = getFilteredSmartControlRooms();

    if (elements.scActiveRoomsBadge) {
      elements.scActiveRoomsBadge.textContent = `${filteredRooms.length} Classroom${filteredRooms.length === 1 ? '' : 's'}`;
    }

    if (filteredRooms.length === 0) {
      elements.scRoomsContainer.style.display = 'none';
      if (elements.scEmptyState) elements.scEmptyState.style.display = 'block';
      return;
    }

    elements.scRoomsContainer.style.display = 'grid';
    if (elements.scEmptyState) elements.scEmptyState.style.display = 'none';
    elements.scRoomsContainer.innerHTML = '';

    filteredRooms.forEach(room => {
      const isUnoccupied = room.occupancyStatus === 'unoccupied';
      
      // Calculate active power demand in this room
      let activeKW = 0;
      let activeCount = 0;
      let recommendedCount = 0;

      room.devices.forEach(dev => {
        if (dev.state === 'on') {
          activeKW += dev.powerKW;
          activeCount++;
          if (isUnoccupied && !dev.manualOverride && !dev.isEssential) {
            recommendedCount++;
          }
        }
      });

      const hasWasteWarning = isUnoccupied && recommendedCount > 0;

      const card = document.createElement('div');
      card.className = `sc-room-card ${hasWasteWarning ? 'has-waste-warning' : ''}`;
      card.setAttribute('data-room-id', room.roomId);

      // Warning Banner HTML
      let warningHtml = '';
      if (hasWasteWarning) {
        warningHtml = `
          <div class="sc-room-waste-alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div>
              <strong>Shutdown Recommended:</strong> Room unoccupied with ${recommendedCount} active device${recommendedCount === 1 ? '' : 's'} (${activeKW.toFixed(1)} kW load).
            </div>
          </div>
        `;
      }

      // Device Rows HTML
      let devicesHtml = '';
      room.devices.forEach(dev => {
        const isOn = dev.state === 'on';
        const isRec = isUnoccupied && isOn && !dev.manualOverride && !dev.isEssential;
        const countdownSec = state.scActiveCountdowns[dev.id];

        // Device Icon based on type
        let devIconSvg = '';
        if (dev.type === 'air_conditioner') {
          devIconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>`;
        } else if (dev.type === 'lighting') {
          devIconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        } else if (dev.type === 'fans') {
          devIconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m14.3 8.2.9-.9a2 2 0 1 1 2.8 2.8l-.9.9m-4.2 4.2-.9.9a2 2 0 1 1-2.8-2.8l.9-.9m4.2-4.2-.9-.9a2 2 0 1 0-2.8 2.8l.9.9m4.2 4.2.9.9a2 2 0 1 0 2.8-2.8l-.9-.9"></path></svg>`;
        } else if (dev.type === 'projector') {
          devIconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`;
        } else if (dev.type === 'workstations') {
          devIconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
        } else {
          devIconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        }

        // Status Badges HTML
        let badgesHtml = '';
        if (dev.manualOverride) {
          badgesHtml += `<span class="sc-dev-badge override" title="Protected by manual override">Override</span>`;
        }
        if (dev.isEssential) {
          badgesHtml += `<span class="sc-dev-badge essential" title="Essential equipment - excluded from automated shutdown">Essential</span>`;
        }
        if (isRec && !dev.manualOverride && !dev.isEssential) {
          badgesHtml += `<span class="sc-dev-badge recommended" title="Shutdown recommended in empty room">Shutdown Rec</span>`;
        }
        if (typeof countdownSec === 'number' && countdownSec > 0) {
          badgesHtml += `<span class="sc-dev-countdown" title="Automated shutdown delay countdown">Auto-off in ${countdownSec}s</span>`;
        }

        devicesHtml += `
          <div class="sc-device-row ${isRec ? 'is-recommended' : ''} ${dev.manualOverride ? 'is-overridden' : ''}" data-device-id="${dev.id}">
            <div class="sc-device-info">
              <div class="sc-device-icon ${isOn ? 'active' : ''}">
                ${devIconSvg}
              </div>
              <div class="sc-device-name-group">
                <span class="sc-device-name">${escapeHTML(dev.name)}</span>
                <div class="sc-device-meta-row">
                  <span class="sc-device-power-tag">${dev.powerKW} kW (est.)</span>
                  ${badgesHtml}
                </div>
              </div>
            </div>
            <div class="sc-device-controls">
              <!-- Override Lock/Unlock Button (Requirement 5) -->
              <button type="button" class="btn-icon-subtle btn-sc-override ${dev.manualOverride ? 'active-override' : ''}" data-room-id="${room.roomId}" data-device-id="${dev.id}" title="${dev.manualOverride ? 'Cancel manual override' : 'Lock manual override (protect from auto-shutdown)'}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="${dev.manualOverride ? 'M7 11V7a5 5 0 0 1 10 0v4' : 'M7 11V7a5 5 0 0 1 9.9-1'}"></path></svg>
              </button>

              <!-- Essential Equipment Toggle (Requirement 5) -->
              <button type="button" class="btn-icon-subtle btn-sc-essential ${dev.isEssential ? 'active-essential' : ''}" data-room-id="${room.roomId}" data-device-id="${dev.id}" title="${dev.isEssential ? 'Unmark essential equipment' : 'Mark as essential equipment (always keep on)'}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </button>

              <!-- On/Off Switch Button (Requirement 3) -->
              <button type="button" class="btn-toggle-switch ${isOn ? 'is-on' : ''} btn-sc-toggle" data-room-id="${room.roomId}" data-device-id="${dev.id}" title="${isOn ? 'Turn device OFF' : 'Turn device ON'}" aria-label="Toggle device power">
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="sc-room-header">
          <div class="sc-room-title-box">
            <div class="sc-room-name-row">
              <h4 class="sc-room-name">${escapeHTML(room.roomId)}</h4>
              <span class="room-type-tag" style="font-size: 10px;">${escapeHTML(room.roomType)}</span>
            </div>
            <span class="sc-room-sub">${escapeHTML(room.roomName)} &bull; ${escapeHTML(room.floor)}</span>
          </div>

          <!-- Occupancy Toggle Button (Requirement 3) -->
          <button type="button" class="btn-occupancy-toggle ${isUnoccupied ? 'unoccupied' : 'occupied'} btn-sc-occupancy" data-room-id="${room.roomId}" title="Click to toggle occupancy state between Occupied and Unoccupied">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            <span>${isUnoccupied ? 'Marked Unoccupied' : 'Marked Occupied'}</span>
          </button>
        </div>

        ${warningHtml}

        <div class="sc-room-power-bar">
          <span class="text-muted">${room.scheduleStatus === 'scheduled' ? `Class: ${escapeHTML(room.scheduledClassName || 'Scheduled')}` : 'No Timetable Session'}</span>
          <span class="sc-room-power-val">${activeKW.toFixed(2)} kW Active</span>
        </div>

        <div class="sc-devices-list">
          ${devicesHtml}
        </div>

        <div class="sc-room-footer">
          <div class="sc-room-footer-links">
            <button type="button" class="btn-link-subtle btn-sc-analytics" data-room-id="${room.roomId}" title="View detailed Classroom Analytics">
              <span>Analytics &rarr;</span>
            </button>
            <button type="button" class="btn-link-subtle btn-sc-heatmap" data-room-id="${room.roomId}" title="Locate in Energy Heatmap">
              <span>Heatmap &rarr;</span>
            </button>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-link-subtle btn-sc-reset-room" data-room-id="${room.roomId}" title="Restore this room to default demo preset">
              Reset
            </button>
            ${activeCount > 0 ? `
              <button type="button" class="btn-secondary btn-xs btn-sc-turn-off-room" data-room-id="${room.roomId}" title="Turn off all non-essential devices in this room">
                Turn Off Room
              </button>
            ` : ''}
          </div>
        </div>
      `;

      elements.scRoomsContainer.appendChild(card);
    });
  }

  /**
   * Synchronize Smart Controls Mode & Status UI
   */
  function syncSmartControlsModeUI() {
    if (elements.btnModeManual && elements.btnModeAutomatic) {
      if (state.scSimMode === 'automatic') {
        elements.btnModeAutomatic.classList.add('active');
        elements.btnModeManual.classList.remove('active');
      } else {
        elements.btnModeManual.classList.add('active');
        elements.btnModeAutomatic.classList.remove('active');
      }
    }

    if (elements.simStatusPill && elements.simStatusText) {
      if (!state.scSimRunning) {
        elements.simStatusPill.className = 'sc-status-pill paused';
        elements.simStatusText.textContent = 'Simulation Paused';
      } else {
        elements.simStatusPill.className = 'sc-status-pill active';
        elements.simStatusText.textContent = state.scSimMode === 'automatic' 
          ? 'Auto Simulation Active' 
          : 'Manual Simulation Mode';
      }
    }

    if (elements.btnPauseSimulation && elements.btnResumeSimulation) {
      if (state.scSimRunning) {
        elements.btnPauseSimulation.style.display = 'inline-flex';
        elements.btnResumeSimulation.style.display = 'none';
      } else {
        elements.btnPauseSimulation.style.display = 'none';
        elements.btnResumeSimulation.style.display = 'inline-flex';
      }
    }
  }

  /**
   * Main Coordinator: Render Smart Controls Simulator View
   */
  function renderSmartControls() {
    initSmartControlsData();
    initMaintenanceData();
    initDepartmentChallengeData();
    renderSmartControlsKPIs();
    renderSmartControlsRooms();
    renderSmartControlsEstimator();
    renderSmartControlsLog();
    syncSmartControlsModeUI();
  }

  /**
   * Simulation Engine Loop: 1-second Tick (Requirement 4)
   */
  function startSimulationLoop() {
    if (state.scSimulationIntervalId) return; // Already running

    state.scSimulationIntervalId = setInterval(() => {
      runSimulationTick();
    }, 1000);
  }

  function stopSimulationLoop() {
    if (state.scSimulationIntervalId) {
      clearInterval(state.scSimulationIntervalId);
      state.scSimulationIntervalId = null;
    }
  }

  function runSimulationTick() {
    // Only process when simulation is running and current view is smart-controls
    if (!state.scSimRunning || state.currentView !== 'smart-controls') return;

    let stateChanged = false;

    if (state.scSimMode === 'automatic') {
      state.scRoomsData.forEach(room => {
        const isUnoccupied = room.occupancyStatus === 'unoccupied';

        if (isUnoccupied) {
          room.devices.forEach(dev => {
            if (dev.state === 'on') {
              // Safety Rules (Requirement 4 & 5):
              // 1. Manual override active -> Protected from auto-shutdown
              if (dev.manualOverride) {
                if (state.scActiveCountdowns[dev.id]) {
                  delete state.scActiveCountdowns[dev.id];
                  stateChanged = true;
                }
                return;
              }

              // 2. Essential equipment -> Protected from auto-shutdown
              if (dev.isEssential) {
                if (state.scActiveCountdowns[dev.id]) {
                  delete state.scActiveCountdowns[dev.id];
                  stateChanged = true;
                }
                return;
              }

              // Device is eligible for simulated auto-shutdown!
              if (typeof state.scActiveCountdowns[dev.id] !== 'number') {
                // Initialize countdown
                state.scActiveCountdowns[dev.id] = state.scAutoShutdownDelay;
                stateChanged = true;
              } else {
                // Decrement countdown
                state.scActiveCountdowns[dev.id]--;
                stateChanged = true;

                if (state.scActiveCountdowns[dev.id] <= 0) {
                  // Execute simulated auto-shutdown!
                  dev.state = 'off';
                  delete state.scActiveCountdowns[dev.id];

                  // Credit realized simulated savings (1.5 hours of avoided operation)
                  const kwhSaved = dev.powerKW * 1.5;
                  state.scRealizedSavingsKWh += kwhSaved;
                  state.scRealizedSavingsCost = state.scRealizedSavingsKWh * 0.18;

                  addSimulationLog(
                    'simulated_shutdown',
                    'SIMULATED SHUTDOWN',
                    'pill-green',
                    room.roomId,
                    `Automated shutdown executed: '${dev.name}' in ${room.roomId} powered OFF (Room unoccupied). Avoided ~${kwhSaved.toFixed(2)} kWh (~$${(kwhSaved * 0.18).toFixed(2)}).`
                  );

                  showToast(`Auto-shutdown: '${dev.name}' in ${room.roomId} powered OFF (~${kwhSaved.toFixed(1)} kWh saved).`, 'success');
                  saveSmartControlsState();
                }
              }
            } else {
              // Device is already off -> ensure countdown cleared
              if (state.scActiveCountdowns[dev.id]) {
                delete state.scActiveCountdowns[dev.id];
                stateChanged = true;
              }
            }
          });
        } else {
          // Room is occupied -> Safety Rule: CANCEL any pending countdowns in this room!
          room.devices.forEach(dev => {
            if (state.scActiveCountdowns[dev.id]) {
              delete state.scActiveCountdowns[dev.id];
              stateChanged = true;
            }
          });
        }
      });
    } else {
      // In manual mode, clear all countdowns
      if (Object.keys(state.scActiveCountdowns).length > 0) {
        state.scActiveCountdowns = {};
        stateChanged = true;
      }
    }

    if (stateChanged) {
      renderSmartControlsKPIs();
      renderSmartControlsRooms();
      renderSmartControlsEstimator();
    }
  }

  /**
   * Action: Toggle Device State On/Off (Requirement 3)
   */
  function toggleDeviceState(roomId, deviceId) {
    const room = state.scRoomsData.find(r => r.roomId === roomId);
    if (!room) return;
    const dev = room.devices.find(d => d.id === deviceId);
    if (!dev) return;

    if (dev.state === 'on') {
      dev.state = 'off';
      if (state.scActiveCountdowns[dev.id]) {
        delete state.scActiveCountdowns[dev.id];
      }

      // If room is unoccupied and device was not essential, credit manual realized savings
      let msgExtra = '';
      if (room.occupancyStatus === 'unoccupied' && !dev.isEssential) {
        const kwhSaved = dev.powerKW * 1.5;
        state.scRealizedSavingsKWh += kwhSaved;
        state.scRealizedSavingsCost = state.scRealizedSavingsKWh * 0.18;
        msgExtra = ` (Simulated energy recovery: ~${kwhSaved.toFixed(2)} kWh / ~$${(kwhSaved * 0.18).toFixed(2)})`;
      }

      addSimulationLog(
        'manual_switch',
        'MANUAL SHUTDOWN',
        'pill-blue',
        room.roomId,
        `Device '${dev.name}' in ${room.roomId} manually switched OFF by user.${msgExtra}`
      );
      showToast(`'${dev.name}' in ${room.roomId} switched OFF.`, 'info');
    } else {
      dev.state = 'on';
      addSimulationLog(
        'manual_switch',
        'DEVICE POWERED ON',
        'pill-teal',
        room.roomId,
        `Device '${dev.name}' in ${room.roomId} manually powered ON (${dev.powerKW} kW).`
      );
      showToast(`'${dev.name}' in ${room.roomId} switched ON.`, 'info');
    }

    saveSmartControlsState();
    renderSmartControls();
  }

  /**
   * Action: Toggle Manual Override (Requirement 5)
   */
  function toggleManualOverride(roomId, deviceId) {
    const room = state.scRoomsData.find(r => r.roomId === roomId);
    if (!room) return;
    const dev = room.devices.find(d => d.id === deviceId);
    if (!dev) return;

    dev.manualOverride = !dev.manualOverride;

    if (dev.manualOverride) {
      if (state.scActiveCountdowns[dev.id]) {
        delete state.scActiveCountdowns[dev.id];
      }
      addSimulationLog(
        'override_engaged',
        'OVERRIDE ENGAGED',
        'pill-blue',
        room.roomId,
        `Manual override engaged on '${dev.name}' in ${room.roomId}. Device protected from automated shutdown.`
      );
      showToast(`Manual override locked on '${dev.name}' in ${room.roomId}.`, 'info');
    } else {
      addSimulationLog(
        'override_released',
        'OVERRIDE RELEASED',
        'pill-amber',
        room.roomId,
        `Manual override cancelled on '${dev.name}' in ${room.roomId}. Returned to standard control logic.`
      );
      showToast(`Manual override released on '${dev.name}' in ${room.roomId}.`, 'info');
    }

    saveSmartControlsState();
    renderSmartControls();
  }

  /**
   * Action: Toggle Essential Equipment Setting (Requirement 5)
   */
  function toggleEssentialEquipment(roomId, deviceId) {
    const room = state.scRoomsData.find(r => r.roomId === roomId);
    if (!room) return;
    const dev = room.devices.find(d => d.id === deviceId);
    if (!dev) return;

    dev.isEssential = !dev.isEssential;

    if (dev.isEssential) {
      if (state.scActiveCountdowns[dev.id]) {
        delete state.scActiveCountdowns[dev.id];
      }
      addSimulationLog(
        'essential_protected',
        'ESSENTIAL PROTECTED',
        'pill-purple',
        room.roomId,
        `'${dev.name}' in ${room.roomId} designated as Essential Equipment. Protected from energy load shedding.`
      );
      showToast(`'${dev.name}' marked as Essential Equipment.`, 'info');
    } else {
      addSimulationLog(
        'essential_removed',
        'ESSENTIAL REMOVED',
        'pill-amber',
        room.roomId,
        `'${dev.name}' in ${room.roomId} removed from Essential Equipment designation.`
      );
      showToast(`'${dev.name}' unmarked as Essential.`, 'info');
    }

    saveSmartControlsState();
    renderSmartControls();
  }

  /**
   * Action: Toggle Room Occupancy (Requirement 3)
   */
  function toggleRoomOccupancy(roomId) {
    const room = state.scRoomsData.find(r => r.roomId === roomId);
    if (!room) return;

    if (room.occupancyStatus === 'unoccupied') {
      room.occupancyStatus = 'occupied';

      // Cancel all active countdowns in this room for safety
      room.devices.forEach(dev => {
        if (state.scActiveCountdowns[dev.id]) {
          delete state.scActiveCountdowns[dev.id];
        }
      });

      addSimulationLog(
        'occupancy_change',
        'OCCUPANCY CHANGED',
        'pill-blue',
        room.roomId,
        `Room ${room.roomId} marked as OCCUPIED. All automated shutdown routines cancelled for occupant safety.`
      );
      showToast(`Room ${room.roomId} marked OCCUPIED. Protected from auto-shutdown.`, 'info');
    } else {
      room.occupancyStatus = 'unoccupied';

      // Check if devices are left on
      const activeDevs = room.devices.filter(d => d.state === 'on');
      addSimulationLog(
        'occupancy_change',
        'OCCUPANCY CHANGED',
        'pill-amber',
        room.roomId,
        `Room ${room.roomId} marked as UNOCCUPIED. ${activeDevs.length} device(s) currently energized.`
      );

      if (activeDevs.length > 0) {
        showToast(`Room ${room.roomId} marked UNOCCUPIED. Unnecessary devices detected ON.`, 'warning');
      } else {
        showToast(`Room ${room.roomId} marked UNOCCUPIED.`, 'info');
      }
    }

    saveSmartControlsState();
    renderSmartControls();
  }

  /**
   * Action: Reset Single Room to Baseline Demo State (Requirement 3)
   */
  function resetRoomToDefault(roomId) {
    const rawInitial = SCEO_DATA.smartControlsModule?.initialRooms || [];
    const preset = rawInitial.find(r => r.roomId === roomId);
    if (!preset) return;

    const idx = state.scRoomsData.findIndex(r => r.roomId === roomId);
    if (idx !== -1) {
      state.scRoomsData[idx] = JSON.parse(JSON.stringify(preset));

      // Clear any countdowns for devices in this room
      state.scRoomsData[idx].devices.forEach(d => {
        delete state.scActiveCountdowns[d.id];
      });

      addSimulationLog(
        'room_reset',
        'ROOM RESET',
        'pill-teal',
        roomId,
        `Room ${roomId} restored to initial demo baseline.`
      );
      showToast(`Room ${roomId} restored to initial demo state.`, 'info');
      saveSmartControlsState();
      renderSmartControls();
    }
  }

  /**
   * Action: Turn Off All Eligible Devices in Filtered Empty Rooms (Requirement 8)
   */
  function turnOffAllInEmptyRooms() {
    const filteredRooms = getFilteredSmartControlRooms();
    let countTurnedOff = 0;
    let kwhSavedTotal = 0;

    filteredRooms.forEach(room => {
      if (room.occupancyStatus === 'unoccupied') {
        room.devices.forEach(dev => {
          if (dev.state === 'on' && !dev.manualOverride && !dev.isEssential) {
            dev.state = 'off';
            delete state.scActiveCountdowns[dev.id];
            countTurnedOff++;
            const s = dev.powerKW * 1.5;
            kwhSavedTotal += s;
          }
        });
      }
    });

    if (countTurnedOff > 0) {
      state.scRealizedSavingsKWh += kwhSavedTotal;
      state.scRealizedSavingsCost = state.scRealizedSavingsKWh * 0.18;

      addSimulationLog(
        'bulk_shutdown',
        'BULK SHUTDOWN',
        'pill-green',
        'MULTIPLE',
        `Batch shutdown: ${countTurnedOff} eligible devices powered OFF across unoccupied rooms. Realized ~${kwhSavedTotal.toFixed(2)} kWh.`
      );
      showToast(`Powered off ${countTurnedOff} devices in empty rooms (~${kwhSavedTotal.toFixed(1)} kWh saved).`, 'success');
      saveSmartControlsState();
      renderSmartControls();
    } else {
      showToast('No eligible devices left ON in unoccupied rooms.', 'info');
    }
  }

  /**
   * Action: Turn Off Non-Essential, Non-Overridden Devices in a Specific Room
   */
  function turnOffRoomDevices(roomId) {
    const room = state.scRoomsData.find(r => r.roomId === roomId);
    if (!room) return;

    let countTurnedOff = 0;
    let kwhSavedTotal = 0;

    room.devices.forEach(dev => {
      if (dev.state === 'on' && !dev.manualOverride && !dev.isEssential) {
        dev.state = 'off';
        delete state.scActiveCountdowns[dev.id];
        countTurnedOff++;
        const s = dev.powerKW * 1.5;
        kwhSavedTotal += s;
      }
    });

    if (countTurnedOff > 0) {
      state.scRealizedSavingsKWh += kwhSavedTotal;
      state.scRealizedSavingsCost = state.scRealizedSavingsKWh * 0.18;

      addSimulationLog(
        'room_shutdown',
        'ROOM SHUTDOWN',
        'pill-green',
        roomId,
        `Manual room shutdown: ${countTurnedOff} device(s) switched off in ${roomId}. Realized ~${kwhSavedTotal.toFixed(2)} kWh.`
      );
      showToast(`Switched off ${countTurnedOff} device(s) in ${roomId} (~${kwhSavedTotal.toFixed(1)} kWh saved).`, 'success');
      saveSmartControlsState();
      renderSmartControls();
    } else {
      showToast(`No eligible devices to switch off in ${roomId} (active devices are either protected by override or marked essential).`, 'info');
    }
  }

  /**
   * Master Actions: Pause / Resume / Reset (Requirement 8)
   */
  function pauseSimulation() {
    state.scSimRunning = false;
    state.scActiveCountdowns = {};
    syncSmartControlsModeUI();
    addSimulationLog(
      'sim_paused',
      'SIMULATION PAUSED',
      'pill-amber',
      'SYSTEM',
      'Simulation rules and automated shutdown timers paused by administrator.'
    );
    showToast('Simulation paused. Automated countdowns suspended.', 'info');
  }

  function resumeSimulation() {
    state.scSimRunning = true;
    syncSmartControlsModeUI();
    addSimulationLog(
      'sim_resumed',
      'SIMULATION RESUMED',
      'pill-green',
      'SYSTEM',
      'Simulation resumed. Automated monitoring active.'
    );
    showToast('Simulation resumed.', 'info');
  }

  function resetSimulationDemo() {
    // Restore all 24 rooms from initial preset
    const rawInitial = SCEO_DATA.smartControlsModule?.initialRooms || [];
    state.scRoomsData = JSON.parse(JSON.stringify(rawInitial));
    state.scRealizedSavingsKWh = 0.0;
    state.scRealizedSavingsCost = 0.0;
    state.scActiveCountdowns = {};
    state.scSimRunning = true;
    state.scSimMode = 'manual';

    try {
      localStorage.removeItem(SC_STORAGE_KEYS.ROOMS);
      localStorage.removeItem(SC_STORAGE_KEYS.SAVINGS);
      localStorage.removeItem(SC_STORAGE_KEYS.MODE);
    } catch (e) {
      console.warn('localStorage clear error:', e);
    }

    addSimulationLog(
      'demo_reset',
      'SIMULATOR RESET',
      'pill-teal',
      'ALL',
      'Simulator restored to initial demo baseline. All device states, occupancy, and savings reset.'
    );
    showToast('Smart Controls simulation reset to baseline defaults.', 'info');
    renderSmartControls();
  }

  function clearSimulationLog() {
    state.scEventLogs = [];
    try {
      localStorage.removeItem(SC_STORAGE_KEYS.LOGS);
    } catch (e) {
      console.warn('localStorage clear error:', e);
    }
    renderSmartControlsLog();
    showToast('Simulation event log cleared.', 'info');
  }


  // ==========================================================================
  // STEP 7: PREVENTIVE MAINTENANCE & DEPARTMENT ENERGY CHALLENGE
  // ==========================================================================

  // --------------------------------------------------------------------------
  // Step 7A: Preventive Maintenance Functions
  // --------------------------------------------------------------------------
  function initMaintenanceData() {
    const stored = loadStoredArray(MAINT_STORAGE_KEYS.TASKS);
    if (stored && stored.length > 0) {
      state.maintTasks = stored;
    } else if (window.SCEO_DATA && SCEO_DATA.maintenanceModule && SCEO_DATA.maintenanceModule.initialEquipment) {
      state.maintTasks = JSON.parse(JSON.stringify(SCEO_DATA.maintenanceModule.initialEquipment));
    } else {
      state.maintTasks = [];
    }

    const storedMode = localStorage.getItem(MAINT_STORAGE_KEYS.VIEW_MODE);
    if (storedMode === 'table' || storedMode === 'cards') {
      state.maintViewMode = storedMode;
    }
  }

  function saveMaintenanceTasks() {
    saveStoredArray(MAINT_STORAGE_KEYS.TASKS, state.maintTasks);
  }

  function getFilteredMaintenanceTasks() {
    let tasks = state.maintTasks || [];

    // Building filter
    if (state.maintFilterBuilding !== 'all') {
      tasks = tasks.filter(t => t.buildingId === state.maintFilterBuilding);
    }

    // Equipment Type filter
    if (state.maintFilterType !== 'all') {
      tasks = tasks.filter(t => t.type === state.maintFilterType);
    }

    // Maintenance Status / Condition filter
    if (state.maintFilterStatus !== 'all') {
      const s = state.maintFilterStatus;
      if (s === 'urgent_review') {
        tasks = tasks.filter(t => (t.condition && t.condition.toLowerCase().includes('urgent')) || (t.priority && t.priority.toLowerCase() === 'critical'));
      } else if (s === 'maintenance_due') {
        tasks = tasks.filter(t => t.condition && t.condition.toLowerCase().includes('due'));
      } else if (s === 'inspection_recommended') {
        tasks = tasks.filter(t => t.condition && t.condition.toLowerCase().includes('recommended'));
      } else if (s === 'good') {
        tasks = tasks.filter(t => t.condition && t.condition.toLowerCase().includes('good'));
      } else if (s === 'status_open') {
        tasks = tasks.filter(t => t.status === 'open');
      } else if (s === 'status_scheduled') {
        tasks = tasks.filter(t => t.status === 'scheduled');
      } else if (s === 'status_in_progress') {
        tasks = tasks.filter(t => t.status === 'in_progress');
      } else if (s === 'status_completed') {
        tasks = tasks.filter(t => t.status === 'completed');
      }
    }

    // Search query filter
    if (state.maintSearchQuery && state.maintSearchQuery.trim()) {
      const q = state.maintSearchQuery.trim().toLowerCase();
      tasks = tasks.filter(t => 
        (t.id && t.id.toLowerCase().includes(q)) ||
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.roomId && t.roomId.toLowerCase().includes(q)) ||
        (t.buildingName && t.buildingName.toLowerCase().includes(q)) ||
        (t.reportedIssue && t.reportedIssue.toLowerCase().includes(q)) ||
        (t.typeLabel && t.typeLabel.toLowerCase().includes(q))
      );
    }

    return tasks;
  }

  function getConditionClass(condition) {
    const c = (condition || '').toLowerCase();
    if (c.includes('urgent') || c.includes('critical')) return 'urgent_review';
    if (c.includes('due')) return 'maintenance_due';
    if (c.includes('recommended')) return 'inspection_recommended';
    return 'good';
  }

  function getPriorityClass(priority) {
    const p = (priority || '').toLowerCase();
    if (p.includes('critical') || p.includes('urgent')) return 'critical';
    if (p.includes('high')) return 'high';
    if (p.includes('medium')) return 'medium';
    return 'low';
  }

  function getStatusLabel(status) {
    switch(status) {
      case 'open': return 'Open';
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status || 'Open';
    }
  }

  function renderMaintenanceView() {
    const filteredTasks = getFilteredMaintenanceTasks();

    // Update KPI Summary Cards (Requirement 1 & 4)
    // KPI 1: Total Equipment Records
    const totalCount = filteredTasks.length;
    if (elements.kpiMaintTotalRecords) elements.kpiMaintTotalRecords.textContent = totalCount;
    if (elements.kpiMaintTotalRecordsSub) {
      elements.kpiMaintTotalRecordsSub.textContent = `Cataloged across ${state.maintFilterBuilding === 'all' ? '24' : 'filtered'} monitored rooms`;
    }

    // KPI 2: Maintenance Due
    const dueCount = filteredTasks.filter(t => {
      const cond = (t.condition || '').toLowerCase();
      return cond.includes('due') || cond.includes('urgent');
    }).length;
    if (elements.kpiMaintDue) elements.kpiMaintDue.textContent = dueCount;
    if (elements.kpiMaintDueSub) {
      elements.kpiMaintDueSub.textContent = `${dueCount} overdue or urgent inspections`;
    }

    // KPI 3: Open Issues (Open, Scheduled, In Progress)
    const openCount = filteredTasks.filter(t => t.status === 'open' || t.status === 'scheduled' || t.status === 'in_progress').length;
    if (elements.kpiMaintOpenIssues) elements.kpiMaintOpenIssues.textContent = openCount;
    if (elements.kpiMaintOpenIssuesSub) {
      elements.kpiMaintOpenIssuesSub.textContent = `${openCount} active work orders in queue`;
    }

    // KPI 4: Completed Tasks
    const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
    if (elements.kpiMaintCompleted) elements.kpiMaintCompleted.textContent = completedCount;
    if (elements.kpiMaintCompletedSub) {
      elements.kpiMaintCompletedSub.textContent = `${completedCount} logged preventive services verified`;
    }

    if (elements.maintCountBadge) {
      elements.maintCountBadge.textContent = `${totalCount} ${totalCount === 1 ? 'Record' : 'Records'}`;
    }

    // Toggle Empty State
    if (totalCount === 0) {
      if (elements.maintTableContainer) elements.maintTableContainer.style.display = 'none';
      if (elements.maintCardsContainer) elements.maintCardsContainer.style.display = 'none';
      if (elements.maintEmptyState) elements.maintEmptyState.style.display = 'block';
    } else {
      if (elements.maintEmptyState) elements.maintEmptyState.style.display = 'none';
      if (state.maintViewMode === 'cards') {
        if (elements.maintTableContainer) elements.maintTableContainer.style.display = 'none';
        if (elements.maintCardsContainer) {
          elements.maintCardsContainer.style.display = 'grid';
          renderMaintenanceCards(filteredTasks);
        }
      } else {
        if (elements.maintCardsContainer) elements.maintCardsContainer.style.display = 'none';
        if (elements.maintTableContainer) {
          elements.maintTableContainer.style.display = 'block';
          renderMaintenanceTable(filteredTasks);
        }
      }
    }

    // Update view toggle button active states
    if (elements.btnMaintViewTable) {
      elements.btnMaintViewTable.classList.toggle('active', state.maintViewMode === 'table');
    }
    if (elements.btnMaintViewCards) {
      elements.btnMaintViewCards.classList.toggle('active', state.maintViewMode === 'cards');
    }
  }

  function renderMaintenanceTable(tasks) {
    if (!elements.maintTableBody) return;
    elements.maintTableBody.innerHTML = '';

    tasks.forEach(t => {
      const tr = document.createElement('tr');
      const condClass = getConditionClass(t.condition);
      const prioClass = getPriorityClass(t.priority);
      const statusClass = t.status || 'open';
      const statusLabel = getStatusLabel(t.status);

      tr.innerHTML = `
        <td>
          <div class="maint-eq-name-wrap">
            <span class="maint-eq-name">${escapeHTML(t.name)}</span>
            <span class="maint-eq-id">${escapeHTML(t.id)}</span>
          </div>
        </td>
        <td>
          <div style="font-weight: 500; color: var(--color-text-main); font-size: 13px;">${escapeHTML(t.roomId || t.roomName || 'Campus')}</div>
          <div style="font-size: 11px; color: var(--color-text-muted);">${escapeHTML(t.buildingName || '')}</div>
        </td>
        <td>
          <span style="font-size: 12px; color: var(--color-text-secondary);">${escapeHTML(t.typeLabel || t.type)}</span>
        </td>
        <td>
          <span class="maint-condition-pill ${condClass}">${escapeHTML(t.condition || 'Good')}</span>
        </td>
        <td style="font-size: 12px; color: var(--color-text-secondary); white-space: nowrap;">
          ${escapeHTML(t.lastMaintenanceDate || 'N/A')}
        </td>
        <td style="font-size: 12px; white-space: nowrap; font-weight: 500;">
          <span style="${condClass === 'urgent_review' || condClass === 'maintenance_due' ? 'color: var(--color-danger); font-weight: 600;' : ''}">
            ${escapeHTML(t.nextDueDate || 'Pending')}
          </span>
        </td>
        <td>
          <span class="maint-priority-badge ${prioClass}">${escapeHTML(t.priority || 'Medium')}</span>
        </td>
        <td>
          <span class="maint-status-badge ${statusClass}">${statusLabel}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="btn-secondary btn-sm btn-maint-details" data-id="${escapeHTML(t.id)}" style="font-size: 11.5px; padding: 4px 8px;">
            View Details
          </button>
        </td>
      `;

      elements.maintTableBody.appendChild(tr);
    });

    elements.maintTableBody.querySelectorAll('.btn-maint-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openMaintenanceDetailModal(id);
      });
    });
  }

  function renderMaintenanceCards(tasks) {
    if (!elements.maintCardsContainer) return;
    elements.maintCardsContainer.innerHTML = '';

    tasks.forEach(t => {
      const card = document.createElement('div');
      card.className = 'maint-card';
      const condClass = getConditionClass(t.condition);
      const prioClass = getPriorityClass(t.priority);
      const statusClass = t.status || 'open';
      const statusLabel = getStatusLabel(t.status);

      card.innerHTML = `
        <div class="maint-card-header-row">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--color-primary);">${escapeHTML(t.roomId)} &bull; ${escapeHTML(t.typeLabel || t.type)}</div>
            <h4 class="maint-card-title" style="margin: 3px 0 2px 0;">${escapeHTML(t.name)}</h4>
            <span class="maint-eq-id">${escapeHTML(t.id)}</span>
          </div>
          <span class="maint-condition-pill ${condClass}">${escapeHTML(t.condition || 'Good')}</span>
        </div>

        <div class="maint-card-issue-box">
          <strong>Observed Issue:</strong> ${escapeHTML(t.reportedIssue || 'Scheduled check')}
        </div>

        <div class="maint-card-dates-grid">
          <div>
            <span style="color: var(--color-text-muted); display: block;">Last Service:</span>
            <strong>${escapeHTML(t.lastMaintenanceDate || 'N/A')}</strong>
          </div>
          <div>
            <span style="color: var(--color-text-muted); display: block;">Next Due:</span>
            <strong style="${condClass === 'urgent_review' || condClass === 'maintenance_due' ? 'color: var(--color-danger);' : ''}">${escapeHTML(t.nextDueDate || 'Pending')}</strong>
          </div>
          <div>
            <span style="color: var(--color-text-muted); display: block;">Priority:</span>
            <span class="maint-priority-badge ${prioClass}">${escapeHTML(t.priority || 'Medium')}</span>
          </div>
          <div>
            <span style="color: var(--color-text-muted); display: block;">Assigned:</span>
            <span style="font-weight: 500; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${escapeHTML(t.assignedTeam || 'Facilities')}</span>
          </div>
        </div>

        <div class="maint-card-footer">
          <span class="maint-status-badge ${statusClass}">${statusLabel}</span>
          <button type="button" class="btn-secondary btn-sm btn-maint-details" data-id="${escapeHTML(t.id)}" style="font-size: 11.5px; padding: 4px 10px;">
            Details &amp; Actions &rarr;
          </button>
        </div>
      `;

      elements.maintCardsContainer.appendChild(card);
    });

    elements.maintCardsContainer.querySelectorAll('.btn-maint-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openMaintenanceDetailModal(id);
      });
    });
  }

  function openMaintenanceDetailModal(taskId) {
    const task = (state.maintTasks || []).find(t => t.id === taskId);
    if (!task) return;
    state.activeMaintTaskInModal = task;

    if (elements.maintModalTitle) elements.maintModalTitle.textContent = `${task.id} - ${task.name}`;
    if (elements.maintModalId) elements.maintModalId.textContent = task.id;
    if (elements.maintModalType) elements.maintModalType.textContent = task.typeLabel || task.type;
    if (elements.maintModalRoom) elements.maintModalRoom.textContent = task.roomId || 'General Campus';
    if (elements.maintModalBuilding) elements.maintModalBuilding.textContent = task.buildingName || 'Campus';

    const condClass = getConditionClass(task.condition);
    if (elements.maintModalCondition) {
      elements.maintModalCondition.className = `maint-condition-pill ${condClass}`;
      elements.maintModalCondition.textContent = task.condition;
    }

    const prioClass = getPriorityClass(task.priority);
    if (elements.maintModalPriority) {
      elements.maintModalPriority.className = `maint-priority-badge ${prioClass}`;
      elements.maintModalPriority.textContent = task.priority;
    }

    const statusClass = task.status || 'open';
    if (elements.maintModalStatus) {
      elements.maintModalStatus.className = `maint-status-badge ${statusClass}`;
      elements.maintModalStatus.textContent = getStatusLabel(task.status);
    }

    if (elements.maintModalIssue) elements.maintModalIssue.textContent = task.reportedIssue || 'None reported.';
    if (elements.maintModalReason) elements.maintModalReason.textContent = task.reasonForInspection || 'Observed telemetry anomaly in Classroom Analytics.';
    if (elements.maintModalAction) elements.maintModalAction.textContent = task.recommendedAction || 'Perform physical inspection and diagnostic calibration.';
    if (elements.maintModalAssignedTeam) elements.maintModalAssignedTeam.textContent = task.assignedTeam || 'Campus Facilities Mechanical Team';
    if (elements.maintModalTargetDate) elements.maintModalTargetDate.textContent = task.targetCompletionDate || 'Open';
    if (elements.maintModalLastDate) elements.maintModalLastDate.textContent = task.lastMaintenanceDate || 'None recorded';
    if (elements.maintModalDueDate) elements.maintModalDueDate.textContent = task.nextDueDate || 'Pending';

    // Populate History Timeline
    if (elements.maintModalHistoryTimeline) {
      elements.maintModalHistoryTimeline.innerHTML = '';
      const history = task.maintenanceHistory || [
        { date: task.lastMaintenanceDate || '2026-05-10', event: 'Routine scheduled inspection logged', technician: task.assignedTeam || 'Facilities Team' }
      ];
      history.forEach(h => {
        const item = document.createElement('div');
        item.className = 'maint-history-item';
        item.innerHTML = `
          <span class="maint-history-date">${escapeHTML(h.date)}:</span>
          <span class="maint-history-text">${escapeHTML(h.event)} &bull; <em style="color: var(--color-text-muted);">${escapeHTML(h.technician || '')}</em></span>
        `;
        elements.maintModalHistoryTimeline.appendChild(item);
      });
    }

    // Toggle status action buttons in modal
    if (elements.btnMaintSetScheduled) elements.btnMaintSetScheduled.style.display = task.status === 'open' ? 'inline-block' : 'none';
    if (elements.btnMaintSetInProgress) elements.btnMaintSetInProgress.style.display = (task.status === 'open' || task.status === 'scheduled') ? 'inline-block' : 'none';
    if (elements.btnMaintSetCompleted) elements.btnMaintSetCompleted.style.display = task.status !== 'completed' ? 'inline-block' : 'none';
    if (elements.btnMaintSetReopen) elements.btnMaintSetReopen.style.display = task.status === 'completed' ? 'inline-block' : 'none';

    if (elements.maintenanceDetailModal) elements.maintenanceDetailModal.classList.add('active');
  }

  function closeMaintenanceDetailModal() {
    if (elements.maintenanceDetailModal) elements.maintenanceDetailModal.classList.remove('active');
    state.activeMaintTaskInModal = null;
  }

  function updateMaintenanceTaskStatus(taskId, newStatus, optionalNote) {
    const task = (state.maintTasks || []).find(t => t.id === taskId);
    if (!task) return;

    task.status = newStatus;
    if (!task.maintenanceHistory) task.maintenanceHistory = [];
    const today = new Date().toISOString().slice(0, 10);
    const note = optionalNote || `Status updated to ${getStatusLabel(newStatus)}`;
    task.maintenanceHistory.unshift({
      date: today,
      event: note,
      technician: task.assignedTeam || 'Facilities Team'
    });

    if (newStatus === 'completed') {
      task.condition = 'Good';
      task.lastMaintenanceDate = today;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 90);
      task.nextDueDate = nextDate.toISOString().slice(0, 10);
      // Integrity rule: Physical servicing does not assume automated energy reduction
    } else if (newStatus === 'open') {
      task.condition = 'Inspection Recommended';
    }

    saveMaintenanceTasks();
    renderMaintenanceView();

    if (state.activeMaintTaskInModal && state.activeMaintTaskInModal.id === taskId) {
      openMaintenanceDetailModal(taskId);
    }

    if (newStatus === 'completed') {
      showToast(`Work Order ${taskId} marked completed. Note: Verified savings require post-service telemetry.`, 'success');
    } else {
      showToast(`Work Order ${taskId} updated to ${getStatusLabel(newStatus)}`, 'success');
    }
  }

  function openAddMaintenanceModal() {
    populateAddMaintRoomSelector();
    if (elements.addMaintForm) elements.addMaintForm.reset();
    if (elements.addMaintValidationMsg) elements.addMaintValidationMsg.style.display = 'none';

    if (elements.addMaintTargetDate) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      elements.addMaintTargetDate.value = d.toISOString().slice(0, 10);
    }

    if (elements.addMaintenanceModal) elements.addMaintenanceModal.classList.add('active');
  }

  function closeAddMaintenanceModal() {
    if (elements.addMaintenanceModal) elements.addMaintenanceModal.classList.remove('active');
  }

  function populateAddMaintRoomSelector() {
    if (!elements.addMaintRoomSelect) return;
    elements.addMaintRoomSelect.innerHTML = '';
    const classrooms = (window.SCEO_DATA && SCEO_DATA.classrooms) ? SCEO_DATA.classrooms : [];

    classrooms.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.id} - ${c.name} (${c.buildingName || c.building})`;
      opt.dataset.buildingId = c.building || 'engineering';
      opt.dataset.buildingName = c.buildingName || 'Engineering Building';
      opt.dataset.roomName = c.name;
      opt.dataset.roomType = c.type || 'Classroom';
      elements.addMaintRoomSelect.appendChild(opt);
    });
  }

  function submitAddMaintenanceTask(e) {
    if (e) e.preventDefault();

    const roomSelect = elements.addMaintRoomSelect;
    const selectedOpt = roomSelect ? roomSelect.selectedOptions[0] : null;
    const roomId = roomSelect ? roomSelect.value : '';
    const name = elements.addMaintEquipmentName ? elements.addMaintEquipmentName.value.trim() : '';
    const type = elements.addMaintTypeSelect ? elements.addMaintTypeSelect.value : 'air_conditioner';
    const typeLabel = elements.addMaintTypeSelect ? elements.addMaintTypeSelect.selectedOptions[0].textContent : 'Air Conditioner';
    const priority = elements.addMaintPrioritySelect ? elements.addMaintPrioritySelect.value : 'Medium';
    const condition = elements.addMaintConditionSelect ? elements.addMaintConditionSelect.value : 'Maintenance Due';
    const assignedTeam = elements.addMaintTeamSelect ? elements.addMaintTeamSelect.value : 'Campus Facilities Mechanical Team';
    const targetDate = elements.addMaintTargetDate ? elements.addMaintTargetDate.value : '';
    const issue = elements.addMaintIssue ? elements.addMaintIssue.value.trim() : '';
    const reason = elements.addMaintReason ? elements.addMaintReason.value.trim() : '';
    const recAction = elements.addMaintRecommendedAction ? elements.addMaintRecommendedAction.value.trim() : '';

    if (!name || !roomId || !issue || !targetDate) {
      if (elements.addMaintValidationMsg) {
        elements.addMaintValidationMsg.textContent = 'Please fill in all required fields marked with an asterisk (*).';
        elements.addMaintValidationMsg.style.display = 'block';
      }
      return;
    }

    const buildingId = selectedOpt ? (selectedOpt.dataset.buildingId || 'engineering') : 'engineering';
    const buildingName = selectedOpt ? (selectedOpt.dataset.buildingName || 'Engineering Building') : 'Engineering Building';
    const roomName = selectedOpt ? (selectedOpt.dataset.roomName || roomId) : roomId;
    const roomType = selectedOpt ? (selectedOpt.dataset.roomType || 'Classroom') : 'Classroom';

    const typeCode = type === 'air_conditioner' ? 'AC' : (type === 'fans' ? 'FN' : (type === 'lighting' ? 'LT' : (type === 'projector' ? 'PJ' : 'LAB')));
    const newId = `EQ-${roomId}-${typeCode}-${Date.now().toString().slice(-4)}`;

    const newTask = {
      id: newId,
      name: name,
      buildingId: buildingId,
      buildingName: buildingName,
      roomId: roomId,
      roomName: roomName,
      roomType: roomType,
      type: type,
      typeLabel: typeLabel,
      condition: condition,
      conditionSeverity: condition === 'Urgent Review' ? 'critical' : (condition === 'Maintenance Due' ? 'warning' : 'info'),
      lastMaintenanceDate: 'None recorded',
      nextDueDate: targetDate,
      priority: priority,
      status: 'open',
      assignedTeam: assignedTeam,
      targetCompletionDate: targetDate,
      reportedIssue: issue,
      reasonForInspection: reason || 'Logged by campus energy coordinator for inspection.',
      recommendedAction: recAction || 'Inspect unit, verify power draw against baseline, and document findings.',
      maintenanceHistory: [
        {
          date: new Date().toISOString().slice(0, 10),
          event: `Task created: ${issue}`,
          technician: assignedTeam
        }
      ]
    };

    state.maintTasks.unshift(newTask);
    saveMaintenanceTasks();
    closeAddMaintenanceModal();
    renderMaintenanceView();
    showToast(`New maintenance task ${newId} logged successfully`, 'success');
  }

  function resetMaintenanceDemo() {
    if (window.SCEO_DATA && SCEO_DATA.maintenanceModule && SCEO_DATA.maintenanceModule.initialEquipment) {
      state.maintTasks = JSON.parse(JSON.stringify(SCEO_DATA.maintenanceModule.initialEquipment));
    } else {
      state.maintTasks = [];
    }
    localStorage.removeItem(MAINT_STORAGE_KEYS.TASKS);
    renderMaintenanceView();
    if (elements.resetMaintConfirmModal) elements.resetMaintConfirmModal.classList.remove('active');
    showToast('Preventive Maintenance records restored to demo baseline', 'info');
  }

  // --------------------------------------------------------------------------
  // Step 7B: Department Energy Challenge Functions
  // --------------------------------------------------------------------------
  function initDepartmentChallengeData() {
    const stored = loadStoredArray(DEPT_STORAGE_KEYS.DEPARTMENTS);
    if (stored && stored.length > 0) {
      state.deptData = stored;
    } else if (window.SCEO_DATA && SCEO_DATA.departmentChallengeModule && SCEO_DATA.departmentChallengeModule.departments) {
      state.deptData = JSON.parse(JSON.stringify(SCEO_DATA.departmentChallengeModule.departments));
    } else {
      state.deptData = [];
    }

    const storedPeriod = localStorage.getItem(DEPT_STORAGE_KEYS.PERIOD);
    if (storedPeriod && ['month', 'semester', 'academic_year'].includes(storedPeriod)) {
      state.deptActivePeriod = storedPeriod;
    }

    const storedDept = localStorage.getItem(DEPT_STORAGE_KEYS.ACTIVE_DEPT);
    if (storedDept) {
      state.deptActiveDeptId = storedDept;
    }
  }

  function saveDepartmentChallengeData() {
    saveStoredArray(DEPT_STORAGE_KEYS.DEPARTMENTS, state.deptData);
  }

  function calculateDepartmentMetrics(dept, periodId) {
    const periodData = (dept.periods && dept.periods[periodId]) ? dept.periods[periodId] : {
      baselineKWh: null,
      currentKWh: 0,
      occupiedHours: 0,
      baselinePerHour: null,
      currentPerHour: 0,
      participationPct: 0
    };

    let reductionPct = null;
    if (periodData.baselineKWh !== null && periodData.baselineKWh > 0 && periodData.currentKWh !== null) {
      reductionPct = ((periodData.baselineKWh - periodData.currentKWh) / periodData.baselineKWh) * 100;
      reductionPct = Number(reductionPct.toFixed(1));
    }

    const completedActions = (dept.actions || []).filter(a => a.status === 'completed');
    const completedActionsCount = completedActions.length;

    // Scoring Rules (Requirement 10)
    // 25 pts per 1.0% reduction (only if reductionPct > 0 and baseline is valid)
    const reductionPoints = (reductionPct !== null && reductionPct > 0) ? Math.round(reductionPct * 25) : 0;
    // 50 pts per completed action
    const actionPoints = completedActionsCount * 50;
    // 2.0 multiplier on participation %
    const participationPct = periodData.participationPct || 0;
    const participationPoints = Math.round(participationPct * 2.0);

    const totalPoints = reductionPoints + actionPoints + participationPoints;

    // Achievements calculation (Requirement 10)
    const achievements = [];
    if (reductionPct !== null && reductionPct >= 7.0) {
      achievements.push({ id: 'energy_saver', label: 'Energy Saver', color: 'amber', desc: '>= 7.0% verified reduction' });
    }
    if (dept.id === 'dept_science' || dept.id === 'dept_engineering') {
      achievements.push({ id: 'consistent_improver', label: 'Consistent Improver', color: 'teal', desc: 'Steady reductions across 2+ periods' });
    }
    if (completedActionsCount >= 3) {
      achievements.push({ id: 'action_champion', label: 'Action Champion', color: 'purple', desc: '3+ verified actions completed' });
    }

    return {
      periodData,
      reductionPct,
      completedActionsCount,
      reductionPoints,
      actionPoints,
      participationPoints,
      totalPoints,
      achievements
    };
  }

  function getRankedDepartments(periodId) {
    const list = (state.deptData || []).map(dept => {
      const metrics = calculateDepartmentMetrics(dept, periodId);
      return {
        ...dept,
        metrics
      };
    });

    list.sort((a, b) => b.metrics.totalPoints - a.metrics.totalPoints);

    list.forEach((d, idx) => {
      d.rank = idx + 1;
    });

    return list;
  }

  function syncDeptPeriodButtons() {
    const period = state.deptActivePeriod || 'month';
    if (elements.btnDeptPeriodMonth) elements.btnDeptPeriodMonth.classList.toggle('active', period === 'month');
    if (elements.btnDeptPeriodSemester) elements.btnDeptPeriodSemester.classList.toggle('active', period === 'semester');
    if (elements.btnDeptPeriodYear) elements.btnDeptPeriodYear.classList.toggle('active', period === 'academic_year');

    if (elements.deptLeaderboardPeriodBadge) {
      if (period === 'month') elements.deptLeaderboardPeriodBadge.textContent = 'October 2026';
      else if (period === 'semester') elements.deptLeaderboardPeriodBadge.textContent = 'Fall Semester 2026';
      else elements.deptLeaderboardPeriodBadge.textContent = 'Academic Year 2025-26';
    }
  }

  function renderDepartmentChallengeView() {
    const periodId = state.deptActivePeriod || 'month';
    const ranked = getRankedDepartments(periodId);

    // Update Summary KPI Cards
    if (elements.kpiDeptCount) elements.kpiDeptCount.textContent = ranked.length;
    if (elements.kpiDeptCountSub) elements.kpiDeptCountSub.textContent = '4 Active • 1 Sensor Calibration';

    const validDeltas = ranked.filter(d => d.metrics.reductionPct !== null).map(d => d.metrics.reductionPct);
    const avgReduction = validDeltas.length > 0 ? (validDeltas.reduce((acc, v) => acc + v, 0) / validDeltas.length).toFixed(1) : 0;
    if (elements.kpiDeptAvgReduction) elements.kpiDeptAvgReduction.textContent = `${avgReduction}%`;
    if (elements.kpiDeptAvgReductionSub) elements.kpiDeptAvgReductionSub.textContent = `Across ${validDeltas.length} validated baseline departments`;

    const totalActionsCount = ranked.reduce((acc, d) => acc + (d.actions ? d.actions.length : 0), 0);
    if (elements.kpiDeptTotalActions) elements.kpiDeptTotalActions.textContent = totalActionsCount;
    if (elements.kpiDeptTotalActionsSub) elements.kpiDeptTotalActionsSub.textContent = 'Campus-wide energy protocols';

    const leader = ranked[0];
    if (elements.kpiDeptLeading) elements.kpiDeptLeading.textContent = leader ? leader.name : 'N/A';
    if (elements.kpiDeptLeadingSub) elements.kpiDeptLeadingSub.textContent = leader ? `${leader.metrics.totalPoints} Overall Points • Rank #1` : '';

    renderDepartmentLeaderboard(ranked);

    if (!ranked.some(d => d.id === state.deptActiveDeptId)) {
      state.deptActiveDeptId = leader ? leader.id : null;
    }
    renderDepartmentDetailPanel(state.deptActiveDeptId, ranked);
  }

  function renderDepartmentLeaderboard(ranked) {
    if (!elements.deptLeaderboardContainer) return;
    elements.deptLeaderboardContainer.innerHTML = '';

    ranked.forEach(dept => {
      const item = document.createElement('div');
      item.className = `dept-leaderboard-item ${dept.id === state.deptActiveDeptId ? 'active' : ''}`;
      item.dataset.id = dept.id;

      let medalClass = 'default';
      if (dept.rank === 1) medalClass = 'gold';
      else if (dept.rank === 2) medalClass = 'silver';
      else if (dept.rank === 3) medalClass = 'bronze';

      const red = dept.metrics.reductionPct;
      let reductionHtml = '';
      if (red !== null) {
        reductionHtml = `<span class="dept-reduction-badge positive">+${red}%</span>`;
      } else {
        reductionHtml = `<span class="dept-reduction-badge pending">Calibrating</span>`;
      }

      item.innerHTML = `
        <div class="dept-item-left">
          <div class="dept-rank-medal ${medalClass}">#${dept.rank}</div>
          <div class="dept-item-info">
            <div class="dept-item-title-row">
              <span class="dept-code-tag">${escapeHTML(dept.code || '')}</span>
              <strong class="dept-item-name">${escapeHTML(dept.name)}</strong>
            </div>
            <div class="dept-item-sub">${escapeHTML(dept.buildingName || '')} &bull; ${dept.monitoredRoomsCount || 8} Monitored Rooms</div>
          </div>
        </div>

        <div class="dept-item-stats">
          <div class="dept-stat-box">
            <span class="stat-label">Reduction</span>
            ${reductionHtml}
          </div>
          <div class="dept-stat-box">
            <span class="stat-label">Actions</span>
            <strong style="font-size: 13px; color: var(--color-primary);">${dept.metrics.completedActionsCount} Logged</strong>
          </div>
          <div class="dept-stat-box">
            <span class="stat-label">Total Score</span>
            <span class="dept-points-badge">${dept.metrics.totalPoints} pts</span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        state.deptActiveDeptId = dept.id;
        localStorage.setItem(DEPT_STORAGE_KEYS.ACTIVE_DEPT, dept.id);
        renderDepartmentChallengeView();
      });

      elements.deptLeaderboardContainer.appendChild(item);
    });
  }

  function renderDepartmentDetailPanel(deptId, rankedList) {
    const list = rankedList || getRankedDepartments(state.deptActivePeriod || 'month');
    const dept = list.find(d => d.id === deptId) || list[0];
    if (!dept) return;

    if (elements.deptDetailCode) elements.deptDetailCode.textContent = dept.code || '';
    if (elements.deptDetailName) elements.deptDetailName.textContent = dept.name;
    if (elements.deptDetailRankBadge) elements.deptDetailRankBadge.textContent = `Rank #${dept.rank}`;
    if (elements.deptDetailSub) {
      elements.deptDetailSub.textContent = `${dept.buildingName || 'Campus'} • ${dept.facultyHead || 'Faculty Coord'} • ${dept.monitoredRoomsCount || 8} Monitored Rooms`;
    }

    const p = dept.metrics.periodData;
    const red = dept.metrics.reductionPct;

    if (elements.deptDetailReductionTag) {
      if (red !== null) {
        elements.deptDetailReductionTag.textContent = `+${red}% Verified Reduction`;
        elements.deptDetailReductionTag.className = 'dept-reduction-tag';
      } else {
        elements.deptDetailReductionTag.textContent = 'Baseline Telemetry Pending';
        elements.deptDetailReductionTag.className = 'dept-reduction-tag text-muted';
      }
    }

    if (elements.deptDetailBaselineVal) {
      elements.deptDetailBaselineVal.textContent = p.baselineKWh !== null ? `${p.baselineKWh.toLocaleString()} kWh` : 'Pending (Sensor Pilot)';
    }
    if (elements.deptDetailCurrentVal) {
      elements.deptDetailCurrentVal.textContent = p.currentKWh !== null ? `${p.currentKWh.toLocaleString()} kWh` : 'Pending';
    }

    if (elements.deptDetailCurrentBar) {
      if (p.baselineKWh && p.currentKWh) {
        const pct = Math.min(100, Math.round((p.currentKWh / p.baselineKWh) * 100));
        elements.deptDetailCurrentBar.style.width = `${pct}%`;
      } else {
        elements.deptDetailCurrentBar.style.width = '70%';
      }
    }

    if (elements.deptDetailNormalizedBox) {
      if (p.currentPerHour !== null) {
        elements.deptDetailNormalizedBox.innerHTML = `
          <span class="text-muted">Fair Normalized Rate:</span>
          <strong>${p.currentPerHour} kWh / occupied room-hour</strong>
          <span class="text-muted">${p.baselinePerHour ? `(down from ${p.baselinePerHour} baseline)` : '(calibrating baseline)'}</span>
        `;
      } else {
        elements.deptDetailNormalizedBox.innerHTML = `
          <span class="text-muted">Sensor calibration phase: accumulating classroom telemetry.</span>
        `;
      }
    }

    // Points Breakdown
    if (elements.deptPointsReduction) elements.deptPointsReduction.textContent = `+${dept.metrics.reductionPoints} pts`;
    if (elements.deptPointsActions) elements.deptPointsActions.textContent = `+${dept.metrics.actionPoints} pts`;
    if (elements.deptPointsParticipation) elements.deptPointsParticipation.textContent = `+${dept.metrics.participationPoints} pts`;
    if (elements.deptPointsTotal) elements.deptPointsTotal.textContent = `${dept.metrics.totalPoints} pts`;

    // Achievements
    if (elements.deptDetailAchievements) {
      elements.deptDetailAchievements.innerHTML = '';
      if (dept.metrics.achievements.length > 0) {
        dept.metrics.achievements.forEach(a => {
          const pill = document.createElement('span');
          pill.className = `dept-achieve-pill ${a.color}`;
          pill.textContent = a.label;
          pill.title = a.desc;
          elements.deptDetailAchievements.appendChild(pill);
        });
      } else {
        elements.deptDetailAchievements.innerHTML = '<span style="font-size: 11.5px; color: var(--color-text-muted);">No challenge badges unlocked yet for this period.</span>';
      }
    }

    // Actions List
    if (elements.deptActionsList) {
      elements.deptActionsList.innerHTML = '';
      const actions = dept.actions || [];
      if (actions.length > 0) {
        actions.forEach(act => {
          const item = document.createElement('div');
          item.className = `dept-action-item ${act.status || 'completed'}`;
          item.innerHTML = `
            <div class="dept-action-left">
              <div>
                <span class="dept-action-title">${escapeHTML(act.title)}</span>
                <div class="dept-action-meta">
                  <span>${escapeHTML(act.category || 'Initiative')}</span> &bull; 
                  <span>${escapeHTML(act.dateCompleted || 'Logged')}</span> &bull; 
                  <strong style="color: var(--color-primary);">+${act.points || 50} pts</strong>
                </div>
              </div>
            </div>
            <span class="badge ${act.status === 'completed' ? 'badge-success' : 'badge-warning'}" style="font-size: 10px; text-transform: uppercase;">
              ${act.status === 'completed' ? 'Verified' : 'Pending'}
            </span>
          `;
          elements.deptActionsList.appendChild(item);
        });
      } else {
        elements.deptActionsList.innerHTML = '<span style="font-size: 11.5px; color: var(--color-text-muted);">No challenge actions logged yet.</span>';
      }
    }

    // Recommendations List
    if (elements.deptRecommendationsList) {
      elements.deptRecommendationsList.innerHTML = '';
      const recs = dept.recommendations || [
        "Audit after-hours workstation and equipment shutdown compliance.",
        "Implement scheduled setbacks for ventilation during unoccupied intervals."
      ];
      recs.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        elements.deptRecommendationsList.appendChild(li);
      });
    }
  }

  function openRecordActionModal(preselectedDeptId) {
    if (elements.recordActionForm) elements.recordActionForm.reset();
    if (elements.recordActionValidationMsg) elements.recordActionValidationMsg.style.display = 'none';

    if (elements.recordActionDeptSelect && preselectedDeptId) {
      elements.recordActionDeptSelect.value = preselectedDeptId;
    } else if (elements.recordActionDeptSelect && state.deptActiveDeptId) {
      elements.recordActionDeptSelect.value = state.deptActiveDeptId;
    }

    if (elements.recordActionDate) {
      elements.recordActionDate.value = new Date().toISOString().slice(0, 10);
    }
    if (elements.recordActionPoints) {
      elements.recordActionPoints.value = '50';
    }

    if (elements.recordActionModal) elements.recordActionModal.classList.add('active');
  }

  function closeRecordActionModal() {
    if (elements.recordActionModal) elements.recordActionModal.classList.remove('active');
  }

  function submitRecordAction(e) {
    if (e) e.preventDefault();

    const deptId = elements.recordActionDeptSelect ? elements.recordActionDeptSelect.value : '';
    const title = elements.recordActionTitle ? elements.recordActionTitle.value.trim() : '';
    const category = elements.recordActionCategory ? elements.recordActionCategory.value : 'Behavioral Campaign';
    const points = elements.recordActionPoints ? parseInt(elements.recordActionPoints.value, 10) : 50;
    const date = elements.recordActionDate ? elements.recordActionDate.value : '';
    const status = elements.recordActionStatus ? elements.recordActionStatus.value : 'completed';
    const note = elements.recordActionNote ? elements.recordActionNote.value.trim() : '';

    if (!deptId || !title || !date) {
      if (elements.recordActionValidationMsg) {
        elements.recordActionValidationMsg.textContent = 'Please fill in all required fields marked with an asterisk (*).';
        elements.recordActionValidationMsg.style.display = 'block';
      }
      return;
    }

    const dept = (state.deptData || []).find(d => d.id === deptId);
    if (!dept) return;

    if (!dept.actions) dept.actions = [];
    const newAction = {
      id: `ACT-${dept.code || 'DEP'}-${Date.now().toString().slice(-4)}`,
      title: title,
      category: category,
      status: status,
      dateCompleted: date,
      points: points || 50,
      note: note || 'Verified energy challenge initiative.'
    };

    dept.actions.unshift(newAction);
    saveDepartmentChallengeData();
    closeRecordActionModal();
    renderDepartmentChallengeView();
    showToast(`Recorded "${title}" for ${dept.name} (+${newAction.points} pts participation)`, 'success');
  }

  function resetDepartmentChallengeDemo() {
    if (window.SCEO_DATA && SCEO_DATA.departmentChallengeModule && SCEO_DATA.departmentChallengeModule.departments) {
      state.deptData = JSON.parse(JSON.stringify(SCEO_DATA.departmentChallengeModule.departments));
    } else {
      state.deptData = [];
    }
    localStorage.removeItem(DEPT_STORAGE_KEYS.DEPARTMENTS);
    renderDepartmentChallengeView();
    if (elements.resetDeptConfirmModal) elements.resetDeptConfirmModal.classList.remove('active');
    showToast('Department Challenge data restored to demo baseline', 'info');
  }

  /* ==========================================================================
     STEP 8: SAVINGS REPORTS & SETTINGS LOGIC
     ========================================================================== */

  /**
   * Load and Initialize Settings Data from LocalStorage
   */
  function initSettingsData() {
    try {
      const storedTariff = localStorage.getItem(SETTINGS_STORAGE_KEYS.TARIFF);
      if (storedTariff !== null && !isNaN(parseFloat(storedTariff))) {
        state.tariffUSD = parseFloat(storedTariff);
      } else if (SCEO_DATA.metadata && SCEO_DATA.metadata.electricityRateUSD) {
        state.tariffUSD = SCEO_DATA.metadata.electricityRateUSD;
      }

      const storedDemand = localStorage.getItem(SETTINGS_STORAGE_KEYS.DEMAND);
      if (storedDemand !== null && !isNaN(parseFloat(storedDemand))) {
        state.demandChargeUSD = parseFloat(storedDemand);
      }

      const storedCarbon = localStorage.getItem(SETTINGS_STORAGE_KEYS.CARBON);
      if (storedCarbon !== null && !isNaN(parseFloat(storedCarbon))) {
        state.carbonFactor = parseFloat(storedCarbon);
      }

      // Synchronize Classroom Analytics estimator tariff with active settings tariff
      if (elements.estTariff) {
        elements.estTariff.value = state.tariffUSD.toFixed(2);
      }
    } catch (e) {
      console.warn('Error initializing settings:', e);
    }
  }

  /**
   * Render Settings View Controls
   */
  function renderSettingsView() {
    if (elements.settingTariffInput) {
      elements.settingTariffInput.value = state.tariffUSD.toFixed(2);
    }
    if (elements.settingDemandInput) {
      elements.settingDemandInput.value = state.demandChargeUSD.toFixed(2);
    }
    if (elements.settingCarbonInput) {
      elements.settingCarbonInput.value = state.carbonFactor.toFixed(2);
    }
  }

  /**
   * Save Financial and Utility Rate Settings
   */
  function saveSettings(e) {
    if (e) e.preventDefault();
    if (!elements.settingTariffInput) return;

    const newTariff = parseFloat(elements.settingTariffInput.value);
    const newDemand = parseFloat(elements.settingDemandInput ? elements.settingDemandInput.value : '14.50');
    const newCarbon = parseFloat(elements.settingCarbonInput ? elements.settingCarbonInput.value : '0.42');

    if (isNaN(newTariff) || newTariff <= 0) {
      showToast('Please enter a valid positive electricity tariff ($/kWh)', 'warning');
      return;
    }

    state.tariffUSD = Math.round(newTariff * 100) / 100;
    state.demandChargeUSD = Math.round(newDemand * 100) / 100;
    state.carbonFactor = Math.round(newCarbon * 100) / 100;

    localStorage.setItem(SETTINGS_STORAGE_KEYS.TARIFF, state.tariffUSD.toString());
    localStorage.setItem(SETTINGS_STORAGE_KEYS.DEMAND, state.demandChargeUSD.toString());
    localStorage.setItem(SETTINGS_STORAGE_KEYS.CARBON, state.carbonFactor.toString());

    // Update displays across modules
    if (elements.reportsCurrentTariffDisplay) {
      elements.reportsCurrentTariffDisplay.textContent = `$${state.tariffUSD.toFixed(2)} / kWh`;
    }
    if (elements.estTariff) {
      elements.estTariff.value = state.tariffUSD.toFixed(2);
      calculateSavingOpportunity();
    }

    showToast(`Financial settings saved. Active tariff: $${state.tariffUSD.toFixed(2)}/kWh`, 'success');

    // Re-render overview KPIs & reports if initialized
    updateKPIs();
    if (state.currentView === 'savings-reports') {
      renderSavingsReportsView();
    }
  }

  /**
   * Reset Tariff Rates to Default ($0.18/kWh)
   */
  function resetTariffDefaults() {
    state.tariffUSD = 0.18;
    state.demandChargeUSD = 14.50;
    state.carbonFactor = 0.42;

    localStorage.removeItem(SETTINGS_STORAGE_KEYS.TARIFF);
    localStorage.removeItem(SETTINGS_STORAGE_KEYS.DEMAND);
    localStorage.removeItem(SETTINGS_STORAGE_KEYS.CARBON);

    renderSettingsView();
    if (elements.reportsCurrentTariffDisplay) {
      elements.reportsCurrentTariffDisplay.textContent = `$${state.tariffUSD.toFixed(2)} / kWh`;
    }
    if (elements.estTariff) {
      elements.estTariff.value = state.tariffUSD.toFixed(2);
      calculateSavingOpportunity();
    }
    updateKPIs();
    showToast('Utility rates reset to default baseline ($0.18/kWh)', 'info');
  }

  /**
   * Master Reset Modal Handlers
   */
  function openResetAllModal() {
    if (elements.resetAllDemoConfirmModal) {
      elements.resetAllDemoConfirmModal.classList.add('active');
    }
  }

  function closeResetAllModal() {
    if (elements.resetAllDemoConfirmModal) {
      elements.resetAllDemoConfirmModal.classList.remove('active');
    }
  }

  /**
   * Master Reset: Revert All Demo State to Baseline
   */
  function confirmResetAllDemoData() {
    // Clear all SCEO local storage keys
    const sceoKeys = [
      TT_STORAGE_KEYS.ACCEPTED,
      TT_STORAGE_KEYS.DISMISSED,
      ALERT_STORAGE_KEYS.STATUSES,
      ALERT_STORAGE_KEYS.DYNAMIC,
      SC_STORAGE_KEYS.ROOMS,
      SC_STORAGE_KEYS.LOGS,
      SC_STORAGE_KEYS.SAVINGS,
      SC_STORAGE_KEYS.MODE,
      MAINT_STORAGE_KEYS.TASKS,
      MAINT_STORAGE_KEYS.VIEW_MODE,
      DEPT_STORAGE_KEYS.DEPARTMENTS,
      DEPT_STORAGE_KEYS.PERIOD,
      DEPT_STORAGE_KEYS.ACTIVE_DEPT,
      SETTINGS_STORAGE_KEYS.TARIFF,
      SETTINGS_STORAGE_KEYS.DEMAND,
      SETTINGS_STORAGE_KEYS.CARBON
    ];

    sceoKeys.forEach(k => localStorage.removeItem(k));

    // Reset State
    state.acceptedSuggestions = new Set();
    state.dismissedSuggestions = new Set();
    state.alertStatuses = {};
    state.generatedDynamicAlerts = [];
    state.tariffUSD = 0.18;
    state.demandChargeUSD = 14.50;
    state.carbonFactor = 0.42;

    initSmartControlsData();
    initMaintenanceData();
    initDepartmentChallengeData();

    closeResetAllModal();

    // Re-render current active view and overview
    updateKPIs();
    if (state.currentView === 'overview') {
      renderRecentAlerts();
      renderBuildingsTable();
      renderPriorityActions();
    } else if (state.currentView === 'savings-reports') {
      renderSavingsReportsView();
    } else if (state.currentView === 'settings') {
      renderSettingsView();
    } else if (state.currentView === 'smart-controls') {
      renderSmartControls();
    } else if (state.currentView === 'maintenance') {
      renderMaintenanceView();
    } else if (state.currentView === 'dept-challenge') {
      renderDepartmentChallengeView();
    } else if (state.currentView === 'alerts-actions') {
      renderAlertsAndActions();
    } else if (state.currentView === 'timetable-optimizer') {
      renderTimetableOptimizer();
    }

    showToast('Master reset completed. All demo data restored to factory baseline.', 'info');
  }

  /**
   * Load Sample Anomaly Scenario (for Walkthrough Evaluation)
   */
  function loadSampleAnomalyScenario() {
    // 1. In Smart Controls: set ENG-101 and SCI-201 to high waste condition (empty, AC on, no override)
    const eng101 = state.scRoomsData.find(r => r.roomId === 'ENG-101');
    if (eng101) {
      eng101.occupied = false;
      eng101.override = false;
      const ac = eng101.devices.find(d => d.type === 'air_conditioner');
      if (ac) {
        ac.state = true;
        ac.countdown = 4;
      }
    }
    const sci201 = state.scRoomsData.find(r => r.roomId === 'SCI-201');
    if (sci201) {
      sci201.occupied = false;
      sci201.override = false;
      const ac = sci201.devices.find(d => d.type === 'air_conditioner');
      if (ac) {
        ac.state = true;
        ac.countdown = 4;
      }
    }
    saveSmartControlsState();

    // 2. In Maintenance: set EQ-ENG-101-AC1 to Urgent Review
    const maint1 = state.maintTasks.find(t => t.id === 'EQ-ENG-101-AC1');
    if (maint1) {
      maint1.condition = 'urgent_review';
      maint1.priority = 'critical';
      maint1.status = 'open';
    }
    saveMaintenanceTasks();

    // 3. Log a scenario event
    addSimulationLog('ANOMALY_TRIGGER', 'Sample Anomaly Scenario: Unoccupied HVAC running detected in ENG-101 and SCI-201.');

    showToast('Sample anomaly scenario injected into Engineering & Science facilities.', 'warning');

    // Refresh active view
    if (state.currentView === 'smart-controls') renderSmartControls();
    if (state.currentView === 'maintenance') renderMaintenanceView();
    if (state.currentView === 'savings-reports') renderSavingsReportsView();
  }

  /**
   * Date Button Synchronization for Savings Reports
   */
  function syncReportsDateButtons() {
    if (elements.reportsBtnRange7d) {
      elements.reportsBtnRange7d.classList.toggle('active', state.reportsDateRange === '7d');
    }
    if (elements.reportsBtnRange30d) {
      elements.reportsBtnRange30d.classList.toggle('active', state.reportsDateRange === '30d');
    }
    if (elements.reportsBtnRangeCustom) {
      elements.reportsBtnRangeCustom.classList.toggle('active', state.reportsDateRange === 'custom');
    }
    if (elements.reportsCustomDateWrap) {
      elements.reportsCustomDateWrap.style.display = state.reportsDateRange === 'custom' ? 'block' : 'none';
    }
  }

  /**
   * Render Savings Reports Page
   */
  function renderSavingsReportsView() {
    // 1. Calculate Aggregated Consumption & Potential Savings for Selected Scope
    let totalKWh = 0;
    let avoidableKWh = 0;
    const is30d = state.reportsDateRange === '30d' || state.reportsDateRange === 'custom';

    if (state.reportsBuildingFilter === 'all') {
      SCEO_DATA.buildings.forEach(b => {
        const kpi = is30d ? b.kpi30Days : b.kpi7Days;
        totalKWh += kpi.totalKWh;
        avoidableKWh += kpi.potentialSavingsKWh;
      });
    } else {
      const bldg = SCEO_DATA.buildings.find(b => b.id === state.reportsBuildingFilter);
      if (bldg) {
        const kpi = is30d ? bldg.kpi30Days : bldg.kpi7Days;
        totalKWh = kpi.totalKWh;
        avoidableKWh = kpi.potentialSavingsKWh;
      }
    }

    // 2. Simulated Savings from Smart Controls Engine
    const simulatedKWh = state.scRealizedSavingsKWh || 0.0;
    const costSavings = avoidableKWh * state.tariffUSD;

    // 3. Update Summary KPI Cards
    if (elements.reportsKpiTotalEnergy) {
      elements.reportsKpiTotalEnergy.textContent = formatNumber(totalKWh);
    }
    if (elements.reportsKpiTotalEnergySub) {
      const scopeLabel = state.reportsBuildingFilter === 'all' ? 'Campus-wide' : `${capitalizeFirst(state.reportsBuildingFilter)} Building`;
      const periodLabel = is30d ? '30-day period' : '7-day period';
      elements.reportsKpiTotalEnergySub.textContent = `${scopeLabel} demo sub-meter readings over ${periodLabel}`;
    }

    if (elements.reportsKpiAvoidableEnergy) {
      elements.reportsKpiAvoidableEnergy.textContent = formatNumber(avoidableKWh);
    }
    if (elements.reportsKpiAvoidableEnergySub) {
      const pct = totalKWh > 0 ? ((avoidableKWh / totalKWh) * 100).toFixed(1) : '0.0';
      elements.reportsKpiAvoidableEnergySub.textContent = `${pct}% of consumption • Standby draw during unoccupied hours`;
    }

    if (elements.reportsKpiSimulatedEnergy) {
      elements.reportsKpiSimulatedEnergy.textContent = simulatedKWh.toFixed(1);
    }
    if (elements.reportsKpiSimulatedEnergySub) {
      elements.reportsKpiSimulatedEnergySub.textContent = `Realized via Smart Controls simulator actions ($${(simulatedKWh * state.tariffUSD).toFixed(2)} modeled)`;
    }

    if (elements.reportsKpiCostSavings) {
      elements.reportsKpiCostSavings.textContent = `$${costSavings.toFixed(2)}`;
    }
    if (elements.reportsKpiCostSavingsSub) {
      elements.reportsKpiCostSavingsSub.textContent = `Calculated at active demo tariff ($${state.tariffUSD.toFixed(2)}/kWh)`;
    }

    if (elements.reportsCurrentTariffDisplay) {
      elements.reportsCurrentTariffDisplay.textContent = `$${state.tariffUSD.toFixed(2)} / kWh`;
    }

    // 4. Render Components
    renderSavingsTrendChart();
    renderBuildingPerformanceTable();
    renderClassroomSavingsTable();
  }

  /**
   * Render Energy Consumption & Baseline Trend Chart (Chart.js)
   */
  function renderSavingsTrendChart() {
    if (!elements.savingsTrendChartCanvas) return;

    // Destroy existing chart instance to prevent memory leaks
    if (state.savingsTrendChart) {
      try {
        state.savingsTrendChart.destroy();
      } catch (e) {
        console.warn('Error destroying savingsTrendChart:', e);
      }
      state.savingsTrendChart = null;
    }

    if (!state.chartJsAvailable) {
      if (elements.savingsChartFallback) elements.savingsChartFallback.style.display = 'block';
      return;
    }
    if (elements.savingsChartFallback) elements.savingsChartFallback.style.display = 'none';

    const is30d = state.reportsDateRange === '30d' || state.reportsDateRange === 'custom';
    let labels = [];
    let activeData = [];
    let baselineData = [];

    if (!is30d) {
      // 7 Days
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (state.reportsBuildingFilter === 'engineering') {
        activeData = [152, 168, 174, 160, 165, 148, 153];
        baselineData = [142, 148, 150, 146, 148, 125, 128];
      } else if (state.reportsBuildingFilter === 'science') {
        activeData = [112, 124, 128, 118, 122, 106, 110];
        baselineData = [105, 112, 115, 110, 112, 94, 98];
      } else if (state.reportsBuildingFilter === 'business') {
        activeData = [74, 81, 82, 78, 79, 72, 74];
        baselineData = [68, 74, 75, 72, 74, 62, 64];
      } else {
        // All Campus
        activeData = [338, 373, 384, 356, 366, 326, 337];
        baselineData = [315, 334, 340, 328, 334, 281, 290];
      }
    } else {
      // 30 Days
      labels = Array.from({ length: 30 }, (_, i) => `Oct ${i + 1}`);
      if (state.reportsBuildingFilter === 'engineering') {
        activeData = SCEO_DATA.buildings[0].dailyReadings30Days;
        baselineData = activeData.map(v => Math.round(v * 0.90));
      } else if (state.reportsBuildingFilter === 'science') {
        activeData = SCEO_DATA.buildings[1].dailyReadings30Days;
        baselineData = activeData.map(v => Math.round(v * 0.92));
      } else if (state.reportsBuildingFilter === 'business') {
        activeData = SCEO_DATA.buildings[2].dailyReadings30Days;
        baselineData = activeData.map(v => Math.round(v * 0.93));
      } else {
        activeData = SCEO_DATA.dailyAggregated30Days;
        baselineData = activeData.map(v => Math.round(v * 0.91));
      }
    }

    const ctx = elements.savingsTrendChartCanvas.getContext('2d');
    state.savingsTrendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: 'Target Baseline (kWh)',
            data: baselineData,
            borderColor: '#647789',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: is30d ? 2 : 4,
            pointBackgroundColor: '#647789',
            fill: false,
            tension: 0.25,
            order: 1
          },
          {
            type: 'bar',
            label: 'Active Energy Consumption (kWh)',
            data: activeData,
            backgroundColor: 'rgba(22, 140, 134, 0.85)',
            hoverBackgroundColor: '#168C86',
            borderRadius: 4,
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false // Displayed in custom HTML legend
          },
          tooltip: {
            backgroundColor: '#183B56',
            titleColor: '#F8FAFC',
            bodyColor: '#E2E8F0',
            borderColor: '#183B56',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function(context) {
                const val = context.parsed.y;
                return `${context.dataset.label}: ${val} kWh`;
              },
              afterBody: function(contexts) {
                if (contexts.length >= 2) {
                  const baseline = contexts[0].parsed.y;
                  const active = contexts[1].parsed.y;
                  const delta = active - baseline;
                  const sign = delta > 0 ? '+' : '';
                  return [`Delta vs Baseline: ${sign}${delta} kWh`];
                }
                return [];
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
              color: '#647789',
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: '#E1E8EE'
            },
            ticks: {
              color: '#647789',
              font: {
                size: 11
              },
              callback: function(val) {
                return `${val} kWh`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Render Building Performance Report Table
   */
  function renderBuildingPerformanceTable() {
    if (!elements.reportsBuildingTableBody) return;

    const is30d = state.reportsDateRange === '30d' || state.reportsDateRange === 'custom';

    // Build building records
    let records = SCEO_DATA.buildings.map(b => {
      const kpi = is30d ? b.kpi30Days : b.kpi7Days;
      // Calculate occupied hours from classroom aggregation
      const rooms = SCEO_DATA.classrooms.filter(r => r.buildingId === b.id);
      const totalOccHours = rooms.reduce((acc, r) => {
        const periodData = is30d ? r.thirtyDays : r.sevenDays;
        return acc + (periodData ? periodData.occupiedHours : 0);
      }, 0);

      const intensity = totalOccHours > 0 ? (kpi.totalKWh / totalOccHours) : 0;
      const avoidable = kpi.potentialSavingsKWh;
      const cost = avoidable * state.tariffUSD;

      let confidence = 'High (Sub-metered IoT)';
      let confBadgeClass = 'badge-demo';
      if (b.id === 'science') {
        confidence = 'High (Sub-metered + Labs)';
        confBadgeClass = 'badge-demo';
      } else if (b.id === 'business') {
        confidence = 'Medium (Schedule Inferred)';
        confBadgeClass = 'badge-potential';
      }

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        totalRooms: b.totalRooms,
        totalKWh: kpi.totalKWh,
        occupiedHours: totalOccHours,
        intensity: intensity,
        avoidableKWh: avoidable,
        wastePercent: kpi.totalKWh > 0 ? ((avoidable / kpi.totalKWh) * 100).toFixed(1) : '0.0',
        costUSD: cost,
        confidence: confidence,
        confBadgeClass: confBadgeClass
      };
    });

    // Filter if specific building selected
    if (state.reportsBuildingFilter !== 'all') {
      records = records.filter(r => r.id === state.reportsBuildingFilter);
    }

    // Sort records
    records.sort((a, b) => {
      let valA, valB;
      if (state.reportsBldgSortCol === 'consumption') {
        valA = a.totalKWh; valB = b.totalKWh;
      } else if (state.reportsBldgSortCol === 'intensity') {
        valA = a.intensity; valB = b.intensity;
      } else if (state.reportsBldgSortCol === 'avoidable') {
        valA = a.avoidableKWh; valB = b.avoidableKWh;
      } else if (state.reportsBldgSortCol === 'hours') {
        valA = a.occupiedHours; valB = b.occupiedHours;
      } else {
        valA = a.name; valB = b.name;
        return state.reportsBldgSortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return state.reportsBldgSortDir === 'asc' ? valA - valB : valB - valA;
    });

    if (records.length === 0) {
      elements.reportsBuildingTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-table-cell" style="text-align: center; padding: 24px; color: var(--color-text-muted);">
            No building performance records match the active filter.
          </td>
        </tr>
      `;
      return;
    }

    elements.reportsBuildingTableBody.innerHTML = records.map(r => `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--color-text-main);">${escapeHTML(r.name)}</div>
          <div style="font-size: 11.5px; color: var(--color-text-muted);">${r.totalRooms} Monitored Rooms • Code: ${r.code}</div>
        </td>
        <td style="font-weight: 600;">${formatNumber(r.totalKWh)} kWh</td>
        <td>${r.occupiedHours} hrs</td>
        <td>
          <span style="font-weight: 600; color: var(--color-primary);">${r.intensity.toFixed(2)}</span>
          <span style="font-size: 11px; color: var(--color-text-muted);"> kWh/hr</span>
        </td>
        <td>
          <span class="text-danger" style="font-weight: 700;">${formatNumber(r.avoidableKWh)} kWh</span>
          <span style="font-size: 11px; color: var(--color-text-muted);"> (${r.wastePercent}%)</span>
        </td>
        <td style="font-weight: 600; color: var(--color-text-main);">$${r.costUSD.toFixed(2)}</td>
        <td>
          <span class="stat-source-badge ${r.confBadgeClass}">${escapeHTML(r.confidence)}</span>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Render Classroom Savings Opportunities Report Table
   */
  function renderClassroomSavingsTable() {
    if (!elements.reportsClassroomTableBody) return;

    const is30d = state.reportsDateRange === '30d' || state.reportsDateRange === 'custom';
    const query = state.reportsClassroomSearch.toLowerCase().trim();

    let rooms = SCEO_DATA.classrooms.map(r => {
      const p = is30d ? r.thirtyDays : r.sevenDays;
      const totalKWh = p ? p.totalKWh : 0;
      const occupiedHours = p ? p.occupiedHours : 0;
      const intensity = p ? p.kwhPerOccupiedHour : (occupiedHours > 0 ? totalKWh / occupiedHours : 0);
      const avoidableKWh = p ? p.estimatedWasteKWh : 0;
      const wastePct = p ? p.wastePercentage : 0;
      const costUSD = avoidableKWh * state.tariffUSD;
      const action = (p && p.recommendedActions && p.recommendedActions.length > 0) 
        ? p.recommendedActions[0] 
        : 'Inspect after-hours baseline and calibrate sensors.';

      let confidence = 'High (Sub-meter + PIR)';
      if (r.roomType.toLowerCase().includes('seminar') || r.roomType.toLowerCase().includes('case')) {
        confidence = 'Medium (Schedule Inferred)';
      }

      return {
        id: r.id,
        name: r.name,
        buildingId: r.buildingId,
        buildingName: r.buildingName,
        roomType: r.roomType,
        capacity: r.capacity,
        totalKWh: totalKWh,
        occupiedHours: occupiedHours,
        intensity: intensity,
        avoidableKWh: avoidableKWh,
        wastePct: wastePct,
        costUSD: costUSD,
        action: action,
        confidence: confidence
      };
    });

    // 1. Filter by Building
    if (state.reportsBuildingFilter !== 'all') {
      rooms = rooms.filter(r => r.buildingId === state.reportsBuildingFilter);
    }

    // 2. Filter by Search Query
    if (query) {
      rooms = rooms.filter(r => 
        r.id.toLowerCase().includes(query) ||
        r.name.toLowerCase().includes(query) ||
        r.buildingName.toLowerCase().includes(query) ||
        r.roomType.toLowerCase().includes(query) ||
        r.action.toLowerCase().includes(query)
      );
    }

    // 3. Sort Rooms
    rooms.sort((a, b) => {
      if (state.reportsClassroomSort === 'avoidable_desc') {
        return b.avoidableKWh - a.avoidableKWh;
      } else if (state.reportsClassroomSort === 'intensity_desc') {
        return b.intensity - a.intensity;
      } else if (state.reportsClassroomSort === 'consumption_desc') {
        return b.totalKWh - a.totalKWh;
      } else if (state.reportsClassroomSort === 'hours_desc') {
        return b.occupiedHours - a.occupiedHours;
      } else if (state.reportsClassroomSort === 'id_asc') {
        return a.id.localeCompare(b.id);
      }
      return b.avoidableKWh - a.avoidableKWh;
    });

    // Update count badge
    if (elements.reportsClassroomCountBadge) {
      elements.reportsClassroomCountBadge.textContent = `${rooms.length} Rooms`;
    }

    if (rooms.length === 0) {
      elements.reportsClassroomTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-table-cell" style="text-align: center; padding: 24px; color: var(--color-text-muted);">
            No classrooms match your search and filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    elements.reportsClassroomTableBody.innerHTML = rooms.map(r => `
      <tr>
        <td>
          <span class="room-id-tag font-bold" style="font-size: 12.5px;">${escapeHTML(r.id)}</span>
          <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">${escapeHTML(r.roomType)} (${r.capacity} seats)</div>
        </td>
        <td>
          <span style="font-size: 12.5px; font-weight: 500;">${escapeHTML(r.buildingName)}</span>
        </td>
        <td style="font-weight: 600;">${formatNumber(r.totalKWh)} kWh</td>
        <td>${r.occupiedHours} hrs</td>
        <td>
          <span style="font-weight: 600; color: var(--color-primary);">${r.intensity.toFixed(1)}</span>
          <span style="font-size: 11px; color: var(--color-text-muted);"> kWh/hr</span>
        </td>
        <td>
          <span class="text-danger" style="font-weight: 700;">${r.avoidableKWh} kWh</span>
          <span style="font-size: 11px; color: var(--color-text-muted);"> (${r.wastePct}%)</span>
        </td>
        <td style="max-width: 280px;">
          <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.4;" title="${escapeHTML(r.action)}">
            ${escapeHTML(r.action)}
          </div>
        </td>
        <td>
          <span class="stat-source-badge ${r.confidence.includes('High') ? 'badge-demo' : 'badge-potential'}">${escapeHTML(r.confidence)}</span>
        </td>
        <td style="text-align: right;">
          <div class="table-action-group">
            <button type="button" class="deep-link-btn btn-reports-analytics" data-room-id="${escapeHTML(r.id)}" title="Open Classroom Analytics">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10M6 10h10M6 14h6"></path></svg>
              <span>Analytics</span>
            </button>
            <button type="button" class="deep-link-btn btn-reports-heatmap" data-room-id="${escapeHTML(r.id)}" title="Locate in Energy Heatmap">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              <span>Heatmap</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Helper: Escape and Format Cell for RFC 4180 CSV Export
   */
  function formatCSVCell(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }
    return `"${str}"`;
  }

  /**
   * Generic Browser-Based CSV Generator and Downloader (Blob & Object URL)
   */
  function generateCSV(headers, rows, filename) {
    try {
      if (!rows || rows.length === 0) {
        showToast(`No records available to export for ${filename}`, 'warning');
        return;
      }

      const headerLine = headers.map(formatCSVCell).join(',');
      const rowLines = rows.map(r => r.map(formatCSVCell).join(','));
      // Prepend UTF-8 Byte Order Mark (\uFEFF) for Microsoft Excel compatibility
      const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up memory
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      showToast(`Exported ${filename} (${rows.length} records)`, 'success');
    } catch (e) {
      console.error('CSV Generation Error:', e);
      showToast('Error generating CSV file in browser.', 'danger');
    }
  }

  /**
   * 1. Export Building Performance CSV
   */
  function exportBuildingsCSV() {
    const is30d = state.reportsDateRange === '30d' || state.reportsDateRange === 'custom';
    const periodLabel = is30d ? 'Last 30 Days' : 'Last 7 Days';
    const headers = [
      'Building ID', 'Building Name', 'Building Code', 'Reporting Period',
      'Total Energy (kWh)', 'Occupied Hours (hrs)', 'Energy Intensity (kWh/hr)',
      'Estimated Avoidable Energy (kWh)', 'Waste Percentage (%)', 'Estimated Cost ($)',
      'Data Quality Standard'
    ];

    let bldgs = SCEO_DATA.buildings;
    if (state.reportsBuildingFilter !== 'all') {
      bldgs = bldgs.filter(b => b.id === state.reportsBuildingFilter);
    }

    const rows = bldgs.map(b => {
      const kpi = is30d ? b.kpi30Days : b.kpi7Days;
      const rooms = SCEO_DATA.classrooms.filter(r => r.buildingId === b.id);
      const totalOccHours = rooms.reduce((acc, r) => {
        const periodData = is30d ? r.thirtyDays : r.sevenDays;
        return acc + (periodData ? periodData.occupiedHours : 0);
      }, 0);
      const intensity = totalOccHours > 0 ? (kpi.totalKWh / totalOccHours).toFixed(2) : '0.00';
      const avoidable = kpi.potentialSavingsKWh;
      const cost = (avoidable * state.tariffUSD).toFixed(2);
      const pct = kpi.totalKWh > 0 ? ((avoidable / kpi.totalKWh) * 100).toFixed(1) : '0.0';

      return [
        b.id,
        b.name,
        b.code,
        periodLabel,
        kpi.totalKWh,
        totalOccHours,
        intensity,
        avoidable,
        pct,
        cost,
        b.id === 'business' ? 'Medium (Schedule Inferred)' : 'High (Sub-metered IoT)'
      ];
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    generateCSV(headers, rows, `sceo-building-performance-${dateStamp}.csv`);
  }

  /**
   * 2. Export Classroom Savings Opportunities CSV
   */
  function exportClassroomsCSV() {
    const is30d = state.reportsDateRange === '30d' || state.reportsDateRange === 'custom';
    const periodLabel = is30d ? 'Last 30 Days' : 'Last 7 Days';
    const headers = [
      'Classroom ID', 'Room Name', 'Building ID', 'Building Name',
      'Room Type', 'Capacity (Seats)', 'Reporting Period', 'Total Consumption (kWh)',
      'Occupied Hours (hrs)', 'Energy per Occupied Hr (kWh/hr)', 'Avoidable Energy (kWh)',
      'Waste Percentage (%)', 'Estimated Cost ($)', 'Recommended Remediation', 'Confidence Label'
    ];

    let rooms = SCEO_DATA.classrooms;
    if (state.reportsBuildingFilter !== 'all') {
      rooms = rooms.filter(r => r.buildingId === state.reportsBuildingFilter);
    }

    const rows = rooms.map(r => {
      const p = is30d ? r.thirtyDays : r.sevenDays;
      const totalKWh = p ? p.totalKWh : 0;
      const occupiedHours = p ? p.occupiedHours : 0;
      const intensity = p ? p.kwhPerOccupiedHour.toFixed(2) : '0.00';
      const avoidable = p ? p.estimatedWasteKWh : 0;
      const pct = p ? p.wastePercentage : 0;
      const cost = (avoidable * state.tariffUSD).toFixed(2);
      const action = (p && p.recommendedActions && p.recommendedActions.length > 0) ? p.recommendedActions[0] : 'Audit baseline standby draw';
      const conf = r.roomType.toLowerCase().includes('seminar') ? 'Medium (Schedule Inferred)' : 'High (Sub-meter + PIR)';

      return [
        r.id,
        r.name,
        r.buildingId,
        r.buildingName,
        r.roomType,
        r.capacity,
        periodLabel,
        totalKWh,
        occupiedHours,
        intensity,
        avoidable,
        pct,
        cost,
        action,
        conf
      ];
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    generateCSV(headers, rows, `sceo-classroom-savings-${dateStamp}.csv`);
  }

  /**
   * 3. Export Alert Records CSV
   */
  function exportAlertsCSV() {
    const alerts = getAllAlerts();
    const headers = [
      'Alert ID', 'Classroom ID', 'Building Name', 'Category',
      'Severity', 'Triage Status', 'Timestamp', 'Measured Power (kW)',
      'Baseline Standby (kW)', 'Estimated Avoidable Energy (kWh)', 'Estimated Cost ($)',
      'Rule Triggered', 'Recommended Remediation'
    ];

    const rows = alerts.map(a => [
      a.id,
      a.room,
      a.building,
      a.category,
      a.severity.toUpperCase(),
      (state.alertStatuses[a.id] || a.status).toUpperCase(),
      a.timestamp,
      a.powerKW,
      a.baselineKW,
      a.avoidableKWh,
      `$${a.estimatedCost.toFixed(2)}`,
      a.ruleTriggered || 'Threshold Exceeded',
      a.recommendedAction
    ]);

    const dateStamp = new Date().toISOString().slice(0, 10);
    generateCSV(headers, rows, `sceo-alert-records-${dateStamp}.csv`);
  }

  /**
   * 4. Export Maintenance Records CSV
   */
  function exportMaintenanceCSV() {
    const headers = [
      'Equipment ID', 'Equipment Name', 'Equipment Type', 'Classroom Location',
      'Building Name', 'Diagnostic Condition', 'Priority Level', 'Work Order Status',
      'Diagnostic Issue', 'Telemetry Trigger', 'Recommended Remediation',
      'Assigned Team', 'Target Date', 'Last Maintained Date'
    ];

    const rows = state.maintTasks.map(t => [
      t.id,
      t.name,
      t.type,
      t.room,
      t.building,
      t.condition,
      t.priority,
      t.status,
      t.issue,
      t.reason,
      t.recommendedAction,
      t.assignedTeam,
      t.targetDate,
      t.lastMaintainedDate
    ]);

    const dateStamp = new Date().toISOString().slice(0, 10);
    generateCSV(headers, rows, `sceo-maintenance-records-${dateStamp}.csv`);
  }

  /**
   * 5. Export Department Challenge CSV
   */
  function exportDepartmentChallengeCSV() {
    const ranked = getRankedDepartments();
    const headers = [
      'Rank', 'Department ID', 'Department Name', 'Building Scope',
      'Baseline Energy (kWh)', 'Current Energy (kWh)', 'Reduction Delta (kWh)',
      'Reduction Percentage (%)', 'Occupied Hours (hrs)', 'Normalized Energy (kWh/hr)',
      'Logged Actions Count', 'Total Challenge Points', 'Standing Rating'
    ];

    const rows = ranked.map(d => [
      d.rank,
      d.id,
      d.name,
      d.building,
      d.baselineKWh !== null ? d.baselineKWh : 'N/A (No Baseline)',
      d.currentKWh,
      d.reductionKWh !== null ? d.reductionKWh : 'N/A',
      d.reductionPercent !== null ? `${d.reductionPercent}%` : 'N/A',
      d.occupiedHours,
      d.intensityPerHour.toFixed(2),
      d.actionsCount,
      d.points.total,
      d.rankBadge
    ]);

    const dateStamp = new Date().toISOString().slice(0, 10);
    generateCSV(headers, rows, `sceo-department-challenge-${dateStamp}.csv`);
  }

  /**
   * 6. Export Overall Savings Summary CSV
   */
  function exportSavingsSummaryCSV() {
    const is30d = state.reportsDateRange === '30d' || state.reportsDateRange === 'custom';
    const periodLabel = is30d ? 'Last 30 Days' : 'Last 7 Days';
    const bldgScope = state.reportsBuildingFilter === 'all' ? 'All Campus Facilities' : `${capitalizeFirst(state.reportsBuildingFilter)} Building`;

    let totalKWh = 0;
    let avoidableKWh = 0;
    if (state.reportsBuildingFilter === 'all') {
      SCEO_DATA.buildings.forEach(b => {
        const kpi = is30d ? b.kpi30Days : b.kpi7Days;
        totalKWh += kpi.totalKWh;
        avoidableKWh += kpi.potentialSavingsKWh;
      });
    } else {
      const bldg = SCEO_DATA.buildings.find(b => b.id === state.reportsBuildingFilter);
      if (bldg) {
        const kpi = is30d ? bldg.kpi30Days : bldg.kpi7Days;
        totalKWh = kpi.totalKWh;
        avoidableKWh = kpi.potentialSavingsKWh;
      }
    }

    const headers = ['Executive Parameter', 'Measured Value / Modeling Standard', 'Providence / Category'];
    const rows = [
      ['Campus Entity', SCEO_DATA.metadata.campusName || 'Northfield University', 'Institutional Scope'],
      ['Report Title', 'SCEO Energy Savings & Optimization Audit Summary', 'Audit Deliverable'],
      ['Report Generation Date', new Date().toLocaleString(), 'System Audit Timestamp'],
      ['Reporting Scope', bldgScope, 'Spatial Filtering'],
      ['Reporting Period', periodLabel, 'Temporal Filtering'],
      ['Active Electricity Tariff', `$${state.tariffUSD.toFixed(2)} / kWh`, 'Financial Rate Assumption'],
      ['Total Energy Consumption', `${formatNumber(totalKWh)} kWh`, 'Category 1: Demo Sub-meter Readings'],
      ['Estimated Avoidable Energy', `${formatNumber(avoidableKWh)} kWh (${totalKWh > 0 ? ((avoidableKWh / totalKWh) * 100).toFixed(1) : 0}%)`, 'Category 2: Algorithmic Waste Potential'],
      ['Simulated Controls Saved', `${state.scRealizedSavingsKWh.toFixed(1)} kWh`, 'Category 3: In-Browser Smart Controls Realized'],
      ['Estimated Avoidable Cost', `$${(avoidableKWh * state.tariffUSD).toFixed(2)}`, 'Financial Avoidance Estimation'],
      ['Simulated Cost Avoided', `$${state.scRealizedSavingsCost.toFixed(2)}`, 'Simulation Realized Cost Impact'],
      ['Verified Real-World Savings', 'UNAVAILABLE (Certified sub-metering required)', 'Category 4: Physical Sensor Verification']
    ];

    const dateStamp = new Date().toISOString().slice(0, 10);
    generateCSV(headers, rows, `sceo-savings-summary-${dateStamp}.csv`);
  }

  /**
   * Clean Browser Print Report Function
   */
  function printReport() {
    if (state.currentView !== 'savings-reports') {
      switchView('savings-reports');
    }
    window.print();
  }

  /**
   * Setup Event Listeners
   */
  function initEventListeners() {
    // 1. Sidebar Navigation
    if (elements.sidebarNavList) {
      elements.sidebarNavList.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;

        const view = navItem.dataset.view;
        if (view) {
          switchView(view);
        }
      });
    }

    // Return to overview button from placeholder
    if (elements.btnReturnOverview) {
      elements.btnReturnOverview.addEventListener('click', () => {
        switchView('overview');
      });
    }

    // 2. Mobile Drawer Toggle
    if (elements.mobileMenuBtn) {
      elements.mobileMenuBtn.addEventListener('click', () => {
        if (elements.sidebar) elements.sidebar.classList.toggle('mobile-open');
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.toggle('active');
      });
    }

    if (elements.sidebarOverlay) {
      elements.sidebarOverlay.addEventListener('click', () => {
        if (elements.sidebar) elements.sidebar.classList.remove('mobile-open');
        elements.sidebarOverlay.classList.remove('active');
      });
    }

    // 3. Building Selector Change (Topbar)
    if (elements.buildingSelector) {
      elements.buildingSelector.addEventListener('change', (e) => {
        handleBuildingChange(e.target.value);
      });
    }

    // Heatmap Building Filter Change
    if (elements.heatmapBuildingFilter) {
      elements.heatmapBuildingFilter.addEventListener('change', (e) => {
        handleBuildingChange(e.target.value);
      });
    }

    // 4. Date Range Buttons (Topbar & Overview)
    if (elements.btnRange7d) {
      elements.btnRange7d.addEventListener('click', () => handleDateRangeChange('7d'));
    }
    if (elements.btnRange30d) {
      elements.btnRange30d.addEventListener('click', () => handleDateRangeChange('30d'));
    }

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

    // Heatmap Priority Filter Dropdown
    if (elements.heatmapPriorityFilter) {
      elements.heatmapPriorityFilter.addEventListener('change', (e) => {
        state.heatmapPriority = e.target.value;
        renderHeatmap();
      });
    }

    // Heatmap Search Input
    if (elements.heatmapSearchInput) {
      elements.heatmapSearchInput.addEventListener('input', (e) => {
        state.heatmapSearch = e.target.value.trim().toLowerCase();
        renderHeatmap();
      });
    }

    // Heatmap Clear Filters Button
    if (elements.btnHeatmapClearFilters) {
      elements.btnHeatmapClearFilters.addEventListener('click', resetHeatmapFilters);
    }

    // 6. Notifications Dropdown Toggle
    if (elements.notificationsBtn && elements.notificationPopover) {
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
    }

    // Clear all notifications
    if (elements.clearAllNotifsBtn) {
      elements.clearAllNotifsBtn.addEventListener('click', () => {
        SCEO_DATA.recentAlerts.forEach(a => state.readAlerts.add(a.id));
        renderNotificationsPopover();
        updateKPIs();
        showToast('All notifications marked as read', 'success');
      });
    }

    // 7. Action Detail Modal Controls (Priority Actions)
    if (elements.modalCloseBtn) elements.modalCloseBtn.addEventListener('click', closeActionModal);
    if (elements.modalDismissBtn) elements.modalDismissBtn.addEventListener('click', closeActionModal);
    if (elements.modalResolveBtn) elements.modalResolveBtn.addEventListener('click', resolveCurrentAction);

    // Close modal on backdrop click
    if (elements.actionModal) {
      elements.actionModal.addEventListener('click', (e) => {
        if (e.target === elements.actionModal) {
          closeActionModal();
        }
      });
    }

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

    // ========================================================================
    // 11. Timetable Optimizer Event Listeners (Step 4)
    // ========================================================================
    if (elements.ttBuildingFilter) {
      elements.ttBuildingFilter.addEventListener('change', (e) => {
        state.timetableBuildingFilter = e.target.value;
        renderTimetableOptimizer();
        const bName = e.target.value === 'all' ? 'All Buildings' : (SCEO_DATA.buildings.find(b => b.id === e.target.value)?.name || e.target.value);
        showToast(`Timetable filtered to: ${bName}`, 'info');
      });
    }

    if (elements.ttDaySelector) {
      elements.ttDaySelector.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-day]');
        if (!btn) return;
        const day = btn.dataset.day;
        state.timetableDay = day;
        elements.ttDaySelector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTimetableOptimizer();
      });
    }

    if (elements.ttWeekSelect) {
      elements.ttWeekSelect.addEventListener('change', (e) => {
        state.timetableWeek = e.target.value;
        const weekText = e.target.options[e.target.selectedIndex].text;
        showToast(`Timetable schedule scope set to: ${weekText}`, 'info');
        renderTimetableOptimizer();
      });
    }

    if (elements.btnTtViewDay && elements.btnTtViewWeek) {
      elements.btnTtViewDay.addEventListener('click', () => {
        state.timetableCurrentView = 'day';
        elements.btnTtViewDay.classList.add('active');
        elements.btnTtViewWeek.classList.remove('active');
        renderTimetableGrid();
      });

      elements.btnTtViewWeek.addEventListener('click', () => {
        state.timetableCurrentView = 'week';
        elements.btnTtViewWeek.classList.add('active');
        elements.btnTtViewDay.classList.remove('active');
        renderTimetableGrid();
      });
    }

    if (elements.btnTtToggleConflict) {
      elements.btnTtToggleConflict.addEventListener('click', () => {
        state.simulatedConflictActive = !state.simulatedConflictActive;
        if (elements.btnTtToggleConflictText) {
          elements.btnTtToggleConflictText.textContent = state.simulatedConflictActive ? 'Clear Sample Conflict' : 'Simulate Sample Conflict';
        }
        elements.btnTtToggleConflict.classList.toggle('active', state.simulatedConflictActive);
        renderTimetableOptimizer();
        if (state.simulatedConflictActive) {
          showToast('Sample conflicts injected for conflict detector testing.', 'warning');
        } else {
          showToast('Schedule verified: 0 room collisions & 0 capacity violations.', 'info');
        }
      });
    }

    if (elements.btnTtResetDemo) {
      elements.btnTtResetDemo.addEventListener('click', resetTimetableDemo);
    }

    if (elements.ttSearchInput) {
      elements.ttSearchInput.addEventListener('input', (e) => {
        state.timetableSearchQuery = e.target.value;
        renderTimetableGrid();
      });
    }

    if (elements.ttFilterOccupiedOnly) {
      elements.ttFilterOccupiedOnly.addEventListener('change', (e) => {
        state.timetableOccupiedOnly = e.target.checked;
        renderTimetableGrid();
      });
    }

    if (elements.btnTtRestoreSuggestions) {
      elements.btnTtRestoreSuggestions.addEventListener('click', () => {
        state.dismissedSuggestions.clear();
        saveStoredSet(TT_STORAGE_KEYS.DISMISSED, state.dismissedSuggestions);
        renderTimetableSuggestions();
        renderTimetableKPIs();
        showToast('All dismissed suggestions restored to panel', 'info');
      });
    }

    // Suggestion Modal Controls
    if (elements.sugModalCloseBtn) {
      elements.sugModalCloseBtn.addEventListener('click', closeSuggestionModal);
    }
    if (elements.btnSugModalDismiss) {
      elements.btnSugModalDismiss.addEventListener('click', () => {
        if (state.activeSuggestionInModal) {
          dismissSuggestion(state.activeSuggestionInModal.id);
        }
      });
    }
    if (elements.btnSugModalAccept) {
      elements.btnSugModalAccept.addEventListener('click', () => {
        if (state.activeSuggestionInModal) {
          acceptSuggestion(state.activeSuggestionInModal.id);
        }
      });
    }
    if (elements.btnSugGoCurrentRoom) {
      elements.btnSugGoCurrentRoom.addEventListener('click', () => {
        if (state.activeSuggestionInModal) {
          const rId = state.activeSuggestionInModal.currentRoomId;
          closeSuggestionModal();
          navigateToRoomAnalytics(rId);
        }
      });
    }
    if (elements.btnSugGoProposedRoom) {
      elements.btnSugGoProposedRoom.addEventListener('click', () => {
        if (state.activeSuggestionInModal) {
          const rId = state.activeSuggestionInModal.proposedRoomId;
          closeSuggestionModal();
          navigateToRoomAnalytics(rId);
        }
      });
    }
    if (elements.suggestionDetailModal) {
      elements.suggestionDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.suggestionDetailModal) {
          closeSuggestionModal();
        }
      });
    }

    // Class Modal Controls
    if (elements.classModalCloseBtn) {
      elements.classModalCloseBtn.addEventListener('click', closeClassModal);
    }
    if (elements.btnClassModalClose) {
      elements.btnClassModalClose.addEventListener('click', closeClassModal);
    }
    if (elements.btnClassGoAnalytics) {
      elements.btnClassGoAnalytics.addEventListener('click', () => {
        if (state.activeClassInModal) {
          const rId = state.activeClassInModal.roomId;
          closeClassModal();
          navigateToRoomAnalytics(rId);
        }
      });
    }
    if (elements.btnClassGoHeatmap) {
      elements.btnClassGoHeatmap.addEventListener('click', () => {
        if (state.activeClassInModal) {
          const rId = state.activeClassInModal.roomId;
          closeClassModal();
          navigateToRoomHeatmap(rId);
        }
      });
    }
    if (elements.classDetailModal) {
      elements.classDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.classDetailModal) {
          closeClassModal();
        }
      });
    }

    // ========================================================================
    // 12. Alerts & Actions Event Listeners (Step 5)
    // ========================================================================
    if (elements.alertBuildingFilter) {
      elements.alertBuildingFilter.addEventListener('change', (e) => {
        state.alertBuildingFilter = e.target.value;
        renderAlertsAndActions();
        const bName = e.target.value === 'all' ? 'All Buildings' : (SCEO_DATA.buildings.find(b => b.id === e.target.value)?.name || e.target.value);
        showToast(`Alerts filtered to: ${bName}`, 'info');
      });
    }

    if (elements.alertSeverityFilter) {
      elements.alertSeverityFilter.addEventListener('change', (e) => {
        state.alertSeverityFilter = e.target.value;
        renderAlertsAndActions();
      });
    }

    if (elements.alertStatusFilter) {
      elements.alertStatusFilter.addEventListener('change', (e) => {
        state.alertStatusFilter = e.target.value;
        renderAlertsAndActions();
      });
    }

    if (elements.alertDateFilter) {
      elements.alertDateFilter.addEventListener('change', (e) => {
        state.alertDateFilter = e.target.value;
        renderAlertsAndActions();
      });
    }

    if (elements.alertSearchInput) {
      elements.alertSearchInput.addEventListener('input', (e) => {
        state.alertSearchQuery = e.target.value;
        renderAlertsAndActions();
      });
    }

    if (elements.btnRunAlertAnalysis) {
      elements.btnRunAlertAnalysis.addEventListener('click', runDemoAlertAnalysis);
    }

    if (elements.btnResetAlertStates) {
      elements.btnResetAlertStates.addEventListener('click', resetAlertsDemo);
    }

    if (elements.btnClearAlertFilters) {
      elements.btnClearAlertFilters.addEventListener('click', () => {
        state.alertBuildingFilter = 'all';
        state.alertSeverityFilter = 'all';
        state.alertStatusFilter = 'all';
        state.alertDateFilter = 'all';
        state.alertSearchQuery = '';

        if (elements.alertBuildingFilter) elements.alertBuildingFilter.value = 'all';
        if (elements.alertSeverityFilter) elements.alertSeverityFilter.value = 'all';
        if (elements.alertStatusFilter) elements.alertStatusFilter.value = 'all';
        if (elements.alertDateFilter) elements.alertDateFilter.value = 'all';
        if (elements.alertSearchInput) elements.alertSearchInput.value = '';

        renderAlertsAndActions();
        showToast('All alert filters reset.', 'info');
      });
    }

    // View Switcher (Cards vs Table)
    if (elements.btnAlertsViewCards && elements.btnAlertsViewTable) {
      elements.btnAlertsViewCards.addEventListener('click', () => {
        state.alertViewMode = 'cards';
        elements.btnAlertsViewCards.classList.add('active');
        elements.btnAlertsViewTable.classList.remove('active');
        renderAlertsStream();
      });

      elements.btnAlertsViewTable.addEventListener('click', () => {
        state.alertViewMode = 'table';
        elements.btnAlertsViewTable.classList.add('active');
        elements.btnAlertsViewCards.classList.remove('active');
        renderAlertsStream();
      });
    }

    // Alerts Stream Event Delegation
    if (elements.alertsStreamContainer) {
      elements.alertsStreamContainer.addEventListener('click', (e) => {
        // Acknowledge button
        const ackBtn = e.target.closest('.btn-ack-alert');
        if (ackBtn) {
          e.stopPropagation();
          const alertId = ackBtn.dataset.alertId;
          if (alertId) acknowledgeAlert(alertId);
          return;
        }

        // Resolve button
        const resolveBtn = e.target.closest('.btn-resolve-alert');
        if (resolveBtn) {
          e.stopPropagation();
          const alertId = resolveBtn.dataset.alertId;
          if (alertId) resolveAlert(alertId);
          return;
        }

        // Reopen button
        const reopenBtn = e.target.closest('.btn-reopen-alert');
        if (reopenBtn) {
          e.stopPropagation();
          const alertId = reopenBtn.dataset.alertId;
          if (alertId) reopenAlert(alertId);
          return;
        }

        // Inspect details modal button
        const modalBtn = e.target.closest('.btn-open-alert-modal');
        if (modalBtn) {
          e.stopPropagation();
          const alertId = modalBtn.dataset.alertId;
          if (alertId) openAlertModal(alertId);
          return;
        }

        // Cross-link: Classroom Analytics
        const analyticsBtn = e.target.closest('.btn-route-analytics');
        if (analyticsBtn) {
          e.stopPropagation();
          const roomId = analyticsBtn.dataset.roomId;
          if (roomId) navigateToRoomAnalytics(roomId);
          return;
        }

        // Cross-link: Heatmap
        const heatmapBtn = e.target.closest('.btn-route-heatmap');
        if (heatmapBtn) {
          e.stopPropagation();
          const roomId = heatmapBtn.dataset.roomId;
          if (roomId) navigateToRoomHeatmap(roomId);
          return;
        }
      });
    }

    // Recommended Actions Event Delegation
    if (elements.recActionsList) {
      elements.recActionsList.addEventListener('click', (e) => {
        // View related alert
        const relatedAlertBtn = e.target.closest('.btn-open-related-alert');
        if (relatedAlertBtn) {
          e.stopPropagation();
          const alertId = relatedAlertBtn.dataset.alertId;
          if (alertId) openAlertModal(alertId);
          return;
        }

        // Room Analytics route
        const roomBtn = e.target.closest('.btn-route-analytics');
        if (roomBtn) {
          e.stopPropagation();
          const roomId = roomBtn.dataset.roomId;
          if (roomId) navigateToRoomAnalytics(roomId);
          return;
        }
      });
    }

    // Alert Detail Modal Controls
    if (elements.alertModalCloseBtn) {
      elements.alertModalCloseBtn.addEventListener('click', closeAlertModal);
    }
    if (elements.btnAlertModalClose) {
      elements.btnAlertModalClose.addEventListener('click', closeAlertModal);
    }
    if (elements.btnAlertModalAck) {
      elements.btnAlertModalAck.addEventListener('click', () => {
        if (state.activeAlertInModal) {
          acknowledgeAlert(state.activeAlertInModal.id);
        }
      });
    }
    if (elements.btnAlertModalResolve) {
      elements.btnAlertModalResolve.addEventListener('click', () => {
        if (state.activeAlertInModal) {
          if (state.activeAlertInModal.status === 'resolved') {
            reopenAlert(state.activeAlertInModal.id);
          } else {
            resolveAlert(state.activeAlertInModal.id);
          }
        }
      });
    }
    if (elements.btnAlertModalHeatmap) {
      elements.btnAlertModalHeatmap.addEventListener('click', () => {
        if (state.activeAlertInModal) {
          const rId = state.activeAlertInModal.roomId;
          closeAlertModal();
          navigateToRoomHeatmap(rId);
        }
      });
    }
    if (elements.btnAlertModalAnalytics) {
      elements.btnAlertModalAnalytics.addEventListener('click', () => {
        if (state.activeAlertInModal) {
          const rId = state.activeAlertInModal.roomId;
          closeAlertModal();
          navigateToRoomAnalytics(rId);
        }
      });
    }
    if (elements.alertDetailModal) {
      elements.alertDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.alertDetailModal) {
          closeAlertModal();
        }
      });
    }

    // 13. Step 6: Smart Controls Simulator Event Handlers
    // Operating Mode Switcher
    if (elements.btnModeManual) {
      elements.btnModeManual.addEventListener('click', () => {
        if (state.scSimMode === 'manual') return;
        state.scSimMode = 'manual';
        state.scActiveCountdowns = {};
        syncSmartControlsModeUI();
        saveSmartControlsState();
        addSimulationLog(
          'mode_change',
          'MANUAL MODE ACTIVE',
          'pill-blue',
          'SYSTEM',
          'Switched to Manual Simulation mode. Automated shutdowns paused.'
        );
        showToast('Switched to Manual Simulation mode.', 'info');
        renderSmartControls();
      });
    }

    if (elements.btnModeAutomatic) {
      elements.btnModeAutomatic.addEventListener('click', () => {
        if (state.scSimMode === 'automatic') return;
        // Open confirmation modal (Requirement 4)
        if (elements.autoSimConfirmModal) {
          elements.autoSimConfirmModal.classList.add('active');
        }
      });
    }

    // Simulation Controls (Run / Pause / Resume / Reset)
    if (elements.btnRunSimulation) {
      elements.btnRunSimulation.addEventListener('click', () => {
        state.scSimRunning = true;
        syncSmartControlsModeUI();
        runSimulationTick();
        renderSmartControls();
        showToast('Simulation running. Rules actively evaluated.', 'info');
      });
    }

    if (elements.btnPauseSimulation) {
      elements.btnPauseSimulation.addEventListener('click', pauseSimulation);
    }

    if (elements.btnResumeSimulation) {
      elements.btnResumeSimulation.addEventListener('click', resumeSimulation);
    }

    if (elements.btnResetSimulation) {
      elements.btnResetSimulation.addEventListener('click', () => {
        if (elements.resetSimConfirmModal) {
          elements.resetSimConfirmModal.classList.add('active');
        }
      });
    }

    // Filter Controls
    if (elements.scBuildingFilter) {
      elements.scBuildingFilter.addEventListener('change', () => {
        state.scBuildingFilter = elements.scBuildingFilter.value;
        state.scRoomFilter = 'all';
        populateSmartControlsRoomSelector();
        renderSmartControls();
      });
    }

    if (elements.scRoomSelect) {
      elements.scRoomSelect.addEventListener('change', () => {
        state.scRoomFilter = elements.scRoomSelect.value;
        renderSmartControls();
      });
    }

    if (elements.scStatusFilter) {
      elements.scStatusFilter.addEventListener('change', () => {
        state.scStatusFilter = elements.scStatusFilter.value;
        renderSmartControls();
      });
    }

    if (elements.scDelaySelect) {
      elements.scDelaySelect.addEventListener('change', () => {
        state.scAutoShutdownDelay = parseInt(elements.scDelaySelect.value, 10) || 4;
        showToast(`Auto-shutdown delay set to ${state.scAutoShutdownDelay} seconds.`, 'info');
      });
    }

    // Quick Action Buttons
    if (elements.btnScTurnAllOffScope) {
      elements.btnScTurnAllOffScope.addEventListener('click', turnOffAllInEmptyRooms);
    }

    if (elements.btnScResetFilters) {
      elements.btnScResetFilters.addEventListener('click', () => {
        state.scBuildingFilter = 'all';
        state.scRoomFilter = 'all';
        state.scStatusFilter = 'all';
        if (elements.scBuildingFilter) elements.scBuildingFilter.value = 'all';
        populateSmartControlsRoomSelector();
        if (elements.scStatusFilter) elements.scStatusFilter.value = 'all';
        renderSmartControls();
        showToast('Smart Controls filters reset.', 'info');
      });
    }

    // Event Log Controls
    if (elements.btnClearSimLog) {
      elements.btnClearSimLog.addEventListener('click', () => {
        if (elements.clearLogConfirmModal) {
          elements.clearLogConfirmModal.classList.add('active');
        }
      });
    }

    // Confirmation Modals Handlers
    // 1. Auto Simulation Confirmation Modal
    if (elements.btnConfirmAutoSim) {
      elements.btnConfirmAutoSim.addEventListener('click', () => {
        state.scSimMode = 'automatic';
        syncSmartControlsModeUI();
        saveSmartControlsState();
        if (elements.autoSimConfirmModal) elements.autoSimConfirmModal.classList.remove('active');
        addSimulationLog(
          'mode_change',
          'AUTO SIM ENABLED',
          'pill-green',
          'SYSTEM',
          'Automatic Simulation enabled. Unoccupied rooms will be evaluated for shutdown.'
        );
        showToast('Automatic Simulation activated.', 'success');
        renderSmartControls();
      });
    }
    if (elements.btnCancelAutoSim) {
      elements.btnCancelAutoSim.addEventListener('click', () => {
        if (elements.autoSimConfirmModal) elements.autoSimConfirmModal.classList.remove('active');
      });
    }
    if (elements.autoSimModalCloseBtn) {
      elements.autoSimModalCloseBtn.addEventListener('click', () => {
        if (elements.autoSimConfirmModal) elements.autoSimConfirmModal.classList.remove('active');
      });
    }
    if (elements.autoSimConfirmModal) {
      elements.autoSimConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.autoSimConfirmModal) {
          elements.autoSimConfirmModal.classList.remove('active');
        }
      });
    }

    // 2. Reset Simulation Confirmation Modal
    if (elements.btnConfirmResetSim) {
      elements.btnConfirmResetSim.addEventListener('click', () => {
        resetSimulationDemo();
        if (elements.resetSimConfirmModal) elements.resetSimConfirmModal.classList.remove('active');
      });
    }
    if (elements.btnCancelResetSim) {
      elements.btnCancelResetSim.addEventListener('click', () => {
        if (elements.resetSimConfirmModal) elements.resetSimConfirmModal.classList.remove('active');
      });
    }
    if (elements.resetSimModalCloseBtn) {
      elements.resetSimModalCloseBtn.addEventListener('click', () => {
        if (elements.resetSimConfirmModal) elements.resetSimConfirmModal.classList.remove('active');
      });
    }
    if (elements.resetSimConfirmModal) {
      elements.resetSimConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.resetSimConfirmModal) {
          elements.resetSimConfirmModal.classList.remove('active');
        }
      });
    }

    // 3. Clear Log Confirmation Modal
    if (elements.btnConfirmClearLog) {
      elements.btnConfirmClearLog.addEventListener('click', () => {
        clearSimulationLog();
        if (elements.clearLogConfirmModal) elements.clearLogConfirmModal.classList.remove('active');
      });
    }
    if (elements.btnCancelClearLog) {
      elements.btnCancelClearLog.addEventListener('click', () => {
        if (elements.clearLogConfirmModal) elements.clearLogConfirmModal.classList.remove('active');
      });
    }
    if (elements.clearLogModalCloseBtn) {
      elements.clearLogModalCloseBtn.addEventListener('click', () => {
        if (elements.clearLogConfirmModal) elements.clearLogConfirmModal.classList.remove('active');
      });
    }
    if (elements.clearLogConfirmModal) {
      elements.clearLogConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.clearLogConfirmModal) {
          elements.clearLogConfirmModal.classList.remove('active');
        }
      });
    }

    // Delegated Classroom Cards Grid Actions
    if (elements.scRoomsContainer) {
      elements.scRoomsContainer.addEventListener('click', (e) => {
        // Toggle individual device power
        const toggleBtn = e.target.closest('.btn-sc-toggle');
        if (toggleBtn) {
          e.stopPropagation();
          const { roomId, deviceId } = toggleBtn.dataset;
          if (roomId && deviceId) toggleDeviceState(roomId, deviceId);
          return;
        }

        // Toggle manual override
        const overrideBtn = e.target.closest('.btn-sc-override');
        if (overrideBtn) {
          e.stopPropagation();
          const { roomId, deviceId } = overrideBtn.dataset;
          if (roomId && deviceId) toggleManualOverride(roomId, deviceId);
          return;
        }

        // Toggle essential equipment
        const essentialBtn = e.target.closest('.btn-sc-essential');
        if (essentialBtn) {
          e.stopPropagation();
          const { roomId, deviceId } = essentialBtn.dataset;
          if (roomId && deviceId) toggleEssentialEquipment(roomId, deviceId);
          return;
        }

        // Toggle room occupancy
        const occupancyBtn = e.target.closest('.btn-sc-occupancy');
        if (occupancyBtn) {
          e.stopPropagation();
          const { roomId } = occupancyBtn.dataset;
          if (roomId) toggleRoomOccupancy(roomId);
          return;
        }

        // Reset single room
        const resetRoomBtn = e.target.closest('.btn-sc-reset-room');
        if (resetRoomBtn) {
          e.stopPropagation();
          const { roomId } = resetRoomBtn.dataset;
          if (roomId) resetRoomToDefault(roomId);
          return;
        }

        // Turn off all devices in room
        const turnOffRoomBtn = e.target.closest('.btn-sc-turn-off-room');
        if (turnOffRoomBtn) {
          e.stopPropagation();
          const { roomId } = turnOffRoomBtn.dataset;
          if (roomId) turnOffRoomDevices(roomId);
          return;
        }

        // Cross-link to Classroom Analytics
        const analyticsBtn = e.target.closest('.btn-sc-analytics');
        if (analyticsBtn) {
          e.stopPropagation();
          const { roomId } = analyticsBtn.dataset;
          if (roomId) navigateToRoomAnalytics(roomId);
          return;
        }

        // Cross-link to Energy Heatmap
        const heatmapBtn = e.target.closest('.btn-sc-heatmap');
        if (heatmapBtn) {
          e.stopPropagation();
          const { roomId } = heatmapBtn.dataset;
          if (roomId) navigateToRoomHeatmap(roomId);
          return;
        }
      });
    }

    // 14. Global Keyboard Handlers (Escape closes open overlays)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.actionModal.classList.contains('active')) {
          closeActionModal();
        }
        if (elements.roomDetailModal && elements.roomDetailModal.classList.contains('active')) {
          closeRoomModal();
        }
        if (elements.suggestionDetailModal && elements.suggestionDetailModal.classList.contains('active')) {
          closeSuggestionModal();
        }
        if (elements.classDetailModal && elements.classDetailModal.classList.contains('active')) {
          closeClassModal();
        }
        if (elements.alertDetailModal && elements.alertDetailModal.classList.contains('active')) {
          closeAlertModal();
        }
        if (elements.autoSimConfirmModal && elements.autoSimConfirmModal.classList.contains('active')) {
          elements.autoSimConfirmModal.classList.remove('active');
        }
        if (elements.resetSimConfirmModal && elements.resetSimConfirmModal.classList.contains('active')) {
          elements.resetSimConfirmModal.classList.remove('active');
        }
        if (elements.clearLogConfirmModal && elements.clearLogConfirmModal.classList.contains('active')) {
          elements.clearLogConfirmModal.classList.remove('active');
        }
        if (elements.maintenanceDetailModal && elements.maintenanceDetailModal.classList.contains('active')) {
          closeMaintenanceDetailModal();
        }
        if (elements.addMaintenanceModal && elements.addMaintenanceModal.classList.contains('active')) {
          closeAddMaintenanceModal();
        }
        if (elements.recordActionModal && elements.recordActionModal.classList.contains('active')) {
          closeRecordActionModal();
        }
        if (elements.resetMaintConfirmModal && elements.resetMaintConfirmModal.classList.contains('active')) {
          elements.resetMaintConfirmModal.classList.remove('active');
        }
        if (elements.resetDeptConfirmModal && elements.resetDeptConfirmModal.classList.contains('active')) {
          elements.resetDeptConfirmModal.classList.remove('active');
        }
        if (elements.resetAllDemoConfirmModal && elements.resetAllDemoConfirmModal.classList.contains('active')) {
          closeResetAllModal();
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


    // --------------------------------------------------------------------------
    // 14. Step 7: Preventive Maintenance Event Handlers
    // --------------------------------------------------------------------------
    if (elements.maintBuildingFilter) {
      elements.maintBuildingFilter.addEventListener('change', (e) => {
        state.maintFilterBuilding = e.target.value;
        renderMaintenanceView();
      });
    }

    if (elements.maintTypeFilter) {
      elements.maintTypeFilter.addEventListener('change', (e) => {
        state.maintFilterType = e.target.value;
        renderMaintenanceView();
      });
    }

    if (elements.maintStatusFilter) {
      elements.maintStatusFilter.addEventListener('change', (e) => {
        state.maintFilterStatus = e.target.value;
        renderMaintenanceView();
      });
    }

    if (elements.maintSearchInput) {
      elements.maintSearchInput.addEventListener('input', (e) => {
        state.maintSearchQuery = e.target.value;
        renderMaintenanceView();
      });
    }

    if (elements.btnMaintViewTable) {
      elements.btnMaintViewTable.addEventListener('click', () => {
        state.maintViewMode = 'table';
        localStorage.setItem(MAINT_STORAGE_KEYS.VIEW_MODE, 'table');
        renderMaintenanceView();
      });
    }

    if (elements.btnMaintViewCards) {
      elements.btnMaintViewCards.addEventListener('click', () => {
        state.maintViewMode = 'cards';
        localStorage.setItem(MAINT_STORAGE_KEYS.VIEW_MODE, 'cards');
        renderMaintenanceView();
      });
    }

    if (elements.btnResetMaintFilters) {
      elements.btnResetMaintFilters.addEventListener('click', () => {
        state.maintFilterBuilding = 'all';
        state.maintFilterType = 'all';
        state.maintFilterStatus = 'all';
        state.maintSearchQuery = '';
        if (elements.maintBuildingFilter) elements.maintBuildingFilter.value = 'all';
        if (elements.maintTypeFilter) elements.maintTypeFilter.value = 'all';
        if (elements.maintStatusFilter) elements.maintStatusFilter.value = 'all';
        if (elements.maintSearchInput) elements.maintSearchInput.value = '';
        renderMaintenanceView();
      });
    }

    // Add Maintenance Task Modal Handlers
    if (elements.btnOpenAddMaintenanceModal) {
      elements.btnOpenAddMaintenanceModal.addEventListener('click', () => {
        openAddMaintenanceModal();
      });
    }

    if (elements.addMaintModalCloseBtn) {
      elements.addMaintModalCloseBtn.addEventListener('click', closeAddMaintenanceModal);
    }
    if (elements.btnCancelAddMaint) {
      elements.btnCancelAddMaint.addEventListener('click', closeAddMaintenanceModal);
    }
    if (elements.addMaintForm) {
      elements.addMaintForm.addEventListener('submit', submitAddMaintenanceTask);
    }
    if (elements.addMaintenanceModal) {
      elements.addMaintenanceModal.addEventListener('click', (e) => {
        if (e.target === elements.addMaintenanceModal) closeAddMaintenanceModal();
      });
    }

    // Maintenance Detail Modal Handlers
    if (elements.maintModalCloseBtn) {
      elements.maintModalCloseBtn.addEventListener('click', closeMaintenanceDetailModal);
    }
    if (elements.btnMaintModalClose) {
      elements.btnMaintModalClose.addEventListener('click', closeMaintenanceDetailModal);
    }
    if (elements.maintenanceDetailModal) {
      elements.maintenanceDetailModal.addEventListener('click', (e) => {
        if (e.target === elements.maintenanceDetailModal) closeMaintenanceDetailModal();
      });
    }

    // Status Transition Buttons in Modal
    if (elements.btnMaintSetScheduled) {
      elements.btnMaintSetScheduled.addEventListener('click', () => {
        if (state.activeMaintTaskInModal) {
          updateMaintenanceTaskStatus(state.activeMaintTaskInModal.id, 'scheduled', 'Work order scheduled for site dispatch');
        }
      });
    }
    if (elements.btnMaintSetInProgress) {
      elements.btnMaintSetInProgress.addEventListener('click', () => {
        if (state.activeMaintTaskInModal) {
          updateMaintenanceTaskStatus(state.activeMaintTaskInModal.id, 'in_progress', 'Technician dispatched — inspection in progress');
        }
      });
    }
    if (elements.btnMaintSetCompleted) {
      elements.btnMaintSetCompleted.addEventListener('click', () => {
        if (state.activeMaintTaskInModal) {
          updateMaintenanceTaskStatus(state.activeMaintTaskInModal.id, 'completed', 'Maintenance servicing verified & completed');
        }
      });
    }
    if (elements.btnMaintSetReopen) {
      elements.btnMaintSetReopen.addEventListener('click', () => {
        if (state.activeMaintTaskInModal) {
          updateMaintenanceTaskStatus(state.activeMaintTaskInModal.id, 'open', 'Task reopened for follow-up verification');
        }
      });
    }

    // Maintenance Deep Links to Heatmap & Analytics (Requirement 6)
    if (elements.btnMaintModalAnalytics) {
      elements.btnMaintModalAnalytics.addEventListener('click', () => {
        if (state.activeMaintTaskInModal && state.activeMaintTaskInModal.roomId) {
          const rId = state.activeMaintTaskInModal.roomId;
          closeMaintenanceDetailModal();
          switchView('classroom-analytics');
          state.selectedClassroom = rId;
          if (elements.caRoomSelect) elements.caRoomSelect.value = rId;
          renderClassroomAnalytics();
        }
      });
    }

    if (elements.btnMaintModalHeatmap) {
      elements.btnMaintModalHeatmap.addEventListener('click', () => {
        if (state.activeMaintTaskInModal) {
          const bId = state.activeMaintTaskInModal.buildingId || 'all';
          closeMaintenanceDetailModal();
          switchView('energy-heatmap');
          state.selectedBuilding = bId;
          if (elements.heatmapBuildingFilter) elements.heatmapBuildingFilter.value = bId;
          renderHeatmap();
        }
      });
    }

    // Reset Maintenance Demo
    if (elements.btnResetMaintDemo) {
      elements.btnResetMaintDemo.addEventListener('click', () => {
        if (elements.resetMaintConfirmModal) elements.resetMaintConfirmModal.classList.add('active');
      });
    }
    if (elements.btnConfirmResetMaint) {
      elements.btnConfirmResetMaint.addEventListener('click', resetMaintenanceDemo);
    }
    if (elements.btnCancelResetMaint) {
      elements.btnCancelResetMaint.addEventListener('click', () => {
        if (elements.resetMaintConfirmModal) elements.resetMaintConfirmModal.classList.remove('active');
      });
    }
    if (elements.resetMaintModalCloseBtn) {
      elements.resetMaintModalCloseBtn.addEventListener('click', () => {
        if (elements.resetMaintConfirmModal) elements.resetMaintConfirmModal.classList.remove('active');
      });
    }
    if (elements.resetMaintConfirmModal) {
      elements.resetMaintConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.resetMaintConfirmModal) {
          elements.resetMaintConfirmModal.classList.remove('active');
        }
      });
    }

    // --------------------------------------------------------------------------
    // 15. Step 7B: Department Energy Challenge Event Handlers
    // --------------------------------------------------------------------------
    if (elements.btnDeptPeriodMonth) {
      elements.btnDeptPeriodMonth.addEventListener('click', () => {
        state.deptActivePeriod = 'month';
        localStorage.setItem(DEPT_STORAGE_KEYS.PERIOD, 'month');
        syncDeptPeriodButtons();
        renderDepartmentChallengeView();
      });
    }

    if (elements.btnDeptPeriodSemester) {
      elements.btnDeptPeriodSemester.addEventListener('click', () => {
        state.deptActivePeriod = 'semester';
        localStorage.setItem(DEPT_STORAGE_KEYS.PERIOD, 'semester');
        syncDeptPeriodButtons();
        renderDepartmentChallengeView();
      });
    }

    if (elements.btnDeptPeriodYear) {
      elements.btnDeptPeriodYear.addEventListener('click', () => {
        state.deptActivePeriod = 'academic_year';
        localStorage.setItem(DEPT_STORAGE_KEYS.PERIOD, 'academic_year');
        syncDeptPeriodButtons();
        renderDepartmentChallengeView();
      });
    }

    // Record Action Modal Handlers
    if (elements.btnOpenRecordActionModal) {
      elements.btnOpenRecordActionModal.addEventListener('click', () => {
        openRecordActionModal();
      });
    }
    if (elements.btnQuickRecordActionForDept) {
      elements.btnQuickRecordActionForDept.addEventListener('click', () => {
        openRecordActionModal(state.deptActiveDeptId);
      });
    }
    if (elements.recordActionModalCloseBtn) {
      elements.recordActionModalCloseBtn.addEventListener('click', closeRecordActionModal);
    }
    if (elements.btnCancelRecordAction) {
      elements.btnCancelRecordAction.addEventListener('click', closeRecordActionModal);
    }
    if (elements.recordActionForm) {
      elements.recordActionForm.addEventListener('submit', submitRecordAction);
    }
    if (elements.recordActionModal) {
      elements.recordActionModal.addEventListener('click', (e) => {
        if (e.target === elements.recordActionModal) closeRecordActionModal();
      });
    }

    // Reset Department Challenge Demo Handlers
    if (elements.btnResetChallengeDemo) {
      elements.btnResetChallengeDemo.addEventListener('click', () => {
        if (elements.resetDeptConfirmModal) elements.resetDeptConfirmModal.classList.add('active');
      });
    }
    if (elements.btnConfirmResetDept) {
      elements.btnConfirmResetDept.addEventListener('click', resetDepartmentChallengeDemo);
    }
    if (elements.btnCancelResetDept) {
      elements.btnCancelResetDept.addEventListener('click', () => {
        if (elements.resetDeptConfirmModal) elements.resetDeptConfirmModal.classList.remove('active');
      });
    }
    if (elements.resetDeptModalCloseBtn) {
      elements.resetDeptModalCloseBtn.addEventListener('click', () => {
        if (elements.resetDeptConfirmModal) elements.resetDeptConfirmModal.classList.remove('active');
      });
    }
    if (elements.resetDeptConfirmModal) {
      elements.resetDeptConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.resetDeptConfirmModal) {
          elements.resetDeptConfirmModal.classList.remove('active');
        }
      });
    }

    // --------------------------------------------------------------------------
    // 15. Step 8: Savings Reports & Settings Event Handlers
    // --------------------------------------------------------------------------
    if (elements.reportsBuildingFilter) {
      elements.reportsBuildingFilter.addEventListener('change', (e) => {
        state.reportsBuildingFilter = e.target.value;
        renderSavingsReportsView();
      });
    }

    if (elements.reportsBtnRange7d) {
      elements.reportsBtnRange7d.addEventListener('click', () => {
        state.reportsDateRange = '7d';
        syncReportsDateButtons();
        renderSavingsReportsView();
      });
    }

    if (elements.reportsBtnRange30d) {
      elements.reportsBtnRange30d.addEventListener('click', () => {
        state.reportsDateRange = '30d';
        syncReportsDateButtons();
        renderSavingsReportsView();
      });
    }

    if (elements.reportsBtnRangeCustom) {
      elements.reportsBtnRangeCustom.addEventListener('click', () => {
        state.reportsDateRange = 'custom';
        syncReportsDateButtons();
        renderSavingsReportsView();
      });
    }

    if (elements.reportsBtnApplyCustom) {
      elements.reportsBtnApplyCustom.addEventListener('click', () => {
        if (elements.reportsStartDate) state.reportsCustomStartDate = elements.reportsStartDate.value;
        if (elements.reportsEndDate) state.reportsCustomEndDate = elements.reportsEndDate.value;
        renderSavingsReportsView();
        showToast('Custom date filter slice applied.', 'info');
      });
    }

    if (elements.reportsMetricFilter) {
      elements.reportsMetricFilter.addEventListener('change', (e) => {
        state.reportsMetricFilter = e.target.value;
        renderSavingsReportsView();
      });
    }

    if (elements.btnTriggerExportReport) {
      elements.btnTriggerExportReport.addEventListener('click', () => {
        const target = document.getElementById('exportCenterSection');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (elements.btnPrintReport) {
      elements.btnPrintReport.addEventListener('click', () => {
        printReport();
      });
    }

    // Building Performance Sorting
    if (elements.reportsBldgSortSelect) {
      elements.reportsBldgSortSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const parts = val.split('_');
        state.reportsBldgSortCol = parts[0];
        state.reportsBldgSortDir = parts[1] || 'desc';
        renderBuildingPerformanceTable();
      });
    }

    // Building Performance Table Sortable Headers
    const sortableHeaders = document.querySelectorAll('.reports-table th.sortable-th');
    sortableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (!col) return;
        if (state.reportsBldgSortCol === col) {
          state.reportsBldgSortDir = state.reportsBldgSortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.reportsBldgSortCol = col;
          state.reportsBldgSortDir = 'desc';
        }
        renderBuildingPerformanceTable();
      });
    });

    // Classroom Savings Search & Sort
    if (elements.reportsClassroomSearch) {
      elements.reportsClassroomSearch.addEventListener('input', (e) => {
        state.reportsClassroomSearch = e.target.value;
        renderClassroomSavingsTable();
      });
    }

    if (elements.reportsClassroomSortSelect) {
      elements.reportsClassroomSortSelect.addEventListener('change', (e) => {
        state.reportsClassroomSort = e.target.value;
        renderClassroomSavingsTable();
      });
    }

    // Classroom Deep-Link Clicks Delegation
    if (elements.reportsClassroomTableBody) {
      elements.reportsClassroomTableBody.addEventListener('click', (e) => {
        const analyticsBtn = e.target.closest('.btn-reports-analytics');
        if (analyticsBtn) {
          const roomId = analyticsBtn.dataset.roomId;
          if (roomId) navigateToRoomAnalytics(roomId);
          return;
        }

        const heatmapBtn = e.target.closest('.btn-reports-heatmap');
        if (heatmapBtn) {
          const roomId = heatmapBtn.dataset.roomId;
          if (roomId) navigateToRoomHeatmap(roomId);
          return;
        }
      });
    }

    // Tariff Configure Link in Reports
    if (elements.btnGoToTariffSettings) {
      elements.btnGoToTariffSettings.addEventListener('click', () => {
        switchView('settings');
      });
    }

    // CSV Export Center Handlers
    if (elements.btnExportBuildingsCsv) {
      elements.btnExportBuildingsCsv.addEventListener('click', exportBuildingsCSV);
    }
    if (elements.btnExportRoomsCsv) {
      elements.btnExportRoomsCsv.addEventListener('click', exportClassroomsCSV);
    }
    if (elements.btnExportAlertsCsv) {
      elements.btnExportAlertsCsv.addEventListener('click', exportAlertsCSV);
    }
    if (elements.btnExportMaintCsv) {
      elements.btnExportMaintCsv.addEventListener('click', exportMaintenanceCSV);
    }
    if (elements.btnExportDeptCsv) {
      elements.btnExportDeptCsv.addEventListener('click', exportDepartmentChallengeCSV);
    }
    if (elements.btnExportSummaryCsv) {
      elements.btnExportSummaryCsv.addEventListener('click', exportSavingsSummaryCSV);
    }

    // Settings View Event Handlers
    if (elements.settingsForm) {
      elements.settingsForm.addEventListener('submit', saveSettings);
    }
    if (elements.btnResetTariffDefault) {
      elements.btnResetTariffDefault.addEventListener('click', resetTariffDefaults);
    }

    // Master Reset Demo State Handlers
    if (elements.btnOpenResetAllModal) {
      elements.btnOpenResetAllModal.addEventListener('click', openResetAllModal);
    }
    if (elements.btnLoadAnomalyScenario) {
      elements.btnLoadAnomalyScenario.addEventListener('click', loadSampleAnomalyScenario);
    }
    if (elements.resetAllModalCloseBtn) {
      elements.resetAllModalCloseBtn.addEventListener('click', closeResetAllModal);
    }
    if (elements.btnCancelResetAll) {
      elements.btnCancelResetAll.addEventListener('click', closeResetAllModal);
    }
    if (elements.btnConfirmResetAll) {
      elements.btnConfirmResetAll.addEventListener('click', confirmResetAllDemoData);
    }
    if (elements.resetAllDemoConfirmModal) {
      elements.resetAllDemoConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.resetAllDemoConfirmModal) closeResetAllModal();
      });
    }

    // ========================================================================
    // 13. Step 10: Competition Guided Demo Event Listeners
    // ========================================================================
    if (elements.btnStartGuidedDemo) {
      elements.btnStartGuidedDemo.addEventListener('click', () => startGuidedDemo(1));
    }
    if (elements.btnTopStartDemo) {
      elements.btnTopStartDemo.addEventListener('click', () => startGuidedDemo(1));
    }
    if (elements.btnDemoNext) {
      elements.btnDemoNext.addEventListener('click', nextDemoStage);
    }
    if (elements.btnDemoPrev) {
      elements.btnDemoPrev.addEventListener('click', prevDemoStage);
    }
    if (elements.btnDemoSkip) {
      elements.btnDemoSkip.addEventListener('click', skipGuidedDemo);
    }
    if (elements.btnDemoSkipText) {
      elements.btnDemoSkipText.addEventListener('click', skipGuidedDemo);
    }
    if (elements.btnDemoResetScenario) {
      elements.btnDemoResetScenario.addEventListener('click', openResetDemoModal);
    }
    if (elements.btnCancelDemoReset) {
      elements.btnCancelDemoReset.addEventListener('click', closeResetDemoModal);
    }
    if (elements.btnCancelDemoResetSecondary) {
      elements.btnCancelDemoResetSecondary.addEventListener('click', closeResetDemoModal);
    }
    if (elements.btnConfirmDemoReset) {
      elements.btnConfirmDemoReset.addEventListener('click', executeResetDemoScenario);
    }
    if (elements.demoResetConfirmModal) {
      elements.demoResetConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.demoResetConfirmModal) closeResetDemoModal();
      });
    }

    // Step Progress segments click handler
    if (elements.demoProgressTrack) {
      elements.demoProgressTrack.addEventListener('click', (e) => {
        const seg = e.target.closest('.demo-step-segment');
        if (seg && seg.dataset.step) {
          const stepNum = parseInt(seg.dataset.step, 10);
          if (!isNaN(stepNum)) renderGuidedDemoStage(stepNum);
        }
      });
    }

    // Keyboard navigation (ArrowRight / ArrowLeft / Escape)
    document.addEventListener('keydown', (e) => {
      if (!state.guidedDemoActive) return;
      if (e.key === 'ArrowRight') {
        nextDemoStage();
      } else if (e.key === 'ArrowLeft') {
        prevDemoStage();
      } else if (e.key === 'Escape') {
        skipGuidedDemo();
      }
    });
  }

  // ==========================================================================
  // STEP 10: COMPETITION GUIDED DEMO MODE LOGIC
  // ==========================================================================
  const GUIDED_DEMO_STAGES = [
    {
      stage: 1,
      view: 'overview',
      viewLabel: 'Overview Dashboard',
      title: 'Stage 1: Monitor Campus Energy Baseline',
      targetSelector: '.kpi-grid',
      setup: () => {
        state.selectedBuilding = 'all';
        if (elements.buildingSelector) elements.buildingSelector.value = 'all';
        state.dateRange = '7d';
        if (elements.btnRange7d && elements.btnRange30d) {
          elements.btnRange7d.classList.add('active');
          elements.btnRange30d.classList.remove('active');
        }
        updateKPIs();
        renderBuildingsTable();
      },
      whatSeeing: 'Campus-wide electricity consumption (2,480 kWh) and avoidable standby waste (186 kWh, ~7.5% of total) across 24 classrooms in 3 academic buildings over the last 7 days.',
      whyMatters: 'Macro metrics establish university-wide baselines. Facilities leadership can instantly identify that nearly 200 kWh/week is wasted in unoccupied rooms without manual campus audits.',
      nextAction: 'Navigate to the Energy Waste Heatmap to localize which specific building and classroom is causing the largest waste outlier.',
      nextBtnLabel: 'Next: Identify Waste Outlier'
    },
    {
      stage: 2,
      view: 'energy-heatmap',
      viewLabel: 'Energy Waste Heatmap',
      title: 'Stage 2: Identify High-Priority Outlier (ENG-101)',
      targetSelector: '[data-room-id="ENG-101"]',
      setup: () => {
        state.heatmapMetric = 'kwhPerOccupiedHour';
        state.heatmapSort = 'metricDesc';
        if (elements.heatmapSortSelect) elements.heatmapSortSelect.value = 'metricDesc';
        renderHeatmap();
      },
      whatSeeing: 'The 24-classroom efficiency heatmap. Room ENG-101 (Lecture Theater Alpha) is flagged in red with an energy intensity of 8.4 kWh/hr and 52 kWh of avoidable waste—over 25% of total campus waste.',
      whyMatters: 'Aggregated metrics mask localized waste. While the peer lecture hall benchmark is 4.8 kWh/hr, ENG-101 runs at nearly double that rate, indicating severe equipment scheduling or thermostat override issues.',
      nextAction: 'Open Classroom Analytics to investigate the 24-hour occupancy vs. power profile for ENG-101.',
      nextBtnLabel: 'Next: Investigate Energy Pattern'
    },
    {
      stage: 3,
      view: 'classroom-analytics',
      viewLabel: 'Classroom Analytics',
      title: 'Stage 3: Investigate 24-Hour Load & Occupancy Curve',
      targetSelector: '#classroomDailyChartWrap',
      setup: () => {
        selectClassroom('ENG-101');
      },
      whatSeeing: 'The 24-hour occupancy vs. electrical power load curve for ENG-101. Between 22:00 and 06:00, detected occupancy is 0 people, yet electrical load remains pegged at 6.8 kW throughout the night.',
      whyMatters: 'Proves the waste is caused by after-hours un-setback operation, not classroom enrollment. Equipment and central HVAC compressors continue drawing peak power when the hall is vacant.',
      nextAction: 'Review the automated diagnosis and operational recommendation in Alerts & Actions.',
      nextBtnLabel: 'Next: Review Recommended Action'
    },
    {
      stage: 4,
      view: 'alerts-actions',
      viewLabel: 'Alerts & Actions Feed',
      title: 'Stage 4: Review Operational Recommendation (ALT-101)',
      targetSelector: '[data-alert-id="ALT-101"]',
      setup: () => {
        state.alertBuildingFilter = 'all';
        state.alertSeverityFilter = 'all';
        state.alertStatusFilter = 'all';
        if (elements.alertBuildingFilter) elements.alertBuildingFilter.value = 'all';
        if (elements.alertSeverityFilter) elements.alertSeverityFilter.value = 'all';
        if (elements.alertStatusFilter) elements.alertStatusFilter.value = 'all';
        renderAlertsAndActions();
      },
      whatSeeing: 'Critical Alert ALT-101: "Unoccupied After-Hours HVAC Draw in Lecture Hall (ENG-101)". The rule-based engine flags continuous 6.8 kW draw and recommends resetting the manual thermostat override latch.',
      whyMatters: 'SCEO translates complex telemetry into prioritized operational interventions with quantified potential savings (~28.8 kWh/night, saving ~$5.18/night at $0.18/kWh).',
      nextAction: 'Open the Smart Controls Simulator to safely test an automated equipment shutdown before physical deployment.',
      nextBtnLabel: 'Next: Simulate Intervention'
    },
    {
      stage: 5,
      view: 'smart-controls',
      viewLabel: 'Smart Controls Simulator',
      title: 'Stage 5: Simulate Automated Equipment Shutdown',
      targetSelector: '#scRoomCard-ENG-101',
      setup: () => {
        state.scBuildingFilter = 'all';
        state.scRoomFilter = 'all';
        if (elements.scBuildingFilter) elements.scBuildingFilter.value = 'all';
        if (elements.scRoomFilter) elements.scRoomFilter.value = 'all';
        renderSmartControlsView();
      },
      whatSeeing: 'The software simulation controls for ENG-101. The Central HVAC Inverter (4.2 kW) is running while occupancy sensors report "Unoccupied".',
      whyMatters: 'Simulation allows facilities engineers to validate automated setback rules and safety exclusions safely in software before touching physical BACnet relays or campus power grids.',
      nextAction: 'Click "Turn Off" on ENG-101 HVAC to simulate the automated intervention, then proceed to the final savings report.',
      nextBtnLabel: 'Next: Review Estimated Savings'
    },
    {
      stage: 6,
      view: 'savings-reports',
      viewLabel: 'Savings & Reports',
      title: 'Stage 6: Review Estimated Savings & Impact',
      targetSelector: '#reportsKpiAvoidableEnergy',
      setup: () => {
        state.reportsBuildingFilter = 'all';
        if (elements.reportsBuildingFilter) elements.reportsBuildingFilter.value = 'all';
        renderSavingsReportsView();
      },
      whatSeeing: 'Consolidated campus savings report showing 52 kWh avoidable waste in ENG-101, simulated realized savings, and cost reduction modeled at the university\'s $0.18/kWh utility tariff.',
      whyMatters: 'Closes the optimization loop: Monitor → Identify → Investigate → Recommend → Simulate → Quantify. Provides audit-ready intelligence for university sustainability goals.',
      nextAction: 'Export the verified report as CSV or click "Reset Scenario" to repeat the walkthrough from the beginning.',
      nextBtnLabel: 'Finish Guided Demo'
    }
  ];

  function startGuidedDemo(stageNum = 1) {
    state.guidedDemoActive = true;
    state.guidedDemoStage = stageNum;

    if (elements.guidedDemoDock) {
      elements.guidedDemoDock.style.display = 'block';
    }
    document.body.classList.add('guided-demo-open');

    renderGuidedDemoStage(state.guidedDemoStage);
    showToast('Competition Guided Demo launched • Step through the 6 stages', 'info');
  }

  function renderGuidedDemoStage(stageNum) {
    const stageIdx = Math.max(0, Math.min(stageNum - 1, GUIDED_DEMO_STAGES.length - 1));
    const stage = GUIDED_DEMO_STAGES[stageIdx];
    state.guidedDemoStage = stage.stage;

    // 1. Update text displays
    if (elements.demoStagePill) elements.demoStagePill.textContent = `STAGE ${stage.stage} OF ${GUIDED_DEMO_STAGES.length}`;
    if (elements.demoViewPill) elements.demoViewPill.textContent = stage.viewLabel;
    if (elements.demoStageTitle) elements.demoStageTitle.textContent = stage.title;
    if (elements.demoTextWhatSeeing) elements.demoTextWhatSeeing.textContent = stage.whatSeeing;
    if (elements.demoTextWhyMatters) elements.demoTextWhyMatters.textContent = stage.whyMatters;
    if (elements.demoTextNextAction) elements.demoTextNextAction.textContent = stage.nextAction;
    if (elements.btnDemoNextText) elements.btnDemoNextText.textContent = stage.nextBtnLabel;

    // 2. Update progress segments
    if (elements.demoProgressTrack) {
      elements.demoProgressTrack.setAttribute('aria-valuenow', stage.stage.toString());
      const segments = elements.demoProgressTrack.querySelectorAll('.demo-step-segment');
      segments.forEach((seg, idx) => {
        const segNum = idx + 1;
        seg.classList.remove('active', 'completed');
        if (segNum === stage.stage) {
          seg.classList.add('active');
        } else if (segNum < stage.stage) {
          seg.classList.add('completed');
        }
      });
    }

    // 3. Update button states
    if (elements.btnDemoPrev) {
      elements.btnDemoPrev.disabled = stage.stage === 1;
    }

    // 4. Navigate to target view & execute setup
    switchView(stage.view);
    if (typeof stage.setup === 'function') {
      try {
        stage.setup();
      } catch (err) {
        console.warn('Error in demo stage setup:', err);
      }
    }

    // 5. Apply spotlight highlighting on relevant control/card
    setTimeout(() => {
      clearSpotlightTarget();
      if (stage.targetSelector) {
        setSpotlightTarget(stage.targetSelector);
      }
    }, 250);
  }

  function nextDemoStage() {
    if (state.guidedDemoStage >= GUIDED_DEMO_STAGES.length) {
      finishGuidedDemo();
    } else {
      renderGuidedDemoStage(state.guidedDemoStage + 1);
    }
  }

  function prevDemoStage() {
    if (state.guidedDemoStage > 1) {
      renderGuidedDemoStage(state.guidedDemoStage - 1);
    }
  }

  function skipGuidedDemo() {
    state.guidedDemoActive = false;
    clearSpotlightTarget();
    if (elements.guidedDemoDock) {
      elements.guidedDemoDock.style.display = 'none';
    }
    document.body.classList.remove('guided-demo-open');
    showToast('Guided Demo exited. You can restart anytime from Overview.', 'info');
  }

  function finishGuidedDemo() {
    state.guidedDemoActive = false;
    clearSpotlightTarget();
    if (elements.guidedDemoDock) {
      elements.guidedDemoDock.style.display = 'none';
    }
    document.body.classList.remove('guided-demo-open');
    showToast('Guided Demo completed. Central energy optimization loop demonstrated.', 'success');
  }

  function setSpotlightTarget(selector) {
    try {
      const target = document.querySelector(selector);
      if (target) {
        target.classList.add('demo-spotlight-target');
        state.activeSpotlightElement = target;
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (e) {
      console.warn('Could not find spotlight target:', selector);
    }
  }

  function clearSpotlightTarget() {
    if (state.activeSpotlightElement) {
      state.activeSpotlightElement.classList.remove('demo-spotlight-target');
      state.activeSpotlightElement = null;
    }
    const all = document.querySelectorAll('.demo-spotlight-target');
    all.forEach(el => el.classList.remove('demo-spotlight-target'));
  }

  function openResetDemoModal() {
    if (elements.demoResetConfirmModal) {
      elements.demoResetConfirmModal.style.display = 'flex';
      elements.demoResetConfirmModal.classList.add('active');
    }
  }

  function closeResetDemoModal() {
    if (elements.demoResetConfirmModal) {
      elements.demoResetConfirmModal.style.display = 'none';
      elements.demoResetConfirmModal.classList.remove('active');
    }
  }

  function executeResetDemoScenario() {
    // 1. Reset ENG-101 devices in Smart Controls simulator
    const eng101 = (state.scRoomsData || []).find(r => r.roomId === 'ENG-101');
    if (eng101 && eng101.devices) {
      eng101.devices.forEach(d => {
        if (d.id === 'ENG-101-ac' || d.id === 'ENG-101-lt' || d.id === 'ENG-101-pj') {
          d.state = 'on';
          d.manualOverride = false;
        }
      });
      saveSmartControlsRooms();
    }

    // 2. Reset simulator savings accumulator
    state.scRealizedSavingsKWh = 0.0;
    state.scRealizedSavingsCost = 0.0;
    localStorage.removeItem(SC_STORAGE_KEYS.SAVINGS_KWH);
    localStorage.removeItem(SC_STORAGE_KEYS.SAVINGS_COST);

    // 3. Reset Alert ALT-101 status
    if (state.alertStatuses) {
      state.alertStatuses['ALT-101'] = 'new';
      saveStoredObject(ALERT_STORAGE_KEYS.STATUSES, state.alertStatuses);
    }

    // 4. Reset Action ACT-01 in resolved actions
    if (state.resolvedActions) {
      state.resolvedActions.delete('ACT-01');
    }

    // 5. Update views
    updateKPIs();
    renderPriorityActions();
    renderRecentAlerts();
    if (state.currentView === 'smart-controls') renderSmartControlsView();
    if (state.currentView === 'alerts-actions') renderAlertsAndActions();
    if (state.currentView === 'savings-reports') renderSavingsReportsView();

    closeResetDemoModal();
    showToast('Demo scenario reset: ENG-101 restored to active standby baseline.', 'success');

    // If guided demo is active, restart at Stage 1
    if (state.guidedDemoActive) {
      renderGuidedDemoStage(1);
    }
  }

  /**
   * Application Initialization
   */
  function init() {
    // Load persisted prototype state
    initSettingsData();
    state.acceptedSuggestions = loadStoredSet(TT_STORAGE_KEYS.ACCEPTED);
    state.dismissedSuggestions = loadStoredSet(TT_STORAGE_KEYS.DISMISSED);
    state.alertStatuses = loadStoredObject(ALERT_STORAGE_KEYS.STATUSES);
    state.generatedDynamicAlerts = loadStoredArray(ALERT_STORAGE_KEYS.DYNAMIC);

    initSmartControlsData();
    initMaintenanceData();
    initDepartmentChallengeData();

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
      showToast('Welcome to Smart Campus Energy Optimizer (SCEO) • Campus Energy Intelligence Platform', 'info');
    }, 400);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
