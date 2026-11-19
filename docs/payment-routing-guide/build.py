# Builds guide.html from guide.template.html. Screenshots are read from ./screens/<name>.png
# and embedded, so the final file is a single shareable page. Missing ones show a dashed box.
import base64, os, re
here = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(here, 'guide.template.html'), encoding='utf-8').read()
missing = []
def sub(m):
    name = m.group(1)
    path = next((p for p in (os.path.join(here,'screens',name+e) for e in ('.png','.jpg')) if os.path.exists(p)), '')
    if path:
        b = base64.b64encode(open(path, 'rb').read()).decode()
        return '<img alt="%s" src="data:image/%s;base64,%s">' % (name, 'png' if path.endswith('png') else 'jpeg', b)
    missing.append(name)
    return '<div class="slot">Screenshot to add: <b>%s</b></div>' % name
out = re.sub(r'\{\{img:([a-z0-9-]+)\}\}', sub, s)
open(os.path.join(here, 'guide.html'), 'w', encoding='utf-8').write(out)
print('built guide.html; missing screenshots:', missing)
