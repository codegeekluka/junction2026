// Diagnosis trees (Google booth advice): identify ONE problem first, then branch.
// The whole tree is asked in one Decisions API call per frame and walked in code:
//   problem (choice) → that branch's confirm check → expert procedure, or escalate to Live.
// Confident + confirmed + procedure  → offer the expert procedure.
// Confident but no procedure yet     → escalate: Live helps with its own knowledge (flagged as not expert-verified).
// Unsure for a few seconds           → escalate: Live looks itself / asks a clarifying question.
// Hazard                             → urgent stop.

export const DIAGNOSES = {
  sink: {
    title: 'Sink problem',
    quality: 'image_quality',
    hazard: { card: 'careful', q: 'hazard', min: 0.75, say: 'Stop. That looks dangerous. Turn off the water at the valve, keep away from any electrics, and call a professional.' },
    questions: {
      problem: {
        label: 'Which problem', type: 'choice',
        instructions: 'This is a view of household plumbing (a sink, a tap, or the drain pipes under a sink). Which situation is shown?',
        criteria: {
          leaking_trap: 'Water dripping or pooling around the curved drain pipe (P-trap) or its nuts under the sink',
          slow_drain: 'Water standing in the sink basin, not draining',
          dripping_tap: 'The tap/faucet is dripping while closed',
          no_visible_problem: 'Sink, tap or drain pipes are visible and look normal: no water leaking or standing',
          no_plumbing: 'No sink, tap or pipes are visible at all',
        },
      },
      trap_type: {
        label: 'Trap type', type: 'choice',
        instructions: 'Which kind of drain trap is under this sink?',
        criteria: {
          bottle: 'A vertical cylinder (bottle shape) with a screw-off bottom cup, and a straight pipe going sideways into the wall',
          u_pipe: 'A U-shaped curved pipe with a big nut on each side',
          cant_tell: 'The pipework under the sink is not visible, or it is neither of these',
        },
      },
      water_under: { label: 'Water under the sink', type: 'noul',
        instructions: 'Is there water dripping from, or pooled underneath, the drain pipes under the sink?' },
      standing_water: { label: 'Standing water in basin', type: 'noul',
        instructions: 'Is there standing water in the sink basin?' },
      tap_dripping: { label: 'Tap dripping', type: 'noul',
        instructions: 'Is water dripping from the tap/faucet spout?' },
      hazard: { label: 'Hazard', type: 'noul',
        instructions: 'Is there a hazard: water spraying under pressure, a burst or cracked pipe, or electrical cables/sockets/appliances wet or near leaking water?' },
      image_quality: { label: 'Too dark or blurry', type: 'noul',
        instructions: 'Is the image too dark or too blurry to judge what is in it?' },
    },
    branches: {
      // procedure 'by_trap' → bottle_trap or ptrap from the trap_type answer (Finland: bottle by default)
      leaking_trap: { label: 'a leak at the drain trap', confirm: { q: 'water_under', min: 0.6 }, procedure: 'by_trap' },
      slow_drain: { label: 'a slow or blocked drain', confirm: { q: 'standing_water', min: 0.6 }, procedure: 'by_trap' },
      dripping_tap: { label: 'a dripping tap', confirm: { q: 'tap_dripping', min: 0.6 }, procedure: null },
      no_visible_problem: { label: 'no visible problem', procedure: null, nothingWrong: true },
      no_plumbing: { label: 'no plumbing in view', procedure: null, showMe: 'Point the camera at the sink and the pipes underneath.' },
    },
  },

  // Test tree you can run at a desk with a bottle.
  bottle: {
    title: 'Bottle check (test diagnosis)',
    quality: 'image_quality',
    hazard: { q: 'broken_glass', min: 0.8, say: 'Careful, that looks like broken glass. Don’t touch it with bare hands.' },
    questions: {
      problem: {
        label: 'Which problem', type: 'choice',
        instructions: 'Looking only at the foreground, on the table directly in front of the camera (ignore the background): what is the situation with the bottle?',
        criteria: {
          fallen: 'A bottle lying on its side or tipped over on the table',
          open: 'A bottle standing upright with its cap off (open)',
          fine: 'A bottle standing upright with its cap on',
          no_bottle: 'No bottle in the foreground',
        },
      },
      bottle_lying: { label: 'Bottle lying down', type: 'noul',
        instructions: 'Is the foreground bottle lying on its side on the table?' },
      cap_off: { label: 'Cap off', type: 'noul',
        instructions: 'Is the cap off the foreground bottle (bottle open)?' },
      broken_glass: { label: 'Broken glass', type: 'noul',
        instructions: 'Is there broken glass or shattered bottle pieces visible?' },
      image_quality: { label: 'Too dark or blurry', type: 'noul',
        instructions: 'Is the image too dark or too blurry to judge what is in it?' },
    },
    branches: {
      fallen: { label: 'a bottle that has fallen over', confirm: { q: 'bottle_lying', min: 0.6 }, procedure: 'bottle_demo' },
      open: { label: 'an open bottle', confirm: { q: 'cap_off', min: 0.6 }, procedure: null },
      fine: { label: 'a bottle that looks fine', procedure: null, nothingWrong: true },
      no_bottle: { label: 'no bottle in view', procedure: null, showMe: 'Put the bottle on the table in front of you.' },
    },
  },
};
