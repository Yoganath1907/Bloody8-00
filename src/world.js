// world.js - Room connectivity and interactables
export const SharedState = {
  activeRoom: 'bedroom',
  questStage: 'prologue',
  loopCount: 1,
  victorFollows: false
};

export function setRoom(roomId) {
  if (ROOMS[roomId]) {
    SharedState.activeRoom = roomId;
  }
}

export const ROOMS = {
  'bedroom': {
    bg: 'bedroom',
    bounds: { left: 40, right: 760, top: 400, bottom: 580 },
    portals: [
      { x: 400, w: 80, hitY: 580, label: '[E] Leave Room', dest: 'upstairs_hall', destName: 'Hallway', destX: 400 }
    ],
    interactables: []
  },
  'kitchen': {
    bg: 'kitchen',
    bounds: { left: 40, right: 760, top: 400, bottom: 580 },
    portals: [
      { x: 40, w: 30, hitY: 480, dest: 'hallway_lit', destName: 'Hallway', destX: 700 }
    ],
    interactables: [
      { id: 'sink', x: 300, y: 380, w: 140, h: 50, label: '[E] Wash Dishes', reqGoal: 'chores1', interact: 'start_dishes' }
    ]
  },
  
  'living_room': {
    bg: 'living_room',
    bounds: { left: 100, right: 760, top: 430, bottom: 580 },
    portals: [
      { x: 100, w: 30, hitY: 500, dest: 'hallway_lit', destName: 'Hallway', destX: 600 }
    ],
    interactables: [
      { id: 'sofa', x: 200, y: 440, w: 380, h: 40, label: '[E] Sit on Sofa', reqGoal: 'chores2', interact: 'sit_sofa' }
    ]
  },

  'tv_room': {
    bg: 'tv_room',
    bounds: { left: 100, right: 760, top: 430, bottom: 580 },
    portals: [],
    interactables: []
  },
  
  'hallway_lit': {
    bg: 'hallway_lit',
    bounds: { left: 40, right: 760, top: 450, bottom: 580 },
    portals: [
      { x: 40, w: 40, hitY: 500, dest: 'staircase', destName: 'Stairs', destX: 700 }, // stairs go up/left
      { x: 740, w: 40, hitY: 500, dest: 'kitchen', destName: 'Kitchen', destX: 60 },
      { x: 600, w: 60, hitY: 450, isDoor: true, dest: 'living_room', destName: 'Living Room', destX: 120 }
    ],
    interactables: [
      { id: 'front_door', x: 310, y: 420, w: 180, h: 40, label: 'Locked.', interact: 'msg_locked' }
    ]
  },

  'living_dark': {
    bg: 'living_dark',
    bounds: { left: 100, right: 760, top: 430, bottom: 580 },
    portals: [
      { x: 100, w: 30, hitY: 500, dest: 'hallway_dark', destName: 'Hallway', destX: 600 }
    ],
    interactables: []
  },

  'hallway_dark': {
    bg: 'hallway_dark',
    bounds: { left: 40, right: 760, top: 450, bottom: 580 },
    portals: [
      { x: 40, w: 40, hitY: 500, dest: 'staircase', destName: 'Stairs', destX: 700 },
      { x: 600, w: 60, hitY: 450, isDoor: true, dest: 'living_dark', destName: 'Living Room', destX: 120 },
      { x: 740, w: 40, hitY: 500, dest: 'kitchen', destName: 'Kitchen', destX: 60 },
      { x: 310, w: 180, hitY: 450, isDoor: true, label: '[E] Outside', bgm: 'rain', dest: 'backyard_rain', destName: 'Backyard', destX: 400 }
    ],
    interactables: []
  },

  'backyard_rain': {
    bg: 'backyard_rain',
    bounds: { left: 20, right: 780, top: 380, bottom: 580 },
    portals: [
      { x: 400, w: 80, hitY: 400, isDoor: true, label: '[E] Inside', dest: 'hallway_dark', destName: 'Hallway', destX: 400 },
      { x: 760, w: 30, hitY: 480, dest: 'fusebox', destName: 'Fusebox', destX: 60 }
    ],
    interactables: []
  },

  'fusebox': {
    bg: 'fusebox',
    bounds: { left: 40, right: 760, top: 420, bottom: 580 },
    portals: [
      { x: 40, w: 30, hitY: 500, dest: 'backyard_rain', destName: 'Backyard', destX: 700 }
    ],
    interactables: [
      { id: 'fusebox_panel', x: 290, y: 420, w: 220, h: 40, label: '[E] Fusebox', interact: 'use_fusebox' }
    ]
  },

  'storage_room': {
    bg: 'storage_room',
    bounds: { left: 40, right: 760, top: 450, bottom: 580 },
    portals: [
      { x: 740, w: 20, hitY: 500, dest: 'staircase', destX: 100 }
    ],
    interactables: [
      { id: 'supplies', x: 100, y: 450, w: 300, h: 40, label: '[E] Search', reqGoal: 'get_fuse', interact: 'find_fuse' }
    ]
  },

  'staircase': {
    bg: 'staircase',
    bounds: { left: 40, right: 760, top: 450, bottom: 580 },
    portals: [
      { x: 740, w: 40, hitY: 500, label: '[E] Down to Hall', dest: 'hallway_dark', destName: 'Hallway', destX: 80 }, 
      { x: 40, w: 40, hitY: 500, label: '[E] Storage Room', dest: 'storage_room', destName: 'Storage', destX: 700 },
      { x: 400, w: 60, hitY: 450, isDoor: true, label: '[E] Upstairs', dest: 'upstairs_hall', destName: 'Upstairs', destX: 400 }
    ],
    interactables: []
  },

  'upstairs_hall': {
    bg: 'hallway_lit',
    bounds: { left: 40, right: 760, top: 450, bottom: 580 },
    portals: [
      { x: 400, w: 60, hitY: 580, label: '[E] Downstairs', dest: 'staircase', destName: 'Stairs', destX: 400 },
      { x: 100, w: 80, hitY: 450, isDoor: true, label: '[E] Emily\'s Room', dest: 'emily_room', destName: 'Emily', destX: 400 },
      { x: 550, w: 80, hitY: 450, isDoor: true, label: '[E] Victor\'s Room', dest: 'victor_room', destName: 'Victor', destX: 400 },
      { x: 720, w: 60, hitY: 450, isDoor: true, label: '[E] Bedroom', dest: 'bedroom', destName: 'Bedroom', destX: 400 }
    ],
    interactables: []
  },

  'victor_room': {
    bg: 'victor_room',
    bounds: { left: 40, right: 760, top: 450, bottom: 580 },
    portals: [
      { x: 400, w: 80, hitY: 580, label: '[E] Leave Room', dest: 'upstairs_hall', destX: 550 }
    ],
    npcs: [
      { id: 'victor', x: 200, y: 480 }
    ],
    interactables: [
      { id: 'victor_npc', x: 200, y: 480, w: 60, h: 40, label: '[E] Talk to Victor', reqGoal:'talk_victor', interact: 'talk_victor' }
    ]
  },

  'emily_room': {
    bg: 'emily_room',
    bounds: { left: 40, right: 760, top: 450, bottom: 580 },
    portals: [
      { x: 400, w: 80, hitY: 580, label: '[E] Leave Room', dest: 'upstairs_hall', destX: 150 }
    ],
    npcs: [
      { id: 'emily', x: 300, y: 480 }
    ],
    interactables: [
      { id: 'emily_npc', x: 300, y: 480, w: 60, h: 40, label: '[E] Confront Emily', reqGoal:'confront_emily', interact: 'confront_emily' },
      { id: 'diary', x: 150, y: 460, w: 100, h: 40, label: '[E] Read Diary', reqGoal:'search_emily', interact: 'read_diary' }
    ]
  },

  'black': {
     bg: 'black',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'closet_dark': {
     bg: 'closet_dark',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'closet_found': {
     bg: 'closet_found',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'fight_scene': {
     bg: 'fight_scene',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'police_outside': {
     bg: 'police_outside',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'ending_good_bg': {
     bg: 'ending_good_bg',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'ending_dark_bg': {
     bg: 'ending_dark_bg',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'upstairs_blood': {
     bg: 'upstairs_blood',
     bounds: { left: 0, right: 800, top: 0, bottom: 600 },
     portals: [],
     interactables: []
  },

  'orphanage_warm': {
     bg: 'orphanage_warm',
     bounds: { left: 100, right: 700, top: 400, bottom: 580 },
     portals: [],
     interactables: [],
     npcs: [
       { id: 'warden', x: 500, y: 550 },
       { id: 'miranda', x: 260, y: 560 }
     ]
  },
  
  'orphanage_emily': {
     bg: 'orphanage_emily',
     bounds: { left: 100, right: 700, top: 400, bottom: 580 },
     portals: [],
     interactables: [],
     npcs: [
       { id: 'warden', x: 500, y: 550 },
       { id: 'miranda', x: 260, y: 560 },
       { id: 'emily', x: 400, y: 440 } // Emily far away down the hall
     ]
  }

};
