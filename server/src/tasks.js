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
//     mistakes: [{ id, q, is?, min, say, card? }] warnings the coach gives immediately
//     card                   glasses display card id (design/glasses-ui), e.g. 'step-2-bucket'
//     gate: true             safety step: can't be skipped ("already true" counts at once)
//     action: false          set for pure state checks; action steps must be seen NOT done first
//   inView: { q, min, what } is the object in view at all? (else: "point the camera at it")
//   }]
//   quality: question id for "too dark/blurry" (pauses checking + asks for light)
//
// A check passes when: noul question → P(yes) ≥ min; choice question → answer is `is`
// with confidence ≥ min. Booth advice: ≥ 0.75 = "very sure".

export const TASKS = {
  // Test procedure you can run at a desk: proves the watcher → voice loop works.
  bottle_demo: {
    title: 'Bottle practice (test procedure)',
    cards: { done: 'correct', look: 'look-down', mistake: 'careful' },
    match: 'testing, practice, demo with a bottle',
    quality: 'image_quality',
    inView: { q: 'bottle_visible', min: 0.4, what: 'the bottle' },
    questions: {
      bottle_visible: {
        label: 'Bottle in view', type: 'noul',
        instructions: 'Is there a bottle in the foreground, on or just above the table directly in front of the camera (in a hand counts)? Ignore anything far away in the background.',
      },
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
        mistakes: [
          // Prevents the harm before it happens: cap off while about to tip = spill.
          { id: 'cap_off_before_tip', q: 'cap_on', is: false, min: 0.8, say: 'Stop! The cap is off. Put it back on before you tip it, or it will spill.' },
          { id: 'lifted', q: 'bottle_state', is: 'held', min: 0.8, say: 'Don’t lift it, just tip it over on the table.' },
        ] },
      { id: 'pickup', title: 'Pick it up', say: 'Great. Now pick the bottle up off the table.',
        done: { q: 'bottle_state', is: 'held', min: 0.75 },
        mistakes: [{ id: 'cap_off_pickup', q: 'cap_on', is: false, min: 0.8, say: 'Careful, the cap came off. Put it back on before you pick it up.' }] },
    ],
  },

  // DRAFT, not yet expert-reviewed: replace/confirm with the HVAC teammate.
  // Steps match the designers' display cards (design/glasses-ui: step-1-stopper … step-6-water).
  ptrap: {
    title: 'Unclog a sink (clean the drain trap)',
    match: 'sink draining slowly, blocked or clogged sink, smelly sink, leaking drain pipe under the sink, P-trap',
    quality: 'image_quality',
    cards: { done: 'drain-clear', look: 'look-down', mistake: 'careful' },
    inView: { q: 'sink_in_view', min: 0.4, what: 'the sink' },
    questions: {
      sink_in_view: {
        label: 'Sink area in view', type: 'noul',
        instructions: 'Is a sink, its drain, the tap, or the drain pipes under a sink visible in the image?',
      },
      stopper_out: {
        label: 'Stopper out', type: 'noul',
        instructions: 'Is the sink drain open, with the plug/stopper pulled out of the drain hole (or held in a hand)?',
      },
      trap_visible: {
        label: 'Trap in view', type: 'noul',
        instructions: 'Is the curved U-shaped drain pipe (P-trap) under a sink clearly visible?',
      },
      bucket_under_trap: {
        label: 'Bucket under the trap', type: 'noul',
        instructions: 'Is there a bucket, bowl or container directly under the curved U-shaped drain pipe, positioned to catch water?',
      },
      trap_removed: {
        label: 'Trap removed', type: 'noul',
        instructions: 'Has the curved U-shaped drain pipe been taken off, e.g. held in a hand or lying in a bucket, with a gap where it was?',
      },
      trap_rinsing: {
        label: 'Trap being emptied/rinsed', type: 'noul',
        instructions: 'Is a removed U-shaped drain pipe being emptied or rinsed (held over a bucket or under running water), or is it visibly clean inside?',
      },
      trap_attached: {
        label: 'Trap attached', type: 'noul',
        instructions: 'Is the curved U-shaped drain pipe connected to the pipes on both ends (not removed)?',
      },
      water_draining: {
        label: 'Water running and draining', type: 'noul',
        instructions: 'Is water running from the tap into the sink and draining away (not standing in the basin)?',
      },
      standing_water: {
        label: 'Standing water', type: 'noul',
        instructions: 'Is there standing water filling the sink basin?',
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
      { id: 'stopper', card: 'step-1-stopper', title: 'Pull the stopper',
        say: 'First: have you poured any drain cleaner in today? If you have, don’t open the pipe, it can burn. If not, pull the stopper straight up and out of the drain.',
        done: { q: 'stopper_out', min: 0.75 } },
      { id: 'bucket', card: 'step-2-bucket', title: 'Bucket under the pipe', gate: true,
        say: 'Put a bucket right under the U-shaped pipe. There’s water in it.',
        done: { q: 'bucket_under_trap', min: 0.75 } },
      { id: 'unscrew', card: 'step-3-unscrew', title: 'Unscrew by hand',
        say: 'Turn both big nuts to the left, by hand, and lower the U-pipe into the bucket.',
        done: { q: 'trap_removed', min: 0.75 },
        mistakes: [{ id: 'no_bucket', card: 'careful', q: 'bucket_under_trap', is: false, min: 0.8,
          say: 'Stop. There’s no bucket under the pipe. Put it back before you loosen anything, the water will spill.' }] },
      { id: 'rinse', card: 'step-4-rinse', title: 'Empty and rinse',
        say: 'Empty the pipe into the bucket and rinse it out. Check the washers are still in the nuts.',
        done: { q: 'trap_rinsing', min: 0.75 } },
      { id: 'refit', card: 'step-5-refit', title: 'Screw back on',
        say: 'Screw the pipe back on, hand-tight. Flat side of each washer towards the nut.',
        done: { q: 'trap_attached', min: 0.75 } },
      { id: 'water', card: 'step-6-water', title: 'Run the water',
        say: 'Run the tap for a few seconds while I watch the pipe for drips.',
        done: { q: 'water_draining', min: 0.75 },
        mistakes: [
          { id: 'leak', card: 'careful', q: 'drips', min: 0.75, say: 'I can see a drip at a joint. Turn the tap off and tighten that nut a quarter turn by hand.' },
          { id: 'still_blocked', card: 'stop-water', q: 'standing_water', min: 0.8,
            say: 'Turn the tap off. The water isn’t draining, so the blockage is further down, in the building’s drain. That’s a job for a plumber.' },
        ] },
    ],
  },
};

export const taskSummaries = () =>
  Object.entries(TASKS).map(([id, t]) => ({ id, title: t.title, when: t.match, steps: t.steps.length }));
