// story.js — Full Scene/State Definitions for "The Loop"
// Each scene has: bg, speaker, text, next, choices, action, minigame

export const SCENES = {

  // ─────────── INTRO ───────────
  'intro_black': {
    bg: 'black', speaker: '', text: '',
    action: 'rain_thunder',
    next: 'intro_alarm'
  },
  'intro_alarm': {
    bg: 'bedroom', speaker: '', text: '',
    action: 'alarm',
    next: 'intro_message'
  },
  'intro_message': {
    bg: 'bedroom', speaker: 'Miranda (SMS)', text: '"Night shift again tonight. Food\'s in the kitchen. Kids are upstairs. Love you."',
    next: 'act1_chores'
  },

  // ─────────── ACT 1 ───────────
  'act1_chores': {
    bg: 'kitchen', speaker: 'OBJECTIVE', text: 'Finish household chores. Start by washing the dishes.',
    next: 'act1_dishes'
  },
  'act1_dishes': {
    bg: 'kitchen', speaker: '', text: '',
    minigame: 'dishes',
    next: 'act1_sofa'
  },
  'act1_sofa': {
    bg: 'living_room', speaker: '(Narrator)', text: 'Ethan sinks onto the sofa and turns on the TV.',
    action: 'footstep',
    next: 'act1_news'
  },
  'act1_news': {
    bg: 'tv_room', speaker: 'News Anchor', text: '"Heavy rainfall expected through midnight. Stay indoors, folks…"',
    next: 'act1_power_cut'
  },
  'act1_power_cut': {
    bg: 'living_dark', speaker: '(Narrator)', text: 'Suddenly — the lights die.',
    action: 'power_off',
    next: 'act1_flashlight'
  },
  'act1_flashlight': {
    bg: 'hallway_dark', speaker: 'Ethan', text: '"Phone flashlight… okay. Gotta check the fuse box."',
    action: 'footstep',
    next: 'act1_backyard'
  },
  'act1_backyard': {
    bg: 'backyard_rain', speaker: '(Narrator)', text: 'Ethan steps into the pouring rain and reaches the fuse box.',
    action: 'rain_heavy',
    next: 'act1_fuse_burned'
  },
  'act1_fuse_burned': {
    bg: 'fusebox', speaker: 'Ethan', text: '"Burned fuse. Need a replacement from the storage room."',
    next: 'act1_get_fuse'
  },
  'act1_get_fuse': {
    bg: 'storage_room', speaker: '(Narrator)', text: 'Ethan rummages through the storage room and finds a replacement fuse.',
    next: 'act1_repair'
  },
  'act1_repair': {
    bg: 'fusebox', speaker: 'Ethan', text: '"There. That should do it."',
    action: 'power_on',
    next: 'act1_lights_return'
  },
  'act1_lights_return': {
    bg: 'hallway_lit', speaker: '(Narrator)', text: 'The lights flicker back on throughout the house.',
    next: 'act1_scream'
  },
  'act1_scream': {
    bg: 'staircase', speaker: 'Emily', text: '— SCREAMS —',
    action: 'scream',
    next: 'act1_victor_dead'
  },
  'act1_victor_dead': {
    bg: 'upstairs_blood', speaker: 'Ethan', text: '"NO — VICTOR!"',
    action: 'stinger',
    next: 'loop_reset_1'
  },

  // ─────────── LOOP RESET ───────────
  'loop_reset_1': {
    bg: 'black', speaker: '', text: '',
    action: 'fade_black',
    next: 'loop_alarm_1'
  },
  'loop_alarm_1': {
    bg: 'bedroom', speaker: '', text: '',
    action: 'alarm',
    next: 'loop_ethan_gasp'
  },
  'loop_ethan_gasp': {
    bg: 'bedroom', speaker: 'Ethan', text: '"…What?"',
    action: 'heartbeat',
    next: 'loop_message_2'
  },
  'loop_message_2': {
    bg: 'bedroom', speaker: 'Miranda (SMS)', text: '"Night shift again tonight. Food\'s in the kitchen. Kids are upstairs. Love you."',
    next: 'act2_start'
  },

  // ─────────── ACT 2 - LOOP BEGINS ───────────
  'act2_start': {
    bg: 'kitchen', speaker: 'Ethan', text: '"I\'ve done this before… this is the same night. I\'m reliving it."',
    next: 'act2_choice_hub'
  },
  'act2_choice_hub': {
    bg: 'hallway_lit', speaker: 'OBJECTIVE', text: 'You know what\'s coming. Choose your approach to save Victor.',
    choices: [
      { label: 'Go upstairs to protect Victor', next: 'branch1_intro' },
      { label: 'Investigate Emily\'s room', next: 'branch2_emily_intro', locked: 'loop2' },
      { label: 'Quick — skip to fuse box (skip tasks)', next: 'act1_backyard_fast' }
    ]
  },

  // ─────────── BRANCH 1 ── PROTECTING VICTOR ───────────
  'branch1_intro': {
    bg: 'victor_room', speaker: 'Ethan', text: '"Victor, listen carefully. Stay close tonight. Don\'t leave my side."',
    choices: [
      { label: 'A: Keep Victor with you all night', next: 'b1_keepclose' },
      { label: 'B: Lock Victor in his room', next: 'b1_lock' },
      { label: 'C: Tell Victor to hide under the bed', next: 'b1_hide' }
    ]
  },

  // OPTION A
  'b1_keepclose': {
    bg: 'living_room', speaker: '(Narrator)', text: 'Victor stays by Ethan\'s side. When the lights cut out, Ethan faces a second choice.',
    action: 'power_off',
    choices: [
      { label: 'Take Victor outside to fix the fuse', next: 'b1_a_outside' },
      { label: 'Leave Victor near the front door', next: 'b1_a_frontdoor' }
    ]
  },
  'b1_a_outside': {
    bg: 'backyard_rain', speaker: '(Narrator)', text: 'Lightning flashes. Ethan turns — Victor is gone.',
    action: 'lightning',
    next: 'b1_a_outside_dead'
  },
  'b1_a_outside_dead': {
    bg: 'backyard_rain', speaker: 'Ethan', text: '"VICTOR?!" — Victor found dead in the backyard. Neck snapped.',
    action: 'stinger',
    next: 'loop_reset_2'
  },
  'b1_a_frontdoor': {
    bg: 'hallway_dark', speaker: '(Narrator)', text: 'Ethan returns inside. Victor dead at the front door. A knife in his chest.',
    action: 'stinger',
    next: 'loop_reset_2'
  },

  // OPTION B
  'b1_lock': {
    bg: 'victor_room', speaker: '(Narrator)', text: 'Victor is locked inside his room. The lights cut out.',
    action: 'power_off',
    choices: [
      { label: 'Stay outside guarding the door', next: 'b1_b_guard' },
      { label: 'Leave briefly to fix the fuse', next: 'b1_b_leave' }
    ]
  },
  'b1_b_guard': {
    bg: 'hallway_dark', speaker: '(Narrator)', text: 'The lights flicker. A scream from inside. The window is open — Emily is gone.',
    action: 'scream',
    next: 'b1_b_guard_dead'
  },
  'b1_b_guard_dead': {
    bg: 'victor_room', speaker: 'Ethan', text: '"How?! The door was locked the whole time…"',
    action: 'stinger',
    next: 'loop_reset_2'
  },
  'b1_b_leave': {
    bg: 'fusebox', speaker: '(Narrator)', text: 'Ethan returns. Victor dead. Emily smiles in the corner.',
    action: 'stinger',
    next: 'loop_reset_2'
  },

  // OPTION C
  'b1_hide': {
    bg: 'victor_room', speaker: 'Ethan', text: '"Victor — hide under the bed. Don\'t come out no matter what."',
    choices: [
      { label: 'Hide under the bed with Victor', next: 'b1_c_together' },
      { label: 'Leave Victor and go fix the fuse', next: 'b1_c_alone' }
    ]
  },
  'b1_c_together': {
    bg: 'victor_room', speaker: '(Narrator)', text: 'Emily appears at the door, smiling. Electricity sparks. Fire erupts downstairs.',
    action: 'stinger',
    next: 'b1_c_fire_dead'
  },
  'b1_c_fire_dead': {
    bg: 'upstairs_blood', speaker: 'Ethan', text: '"VICTOR! The fire — I can\'t reach him!"',
    action: 'stinger',
    next: 'loop_reset_2'
  },
  'b1_c_alone': {
    bg: 'victor_room', speaker: '(Narrator)', text: 'Emily finds Victor. When Ethan returns, it\'s too late.',
    action: 'stinger',
    next: 'loop_reset_2'
  },

  // ─────────── BRANCH 2 ── INVESTIGATE EMILY ───────────
  'branch2_emily_intro': {
    bg: 'hallway_lit', speaker: 'OBJECTIVE', text: 'Something about Emily isn\'t right. You need to find out more.',
    choices: [
      { label: 'Confront Emily directly', next: 'b2_confront' },
      { label: 'Search Emily\'s room for clues', next: 'b2_search' }
    ]
  },
  'b2_confront': {
    bg: 'emily_room', speaker: 'Ethan', text: '"Emily… did you hurt Victor?"',
    next: 'b2_confront_reply'
  },
  'b2_confront_reply': {
    bg: 'emily_room', speaker: 'Emily', text: '"Why would you say that?" *creepy smile*',
    next: 'b2_confront_fail'
  },
  'b2_confront_fail': {
    bg: 'upstairs_blood', speaker: '(Narrator)', text: 'No evidence. Victor dies elsewhere in the night.',
    action: 'stinger',
    next: 'loop_reset_2'
  },
  'b2_search': {
    bg: 'emily_room', speaker: '(Narrator)', text: 'Ethan finds: violent drawings... a dead bird in a box... and a diary.',
    next: 'b2_diary'
  },
  'b2_diary': {
    bg: 'diary', speaker: 'Emily\'s Diary', text: '"They always loved him more. He took my place. He has to go."',
    action: 'heartbeat',
    next: 'flashback_trigger'
  },

  // ─────────── FLASHBACK ───────────
  'flashback_trigger': {
    bg: 'white_flash', speaker: '(Narrator)', text: '— FLASHBACK —',
    action: 'flash',
    next: 'flashback_orphanage'
  },
  'flashback_orphanage': {
    bg: 'orphanage_warm', speaker: 'Warden', text: '"We\'re grateful you\'re considering adoption. Emily is… special."',
    next: 'flashback_miranda'
  },
  'flashback_miranda': {
    bg: 'orphanage_warm', speaker: 'Miranda', text: '"What happened to her?"',
    next: 'flashback_warden2'
  },
  'flashback_warden2': {
    bg: 'orphanage_warm', speaker: 'Warden', text: '"She was transferred from Blackwood Orphanage. There was… an incident."',
    next: 'flashback_ethan'
  },
  'flashback_ethan': {
    bg: 'orphanage_warm', speaker: 'Ethan', text: '"What kind of incident?"',
    next: 'flashback_reveal'
  },
  'flashback_reveal': {
    bg: 'orphanage_warm', speaker: 'Warden', text: '"Five children were murdered. Emily was the only survivor."',
    action: 'stinger_soft',
    next: 'flashback_emily_appears'
  },
  'flashback_emily_appears': {
    bg: 'orphanage_emily', speaker: 'Warden', text: '"Authorities believe one of the children did it. But no one knows who." *Emily watches from the hallway, expressionless.*',
    next: 'flashback_end'
  },
  'flashback_end': {
    bg: 'white_flash', speaker: '(Narrator)', text: '— BACK TO PRESENT —',
    action: 'flash',
    next: 'act3_discovery'
  },

  // ─────────── ACT 3 ── DISCOVERY ───────────
  'act3_discovery': {
    bg: 'basement', speaker: 'OBJECTIVE', text: 'Find proof. Search the storage and basement.',
    next: 'act3_newspaper'
  },
  'act3_newspaper': {
    bg: 'basement', speaker: '(Narrator)', text: 'Hidden behind old boxes — a newspaper. Headline: BLACKWOOD ORPHANAGE MURDERS UNSOLVED.',
    next: 'act3_police_note'
  },
  'act3_police_note': {
    bg: 'newspaper', speaker: 'Police Note (scribbled)', text: '"Primary suspect too young for prosecution."',
    next: 'act3_ethan_realization'
  },
  'act3_ethan_realization': {
    bg: 'basement', speaker: 'Ethan', text: '"It was her… it was Emily all along."',
    action: 'heartbeat',
    next: 'final_loop_start'
  },

  // ─────────── FINAL LOOP ───────────
  'final_loop_start': {
    bg: 'bedroom', speaker: 'FINAL OBJECTIVE', text: 'SAVE VICTOR. STOP EMILY. You know the truth now.',
    action: 'alarm',
    next: 'final_sequence'
  },
  'final_sequence': {
    bg: 'kitchen', speaker: '(Narrator)', text: 'Ethan searches Emily\'s room, grabs a kitchen knife, keeps Victor close, and waits…',
    next: 'final_confront'
  },
  'final_confront': {
    bg: 'hallway_dark', speaker: '(Narrator)', text: 'The lights go out. Emily emerges from the shadows — heading for Victor.',
    action: 'power_off',
    next: 'final_fight'
  },
  'final_fight': {
    bg: 'hallway_dark', speaker: 'Emily', text: '"He ruined everything. You were supposed to love ME more."',
    action: 'stinger',
    next: 'final_qte'
  },
  'final_qte': {
    bg: 'hallway_dark', speaker: '', text: '',
    minigame: 'qte',
    qte_pass: 'ending_good',
    qte_fail_choices: [
      { label: 'Kill Emily to end it', next: 'ending_dark' },
      { label: 'Try to restrain her', next: 'ending_fail_fight' }
    ]
  },

  // ─────────── ENDINGS ───────────
  'ending_good': {
    bg: 'living_rom_dawn', speaker: '(Narrator)', text: 'Ethan overpowers Emily. Police arrive. Victor is safe.',
    next: 'ending_good_2'
  },
  'ending_good_2': {
    bg: 'police_outside', speaker: 'Emily', text: '*smiles while entering police car* "I\'ll come back…"',
    next: 'ending_good_credits'
  },
  'ending_good_credits': {
    bg: 'ending_good_bg', speaker: 'END', text: '★ GOOD ENDING ★\n\nVictor Saved. Emily Arrested.',
    action: 'credits',
    next: 'game_over'
  },

  'ending_dark': {
    bg: 'hallway_dark', speaker: '(Narrator)', text: 'Ethan makes a choice no parent should have to make.',
    next: 'ending_dark_2'
  },
  'ending_dark_2': {
    bg: 'police_outside', speaker: '(Narrator)', text: 'Police arrive. Victor survives. But when Victor looks at Ethan — there is only fear.',
    next: 'ending_dark_credits'
  },
  'ending_dark_credits': {
    bg: 'ending_dark_bg', speaker: 'END', text: '★ DARK ENDING ★\n\nVictor Survives. But at what cost?',
    action: 'credits',
    next: 'game_over'
  },

  'ending_fail_fight': {
    bg: 'upstairs_blood', speaker: '(Narrator)', text: 'Emily overpowers Ethan. Victor screams. The loop ends — permanently.',
    action: 'scream',
    next: 'ending_fail_credits'
  },
  'ending_fail_credits': {
    bg: 'black', speaker: 'END', text: '★ ENDING 1 — FAIL ★\n\nVictor is gone.',
    action: 'fade_black',
    next: 'game_over'
  },

  'ending_worst': {
    bg: 'black', speaker: '(Narrator)', text: 'Emily kills Ethan. She turns toward Victor. The screen fades.',
    action: 'stinger',
    next: 'ending_worst_2'
  },
  'ending_worst_2': {
    bg: 'black', speaker: '', text: '',
    action: 'scream',
    next: 'ending_worst_credits'
  },
  'ending_worst_credits': {
    bg: 'black', speaker: 'END', text: '★ WORST ENDING ★\n\nNobody survived.',
    next: 'game_over'
  },

  'game_over': {
    bg: 'black', speaker: '', text: '',
    action: 'game_over'
  },

  // Fast-path skips for looped chores
  'act1_backyard_fast': {
    bg: 'backyard_rain', speaker: '(Narrator)', text: 'Ethan rushes to the fuse box, skipping chores.',
    next: 'act1_fuse_burned'
  },

  // Loop reset 2 (after failing with knowledge)
  'loop_reset_2': {
    bg: 'black', speaker: '', text: '',
    action: 'fade_black',
    next: 'loop_alarm_2'
  },
  'loop_alarm_2': {
    bg: 'bedroom', speaker: '', text: '',
    action: 'alarm',
    next: 'loop_ethan_gasp2'
  },
  'loop_ethan_gasp2': {
    bg: 'bedroom', speaker: 'Ethan', text: '"Again. I\'m back again. I have to try harder — I have to find out WHY."',
    action: 'heartbeat',
    next: 'act2_choice_hub',
    unlocks: 'loop2'
  }
};
