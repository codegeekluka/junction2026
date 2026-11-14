# Exports every card from cards.js: animated .svg files (svg/) and resting-pose transparent 2x PNGs (png/).
# Usage: python -I export.py   (needs Google Chrome)
import json, html, re, subprocess, pathlib, os, tempfile
d = pathlib.Path(__file__).parent.resolve()
chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
prof = os.path.join(tempfile.gettempdir(), "chrome-export")
def url(name, frag=""):
    return "file:///" + str(d / name).replace("\\", "/").replace(" ", "%20") + (("#" + frag) if frag else "")
dom = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--user-data-dir=" + prof, "--dump-dom", url("dump.html")],
                     capture_output=True, text=True, encoding="utf-8").stdout
cards = json.loads(html.unescape(re.findall(r'<pre id="out">(.*?)</pre>', dom, re.S)[-1]))
for sub in ("svg", "png"):
    (d / sub).mkdir(exist_ok=True)
    for f in (d / sub).iterdir():
        f.unlink()
for c in cards:
    (d / "svg" / (c["base"] + ".svg")).write_text(c["svg"], encoding="utf-8")
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--default-background-color=00000000",
                    "--force-device-scale-factor=2", "--window-size=600,600", "--virtual-time-budget=4000",
                    "--user-data-dir=" + prof, "--screenshot=" + str(d / "png" / (c["base"] + ".png")), url("export.html", c["base"].split("-", 1)[1])],
                   capture_output=True)
print(len(cards), "cards exported")
