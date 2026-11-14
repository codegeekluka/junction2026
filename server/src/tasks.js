// Expert procedures ("tasks"): the knowledge Meta won't build natively.
// Each step says what the coach asks the user to do, what the watcher (Decisions API)
// must SEE before the step counts as done, and which mistakes to warn about.
//
// FORMAT (for the expert / HVAC teammate: plain words are fine, Luka's AI converts them):
//   questions: { id: { label, type: 'noul' | 'choice', instructions, criteria? } }
//     → asked on every frame in one Decisions API call (~0.4 s, up to 1,000 questions)
//   steps: [{
//     id, title,             short name shown on the display ("Bucket under the trap")
//     say,                   what the coach tells the user to do
//     done: { q, min } | { q, is, min }   must be seen in 2 checks in a row to advance
//     mistakes: [{ id, q, is?, min, say }] warnings the coach gives immediately
//     gate: true             safety step: can't be skipped
//   }]
//   quality: question id for "too dark/blurry" (pauses checking + asks for light)
//
// A check passes when: noul question → P(yes) ≥ min; choice question → answer is `is`
// with confidence ≥ min. Booth advice: ≥ 0.75 = "very sure".

export const TASKS = {
  // Test procedure you can run at a desk: proves the watcher → voice loop works.
  bottle_demo: {
    title: 'Bottle practice (test procedure)',
    match: 'testing, practice, demo with a bottle',
    quality: 'image_quality',
    questions: {
      bottle_state: {
        label: 'Bottle state', type: 'choice',
        instructions: 'Looking only at the foreground, on the table or surface directly in front of the camera (ignore the background): what best describes the bottle?',
        criteria: {
          standing: 'A bottle standing upright with its base on the surface (even if a hand is touching or gripping it)',
          fallen: 'A bottle lying on its side or tipped over on the surface',
          held: 'A bottle lifted up off the surface in a hand',
          none: 'No bottle in the foreground (bottles far away in the background, cups, mugs and cans do not count)',
        },
      },
      cap_on: {
        label: 'Cap on', type: 'noul',
        instructions: 'Is the foreground bottle closed with its cap on?',
      },
      image_quality: {
        label: 'Too dark or blurry', type: 'noul',
        instructions: 'Is the image too dark or too blurry to judge what is in it?',
      },
    },
    steps: [
      { id: 'place', title: 'Stand the bottle up', say: 'Put the bottle on the table in front of you, standing upright.',
        done: { q: 'bottle_state', is: 'standing', min: 0.75 } },
      { id: 'cap', title: 'Check the cap', gate: true, say: 'Make sure the cap is on before we tip it. Safety first.',
        done: { q: 'cap_on', min: 0.75 } },
      { id: 'tip', title: 'Lay it on its side', say: 'Now gently lay the bottle down on its side.',
        done: { q: 'bottle_state', is: 'fallen', min: 0.75 },
        mistakes: [{ id: 'lifted', q: 'bottle_state', is: 'held', min: 0.8, say: 'Don’t lift it, just tip it over on the table.' }] },
      { id: 'pickup', title: 'Pick it up', say: 'Great. Now pick the bottle up off the table.',
        done: { q: 'bottle_state', is: 'held', min: 0.75 } },
    ],
  },

  // DRAFT, not yet expert-reviewed: replace with the HVAC teammate's procedure.
  ptrap: {
    title: 'Clear or re-seat a sink drain trap (P-trap)',
    match: 'sink draining slowly, blocked sink, smelly sink, leaking drain pipe under the sink, P-trap',
    quality: 'image_quality',
    questions: {
      trap_visible: {
        label: 'Trap in view', type: 'noul',
        instructions: 'Is the curved U-shaped drain pipe (P-trap) under a sink clearly visible?',
      },
      bucket_under_trap: {
        label: 'Bucket under the trap', type: 'noul',
        instructions: 'Is there a bucket, bowl or container directly under the curved U-shaped drain pipe, positioned to catch water?',
      },
      trap_attached: {
        label: 'Trap attached', type: 'noul',
        instructions: 'Is the curved U-shaped drain pipe connected to the pipes on both ends (not removed)?',
      },
      trap_removed: {
        label: 'Trap removed', type: 'noul',
        instructions: 'Has the curved U-shaped drain pipe been taken off, e.g. held in a hand or lying in a bucket, with a gap where it was?',
      },
      water_running: {
        label: 'Tap running', type: 'noul',
        instructions: 'Is water running from the tap into the sink?',
      },
      drips: {
        label: 'Drips at joints', type: 'noul',
        instructions: 'Are there water drips or wet leaks coming from the joints or nuts of the drain pipes under the sink?',
      },
      image_quality: {
        label: 'Too dark or blurry', type: 'noul',
        instructions: 'Is the image too dark or too blurry to judge what is in it?',
      },
    },
    steps: [
      { id: 'find', title: 'Find the trap', say: 'Open the cabinet and look at the pipes under the sink. I’m looking for the U-shaped pipe.',
        done: { q: 'trap_visible', min: 0.75 } },
      { id: 'bucket', title: 'Bucket under the trap', gate: true, say: 'Put a bucket or bowl right under the U-shaped pipe. There’s water in it.',
        done: { q: 'bucket_under_trap', min: 0.75 } },
      { id: 'remove', title: 'Loosen the nuts and remove the trap', say: 'Unscrew the two big plastic nuts by hand, anticlockwise, and lower the U-pipe into the bucket.',
        done: { q: 'trap_removed', min: 0.75 },
        mistakes: [{ id: 'no_bucket', q: 'bucket_under_trap', is: false, min: 0.8, say: 'Stop. There’s no bucket under the pipe. Put it back before you loosen anything.' }] },
      { id: 'refit', title: 'Clean and refit the trap', say: 'Clean it out, then screw it back on. Washers flat side to the nut. Hand-tight plus a quarter turn.',
        done: { q: 'trap_attached', min: 0.75 } },
      { id: 'test', title: 'Run water and check for drips', say: 'Run the tap for ten seconds while I watch the joints for drips.',
        done: { q: 'water_running', min: 0.75 },
        mistakes: [{ id: 'leak', q: 'drips', min: 0.75, say: 'I can see a drip at a joint. Turn the tap off and tighten that nut a quarter turn.' }] },
    ],
  },
};

export const taskSummaries = () =>
  Object.entries(TASKS).map(([id, t]) => ({ id, title: t.title, when: t.match, steps: t.steps.length }));
