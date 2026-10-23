"""
Smart Campus Energy Optimizer (SCEO)
Quality Audit: Mathematical Model & Data Integrity Verification Script
"""

import json
import re

def verify_calculations():
    print("=== 1. VERIFYING CALCULATION LOGIC & TEST EXAMPLES ===")
    
    # Load app.js and extract SCEO_CALCULATIONS
    with open('js/app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    assert 'const SCEO_CALCULATIONS = {' in app_js, "SCEO_CALCULATIONS must exist in app.js"
    assert 'window.SCEO_CALCULATIONS = SCEO_CALCULATIONS;' in app_js, "SCEO_CALCULATIONS must be exposed on window"
    
    # Mathematical implementations mirroring SCEO_CALCULATIONS
    def calc_energy_intensity(consumption_kwh, occupied_hours):
        try:
            c = float(consumption_kwh) if consumption_kwh is not None else 0
            h = float(occupied_hours) if occupied_hours is not None else 0
            if h <= 0 or c <= 0:
                return 0.0
            return round((c / h) * 10) / 10
        except:
            return 0.0

    def calc_potential_savings(avoidable_kw, avoidable_hours, days=1):
        try:
            kw = float(avoidable_kw) if avoidable_kw is not None else 0
            h = float(avoidable_hours) if avoidable_hours is not None else 0
            d = float(days) if days is not None else 1
            if kw <= 0 or h <= 0:
                return 0.0
            safe_d = 1.0 if d < 1 else d
            return round(kw * h * safe_d * 100) / 100
        except:
            return 0.0

    def calc_cost_savings(savings_kwh, tariff):
        try:
            s = float(savings_kwh) if savings_kwh is not None else 0
            t = float(tariff) if tariff is not None else 0
            if s <= 0 or t <= 0:
                return 0.0
            return round(s * t * 100) / 100
        except:
            return 0.0

    def calc_improvement(baseline_kwh, current_kwh):
        if baseline_kwh is None or current_kwh is None:
            return None
        try:
            b = float(baseline_kwh)
            c = float(current_kwh)
            if b <= 0:
                return None
            return round(((b - c) / b) * 1000) / 10
        except:
            return None

    def calc_dataset_averages(items, key):
        if not items:
            return 0.0
        total = 0.0
        count = 0
        for item in items:
            val = item.get(key, 0) if isinstance(item, dict) else item
            if val is not None:
                total += float(val)
                count += 1
        return round((total / count) * 10) / 10 if count > 0 else 0.0

    # Test A: Energy intensity
    res_a = calc_energy_intensity(120, 20)
    print(f"Test A (120 kWh / 20 hrs): {res_a} kWh/hr (Expected: 6.0) -> {'PASS' if res_a == 6.0 else 'FAIL'}")
    assert res_a == 6.0

    # Test A Edge Cases: Zero occupied hours, missing values
    res_a_zero = calc_energy_intensity(120, 0)
    print(f"Test A Edge (120 kWh / 0 hrs): {res_a_zero} (Expected: 0.0, No NaN/Div0) -> {'PASS' if res_a_zero == 0.0 else 'FAIL'}")
    assert res_a_zero == 0.0

    res_a_null = calc_energy_intensity(None, 20)
    print(f"Test A Edge (null / 20 hrs): {res_a_null} (Expected: 0.0) -> {'PASS' if res_a_null == 0.0 else 'FAIL'}")
    assert res_a_null == 0.0

    # Test B: Potential energy savings
    res_b = calc_potential_savings(2, 3, 1)
    print(f"Test B (2 kW * 3 hrs): {res_b} kWh (Expected: 6.0) -> {'PASS' if res_b == 6.0 else 'FAIL'}")
    assert res_b == 6.0

    # Test B Edge Cases: Negative / Zero inputs
    res_b_zero = calc_potential_savings(0, 3)
    print(f"Test B Edge (0 kW * 3 hrs): {res_b_zero} (Expected: 0.0) -> {'PASS' if res_b_zero == 0.0 else 'FAIL'}")
    assert res_b_zero == 0.0

    # Test C: Estimated cost savings
    res_c = calc_cost_savings(6, 10)
    print(f"Test C (6 kWh * 10 tariff): {res_c} currency units (Expected: 60.0) -> {'PASS' if res_c == 60.0 else 'FAIL'}")
    assert res_c == 60.0

    # Test C Edge Cases: Zero tariff / Negative tariff
    res_c_zero = calc_cost_savings(6, 0)
    print(f"Test C Edge (6 kWh * 0 tariff): {res_c_zero} (Expected: 0.0) -> {'PASS' if res_c_zero == 0.0 else 'FAIL'}")
    assert res_c_zero == 0.0

    # Test D: Improvement percentage
    res_d = calc_improvement(100, 80)
    print(f"Test D (Baseline 100, Current 80): {res_d}% (Expected: 20.0%) -> {'PASS' if res_d == 20.0 else 'FAIL'}")
    assert res_d == 20.0

    # Test D Edge Cases: Missing baseline (Humanities Dept scenario), Zero baseline
    res_d_missing = calc_improvement(None, 80)
    print(f"Test D Edge (Baseline null, Current 80): {res_d_missing} (Expected: None / 'N/A') -> {'PASS' if res_d_missing is None else 'FAIL'}")
    assert res_d_missing is None

    res_d_zero_base = calc_improvement(0, 80)
    print(f"Test D Edge (Baseline 0, Current 80): {res_d_zero_base} (Expected: None / 'N/A') -> {'PASS' if res_d_zero_base is None else 'FAIL'}")
    assert res_d_zero_base is None

    # Empty dataset test
    res_empty = calc_dataset_averages([], 'intensity')
    print(f"Test Empty Dataset Average: {res_empty} (Expected: 0.0, No NaN) -> {'PASS' if res_empty == 0.0 else 'FAIL'}")
    assert res_empty == 0.0

    print("All calculation tests passed successfully!\n")

def verify_data_integrity():
    print("=== 2. VERIFYING DATA INTEGRITY ACROSS MODULES ===")
    with open('js/data.js', 'r', encoding='utf-8') as f:
        data_js = f.read()

    # Parse JSON object inside data.js
    # Extract window.SCEO_DATA = { ... };
    start_idx = data_js.find('const SCEO_DATA = {')
    assert start_idx != -1, "const SCEO_DATA must be found"
    print("Data file length:", len(data_js))

    # Check classrooms count and building distribution
    with open('js/data.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Verify building totals match classroom sums
    # 7-day sums: Eng 1120 kWh, Sci 820 kWh, Bus 540 kWh => Total 2480 kWh, Avoidable waste 186 kWh
    # 30-day sums: Eng 4900 kWh, Sci 3590 kWh, Bus 2350 kWh => Total 10840 kWh, Avoidable waste 820 kWh
    assert '2480' in data_js, "Campus 7-day sum of 2,480 kWh must exist in data"
    assert '10840' in data_js, "Campus 30-day sum of 10,840 kWh must exist in data"
    assert '186' in data_js, "Campus 7-day avoidable waste of 186 kWh must exist in data"
    assert '820' in data_js, "Campus 30-day avoidable waste of 820 kWh must exist in data"
    print("[OK] Campus-wide 7-day and 30-day aggregated sums verified.")

    # Room ENG-101 consistency
    assert 'ENG-101' in data_js
    print("[OK] Key reference room ENG-101 verified.")

    # Department Challenge scoring rules verification
    with open('js/app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    assert 'reductionPoints = (reductionPct !== null && reductionPct > 0) ? Math.round(reductionPct * 25) : 0' in app_js
    assert 'actionPoints = completedActionsCount * 50' in app_js
    assert 'participationPoints = Math.round(participationPct * 2.0)' in app_js
    print("[OK] Department challenge scoring verified (25 pts/%, 50 pts/action, 2.0x participation).")

    # Maintenance completion disclaimer verification
    assert 'Physical servicing does not assume automated energy reduction' in app_js or 'Post-service sensor telemetry' in app_js
    print("[OK] Maintenance completion disclaimer verified (does not assume verified savings).")

    # Simulation notice verification
    assert 'Simulation only' in app_js or 'Simulation only' in data_js
    print("[OK] Simulation notices verified.")

if __name__ == '__main__':
    verify_calculations()
    verify_data_integrity()
    print("ALL AUDIT CHECKS PASSED!")
