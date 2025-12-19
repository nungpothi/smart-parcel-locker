from pathlib import Path

path = Path('frontend/src/i18n/translations.ts')
lines = path.read_text(encoding='utf-8').splitlines()

insert_locations = {
    'th': "        statusLabel: 'สถานะ',",
    'en': "        statusLabel: 'Status',",
}
insert_lockers = {
    'th': ["        statusLabel: 'สถานะ',", "        actionsLabel: 'การจัดการ',"],
    'en': ["        statusLabel: 'Status',", "        actionsLabel: 'Actions',"],
}

out = []
stack = []

for line in lines:
    stripped = line.strip()

    if stripped.endswith('{') and ':' in stripped:
        key = stripped.split(':', 1)[0].strip()
        stack.append(key)

    if stripped.startswith('backAdmin:') and len(stack) >= 3:
        if stack[1] == 'admin' and stack[2] == 'locations':
            lang = stack[0]
            insert_line = insert_locations.get(lang)
            if insert_line and (len(out) == 0 or out[-1].strip() != insert_line.strip()):
                out.append(insert_line)

    if stripped.startswith('manageCompartments:') and len(stack) >= 3:
        if stack[1] == 'admin' and stack[2] == 'lockers':
            lang = stack[0]
            for insert_line in insert_lockers.get(lang, []):
                if len(out) == 0 or out[-1].strip() != insert_line.strip():
                    out.append(insert_line)

    out.append(line)

    if stripped.startswith('},') or stripped == '}':
        if stack:
            stack.pop()

path.write_text('\n'.join(out) + '\n', encoding='utf-8')
