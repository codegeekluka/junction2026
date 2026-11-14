// Question sets for the Decisions API watcher.
// Each question: { label (UI only), type: 'noul' | 'choice' | 'score', instructions, criteria? }
//   noul   → P(yes) + confidence            (yes/no)
//   choice → criteria: { option_id: description }, 2–255 options
//   score  → criteria: [lowest, ..., highest]
// Up to 1,000 questions per call cost about the same latency as 1, so ask everything at once.

export const QUESTION_SETS = {
  // Google booth advice: start trivially simple to prove live streaming works.
  bottle: {
    // "The bottle" = the one on the table in front of the camera. Lesson from session 2:
    // background bottles made "out of view" read as "standing".
    bottle_visible: {
      label: 'Bottle in front of the camera',
      type: 'noul',
      instructions: 'Is there a bottle in the foreground, on the table or surface directly in front of the camera, within reach? Ignore anything in the background (other tables, shelves, far away). Cups, mugs and cans do not count.',
    },
    bottle_upright: {
      label: 'Standing upright',
      type: 'noul',
      instructions: 'Is the foreground bottle standing upright on its base on the surface? A hand touching or gripping it still counts as standing if its base is on the surface.',
    },
    bottle_state: {
      label: 'Bottle state',
      type: 'choice',
      instructions: 'Looking only at the foreground, on the table or surface directly in front of the camera (ignore the background): what best describes the bottle?',
      criteria: {
        standing: 'A bottle standing upright with its base on the surface (even if a hand is touching or gripping it)',
        fallen: 'A bottle lying on its side or tipped over on the surface',
        held: 'A bottle lifted up off the surface in a hand',
        none: 'No bottle in the foreground (bottles far away in the background, cups, mugs and cans do not count)',
      },
    },
    image_quality: {
      label: 'Too dark or blurry',
      type: 'noul',
      instructions: 'Is the image too dark or too blurry to judge what is in it?',
    },
  },

  // First branch of the sink tree (placeholder until the expert-written repair plan, step 3).
  sink_start: {
    problem: {
      label: 'What is the problem?',
      type: 'choice',
      instructions: 'This is a view of household plumbing (a sink, a tap, or the drain pipes under a sink). Which situation is shown?',
      criteria: {
        leaking_trap: 'Water dripping or pooling around the curved drain pipe (P-trap) or its nuts',
        slow_drain: 'Water standing in the basin, draining slowly',
        dripping_tap: 'The tap/faucet is dripping while closed',
        no_visible_problem: 'Sink, tap or drain pipes are visible and look normal: no water leaking or standing',
        no_plumbing: 'No sink, tap or pipes are visible at all',
      },
    },
    bucket_under_trap: {
      label: 'Bucket under the trap',
      type: 'noul',
      instructions: 'Is there a bucket, bowl or container directly under the curved drain pipe?',
    },
    hands_visible: {
      label: 'Hands in view',
      type: 'noul',
      instructions: 'Are a person\'s hands visible in the image?',
    },
    image_quality: {
      label: 'Too dark or blurry',
      type: 'noul',
      instructions: 'Is the image too dark or too blurry to judge what is in it?',
    },
  },
};

// The one answer the UI shows big, per set: which question, and plain words for each option.
export const HEADLINES = {
  bottle: {
    question: 'bottle_state',
    // Decision tree: the state only counts if the gate says a bottle is there at all.
    gate: { question: 'bottle_visible', absent: 'none' },
    title: 'The bottle is…',
    labels: { standing: 'Standing up', fallen: 'Fallen over', held: 'Lifted in a hand', none: 'Not in view' },
  },
  sink_start: {
    question: 'problem',
    title: 'What I see',
    labels: {
      leaking_trap: 'Leak at the drain pipe', slow_drain: 'Slow drain', dripping_tap: 'Dripping tap',
      no_visible_problem: 'No problem visible', no_plumbing: 'No plumbing in view',
    },
  },
};

// Plain-language names for the other questions (shown in "details").
export const QUALITY_QUESTION = 'image_quality';
