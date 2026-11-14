# Glasses UI: sink-unclogging state cards (Ray-Ban Display)

30 display cards, one per state of the sink repair, for the Meta Ray-Ban Display's 600 × 600 screen. Each card is an icon plus 1–3 words, animated, and comes with a sound and a voice line. Styling follows the team's Ray-Ban Display design guide: Noto Sans, light text, cyan `#00D4FF` (with a glow) only on the focused item, amber `#FFAA00` for warnings, and buttons at least 88 px tall docked at the bottom.

**Preview everything:** open `sink-state-cards.html` in a browser. It shows every card playing over a drawn bathroom view, with its motion, sound and voice line. Click a card to enlarge it.

## What's in here

| Path | What it is | Use it for |
|---|---|---|
| `svg/NN-<id>.svg` | **Master.** One self-contained animated SVG per card. The animations live in each file's own `<style>`. | Web-app route: drop it in as is. Source for any other export. |
| `png/NN-<id>.png` | Still of each card, 1200 × 1200, transparent background | Toolkit `image()` component (scale to 600), slides, the pitch video |
| `cards.js` | Source that generates every card, with its id, name, motion, sound and voice line | Edit cards here, then re-export |
| `export.py` | Rebuilds `svg/` and `png/` from `cards.js` (needs Google Chrome) | `python -I export.py` |
| `build.py` | Rebuilds `sink-state-cards.html` from `preview-template.html` + `cards.js` | `python -I build.py` |
| `export.html`, `dump.html` | Helpers used by `export.py` | — |

On the glasses, black = see-through. The cards have no background, so render them on black (the toolkit already does).

## Motion rules (from Meta's web-app motion guide)
- Only position, rotation, scale and opacity animate (plus the stroke of the drawing check mark). There's no layout animation.
- Every loop is interruptible, so swapping to the next card at any moment is fine.
- Each card's resting pose is a complete still image. It's used for the PNGs and when the user has reduced motion turned on.

## Two ways onto the display (pick one; the cards work with both)
1. **Device Access Toolkit (our Android app drives the display):**
   - Components are text, image, button, icon and MP4 video.
   - Each `sendContent()` replaces the whole screen.
   - Video is limited to 400 px per side and 70,000 pixels in total (about 264 × 264), played from an `https` link.
   - For now, use the PNG stills as images. Animated MP4s can be rendered from `svg/` when we need them (needs ffmpeg).
2. **Display web app:** full HTML/CSS on the glasses, so the SVGs animate as they are. It has no camera or mic, so it would only show what the phone or server tells it. It's unconfirmed whether a web app can stay on screen while the DAT app streams the camera.

## Which card when (mapped to `docs/protocol.md` where possible)

| Card id | Show when |
|---|---|
| `ready` | App open, no session |
| `listening` | `status: live` and the user is speaking |
| `thinking` | `status: connecting`, or no coach reply after ~3 s |
| `scanning` | `watch: on`, frames being sent |
| `look-down` / `look-left` / `look-right` / `look-up` | Watcher `decision` confidence below 0.6 ("show me another angle") and the coach asks the user to look somewhere |
| `confirm` | Coach asks "is that it?" (Yes/No) |
| `safety` | Coach asks about drain cleaner (Yes/No) |
| `step-1-stopper` … `step-6-water` | Repair steps 1–6 (see note below) |
| `correct`, `next` | Step verified on camera / moving on |
| `try-again`, `move-bucket-left`, `move-bucket-right` | Step not right; the bucket is off to one side |
| `careful` | Coach warns about spilling or a hazard |
| `drain-clear` | Fixed, verified on camera |
| `stop-water`, `sent` | Hard stop (building drain blocked) → sent to maintenance |
| `all-off` | User says stop / turn off: camera and mic off; also `status: stopped` |
| `offline` | `status: offline` or `reconnecting` (step is kept; resume with `handle`) |
| `low-battery` | DAT `batteryLevel` low |
| `cooling` | DAT `thermalLevel` high (camera paused) |
| `paused` | DAT glasses taken off (`donState: DOFFED`) and put back on → Resume / End |

**Gap:** the protocol has no message that says which step or card to show. A small addition such as `{"type":"ui","card":"step-3-unscrew"}` from the server (or a tool call from the coach) would let the app pick the card directly. This is a suggestion only; nothing in `server/` was changed.

Sound and voice line for every card: see the captions in `sink-state-cards.html`, or the `earcon` and `voice` fields in `cards.js`.
