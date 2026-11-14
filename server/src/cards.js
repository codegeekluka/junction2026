// The designers' glasses display cards (design/glasses-ui/png, 1200×1200 PNG, transparent).
// The server picks a card id for every 'hud' message; clients show /cards/<file>.png
// (scaled to 600×600 on the Ray-Ban Display). Clients without images use the hud text.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CARDS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../design/glasses-ui/png');

// "12-step-2-bucket.png" → id "step-2-bucket"
const files = fs.existsSync(CARDS_DIR) ? fs.readdirSync(CARDS_DIR).filter((f) => f.endsWith('.png')) : [];
const byId = Object.fromEntries(files.map((f) => [f.replace(/^\d+-/, '').replace(/\.png$/, ''), f]));

/** { card, cardUrl } for a card id, or {} if there is no such card. */
export function cardFields(id) {
  if (!id || !byId[id]) return {};
  return { card: id, cardUrl: `/cards/${byId[id]}` };
}

export const cardIds = () => Object.keys(byId);
