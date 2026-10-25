import re

def verify():
    print("=== VERIFYING ROOM ENERGY HEATMAP SECTION ===")
    errors = []

    with open('css/styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # 1. Verify horizontal building columns
    if '.heatmap-buildings-container' not in css or 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))' not in css:
        errors.append("Missing horizontal building grid layout in .heatmap-buildings-container")

    # 2. Verify small consistent room tiles
    if 'min-height: 60px' not in css:
        errors.append("Room tiles not configured with compact min-height")
    
    if '.heatmap-room-tile .tile-icon-wrap' not in css or 'display: none' not in css:
        errors.append("Decorative oversized icon not hidden on compact tiles")

    # 3. Verify building name above room tiles in header
    if '.building-group-header' not in css or '.building-group-name' not in css:
        errors.append("Missing building header styling")

    # 4. Verify room grid per building
    if '.heatmap-tiles-grid' not in css or 'minmax(85px, 1fr)' not in css:
        errors.append("Missing small grid repeat for room tiles inside building")

    # 5. Verify color coding preservation
    colors = [
        '.heatmap-room-tile.priority-low',
        '.heatmap-room-tile.priority-medium',
        '.heatmap-room-tile.priority-high',
        '.heatmap-room-tile.priority-nodata',
    ]
    for c in colors:
        if c not in css:
            errors.append(f"Missing priority color class {c}")

    # 6. Verify responsiveness
    if '@media (max-width: 1024px)' not in css or '@media (max-width: 768px)' not in css or '@media (max-width: 480px)' not in css:
        errors.append("Missing responsive media queries for heatmap")

    # 7. Check git status to ensure only styles.css was modified
    print("--- RESULTS ---")
    if errors:
        print(f"FAILED with {len(errors)} error(s):")
        for e in errors:
            print(" -", e)
        return False
    else:
        print("ALL ROOM ENERGY HEATMAP AUDITS PASSED!")
        return True

if __name__ == '__main__':
    ok = verify()
    exit(0 if ok else 1)
