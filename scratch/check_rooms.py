import json
import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

rooms = set(re.findall(r'id:\s*["\'](ENG-[^"\']+)["\']', text))
print('ENG rooms found:', sorted(list(rooms)))

# Check alerts for ENG rooms
alerts = re.findall(r'roomId:\s*["\'](ENG-[^"\']+)["\']', text)
print('ENG rooms in alerts:', sorted(list(set(alerts))))

# Check devices / smart controls
devices = re.findall(r'roomId:\s*["\'](ENG-[^"\']+)["\'].*?devices', text, re.DOTALL)
print('ENG rooms with devices:', sorted(list(set(devices))))
