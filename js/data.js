/**
 * Smart Campus Energy Optimizer (SCEO) - Sample Telemetry & Operational Data
 * Step 1 Foundation Data Module
 * 
 * Note: All figures are simulated demo values for campus facilities management.
 */

const SCEO_DATA = {
  metadata: {
    campusName: "Northfield University Campus",
    environment: "Simulated Telemetry Demo",
    lastUpdated: "2026-10-21 16:45:00",
    defaultKPIs: {
      totalEnergy7Days: 2480,       // Matches requirement: 2,480 kWh
      potentialSavings7Days: 186,   // Matches requirement: 186 kWh
      activeAlertsCount: 8,         // Matches requirement: 8
      monitoredClassroomsCount: 24, // Matches requirement: 24
      totalEnergy30Days: 10840,
      potentialSavings30Days: 820
    }
  },

  buildings: [
    {
      id: "engineering",
      name: "Engineering Building",
      code: "ENG",
      totalRooms: 10,
      squareMeters: 4800,
      manager: "Dr. Marcus Vance",
      currentBaselineKW: 38.5,
      sharePercentage: 45,
      efficiencyRating: "Needs Audit",
      efficiencyScore: 78,
      statusColor: "amber",
      kpi7Days: {
        totalKWh: 1120,
        potentialSavingsKWh: 98,
        activeAlerts: 4,
        monitoredRooms: 10
      },
      kpi30Days: {
        totalKWh: 4890,
        potentialSavingsKWh: 430,
        activeAlerts: 4,
        monitoredRooms: 10
      },
      dailyReadings7Days: [152, 168, 174, 160, 165, 148, 153],
      dailyReadings30Days: [
        148, 150, 155, 162, 158, 145, 149,
        152, 168, 174, 160, 165, 148, 153,
        157, 164, 170, 163, 167, 142, 146,
        151, 169, 172, 159, 163, 147, 150,
        158, 165
      ]
    },
    {
      id: "science",
      name: "Science Building",
      code: "SCI",
      totalRooms: 8,
      squareMeters: 4100,
      manager: "Prof. Elena Rostova",
      currentBaselineKW: 31.2,
      sharePercentage: 33,
      efficiencyRating: "Moderate Waste",
      efficiencyScore: 82,
      statusColor: "amber",
      kpi7Days: {
        totalKWh: 820,
        potentialSavingsKWh: 56,
        activeAlerts: 3,
        monitoredRooms: 8
      },
      kpi30Days: {
        totalKWh: 3580,
        potentialSavingsKWh: 245,
        activeAlerts: 3,
        monitoredRooms: 8
      },
      dailyReadings7Days: [112, 124, 128, 118, 122, 106, 110],
      dailyReadings30Days: [
        108, 115, 120, 122, 119, 102, 105,
        112, 124, 128, 118, 122, 106, 110,
        114, 121, 126, 117, 120, 104, 108,
        111, 125, 127, 116, 121, 105, 109,
        115, 122
      ]
    },
    {
      id: "business",
      name: "Business Building",
      code: "BUS",
      totalRooms: 6,
      squareMeters: 3200,
      manager: "K. Al-Mansoor",
      currentBaselineKW: 19.8,
      sharePercentage: 22,
      efficiencyRating: "Optimal",
      efficiencyScore: 94,
      statusColor: "green",
      kpi7Days: {
        totalKWh: 540,
        potentialSavingsKWh: 32,
        activeAlerts: 1,
        monitoredRooms: 6
      },
      kpi30Days: {
        totalKWh: 2370,
        potentialSavingsKWh: 145,
        activeAlerts: 1,
        monitoredRooms: 6
      },
      dailyReadings7Days: [74, 81, 82, 78, 79, 72, 74],
      dailyReadings30Days: [
        70, 75, 78, 80, 77, 69, 71,
        74, 81, 82, 78, 79, 72, 74,
        76, 79, 81, 77, 78, 68, 70,
        73, 82, 80, 76, 80, 71, 73,
        77, 80
      ]
    }
  ],

  classrooms: [
    // -------------------------------------------------------------
    // ENGINEERING BUILDING (10 Classrooms - Sum: 1,120 kWh, 98 kWh waste)
    // -------------------------------------------------------------
    {
      id: "ENG-101",
      name: "ENG 101 - Lecture Theater Alpha",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Lecture Theater",
      capacity: 120,
      floor: "Level 1",
      hvacZone: "Zone-ENG-L1",
      occupancyState: "Empty",
      hvacStatus: "Running (After-hours)",
      lightingStatus: "Off",
      currentPowerKW: 6.8,
      status: "warning",
      lastTelemetry: "3 mins ago",
      sevenDays: {
        totalKWh: 210,
        occupiedHours: 25,
        kwhPerOccupiedHour: 8.4,
        benchmarkKwhPerHour: 4.8,
        estimatedWasteKWh: 52,
        wastePercentage: 24.8,
        status: "red",
        statusLabel: "Very High / Waste Issue",
        wasteCauses: [
          "Air conditioning active 18 hours after scheduled academic sessions",
          "Manual wall thermostat override left locked at 20°C",
          "Tiered stage lighting left energized on weekend"
        ],
        recommendedActions: [
          "Check whether air conditioning is running in an empty room.",
          "Reset manual thermostat override latch and restore auto-schedule.",
          "Review the air-conditioner temperature setting (increase to 23.5°C).",
          "Investigate unusually high consumption during unoccupied hours."
        ]
      },
      thirtyDays: {
        totalKWh: 915,
        occupiedHours: 110,
        kwhPerOccupiedHour: 8.3,
        benchmarkKwhPerHour: 4.8,
        estimatedWasteKWh: 228,
        wastePercentage: 24.9,
        status: "red",
        statusLabel: "Very High / Waste Issue",
        wasteCauses: [
          "Persistent after-hours heating/cooling overruns across 30 days",
          "Weekend baseline draw remains 4.2 kW above acceptable standby"
        ],
        recommendedActions: [
          "Audit occupancy sensor relay and enforce strict 21:00 evening setback."
        ]
      }
    },
    {
      id: "ENG-102",
      name: "ENG 102 - Lecture Theater Beta",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Lecture Theater",
      capacity: 100,
      floor: "Level 1",
      hvacZone: "Zone-ENG-L1",
      occupancyState: "Occupied (80)",
      hvacStatus: "Normal Comfort",
      lightingStatus: "On",
      currentPowerKW: 4.6,
      status: "normal",
      lastTelemetry: "Just now",
      sevenDays: {
        totalKWh: 155,
        occupiedHours: 32,
        kwhPerOccupiedHour: 4.8,
        benchmarkKwhPerHour: 4.5,
        estimatedWasteKWh: 5,
        wastePercentage: 3.2,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Minor auxiliary supply fan overrun during Friday evening changeover"
        ],
        recommendedActions: [
          "Align AHU shutdown schedule tightly with registrar timetable.",
          "Remind occupants to switch off lights and fans after class."
        ]
      },
      thirtyDays: {
        totalKWh: 675,
        occupiedHours: 140,
        kwhPerOccupiedHour: 4.8,
        benchmarkKwhPerHour: 4.5,
        estimatedWasteKWh: 22,
        wastePercentage: 3.3,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Occasional inter-class idle HVAC running"
        ],
        recommendedActions: [
          "Maintain current schedules with 15-minute post-class auto-off timer."
        ]
      }
    },
    {
      id: "ENG-104",
      name: "ENG 104 - Computer Lab A",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Computer Lab",
      capacity: 45,
      floor: "Level 1",
      hvacZone: "Zone-ENG-L1",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 2.2,
      status: "warning",
      lastTelemetry: "5 mins ago",
      sevenDays: {
        totalKWh: 130,
        occupiedHours: 22,
        kwhPerOccupiedHour: 5.9,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 14,
        wastePercentage: 10.8,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "35 desktop workstations left idling in high-performance mode overnight",
          "Dedicated split AC running during low-occupancy afternoons"
        ],
        recommendedActions: [
          "Deploy centralized sleep policy via Active Directory after 20:00.",
          "Review the air-conditioner temperature setting during lab idle periods.",
          "Remind occupants to switch off peripheral monitors after evening sessions."
        ]
      },
      thirtyDays: {
        totalKWh: 565,
        occupiedHours: 96,
        kwhPerOccupiedHour: 5.9,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 61,
        wastePercentage: 10.8,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "Continuous workstation baseload outside teaching hours"
        ],
        recommendedActions: [
          "Implement scheduled smart plug power strips for student benches."
        ]
      }
    },
    {
      id: "ENG-201",
      name: "ENG 201 - Materials Testing Lab",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Laboratory",
      capacity: 30,
      floor: "Level 2",
      hvacZone: "Zone-ENG-L2",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 1.2,
      status: "optimal",
      lastTelemetry: "12 mins ago",
      sevenDays: {
        totalKWh: 85,
        occupiedHours: 24,
        kwhPerOccupiedHour: 3.5,
        benchmarkKwhPerHour: 3.8,
        estimatedWasteKWh: 1,
        wastePercentage: 1.2,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Minimal standby hydraulic pump pressure maintenance"
        ],
        recommendedActions: [
          "Maintain current efficient operating procedures."
        ]
      },
      thirtyDays: {
        totalKWh: 370,
        occupiedHours: 105,
        kwhPerOccupiedHour: 3.5,
        benchmarkKwhPerHour: 3.8,
        estimatedWasteKWh: 4,
        wastePercentage: 1.1,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Negligible baseline waste"
        ],
        recommendedActions: [
          "Continue condition-based monitoring."
        ]
      }
    },
    {
      id: "ENG-204",
      name: "ENG 204 - Robotics & Mechatronics Lab",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Laboratory",
      capacity: 35,
      floor: "Level 2",
      hvacZone: "Zone-ENG-L2",
      occupancyState: "Occupied (12)",
      hvacStatus: "Eco Mode",
      lightingStatus: "On",
      currentPowerKW: 4.2,
      status: "normal",
      lastTelemetry: "Just now",
      sevenDays: {
        totalKWh: 115,
        occupiedHours: 26,
        kwhPerOccupiedHour: 4.4,
        benchmarkKwhPerHour: 3.8,
        estimatedWasteKWh: 4,
        wastePercentage: 3.5,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Soldering bench localized exhaust fans left idling during lunch breaks"
        ],
        recommendedActions: [
          "Remind occupants to switch off lights and extraction fans after class.",
          "Check whether air conditioning is running during extended unoccupied gaps."
        ]
      },
      thirtyDays: {
        totalKWh: 505,
        occupiedHours: 114,
        kwhPerOccupiedHour: 4.4,
        benchmarkKwhPerHour: 3.8,
        estimatedWasteKWh: 18,
        wastePercentage: 3.6,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Intermittent auxiliary fan runtime"
        ],
        recommendedActions: [
          "Introduce automatic 15-minute bench shutoff switches."
        ]
      }
    },
    {
      id: "ENG-208",
      name: "ENG 208 - Electronics Workshop",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Classroom",
      capacity: 25,
      floor: "Level 2",
      hvacZone: "Zone-ENG-L2",
      occupancyState: "Empty",
      hvacStatus: "Eco Standby",
      lightingStatus: "Off",
      currentPowerKW: 0.9,
      status: "optimal",
      lastTelemetry: "20 mins ago",
      sevenDays: {
        totalKWh: 60,
        occupiedHours: 28,
        kwhPerOccupiedHour: 2.1,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 1,
        wastePercentage: 1.7,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Nominal phantom loads on bench DC power supplies"
        ],
        recommendedActions: [
          "Current setup is highly efficient; maintain standard protocols."
        ]
      },
      thirtyDays: {
        totalKWh: 260,
        occupiedHours: 122,
        kwhPerOccupiedHour: 2.1,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 4,
        wastePercentage: 1.5,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Minimal standby leakage"
        ],
        recommendedActions: [
          "Maintain current schedule."
        ]
      }
    },
    {
      id: "ENG-301",
      name: "ENG 301 - Seminar Room 3A",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Seminar Room",
      capacity: 30,
      floor: "Level 3",
      hvacZone: "Zone-ENG-L3",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 0.7,
      status: "optimal",
      lastTelemetry: "8 mins ago",
      sevenDays: {
        totalKWh: 55,
        occupiedHours: 25,
        kwhPerOccupiedHour: 2.2,
        benchmarkKwhPerHour: 2.2,
        estimatedWasteKWh: 0,
        wastePercentage: 0.0,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [],
        recommendedActions: [
          "Room operation matches baseline benchmark; no action required."
        ]
      },
      thirtyDays: {
        totalKWh: 240,
        occupiedHours: 110,
        kwhPerOccupiedHour: 2.2,
        benchmarkKwhPerHour: 2.2,
        estimatedWasteKWh: 0,
        wastePercentage: 0.0,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [],
        recommendedActions: [
          "Continue automated occupancy sensor control."
        ]
      }
    },
    {
      id: "ENG-304",
      name: "ENG 304 - Fluid Dynamics Lab",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Laboratory",
      capacity: 25,
      floor: "Level 3",
      hvacZone: "Zone-ENG-L3",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 1.5,
      status: "normal",
      lastTelemetry: "14 mins ago",
      sevenDays: {
        totalKWh: 95,
        occupiedHours: 22,
        kwhPerOccupiedHour: 4.3,
        benchmarkKwhPerHour: 3.6,
        estimatedWasteKWh: 2,
        wastePercentage: 2.1,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Fluid circulation loop pump left idling between consecutive lectures"
        ],
        recommendedActions: [
          "Install digital run timers on fluid testing rigs.",
          "Review the air-conditioner temperature setting during lab downtime."
        ]
      },
      thirtyDays: {
        totalKWh: 415,
        occupiedHours: 96,
        kwhPerOccupiedHour: 4.3,
        benchmarkKwhPerHour: 3.6,
        estimatedWasteKWh: 9,
        wastePercentage: 2.2,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Inter-session pump idle time"
        ],
        recommendedActions: [
          "Remind demonstrators to isolate water rigs."
        ]
      }
    },
    {
      id: "ENG-305",
      name: "ENG 305 - CAD Design Suite",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Computer Lab",
      capacity: 40,
      floor: "Level 3",
      hvacZone: "Zone-ENG-L3",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 1.1,
      status: "normal",
      lastTelemetry: "10 mins ago",
      sevenDays: {
        totalKWh: 145,
        occupiedHours: 24,
        kwhPerOccupiedHour: 6.0,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 18,
        wastePercentage: 12.4,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "High-performance GPU rendering stations drawing 850W phantom power outside hours",
          "Zonal thermostat set to aggressive 19.5°C pre-cooling"
        ],
        recommendedActions: [
          "Investigate unusually high consumption during unoccupied hours.",
          "Deploy scheduled sleep scripts across all 40 graphics workstations.",
          "Review the air-conditioner temperature setting (increase to 23°C)."
        ]
      },
      thirtyDays: {
        totalKWh: 635,
        occupiedHours: 105,
        kwhPerOccupiedHour: 6.0,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 79,
        wastePercentage: 12.4,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "Persistent workstation baseline leakage"
        ],
        recommendedActions: [
          "Implement Wake-on-LAN and auto-sleep policies."
        ]
      }
    },
    {
      id: "ENG-310",
      name: "ENG 310 - Faculty Meeting Hall",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      roomType: "Seminar Room",
      capacity: 40,
      floor: "Level 3",
      hvacZone: "Zone-ENG-L3",
      occupancyState: "Occupied (18)",
      hvacStatus: "Eco Comfort",
      lightingStatus: "On",
      currentPowerKW: 2.1,
      status: "optimal",
      lastTelemetry: "Just now",
      sevenDays: {
        totalKWh: 70,
        occupiedHours: 30,
        kwhPerOccupiedHour: 2.3,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 1,
        wastePercentage: 1.4,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Nominal meeting room AV console standby"
        ],
        recommendedActions: [
          "Optimal operating baseline; no changes recommended."
        ]
      },
      thirtyDays: {
        totalKWh: 305,
        occupiedHours: 130,
        kwhPerOccupiedHour: 2.3,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 5,
        wastePercentage: 1.6,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Negligible waste"
        ],
        recommendedActions: [
          "Continue current schedule."
        ]
      }
    },

    // -------------------------------------------------------------
    // SCIENCE BUILDING (8 Classrooms - Sum: 820 kWh, 56 kWh waste)
    // -------------------------------------------------------------
    {
      id: "SCI-101",
      name: "SCI 101 - Intro Biology Hall",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Lecture Theater",
      capacity: 110,
      floor: "Level 1",
      hvacZone: "Zone-SCI-L1",
      occupancyState: "Empty",
      hvacStatus: "Scheduled Off",
      lightingStatus: "Off",
      currentPowerKW: 1.1,
      status: "optimal",
      lastTelemetry: "18 mins ago",
      sevenDays: {
        totalKWh: 140,
        occupiedHours: 35,
        kwhPerOccupiedHour: 4.0,
        benchmarkKwhPerHour: 4.5,
        estimatedWasteKWh: 4,
        wastePercentage: 2.8,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Minor peripheral foyer lighting active after evening lectures"
        ],
        recommendedActions: [
          "Remind occupants to switch off lights and fans after class.",
          "Maintain efficient centralized lecture timetable control."
        ]
      },
      thirtyDays: {
        totalKWh: 610,
        occupiedHours: 152,
        kwhPerOccupiedHour: 4.0,
        benchmarkKwhPerHour: 4.5,
        estimatedWasteKWh: 17,
        wastePercentage: 2.8,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Minor scheduled overtime"
        ],
        recommendedActions: [
          "Continue timetable-synchronized setback."
        ]
      }
    },
    {
      id: "SCI-102",
      name: "SCI 102 - General Chemistry Hall",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Lecture Theater",
      capacity: 90,
      floor: "Level 1",
      hvacZone: "Zone-SCI-L1",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 1.4,
      status: "normal",
      lastTelemetry: "5 mins ago",
      sevenDays: {
        totalKWh: 110,
        occupiedHours: 25,
        kwhPerOccupiedHour: 4.4,
        benchmarkKwhPerHour: 4.0,
        estimatedWasteKWh: 6,
        wastePercentage: 5.5,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Pre-cooling triggered 2 hours before scheduled cancelled guest seminar",
          "Air handling unit fan step-down delayed by 45 minutes"
        ],
        recommendedActions: [
          "Check whether air conditioning is running in an empty room.",
          "Integrate room scheduling gateway with timetable cancellation feed."
        ]
      },
      thirtyDays: {
        totalKWh: 480,
        occupiedHours: 110,
        kwhPerOccupiedHour: 4.4,
        benchmarkKwhPerHour: 4.0,
        estimatedWasteKWh: 26,
        wastePercentage: 5.4,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Occasional pre-conditioning for cancelled periods"
        ],
        recommendedActions: [
          "Automate dynamic schedule sync."
        ]
      }
    },
    {
      id: "SCI-105",
      name: "SCI 105 - Organic Chemistry Lab",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Laboratory",
      capacity: 30,
      floor: "Level 1",
      hvacZone: "Zone-SCI-L1",
      occupancyState: "Occupied (10)",
      hvacStatus: "High Vent",
      lightingStatus: "On",
      currentPowerKW: 5.1,
      status: "warning",
      lastTelemetry: "4 mins ago",
      sevenDays: {
        totalKWh: 135,
        occupiedHours: 24,
        kwhPerOccupiedHour: 5.6,
        benchmarkKwhPerHour: 3.8,
        estimatedWasteKWh: 12,
        wastePercentage: 8.9,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "Fume hood exhaust dampers left in high-purge position after student sessions",
          "Makeup air heating running simultaneously against ambient exterior air"
        ],
        recommendedActions: [
          "Remind occupants to pull down fume hood sashes and switch off fans.",
          "Review the air-conditioner temperature setting and damper interlocks.",
          "Investigate unusually high consumption during unoccupied evening hours."
        ]
      },
      thirtyDays: {
        totalKWh: 590,
        occupiedHours: 105,
        kwhPerOccupiedHour: 5.6,
        benchmarkKwhPerHour: 3.8,
        estimatedWasteKWh: 53,
        wastePercentage: 9.0,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "Frequent sash overrun"
        ],
        recommendedActions: [
          "Install audible sash-open timers."
        ]
      }
    },
    {
      id: "SCI-201",
      name: "SCI 201 - Biochemistry Research Lab",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Laboratory",
      capacity: 30,
      floor: "Level 2",
      hvacZone: "Zone-SCI-L2",
      occupancyState: "Occupied (4)",
      hvacStatus: "Fume Hood Max Flow",
      lightingStatus: "On",
      currentPowerKW: 7.9,
      status: "warning",
      lastTelemetry: "1 min ago",
      sevenDays: {
        totalKWh: 165,
        occupiedHours: 20,
        kwhPerOccupiedHour: 8.25,
        benchmarkKwhPerHour: 4.0,
        estimatedWasteKWh: 24,
        wastePercentage: 14.5,
        status: "red",
        statusLabel: "Very High / Waste Issue",
        wasteCauses: [
          "Two chemical fume hoods propped open 24/7 with VAV dampers at 100% capacity",
          "Refrigerated benchtop centrifuge running continuously on standby",
          "Lab air-conditioner setpoint dialed down to 18°C by researchers"
        ],
        recommendedActions: [
          "Check whether air conditioning and exhaust fans are running at max flow in empty room.",
          "Remind occupants to close fume hood sashes after experimental runs.",
          "Review the air-conditioner temperature setting (enforce 21°C minimum limit).",
          "Investigate unusually high baseline consumption during unoccupied weekend hours."
        ]
      },
      thirtyDays: {
        totalKWh: 720,
        occupiedHours: 88,
        kwhPerOccupiedHour: 8.2,
        benchmarkKwhPerHour: 4.0,
        estimatedWasteKWh: 105,
        wastePercentage: 14.6,
        status: "red",
        statusLabel: "Very High / Waste Issue",
        wasteCauses: [
          "Persistent chemical sash leakage"
        ],
        recommendedActions: [
          "Retrofit auto-sash motorized closures on main fume hoods."
        ]
      }
    },
    {
      id: "SCI-204",
      name: "SCI 204 - Microbiology Suite",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Laboratory",
      capacity: 25,
      floor: "Level 2",
      hvacZone: "Zone-SCI-L2",
      occupancyState: "Empty",
      hvacStatus: "Eco Mode",
      lightingStatus: "Off",
      currentPowerKW: 3.2,
      status: "warning",
      lastTelemetry: "6 mins ago",
      sevenDays: {
        totalKWh: 105,
        occupiedHours: 22,
        kwhPerOccupiedHour: 4.8,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 6,
        wastePercentage: 5.7,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "Secondary autoclave water heater chamber drawing continuous standby power",
          "Ventilation damper minimum flow set 25% higher than necessary"
        ],
        recommendedActions: [
          "Review autoclave idle temperature setpoints and scheduler.",
          "Check whether air conditioning and exhaust fans are running when lab is empty."
        ]
      },
      thirtyDays: {
        totalKWh: 460,
        occupiedHours: 96,
        kwhPerOccupiedHour: 4.8,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 26,
        wastePercentage: 5.6,
        status: "orange",
        statusLabel: "High Consumption",
        wasteCauses: [
          "Continuous autoclave warming loop"
        ],
        recommendedActions: [
          "Install smart schedule timer on sterilization equipment."
        ]
      }
    },
    {
      id: "SCI-301",
      name: "SCI 301 - Astronomy Seminar Room",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Seminar Room",
      capacity: 35,
      floor: "Level 3",
      hvacZone: "Zone-SCI-L3",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 0.6,
      status: "optimal",
      lastTelemetry: "25 mins ago",
      sevenDays: {
        totalKWh: 45,
        occupiedHours: 26,
        kwhPerOccupiedHour: 1.7,
        benchmarkKwhPerHour: 2.2,
        estimatedWasteKWh: 1,
        wastePercentage: 2.2,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Minimal telemetry transmitter standby"
        ],
        recommendedActions: [
          "Excellent energy profile; maintain existing occupancy logic."
        ]
      },
      thirtyDays: {
        totalKWh: 195,
        occupiedHours: 115,
        kwhPerOccupiedHour: 1.7,
        benchmarkKwhPerHour: 2.2,
        estimatedWasteKWh: 4,
        wastePercentage: 2.1,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Negligible baseline draw"
        ],
        recommendedActions: [
          "Continue current schedule."
        ]
      }
    },
    {
      id: "SCI-305",
      name: "SCI 305 - Optics Laser Lab",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Laboratory",
      capacity: 20,
      floor: "Level 3",
      hvacZone: "Zone-SCI-L3",
      occupancyState: "Empty",
      hvacStatus: "Eco Standby",
      lightingStatus: "Off",
      currentPowerKW: 1.8,
      status: "normal",
      lastTelemetry: "11 mins ago",
      sevenDays: {
        totalKWh: 75,
        occupiedHours: 22,
        kwhPerOccupiedHour: 3.4,
        benchmarkKwhPerHour: 3.2,
        estimatedWasteKWh: 2,
        wastePercentage: 2.7,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Laser closed-circuit chiller pump running during unoccupied intervals"
        ],
        recommendedActions: [
          "Interlock laser chiller pump directly with master optical bench power key."
        ]
      },
      thirtyDays: {
        totalKWh: 330,
        occupiedHours: 97,
        kwhPerOccupiedHour: 3.4,
        benchmarkKwhPerHour: 3.2,
        estimatedWasteKWh: 9,
        wastePercentage: 2.7,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Chiller standby cycling"
        ],
        recommendedActions: [
          "Verify pump shutoff interlock."
        ]
      }
    },
    {
      id: "SCI-308",
      name: "SCI 308 - Physics Seminar Room",
      buildingId: "science",
      buildingName: "Science Building",
      roomType: "Classroom",
      capacity: 45,
      floor: "Level 3",
      hvacZone: "Zone-SCI-L3",
      occupancyState: "Empty",
      hvacStatus: "Scheduled Off",
      lightingStatus: "Off",
      currentPowerKW: 0.8,
      status: "optimal",
      lastTelemetry: "15 mins ago",
      sevenDays: {
        totalKWh: 45,
        occupiedHours: 28,
        kwhPerOccupiedHour: 1.6,
        benchmarkKwhPerHour: 2.3,
        estimatedWasteKWh: 1,
        wastePercentage: 2.2,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Standard sensor standby"
        ],
        recommendedActions: [
          "Classroom efficiency is optimal; no action required."
        ]
      },
      thirtyDays: {
        totalKWh: 195,
        occupiedHours: 122,
        kwhPerOccupiedHour: 1.6,
        benchmarkKwhPerHour: 2.3,
        estimatedWasteKWh: 4,
        wastePercentage: 2.1,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Negligible waste"
        ],
        recommendedActions: [
          "Maintain current operation."
        ]
      }
    },

    // -------------------------------------------------------------
    // BUSINESS BUILDING (6 Classrooms - Sum: 540 kWh, 32 kWh waste)
    // -------------------------------------------------------------
    {
      id: "BUS-101",
      name: "BUS 101 - Auditorium Magna",
      buildingId: "business",
      buildingName: "Business Building",
      roomType: "Auditorium",
      capacity: 150,
      floor: "Level 1",
      hvacZone: "Zone-BUS-L1",
      occupancyState: "Empty",
      hvacStatus: "Auto-Off Enabled",
      lightingStatus: "Off",
      currentPowerKW: 1.2,
      status: "optimal",
      lastTelemetry: "8 mins ago",
      sevenDays: {
        totalKWh: 145,
        occupiedHours: 38,
        kwhPerOccupiedHour: 3.8,
        benchmarkKwhPerHour: 4.8,
        estimatedWasteKWh: 4,
        wastePercentage: 2.8,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Despite large 150-seat capacity and 145 kWh total, high utilization makes per-hour efficiency very favorable"
        ],
        recommendedActions: [
          "Continue automated timetable setback routines; performance is exemplary."
        ]
      },
      thirtyDays: {
        totalKWh: 635,
        occupiedHours: 167,
        kwhPerOccupiedHour: 3.8,
        benchmarkKwhPerHour: 4.8,
        estimatedWasteKWh: 18,
        wastePercentage: 2.8,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Minor post-session delay"
        ],
        recommendedActions: [
          "Maintain current schedules."
        ]
      }
    },
    {
      id: "BUS-102",
      name: "BUS 102 - Executive Seminar Room",
      buildingId: "business",
      buildingName: "Business Building",
      roomType: "Seminar Room",
      capacity: 30,
      floor: "Level 1",
      hvacZone: "Zone-BUS-L1",
      occupancyState: "Empty",
      hvacStatus: "Running (After-hours)",
      lightingStatus: "On",
      currentPowerKW: 4.8,
      status: "warning",
      lastTelemetry: "2 mins ago",
      sevenDays: {
        totalKWh: 95,
        occupiedHours: 12,
        kwhPerOccupiedHour: 7.9,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 18,
        wastePercentage: 18.9,
        status: "red",
        statusLabel: "Very High / Waste Issue",
        wasteCauses: [
          "Architectural ceiling downlights active in full daylight without occupancy",
          "Air conditioner cooling empty room to 19°C for 14 hours straight",
          "Automated occupancy sensor bypassed by manual rocker switch"
        ],
        recommendedActions: [
          "Check whether air conditioning is running in an empty room.",
          "Remind occupants to switch off lights and fans after class.",
          "Review the air-conditioner temperature setting (increase setback to 24°C).",
          "Investigate unusually high consumption during unoccupied hours."
        ]
      },
      thirtyDays: {
        totalKWh: 415,
        occupiedHours: 53,
        kwhPerOccupiedHour: 7.8,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 79,
        wastePercentage: 19.0,
        status: "red",
        statusLabel: "Very High / Waste Issue",
        wasteCauses: [
          "Bypassed motion sensor causing continuous cooling"
        ],
        recommendedActions: [
          "Replace manual rocker bypass with tamper-proof relay."
        ]
      }
    },
    {
      id: "BUS-201",
      name: "BUS 201 - Case Study Hall A",
      buildingId: "business",
      buildingName: "Business Building",
      roomType: "Classroom",
      capacity: 50,
      floor: "Level 2",
      hvacZone: "Zone-BUS-L2",
      occupancyState: "Empty",
      hvacStatus: "Scheduled Off",
      lightingStatus: "Off",
      currentPowerKW: 0.9,
      status: "optimal",
      lastTelemetry: "16 mins ago",
      sevenDays: {
        totalKWh: 75,
        occupiedHours: 30,
        kwhPerOccupiedHour: 2.5,
        benchmarkKwhPerHour: 2.6,
        estimatedWasteKWh: 2,
        wastePercentage: 2.7,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Occasional hallway ambient light spill"
        ],
        recommendedActions: [
          "Efficient scheduling; no action needed."
        ]
      },
      thirtyDays: {
        totalKWh: 330,
        occupiedHours: 132,
        kwhPerOccupiedHour: 2.5,
        benchmarkKwhPerHour: 2.6,
        estimatedWasteKWh: 9,
        wastePercentage: 2.7,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Negligible waste"
        ],
        recommendedActions: [
          "Maintain current operation."
        ]
      }
    },
    {
      id: "BUS-202",
      name: "BUS 202 - Financial Modeling Lab",
      buildingId: "business",
      buildingName: "Business Building",
      roomType: "Computer Lab",
      capacity: 45,
      floor: "Level 2",
      hvacZone: "Zone-BUS-L2",
      occupancyState: "Occupied (24)",
      hvacStatus: "Smart Comfort 22°C",
      lightingStatus: "On",
      currentPowerKW: 3.4,
      status: "optimal",
      lastTelemetry: "Just now",
      sevenDays: {
        totalKWh: 95,
        occupiedHours: 25,
        kwhPerOccupiedHour: 3.8,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 3,
        wastePercentage: 3.2,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Dual-monitor Bloomberg terminals idling briefly during noon intermissions"
        ],
        recommendedActions: [
          "Ensure PC monitors sleep after 10 minutes of inactivity.",
          "Remind occupants to switch off lights and fans after class."
        ]
      },
      thirtyDays: {
        totalKWh: 420,
        occupiedHours: 110,
        kwhPerOccupiedHour: 3.8,
        benchmarkKwhPerHour: 3.5,
        estimatedWasteKWh: 13,
        wastePercentage: 3.1,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Terminal idle power"
        ],
        recommendedActions: [
          "Enforce auto-sleep group policy."
        ]
      }
    },
    {
      id: "BUS-205",
      name: "BUS 205 - Graduate Study Lounge",
      buildingId: "business",
      buildingName: "Business Building",
      roomType: "Seminar Room",
      capacity: 25,
      floor: "Level 2",
      hvacZone: "Zone-BUS-L2",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 1.1,
      status: "normal",
      lastTelemetry: "7 mins ago",
      sevenDays: {
        totalKWh: 70,
        occupiedHours: 20,
        kwhPerOccupiedHour: 3.5,
        benchmarkKwhPerHour: 2.5,
        estimatedWasteKWh: 4,
        wastePercentage: 5.7,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Wall-mounted digital market display screen left running overnight",
          "AC fan running on manual low speed"
        ],
        recommendedActions: [
          "Remind occupants to switch off lights and displays after study groups.",
          "Check whether air conditioning is running in an empty room."
        ]
      },
      thirtyDays: {
        totalKWh: 305,
        occupiedHours: 87,
        kwhPerOccupiedHour: 3.5,
        benchmarkKwhPerHour: 2.5,
        estimatedWasteKWh: 17,
        wastePercentage: 5.6,
        status: "yellow",
        statusLabel: "Moderate Consumption",
        wasteCauses: [
          "Overnight display screen standby"
        ],
        recommendedActions: [
          "Connect lounge screens to smart power schedules."
        ]
      }
    },
    {
      id: "BUS-301",
      name: "BUS 301 - Conference Suite",
      buildingId: "business",
      buildingName: "Business Building",
      roomType: "Seminar Room",
      capacity: 35,
      floor: "Level 3",
      hvacZone: "Zone-BUS-L3",
      occupancyState: "Empty",
      hvacStatus: "Standby",
      lightingStatus: "Off",
      currentPowerKW: 0.6,
      status: "optimal",
      lastTelemetry: "30 mins ago",
      sevenDays: {
        totalKWh: 60,
        occupiedHours: 28,
        kwhPerOccupiedHour: 2.1,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 1,
        wastePercentage: 1.7,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Standard conference audio system standby"
        ],
        recommendedActions: [
          "Optimal energy baseline; maintain existing controls."
        ]
      },
      thirtyDays: {
        totalKWh: 265,
        occupiedHours: 124,
        kwhPerOccupiedHour: 2.1,
        benchmarkKwhPerHour: 2.4,
        estimatedWasteKWh: 4,
        wastePercentage: 1.5,
        status: "green",
        statusLabel: "Low Relative Consumption",
        wasteCauses: [
          "Negligible waste"
        ],
        recommendedActions: [
          "Continue scheduled occupancy operation."
        ]
      }
    }
  ],

  // 7-day campus aggregated daily readings
  // Sum of Engineering (1120) + Science (820) + Business (540) = 2480 kWh total
  dailyAggregated7Days: {
    labels: ["Mon, Oct 15", "Tue, Oct 16", "Wed, Oct 17", "Thu, Oct 18", "Fri, Oct 19", "Sat, Oct 20", "Sun, Oct 21"],
    shortLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    consumption: [338, 373, 384, 356, 366, 326, 337], // Sum = 2480 kWh
    baseline: [310, 310, 310, 310, 310, 270, 270],
    potentialSavings: [28, 33, 34, 26, 31, 16, 18]     // Sum = 186 kWh
  },

  // 30-day campus aggregated data for 30-day view
  dailyAggregated30Days: {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    consumption: [
      326, 340, 353, 364, 354, 316, 325,
      338, 373, 384, 356, 366, 326, 337,
      347, 364, 377, 357, 365, 314, 324,
      335, 376, 379, 351, 364, 323, 332,
      350, 367
    ], // Sum = 10,840 kWh
    baseline: Array.from({ length: 30 }, (_, i) => (i % 7 >= 5 ? 270 : 310)),
    potentialSavings: [
      24, 27, 29, 31, 28, 15, 17,
      28, 33, 34, 26, 31, 16, 18,
      29, 32, 35, 27, 30, 14, 16,
      26, 34, 36, 25, 32, 15, 17,
      28, 31
    ]
  },

  priorityActions: [
    {
      id: "act-1",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      title: "Review after-hours consumption in Engineering Building",
      category: "HVAC & Air Handling",
      severity: "high",
      severityLabel: "High Priority",
      estimatedSavings: "42 kWh / night",
      summary: "Sensors detected active heating/ventilation in unoccupied zones past 22:00 in ENG-101 and ENG-104.",
      details: "Building management sub-meters recorded persistent 6.8 kW continuous draw between 22:00 and 05:30 across 4 first-floor lecture theaters. Occupancy sensors confirmed zero human presence during this period. Automated night setback rules did not trigger due to manual override latch in room ENG-101.",
      recommendedAction: "Reset manual override latch and enforce secondary auto-revert schedule after 21:30.",
      impactEstimate: "Estimated weekly savings: 294 kWh (~$58.80 / week).",
      status: "Open",
      roomsInvolved: ["ENG-101", "ENG-104", "ENG-106"]
    },
    {
      id: "act-2",
      buildingId: "science",
      buildingName: "Science Building",
      title: "Investigate unusually high consumption in Science Building",
      category: "Laboratory Ventilation",
      severity: "high",
      severityLabel: "High Priority",
      estimatedSavings: "31 kWh / day",
      summary: "Fume hood exhaust fans in SCI-201 operating at 100% capacity during scheduled inactive lab hours.",
      details: "Biochemistry Research Lab (SCI-201) energy baseline jumped 35% above the standard benchmark for two consecutive afternoons. Sash sensors indicate 2 chemical fume hoods remained propped open past designated lab operating hours, preventing the VAV (variable air volume) dampers from stepping down to eco-idle.",
      recommendedAction: "Send automated sash-closing reminder notification to department technicians and inspect damper actuators.",
      impactEstimate: "Estimated weekly savings: 217 kWh (~$43.40 / week).",
      status: "Open",
      roomsInvolved: ["SCI-201"]
    },
    {
      id: "act-3",
      buildingId: "engineering",
      buildingName: "Engineering & Campus-wide",
      title: "Review classroom shutdown reminders",
      category: "Automation Policy",
      severity: "medium",
      severityLabel: "Medium Priority",
      estimatedSavings: "18 kWh / day",
      summary: "6 lecture halls lacked auto-power-off confirmation after 18:00 Friday sessions.",
      details: "End-of-day campus audits revealed projectors, podium AV consoles, and peripheral wall lighting remained energized across 6 rooms. The centralized scheduling gateway failed to handshake with local room occupancy relays after timetable cancellations.",
      recommendedAction: "Trigger gateway re-synchronization with timetable system and dispatch standard 15-minute auto-standby command.",
      impactEstimate: "Estimated weekly savings: 126 kWh (~$25.20 / week).",
      status: "Open",
      roomsInvolved: ["ENG-305", "ENG-204", "SCI-308", "BUS-101"]
    }
  ],

  recentAlerts: [
    {
      id: "alt-101",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      room: "ENG-101",
      category: "HVAC Override",
      severity: "critical",
      message: "Unoccupied lecture hall heating active 3.5 hrs after scheduled classes.",
      timestamp: "12 mins ago",
      currentDraw: "6.8 kW",
      read: false
    },
    {
      id: "alt-102",
      buildingId: "science",
      buildingName: "Science Building",
      room: "SCI-201",
      category: "Ventilation Surge",
      severity: "warning",
      message: "Fume hood sash left open; high-velocity exhaust fan drawing excessive load.",
      timestamp: "45 mins ago",
      currentDraw: "7.9 kW",
      read: false
    },
    {
      id: "alt-103",
      buildingId: "business",
      buildingName: "Business Building",
      room: "BUS-102",
      category: "Lighting Anomaly",
      severity: "info",
      message: "Perimeter lighting active in daylight zone without occupant presence.",
      timestamp: "2 hours ago",
      currentDraw: "1.2 kW",
      read: false
    },
    {
      id: "alt-104",
      buildingId: "engineering",
      buildingName: "Engineering Building",
      room: "ENG-305",
      category: "Standby Leak",
      severity: "warning",
      message: "CAD workstations drawing 850W phantom power outside academic hours.",
      timestamp: "3.5 hours ago",
      currentDraw: "2.1 kW",
      read: false
    },
    {
      id: "alt-105",
      buildingId: "science",
      buildingName: "Science Building",
      room: "SCI-102",
      category: "Schedule Mismatch",
      severity: "info",
      message: "Room pre-cooling triggered for cancelled guest seminar.",
      timestamp: "5 hours ago",
      currentDraw: "3.2 kW",
      read: true
    }
  ],

  // Module placeholders info for sidebar navigation
  navigationModules: {
    "overview": {
      title: "Campus Overview",
      description: "Monitor energy use. Identify waste. Improve efficiency."
    },
    "energy-heatmap": {
      title: "Energy Heatmap",
      code: "MODULE-02",
      icon: "heatmap",
      description: "Visual floor-by-floor heatmaps mapping energy intensity and thermal distribution across campus buildings.",
      nextStepFeatures: [
        "Floorplan multi-layer heat gradient visualization",
        "HVAC thermal leakage detection per wing",
        "Real-time sensor temperature overlay",
        "Spatial efficiency zone comparisons"
      ]
    },
    "classroom-analytics": {
      title: "Classroom Analytics",
      code: "MODULE-03",
      icon: "analytics",
      description: "Deep-dive granular analytics for 24 monitored lecture halls and laboratory spaces.",
      nextStepFeatures: [
        "Room-by-room kWh consumption breakdowns",
        "Occupancy vs. power correlation curves",
        "Equipment-level breakdown (Lighting, HVAC, AV, Plug loads)",
        "Historical room efficiency rankings"
      ]
    },
    "timetable-optimizer": {
      title: "Timetable Optimizer",
      code: "MODULE-04",
      icon: "calendar",
      description: "Smart academic timetable clustering to concentrate heating and lighting loads in contiguous thermal zones.",
      nextStepFeatures: [
        "Consolidation recommendations for low-density classes",
        "Simulated HVAC cost per student-hour",
        "Building wing shutdown windows",
        "Exportable schedule optimization suggestions"
      ]
    },
    "alerts-actions": {
      title: "Alerts & Actions Center",
      code: "MODULE-05",
      icon: "bell",
      description: "Centralized triage hub for active anomalies, automated alerts, and staff work orders.",
      nextStepFeatures: [
        "Automated rule-based alert triggering",
        "Facilities dispatch workflow and ticket creation",
        "Severity escalation policies",
        "Historical incident root-cause logs"
      ]
    },
    "smart-controls": {
      title: "Smart Controls & Telemetry",
      code: "MODULE-06",
      icon: "sliders",
      description: "Digital twin control panels for simulated zone setpoints, thermostat limits, and schedules.",
      nextStepFeatures: [
        "Simulated thermostat setback controls",
        "Zone-based lighting relay override simulation",
        "Emergency demand-response load shedding",
        "Occupancy sensor sensitivity adjustment"
      ]
    },
    "maintenance": {
      title: "Preventive Maintenance",
      code: "MODULE-07",
      icon: "wrench",
      description: "Condition-based monitoring for chillers, air handlers, and electrical distribution gear.",
      nextStepFeatures: [
        "Compressor efficiency degradation tracking",
        "Air filter resistance & replacement cycles",
        "Sub-meter calibration status",
        "Vendor service log management"
      ]
    },
    "dept-challenge": {
      title: "Department Green Challenge",
      code: "MODULE-08",
      icon: "trophy",
      description: "Gamified inter-faculty sustainability leaderboard and student conservation challenges.",
      nextStepFeatures: [
        "Departmental per-capita kWh rankings",
        "Monthly reduction streak badges",
        "Student & faculty pledge trackers",
        "Automated digital display kiosk feeds"
      ]
    },
    "savings-reports": {
      title: "Savings & Sustainability Reports",
      code: "MODULE-09",
      icon: "report",
      description: "Executive summaries, carbon footprint reduction calculations, and utility bill audits.",
      nextStepFeatures: [
        "Scope 1 & 2 GHG emissions reduction metrics",
        "Dollar savings conversion & financial payback graphs",
        "One-click PDF/CSV export for university trustees",
        "Custom date-range energy billing audits"
      ]
    },
    "settings": {
      title: "System Settings & Configuration",
      code: "MODULE-10",
      icon: "settings",
      description: "Global threshold configurations, utility tariff rates, and telemetry integration settings.",
      nextStepFeatures: [
        "Campus utility rate schedule ($/kWh on-peak vs off-peak)",
        "Telemetry polling frequency & data retention rules",
        "User role management (Facilities, Deans, Auditors)",
        "Simulated sensor noise and stress-test generators"
      ]
    }
  },

  // ==========================================================================
  // STEP 4: TIMETABLE OPTIMIZER & ACADEMIC SCHEDULING DATASET
  // Note: All schedules, room allocations, and energy estimates are simulated.
  // ==========================================================================
  timetable: {
    metadata: {
      activeTerm: "Fall 2026 Academic Term",
      activeWeek: "Week 6 (Current Timetable)",
      electricityTariff: 0.18, // $/kWh demo default
      totalWeeklyClasses: 33,
      consolidatableCount: 5,
      disclaimer: "Fictional academic timetable for prototype demonstration. All schedules, room allocations, and energy estimates are simulated."
    },

    timeslots: [
      { id: "slot-1", label: "08:00 - 10:00", start: "08:00", end: "10:00", period: "Morning" },
      { id: "slot-2", label: "10:00 - 12:00", start: "10:00", end: "12:00", period: "Morning" },
      { id: "slot-3", label: "12:00 - 14:00", start: "12:00", end: "14:00", period: "Midday" },
      { id: "slot-4", label: "14:00 - 16:00", start: "14:00", end: "16:00", period: "Afternoon" },
      { id: "slot-5", label: "16:00 - 18:00", start: "16:00", end: "18:00", period: "Late Afternoon" },
      { id: "slot-6", label: "18:00 - 20:00", start: "18:00", end: "20:00", period: "Evening" }
    ],

    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    dayLabels: {
      "Mon": "Monday",
      "Tue": "Tuesday",
      "Wed": "Wednesday",
      "Thu": "Thursday",
      "Fri": "Friday",
      "Sat": "Saturday"
    },

    classes: [
      // -------------------------------------------------------------
      // MONDAY CLASSES (11 Classes)
      // -------------------------------------------------------------
      {
        id: "CLS-101",
        courseCode: "ENGR-301",
        courseName: "Fluid Mechanics & Thermodynamics",
        department: "Mechanical Engineering",
        instructor: "Dr. Marcus Vance",
        roomId: "ENG-101",
        buildingId: "engineering",
        day: "Mon",
        slotId: "slot-1",
        startTime: "08:00",
        endTime: "10:00",
        durationHours: 2.0,
        enrolled: 42,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Tiered Seating", "AV Presentation"],
        powerKW: 6.8,
        sessionKWh: 13.6,
        isConsolidatable: false
      },
      {
        id: "CLS-102",
        courseCode: "ENGR-204",
        courseName: "Robotics Control Systems",
        department: "Mechatronics",
        instructor: "Prof. H. Tanaka",
        roomId: "ENG-101",
        buildingId: "engineering",
        day: "Mon",
        slotId: "slot-4",
        startTime: "14:00",
        endTime: "16:00",
        durationHours: 2.0,
        enrolled: 26,
        roomTypeNeeded: "Seminar Room",
        equipmentNeeded: ["Standard Projector"],
        powerKW: 6.8,
        sessionKWh: 13.6,
        isConsolidatable: true,
        consolidationId: "SUG-01"
      },
      {
        id: "CLS-103",
        courseCode: "ENGR-110",
        courseName: "Intro to Materials Science",
        department: "Civil & Materials Eng.",
        instructor: "Dr. Sarah Lin",
        roomId: "ENG-102",
        buildingId: "engineering",
        day: "Mon",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 78,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["AV Dual Display"],
        powerKW: 4.6,
        sessionKWh: 9.2,
        isConsolidatable: false
      },
      {
        id: "CLS-104",
        courseCode: "CS-101",
        courseName: "Foundations of Computer Science",
        department: "Computer Science",
        instructor: "Prof. Liam O'Connor",
        roomId: "ENG-104",
        buildingId: "engineering",
        day: "Mon",
        slotId: "slot-1",
        startTime: "08:00",
        endTime: "10:00",
        durationHours: 2.0,
        enrolled: 38,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["Workstations", "IDE Setup"],
        powerKW: 2.2,
        sessionKWh: 4.4,
        isConsolidatable: false
      },
      {
        id: "CLS-105",
        courseCode: "CS-205",
        courseName: "Data Structures & Algorithms",
        department: "Computer Science",
        instructor: "Dr. A. Davis",
        roomId: "ENG-104",
        buildingId: "engineering",
        day: "Mon",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 40,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["Workstations"],
        powerKW: 2.2,
        sessionKWh: 4.4,
        isConsolidatable: false
      },
      {
        id: "CLS-106",
        courseCode: "ENGR-215",
        courseName: "Mechanics of Solids Lab",
        department: "Mechanical Engineering",
        instructor: "Dr. Marcus Vance",
        roomId: "ENG-201",
        buildingId: "engineering",
        day: "Mon",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 22,
        roomTypeNeeded: "Laboratory",
        equipmentNeeded: ["Hydraulic Test Rig"],
        powerKW: 1.2,
        sessionKWh: 2.4,
        isConsolidatable: false
      },
      {
        id: "CLS-107",
        courseCode: "BIO-101",
        courseName: "Cellular & Molecular Biology",
        department: "Biological Sciences",
        instructor: "Prof. Elena Rostova",
        roomId: "SCI-101",
        buildingId: "science",
        day: "Mon",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 84,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Microscope Camera AV"],
        powerKW: 5.2,
        sessionKWh: 10.4,
        isConsolidatable: false
      },
      {
        id: "CLS-108",
        courseCode: "CHEM-201",
        courseName: "Organic Synthesis Lab",
        department: "Chemistry",
        instructor: "Dr. Victor Kim",
        roomId: "SCI-201",
        buildingId: "science",
        day: "Mon",
        slotId: "slot-4",
        startTime: "14:00",
        endTime: "16:00",
        durationHours: 2.0,
        enrolled: 26,
        roomTypeNeeded: "Laboratory",
        equipmentNeeded: ["Fume Hoods", "Chemical Sashes"],
        powerKW: 6.5,
        sessionKWh: 13.0,
        isConsolidatable: false
      },
      {
        id: "CLS-109",
        courseCode: "PHYS-202",
        courseName: "Optics & Laser Experiments",
        department: "Physics",
        instructor: "Dr. N. Thorne",
        roomId: "SCI-204",
        buildingId: "science",
        day: "Mon",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 24,
        roomTypeNeeded: "Laboratory",
        equipmentNeeded: ["Darkroom Baffles"],
        powerKW: 3.6,
        sessionKWh: 7.2,
        isConsolidatable: false
      },
      {
        id: "CLS-110",
        courseCode: "BUS-101",
        courseName: "Principles of Modern Marketing",
        department: "Business Administration",
        instructor: "K. Al-Mansoor",
        roomId: "BUS-101",
        buildingId: "business",
        day: "Mon",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 95,
        roomTypeNeeded: "Auditorium",
        equipmentNeeded: ["Auditorium Sound System"],
        powerKW: 7.5,
        sessionKWh: 15.0,
        isConsolidatable: false
      },
      {
        id: "CLS-111",
        courseCode: "FIN-305",
        courseName: "Global Financial Markets",
        department: "Finance & Economics",
        instructor: "Prof. Diane Sterling",
        roomId: "BUS-201",
        buildingId: "business",
        day: "Mon",
        slotId: "slot-4",
        startTime: "14:00",
        endTime: "16:00",
        durationHours: 2.0,
        enrolled: 38,
        roomTypeNeeded: "Case Study Room",
        equipmentNeeded: ["Tiered U-Shape Table"],
        powerKW: 2.4,
        sessionKWh: 4.8,
        isConsolidatable: false
      },

      // -------------------------------------------------------------
      // TUESDAY CLASSES (7 Classes)
      // -------------------------------------------------------------
      {
        id: "CLS-201",
        courseCode: "ENGR-102",
        courseName: "Engineering Mathematics I",
        department: "Mathematics & Engineering",
        instructor: "Dr. Sarah Lin",
        roomId: "ENG-102",
        buildingId: "engineering",
        day: "Tue",
        slotId: "slot-1",
        startTime: "08:00",
        endTime: "10:00",
        durationHours: 2.0,
        enrolled: 80,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Dual Projector"],
        powerKW: 4.6,
        sessionKWh: 9.2,
        isConsolidatable: false
      },
      {
        id: "CLS-202",
        courseCode: "ENGR-220",
        courseName: "Electrical Circuits & Signals",
        department: "Electrical Engineering",
        instructor: "Prof. H. Tanaka",
        roomId: "ENG-102",
        buildingId: "engineering",
        day: "Tue",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 65,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Circuit Simulator AV"],
        powerKW: 4.6,
        sessionKWh: 9.2,
        isConsolidatable: false
      },
      {
        id: "CLS-203",
        courseCode: "CS-108",
        courseName: "Applied Python Laboratory",
        department: "Computer Science",
        instructor: "Prof. Liam O'Connor",
        roomId: "ENG-104",
        buildingId: "engineering",
        day: "Tue",
        slotId: "slot-5",
        startTime: "16:00",
        endTime: "18:00",
        durationHours: 2.0,
        enrolled: 30,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["Workstations"],
        powerKW: 2.2,
        sessionKWh: 4.4,
        isConsolidatable: true,
        consolidationId: "SUG-04"
      },
      {
        id: "CLS-204",
        courseCode: "CS-302",
        courseName: "CAD & Structural Modeling Studio",
        department: "Civil Engineering",
        instructor: "Dr. Marcus Vance",
        roomId: "ENG-301",
        buildingId: "engineering",
        day: "Tue",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 34,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["CAD GPU Terminals"],
        powerKW: 3.8,
        sessionKWh: 7.6,
        isConsolidatable: false
      },
      {
        id: "CLS-205",
        courseCode: "CHEM-102",
        courseName: "General Chemistry Principles",
        department: "Chemistry",
        instructor: "Dr. Victor Kim",
        roomId: "SCI-102",
        buildingId: "science",
        day: "Tue",
        slotId: "slot-1",
        startTime: "08:00",
        endTime: "10:00",
        durationHours: 2.0,
        enrolled: 72,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Periodic Table Display"],
        powerKW: 4.4,
        sessionKWh: 8.8,
        isConsolidatable: false
      },
      {
        id: "CLS-206",
        courseCode: "BIO-210",
        courseName: "Genetics & Genomics",
        department: "Biological Sciences",
        instructor: "Prof. Elena Rostova",
        roomId: "SCI-102",
        buildingId: "science",
        day: "Tue",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 55,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Standard AV"],
        powerKW: 4.4,
        sessionKWh: 8.8,
        isConsolidatable: false
      },
      {
        id: "CLS-207",
        courseCode: "MGMT-201",
        courseName: "Organizational Behavior Seminar",
        department: "Management",
        instructor: "K. Al-Mansoor",
        roomId: "BUS-102",
        buildingId: "business",
        day: "Tue",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 40,
        roomTypeNeeded: "Seminar Room",
        equipmentNeeded: ["Discussion Whiteboards"],
        powerKW: 2.0,
        sessionKWh: 4.0,
        isConsolidatable: false
      },

      // -------------------------------------------------------------
      // WEDNESDAY CLASSES (6 Classes)
      // -------------------------------------------------------------
      {
        id: "CLS-301",
        courseCode: "ENGR-401",
        courseName: "Senior Engineering Design Hub",
        department: "Mechanical Engineering",
        instructor: "Dr. Marcus Vance",
        roomId: "ENG-310",
        buildingId: "engineering",
        day: "Wed",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 45,
        roomTypeNeeded: "Seminar Room",
        equipmentNeeded: ["Collaborative Benches"],
        powerKW: 2.5,
        sessionKWh: 5.0,
        isConsolidatable: false
      },
      {
        id: "CLS-302",
        courseCode: "CS-220",
        courseName: "Database Systems & Architecture",
        department: "Computer Science",
        instructor: "Dr. A. Davis",
        roomId: "ENG-304",
        buildingId: "engineering",
        day: "Wed",
        slotId: "slot-4",
        startTime: "14:00",
        endTime: "16:00",
        durationHours: 2.0,
        enrolled: 30,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["SQL Database Server"],
        powerKW: 2.0,
        sessionKWh: 4.0,
        isConsolidatable: false
      },
      {
        id: "CLS-303",
        courseCode: "BIO-305",
        courseName: "Microbiology & Immunology",
        department: "Biological Sciences",
        instructor: "Prof. Elena Rostova",
        roomId: "SCI-101",
        buildingId: "science",
        day: "Wed",
        slotId: "slot-1",
        startTime: "08:00",
        endTime: "10:00",
        durationHours: 2.0,
        enrolled: 60,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["AV Setup"],
        powerKW: 5.2,
        sessionKWh: 10.4,
        isConsolidatable: false
      },
      {
        id: "CLS-304",
        courseCode: "CHEM-105",
        courseName: "General Chemistry Tutorial",
        department: "Chemistry",
        instructor: "Dr. Victor Kim",
        roomId: "SCI-305",
        buildingId: "science",
        day: "Wed",
        slotId: "slot-4",
        startTime: "14:00",
        endTime: "16:00",
        durationHours: 2.0,
        enrolled: 22,
        roomTypeNeeded: "Seminar Room",
        equipmentNeeded: ["Standard AV"],
        powerKW: 1.6,
        sessionKWh: 3.2,
        isConsolidatable: true,
        consolidationId: "SUG-02"
      },
      {
        id: "CLS-305",
        courseCode: "ENV-201",
        courseName: "Environmental System Dynamics",
        department: "Environmental Sciences",
        instructor: "Dr. N. Thorne",
        roomId: "SCI-301",
        buildingId: "science",
        day: "Wed",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 20,
        roomTypeNeeded: "Laboratory",
        equipmentNeeded: ["GIS Terminals"],
        powerKW: 2.8,
        sessionKWh: 5.6,
        isConsolidatable: false
      },
      {
        id: "CLS-306",
        courseCode: "MKTG-402",
        courseName: "Consumer Behavior Research",
        department: "Business Administration",
        instructor: "Prof. Diane Sterling",
        roomId: "BUS-201",
        buildingId: "business",
        day: "Wed",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 42,
        roomTypeNeeded: "Case Study Room",
        equipmentNeeded: ["Discussion Mic System"],
        powerKW: 2.4,
        sessionKWh: 4.8,
        isConsolidatable: false
      },

      // -------------------------------------------------------------
      // THURSDAY CLASSES (5 Classes)
      // -------------------------------------------------------------
      {
        id: "CLS-401",
        courseCode: "ENGR-315",
        courseName: "Control Systems Lab",
        department: "Mechatronics",
        instructor: "Prof. H. Tanaka",
        roomId: "ENG-204",
        buildingId: "engineering",
        day: "Thu",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 30,
        roomTypeNeeded: "Laboratory",
        equipmentNeeded: ["Robotics Arms"],
        powerKW: 4.2,
        sessionKWh: 8.4,
        isConsolidatable: false
      },
      {
        id: "CLS-402",
        courseCode: "ENGR-105",
        courseName: "Engineering Graphic Communication",
        department: "Civil Engineering",
        instructor: "Dr. Sarah Lin",
        roomId: "ENG-301",
        buildingId: "engineering",
        day: "Thu",
        slotId: "slot-4",
        startTime: "14:00",
        endTime: "16:00",
        durationHours: 2.0,
        enrolled: 35,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["Drafting Screens"],
        powerKW: 3.8,
        sessionKWh: 7.6,
        isConsolidatable: false
      },
      {
        id: "CLS-403",
        courseCode: "PHYS-101",
        courseName: "Physics for Engineering Majors",
        department: "Physics",
        instructor: "Dr. N. Thorne",
        roomId: "SCI-101",
        buildingId: "science",
        day: "Thu",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 90,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Large Hall Audio"],
        powerKW: 5.2,
        sessionKWh: 10.4,
        isConsolidatable: false
      },
      {
        id: "CLS-404",
        courseCode: "BUS-301",
        courseName: "Corporate Governance Seminar",
        department: "Business Administration",
        instructor: "K. Al-Mansoor",
        roomId: "BUS-101",
        buildingId: "business",
        day: "Thu",
        slotId: "slot-5",
        startTime: "16:00",
        endTime: "18:00",
        durationHours: 2.0,
        enrolled: 28,
        roomTypeNeeded: "Case Study Room",
        equipmentNeeded: ["AV System"],
        powerKW: 7.5,
        sessionKWh: 15.0,
        isConsolidatable: true,
        consolidationId: "SUG-03"
      },
      {
        id: "CLS-405",
        courseCode: "FIN-410",
        courseName: "Applied Algorithmic Trading",
        department: "Finance & Economics",
        instructor: "Prof. Diane Sterling",
        roomId: "BUS-202",
        buildingId: "business",
        day: "Thu",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 28,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["Trading Terminals"],
        powerKW: 3.2,
        sessionKWh: 6.4,
        isConsolidatable: false
      },

      // -------------------------------------------------------------
      // FRIDAY CLASSES (4 Classes)
      // -------------------------------------------------------------
      {
        id: "CLS-501",
        courseCode: "ENGR-201",
        courseName: "Thermodynamics Tutorial",
        department: "Mechanical Engineering",
        instructor: "Dr. Marcus Vance",
        roomId: "ENG-208",
        buildingId: "engineering",
        day: "Fri",
        slotId: "slot-1",
        startTime: "08:00",
        endTime: "10:00",
        durationHours: 2.0,
        enrolled: 35,
        roomTypeNeeded: "Seminar Room",
        equipmentNeeded: ["Whiteboards"],
        powerKW: 2.1,
        sessionKWh: 4.2,
        isConsolidatable: false
      },
      {
        id: "CLS-502",
        courseCode: "CS-310",
        courseName: "Cloud Systems & Web Architecture",
        department: "Computer Science",
        instructor: "Dr. A. Davis",
        roomId: "ENG-104",
        buildingId: "engineering",
        day: "Fri",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 42,
        roomTypeNeeded: "Computer Lab",
        equipmentNeeded: ["Cloud Workstations"],
        powerKW: 2.2,
        sessionKWh: 4.4,
        isConsolidatable: false
      },
      {
        id: "CLS-503",
        courseCode: "CHEM-301",
        courseName: "Advanced Inorganic Chemistry",
        department: "Chemistry",
        instructor: "Dr. Victor Kim",
        roomId: "SCI-102",
        buildingId: "science",
        day: "Fri",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 50,
        roomTypeNeeded: "Lecture Theater",
        equipmentNeeded: ["Dual Projector"],
        powerKW: 4.4,
        sessionKWh: 8.8,
        isConsolidatable: false
      },
      {
        id: "CLS-504",
        courseCode: "BUS-105",
        courseName: "Business Law & Ethical Practice",
        department: "Management",
        instructor: "K. Al-Mansoor",
        roomId: "BUS-102",
        buildingId: "business",
        day: "Fri",
        slotId: "slot-3",
        startTime: "12:00",
        endTime: "14:00",
        durationHours: 2.0,
        enrolled: 40,
        roomTypeNeeded: "Seminar Room",
        equipmentNeeded: ["Standard AV"],
        powerKW: 2.0,
        sessionKWh: 4.0,
        isConsolidatable: false
      },

      // -------------------------------------------------------------
      // SATURDAY CLASSES (2 Classes - Executive Seminars)
      // -------------------------------------------------------------
      {
        id: "CLS-601",
        courseCode: "BUS-601",
        courseName: "Executive Leadership & Strategy",
        department: "Graduate Business School",
        instructor: "K. Al-Mansoor",
        roomId: "BUS-101",
        buildingId: "business",
        day: "Sat",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 32,
        roomTypeNeeded: "Auditorium",
        equipmentNeeded: ["AV Audio Suite"],
        powerKW: 7.5,
        sessionKWh: 15.0,
        isConsolidatable: true,
        consolidationId: "SUG-05"
      },
      {
        id: "CLS-602",
        courseCode: "ENGR-501",
        courseName: "Professional Engineering Licensure",
        department: "Continuing Education",
        instructor: "Dr. Sarah Lin",
        roomId: "ENG-102",
        buildingId: "engineering",
        day: "Sat",
        slotId: "slot-2",
        startTime: "10:00",
        endTime: "12:00",
        durationHours: 2.0,
        enrolled: 25,
        roomTypeNeeded: "Seminar Room",
        equipmentNeeded: ["Standard Projector"],
        powerKW: 4.6,
        sessionKWh: 9.2,
        isConsolidatable: true,
        consolidationId: "SUG-05"
      }
    ],

    suggestions: [
      {
        id: "SUG-01",
        type: "Oversized Room Consolidation",
        title: "Relocate ENGR-204 to Seminar Room ENG-208",
        day: "Mon",
        buildingId: "engineering",
        classId: "CLS-102",
        courseCode: "ENGR-204",
        currentRoomId: "ENG-101",
        proposedRoomId: "ENG-208",
        slotId: "slot-4",
        timeRange: "14:00 - 16:00",
        enrolled: 26,
        currentRoomType: "Lecture Theater",
        currentCapacity: 120,
        currentPowerKW: 6.8,
        proposedRoomType: "Seminar Room",
        proposedCapacity: 40,
        proposedPowerKW: 2.1,
        avoidableHours: 2.0,
        potentialEnergyKWh: 9.4, // (6.8 kW - 2.1 kW) * 2.0h
        estimatedCostSavings: 1.69, // 9.4 kWh * $0.18
        confidence: "High",
        confidenceReason: "Capacity margin is 14 seats (+53%); both rooms in Engineering Building with standard AV equipment.",
        reason: "ENG-101 (120 seats, 6.8 kW) is kept running in the afternoon solely for 26 attendees. Vacant seminar room ENG-208 (40 seats, 2.1 kW) easily accommodates this cohort, allowing ENG-101 HVAC to power down 2 hours earlier after morning sessions.",
        calculationFormula: "(Current Room Draw: 6.8 kW - Proposed Room Draw: 2.1 kW) × 2.0 Operating Hours = 9.4 kWh avoided",
        adminConstraints: [
          "Confirm instructor approval for whiteboard-centric teaching layout.",
          "Verify standard presentation AV equipment in ENG-208 meets course needs.",
          "Check student elevator transit between Level 1 and Level 2."
        ]
      },
      {
        id: "SUG-02",
        type: "Thermal Wing Early Setback",
        title: "Consolidate Level 3 Tutorial into Level 1 Seminar Room",
        day: "Wed",
        buildingId: "science",
        classId: "CLS-304",
        courseCode: "CHEM-105",
        currentRoomId: "SCI-305",
        proposedRoomId: "SCI-105",
        slotId: "slot-4",
        timeRange: "14:00 - 16:00",
        enrolled: 22,
        currentRoomType: "Seminar Room",
        currentCapacity: 35,
        currentPowerKW: 1.6,
        proposedRoomType: "Seminar Room",
        proposedCapacity: 35,
        proposedPowerKW: 1.8,
        avoidableHours: 2.5,
        potentialEnergyKWh: 13.5, // Level 3 AHU zone shutdown credit: 5.4 kW * 2.5h
        estimatedCostSavings: 2.43,
        confidence: "High",
        confidenceReason: "Identical room type (Seminar, 35 seats); both equipped with identical projector displays.",
        reason: "CHEM-105 is the sole afternoon class on Level 3 of Science Building. Moving it to vacant Level 1 room SCI-105 allows the entire Level 3 Air Handling Unit (AHU) and corridor lighting zone to enter night setback 2.5 hours early.",
        calculationFormula: "Level 3 AHU Zone Setback: 5.4 kW × 2.5 Hours Early Shutdown = 13.5 kWh avoided",
        adminConstraints: [
          "Confirm elevator and stairwell accessibility between Level 1 and Level 3.",
          "Notify teaching assistants of room change to SCI-105."
        ]
      },
      {
        id: "SUG-03",
        type: "Auditorium Load Shedding",
        title: "Move Corporate Governance from Auditorium to Case Study Room",
        day: "Thu",
        buildingId: "business",
        classId: "CLS-404",
        courseCode: "BUS-301",
        currentRoomId: "BUS-101",
        proposedRoomId: "BUS-201",
        slotId: "slot-5",
        timeRange: "16:00 - 18:00",
        enrolled: 28,
        currentRoomType: "Auditorium",
        currentCapacity: 150,
        currentPowerKW: 7.5,
        proposedRoomType: "Case Study Room",
        proposedCapacity: 50,
        proposedPowerKW: 2.4,
        avoidableHours: 2.0,
        potentialEnergyKWh: 10.2, // (7.5 kW - 2.4 kW) * 2.0h
        estimatedCostSavings: 1.84,
        confidence: "High",
        confidenceReason: "Class size 28 is under 50-seat capacity; Case Study Room provides superior interactive acoustics.",
        reason: "BUS-301 attendance of 28 occupies less than 20% of the 150-seat Executive Auditorium (7.5 kW). Relocating to BUS-201 (50 seats, 2.4 kW) eliminates massive chiller airflow and permits the ground-floor auditorium to shut down.",
        calculationFormula: "(Auditorium Draw: 7.5 kW - Case Study Room Draw: 2.4 kW) × 2.0 Hours = 10.2 kWh avoided",
        adminConstraints: [
          "Verify instructor agrees with horseshoe case-study layout vs auditorium podium.",
          "Check registration list for any last-minute student additions over 50."
        ]
      },
      {
        id: "SUG-04",
        type: "Idle Gap Elimination",
        title: "Reschedule Applied Python Lab into Contiguous Midday Block",
        day: "Tue",
        buildingId: "engineering",
        classId: "CLS-203",
        courseCode: "CS-108",
        currentRoomId: "ENG-104",
        proposedRoomId: "ENG-104",
        slotId: "slot-3", // moved from slot-5 (16:00-18:00) to slot-3 (12:00-14:00)
        timeRange: "12:00 - 14:00",
        enrolled: 30,
        currentRoomType: "Computer Lab",
        currentCapacity: 45,
        currentPowerKW: 2.2,
        proposedRoomType: "Computer Lab",
        proposedCapacity: 45,
        proposedPowerKW: 2.2,
        avoidableHours: 4.0,
        potentialEnergyKWh: 8.8, // 2.2 kW idle * 4.0h
        estimatedCostSavings: 1.58,
        confidence: "Medium",
        confidenceReason: "Same room and equipment; requires checking student cohort timetable compatibility.",
        reason: "ENG-104 sits empty for 4 hours between 12:00 and 16:00 with workstations idling. Moving CS-108 to 12:00 creates contiguous lab teaching, allowing full PC shutdown at 14:00 instead of 18:00.",
        calculationFormula: "Computer Lab Standby Power: 2.2 kW × 4.0 Vacant Idle Hours Avoided = 8.8 kWh avoided",
        adminConstraints: [
          "Requires student cohort schedule conflict check with registrar.",
          "Confirm teaching assistant availability during the 12:00 - 14:00 slot."
        ]
      },
      {
        id: "SUG-05",
        type: "Weekend Building Clustering",
        title: "Consolidate Saturday Seminars into Single Building Zone",
        day: "Sat",
        buildingId: "all",
        classId: "CLS-602",
        courseCode: "ENGR-501",
        currentRoomId: "ENG-102",
        proposedRoomId: "BUS-201",
        slotId: "slot-2",
        timeRange: "10:00 - 12:00",
        enrolled: 25,
        currentRoomType: "Seminar Room",
        currentCapacity: 100,
        currentPowerKW: 4.6,
        proposedRoomType: "Case Study Room",
        proposedCapacity: 50,
        proposedPowerKW: 2.4,
        avoidableHours: 4.0,
        potentialEnergyKWh: 18.4, // Engineering Building chiller startup avoided
        estimatedCostSavings: 3.31,
        confidence: "Medium",
        confidenceReason: "Enables Engineering Building chiller plant to stay off all Saturday; inter-building move.",
        reason: "Only one class runs in Engineering on Saturday. Moving ENGR-501 into Business Building (where executive programs already operate) allows Engineering Building chiller and air handlers to stay in weekend setback all day.",
        calculationFormula: "Engineering Building Chiller Plant Setback: 4.6 kW × 4.0 Hours Avoided = 18.4 kWh avoided",
        adminConstraints: [
          "Requires inter-faculty agreement between Engineering and Business faculties.",
          "Issue temporary Saturday electronic keycard access for engineering students."
        ]
      }
    ]
  },

  // ==========================================================================
  // STEP 5: ALERTS & ACTIONS DATASET
  // Note: All readings, anomalies, and estimates are simulated demo data.
  // ==========================================================================
  alertsModule: {
    metadata: {
      title: "Alerts & Actions Center",
      disclaimer: "Simulated prototype data. Missing readings are classified as data-quality issues, not proof of energy waste.",
      lastScanTime: "Just now (Automated Rule Scan)",
      rulesCount: 6
    },

    thresholds: {
      afterHoursThresholdKW: 1.5,
      intensityExcessPercent: 40,
      baselineSurgePercent: 25,
      unoccupiedHoursThreshold: 2.0,
      packetLossHoursThreshold: 3.0
    },

    alerts: [
      {
        id: "ALT-101",
        title: "Unoccupied After-Hours HVAC Draw in Lecture Hall",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-101",
        category: "After-Hours Consumption",
        severity: "critical",
        severityLabel: "Critical",
        timestamp: "Today, 02:45 AM",
        dateCategory: "today",
        currentDraw: "6.8 kW",
        baselineStandby: "0.4 kW",
        reason: "Heating and high-velocity ventilation operating continuously 4.5 hours after scheduled classes ended. Thermostat override active with zero detected occupants.",
        ruleTriggered: "After-Hours Anomaly: Active draw (6.8 kW) exceeded 1.5 kW threshold during scheduled off-hours (22:00 - 05:00).",
        recommendedAction: "Reset physical BACnet manual override latch in ENG-101 and enforce automated night setback to 16°C.",
        status: "new",
        isDataQuality: false,
        potentialWasteKWh: 28.8,
        potentialSavingsCost: 5.18,
        readingsAvailable: true
      },
      {
        id: "ALT-102",
        title: "Excessive Laboratory Ventilation Draw in Organic Lab",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-201",
        category: "High Energy Intensity",
        severity: "high",
        severityLabel: "High",
        timestamp: "Today, 09:15 AM",
        dateCategory: "today",
        currentDraw: "7.9 kW",
        baselineStandby: "3.5 kW",
        reason: "Fume hood exhaust sash left propped open past designated lab operating hours, forcing high-velocity exhaust fans to operate at 100% capacity.",
        ruleTriggered: "High Intensity Anomaly: Measured intensity (11.2 kWh/occ-hr) exceeded laboratory benchmark of 4.2 kWh/occ-hr by +166% (>40% threshold).",
        recommendedAction: "Notify Chemistry Department laboratory technician to inspect sash latches and confirm VAV damper modulates to eco-idle.",
        status: "acknowledged",
        isDataQuality: false,
        potentialWasteKWh: 17.6,
        potentialSavingsCost: 3.17,
        readingsAvailable: true
      },
      {
        id: "ALT-103",
        title: "Unoccupied Conditioning for Cancelled Academic Class",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-102",
        category: "Unoccupied Load Anomaly",
        severity: "medium",
        severityLabel: "Medium",
        timestamp: "Yesterday, 04:30 PM",
        dateCategory: "yesterday",
        currentDraw: "3.2 kW",
        baselineStandby: "0.5 kW",
        reason: "Pre-cooling cycle triggered for a tutorial session that was cancelled in the academic schedule. Space remained empty for 3.0 consecutive hours.",
        ruleTriggered: "Unoccupied Conditioning Rule: Active draw sustained for > 2.0 hours with 0 recorded attendees.",
        recommendedAction: "Integrate timetable optimizer cancellation feeds into central air handler controller to dynamically cancel pre-cooling.",
        status: "new",
        isDataQuality: false,
        potentialWasteKWh: 8.1,
        potentialSavingsCost: 1.46,
        readingsAvailable: true
      },
      {
        id: "ALT-104",
        title: "CAD Studio Workstations High Standby Phantom Draw",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-305",
        category: "Baseline Surge",
        severity: "medium",
        severityLabel: "Medium",
        timestamp: "Yesterday, 11:20 PM",
        dateCategory: "yesterday",
        currentDraw: "2.1 kW",
        baselineStandby: "0.85 kW",
        reason: "32 high-performance GPU drafting terminals remained energized in sleep-disabled mode overnight following evening lab session.",
        ruleTriggered: "Baseline Surge Rule: Standby power increased by +147% over the established 30-day baseline (>25% surge threshold).",
        recommendedAction: "Push automated operating system power management sleep policy at 21:00 and enable wake-on-LAN for remote updates.",
        status: "new",
        isDataQuality: false,
        potentialWasteKWh: 10.0,
        potentialSavingsCost: 1.80,
        readingsAvailable: true
      },
      {
        id: "ALT-105",
        title: "Auditorium Chiller Running 2.5 Hours Post-Session",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-101",
        category: "HVAC Setback / Shutdown",
        severity: "high",
        severityLabel: "High",
        timestamp: "Today, 01:10 PM",
        dateCategory: "today",
        currentDraw: "7.5 kW",
        baselineStandby: "1.2 kW",
        reason: "150-seat executive auditorium air handling unit left running at full cooling capacity after morning marketing seminar concluded at 12:00.",
        ruleTriggered: "Shutdown Delay Rule: HVAC cooling load active > 1 hour after timetable scheduled end-time with vacancy confirmed.",
        recommendedAction: "Verify automated shutdown handshake between timetable optimizer and central building automation supervisory system.",
        status: "new",
        isDataQuality: false,
        potentialWasteKWh: 15.75,
        potentialSavingsCost: 2.84,
        readingsAvailable: true
      },
      {
        id: "ALT-106",
        title: "Telemetry Interruption: Sub-Meter Heartbeat Lost",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-301",
        category: "Data Quality / Sensor Gap",
        severity: "low",
        severityLabel: "Low",
        timestamp: "Today, 06:00 AM",
        dateCategory: "today",
        currentDraw: "Telemetry Offline",
        baselineStandby: "Unknown",
        reason: "Sub-meter Modbus gateway stopped transmitting telemetry 4.2 hours ago. 18 consecutive polling intervals dropped.",
        ruleTriggered: "Data Quality Rule: Expected sensor packets missing for > 3.0 hours. Telemetry unavailable.",
        recommendedAction: "Inspect network switch port 14 in Business Building IDF closet and power-cycle sub-meter gateway.",
        status: "new",
        isDataQuality: true,
        dataQualityNotice: "Data Quality Notice: Missing sensor readings indicate a telemetry communication gap. This is not proof of energy waste.",
        potentialWasteKWh: 0.0,
        potentialSavingsCost: 0.00,
        readingsAvailable: false
      },
      {
        id: "ALT-107",
        title: "Perimeter Lighting Active in High Daylight Zone",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-102",
        category: "Lighting Anomaly",
        severity: "low",
        severityLabel: "Low",
        timestamp: "2 days ago",
        dateCategory: "older",
        currentDraw: "1.2 kW",
        baselineStandby: "0.2 kW",
        reason: "South-facing perimeter luminaires drawing 1.2 kW during peak solar noon conditions despite natural illuminance exceeding 650 lux.",
        ruleTriggered: "Daylight Harvesting Anomaly: Perimeter lighting active during high natural daylight window.",
        recommendedAction: "Recalibrate window photocell threshold and re-enable automated daylight dimming curve.",
        status: "resolved",
        isDataQuality: false,
        potentialWasteKWh: 4.8,
        potentialSavingsCost: 0.86,
        readingsAvailable: true
      },
      {
        id: "ALT-108",
        title: "Hydraulic Test Bench Auxiliary Pump Left Energized",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-201",
        category: "Equipment Standby",
        severity: "medium",
        severityLabel: "Medium",
        timestamp: "2 days ago",
        dateCategory: "older",
        currentDraw: "1.8 kW",
        baselineStandby: "0.1 kW",
        reason: "Fluid dynamics test bench auxiliary recirculation pump ran dry for 6 hours overnight outside lab operational schedule.",
        ruleTriggered: "Standby Equipment Anomaly: Specialized test load active overnight outside academic booking hours.",
        recommendedAction: "Fit secondary interlock relay to cut test bench auxiliary supply when master lab lighting relay drops.",
        status: "acknowledged",
        isDataQuality: false,
        potentialWasteKWh: 10.2,
        potentialSavingsCost: 1.84,
        readingsAvailable: true
      }
    ],

    recommendedActions: [
      {
        id: "ACT-01",
        title: "Inspect after-hours HVAC override in Engineering Building",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-101",
        priority: "critical",
        priorityLabel: "Critical Priority",
        category: "HVAC & Night Setback",
        reason: "Persistent 6.8 kW continuous draw past 22:00 in unoccupied lecture theater.",
        expectedBenefit: "Estimated ~28.8 kWh/night (~$5.18/night) avoidable conditioning waste.",
        relatedAlertId: "ALT-101",
        status: "pending"
      },
      {
        id: "ACT-02",
        title: "Enforce fume hood sash closure protocol in Science Building",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-201",
        priority: "high",
        priorityLabel: "High Priority",
        category: "Laboratory Ventilation",
        reason: "Exhaust fans idling at 100% capacity due to propped chemical sash during inactive hours.",
        expectedBenefit: "Estimated ~17.6 kWh/day (~$3.17/day) avoidable fan power.",
        relatedAlertId: "ALT-102",
        status: "in-progress"
      },
      {
        id: "ACT-03",
        title: "Synchronize auditorium chiller shutdown with timetable departures",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-101",
        priority: "high",
        priorityLabel: "High Priority",
        category: "Air Conditioning",
        reason: "Auditorium AHU left running for 2.5 hours after midday lecture sessions.",
        expectedBenefit: "Estimated ~15.8 kWh/session (~$2.84/session) avoidable chiller draw.",
        relatedAlertId: "ALT-105",
        status: "pending"
      },
      {
        id: "ACT-04",
        title: "Deploy automated sleep policy for CAD computer lab workstations",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-305",
        priority: "medium",
        priorityLabel: "Medium Priority",
        category: "Workstation Standby",
        reason: "32 workstations drawing phantom standby load of 2.1 kW overnight.",
        expectedBenefit: "Estimated ~10.0 kWh/night (~$1.80/night) avoidable standby electricity.",
        relatedAlertId: "ALT-104",
        status: "pending"
      },
      {
        id: "ACT-05",
        title: "Investigate telemetry packet loss at Business Building IoT gateway",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-301",
        priority: "low",
        priorityLabel: "Low Priority",
        category: "Data Quality & Metering",
        reason: "Missing telemetry packets prevent automated anomaly detection. Sub-meter offline.",
        expectedBenefit: "Restores telemetry observability and reporting accuracy (Data quality recovery; no direct kWh savings claimed).",
        relatedAlertId: "ALT-106",
        status: "pending"
      }
    ]
  },

  // ==========================================================================
  // STEP 6: SMART CONTROLS SIMULATOR DATASET
  // Note: All devices, power ratings, and control states are simulated demo models.
  // No physical hardware, relays, or IoT devices are connected.
  // ==========================================================================
  smartControlsModule: {
    metadata: {
      title: "Smart Controls Simulator",
      subtitle: "Simulate energy-saving actions for unoccupied classrooms.",
      disclaimer: "Simulation only — no physical devices are connected.",
      tariffRate: 0.18,              // USD per kWh
      co2KgPerKWh: 0.42,             // kg CO2e per kWh
      defaultAutoShutdownDelay: 4,   // Seconds countdown for interactive demo
      demoOperatingModes: ["manual", "automatic"]
    },

    deviceTypes: {
      air_conditioner: { label: "Air Conditioner / HVAC", defaultPowerKW: 3.5, category: "HVAC" },
      lighting: { label: "Ceiling Lighting Grid", defaultPowerKW: 0.8, category: "Lighting" },
      fans: { label: "Circulation Fans", defaultPowerKW: 0.35, category: "Ventilation" },
      projector: { label: "Digital Projector & AV", defaultPowerKW: 0.45, category: "AV Equipment" },
      workstations: { label: "Lab Workstations Bank", defaultPowerKW: 2.1, category: "IT Equipment" },
      specialized_equipment: { label: "Specialized Lab Unit", defaultPowerKW: 2.4, category: "Lab Equipment" },
      safety_exhaust: { label: "Safety Baseline Exhaust", defaultPowerKW: 2.2, category: "Safety System" }
    },

    initialRooms: [
      // -------------------------------------------------------------
      // ENGINEERING BUILDING (10 Classrooms)
      // -------------------------------------------------------------
      {
        roomId: "ENG-101",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Lecture Theater Alpha",
        roomType: "Lecture Theater",
        capacity: 120,
        floor: "Level 1",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "ENG-101-ac", name: "Central HVAC Inverter", type: "air_conditioner", powerKW: 4.2, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-101-lt", name: "Tiered Stage & Room Lights", type: "lighting", powerKW: 1.0, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-101-fn", name: "Auxiliary Circulation Fans", type: "fans", powerKW: 0.35, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-101-pj", name: "Dual Laser Projector Rig", type: "projector", powerKW: 0.45, state: "on", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "ENG-102",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Standard Classroom 102",
        roomType: "Classroom",
        capacity: 45,
        floor: "Level 1",
        occupancyStatus: "occupied",
        scheduleStatus: "scheduled",
        scheduledClassName: "MECH 102 - Statics & Dynamics",
        devices: [
          { id: "ENG-102-ac", name: "Split Air Conditioner", type: "air_conditioner", powerKW: 2.8, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-102-lt", name: "LED Panel Grid", type: "lighting", powerKW: 0.6, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-102-fn", name: "Ceiling Fans", type: "fans", powerKW: 0.3, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-102-pj", name: "Smart Display Podium", type: "projector", powerKW: 0.35, state: "on", manualOverride: false, isEssential: false, scheduled: true }
        ]
      },
      {
        roomId: "ENG-103",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Standard Classroom 103",
        roomType: "Classroom",
        capacity: 40,
        floor: "Level 1",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "ENG-103-ac", name: "Split Air Conditioner", type: "air_conditioner", powerKW: 2.8, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-103-lt", name: "LED Panel Grid", type: "lighting", powerKW: 0.6, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-103-fn", name: "Ceiling Fans", type: "fans", powerKW: 0.3, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-103-pj", name: "Smart Display", type: "projector", powerKW: 0.35, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "ENG-201",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Mechanical Lab 201",
        roomType: "Laboratory",
        capacity: 30,
        floor: "Level 2",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "ENG-201-ac", name: "HVAC Zone Modulator", type: "air_conditioner", powerKW: 3.5, state: "on", manualOverride: true, isEssential: false, scheduled: false },
          { id: "ENG-201-lt", name: "High-Bay Fluorescent Troffers", type: "lighting", powerKW: 0.9, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-201-eq", name: "Hydraulic Pump Safety Return", type: "specialized_equipment", powerKW: 2.2, state: "on", manualOverride: false, isEssential: true, scheduled: false }
        ]
      },
      {
        roomId: "ENG-202",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Seminar Room 202",
        roomType: "Seminar Room",
        capacity: 35,
        floor: "Level 2",
        occupancyStatus: "occupied",
        scheduleStatus: "scheduled",
        scheduledClassName: "ELEC 205 - Circuits Theory",
        devices: [
          { id: "ENG-202-ac", name: "Split Air Conditioner", type: "air_conditioner", powerKW: 2.6, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-202-lt", name: "Dimmable Downlights", type: "lighting", powerKW: 0.55, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-202-pj", name: "Interactive Smartboard", type: "projector", powerKW: 0.35, state: "on", manualOverride: false, isEssential: false, scheduled: true }
        ]
      },
      {
        roomId: "ENG-203",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Classroom 203",
        roomType: "Classroom",
        capacity: 50,
        floor: "Level 2",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "ENG-203-ac", name: "Split Air Conditioner", type: "air_conditioner", powerKW: 3.2, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-203-lt", name: "Fluorescent Troffers", type: "lighting", powerKW: 0.7, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-203-fn", name: "Ceiling Fans", type: "fans", powerKW: 0.35, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-203-pj", name: "Digital Projector", type: "projector", powerKW: 0.4, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "ENG-204",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Workshop 204",
        roomType: "Workshop",
        capacity: 25,
        floor: "Level 2",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "ENG-204-ac", name: "Industrial Split AC", type: "air_conditioner", powerKW: 3.0, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-204-lt", name: "LED High-Bays", type: "lighting", powerKW: 0.8, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-204-fn", name: "Exhaust Wall Fan", type: "fans", powerKW: 0.4, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "ENG-301",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Computer Lab 301",
        roomType: "Computer Lab",
        capacity: 60,
        floor: "Level 3",
        occupancyStatus: "occupied",
        scheduleStatus: "scheduled",
        scheduledClassName: "CS 301 - Embedded Systems",
        devices: [
          { id: "ENG-301-ac", name: "Dual Inverter AC Unit", type: "air_conditioner", powerKW: 3.8, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-301-lt", name: "Recessed Troffers", type: "lighting", powerKW: 1.1, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-301-ws", name: "Terminal Workstation Pods (40 units)", type: "workstations", powerKW: 2.4, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "ENG-301-pj", name: "Ceiling Projector", type: "projector", powerKW: 0.4, state: "on", manualOverride: false, isEssential: false, scheduled: true }
        ]
      },
      {
        roomId: "ENG-302",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "Tutorial Room 302",
        roomType: "Tutorial Room",
        capacity: 20,
        floor: "Level 3",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "ENG-302-ac", name: "Split Air Conditioner", type: "air_conditioner", powerKW: 2.0, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-302-lt", name: "LED Downlights", type: "lighting", powerKW: 0.35, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "ENG-305",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomName: "CAD Design Studio 305",
        roomType: "Computer Lab",
        capacity: 40,
        floor: "Level 3",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "ENG-305-ac", name: "Dual Inverter HVAC", type: "air_conditioner", powerKW: 3.6, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-305-lt", name: "Design Studio Lighting Grid", type: "lighting", powerKW: 1.0, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-305-ws", name: "32 GPU Rendering Terminals (Standby)", type: "workstations", powerKW: 2.1, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "ENG-305-pj", name: "Dual Ultra-HD Projectors", type: "projector", powerKW: 0.5, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },

      // -------------------------------------------------------------
      // SCIENCE BUILDING (7 Classrooms)
      // -------------------------------------------------------------
      {
        roomId: "SCI-101",
        buildingId: "science",
        buildingName: "Science Building",
        roomName: "Physics Lecture Hall 101",
        roomType: "Lecture Theater",
        capacity: 100,
        floor: "Level 1",
        occupancyStatus: "occupied",
        scheduleStatus: "scheduled",
        scheduledClassName: "PHYS 101 - Classical Mechanics",
        devices: [
          { id: "SCI-101-ac", name: "Chilled Water Fan Coil Unit", type: "air_conditioner", powerKW: 3.4, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "SCI-101-lt", name: "Amphitheater Dimmable Halogens", type: "lighting", powerKW: 0.9, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "SCI-101-pj", name: "High-Lumen Presentation Projector", type: "projector", powerKW: 0.45, state: "on", manualOverride: false, isEssential: false, scheduled: true }
        ]
      },
      {
        roomId: "SCI-102",
        buildingId: "science",
        buildingName: "Science Building",
        roomName: "Classroom 102 (Cancelled Tutorial)",
        roomType: "Classroom",
        capacity: 40,
        floor: "Level 1",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "SCI-102-ac", name: "Pre-Cooling Packaged AC Unit", type: "air_conditioner", powerKW: 3.2, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-102-lt", name: "Classroom Troffers", type: "lighting", powerKW: 0.8, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-102-fn", name: "Ceiling Fans", type: "fans", powerKW: 0.35, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-102-pj", name: "Digital Projector", type: "projector", powerKW: 0.4, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "SCI-103",
        buildingId: "science",
        buildingName: "Science Building",
        roomName: "Biology Prep Room 103",
        roomType: "Laboratory",
        capacity: 25,
        floor: "Level 1",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "SCI-103-ac", name: "Climate Control AC", type: "air_conditioner", powerKW: 2.2, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-103-lt", name: "Cleanroom LED Strips", type: "lighting", powerKW: 0.5, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "SCI-201",
        buildingId: "science",
        buildingName: "Science Building",
        roomName: "Organic Chemistry Lab 201",
        roomType: "Laboratory",
        capacity: 35,
        floor: "Level 2",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "SCI-201-ac", name: "Lab HVAC Zone Controller", type: "air_conditioner", powerKW: 3.8, state: "on", manualOverride: true, isEssential: false, scheduled: false },
          { id: "SCI-201-lt", name: "Chemical Bench Task Lights", type: "lighting", powerKW: 0.8, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-201-sf", name: "Fume Hood Safety Exhaust Blower", type: "safety_exhaust", powerKW: 2.5, state: "on", manualOverride: false, isEssential: true, scheduled: false }
        ]
      },
      {
        roomId: "SCI-202",
        buildingId: "science",
        buildingName: "Science Building",
        roomName: "Cellular Biology Lab 202",
        roomType: "Laboratory",
        capacity: 35,
        floor: "Level 2",
        occupancyStatus: "occupied",
        scheduleStatus: "scheduled",
        scheduledClassName: "BIO 202 - Molecular Genetics",
        devices: [
          { id: "SCI-202-ac", name: "VAV Terminal Fan Coil", type: "air_conditioner", powerKW: 3.5, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "SCI-202-lt", name: "Microscopy Anti-Glare Lighting", type: "lighting", powerKW: 0.9, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "SCI-202-pj", name: "High-Res Pathology Projector", type: "projector", powerKW: 0.45, state: "on", manualOverride: false, isEssential: false, scheduled: true }
        ]
      },
      {
        roomId: "SCI-301",
        buildingId: "science",
        buildingName: "Science Building",
        roomName: "Advanced Chemistry Lab 301",
        roomType: "Laboratory",
        capacity: 30,
        floor: "Level 3",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "SCI-301-ac", name: "VAV Climate Modulator", type: "air_conditioner", powerKW: 3.4, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-301-lt", name: "Lab Perimeter Lights", type: "lighting", powerKW: 0.9, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-301-eq", name: "Autoclave Sterilizer Pre-Heat Coil", type: "specialized_equipment", powerKW: 2.4, state: "on", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "SCI-302",
        buildingId: "science",
        buildingName: "Science Building",
        roomName: "Genetics Research Suite 302",
        roomType: "Laboratory",
        capacity: 20,
        floor: "Level 3",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "SCI-302-ac", name: "Inverter Cooling Unit", type: "air_conditioner", powerKW: 2.2, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "SCI-302-lt", name: "Sealed Cleanroom Panels", type: "lighting", powerKW: 0.5, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },

      // -------------------------------------------------------------
      // BUSINESS BUILDING (7 Classrooms)
      // -------------------------------------------------------------
      {
        roomId: "BUS-101",
        buildingId: "business",
        buildingName: "Business Building",
        roomName: "Executive Leadership Auditorium",
        roomType: "Auditorium",
        capacity: 150,
        floor: "Level 1",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "BUS-101-ac", name: "Heavy Chiller AHU Subsystem", type: "air_conditioner", powerKW: 5.2, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-101-lt", name: "Stage & Perimeter Chandeliers", type: "lighting", powerKW: 1.2, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-101-pj", name: "Dual Auditoria Projection Wall", type: "projector", powerKW: 0.5, state: "on", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "BUS-102",
        buildingId: "business",
        buildingName: "Business Building",
        roomName: "Executive Classroom 102",
        roomType: "Classroom",
        capacity: 50,
        floor: "Level 1",
        occupancyStatus: "occupied",
        scheduleStatus: "scheduled",
        scheduledClassName: "MKTG 201 - Global Brand Strategy",
        devices: [
          { id: "BUS-102-ac", name: "Split Inverter AC", type: "air_conditioner", powerKW: 2.8, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "BUS-102-lt", name: "Daylight Balanced Panels", type: "lighting", powerKW: 0.7, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "BUS-102-pj", name: "Interactive Smartboard", type: "projector", powerKW: 0.4, state: "on", manualOverride: false, isEssential: false, scheduled: true }
        ]
      },
      {
        roomId: "BUS-103",
        buildingId: "business",
        buildingName: "Business Building",
        roomName: "Case Study Room 103",
        roomType: "Classroom",
        capacity: 35,
        floor: "Level 1",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "BUS-103-ac", name: "Split Inverter AC", type: "air_conditioner", powerKW: 2.4, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-103-lt", name: "LED Panel Grid", type: "lighting", powerKW: 0.5, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "BUS-201",
        buildingId: "business",
        buildingName: "Business Building",
        roomName: "Lecture Theater Beta 201",
        roomType: "Lecture Theater",
        capacity: 80,
        floor: "Level 2",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "BUS-201-ac", name: "Chilled Water Air Handler", type: "air_conditioner", powerKW: 3.8, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-201-lt", name: "Tiered Fluorescent Lighting", type: "lighting", powerKW: 0.9, state: "on", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-201-fn", name: "Ceiling Circulation Fans", type: "fans", powerKW: 0.35, state: "on", manualOverride: false, isEssential: false, scheduled: false }
        ]
      },
      {
        roomId: "BUS-202",
        buildingId: "business",
        buildingName: "Business Building",
        roomName: "Financial Analytics Lab 202",
        roomType: "Computer Lab",
        capacity: 45,
        floor: "Level 2",
        occupancyStatus: "occupied",
        scheduleStatus: "scheduled",
        scheduledClassName: "FIN 301 - Quantitative Corporate Finance",
        devices: [
          { id: "BUS-202-ac", name: "Precision Inverter AC", type: "air_conditioner", powerKW: 3.2, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "BUS-202-lt", name: "Glare-Free Grid Lights", type: "lighting", powerKW: 0.8, state: "on", manualOverride: false, isEssential: false, scheduled: true },
          { id: "BUS-202-ws", name: "Financial Terminals Pod (30 units)", type: "workstations", powerKW: 1.8, state: "on", manualOverride: false, isEssential: false, scheduled: true }
        ]
      },
      {
        roomId: "BUS-301",
        buildingId: "business",
        buildingName: "Business Building",
        roomName: "Network IDF Suite 301",
        roomType: "Seminar Room",
        capacity: 25,
        floor: "Level 3",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "BUS-301-ac", name: "Modular Split AC", type: "air_conditioner", powerKW: 2.2, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-301-lt", name: "Overhead Fluorescent", type: "lighting", powerKW: 0.45, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-301-eq", name: "Telecom IDF Rack Auxiliary Cooler", type: "specialized_equipment", powerKW: 1.2, state: "on", manualOverride: false, isEssential: true, scheduled: false }
        ]
      },
      {
        roomId: "BUS-302",
        buildingId: "business",
        buildingName: "Business Building",
        roomName: "Boardroom 302",
        roomType: "Seminar Room",
        capacity: 20,
        floor: "Level 3",
        occupancyStatus: "unoccupied",
        scheduleStatus: "unscheduled",
        scheduledClassName: null,
        devices: [
          { id: "BUS-302-ac", name: "Whisper-Quiet Split AC", type: "air_conditioner", powerKW: 2.0, state: "off", manualOverride: false, isEssential: false, scheduled: false },
          { id: "BUS-302-lt", name: "Architectural Cove LEDs", type: "lighting", powerKW: 0.4, state: "off", manualOverride: false, isEssential: false, scheduled: false }
        ]
      }
    ],

    initialEventLogs: [
      {
        id: "EVT-1001",
        timestamp: "09:15:22",
        type: "system_init",
        tag: "SYSTEM INITIALIZED",
        tagClass: "pill-teal",
        roomId: "ALL",
        message: "Smart Controls Simulator initialized in Manual Mode. 24 classrooms loaded with telemetry profiles."
      },
      {
        id: "EVT-1002",
        timestamp: "09:16:04",
        type: "anomaly_detected",
        tag: "SHUTDOWN RECOMMENDED",
        tagClass: "pill-amber",
        roomId: "ENG-101",
        message: "ENG-101 marked unoccupied with 3 devices active (5.65 kW load). Unnecessary equipment shutdown recommended."
      },
      {
        id: "EVT-1003",
        timestamp: "09:17:15",
        type: "override_engaged",
        tag: "OVERRIDE ENGAGED",
        tagClass: "pill-blue",
        roomId: "SCI-201",
        message: "Manual override locked on HVAC Zone Controller in SCI-201. Protected from automated shutdown."
      },
      {
        id: "EVT-1004",
        timestamp: "09:18:30",
        type: "essential_protected",
        tag: "ESSENTIAL PROTECTED",
        tagClass: "pill-purple",
        roomId: "SCI-201",
        message: "Fume Hood Safety Exhaust Blower in SCI-201 verified as Essential Equipment. Protected from load shedding."
      }
    ]
  },

  // ==========================================================================
  // STEP 7A: PREVENTIVE MAINTENANCE DATASET
  // Note: All equipment records, maintenance dates, and diagnostic alerts
  // are simulated models. No physical equipment is inspected.
  // ==========================================================================
  maintenanceModule: {
    metadata: {
      title: "Preventive Maintenance",
      subtitle: "Track equipment issues before they lead to energy waste.",
      disclaimer: "Simulation only — fictional equipment records & demo diagnostic telemetry.",
      technicianTeams: [
        "HVAC Rapid Response Unit",
        "Campus Facilities Mechanical Team",
        "Electrical & Lighting Group",
        "AV & Instructional Tech Team",
        "Lab Safety & Ventilation Services"
      ]
    },

    equipmentTypes: {
      air_conditioner: { label: "Air Conditioner / HVAC", icon: "air_conditioner" },
      fans: { label: "Circulation & Exhaust Fans", icon: "fans" },
      lighting: { label: "Ceiling Lighting Grid", icon: "lighting" },
      projector: { label: "Digital Projector & AV", icon: "projector" },
      specialized: { label: "Specialized Lab Unit", icon: "specialized" }
    },

    initialEquipment: [
      {
        id: "EQ-ENG-101-AC1",
        name: "Lecture Hall Chilled Beam Unit Alpha",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-101",
        roomName: "Lecture Theater Alpha",
        roomType: "Lecture Theater",
        type: "air_conditioner",
        typeLabel: "Air Conditioner / HVAC",
        condition: "Urgent Review",
        conditionSeverity: "critical",
        lastMaintenanceDate: "2026-05-12",
        nextDueDate: "2026-09-15",
        priority: "Critical",
        status: "open",
        assignedTeam: "HVAC Rapid Response Unit",
        targetCompletionDate: "2026-10-25",
        reportedIssue: "AC filter inspection 40 days overdue. Airflow resistance causing 28% compressor power penalty.",
        reasonForInspection: "Classroom Analytics flagged recurring 7.4 kW draw vs expected 5.5 kW baseline. High energy draw indicates airflow restriction, but physical inspection is required to verify condition.",
        recommendedAction: "Replace clogged MERV-13 air filters, clean evaporator fins, and verify supply duct static pressure.",
        history: [
          { date: "2026-05-12", action: "Refrigerant pressure calibration and condenser flush", technician: "M. Torres" },
          { date: "2025-11-20", action: "Belt tension adjustment and seasonal filter swap", technician: "D. Chen" }
        ]
      },
      {
        id: "EQ-ENG-102-LT",
        name: "Dimmable Architectural LED Troffer Bank",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-102",
        roomName: "Classroom 102",
        roomType: "Classroom",
        type: "lighting",
        typeLabel: "Ceiling Lighting Grid",
        condition: "Inspection Recommended",
        conditionSeverity: "warning",
        lastMaintenanceDate: "2026-04-18",
        nextDueDate: "2026-10-18",
        priority: "Medium",
        status: "scheduled",
        assignedTeam: "Electrical & Lighting Group",
        targetCompletionDate: "2026-10-28",
        reportedIssue: "Reported lighting fault: Occupancy sensor override switch mechanically stuck in ON position.",
        reasonForInspection: "Lights recorded active during 14 unoccupied overnight intervals over the past 30 days.",
        recommendedAction: "Replace faulty wall relay bypass module and recalibrate dual-technology ceiling PIR sensor.",
        history: [
          { date: "2026-04-18", action: "Emergency driver replacement on Row 2 fixtures", technician: "K. Patel" }
        ]
      },
      {
        id: "EQ-ENG-201-FN",
        name: "Mechanical Workshop Exhaust Blower",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-201",
        roomName: "Mechanical Lab 201",
        roomType: "Laboratory",
        type: "fans",
        typeLabel: "Circulation & Exhaust Fans",
        condition: "Maintenance Due",
        conditionSeverity: "danger",
        lastMaintenanceDate: "2026-03-10",
        nextDueDate: "2026-09-10",
        priority: "High",
        status: "in_progress",
        assignedTeam: "Campus Facilities Mechanical Team",
        targetCompletionDate: "2026-10-24",
        reportedIssue: "Fan maintenance due: High acoustic vibration and belt deflection observed during full-load testing.",
        reasonForInspection: "Telemetry indicates constant 2.2 kW draw with 12% reduced volumetric CFM air velocity.",
        recommendedAction: "Align drive pulleys, replace worn V-belts, and lubricate pillow block shaft bearings.",
        history: [
          { date: "2026-03-10", action: "Semi-annual motor grease service and safety check", technician: "A. Kowalski" }
        ]
      },
      {
        id: "EQ-ENG-203-AC",
        name: "Split Inverter Heat Pump Modulator",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-203",
        roomName: "Classroom 203",
        roomType: "Classroom",
        type: "air_conditioner",
        typeLabel: "Air Conditioner / HVAC",
        condition: "Urgent Review",
        conditionSeverity: "critical",
        lastMaintenanceDate: "2026-02-15",
        nextDueDate: "2026-08-15",
        priority: "High",
        status: "open",
        assignedTeam: "HVAC Rapid Response Unit",
        targetCompletionDate: "2026-10-26",
        reportedIssue: "Repeated high energy consumption requiring investigation: Short cycling at 3.2 kW regardless of ambient setpoint.",
        reasonForInspection: "Thermostat temperature differential delta-T collapsed to 1.8°C indicating expansion valve sticking.",
        recommendedAction: "Inspect electronic expansion valve (EEV) step motor and recharge R-410A refrigerant circuit.",
        history: [
          { date: "2026-02-15", action: "Condenser circuit board replacement", technician: "M. Torres" }
        ]
      },
      {
        id: "EQ-ENG-301-PJ",
        name: "Short-Throw High-Lumen Laser Projector",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        roomId: "ENG-301",
        roomName: "Computer Lab 301",
        roomType: "Computer Lab",
        type: "projector",
        typeLabel: "Digital Projector & AV",
        condition: "Good",
        conditionSeverity: "good",
        lastMaintenanceDate: "2026-08-20",
        nextDueDate: "2027-02-20",
        priority: "Low",
        status: "completed",
        assignedTeam: "AV & Instructional Tech Team",
        targetCompletionDate: "2026-08-20",
        reportedIssue: "Routine laser engine dust filter vacuum and lens optics alignment.",
        reasonForInspection: "Standard preventive schedule. Zero energy anomalies detected.",
        recommendedAction: "Clean optical dust filter mesh; clear internal intake vent passage.",
        history: [
          { date: "2026-08-20", action: "Filter mesh cleaned and firmware updated", technician: "J. Simmons" }
        ]
      },
      {
        id: "EQ-SCI-101-LT",
        name: "High-Bay Fluorescent Lighting System",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-101",
        roomName: "Auditorium 101",
        roomType: "Lecture Theater",
        type: "lighting",
        typeLabel: "Ceiling Lighting Grid",
        condition: "Maintenance Due",
        conditionSeverity: "danger",
        lastMaintenanceDate: "2026-01-10",
        nextDueDate: "2026-07-10",
        priority: "Medium",
        status: "open",
        assignedTeam: "Electrical & Lighting Group",
        targetCompletionDate: "2026-10-30",
        reportedIssue: "Reported lighting fault: 4 magnetic ballasts buzzing audibly with noticeable lumen flicker.",
        reasonForInspection: "Ballast power factor degraded from 0.95 to 0.72, generating unmetered reactive line losses.",
        recommendedAction: "Retrofit fixture with electronic ballast-bypass LED tubes to eliminate 240W ballast losses.",
        history: [
          { date: "2026-01-10", action: "Replaced 6 burned-out T8 tubes", technician: "K. Patel" }
        ]
      },
      {
        id: "EQ-SCI-102-AC",
        name: "Multi-Zone Variable Flow AC",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-102",
        roomName: "Lecture Hall 102",
        roomType: "Lecture Theater",
        type: "air_conditioner",
        typeLabel: "Air Conditioner / HVAC",
        condition: "Urgent Review",
        conditionSeverity: "critical",
        lastMaintenanceDate: "2026-05-30",
        nextDueDate: "2026-09-30",
        priority: "High",
        status: "scheduled",
        assignedTeam: "HVAC Rapid Response Unit",
        targetCompletionDate: "2026-10-27",
        reportedIssue: "Repeated high energy consumption requiring investigation: Chilled water valve locked at 100% open.",
        reasonForInspection: "Unit continuously drew 4.1 kW during weekend periods with zero class occupancy.",
        recommendedAction: "Replace actuator motor on 2-way chilled water control valve and cycle test DDC controller.",
        history: [
          { date: "2026-05-30", action: "Chilled water strainer cleanout", technician: "M. Torres" }
        ]
      },
      {
        id: "EQ-SCI-201-EX",
        name: "Chemical Fume Hood Exhaust Scrubber Blower",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-201",
        roomName: "Chemistry Lab 201",
        roomType: "Laboratory",
        type: "specialized",
        typeLabel: "Specialized Lab Unit",
        condition: "Inspection Recommended",
        conditionSeverity: "warning",
        lastMaintenanceDate: "2026-07-15",
        nextDueDate: "2026-10-15",
        priority: "Critical",
        status: "in_progress",
        assignedTeam: "Lab Safety & Ventilation Services",
        targetCompletionDate: "2026-10-24",
        reportedIssue: "Fan maintenance due: Velocity sensor calibration drift; damper hunting between 40% and 90% CFM.",
        reasonForInspection: "Essential equipment drawing 2.2 kW continuously. Airflow velocity hunting wastes fan kinetic energy.",
        recommendedAction: "Calibrate thermal anemometer face velocity sensor and service pneumatic damper actuator.",
        history: [
          { date: "2026-07-15", action: "HEPA exhaust filter certification", technician: "Dr. S. Thorne" },
          { date: "2026-01-18", action: "Annual EH&S safety containment audit", technician: "Dr. S. Thorne" }
        ]
      },
      {
        id: "EQ-SCI-202-FN",
        name: "Ceiling Destratification Fans Bank",
        buildingId: "science",
        buildingName: "Science Building",
        roomId: "SCI-202",
        roomName: "Biology Lab 202",
        roomType: "Laboratory",
        type: "fans",
        typeLabel: "Circulation & Exhaust Fans",
        condition: "Good",
        conditionSeverity: "good",
        lastMaintenanceDate: "2026-08-01",
        nextDueDate: "2027-02-01",
        priority: "Low",
        status: "completed",
        assignedTeam: "Campus Facilities Mechanical Team",
        targetCompletionDate: "2026-08-01",
        reportedIssue: "Routine capacitor test and blade balance calibration.",
        reasonForInspection: "Standard semi-annual servicing completed. All fan motors operating at nominal 0.35 kW draw.",
        recommendedAction: "No action required. Next inspection scheduled for February 2027.",
        history: [
          { date: "2026-08-01", action: "Run capacitors verified at 4.5uF nominal", technician: "A. Kowalski" }
        ]
      },
      {
        id: "EQ-BUS-101-AC1",
        name: "Auditorium Variable Refrigerant Flow (VRF) Condenser",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-101",
        roomName: "Auditorium 101",
        roomType: "Lecture Theater",
        type: "air_conditioner",
        typeLabel: "Air Conditioner / HVAC",
        condition: "Urgent Review",
        conditionSeverity: "critical",
        lastMaintenanceDate: "2026-04-05",
        nextDueDate: "2026-08-05",
        priority: "Critical",
        status: "open",
        assignedTeam: "HVAC Rapid Response Unit",
        targetCompletionDate: "2026-10-25",
        reportedIssue: "AC filter inspection overdue: Pre-filters heavily coated with particulate matter after campus renovation.",
        reasonForInspection: "Compressor head pressure alarm triggered twice this week; active load surged from 3.8 kW to 5.2 kW.",
        recommendedAction: "Perform chemical wash on outdoor condenser coils and swap all 8 primary air handler filter cartridges.",
        history: [
          { date: "2026-04-05", action: "Compressor oil acid test and filter change", technician: "D. Chen" }
        ]
      },
      {
        id: "EQ-BUS-102-LT",
        name: "LED Recessed Architectural Downlights",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-102",
        roomName: "Case Study Room 102",
        roomType: "Case Study Room",
        type: "lighting",
        typeLabel: "Ceiling Lighting Grid",
        condition: "Good",
        conditionSeverity: "good",
        lastMaintenanceDate: "2026-09-10",
        nextDueDate: "2027-03-10",
        priority: "Low",
        status: "completed",
        assignedTeam: "Electrical & Lighting Group",
        targetCompletionDate: "2026-09-10",
        reportedIssue: "DALI dimmer programming update and lux sensor calibration.",
        reasonForInspection: "Daylighting sensor calibrated to maintain 450 lux standard. Zero power anomalies.",
        recommendedAction: "Normal operation maintained.",
        history: [
          { date: "2026-09-10", action: "DALI lighting gateway firmware flash", technician: "K. Patel" }
        ]
      },
      {
        id: "EQ-BUS-201-PJ",
        name: "Dual Ultra-HD Laser Presentation Suite",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-201",
        roomName: "Case Study Room 201",
        roomType: "Case Study Room",
        type: "projector",
        typeLabel: "Digital Projector & AV",
        condition: "Inspection Recommended",
        conditionSeverity: "warning",
        lastMaintenanceDate: "2026-03-22",
        nextDueDate: "2026-09-22",
        priority: "Medium",
        status: "scheduled",
        assignedTeam: "AV & Instructional Tech Team",
        targetCompletionDate: "2026-10-29",
        reportedIssue: "Projector internal exhaust fan failure warning on unit #2.",
        reasonForInspection: "Laser engine thermal throttles power back to 60% luminosity when internal ambient hits 52°C.",
        recommendedAction: "Replace internal 80mm cooling fan and verify HDMI CEC auto-standby signaling.",
        history: [
          { date: "2026-03-22", action: "Color calibration and optic lens cleaning", technician: "J. Simmons" }
        ]
      },
      {
        id: "EQ-BUS-202-PJ",
        name: "Conference Room Projector & Audio Rack",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-202",
        roomName: "Seminar Room 202",
        roomType: "Seminar Room",
        type: "projector",
        typeLabel: "Digital Projector & AV",
        condition: "Inspection Recommended",
        conditionSeverity: "warning",
        lastMaintenanceDate: "2025-09-14",
        nextDueDate: "2026-03-14",
        priority: "Medium",
        status: "open",
        assignedTeam: "AV & Instructional Tech Team",
        targetCompletionDate: "2026-11-02",
        reportedIssue: "Missing maintenance history: No logged service records in the system for over 13 months.",
        reasonForInspection: "Flagged during annual asset audit due to missing physical maintenance log validation.",
        recommendedAction: "Conduct full baseline electrical safety test, clean optical train, and log initial digital service baseline.",
        history: []
      },
      {
        id: "EQ-BUS-301-EQ",
        name: "Telecom IDF Auxiliary Spot Cooler",
        buildingId: "business",
        buildingName: "Business Building",
        roomId: "BUS-301",
        roomName: "Network IDF Suite 301",
        roomType: "Seminar Room",
        type: "specialized",
        typeLabel: "Specialized Lab Unit",
        condition: "Maintenance Due",
        conditionSeverity: "danger",
        lastMaintenanceDate: "2026-02-28",
        nextDueDate: "2026-08-28",
        priority: "High",
        status: "open",
        assignedTeam: "Campus Facilities Mechanical Team",
        targetCompletionDate: "2026-10-27",
        reportedIssue: "Condensate drain pump float switch sticking; unit continuously running condensate heater.",
        reasonForInspection: "Draw sustained at 1.2 kW even during winter setback. Essential cooling equipment requires immediate drain flush.",
        recommendedAction: "Flush condensate line with microbial inhibitor, replace float microswitch, and clean intake grille.",
        history: [
          { date: "2026-02-28", action: "Drain pump servicing and evaporator sanitization", technician: "A. Kowalski" }
        ]
      }
    ]
  },

  // ==========================================================================
  // STEP 7B: DEPARTMENT ENERGY CHALLENGE DATASET
  // Note: All competition rankings, baseline comparisons, and participation points
  // are illustrative demo models.
  // ==========================================================================
  departmentChallengeModule: {
    metadata: {
      title: "Department Energy Challenge",
      subtitle: "Encourage fair, measurable energy-saving improvements across campus.",
      disclaimer: "Simulation only — department rankings and energy scoring are illustrative demo models.",
      activeCycle: "Fall 2026 Semester Competition",
      tariffUSD: 0.18
    },

    evaluationPeriods: [
      { id: "month", label: "Month to Date (October 2026)", days: 22, desc: "Active monthly sprint evaluation" },
      { id: "semester", label: "Fall Semester 2026", days: 75, desc: "Mid-term cumulative performance" },
      { id: "academic_year", label: "Academic Year 2025-2026", days: 240, desc: "Full year verified historical benchmark" }
    ],

    scoringRules: {
      reductionPointsPerPercent: 25,     // 25 pts per 1.0% normalized energy reduction
      actionCompletedPoints: 50,         // 50 pts per completed energy-saving action
      participationMultiplier: 2.0,      // Points from participation rate (e.g. 85% = 170 pts)
      achievementsConfig: [
        {
          id: "energy_saver",
          label: "Energy Saver",
          icon: "zap",
          badgeColor: "amber",
          desc: "Achieved >= 7.0% verified energy reduction against normalized baseline"
        },
        {
          id: "consistent_improver",
          label: "Consistent Improver",
          icon: "trending-up",
          badgeColor: "teal",
          desc: "Maintained energy reductions across 2 or more evaluation periods"
        },
        {
          id: "action_champion",
          label: "Action Champion",
          icon: "award",
          badgeColor: "purple",
          desc: "Successfully completed 3 or more verified energy-saving challenge actions"
        }
      ]
    },

    departments: [
      {
        id: "dept_science",
        name: "Faculty of Science",
        code: "SCI",
        buildingId: "science",
        buildingName: "Science Building",
        facultyHead: "Prof. Elena Rostova",
        enrolledStudents: 1420,
        monitoredRoomsCount: 8,
        description: "Heavy laboratory wet-benches, chemical fume hoods, and cold storage units across 8 monitored classrooms.",
        periods: {
          month: {
            baselineKWh: 3100,
            currentKWh: 2790,
            occupiedHours: 260,
            baselinePerHour: 11.92,
            currentPerHour: 10.73,
            participationPct: 92
          },
          semester: {
            baselineKWh: 13600,
            currentKWh: 12150,
            occupiedHours: 1150,
            baselinePerHour: 11.83,
            currentPerHour: 10.57,
            participationPct: 90
          },
          academic_year: {
            baselineKWh: 40500,
            currentKWh: 36800,
            occupiedHours: 3400,
            baselinePerHour: 11.91,
            currentPerHour: 10.82,
            participationPct: 88
          }
        },
        actions: [
          {
            id: "ACT-SCI-01",
            title: "Chemical Fume Hood 'Shut the Sash' Campaign",
            category: "Safety & Lab Protocols",
            status: "completed",
            dateCompleted: "2026-10-05",
            points: 50,
            note: "Nightly sash closure protocol verified by lab safety marshals in Rooms 201 & 204."
          },
          {
            id: "ACT-SCI-02",
            title: "Cold Storage Setpoint Optimization",
            category: "Lab Equipment",
            status: "completed",
            dateCompleted: "2026-10-12",
            points: 50,
            note: "Optimized ultra-low research freezers from -85°C to -80°C saving estimated 3.2 kWh/day."
          },
          {
            id: "ACT-SCI-03",
            title: "Organic Chemistry Lab Lighting Relamp",
            category: "Lighting Efficiency",
            status: "completed",
            dateCompleted: "2026-10-18",
            points: 50,
            note: "Replaced buzzing T8 ballasts with high-efficiency 4000K LED troffer panels in Room 101."
          }
        ],
        recommendations: [
          "Install digital sash position telemetry sensors in SCI-201 to automate minimum exhaust CFM setpoint.",
          "Coordinate late evening biology lectures to share rooms with Business Building to consolidate chiller loads."
        ]
      },
      {
        id: "dept_engineering",
        name: "Faculty of Engineering",
        code: "ENG",
        buildingId: "engineering",
        buildingName: "Engineering Building",
        facultyHead: "Dr. Marcus Vance",
        enrolledStudents: 1850,
        monitoredRoomsCount: 10,
        description: "High-intensity CAD computer labs, mechanical fabrication workshops, and large lecture theaters across 10 monitored classrooms.",
        periods: {
          month: {
            baselineKWh: 4200,
            currentKWh: 3850,
            occupiedHours: 320,
            baselinePerHour: 13.12,
            currentPerHour: 12.03,
            participationPct: 84
          },
          semester: {
            baselineKWh: 18500,
            currentKWh: 17100,
            occupiedHours: 1420,
            baselinePerHour: 13.03,
            currentPerHour: 12.04,
            participationPct: 85
          },
          academic_year: {
            baselineKWh: 54000,
            currentKWh: 50400,
            occupiedHours: 4100,
            baselinePerHour: 13.17,
            currentPerHour: 12.29,
            participationPct: 82
          }
        },
        actions: [
          {
            id: "ACT-ENG-01",
            title: "CAD Workstation Auto-Sleep Group Policy",
            category: "IT Infrastructure",
            status: "completed",
            dateCompleted: "2026-10-08",
            points: 50,
            note: "Pushed 15-minute idle standby profile to 45 high-spec engineering workstations in Lab 301."
          },
          {
            id: "ACT-ENG-02",
            title: "Weekend Central Chiller Setback Protocol",
            category: "HVAC Scheduling",
            status: "completed",
            dateCompleted: "2026-10-14",
            points: 50,
            note: "Rescheduled isolated Saturday session to allow primary engineering chiller plant to remain in setback."
          },
          {
            id: "ACT-ENG-03",
            title: "Student Sensor & Switch Awareness Drive",
            category: "Behavioral Campaign",
            status: "in_progress",
            dateCompleted: null,
            points: 25,
            note: "Student council posters and digital QR code audit surveys deployed across Level 1 lecture wings."
          }
        ],
        recommendations: [
          "Automate idle shutdown for mechanical labs 201 & 202 on Friday afternoons.",
          "Prioritize MERV-13 air filter replacement in Lecture Theater Alpha to reduce 28% compressor penalty."
        ]
      },
      {
        id: "dept_business",
        name: "School of Business",
        code: "BUS",
        buildingId: "business",
        buildingName: "Business Building",
        facultyHead: "Dean Arthur Pendelton",
        enrolledStudents: 1980,
        monitoredRoomsCount: 6,
        description: "Executive presentation rooms, lecture halls, and case study seminar rooms across 6 monitored classrooms.",
        periods: {
          month: {
            baselineKWh: 2450,
            currentKWh: 2280,
            occupiedHours: 290,
            baselinePerHour: 8.45,
            currentPerHour: 7.86,
            participationPct: 78
          },
          semester: {
            baselineKWh: 10800,
            currentKWh: 10100,
            occupiedHours: 1280,
            baselinePerHour: 8.44,
            currentPerHour: 7.89,
            participationPct: 80
          },
          academic_year: {
            baselineKWh: 32000,
            currentKWh: 30200,
            occupiedHours: 3800,
            baselinePerHour: 8.42,
            currentPerHour: 7.95,
            participationPct: 76
          }
        },
        actions: [
          {
            id: "ACT-BUS-01",
            title: "Auditorium Chiller Coordinated Power-Down",
            category: "HVAC Scheduling",
            status: "completed",
            dateCompleted: "2026-10-09",
            points: 50,
            note: "Coordinated Auditorium 101 AHU shutdown within 15 minutes of lecture dismissal."
          },
          {
            id: "ACT-BUS-02",
            title: "Executive Boardroom Presence Sensor Audit",
            category: "Lighting Efficiency",
            status: "in_progress",
            dateCompleted: null,
            points: 25,
            note: "Evaluating PIR occupancy sensitivity in Level 3 executive suites."
          }
        ],
        recommendations: [
          "Turn off architectural cove lights in boardroom 302 when empty.",
          "Consolidate small executive cohort classes into single-zone Level 1 wings."
        ]
      },
      {
        id: "dept_admin",
        name: "Campus Administration & Operations",
        code: "ADM",
        buildingId: "all",
        buildingName: "Central Admin Complex",
        facultyHead: "Director Sarah Jenkins",
        enrolledStudents: 0, // Staff only: 220 FTE
        monitoredRoomsCount: 4,
        description: "Staff offices, central IT administration hubs, meeting suites, and facility operational depots.",
        periods: {
          month: {
            baselineKWh: 1680,
            currentKWh: 1590,
            occupiedHours: 210,
            baselinePerHour: 8.00,
            currentPerHour: 7.57,
            participationPct: 88
          },
          semester: {
            baselineKWh: 7400,
            currentKWh: 7050,
            occupiedHours: 920,
            baselinePerHour: 8.04,
            currentPerHour: 7.66,
            participationPct: 86
          },
          academic_year: {
            baselineKWh: 22000,
            currentKWh: 21100,
            occupiedHours: 2750,
            baselinePerHour: 8.00,
            currentPerHour: 7.67,
            participationPct: 85
          }
        },
        actions: [
          {
            id: "ACT-ADM-01",
            title: "Nightly Security Energy Verification Sweep",
            category: "Operational Patrols",
            status: "completed",
            dateCompleted: "2026-10-02",
            points: 50,
            note: "Integrated building equipment inspection into campus security evening rounds."
          },
          {
            id: "ACT-ADM-02",
            title: "Server Room Cold Aisle Containment",
            category: "IT Infrastructure",
            status: "completed",
            dateCompleted: "2026-10-15",
            points: 50,
            note: "Sealed floor cable penetrations and installed blanking panels in IDF racks."
          }
        ],
        recommendations: [
          "Deploy campus-wide energy dashboard displays in faculty common rooms.",
          "Establish monthly department energy coordinator reviews."
        ]
      },
      {
        id: "dept_humanities",
        name: "Faculty of Humanities (New Sensor Pilot)",
        code: "HUM",
        buildingId: "humanities",
        buildingName: "Humanities Hall (Pilot Wing)",
        facultyHead: "Prof. Clare Beaumont",
        enrolledStudents: 1100,
        monitoredRoomsCount: 2,
        description: "Newly instrumented seminar rooms currently accumulating baseline calibration data. Demonstrates safe zero-baseline handling.",
        periods: {
          month: {
            baselineKWh: null, // Deliberate null to test requirement 8 & 9
            currentKWh: 820,
            occupiedHours: 120,
            baselinePerHour: null,
            currentPerHour: 6.83,
            participationPct: 95
          },
          semester: {
            baselineKWh: null,
            currentKWh: 3600,
            occupiedHours: 510,
            baselinePerHour: null,
            currentPerHour: 7.05,
            participationPct: 92
          },
          academic_year: {
            baselineKWh: null,
            currentKWh: null,
            occupiedHours: 0,
            baselinePerHour: null,
            currentPerHour: null,
            participationPct: 90
          }
        },
        actions: [
          {
            id: "ACT-HUM-01",
            title: "Pilot Classroom Daylighting Protocol",
            category: "Behavioral Campaign",
            status: "completed",
            dateCompleted: "2026-10-11",
            points: 50,
            note: "Instructors instructed to open south-facing louvers and keep primary lights off on clear days."
          }
        ],
        recommendations: [
          "Accumulate 30 days of telemetry data to calibrate a fair baseline before calculating reduction %.",
          "Department is evaluated on Participation and Action completion during baseline calibration phase."
        ]
      }
    ]
  }
};

// Make accessible to browser runtime
if (typeof window !== "undefined") {
  window.SCEO_DATA = SCEO_DATA;
}
