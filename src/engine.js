// engine.js - Game State & Interaction logic
import { player, updatePlayer, drawPlayer } from './player.js';
import { drawCharacter } from './characters.js';
import { ROOMS, SharedState, setRoom } from './world.js';
import { Keys, JustPressed, clearJustPressed, initInput } from './input.js';
import { drawBackground } from './backgrounds.js';
import {
  playPowerOff, playPowerOn, playScream, playStinger,
  startRain, stopRain, playThunder, playLightning, startHeartbeat, stopHeartbeat,
  playAlarm, playFootstep
} from './audio.js';
import { showDialogue, showChoices, qteEl, minigameEl, injectQTEStyle, setDarkVignetteLevel } from './ui.js';
import { initMic, getVolume, stopMic } from './mic.js';
import { startDishGame, startQTE, startFuseGame } from './minigame.js';
import { discoverClue } from './journal.js';
import { showTitleCard } from './titlecard.js';
import { applyCRT_Noise, drawFloatingDust } from './fx.js';

window.undoLastChoice = () => {
    if (lastEndingChoiceState) {
        SharedState.questStage = lastEndingChoiceState.stage;
        setRoom(lastEndingChoiceState.room);
        player.x = lastEndingChoiceState.x;
        player.y = lastEndingChoiceState.y;
        player.locked = false;
        fadeAlpha = 0;
        document.getElementById('loading').classList.add('hidden');
        showDialogue('SYSTEM', 'Returning to your last major decision...');
    }
};

let fadeAlpha = 0;
let fader = null;

let hidingStartTime = 0;
let soundDetected = false;
let lastEndingChoiceState = null; // Store for restart end logic

export function restartGame() {
  SharedState.loopCount = 1;
  SharedState.questStage = 'prologue';
  setRoom('bedroom');
  player.x = 400; player.y = 420; player.locked = true;
  startRain();
  
  // Cutscene
  showTitleCard('PROLOGUE', '8:00 PM');
  setTimeout(() => {
     playAlarm();
     showDialogue('(Narrator)', 'Ethan wakes up suddenly.', () => {
        showDialogue('Ethan (Protagonist)', '"Another night shift... Let me check my phone."', () => {
           showDialogue('Miranda (Wife - SMS)', '"Night shift again tonight. Food\'s in the kitchen. Victor (your son) and Emily (your adopted daughter) are upstairs. Love you."', () => {
              showDialogue('OBJECTIVE', 'Finish household chores. Go downstairs to the kitchen.', () => {
                 player.locked = false;
                 SharedState.questStage = 'act1_chores';
              });
           });
        });
     });
  }, 2000);
}

export function handleInteraction(id) {
  if (player.locked) return;
  
  if (id === 'start_dishes') {
    if (SharedState.loopCount > 1 && SharedState.questStage === 'act1_chores') {
      player.locked = true;
      showDialogue('Ethan', '"The dishes are dirty again... but wait. I did this already. I need to figure out what\'s going on."', () => {
        player.locked = false;
        SharedState.questStage = 'act1_sofa';
        showDialogue('OBJECTIVE', 'Skip the dishes. Try sitting on the sofa to wait for the power outage.');
      });
      return;
    }
    
    if (SharedState.questStage !== 'act1_chores') {
      showDialogue('Ethan', 'Already did these.');
      return;
    }
    player.locked = true;
    showDialogue('Ethan', '"Miranda left a mountain of dishes... Better get to it."', () => {
      showDialogue('(Narrator)', 'Ethan rolls up his sleeves and turns on the faucet.', () => {
        startDishGame(minigameEl, () => {
          showDialogue('Ethan', '"Finally done. My hands are pruney..."', () => {
            showDialogue('Ethan', '"Miranda said to relax after chores. The sofa sounds nice."', () => {
              player.locked = false;
              SharedState.questStage = 'act1_sofa';
              showDialogue('OBJECTIVE', 'Dishes done! Go sit on the sofa in the living room.');
            });
          });
        });
      });
    });
  }
  
  else if (id === 'sit_sofa') {
    if (SharedState.loopCount > 1 && SharedState.questStage === 'act1_sofa') {
      player.locked = true;
      showDialogue('Ethan', '"If I sit here... the news report plays. Then the power goes out. Let\'s see if it happens again."', () => {
        setRoom('tv_room');
        showDialogue('News Anchor', '"...15th anniversary of the Blackwood Orphanage incident passes with still no arrests—"', () => {
          playPowerOff();
          setDarkVignetteLevel(0.9);
          setRoom('living_dark');
          const gc = document.getElementById('game-container');
          if (gc) { gc.classList.add('shake'); setTimeout(() => gc.classList.remove('shake'), 500); }
          showDialogue('Ethan', '"Right on cue... The fusebox out back blew. I need to get the spare fuse from storage room again."', () => {
            player.locked = false;
            SharedState.questStage = 'act1_get_fuse'; // Skip fusebox inspect in loop 2
            showDialogue('OBJECTIVE', 'Grab the spare fuse from the storage room.');
          });
        });
      });
      return;
    }

    if (SharedState.questStage === 'act1_chores') {
      showDialogue('Ethan', '"I should finish the dishes first. Miranda will kill me."');
      return;
    }
    if (SharedState.questStage !== 'act1_sofa') {
      showDialogue('Ethan', 'No time to relax now.');
      return;
    }
    
    if (SharedState.victorFollows && SharedState.activeRoom === 'living_room') {
       player.locked = true;
       showDialogue('Ethan', '"Let\'s just sit here for a second, Victor. Everything will be fine."', () => {
          setRoom('tv_room');
          setTimeout(() => {
             playPowerOff();
             setDarkVignetteLevel(0.9);
             setRoom('living_dark');
             showDialogue('Ethan', '"The power... stay here, Victor."', () => {
                showChoices([
                    { text: "Ask him to stay in the living room and go for the fuse", callback: () => {
                        SharedState.questStage = 'victor_staying_living';
                        SharedState.victorFollows = false;
                        player.locked = false;
                        showDialogue('OBJECTIVE', 'Go to the storage room for a fuse.');
                    }},
                    { text: "Ask Victor to come with you to change the fuse", callback: () => {
                        SharedState.questStage = 'victor_coming_fuse';
                        player.locked = false;
                        showDialogue('OBJECTIVE', 'Take Victor to the backyard to fix the fuse.');
                    }}
                ]);
             });
          }, 2000);
       });
       return;
    }

    player.locked = true;
    showDialogue('(Narrator)', 'Ethan sinks into the worn leather sofa. The cushions creak softly.', () => {
      setRoom('tv_room');
      showDialogue('Ethan', '"Let\'s see what\'s on..."', () => {
        showDialogue('News Anchor', '"...authorities are advising residents to stay indoors. Heavy rainfall and possible thunderstorms expected through midnight..."', () => {
          showDialogue('Ethan', '"Great. Another storm."', () => {
            showDialogue('News Anchor', '"In other news, the 15th anniversary of the Blackwood Orphanage incident passes with still no arrests—"', () => {
              // POWER OUTAGE
              playPowerOff();
              setDarkVignetteLevel(0.9);
              setRoom('living_dark');
              // Screen shake
              const gc = document.getElementById('game-container');
              if (gc) { gc.classList.add('shake'); setTimeout(() => gc.classList.remove('shake'), 500); }
              showDialogue('(Narrator)', '— CLICK. Total darkness.', () => {
                if (SharedState.questStage === 'victor_locked') {
                    showDialogue('Ethan', '"Victor is locked in his room. It should be safe. But I need to choose..."', () => {
                        showChoices([
                           { text: "Guard the door even in the dark (a1)", callback: () => {
                               player.locked = true;
                               setTimeout(() => {
                                   playScream();
                                   showDialogue('Narrator', 'Ethan stood by the door, breathing hard. Then, a wet, tearing sound from inside... and a small gasp.', () => {
                                       doLoopReset();
                                   });
                               }, 4000);
                           }},
                           { text: "Go to change the fuse (a2)", callback: () => {
                               player.locked = false;
                               SharedState.questStage = 'victor_locked_changing_fuse';
                               showDialogue('OBJECTIVE', 'Get a fuse and fix the power ASAP!');
                           }}
                        ]);
                    });
                } else {
                    showDialogue('Ethan', '"..."', () => {
                      showDialogue('Ethan', '"The power\'s out. Again. The fusebox is in the backyard."', () => {
                        showDialogue('Ethan', '"I\'ll need to go through the hallway and out the front door..."', () => {
                          player.locked = false;
                          SharedState.questStage = 'act1_fuse';
                          showDialogue('OBJECTIVE', 'Find the fusebox in the backyard and fix the power.');
                        });
                      });
                    });
                }
              });
            });
          });
        });
      });
    });
  }
  
  else if (id === 'msg_locked') {
    showDialogue('Ethan', 'The front door is locked for the night. I need to use it to get to the backyard.');
  }

  else if (id === 'use_fusebox') {
    if (SharedState.questStage === 'act1_fuse') {
      // First visit: inspect
      player.locked = true;
      showDialogue('(Narrator)', 'Ethan shines his flashlight over the fusebox. One fuse is visibly burnt.', () => {
        showDialogue('Ethan', '"There — that one\'s completely fried. I think we have spares in the storage room."', () => {
          player.locked = false;
          SharedState.questStage = 'act1_get_fuse';
          showDialogue('OBJECTIVE', 'Find a replacement fuse in the storage room inside the house.');
        });
      });
    } else if (SharedState.questStage === 'act1_repair' || SharedState.questStage === 'victor_locked_changing_fuse' || SharedState.questStage === 'victor_coming_fuse') {
      // Second visit: repair
      player.locked = true;
      showDialogue('(Narrator)', 'Ethan carefully slots the new fuse into place and flips the breaker.', () => {
        showDialogue('Ethan', '"Come on... come on..."', () => {
          playPowerOn();
          setDarkVignetteLevel(0.5);
          showDialogue('(Narrator)', 'The house hums back to life. Lights flicker on one by one.', () => {
            if (SharedState.questStage === 'victor_coming_fuse') {
                showDialogue('Ethan', '"Wait, Victor? You were just here!"', () => {
                    playScream();
                    doLoopReset();
                });
                return;
            }
            if (SharedState.questStage === 'victor_locked_changing_fuse') {
                showDialogue('Ethan', '"There we go. Finally—"', () => {
                   playScream();
                   showDialogue('Narrator', 'Victor\'s scream echoes through the house... He is dead.', () => {
                       doLoopReset();
                   });
                });
                return;
            }
            showDialogue('Ethan', '"There we go. Finally—"', () => {
              // THE SCREAM
              playScream();
              const gc = document.getElementById('game-container');
              if (gc) { gc.classList.add('shake'); setTimeout(() => gc.classList.remove('shake'), 600); }
              showDialogue('???', '*A piercing scream from upstairs!*', () => {
                showDialogue('Ethan', '"VICTOR?! EMILY?!"', () => {
                  startHeartbeat();
                  player.locked = false;
                  SharedState.questStage = 'act1_scream';
                  showDialogue('OBJECTIVE', 'RUSH UPSTAIRS TO VICTOR\'S ROOM! NOW!');
                });
              });
            });
          });
        });
      });
    } else if (SharedState.questStage === 'act1_get_fuse') {
      showDialogue('Ethan', '"I need to find a replacement fuse first. The storage room should have one."');
    } else {
      showDialogue('Ethan', '"Fusebox looks fine now."');
    }
  }

  else if (id === 'find_fuse') {
    if (SharedState.questStage === 'victor_staying_living') {
        player.locked = true;
        showDialogue('Ethan', '"Got the fuse. Now to—"', () => {
            playScream();
            showDialogue('Ethan', '"NO! VICTOR!"', () => {
               doLoopReset();
            });
        });
        return;
    }
    if (SharedState.questStage !== 'act1_get_fuse' && SharedState.questStage !== 'victor_locked_changing_fuse' && SharedState.questStage !== 'victor_coming_fuse' && SharedState.questStage !== 'act1_fuse') {
      showDialogue('Ethan', 'Just boxes of old stuff.');
      return;
    }
    player.locked = true;
    showDialogue('(Narrator)', 'Ethan opens the dusty supplies box. It\'s pitch black. He uses his hands to feel around for the fuse...', () => {
      startFuseGame(minigameEl, () => {
        showDialogue('Ethan', '"Got it! A 15-amp fuse. Back to out back to fix the power."', () => {
          player.locked = false;
          if (SharedState.questStage === 'victor_locked_changing_fuse') {
               // still same
          } else {
               SharedState.questStage = 'act1_repair';
          }
          showDialogue('OBJECTIVE', 'Go back to the fusebox in the backyard and repair it.');
        });
      });
    });
  }

  else if (id === 'talk_victor') {
    if (SharedState.questStage === 'act1_scream' && SharedState.loopCount < 3) {
      player.locked = true;
      playStinger();
      showDialogue('Ethan', '"NO — VICTOR!"', () => {
        doLoopReset();
      });
      return;
    }

    if (SharedState.loopCount >= 3 && SharedState.questStage === 'act1_chores') {
       player.locked = true;
       showDialogue('Ethan', '"Victor... I need you to listen to me. Something is happening."', () => {
         showChoices([
           { text: "Lock him in the room for safety (a)", callback: () => {
               showDialogue('Ethan', '"Stay here, Victor. Don\'t open the door for anyone but me."', () => {
                 player.locked = false;
                 SharedState.questStage = 'victor_locked';
               });
           }},
           { text: "Ask him to stay close to you (b)", callback: () => {
               showDialogue('Ethan', '"Victor, stay right behind me. Don\'t let go of my hand."', () => {
                 SharedState.victorFollows = true;
                 player.locked = false;
                 SharedState.questStage = 'act1_sofa';
                 showDialogue('OBJECTIVE', 'Go to the living room with Victor.');
               });
           }}
         ]);
       });
       return;
    }

    if (SharedState.questStage === 'find_victor_loop5') {
       player.locked = true;
       lastEndingChoiceState = { stage: SharedState.questStage, room: SharedState.activeRoom, x: player.x, y: player.y };
       showDialogue('Ethan', '"Victor! I found you. We need to hide."', () => {
         showChoices([
           { text: "Hide in the closet (d1)", callback: () => startHidingEnding() },
           { text: "Fight Emily (d2)", callback: () => startFightEnding() }
         ]);
       });
       return;
    }

    if (SharedState.loopCount === 1) {
       showDialogue('Victor', '"I\'m playing with my toys, Dad."');
    } else {
       showDialogue('Victor', '"You look scared, Dad. Is it a dream?"');
    }
  }

  else if (id === 'confront_emily') {
     // Loop 5 interaction logic is now handled when entering the room.
     showDialogue('Emily', '"Why are you looking at me like that... Dad?"');
  }

  else if (id === 'read_diary') {
    if (SharedState.questStage === 'searching_emily') {
        discoverClue('diary');
        showDialogue('Diary', '"They always loved him more... Victor has to go."', () => {
            showDialogue('Ethan', '"Oh god... Emily? It was her all along? I need to call the police!"', () => {
                showDialogue('Narrator', 'Ethan quickly dials 911 on his cell phone and whispers his address.', () => {
                     SharedState.questStage = 'find_victor_loop5';
                     showDialogue('OBJECTIVE', 'FIND VICTOR! HE IS IN HIS ROOM!');
                });
            });
        });
        return;
    }
    showDialogue('Diary', 'A dusty journal. I shouldn\'t snoop.');
  }
}

function doLoopReset() {
  stopHeartbeat();
  SharedState.victorFollows = false;
  soundDetected = false;
  hidingStartTime = 0;
  stopMic();
  fadeAlpha = 1;
  SharedState.loopCount++;
  setTimeout(() => {
    setRoom('bedroom');
    player.x = 400; player.y = 420;
    fadeAlpha = 0;
    player.locked = true;
    SharedState.questStage = 'act1_chores';
    
    playAlarm();

    if (SharedState.loopCount === 2) {
      showTitleCard('ACT 2', 'BLOODY 8:00', '#aa4444');
      document.getElementById('game-container').classList.add('horror-mode');
      setTimeout(() => {
        showDialogue('Ethan', '"What a horrible dream... Victor screaming, the power going out..."', () => {
          showDialogue('Ethan', '"Wait. The alarm clock says 8:00 PM. That\'s exactly when I woke up before."', () => {
            showDialogue('Ethan', '"And the phone... Miranda\'s text. The same text. Word for word."', () => {
              showDialogue('Ethan', '"No. No, this can\'t be real. This already happened. I already lived through this night."', () => {
                showDialogue('Ethan', '"Victor died. I heard him scream. I SAW him. But he\'s... upstairs? Alive?"', () => {
                  showDialogue('Ethan', '"Is this some kind of loop? Am I going insane?"', () => {
                    showDialogue('OBJECTIVE', 'Something is very wrong. The night is repeating. Try to change what happens.', () => {
                      player.locked = false;
                    });
                  });
                });
              });
            });
          });
        });
      }, 2500);
    } else if (SharedState.loopCount === 3) {
      showDialogue('Ethan', '"Again. It happened AGAIN. I couldn\'t save him."', () => {
        showDialogue('Ethan', '"I have to do something different this time. I need to get to Victor BEFORE the power goes out."', () => {
          showDialogue('OBJECTIVE', 'Victor\'s room is now accessible. Go to him before it\'s too late.', () => {
            player.locked = false;
          });
        });
      });
    } else if (SharedState.loopCount === 4) {
      showDialogue('Ethan', '"Again. No matter what I try, Victor dies. I\'m trapped."', () => {
        showDialogue('Ethan', '"There has to be something I\'m not seeing. Something about this house... about us."', () => {
          showDialogue('OBJECTIVE', 'Try different choices with Victor. There must be a way.', () => {
            player.locked = false;
          });
        });
      });
    } else if (SharedState.loopCount >= 5) {
      // Visual flashback cutscene THEN the Emily realization
      setRoom('black');
      fadeAlpha = 1;
      setTimeout(() => {
        fadeAlpha = 0;
        showTitleCard('FLASHBACK', '3 YEARS AGO', '#cc8844');
        setTimeout(() => {
          player.locked = true;
          player.x = 100;
          player.facing = 'right';
          setRoom('orphanage_warm');
          showDialogue('(Memory)', 'The Blackwood Orphanage. A cold, grey building at the edge of town.', () => {
            showDialogue('(Memory)', 'Ethan stands with Miranda (his wife) and the stern Orphanage Warden.', () => {
              showDialogue('Miranda (Ethan\'s Wife)', '"Ethan... look at her down the hall. She\'s just sitting there. All alone."', () => {
                showDialogue('Ethan', '"She looks like she hasn\'t spoken to anyone in days."', () => {
                  showDialogue('Orphanage Warden', '"That\'s Emily. She\'s been here since she was four. No one wants to adopt her. They say she\'s... unsettling."', () => {
                    showDialogue('Orphanage Warden', '"She was transferred from another facility. There was an incident. Five children. She was the only survivor."', () => {
                      showDialogue('Miranda (Ethan\'s Wife)', '"We\'ll take her. Every child deserves a family."', () => {
                        setRoom('orphanage_emily');
                        player.x = 240;
                        showDialogue('(Memory)', 'Emily looked up from the shadows. For a moment, her eyes were completely empty. Then she smiled.', () => {
                          showDialogue('(Memory)', 'It was not a warm smile.', () => {
                            fadeAlpha = 1;
                            setTimeout(() => {
                              setRoom('bedroom');
                              player.x = 400; // Restore standard spawn position
                              fadeAlpha = 0;
                              showDialogue('Ethan', '"We thought we were saving her... but what if she was never the one who needed saving?"', () => {
                                showDialogue('Victor', '"Dad... where is Emily? I haven\'t seen her come out of her room all day..."', () => {
                                  showDialogue('Ethan', '"Emily... Of course. I\'ve been so focused on Victor that I never once checked on Emily."', () => {
                                    showDialogue('OBJECTIVE', 'Emily\'s door is now unlocked. Investigate her room.', () => {
                                      player.locked = false;
                                    });
                                  });
                                });
                              });
                            }, 1500);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        }, 2500);
      }, 1500);
    } else {
      showDialogue('Ethan', '"The nightmare continues..."', () => {
        player.locked = false;
      });
    }
  }, 2500);
}

function startHidingEnding() {
  player.locked = true;
  fadeAlpha = 1;
  setTimeout(() => {
    setRoom('closet_dark');
    fadeAlpha = 0;
    showDialogue('(Narrator)', 'Ethan pulls Victor into the bedroom closet. He shuts the door as quietly as he can.', () => {
      showDialogue('Ethan', '*whispering* "Don\'t make a sound, Victor. She\'s coming."', () => {
        showDialogue('Victor', '*whispering* "I\'m scared, Dad..."', () => {
          showDialogue('Ethan', '*whispering* "I know. Me too. Just hold my hand and stay quiet."', () => {
            showDialogue('(Narrator)', 'Footsteps. Slow. Deliberate. Getting closer.', () => {
              showDialogue('(Narrator)', 'The bedroom door creaks open. A shadow falls across the closet.', async () => {
                startHeartbeat();
                const micReady = await initMic();
                hidingStartTime = Date.now();
                SharedState.questStage = 'ending_hiding';
                soundDetected = false;
                showDialogue('⚠ SYSTEM', '🔇 STAY ABSOLUTELY QUIET IN REAL LIFE FOR 20 SECONDS. Your microphone is listening.');
              });
            });
          });
        });
      });
    });
  }, 1000);
}

function startFightEnding() {
  player.locked = true;
  playStinger();
  setRoom('fight_scene');
  const gc = document.getElementById('game-container');
  if (gc) { gc.classList.add('shake'); setTimeout(() => gc.classList.remove('shake'), 600); }
  showDialogue('(Narrator)', 'Emily emerges from the shadows, a kitchen knife glinting in the darkness.', () => {
    showDialogue('Emily', '"You shouldn\'t have found out, Dad."', () => {
      showDialogue('(Narrator)', 'She lunges. Ethan grabs her wrist. They struggle.', () => {
        showDialogue('(Narrator)', 'The knife clatters to the floor. Ethan pins her down. She screams \u2014 an inhuman, piercing wail.', () => {
          showDialogue('Victor', '"DAD! STOP! YOU\'RE HURTING HER!"', () => {
            showDialogue('(Narrator)', 'But Ethan doesn\'t stop. He can\'t. Not after what she\'s done \u2014 what she was going to do.', () => {
              showDialogue('(Narrator)', 'When it\'s over, the house is silent. Victor stares at his father. He will never look at him the same way again.', () => {
                fadeAlpha = 1;
                setTimeout(() => {
                  setRoom('ending_dark_bg');
                  fadeAlpha = 0;
                  showDialogue('ENDING', '\u2605 BAD ENDING: KILLED HER \u2605', () => {
                    showEndScreen('bad');
                  });
                }, 1500);
              });
            });
          });
        });
      });
    });
  });
}

function showEndScreen(type) {
    fadeAlpha = 1;
    setTimeout(() => {
        const overlay = document.getElementById('loading');
        overlay.classList.remove('hidden');
        if (type === 'good') {
            overlay.innerHTML = `
                <div class="end-card" style="background:#000; width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <p style="font-size:1.8rem; margin-bottom: 20px;">★ GOOD ENDING ★</p>
                    <p style="font-size:1.2rem; margin-bottom: 40px; color:#aaa;">"Inspired from real dark events"</p>
                    <button onclick="location.reload()" class="menu-btn">▶ RESTART GAME</button>
                    <br>
                    <button onclick="window.undoLastChoice()" class="last-choice-btn">RETRACT LAST CHOICE</button>
                </div>
            `;
        } else {
            overlay.innerHTML = `
                <div class="end-card" style="background:#000; width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <p style="font-size:1.8rem; margin-bottom: 20px; color:#ff4444;">★ ${type === 'bad' ? 'BAD' : 'WORST'} ENDING ★</p>
                    <button onclick="location.reload()" class="menu-btn">▶ RESTART GAME</button>
                    <br>
                    <button onclick="window.undoLastChoice()" class="last-choice-btn">RETRACT LAST CHOICE</button>
                </div>
            `;
        }
    }, 1000);
}

/* ── Flashlight / Torch Light System ─────────────────────────────── */

function getFlashlightPos() {
  const beamDist = 55;
  let lx = player.x, ly = player.y - 45;
  switch (player.facing) {
    case 'right': lx += beamDist; break;
    case 'left':  lx -= beamDist; break;
    case 'up':    ly -= beamDist; break;
    case 'down':  ly += beamDist * 0.5; break;
  }
  const t = Date.now();
  const flicker = Math.sin(t * 0.006) * 8 + Math.sin(t * 0.017) * 4;
  return { lx, ly, flicker };
}

function drawFlashlightGlow(bgCanvas) {
  const ctx = bgCanvas.getContext('2d');
  const W = bgCanvas.width, H = bgCanvas.height;
  const { lx, ly, flicker } = getFlashlightPos();
  const radius = 160 + flicker;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const grd = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
  grd.addColorStop(0, 'rgba(255,230,170,0.35)');
  grd.addColorStop(0.25, 'rgba(255,210,140,0.18)');
  grd.addColorStop(0.55, 'rgba(200,175,110,0.06)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawFlashlightDarkness(ctx) {
  const W = 800, H = 600;
  const { lx, ly, flicker } = getFlashlightPos();
  const innerR = 35 + flicker * 0.3;
  const outerR = 220 + flicker;
  const grd = ctx.createRadialGradient(lx, ly, innerR, lx, ly, outerR);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(0.35, 'rgba(0,0,0,0.15)');
  grd.addColorStop(0.6, 'rgba(0,0,0,0.5)');
  grd.addColorStop(0.85, 'rgba(0,0,0,0.8)');
  grd.addColorStop(1, 'rgba(0,0,0,0.92)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

function drawPlayerGlow(charCtx) {
  const { flicker } = getFlashlightPos();
  const glowR = 55 + flicker * 0.3;
  const cx = player.x, cy = player.y - 50;
  charCtx.save();
  charCtx.globalCompositeOperation = 'screen';
  const grd = charCtx.createRadialGradient(cx, cy, 5, cx, cy, glowR);
  grd.addColorStop(0, 'rgba(255,240,200,0.18)');
  grd.addColorStop(0.5, 'rgba(255,220,160,0.06)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  charCtx.fillStyle = grd;
  charCtx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
  charCtx.restore();
}

// Draw the UI interaction prompt over the player
export function renderEngine(ctxHUD, charCtx, bgCanvas) {
  const W = 800, H = 600;

  // Clear HUD once per frame at the start
  ctxHUD.clearRect(0,0,800,600);

  updatePlayer();

  if (SharedState.questStage === 'ending_hiding') {
     const vol = getVolume();
     if (vol > 45) soundDetected = true;
     
     const elapsed = (Date.now() - hidingStartTime) / 1000;
     if (soundDetected) {
         SharedState.questStage = 'dead';
         stopHeartbeat();
         playScream();
         setRoom('closet_found');
         const gc = document.getElementById('game-container');
         if (gc) { gc.classList.add('shake'); setTimeout(() => gc.classList.remove('shake'), 600); }
         showDialogue('Emily', '"FOUND YOU."', () => {
            showDialogue('(Narrator)', 'The closet door is ripped open. Emily stands there, silhouetted against the dim light, knife raised.', () => {
              showDialogue('Victor', '"DAAAD!"', () => {
                showDialogue('(Narrator)', 'Two screams echo through the empty house. Then silence. Only the rain remains.', () => {
                  fadeAlpha = 1;
                  setTimeout(() => {
                    setRoom('black');
                    fadeAlpha = 0;
                    showDialogue('ENDING', '\u2605 WORST ENDING: CAUGHT \u2605', () => showEndScreen('worst'));
                  }, 1500);
                });
              });
            });
         });
     } else if (elapsed > 20) {
          SharedState.questStage = 'caught_by_police';
          stopHeartbeat();
          stopMic();
          setRoom('police_outside');
          showDialogue('(Narrator)', 'Red and blue lights flash through the window. Sirens wail outside.', () => {
            showDialogue('Police', '"POLICE! OPEN UP!"', () => {
              showDialogue('(Narrator)', 'The front door crashes open. Boots thunder up the stairs.', () => {
                showDialogue('Police', '"DROP THE KNIFE, EMILY! GET ON THE GROUND! NOW!"', () => {
                  showDialogue('(Narrator)', 'Emily freezes. The knife clatters to the floor. She turns to the closet where Ethan and Victor are hiding.', () => {
                    showDialogue('Emily', '"I will come again..."', () => {
                      showDialogue('(Narrator)', 'She smiles. Not a child\'s smile. Something ancient. Something patient.', () => {
                        showDialogue('(Narrator)', 'As the officers drag her away, she doesn\'t resist. She doesn\'t cry. She just keeps smiling.', () => {
                          fadeAlpha = 1;
                          setTimeout(() => {
                            setRoom('ending_good_bg');
                            fadeAlpha = 0;
                            showDialogue('ENDING', '\u2605 GOOD ENDING: SURVIVED \u2605', () => showEndScreen('good'));
                          }, 1500);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
     }
  }

  // Draw background with parallax shift based on player X
  drawBackground(bgCanvas, ROOMS[SharedState.activeRoom].bg, player.flashlight, player.x);
  if (player.flashlight) drawFlashlightGlow(bgCanvas);

  // Draw characters
  charCtx.clearRect(0,0,800,600);
  drawPlayer(charCtx);
  if (player.flashlight) drawPlayerGlow(charCtx);

  // Crossfade overlay (on HUD)
  if (fadeAlpha > 0) {
    ctxHUD.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctxHUD.fillRect(0,0,800,600);
  }

  // Draw house markers
  const room = ROOMS[SharedState.activeRoom];
  if (!room) return;
  
  let hoverText = null;

  // Draw NPCs / Characters in the room
  if (room.npcs) {
    for (let npc of room.npcs) {
      let isDead = false;
      if (npc.id === 'victor' && SharedState.questStage === 'act1_scream') isDead = true;
      
      let nx = npc.x, ny = npc.y;
      if (npc.id === 'victor' && SharedState.victorFollows && SharedState.activeRoom !== 'victor_room') {
         // Follower logic: stay behind player
         nx = player.x - (player.facing === 'right' ? 50 : -50);
         ny = player.y;
      }
      // Emily shouldn't sit in her room idly; only draw her if we've chosen to confront her directly
      if (npc.id === 'emily' && SharedState.activeRoom === 'emily_room') {
          if (!SharedState.questStage.includes('confront')) {
              continue;
          }
      }
      drawCharacter(charCtx, npc.id, nx, ny, {
        scale: 1,
        facing: player.facing === 'right' ? 'left' : 'right',
        dead: isDead,
        highlight: player.flashlight && Math.abs(player.x - nx) < 150
      });
    }
  }

  // Draw Victor following in ANY room (not just rooms with NPC entries)
  if (SharedState.victorFollows && !room.npcs?.find(n => n.id === 'victor')) {
    const vx = player.x - (player.facing === 'right' ? 50 : -50);
    const vy = player.y;
    drawCharacter(charCtx, 'victor', vx, vy, {
      scale: 1,
      facing: player.facing === 'right' ? 'left' : 'right',
      dead: false,
      highlight: player.flashlight && Math.abs(player.x - vx) < 150
    });
  }

  // Draw Portals permanently to indicate doors
  for (let p of room.portals) {
    const isClose = Math.abs(player.x - (p.x + p.w/2)) < p.w/2 + 40 && Math.abs(player.y - p.hitY) < 140;
    
    // Draw Door Marker
    ctxHUD.fillStyle = isClose ? 'rgba(100,170,255,0.9)' : 'rgba(0,0,0,0.6)';
    ctxHUD.fillRect(p.x + p.w/2 - 40, p.hitY - 80, 80, 24);
    ctxHUD.strokeStyle = isClose ? '#fff' : '#444';
    ctxHUD.lineWidth = 1;
    ctxHUD.strokeRect(p.x + p.w/2 - 40, p.hitY - 80, 80, 24);
    ctxHUD.fillStyle = isClose ? '#000' : '#aaa';
    ctxHUD.font = '10px "Press Start 2P"';
    ctxHUD.textAlign = 'center';
    ctxHUD.fillText(p.label?.replace('[E] ', '') || p.dest, p.x + p.w/2, p.hitY - 64);
    ctxHUD.textAlign = 'left';

    if (isClose) {
      hoverText = p.label || '[E] Enter ' + (p.destName || p.dest);
      if (!player.locked && (JustPressed.e || JustPressed.space || JustPressed.enter)) {
        let routedDest = p.dest;
        
        // Prevent entering kids rooms early (only in Loop 3+ for Victor, Loop 5 for Emily)
        // Exception: always allow entry when Victor has screamed (act1_scream)
        if (routedDest === 'victor_room' && SharedState.loopCount < 3 && SharedState.questStage !== 'act1_scream') {
            player.locked = true;
            showDialogue('Ethan', '"The kids are probably asleep. I shouldn\'t wake them yet."', () => { player.locked = false; });
            break;
        }
        if (routedDest === 'emily_room' && SharedState.loopCount < 5) {
            player.locked = true;
            showDialogue('Ethan', '"The door is jammed tight. Something heavy is blocking it from the other side."', () => { player.locked = false; });
            break;
        }

        // B1: Victor follower failure
        if (SharedState.victorFollows && (routedDest === 'kitchen' || routedDest === 'storage_room' || routedDest === 'bedroom' || routedDest === 'emily_room')) {
            player.locked = true;
            fadeAlpha = 1; // briefly black
            setTimeout(() => {
                fadeAlpha = 0;
                playScream();
                showDialogue('Ethan', '"VICTOR? WHERE DID YOU GO?!"', () => {
                    showDialogue('Narrator', 'The door slammed shut. Victor was locked on the other side. By the time Ethan got it open... he was dead.', () => {
                        doLoopReset();
                    });
                });
            }, 500);
            break;
        }

        if (routedDest === 'backyard_rain' && SharedState.questStage === 'victor_coming_fuse') {
            player.locked = true;
            fadeAlpha = 1;
            setTimeout(() => {
                fadeAlpha = 0;
                playScream();
                showDialogue('Ethan', '"VICTOR?!"', () => {
                    showDialogue('Narrator', 'You step into the rain, but Victor\'s hand slips from yours...', () => {
                        doLoopReset();
                    });
                });
            }, 500);
            break;
        }

        // Fix power state logic from staircase
        if (routedDest === 'hallway_dark' && (SharedState.questStage === 'act1_chores' || SharedState.questStage === 'act1_sofa')) {
            routedDest = 'hallway_lit';
        }

        setRoom(routedDest);
        player.x = p.destX;
        if (p.isDoor) playFootstep();

        // Custom loop events on enter room
        if (routedDest === 'upstairs_hall' && SharedState.questStage === 'victor_locked') {
           player.locked = true;
           showDialogue('Narrator', 'Ethan steps out of the room. Suddenly...', () => {
              playPowerOff();
              setDarkVignetteLevel(0.9);
              showChoices([
                { text: "Guard the room even in dark (a1)", callback: () => {
                    player.locked = true;
                    setTimeout(() => {
                        playScream();
                        showDialogue('Narrator', 'A wet, tearing sound from inside... Victor is dead.', () => {
                             doLoopReset();
                        });
                    }, 4000);
                }},
                { text: "Go to change the fuse (a2)", callback: () => {
                    player.locked = false;
                    SharedState.questStage = 'victor_locked_changing_fuse';
                    showDialogue('OBJECTIVE', 'Get a fuse and fix the power ASAP!');
                }}
              ]);
           });
        } else if (routedDest === 'emily_room' && SharedState.loopCount >= 5 && SharedState.questStage !== 'searching_emily' && SharedState.questStage !== 'find_victor_loop5' && SharedState.questStage !== 'ending_hiding') {
            player.locked = true;
            showDialogue('Ethan', '"Emily? Are you here?"', () => {
                showDialogue('Narrator', 'The room is empty. But something feels wrong.', () => {
                    showChoices([
                        { text: "Ask her directly (c)", callback: () => {
                            showDialogue('Emily', '"Why would you say that?"', () => {
                                playScream();
                                doLoopReset();
                            });
                        }},
                        { text: "Search her room (d)", callback: () => {
                            player.locked = false;
                            SharedState.questStage = 'searching_emily';
                            showDialogue('OBJECTIVE', 'Search Emily\'s room for clues.');
                        }}
                    ]);
                });
            });
        } else if (routedDest === 'living_room' && SharedState.victorFollows) {
            // Auto-trigger: entering living room with Victor triggers the sit-down cutscene
            player.locked = true;
            showDialogue('Ethan', '"Let\'s just sit here for a second, Victor. Everything will be fine."', () => {
               setRoom('tv_room');
               setTimeout(() => {
                  playPowerOff();
                  setDarkVignetteLevel(0.9);
                  setRoom('living_dark');
                  const gc = document.getElementById('game-container');
                  if (gc) { gc.classList.add('shake'); setTimeout(() => gc.classList.remove('shake'), 500); }
                  showDialogue('Ethan', '"The power... Victor, stay close."', () => {
                     showChoices([
                         { text: "Ask him to stay in the living room and go for the fuse", callback: () => {
                             SharedState.questStage = 'victor_staying_living';
                             SharedState.victorFollows = false;
                             player.locked = false;
                             showDialogue('OBJECTIVE', 'Go to the storage room for a fuse.');
                         }},
                         { text: "Ask Victor to come with you to change the fuse", callback: () => {
                             SharedState.questStage = 'victor_coming_fuse';
                             player.locked = false;
                             showDialogue('OBJECTIVE', 'Take Victor to the backyard to fix the fuse.');
                         }}
                     ]);
                  });
               }, 2000);
            });
        }

        break; // resolve
      }
    }
  }

  // Check interactables
  for (let inter of room.interactables) {
    const isClose = player.x > inter.x - 30 && player.x < inter.x + inter.w + 30 && Math.abs(player.y - inter.y) < 120;
    
    // Permanent Object Marker
    ctxHUD.fillStyle = isClose ? 'rgba(100,255,100,0.9)' : 'rgba(0,0,0,0.6)';
    ctxHUD.fillRect(inter.x + inter.w/2 - 40, inter.y - 40, 80, 20);
    ctxHUD.strokeStyle = isClose ? '#fff' : '#444';
    ctxHUD.strokeRect(inter.x + inter.w/2 - 40, inter.y - 40, 80, 20);
    ctxHUD.fillStyle = isClose ? '#000' : '#88aa88';
    ctxHUD.font = '9px "Press Start 2P"';
    ctxHUD.textAlign = 'center';
    ctxHUD.fillText(inter.label?.replace('[E] ', '') || inter.id, inter.x + inter.w/2, inter.y - 26);
    ctxHUD.textAlign = 'left';

    if (isClose) {
      hoverText = inter.label;
      if (JustPressed.e || JustPressed.space || JustPressed.enter) {
        handleInteraction(inter.interact || inter.id);
        break;
      }
    }
  }

  // Flashlight darkness overlay on HUD (covers bg + characters below)
  if (player.flashlight) drawFlashlightDarkness(ctxHUD);

  // Draw loop counter - only show after Ethan fully realizes the nightmare
  if (SharedState.loopCount >= 3) {
    ctxHUD.fillStyle = 'rgba(0,0,0,0.6)';
    ctxHUD.fillRect(630, 10, 162, 36);
    ctxHUD.strokeStyle = SharedState.loopCount >= 3 ? '#ff3333' : '#444';
    ctxHUD.lineWidth = 2;
    ctxHUD.strokeRect(630, 10, 162, 36);
    ctxHUD.font = '14px "Press Start 2P", monospace';
    ctxHUD.fillStyle = SharedState.loopCount >= 3 ? '#ff4444' : '#aaaaaa';
    ctxHUD.fillText('LOOP  ' + SharedState.loopCount, 642, 34);
  }

  // Draw Prompts
  if (hoverText && !player.locked) {
    const boxW = 400;
    const boxH = 44;
    const bx = W/2 - boxW/2;
    const by = 20;

    // Background with slight pulse
    const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 0.8;
    ctxHUD.fillStyle = `rgba(0,0,0,${pulse})`;
    ctxHUD.fillRect(bx, by, boxW, boxH);
    
    // Border
    ctxHUD.strokeStyle = 'rgba(255,255,255,0.4)';
    ctxHUD.lineWidth = 2;
    ctxHUD.strokeRect(bx, by, boxW, boxH);

    // Text
    ctxHUD.fillStyle = '#fff';
    ctxHUD.font = '18px "VT323"';
    ctxHUD.textAlign = 'center';
    ctxHUD.fillText(hoverText, 400, by + 28);
    ctxHUD.textAlign = 'left';
  }

  // Draw Microphone Hiding Meter
  if (SharedState.questStage === 'ending_hiding') {
    const vol = getVolume(); // Max around ~100 in normal voice
    
    const meterW = 20;
    const meterH = 300;
    const meterX = W - meterW - 30;
    const meterY = H / 2 - meterH / 2;
    
    // Base dark background
    ctxHUD.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctxHUD.fillRect(meterX, meterY, meterW, meterH);
    ctxHUD.strokeStyle = '#444';
    ctxHUD.lineWidth = 2;
    ctxHUD.strokeRect(meterX, meterY, meterW, meterH);
    
    // Danger Threshold marker (vol = 45 out of 100 max range visually)
    const dangerThreshold = 45;
    const thresholdY = meterY + meterH - (dangerThreshold / 100) * meterH;
    ctxHUD.strokeStyle = 'red';
    ctxHUD.beginPath();
    ctxHUD.moveTo(meterX - 10, thresholdY);
    ctxHUD.lineTo(meterX + meterW + 10, thresholdY);
    ctxHUD.stroke();

    // The moving volume bar
    ctxHUD.fillStyle = vol > dangerThreshold ? 'red' : 'white';
    // Fill from bottom up
    const fillRatio = Math.min((vol / 100), 1);
    const fillH = fillRatio * meterH;
    ctxHUD.fillRect(meterX, meterY + meterH - fillH, meterW, fillH);

    // Labels
    ctxHUD.fillStyle = '#aaa';
    ctxHUD.font = '12px "VT323"';
    ctxHUD.textAlign = 'right';
    ctxHUD.fillText('MIC', meterX - 15, meterY + 10);
    if (vol > dangerThreshold) {
      ctxHUD.fillStyle = 'red';
      ctxHUD.fillText('!', meterX - 15, meterY + 30);
    }
    ctxHUD.textAlign = 'left';
  }

  clearJustPressed();
  
  // Apply final pass CRT scanlines, noise, and floating dust motes
  if (player.flashlight) {
      drawFloatingDust(ctxHUD, W, H, player.x, player.y - 50);
  }
  applyCRT_Noise(ctxHUD, W, H);
}
