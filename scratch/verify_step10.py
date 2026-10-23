import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_text = f.read()

with open('index.html', 'r', encoding='utf-8') as f:
    html_text = f.read()

app_ids = set(re.findall(r'document\.getElementById\(["\']([^"\']+)["\']\)', app_text))
html_ids = set(re.findall(r'id=["\']([^"\']+)["\']', html_text))

missing = app_ids - html_ids
print(f"Total queried IDs in app.js: {len(app_ids)}")
print(f"Total IDs in index.html: {len(html_ids)}")
print(f"Missing IDs in HTML: {missing}")

# Check step 10 specific elements
step10_ids = [
    'btnStartGuidedDemo', 'btnTopStartDemo', 'guidedDemoDock', 'demoStagePill',
    'demoViewPill', 'demoScenarioTag', 'btnDemoResetScenario', 'btnDemoSkip',
    'btnDemoSkipText', 'demoProgressTrack', 'demoStageTitle', 'demoTextWhatSeeing',
    'demoTextWhyMatters', 'demoTextNextAction', 'btnDemoPrev', 'btnDemoNext',
    'btnDemoNextText', 'demoResetConfirmModal', 'btnCancelDemoReset',
    'btnCancelDemoResetSecondary', 'btnConfirmDemoReset'
]
for sid in step10_ids:
    assert sid in html_ids, f"Step 10 ID '{sid}' missing in index.html!"

print("ALL STEP 10 IDS PRESENT AND VERIFIED IN INDEX.HTML!")
