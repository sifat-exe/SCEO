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
  }
};

// Make accessible to browser runtime
if (typeof window !== "undefined") {
  window.SCEO_DATA = SCEO_DATA;
}
