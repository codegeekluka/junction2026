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
//     short                  the instruction in ≤ 6 words, for the glasses display ("Both nuts left, by hand")
//     tip                    optional detail for a tricky step ("Washer: flat side to the nut")
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
      { id: 'place', title: 'Stand the bottle up', short: 'Stand the bottle up', say: 'Put the bottle on the table in front of you, standing upright.',
        done: { q: 'bottle_state', is: 'standing', min: 0.75 } },
      { id: 'cap', title: 'Check the cap', short: 'Cap on tight?', tip: 'Twist it to the right to close', gate: true, say: 'Make sure the cap is on before we tip it. Safety first.',
        done: { q: 'cap_on', min: 0.75 } },
      { id: 'tip', title: 'Lay it on its side', short: 'Tip it on its side', tip: 'Keep it on the table, don\u2019t lift', say: 'Now gently lay the bottle down on its side.',
        done: { q: 'bottle_state', is: 'fallen', min: 0.75 },
        mistakes: [
          // Prevents the harm before it happens: cap off while about to tip = spill.
          { id: 'cap_off_before_tip', q: 'cap_on', is: false, min: 0.8, say: 'Stop! The cap is off. Put it back on before you tip it, or it will spill.' },
          { id: 'lifted', q: 'bottle_state', is: 'held', min: 0.8, say: 'Don’t lift it, just tip it over on the table.' },
        ] },
      { id: 'pickup', title: 'Pick it up', short: 'Pick it up', say: 'Great. Now pick the bottle up off the table.',
        done: { q: 'bottle_state', is: 'held', min: 0.75 },
        mistakes: [{ id: 'cap_off_pickup', q: 'cap_on', is: false, min: 0.8, say: 'Careful, the cap came off. Put it back on before you pick it up.' }] },
    ],
  },

  // Bottle trap (pullovesilukko): the usual trap under a Finnish bathroom basin.
  // From docs/knowledge/sink-drain.md §2.1 / §7.1 (Hansgrohe cleaning instructions + guides).
  // AI-drafted from cited sources; still needs the HVAC member's review.
  bottle_trap: {
    title: 'Unclog a basin (clean the bottle trap)',
    match: 'bathroom basin or sink draining slowly / blocked / smelly, with a BOTTLE trap (vertical cylinder with a screw-off bottom cup) under it',
    quality: 'image_quality',
    cards: { done: 'drain-clear', look: 'look-down', mistake: 'careful' },
    inView: { q: 'sink_in_view', min: 0.4, what: 'the sink' },
    questions: {
      sink_in_view: { label: 'Sink area in view', type: 'noul',
        instructions: 'Is a sink, its drain, the tap, or the pipework directly under a sink visible in the image?' },
      stopper_out: { label: 'Stopper out', type: 'noul',
        instructions: 'Is the sink drain open, with the pop-up stopper/plug lifted out of the drain hole (or held in a hand)?' },
      bucket_under_cup: { label: 'Bucket under the trap', type: 'noul',
        instructions: 'Is there a bucket or bowl directly below the bottom of the bottle-shaped (cylindrical) trap under the sink, positioned to catch water?' },
      cup_removed: { label: 'Bottom cup off', type: 'noul',
        instructions: 'Is the bottom cap/cup of the cylindrical trap removed, so there is an open gap under the trap body (or the cup is held in a hand)?' },
      water_outside: { label: 'Water spilling outside the bucket', type: 'noul',
        instructions: 'Is water dripping or spilling outside the bucket, onto the cabinet floor?' },
      cup_clean: { label: 'Cup clean', type: 'noul',
        instructions: 'Is the removed trap cup being rinsed or scrubbed, or is its inside visibly free of hair and dark sludge?' },
      ring_seated: { label: 'Rubber ring seated', type: 'noul',
        instructions: 'Is a rubber ring (O-ring) visible, sitting flat all the way round in the groove of the trap cup?' },
      ring_problem: { label: 'Ring missing or twisted', type: 'noul',
        instructions: 'Is the rubber ring of the trap cup missing, twisted, or sticking out of its groove?' },
      cup_on: { label: 'Cup back on, straight', type: 'noul',
        instructions: 'Is the bottom cup screwed back onto the cylindrical trap body, sitting straight and level?' },
      cup_tilted: { label: 'Cup tilted', type: 'noul',
        instructions: 'Is the bottom cup of the trap visibly tilted or crooked on the trap body?' },
      tool_on_plastic: { label: 'Pliers on plastic', type: 'noul',
        instructions: 'Are pliers or a wrench being used on a plastic part of the trap?' },
      water_draining: { label: 'Water running and draining', type: 'noul',
        instructions: 'Is water running from the tap into the sink and draining away (not standing in the basin)?' },
      drips: { label: 'Drips at the trap', type: 'noul',
        instructions: 'Is a water drop hanging from, or falling off, the trap or its bottom cup?' },
      standing_water: { label: 'Standing water', type: 'noul',
        instructions: 'Is there standing water filling the sink basin?' },
      hand_on_trap: { label: 'Hand on the trap', type: 'noul',
        instructions: 'Is a hand touching or gripping the cylindrical trap or its bottom cup under the sink?' },
      damage: { label: 'Cracked or corroded', type: 'noul',
        instructions: 'Is there visible rust, green corrosion, or a crack on the trap or its parts?' },
      image_quality: { label: 'Too dark or blurry', type: 'noul',
        instructions: 'Is the image too dark or too blurry to judge what is in it?' },
    },
    steps: [
      { id: 'stopper', card: 'step-1-stopper', title: 'Pull the stopper', short: 'Pull the stopper out',
        tip: 'Used drain cleaner today? Stop.',
        say: 'First: have you poured any drain cleaner in today? If you have, don’t open anything, it can burn. If not, lift the stopper out of the drain and pull off any hair.',
        done: { q: 'stopper_out', min: 0.75 } },
      { id: 'bucket', card: 'step-2-bucket', title: 'Bucket under the trap', gate: true, short: 'Bucket under the trap',
        tip: 'Gloves on. Bucket right under the cup',
        say: 'Put on gloves, and put a bucket right under the bottle-shaped trap, under its bottom cup. Dirty water will come out.',
        done: { q: 'bucket_under_cup', min: 0.75 },
        // Reaching for the trap before the bucket is there = the classic beginner mistake.
        mistakes: [{ id: 'reach_no_bucket', card: 'careful', q: 'hand_on_trap', min: 0.8,
          say: 'Wait! Don’t open it yet. Bucket first, the water in there will spill everywhere.' }] },
      { id: 'unscrew', title: 'Unscrew the bottom cup', short: 'Hold the trap, unscrew the cup',
        tip: 'Turn the cup left, by hand',
        say: 'Hold the trap body still with one hand. With the other, turn the bottom cup to the left, by hand, and let the water drop into the bucket.',
        done: { q: 'cup_removed', min: 0.75 },
        mistakes: [
          { id: 'no_bucket', card: 'careful', q: 'bucket_under_cup', is: false, min: 0.8,
            say: 'Stop. The bucket isn’t under the trap. Move it right under the cup before you unscrew.' },
          { id: 'spill', card: 'careful', q: 'water_outside', min: 0.8, say: 'Careful, water is going outside the bucket. Move the bucket under it.' },
          { id: 'damage', card: 'stop-water', q: 'damage', min: 0.8,
            say: 'Stop. That part looks cracked or corroded. Don’t force it. A plumber or your housing company should replace it.' },
          { id: 'pliers', card: 'careful', q: 'tool_on_plastic', min: 0.8, say: 'No pliers on the plastic, it cracks. By hand only.' },
        ] },
      { id: 'clean', card: 'step-4-rinse', title: 'Empty and clean', short: 'Empty and clean the cup',
        tip: 'Old toothbrush. No scourer.',
        say: 'Tip the gunk into the bucket and scrub the cup and inside the trap with an old toothbrush. Rinse with warm water.',
        done: { q: 'cup_clean', min: 0.75 } },
      { id: 'ring', title: 'Check the rubber ring', short: 'Rubber ring flat in the groove', action: false,
        tip: 'Cracked or flat? Replace it.',
        say: 'Look at the rubber ring in the cup. It has to sit flat in its groove, all the way round. Show it to me.',
        done: { q: 'ring_seated', min: 0.75 },
        mistakes: [{ id: 'ring', card: 'careful', q: 'ring_problem', min: 0.8,
          say: 'The rubber ring isn’t sitting right. Press it flat into the groove before you screw the cup back on.' }] },
      { id: 'refit', title: 'Screw the cup back on', short: 'Screw the cup on, by hand',
        tip: 'Start it straight. Hand-tight.',
        say: 'Screw the cup back on by hand. Start it straight, turn it slightly back until it clicks into the thread, then hand-tight. No pliers.',
        done: { q: 'cup_on', min: 0.75 },
        mistakes: [
          { id: 'tilted', card: 'try-again', q: 'cup_tilted', min: 0.8, say: 'The cup looks crooked. Unscrew it and start it again, straight.' },
          { id: 'pliers2', card: 'careful', q: 'tool_on_plastic', min: 0.8, say: 'Hand-tight only, no pliers on the plastic.' },
        ] },
      { id: 'water', card: 'step-6-water', title: 'Run the water', short: 'Run the tap',
        tip: 'I’m watching for drips',
        say: 'Run the tap for a few seconds while I watch the cup for drips. Keep the bucket under it for now.',
        done: { q: 'water_draining', min: 0.75 },
        mistakes: [
          { id: 'leak', card: 'careful', q: 'drips', min: 0.75,
            say: 'I can see a drip at the cup. Turn the tap off and hand-tighten it a little. If it still drips, check the rubber ring.' },
          { id: 'still_blocked', card: 'stop-water', q: 'standing_water', min: 0.8,
            say: 'Turn the tap off. The water isn’t draining, so the blockage is further down the pipe. That’s a job for your housing company or a plumber. Don’t push anything into the pipe.' },
        ] },
    ],
  },

  // DRAFT, not yet expert-reviewed: replace/confirm with the HVAC teammate.
  // Steps match the designers' display cards (design/glasses-ui: step-1-stopper … step-6-water).
  ptrap: {
    title: 'Unclog a sink (clean the drain trap)',
    match: 'sink (usually a kitchen sink) with a U-SHAPED pipe and two big nuts under it: draining slowly, blocked, smelly, leaking',
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
      { id: 'stopper', card: 'step-1-stopper', title: 'Pull the stopper', short: 'Pull the stopper out', tip: 'Used drain cleaner today? Stop.',
        say: 'First: have you poured any drain cleaner in today? If you have, don’t open the pipe, it can burn. If not, pull the stopper straight up and out of the drain.',
        done: { q: 'stopper_out', min: 0.75 } },
      { id: 'bucket', card: 'step-2-bucket', title: 'Bucket under the pipe', short: 'Bucket under the U-pipe', tip: 'There\u2019s water in the pipe', gate: true,
        say: 'Put a bucket right under the U-shaped pipe. There’s water in it.',
        done: { q: 'bucket_under_trap', min: 0.75 } },
      { id: 'unscrew', card: 'step-3-unscrew', title: 'Unscrew by hand', short: 'Both nuts left, by hand', tip: 'Lower the pipe into the bucket',
        say: 'Turn both big nuts to the left, by hand, and lower the U-pipe into the bucket.',
        done: { q: 'trap_removed', min: 0.75 },
        mistakes: [{ id: 'no_bucket', card: 'careful', q: 'bucket_under_trap', is: false, min: 0.8,
          say: 'Stop. There’s no bucket under the pipe. Put it back before you loosen anything, the water will spill.' }] },
      { id: 'rinse', card: 'step-4-rinse', title: 'Empty and rinse', short: 'Empty and rinse the pipe', tip: 'Keep the washers in the nuts',
        say: 'Empty the pipe into the bucket and rinse it out. Check the washers are still in the nuts.',
        done: { q: 'trap_rinsing', min: 0.75 } },
      { id: 'refit', card: 'step-5-refit', title: 'Screw back on', short: 'Screw back on, hand-tight', tip: 'Washer: flat side to the nut',
        say: 'Screw the pipe back on, hand-tight. Flat side of each washer towards the nut.',
        done: { q: 'trap_attached', min: 0.75 } },
      { id: 'water', card: 'step-6-water', title: 'Run the water', short: 'Run the tap', tip: 'I\u2019m watching the joints for drips',
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
