with open('index.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if any(ord(c) > 0xffff for c in line):
            print(f"index.html line {i+1}: " + repr(line.strip()[:100]).encode('ascii', 'backslashreplace').decode('ascii'))

with open('js/app.js', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if any(ord(c) > 0xffff for c in line):
            print(f"app.js line {i+1}: " + repr(line.strip()[:100]).encode('ascii', 'backslashreplace').decode('ascii'))
