with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

for rid in ['ENG-101', 'ENG-204']:
    i = text.find(f'id: "{rid}"')
    end = text.find('// Room', i + 50)
    if end == -1:
        end = text.find('},', i + 500)
    print(f"*** {rid} ***")
    print(text[i:i+800])
