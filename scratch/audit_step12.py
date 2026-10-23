import re, sys

def audit():
    print("=== SCEO STEP 12 POLISH & BRANDING AUDIT ===")
    errors = []

    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('js/app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    with open('js/data.js', 'r', encoding='utf-8') as f:
        data_js = f.read()

    with open('css/styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # 1. Palette check in styles.css
    palette = {
        '--color-primary-navy': '#183B56',
        '--color-primary-teal': '#168C86',
        '--color-bg-main': '#F5F8FA',
        '--color-bg-card': '#FFFFFF',
        '--color-text-primary': '#263746',
        '--color-text-secondary': '#647789',
        '--color-border': '#E1E8EE',
        '--color-success': '#23865B',
        '--color-warning': '#C58A20',
        '--color-danger': '#C94C4C',
        '--color-surface-tint': '#E8F6F4',
        '--color-surface-soft': '#EAF1F8',
    }
    for var_name, hex_val in palette.items():
        if f"{var_name}: {hex_val}" not in css and f"{var_name}:{hex_val}" not in css:
            errors.append(f"Missing or mismatched CSS variable: {var_name}: {hex_val}")

    # 2. Bracket balance in JS
    for js_name, js_code in [('data.js', data_js), ('app.js', app_js)]:
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for i, char in enumerate(js_code):
            if char in '({[':
                stack.append((char, i))
            elif char in ')}]':
                if not stack:
                    errors.append(f"Unmatched closing '{char}' in {js_name} at pos {i}")
                    break
                top, top_pos = stack.pop()
                if top != pairs[char]:
                    errors.append(f"Mismatched '{char}' with '{top}' in {js_name} at pos {i}")
                    break
        if len(stack) > 0:
            errors.append(f"Unclosed brackets in {js_name}: {len(stack)} remaining")

    # 3. Emoji audit
    emoji_pattern = re.compile(r'[\U0001F300-\U0001F9FF]|[\u2600-\u26FF]|[\u2700-\u27BF]')
    # Filter out acceptable symbols like standard typography if any
    for file_name, content in [('index.html', html), ('app.js', app_js), ('data.js', data_js)]:
        matches = emoji_pattern.findall(content)
        # Check specifically for unwanted emojis
        unwanted = [m for m in matches if m in ['⚡', '⚠', '🏆', '🎉', '💡', '📈', '✓', '🚨']]
        if unwanted:
            errors.append(f"Lingering emojis in {file_name}: {set(unwanted)}")

    # 4. Check element IDs bound in app.js
    element_ids_in_app = re.findall(r"document\.getElementById\(['\"]([a-zA-Z0-9_-]+)['\"]\)", app_js)
    missing_ids = []
    for eid in set(element_ids_in_app):
        if f'id="{eid}"' not in html and f'id="{eid}"' not in app_js:
            missing_ids.append(eid)
    if missing_ids:
        errors.append(f"Element IDs in app.js not found in HTML/templates: {missing_ids}")

    # 5. Check all 10 views in navigation
    views = ['overview', 'energy-heatmap', 'classroom-analytics', 'timetable-optimizer',
             'alerts-actions', 'smart-controls', 'maintenance', 'dept-challenge',
             'savings-reports', 'settings']
    data_views = re.findall(r'data-view="([a-zA-Z0-9_-]+)"', html)
    for v in views:
        if v not in data_views:
            errors.append(f"Missing navigation data-view='{v}' in index.html")

    # 6. Check for literal "AD" avatar text
    if '<div class="user-avatar">AD</div>' in html:
        errors.append("Literal 'AD' avatar text still present in index.html")

    # 7. Check for prototype banners
    if 'badge-fictional-demo' in html:
        errors.append("Lingering 'badge-fictional-demo' in index.html")

    print("\n--- RESULTS ---")
    if errors:
        print(f"FAILED with {len(errors)} error(s):")
        for e in errors:
            print(" -", e)
        return False
    else:
        print("ALL AUDIT CHECKS PASSED! Palette, syntax, IDs, nav, and decluttering clean.")
        return True

if __name__ == '__main__':
    ok = audit()
    sys.exit(0 if ok else 1)
