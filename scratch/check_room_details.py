import re
with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find classroom definition for ENG-204
for room_id in ['ENG-204', 'ENG-101']:
    pos = text.find(f'id: "{room_id}"')
    if pos == -1:
        pos = text.find(f"id: '{room_id}'")
    if pos != -1:
        print(f"=== {room_id} in classrooms ===")
        print(text[pos:pos+1200])

# Find alerts for ENG-204
for room_id in ['ENG-204', 'ENG-101']:
    print(f"=== Alerts for {room_id} ===")
    matches = [m.start() for m in re.finditer(f'roomId:\s*["\']{room_id}["\']', text)]
    for m in matches:
        start = max(0, text.rfind('{', 0, m))
        end = text.find('}', m)
        print(text[start:end+1])

# Find smart controls devices for ENG-204
for room_id in ['ENG-204', 'ENG-101']:
    print(f"=== Devices for {room_id} ===")
    pos = text.find(f'roomId: "{room_id}"')
    if pos == -1:
        pos = text.find(f"roomId: '{room_id}'")
    if pos != -1:
        print(text[pos:pos+800])
