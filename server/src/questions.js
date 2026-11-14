// Question sets for the Decisions API watcher.
// Each question: { label (UI only), type: 'noul' | 'choice' | 'score', instructions, criteria? }
//   noul   → P(yes) + confidence            (yes/no)
//   choice → criteria: { option_id: description }, 2–255 options
//   score  → criteria: [lowest, ..., highest]
// Up to 1,000 questions per call cost about the same latency as 1, so ask everything at once.

export const QUESTION_SETS = {
  // Google booth advice: start trivially simple to prove live streaming works.
  bottle: {
    bottle_visible: {
      label: 'Bottle in view',
      type: 'noul',
      instructions: 'Is a bottle clearly visible in the image?',
    },
    bottle_upright: {
      label: 'Bottle standing upright',
      type: 'noul',
      instructions: 'Is the bottle standing upright on its base (not lying on its side or tipped over)?',
    },
    bottle_state: {
      label: 'Bottle state',
      type: 'choice',
      instructions: 'What best describes the bottle in the image?',
      criteria: {
        standing: 'A bottle standing upright on its base',
        fallen: 'A bottle lying on its side or tipped over',
        held: 'A bottle being held in a hand',
        none: 'No bottle is visible',
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
    title: 'The bottle is…',
    labels: { standing: 'Standing up', fallen: 'Fallen over', held: "In someone's hand", none: 'Not in view' },
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
