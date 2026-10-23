import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Match each classroom block
blocks = re.findall(r'\{\s*id:\s*["\']([A-Z]+-\d+)["\'].*?wastePercentage:\s*([\d\.]+).*?status:\s*["\']([a-z]+)["\']', text, re.DOTALL)
print(f"Matched {len(blocks)} classrooms:")
for r_id, wastePct, status in blocks:
    print(f"Room: {r_id}, status: {status}, waste: {wastePct}%")
