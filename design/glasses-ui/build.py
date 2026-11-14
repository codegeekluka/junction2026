# Builds sink-state-cards.html from preview-template.html with cards.js inlined (self-contained page).
import pathlib
d = pathlib.Path(__file__).parent
t = (d / 'preview-template.html').read_text(encoding='utf-8')
js = (d / 'cards.js').read_text(encoding='utf-8')
out = t.replace('<script src="cards.js"></script>', '<script>\n' + js + '\n</script>')
(d / 'sink-state-cards.html').write_text(out, encoding='utf-8')
print('built', len(out))
