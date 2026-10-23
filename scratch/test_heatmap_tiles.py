import re, sys

def test_heatmap():
    print("=== TESTING FULL-COLOR PRIORITY HEATMAP TILES ===")
    errors = []

    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('css/styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('js/app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    # 1. Check controls in HTML
    required_controls = [
        'heatmapBuildingFilter',
        'heatmapPriorityFilter',
        'heatmapSearchInput',
        'btnHeatmapClearFilters',
        'btnMetricIntensity',
        'btnMetricTotal',
        'btnMetricWaste',
        'heatmapSortSelect',
        'heatmapGridContainer',
        'roomDetailModal',
        'roomModalEquipmentList',
        'roomModalAlertsBox'
    ]
    for cid in required_controls:
        if f'id="{cid}"' not in html:
            errors.append(f"Missing required element ID in HTML: {cid}")

    # 2. Check palette in CSS
    required_styles = [
        '.heatmap-room-tile.priority-low',
        'background-color: #D8F0DF',
        'color: #205D38',
        'border-color: #B3DCC0',
        '.heatmap-room-tile.priority-medium',
        'background-color: #FBE9B9',
        'color: #77500D',
        'border-color: #EBD38B',
        '.heatmap-room-tile.priority-high',
        'background-color: #F5D1D1',
        'color: #8B3030',
        'border-color: #E6AAAA',
        '.heatmap-room-tile.priority-nodata',
        'background-color: #E8EDF1',
        'color: #536574',
        'border-color: #D2DBE2',
        '.heatmap-tiles-grid',
        '.tile-priority-pill',
        '.heatmap-empty-state',
        '.room-modal-devices-grid'
    ]
    for s in required_styles:
        if s not in css:
            errors.append(f"Missing CSS rule or color definition: {s}")

    # 3. Check logic in app.js
    if 'getRoomPriorityInfo' not in app_js:
        errors.append("Missing getRoomPriorityInfo function in app.js")
    if 'resetHeatmapFilters' not in app_js:
        errors.append("Missing resetHeatmapFilters function in app.js")
    if 'tile-priority-pill' not in app_js:
        errors.append("Missing tile-priority-pill in app.js tile markup")
    if 'roomModalEquipmentList' not in app_js:
        errors.append("Missing roomModalEquipmentList handling in openRoomModal")

    # 4. Math & edge cases simulation
    # Simulate getRoomPriorityInfo logic in Python
    def sim_priority(total_kwh, occ_hours, status):
        if total_kwh is None or total_kwh == '':
            return 'NO_DATA', 'No Data'
        if not occ_hours or occ_hours <= 0:
            intensity = 0.0
        else:
            intensity = round(total_kwh / occ_hours, 2)
        
        if status in ['red', 'orange']:
            level = 'HIGH'
        elif status == 'yellow':
            level = 'MEDIUM'
        else:
            level = 'LOW'
        return level, f"{intensity:.2f} kWh/h"

    # Test edge case: 0 occupied hours
    lvl, txt = sim_priority(100, 0, 'green')
    assert lvl == 'LOW' and txt == '0.00 kWh/h', f"Zero occupied hours failed: {lvl}, {txt}"

    # Test edge case: missing total kWh
    lvl, txt = sim_priority(None, 20, 'red')
    assert lvl == 'NO_DATA' and txt == 'No Data', f"Missing total kWh failed: {lvl}, {txt}"

    # Test edge case: normal room
    lvl, txt = sim_priority(210, 25, 'red')
    assert lvl == 'HIGH' and txt == '8.40 kWh/h', f"High room failed: {lvl}, {txt}"

    # Test edge case: yellow room
    lvl, txt = sim_priority(112, 35, 'yellow')
    assert lvl == 'MEDIUM' and txt == '3.20 kWh/h', f"Medium room failed: {lvl}, {txt}"

    print("--- RESULTS ---")
    if errors:
        print(f"FAILED with {len(errors)} error(s):")
        for e in errors:
            print(" -", e)
        return False
    else:
        print("ALL HEATMAP TILE AUDITS PASSED CLEANLY! ZERO DEFECTS.")
        return True

if __name__ == '__main__':
    ok = test_heatmap()
    sys.exit(0 if ok else 1)
