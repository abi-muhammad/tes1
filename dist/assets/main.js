import * as THREE from 'three';

// ============================================================================
// 1. AUDIO MANAGER (Web Audio API Procedural Sound Engine)
// ============================================================================
const STORAGE_MUTE_KEY = 'kpw_audio_muted';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
    this.unlocked = false;
    this.bgmInterval = null;
    this.bgmBeat = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.unlocked = true;
  }

  setMuted(muteState) {
    this.muted = Boolean(muteState);
    try {
      localStorage.setItem(STORAGE_MUTE_KEY, String(this.muted));
    } catch {}
    if (this.muted) {
      this.stopBGM();
    }
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  canPlay() {
    if (this.muted) return false;
    if (!this.ctx) this.initContext();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  playStep(isLeft = true) {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isLeft ? 135 : 155, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.055);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  playJump(superJump = false) {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(superJump ? 760 : 540, now + 0.18);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  playSlide() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.18);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playLaneSwitch() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.07);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playCoin() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.06);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playPowerup() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      gain.gain.setValueAtTime(0.2, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.17);
    });
  }

  playCrash() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.28);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  playSchoolBell() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const melody = [
      { f: 659.25, t: 0.0, d: 0.28 },
      { f: 523.25, t: 0.28, d: 0.28 },
      { f: 587.33, t: 0.56, d: 0.28 },
      { f: 392.0, t: 0.84, d: 0.45 }
    ];
    melody.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.22, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.02);
    });
  }

  playTeacherWhistle() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2650, now);
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(42, now);
    lfoGain.gain.setValueAtTime(180, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    mainGain.gain.setValueAtTime(0.01, now);
    mainGain.gain.linearRampToValueAtTime(0.24, now + 0.03);
    mainGain.gain.setValueAtTime(0.24, now + 0.32);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc.connect(mainGain);
    mainGain.connect(this.ctx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.43);
    lfo.stop(now + 0.43);
  }

  playTeacherBark() {
    if (!this.canPlay()) return;
    const now = this.ctx.currentTime;
    const syllables = [190, 240, 175, 260, 150];
    syllables.forEach((pitch, idx) => {
      const start = now + idx * 0.075;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, start);
      osc.frequency.linearRampToValueAtTime(pitch * 0.85, start + 0.06);
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.065);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.07);
    });
  }

  startBGM() {
    this.stopBGM();
    if (this.muted) return;
    this.bgmBeat = 0;
    const bassLine = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    this.bgmInterval = window.setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const freq = bassLine[this.bgmBeat % bassLine.length];
      this.bgmBeat++;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    }, 210);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

// ============================================================================
// 2. PLAYER (Siswa SMA Putih Abu-abu)
// ============================================================================
const LANE_WIDTH = 2.2;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];

class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    this.currentLane = 1;
    this.targetX = LANES[1];
    this.y = 0;
    this.velocityY = 0;
    this.gravity = -34;
    this.baseJumpForce = 12.8;

    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.68;

    this.stumbleTimer = 0;
    this.isCaught = false;
    this.runCycle = 0;
    this.stepPhase = 0;

    this.hasSuperJump = false;
    this.hasTurbo = false;
    this.hasMagnet = false;

    this.buildCharacterMesh();
    this.scene.add(this.group);
  }

  buildCharacterMesh() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfdba74 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const tieMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const bagMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const bagPocketMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });

    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.82, 0.38), shirtMat);
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.04), tieMat);
    tie.position.set(0, 0.08, -0.2);
    this.torso.add(tie);

    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.11, 0.04),
      new THREE.MeshLambertMaterial({ color: 0xf59e0b })
    );
    badge.position.set(-0.18, 0.14, -0.2);
    this.torso.add(badge);

    this.backpack = new THREE.Group();
    const bagMain = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.64, 0.28), bagMat);
    bagMain.castShadow = true;
    const bagPocket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.1), bagPocketMat);
    bagPocket.position.set(0, -0.1, 0.16);
    this.backpack.add(bagMain, bagPocket);
    this.backpack.position.set(0, 0.04, 0.3);
    this.torso.add(this.backpack);

    this.head = new THREE.Group();
    this.head.position.set(0, 0.64, 0);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    headMesh.castShadow = true;
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.2, 0.56), hairMat);
    hairTop.position.set(0, 0.22, -0.02);
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.35, 0.16), hairMat);
    hairBack.position.set(0, 0.05, 0.22);
    this.head.add(headMesh, hairTop, hairBack);
    this.torso.add(this.head);

    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.44, 0.32, 0);
    const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.2), shirtMat);
    leftSleeve.position.y = -0.1;
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), skinMat);
    leftArm.position.y = -0.34;
    this.leftArmPivot.add(leftSleeve, leftArm);
    this.torso.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.44, 0.32, 0);
    const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.2), shirtMat);
    rightSleeve.position.y = -0.1;
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), skinMat);
    rightArm.position.y = -0.34;
    this.rightArmPivot.add(rightSleeve, rightArm);
    this.torso.add(this.rightArmPivot);

    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.18, 0.74, 0);
    const leftPants = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.64, 0.26), pantsMat);
    leftPants.position.y = -0.32;
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.38), shoeMat);
    leftShoe.position.set(0, -0.66, -0.05);
    this.leftLegPivot.add(leftPants, leftShoe);
    this.bodyGroup.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.18, 0.74, 0);
    const rightPants = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.64, 0.26), pantsMat);
    rightPants.position.y = -0.32;
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.38), shoeMat);
    rightShoe.position.set(0, -0.66, -0.05);
    this.rightLegPivot.add(rightPants, rightShoe);
    this.bodyGroup.add(this.rightLegPivot);

    const shieldGeo = new THREE.RingGeometry(0.7, 0.9, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    this.auraRing = new THREE.Mesh(shieldGeo, shieldMat);
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.05;
    this.auraRing.visible = false;
    this.group.add(this.auraRing);
  }

  reset() {
    this.currentLane = 1;
    this.targetX = LANES[1];
    this.group.position.set(0, 0, 0);
    this.y = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.stumbleTimer = 0;
    this.isCaught = false;
    this.runCycle = 0;
    this.stepPhase = 0;
    this.hasSuperJump = false;
    this.hasTurbo = false;
    this.hasMagnet = false;
    this.auraRing.visible = false;
    this.bodyGroup.rotation.set(0, 0, 0);
    this.bodyGroup.position.set(0, 0, 0);
  }

  moveLeft(audio) {
    if (this.isCaught) return false;
    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = LANES[this.currentLane];
      if (audio) audio.playLaneSwitch();
      return true;
    }
    return false;
  }

  moveRight(audio) {
    if (this.isCaught) return false;
    if (this.currentLane < 2) {
      this.currentLane++;
      this.targetX = LANES[this.currentLane];
      if (audio) audio.playLaneSwitch();
      return true;
    }
    return false;
  }

  jump(audio) {
    if (this.isCaught) return false;
    if (!this.isJumping) {
      this.isJumping = true;
      this.isSliding = false;
      this.slideTimer = 0;
      const mult = this.hasSuperJump ? 1.28 : 1.0;
      this.velocityY = this.baseJumpForce * mult;
      if (audio) audio.playJump(this.hasSuperJump);
      return true;
    }
    return false;
  }

  slide(audio) {
    if (this.isCaught) return false;
    if (this.isJumping) {
      this.velocityY = -24;
    }
    this.isSliding = true;
    this.slideTimer = this.slideDuration;
    if (audio) audio.playSlide();
    return true;
  }

  triggerStumble() {
    this.stumbleTimer = 0.55;
  }

  setCaught() {
    this.isCaught = true;
    this.isSliding = false;
  }

  getHitbox() {
    const height = this.isSliding ? 0.85 : 1.75;
    return {
      minX: this.group.position.x - 0.34,
      maxX: this.group.position.x + 0.34,
      minY: this.y,
      maxY: this.y + height,
      minZ: this.group.position.z - 0.28,
      maxZ: this.group.position.z + 0.28
    };
  }

  update(dt, speed, audio) {
    const dx = this.targetX - this.group.position.x;
    this.group.position.x += dx * Math.min(1, dt * 16);
    this.bodyGroup.rotation.z = THREE.MathUtils.lerp(
      this.bodyGroup.rotation.z,
      -dx * 0.14,
      Math.min(1, dt * 14)
    );

    if (this.isCaught) {
      this.runCycle += dt * 10;
      this.y = 0;
      this.group.position.y = 0;
      this.bodyGroup.rotation.x = 0;
      this.bodyGroup.position.y = 0;
      this.leftArmPivot.rotation.x = Math.PI * 0.85 + Math.sin(this.runCycle * 2) * 0.15;
      this.rightArmPivot.rotation.x = Math.PI * 0.85 - Math.sin(this.runCycle * 2) * 0.15;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.head.rotation.y = Math.sin(this.runCycle * 1.8) * 0.35;
      return;
    }

    if (this.isJumping || this.y > 0) {
      this.y += this.velocityY * dt;
      this.velocityY += this.gravity * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.velocityY = 0;
        this.isJumping = false;
      }
    }
    this.group.position.y = this.y;

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    if (this.stumbleTimer > 0) {
      this.stumbleTimer -= dt;
    }

    const animSpeed = speed * 0.85;
    this.runCycle += dt * animSpeed;

    if (this.isSliding && this.y <= 0.05) {
      this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, -1.15, dt * 18);
      this.bodyGroup.position.y = THREE.MathUtils.lerp(this.bodyGroup.position.y, -0.55, dt * 18);
      this.leftLegPivot.rotation.x = -0.4;
      this.rightLegPivot.rotation.x = 0.25;
      this.leftArmPivot.rotation.x = -0.6;
      this.rightArmPivot.rotation.x = -0.6;
    } else if (this.isJumping) {
      this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, 0.15, dt * 12);
      this.bodyGroup.position.y = THREE.MathUtils.lerp(this.bodyGroup.position.y, 0, dt * 15);
      this.leftLegPivot.rotation.x = 0.65;
      this.rightLegPivot.rotation.x = -0.45;
      this.leftArmPivot.rotation.x = 2.2;
      this.rightArmPivot.rotation.x = 2.2;
    } else {
      this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, 0.12, dt * 14);
      const bob = Math.abs(Math.sin(this.runCycle)) * 0.09;
      this.bodyGroup.position.y = bob;
      const swing = Math.sin(this.runCycle) * 0.85;
      this.leftLegPivot.rotation.x = swing;
      this.rightLegPivot.rotation.x = -swing;
      this.leftArmPivot.rotation.x = -swing * 0.9;
      this.rightArmPivot.rotation.x = swing * 0.9;
      this.backpack.rotation.z = Math.sin(this.runCycle) * 0.06;

      const currentHalfCycle = Math.floor(this.runCycle / Math.PI);
      if (currentHalfCycle !== this.stepPhase) {
        this.stepPhase = currentHalfCycle;
        if (audio) audio.playStep(currentHalfCycle % 2 === 0);
      }
    }

    if (this.stumbleTimer > 0) {
      this.head.rotation.z = Math.sin(this.stumbleTimer * 35) * 0.28;
    } else {
      this.head.rotation.z = 0;
      this.head.rotation.y = 0;
    }

    if (this.hasTurbo || this.hasMagnet || this.hasSuperJump) {
      this.auraRing.visible = true;
      this.auraRing.rotation.z += dt * 4;
      if (this.hasTurbo) {
        this.auraRing.material.color.setHex(0x38bdf8);
      } else if (this.hasMagnet) {
        this.auraRing.material.color.setHex(0xfacc15);
      } else {
        this.auraRing.material.color.setHex(0x4ade80);
      }
    } else {
      this.auraRing.visible = false;
    }
  }
}

// ============================================================================
// 3. TEACHER (Pak Wahid)
// ============================================================================
const TEACHER_QUOTES = [
  '"Heh! Ngapain nongkrong di depan kelas XI A1?!"',
  '"Berhenti kamu! Bajunya dimasukkan dulu!"',
  '"PRIIIT! Jam pelajaran kok malah santai di lorong!"',
  '"Sini kamu! Rambut gondrong, sepatu warna-warni!"',
  '"Jangan lari! Pak Wahid catat di buku poin BK!"',
  '"Awas ya! Nanti ikut Bapak bersihkan perpustakaan!"'
];

const GAMEOVER_QUOTES = [
  '"Kamu ini ya! Jam pelajaran malah nongkrong di depan kelas XI A1! Ikut Bapak ke Ruang BK sekarang!"',
  '"Hosh... hosh... Bapak masih kuat lari tahu! Sekarang kerjakan 50 soal Matematika di meja piket!"',
  '"Ketangkap kan! Besok pagi berdiri di lapangan upacara sama teman-temanmu itu!"',
  '"Niat mau kabur ke kantin ya?! Masuk kelas sekarang, Pak Wahid yang ngajar jam pertama!"'
];

class Teacher {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    this.maxDistance = 20;
    this.distance = 12;
    this.runCycle = 0;

    this.buildTeacherMesh();
    this.scene.add(this.group);
  }

  buildTeacherMesh() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfdba74 });
    const batikMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const batikPatternMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const peciMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1c1917 });
    const rulerMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });

    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.88, 0.44), batikMat);
    this.torso.position.y = 1.22;
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    const stripeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.84, 0.46), batikPatternMat);
    stripeLeft.position.set(-0.2, 0, 0);
    const stripeRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.84, 0.46), batikPatternMat);
    stripeRight.position.set(0.2, 0, 0);
    const nameTag = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.07, 0.04),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    nameTag.position.set(0.22, 0.24, -0.23);
    this.torso.add(stripeLeft, stripeRight, nameTag);

    this.head = new THREE.Group();
    this.head.position.set(0, 0.68, 0);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.54, 0.54), skinMat);
    const peci = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 0.58), peciMat);
    peci.position.set(0, 0.28, 0);
    this.mustache = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.12), darkMat);
    this.mustache.position.set(0, -0.1, -0.26);
    const glassFrame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.08), darkMat);
    glassFrame.position.set(0, 0.06, -0.26);
    this.head.add(headMesh, peci, this.mustache, glassFrame);
    this.torso.add(this.head);

    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.48, 0.34, 0);
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.64, 0.22), batikMat);
    leftArm.position.y = -0.26;
    this.leftArmPivot.add(leftArm);
    this.torso.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.48, 0.34, 0);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.64, 0.22), batikMat);
    rightArm.position.y = -0.26;
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.04), rulerMat);
    ruler.position.set(0, -0.58, -0.2);
    ruler.rotation.x = Math.PI / 3;
    this.rightArmPivot.add(rightArm, ruler);
    this.torso.add(this.rightArmPivot);

    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.2, 0.76, 0);
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.74, 0.28), pantsMat);
    leftLeg.position.y = -0.36;
    this.leftLegPivot.add(leftLeg);
    this.bodyGroup.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.2, 0.76, 0);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.74, 0.28), pantsMat);
    rightLeg.position.y = -0.36;
    this.rightLegPivot.add(rightLeg);
    this.bodyGroup.add(this.rightLegPivot);
  }

  reset() {
    this.distance = 8.5;
    this.runCycle = 0;
    this.group.position.set(0, 0, 3.8);
    this.group.rotation.y = 0;
  }

  onPlayerStumble() {
    this.distance = Math.max(0, this.distance - 7.5);
    return this.distance <= 0.5;
  }

  onPlayerTurbo() {
    this.distance = Math.min(this.maxDistance, this.distance + 6.0);
  }

  getRandomQuote() {
    return TEACHER_QUOTES[Math.floor(Math.random() * TEACHER_QUOTES.length)];
  }

  getRandomGameOverQuote() {
    return GAMEOVER_QUOTES[Math.floor(Math.random() * GAMEOVER_QUOTES.length)];
  }

  update(dt, playerX, speed, isGameOver = false) {
    if (isGameOver) {
      this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, playerX + 0.85, dt * 8);
      this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, 0.65, dt * 8);
      this.group.rotation.y = -0.45;
      this.runCycle += dt * 9;
      this.leftArmPivot.rotation.x = -0.3;
      this.rightArmPivot.rotation.x = Math.PI * 0.75 + Math.sin(this.runCycle * 2.2) * 0.35;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.head.rotation.z = Math.sin(this.runCycle * 1.5) * 0.14;
      this.mustache.rotation.z = Math.sin(this.runCycle * 4) * 0.12;
      return;
    }

    this.distance = Math.min(this.maxDistance, this.distance + dt * 0.95);
    const targetZ = 1.4 + (this.distance / this.maxDistance) * 5.2;
    this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, targetZ, dt * 6);
    this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, playerX, dt * 6.5);
    this.group.rotation.y = Math.PI;

    this.runCycle += dt * (speed * 0.92);
    const swing = Math.sin(this.runCycle) * 0.95;
    this.bodyGroup.position.y = Math.abs(Math.sin(this.runCycle)) * 0.11;
    this.leftLegPivot.rotation.x = swing;
    this.rightLegPivot.rotation.x = -swing;
    this.leftArmPivot.rotation.x = -swing;
    this.rightArmPivot.rotation.x = -0.9 + Math.sin(this.runCycle) * 0.45;
    this.mustache.rotation.z = Math.sin(this.runCycle * 2) * 0.08;
  }
}

// ============================================================================
// 4. CORRIDOR MANAGER (Lorong Sekolah XI A1 & XI A2 Prosedural)
// ============================================================================
const SEGMENT_LENGTH = 18;
const SEGMENT_COUNT = 7;
const CORRIDOR_WIDTH = 8.4;
const WALL_HEIGHT = 5.2;

const CLASS_NAMES = [
  'KELAS XI A1',
  'KELAS XI A2',
  'KELAS XI A3',
  'RUANG BK',
  'KELAS XII IPA 1',
  'PERPUSTAKAAN',
  'KOPERASI SISWA'
];

function createLabelTexture(title, subtitle, bgColor, textColor, borderColor = '#f59e0b') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 244, 116);
  ctx.fillStyle = textColor;
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 128, subtitle ? 48 : 64);
  if (subtitle) {
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = borderColor;
    ctx.fillText(subtitle, 128, 86);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createCeramicFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 256, 256);
  const step = 64;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      ctx.fillStyle = (x / step + y / step) % 2 === 0 ? '#f8fafc' : '#e2e8f0';
      ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
    }
  }
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 256; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 9);
  return tex;
}

class CorridorManager {
  constructor(scene) {
    this.scene = scene;
    this.segments = [];
    this.bystanders = [];
    this.classIndex = 0;
    this.initSharedAssets();
    this.initSegments();
  }

  initSharedAssets() {
    this.floorTexture = createCeramicFloorTexture();
    this.floorMat = new THREE.MeshLambertMaterial({ map: this.floorTexture });
    this.wallUpperMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
    this.wallLowerMat = new THREE.MeshLambertMaterial({ color: 0x0d9488 });
    this.pillarMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    this.ceilingMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    this.woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    this.glassMat = new THREE.MeshLambertMaterial({ color: 0xbae6fd });

    this.signTextures = CLASS_NAMES.map((name) =>
      createLabelTexture(name, 'SMA HARAPAN BANGSA', '#0f172a', '#ffffff', '#facc15')
    );
    this.poster5STexture = createLabelTexture(
      'BUDAYAKAN 5S',
      'Senyum • Sapa • Salam',
      '#1e3a8a',
      '#fef08a',
      '#38bdf8'
    );
    this.tataTertibTexture = createLabelTexture(
      'TATA TERTIB SMA',
      'Dilarang Nongkrong!',
      '#7f1d1d',
      '#ffffff',
      '#f87171'
    );
    this.posterKebersihanTexture = createLabelTexture(
      'JAGA KEBERSIHAN',
      'Buang Sampah di Tempatnya',
      '#14532d',
      '#bbf7d0',
      '#4ade80'
    );
  }

  initSegments() {
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const seg = this.createSegment(i);
      seg.group.position.z = -i * SEGMENT_LENGTH;
      this.scene.add(seg.group);
      this.segments.push(seg);
    }
  }

  createSegment(index) {
    const group = new THREE.Group();
    const halfW = CORRIDOR_WIDTH / 2;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH, SEGMENT_LENGTH),
      this.floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    const lineGeo = new THREE.PlaneGeometry(0.06, SEGMENT_LENGTH);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    [-1.1, 1.1].forEach((lx) => {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(lx, 0.01, 0);
      group.add(line);
    });

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH, SEGMENT_LENGTH),
      this.ceilingMat
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = WALL_HEIGHT;
    group.add(ceiling);

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.1, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    lamp.position.set(0, WALL_HEIGHT - 0.06, 0);
    group.add(lamp);

    [-1, 1].forEach((side) => {
      const wallX = side * halfW;
      const lowerWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 1.6, SEGMENT_LENGTH),
        this.wallLowerMat
      );
      lowerWall.position.set(wallX, 0.8, 0);
      group.add(lowerWall);

      const upperWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, WALL_HEIGHT - 1.6, SEGMENT_LENGTH),
        this.wallUpperMat
      );
      upperWall.position.set(wallX, 1.6 + (WALL_HEIGHT - 1.6) / 2, 0);
      group.add(upperWall);

      [-SEGMENT_LENGTH / 2 + 0.3, 0, SEGMENT_LENGTH / 2 - 0.3].forEach((pz) => {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, WALL_HEIGHT, 0.45),
          this.pillarMat
        );
        pillar.position.set(wallX - side * 0.1, WALL_HEIGHT / 2, pz);
        group.add(pillar);
      });

      const door = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.5, 1.3), this.woodMat);
      door.position.set(wallX - side * 0.08, 1.25, -4.2);
      group.add(door);

      [1.5, 5.2].forEach((wz) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.5, 2.2), this.woodMat);
        frame.position.set(wallX - side * 0.08, 2.2, wz);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.25, 1.95), this.glassMat);
        glass.position.set(wallX - side * 0.09, 2.2, wz);
        group.add(frame, glass);
      });
    });

    const leftSignMat = new THREE.MeshBasicMaterial({
      map: this.signTextures[index % this.signTextures.length],
      side: THREE.DoubleSide
    });
    const rightSignMat = new THREE.MeshBasicMaterial({
      map: this.signTextures[(index + 1) % this.signTextures.length],
      side: THREE.DoubleSide
    });

    const leftSign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 0.08), leftSignMat);
    leftSign.position.set(-halfW + 0.85, 3.45, -4.2);
    group.add(leftSign);

    const rightSign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 0.08), rightSignMat);
    rightSign.position.set(halfW - 0.85, 3.45, -4.2);
    group.add(rightSign);

    const posterTextures = [
      this.poster5STexture,
      this.tataTertibTexture,
      this.posterKebersihanTexture
    ];
    const posterLeft = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.95),
      new THREE.MeshBasicMaterial({ map: posterTextures[index % posterTextures.length] })
    );
    posterLeft.rotation.y = Math.PI / 2;
    posterLeft.position.set(-halfW + 0.14, 2.35, -1.5);
    group.add(posterLeft);

    const posterRight = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.95),
      new THREE.MeshBasicMaterial({ map: posterTextures[(index + 1) % posterTextures.length] })
    );
    posterRight.rotation.y = -Math.PI / 2;
    posterRight.position.set(halfW - 0.14, 2.35, -1.5);
    group.add(posterRight);

    this.addSideProps(group, halfW, index);
    return { group, leftSignMat, rightSignMat };
  }

  addSideProps(group, halfW, index) {
    const binGreenMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
    const binYellowMat = new THREE.MeshLambertMaterial({ color: 0xeab308 });
    const greenBin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.65, 8), binGreenMat);
    greenBin.position.set(-halfW + 0.55, 0.32, 3.4);
    const yellowBin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.65, 8), binYellowMat);
    yellowBin.position.set(-halfW + 0.55, 0.32, 4.0);
    group.add(greenBin, yellowBin);

    const bystander = this.createBystanderStudent(index);
    const side = index % 2 === 0 ? 1 : -1;
    bystander.group.position.set(side * (halfW - 0.62), 0, -2.5);
    bystander.group.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
    group.add(bystander.group);
    this.bystanders.push(bystander);
  }

  createBystanderStudent(seed) {
    const g = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfdba74 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const hairMat = new THREE.MeshLambertMaterial({
      color: seed % 2 === 0 ? 0x0f172a : 0x451a03
    });

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.7, 0.24), pantsMat);
    legs.position.y = 0.35;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.68, 0.28), shirtMat);
    torso.position.y = 1.04;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), skinMat);
    head.position.y = 1.58;
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.4), hairMat);
    hair.position.y = 1.78;
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), shirtMat);
    rightArm.position.set(0.32, 1.15, 0);

    g.add(legs, torso, head, hair, rightArm);
    return { group: g, rightArm, phase: seed * 1.3 };
  }

  reset() {
    this.classIndex = 0;
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].group.position.z = -i * SEGMENT_LENGTH;
    }
  }

  update(dt, speed) {
    const moveZ = speed * dt;
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      seg.group.position.z += moveZ;
      if (seg.group.position.z > SEGMENT_LENGTH) {
        let minZ = Infinity;
        for (let j = 0; j < this.segments.length; j++) {
          if (this.segments[j].group.position.z < minZ) {
            minZ = this.segments[j].group.position.z;
          }
        }
        seg.group.position.z = minZ - SEGMENT_LENGTH;
        this.classIndex++;
        seg.leftSignMat.map = this.signTextures[this.classIndex % this.signTextures.length];
        seg.rightSignMat.map = this.signTextures[(this.classIndex + 1) % this.signTextures.length];
      }
    }
    const time = performance.now() * 0.006;
    for (let i = 0; i < this.bystanders.length; i++) {
      const b = this.bystanders[i];
      b.rightArm.rotation.z = 2.4 + Math.sin(time + b.phase) * 0.35;
    }
  }
}

// ============================================================================
// 5. OBSTACLE MANAGER
// ============================================================================
class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.activeObstacles = [];
    this.pool = [];
    this.spawnTimer = 0;
    this.initMaterials();
  }

  initMaterials() {
    this.woodMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    this.woodLightMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    this.metalMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    this.bagRedMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    this.bagBlueMat = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    this.bookMat1 = new THREE.MeshLambertMaterial({ color: 0x16a34a });
    this.bookMat2 = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    this.bannerMat = new THREE.MeshLambertMaterial({ color: 0xea580c });
    this.bannerStripeMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
    this.lockerMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    this.goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
  }

  createObstacleMesh(type) {
    const group = new THREE.Group();
    let minY = 0;
    let maxY = 1.0;
    let isSolidWall = false;

    if (type === 'DESK_CHAIR') {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.9), this.woodLightMat);
      top.position.y = 0.85;
      group.add(top);
      [-0.65, 0.65].forEach((lx) => {
        [-0.35, 0.35].forEach((lz) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), this.woodMat);
          leg.position.set(lx, 0.425, lz);
          group.add(leg);
        });
      });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.28), this.bookMat1);
      book.position.set(-0.25, 0.94, 0);
      group.add(book);
      minY = 0;
      maxY = 0.98;
    } else if (type === 'BAG_BOOKS') {
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.68, 0.45), this.bagRedMat);
      bag.position.set(-0.32, 0.34, 0);
      const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.38), this.bookMat1);
      book1.position.set(0.32, 0.08, 0);
      const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.36), this.bookMat2);
      book2.position.set(0.32, 0.24, 0);
      const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.72, 8), this.bagBlueMat);
      bin.position.set(0.35, 0.36, -0.15);
      group.add(bag, book1, book2, bin);
      minY = 0;
      maxY = 0.82;
    } else if (type === 'HIGH_BANNER') {
      const leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.35, 8), this.metalMat);
      leftPole.position.set(-0.82, 1.175, 0);
      const rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.35, 8), this.metalMat);
      rightPole.position.set(0.82, 1.175, 0);
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.95, 0.2), this.bannerMat);
      board.position.set(0, 1.72, 0);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.24), this.bannerStripeMat);
      stripe.position.set(0, 1.42, 0);
      group.add(leftPole, rightPole, board, stripe);
      minY = 1.12;
      maxY = 2.3;
    } else if (type === 'TALL_LOCKER') {
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.35, 0.85), this.lockerMat);
      cabinet.position.y = 1.175;
      const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.4, 8), this.goldMat);
      trophy.position.set(0, 1.5, -0.44);
      group.add(cabinet, trophy);
      minY = 0;
      maxY = 2.35;
      isSolidWall = true;
    }

    return { type, group, minY, maxY, isSolidWall, lane: 1, hit: false };
  }

  acquireObstacle(type) {
    const idx = this.pool.findIndex((item) => item.type === type);
    if (idx !== -1) {
      const obs = this.pool.splice(idx, 1)[0];
      obs.hit = false;
      obs.group.visible = true;
      obs.group.rotation.set(0, 0, 0);
      return obs;
    }
    const created = this.createObstacleMesh(type);
    this.scene.add(created.group);
    return created;
  }

  releaseObstacle(obs) {
    obs.group.visible = false;
    this.pool.push(obs);
  }

  reset() {
    while (this.activeObstacles.length > 0) {
      this.releaseObstacle(this.activeObstacles.pop());
    }
    this.spawnTimer = 0.6;
  }

  spawnPattern(zPos, collectiblesManager) {
    const patterns = [
      ['DESK_CHAIR', null, null],
      [null, 'DESK_CHAIR', null],
      [null, null, 'BAG_BOOKS'],
      [null, 'HIGH_BANNER', null],
      ['HIGH_BANNER', null, 'DESK_CHAIR'],
      ['TALL_LOCKER', 'DESK_CHAIR', null],
      [null, 'HIGH_BANNER', 'TALL_LOCKER'],
      ['BAG_BOOKS', null, 'HIGH_BANNER'],
      ['TALL_LOCKER', null, 'TALL_LOCKER'],
      ['DESK_CHAIR', 'HIGH_BANNER', 'BAG_BOOKS']
    ];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    pattern.forEach((type, laneIdx) => {
      if (!type) return;
      const obs = this.acquireObstacle(type);
      obs.lane = laneIdx;
      obs.group.position.set(LANES[laneIdx], 0, zPos);
      this.activeObstacles.push(obs);
    });
    if (collectiblesManager) {
      collectiblesManager.spawnForPattern(pattern, zPos);
    }
  }

  update(dt, speed, player, collectiblesManager, onCollision) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.78, 1.58 - (speed - 13) * 0.035);
      this.spawnPattern(-78, collectiblesManager);
    }
    const pBox = player.getHitbox();
    const moveZ = speed * dt;
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      obs.group.position.z += moveZ;
      if (obs.hit && player.hasTurbo) {
        obs.group.position.y += dt * 10;
        obs.group.rotation.x += dt * 8;
      }
      if (!obs.hit) {
        const obsZ = obs.group.position.z;
        const obsX = obs.group.position.x;
        const overlapZ = obsZ + 0.45 > pBox.minZ && obsZ - 0.45 < pBox.maxZ;
        const overlapX = obsX + 0.68 > pBox.minX && obsX - 0.68 < pBox.maxX;
        const overlapY = obs.maxY > pBox.minY + 0.08 && obs.minY < pBox.maxY - 0.05;
        if (overlapZ && overlapX && overlapY) {
          obs.hit = true;
          if (!player.hasTurbo) {
            onCollision(obs);
          }
        }
      }
      if (obs.group.position.z > 10) {
        this.activeObstacles.splice(i, 1);
        this.releaseObstacle(obs);
      }
    }
  }
}

// ============================================================================
// 6. COLLECTIBLES & POWER-UPS MANAGER
// ============================================================================
const POWERUP_TYPES = {
  MAGNET: { id: 'MAGNET', label: '🧲 Magnet Jajan', duration: 9.0, color: 0xfacc15 },
  SUPER_JUMP: { id: 'SUPER_JUMP', label: '👟 Sepatu Basket', duration: 9.0, color: 0x4ade80 },
  TURBO: { id: 'TURBO', label: '🧋 Es Teh Turbo', duration: 5.5, color: 0x38bdf8 }
};

class CollectiblesManager {
  constructor(scene) {
    this.scene = scene;
    this.activeCoins = [];
    this.coinPool = [];
    this.activePowerups = [];
    this.activeBuffs = { MAGNET: 0, SUPER_JUMP: 0, TURBO: 0 };

    this.coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.1, 12);
    this.coinMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: 0x854d0e });
    this.powerupGeo = new THREE.OctahedronGeometry(0.46, 0);
  }

  acquireCoin() {
    if (this.coinPool.length > 0) {
      const coin = this.coinPool.pop();
      coin.mesh.visible = true;
      return coin;
    }
    const mesh = new THREE.Mesh(this.coinGeo, this.coinMat);
    mesh.rotation.z = Math.PI / 2;
    this.scene.add(mesh);
    return { mesh };
  }

  releaseCoin(coin) {
    coin.mesh.visible = false;
    this.coinPool.push(coin);
  }

  acquirePowerup(typeKey) {
    const info = POWERUP_TYPES[typeKey];
    const mat = new THREE.MeshLambertMaterial({
      color: info.color,
      emissive: info.color,
      emissiveIntensity: 0.35
    });
    const mesh = new THREE.Mesh(this.powerupGeo, mat);
    this.scene.add(mesh);
    return { typeKey, mesh };
  }

  reset() {
    while (this.activeCoins.length > 0) {
      this.releaseCoin(this.activeCoins.pop());
    }
    while (this.activePowerups.length > 0) {
      const p = this.activePowerups.pop();
      this.scene.remove(p.mesh);
    }
    this.activeBuffs.MAGNET = 0;
    this.activeBuffs.SUPER_JUMP = 0;
    this.activeBuffs.TURBO = 0;
  }

  spawnForPattern(pattern, zPos) {
    const candidateLanes = [0, 1, 2].filter((idx) => pattern[idx] !== 'TALL_LOCKER');
    if (candidateLanes.length === 0) return;
    const chosenLane = candidateLanes[Math.floor(Math.random() * candidateLanes.length)];
    const obsType = pattern[chosenLane];

    for (let i = 0; i < 5; i++) {
      const coin = this.acquireCoin();
      const offsetZ = (i - 2) * 1.9;
      let y = 0.65;
      if (obsType === 'DESK_CHAIR' || obsType === 'BAG_BOOKS') {
        const arc = Math.cos(((i - 2) / 2.2) * (Math.PI / 2));
        y = 0.65 + arc * 1.45;
      } else if (obsType === 'HIGH_BANNER') {
        y = 0.48;
      }
      coin.mesh.position.set(LANES[chosenLane], y, zPos + offsetZ);
      this.activeCoins.push(coin);
    }

    const freeLanes = [0, 1, 2].filter((idx) => pattern[idx] === null && idx !== chosenLane);
    if (freeLanes.length > 0 && Math.random() < 0.18) {
      const pLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      const keys = Object.keys(POWERUP_TYPES);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const p = this.acquirePowerup(randomKey);
      p.mesh.position.set(LANES[pLane], 0.9, zPos);
      this.activePowerups.push(p);
    }
  }

  activateBuff(typeKey, player, teacher) {
    const info = POWERUP_TYPES[typeKey];
    if (!info) return;
    this.activeBuffs[typeKey] = info.duration;
    if (typeKey === 'TURBO' && teacher) {
      teacher.onPlayerTurbo();
    }
    this.syncPlayerFlags(player);
  }

  syncPlayerFlags(player) {
    player.hasMagnet = this.activeBuffs.MAGNET > 0;
    player.hasSuperJump = this.activeBuffs.SUPER_JUMP > 0;
    player.hasTurbo = this.activeBuffs.TURBO > 0;
  }

  getActiveBuffList() {
    const list = [];
    Object.keys(POWERUP_TYPES).forEach((k) => {
      if (this.activeBuffs[k] > 0) {
        list.push({
          label: POWERUP_TYPES[k].label,
          remaining: Math.ceil(this.activeBuffs[k])
        });
      }
    });
    return list;
  }

  update(dt, speed, player, teacher, audio, onCoinCollected, onPowerupCollected) {
    Object.keys(this.activeBuffs).forEach((k) => {
      if (this.activeBuffs[k] > 0) {
        this.activeBuffs[k] = Math.max(0, this.activeBuffs[k] - dt);
      }
    });
    this.syncPlayerFlags(player);

    const moveZ = speed * dt;
    const playerPos = player.group.position;

    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];
      coin.mesh.position.z += moveZ;
      coin.mesh.rotation.y += dt * 4.5;

      if (player.hasMagnet && coin.mesh.position.z > -16 && coin.mesh.position.z < 3) {
        coin.mesh.position.x = THREE.MathUtils.lerp(coin.mesh.position.x, playerPos.x, dt * 11);
        coin.mesh.position.y = THREE.MathUtils.lerp(
          coin.mesh.position.y,
          playerPos.y + 0.9,
          dt * 11
        );
      }

      const dx = Math.abs(coin.mesh.position.x - playerPos.x);
      const dy = Math.abs(coin.mesh.position.y - (playerPos.y + 0.8));
      const dz = Math.abs(coin.mesh.position.z - playerPos.z);

      if (dx < 0.78 && dy < 1.05 && dz < 0.78) {
        this.activeCoins.splice(i, 1);
        this.releaseCoin(coin);
        if (audio) audio.playCoin();
        if (onCoinCollected) onCoinCollected();
        continue;
      }

      if (coin.mesh.position.z > 8) {
        this.activeCoins.splice(i, 1);
        this.releaseCoin(coin);
      }
    }

    for (let i = this.activePowerups.length - 1; i >= 0; i--) {
      const p = this.activePowerups[i];
      p.mesh.position.z += moveZ;
      p.mesh.rotation.y += dt * 3.5;
      p.mesh.rotation.x += dt * 2.0;

      const dx = Math.abs(p.mesh.position.x - playerPos.x);
      const dy = Math.abs(p.mesh.position.y - (playerPos.y + 0.85));
      const dz = Math.abs(p.mesh.position.z - playerPos.z);

      if (dx < 0.85 && dy < 1.15 && dz < 0.85) {
        const typeKey = p.typeKey;
        this.activePowerups.splice(i, 1);
        this.scene.remove(p.mesh);
        this.activateBuff(typeKey, player, teacher);
        if (audio) audio.playPowerup();
        if (onPowerupCollected) onPowerupCollected(POWERUP_TYPES[typeKey]);
        continue;
      }

      if (p.mesh.position.z > 8) {
        this.activePowerups.splice(i, 1);
        this.scene.remove(p.mesh);
      }
    }
  }
}

// ============================================================================
// 7. UI & TOUCH CONTROLS MANAGER
// ============================================================================
const STORAGE_SEEN_HELP_KEY = 'kpw_seen_controls_v1';
const STORAGE_VCONTROLS_KEY = 'kpw_show_vcontrols';

class UIManager {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.bubbleTimeout = null;
    this.showVirtualControls = localStorage.getItem(STORAGE_VCONTROLS_KEY) !== 'false';
    this.cacheElements();
    this.bindUIEvents();
    this.bindInputControls();
    this.syncSettingsUI();
  }

  cacheElements() {
    this.canvasContainer = document.getElementById('canvas-container');
    this.webglFallback = document.getElementById('webgl-fallback');
    this.orientationToast = document.getElementById('orientation-toast');
    this.btnDismissToast = document.getElementById('btn-dismiss-toast');

    this.hud = document.getElementById('hud');
    this.hudScore = document.getElementById('hud-score');
    this.hudCoins = document.getElementById('hud-coins');
    this.hudHighscore = document.getElementById('hud-highscore');
    this.btnHudHelp = document.getElementById('btn-hud-help');
    this.btnHudMute = document.getElementById('btn-hud-mute');
    this.btnHudPause = document.getElementById('btn-hud-pause');

    this.chaseStatusText = document.getElementById('chase-status-text');
    this.chaseDistanceText = document.getElementById('chase-distance-text');
    this.chaseBarFill = document.getElementById('chase-bar-fill');
    this.chaseTeacherHead = document.getElementById('chase-teacher-head');

    this.hudPowerups = document.getElementById('hud-powerups');
    this.comicBubble = document.getElementById('comic-bubble');
    this.comicBubbleText = document.getElementById('comic-bubble-text');

    this.virtualControls = document.getElementById('virtual-controls');
    this.btnVcLeft = document.getElementById('btn-vc-left');
    this.btnVcRight = document.getElementById('btn-vc-right');
    this.btnVcJump = document.getElementById('btn-vc-jump');
    this.btnVcSlide = document.getElementById('btn-vc-slide');

    this.menuScreen = document.getElementById('menu-screen');
    this.menuBestScore = document.getElementById('menu-best-score');
    this.menuTotalCoins = document.getElementById('menu-total-coins');
    this.selectQuality = document.getElementById('select-quality');
    this.toggleVControls = document.getElementById('toggle-vcontrols');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnOpenHelp = document.getElementById('btn-open-help');
    this.btnMenuMute = document.getElementById('btn-menu-mute');

    this.pauseScreen = document.getElementById('pause-screen');
    this.selectQualityPause = document.getElementById('select-quality-pause');
    this.toggleVControlsPause = document.getElementById('toggle-vcontrols-pause');
    this.btnResumeGame = document.getElementById('btn-resume-game');
    this.btnPauseHelp = document.getElementById('btn-pause-help');
    this.btnRestartFromPause = document.getElementById('btn-restart-from-pause');
    this.btnQuitToMenu = document.getElementById('btn-quit-to-menu');

    this.gameoverScreen = document.getElementById('gameover-screen');
    this.gameoverQuote = document.getElementById('gameover-quote');
    this.goScore = document.getElementById('go-score');
    this.goCoins = document.getElementById('go-coins');
    this.goBest = document.getElementById('go-best');
    this.newRecordBanner = document.getElementById('new-record-banner');
    this.btnPlayAgain = document.getElementById('btn-play-again');
    this.btnGameoverMenu = document.getElementById('btn-gameover-menu');

    this.helpModal = document.getElementById('help-modal');
    this.btnCloseHelp = document.getElementById('btn-close-help');
  }

  bindUIEvents() {
    this.btnStartGame.addEventListener('click', () => {
      if (!localStorage.getItem(STORAGE_SEEN_HELP_KEY)) {
        try {
          localStorage.setItem(STORAGE_SEEN_HELP_KEY, 'true');
        } catch {}
        this.openHelp(true);
      } else {
        this.callbacks.onStartGame();
      }
    });

    this.btnOpenHelp.addEventListener('click', () => this.openHelp(false));
    this.btnPauseHelp.addEventListener('click', () => this.openHelp(false));
    this.btnHudHelp.addEventListener('click', () => {
      this.callbacks.onPauseGame();
      this.openHelp(false);
    });

    this.btnCloseHelp.addEventListener('click', () => {
      const shouldStart = this.helpModal.dataset.startAfterClose === 'true';
      this.helpModal.dataset.startAfterClose = 'false';
      this.helpModal.classList.add('hidden');
      if (shouldStart) {
        this.callbacks.onStartGame();
      }
    });

    this.btnHudPause.addEventListener('click', () => this.callbacks.onPauseGame());
    this.btnResumeGame.addEventListener('click', () => this.callbacks.onResumeGame());
    this.btnRestartFromPause.addEventListener('click', () => this.callbacks.onStartGame());
    this.btnQuitToMenu.addEventListener('click', () => this.callbacks.onQuitToMenu());

    this.btnPlayAgain.addEventListener('click', () => this.callbacks.onStartGame());
    this.btnGameoverMenu.addEventListener('click', () => this.callbacks.onQuitToMenu());

    this.btnHudMute.addEventListener('click', () => this.callbacks.onToggleMute());
    this.btnMenuMute.addEventListener('click', () => this.callbacks.onToggleMute());

    this.selectQuality.addEventListener('change', (e) => {
      this.selectQualityPause.value = e.target.value;
      this.callbacks.onChangeQuality(e.target.value);
    });

    this.selectQualityPause.addEventListener('change', (e) => {
      this.selectQuality.value = e.target.value;
      this.callbacks.onChangeQuality(e.target.value);
    });

    const handleVControlChange = (checked) => {
      this.showVirtualControls = checked;
      this.toggleVControls.checked = checked;
      this.toggleVControlsPause.checked = checked;
      try {
        localStorage.setItem(STORAGE_VCONTROLS_KEY, String(checked));
      } catch {}
      this.updateVirtualControlsVisibility(this.callbacks.isPlaying());
    };

    this.toggleVControls.addEventListener('change', (e) => handleVControlChange(e.target.checked));
    this.toggleVControlsPause.addEventListener('change', (e) =>
      handleVControlChange(e.target.checked)
    );

    this.btnDismissToast.addEventListener('click', () => {
      this.orientationToast.classList.add('hidden');
      this.orientationToast.dataset.dismissed = 'true';
    });
  }

  bindInputControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.helpModal.classList.contains('hidden')) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.btnCloseHelp.click();
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.callbacks.isPlaying()) {
          this.callbacks.onPauseGame();
        } else if (this.callbacks.isPaused()) {
          this.callbacks.onResumeGame();
        }
        return;
      }

      if (!this.callbacks.isPlaying()) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.callbacks.onAction('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.callbacks.onAction('RIGHT');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          this.callbacks.onAction('JUMP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.callbacks.onAction('SLIDE');
          break;
        default:
          break;
      }
    });

    const bindVCButton = (btn, actionName) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add('active-press');
        if (this.callbacks.isPlaying()) {
          this.callbacks.onAction(actionName);
        }
      });
      const clearPress = () => btn.classList.remove('active-press');
      btn.addEventListener('pointerup', clearPress);
      btn.addEventListener('pointercancel', clearPress);
      btn.addEventListener('pointerleave', clearPress);
    };

    bindVCButton(this.btnVcLeft, 'LEFT');
    bindVCButton(this.btnVcRight, 'RIGHT');
    bindVCButton(this.btnVcJump, 'JUMP');
    bindVCButton(this.btnVcSlide, 'SLIDE');

    const SWIPE_THRESHOLD = 30;
    let startX = 0;
    let startY = 0;
    let swipeActive = false;
    let swipeTriggered = false;

    const onGestureStart = (x, y) => {
      if (!this.callbacks.isPlaying()) return;
      startX = x;
      startY = y;
      swipeActive = true;
      swipeTriggered = false;
    };

    const onGestureMove = (x, y) => {
      if (!swipeActive || swipeTriggered || !this.callbacks.isPlaying()) return;
      const dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
      swipeTriggered = true;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.callbacks.onAction(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        this.callbacks.onAction(dy < 0 ? 'JUMP' : 'SLIDE');
      }
    };

    const onGestureEnd = () => {
      swipeActive = false;
      swipeTriggered = false;
    };

    this.canvasContainer.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 1) {
          onGestureStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );
    this.canvasContainer.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 1) {
          onGestureMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );
    this.canvasContainer.addEventListener('touchend', onGestureEnd, { passive: true });
    this.canvasContainer.addEventListener('touchcancel', onGestureEnd, { passive: true });

    this.canvasContainer.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      onGestureStart(e.clientX, e.clientY);
    });
    this.canvasContainer.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      onGestureMove(e.clientX, e.clientY);
    });
    this.canvasContainer.addEventListener('pointerup', onGestureEnd);
    this.canvasContainer.addEventListener('pointercancel', onGestureEnd);
  }

  syncSettingsUI() {
    this.toggleVControls.checked = this.showVirtualControls;
    this.toggleVControlsPause.checked = this.showVirtualControls;
  }

  setQualitySelect(quality) {
    this.selectQuality.value = quality;
    this.selectQualityPause.value = quality;
  }

  updateMuteButtons(muted) {
    this.btnHudMute.textContent = muted ? '🔇' : '🔊';
    this.btnMenuMute.textContent = muted ? '🔇 Suara: OFF' : '🔊 Suara: ON';
  }

  updateVirtualControlsVisibility(isPlaying) {
    if (isPlaying && this.showVirtualControls) {
      this.virtualControls.classList.remove('hidden');
    } else {
      this.virtualControls.classList.add('hidden');
    }
  }

  checkOrientationHint() {
    if (this.orientationToast.dataset.dismissed === 'true') return;
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait && window.innerWidth < 768) {
      this.orientationToast.classList.remove('hidden');
    } else {
      this.orientationToast.classList.add('hidden');
    }
  }

  openHelp(startAfterClose = false) {
    this.helpModal.dataset.startAfterClose = String(startAfterClose);
    this.helpModal.classList.remove('hidden');
  }

  showMenu(highScore, totalCoins) {
    this.menuBestScore.textContent = `${Math.floor(highScore)} m`;
    this.menuTotalCoins.textContent = `${totalCoins}`;
    this.menuScreen.classList.remove('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.updateVirtualControlsVisibility(false);
  }

  showPlaying(highScore) {
    this.hudHighscore.textContent = `${Math.floor(highScore)} m`;
    this.menuScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.updateVirtualControlsVisibility(true);
  }

  showPause() {
    this.pauseScreen.classList.remove('hidden');
    this.updateVirtualControlsVisibility(false);
  }

  showGameOver(score, coins, highScore, isNewRecord, quote) {
    this.goScore.textContent = `${Math.floor(score)} m`;
    this.goCoins.textContent = `${coins}`;
    this.goBest.textContent = `${Math.floor(highScore)} m`;
    this.gameoverQuote.textContent = quote;
    if (isNewRecord) {
      this.newRecordBanner.classList.remove('hidden');
    } else {
      this.newRecordBanner.classList.add('hidden');
    }
    this.gameoverScreen.classList.remove('hidden');
    this.updateVirtualControlsVisibility(false);
  }

  showWebGLFallback() {
    this.webglFallback.classList.remove('hidden');
    this.menuScreen.classList.add('hidden');
  }

  showComicBubble(text, durationMs = 3000) {
    this.comicBubbleText.textContent = text;
    this.comicBubble.classList.remove('hidden');
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.comicBubble.classList.add('hidden');
    }, durationMs);
  }

  updateHUD(score, coins, highScore, teacherDistance, maxDistance, activeBuffs) {
    this.hudScore.textContent = `${Math.floor(score)} m`;
    this.hudCoins.textContent = `${coins}`;
    this.hudHighscore.textContent = `${Math.floor(Math.max(score, highScore))} m`;

    const distRounded = Math.max(0, Math.round(teacherDistance));
    this.chaseDistanceText.textContent = `${distRounded} m di belakang`;

    const ratio = Math.max(0, Math.min(1, teacherDistance / maxDistance));
    const fillPct = Math.round(ratio * 100);
    this.chaseBarFill.style.width = `${fillPct}%`;
    const teacherLeftPct = Math.round(92 - ratio * 84);
    this.chaseTeacherHead.style.left = `${teacherLeftPct}%`;

    if (teacherDistance <= 6.5) {
      this.chaseStatusText.textContent = '🚨 Pak Wahid: DEKAT SEKALI!';
      this.chaseStatusText.classList.add('danger');
    } else if (teacherDistance <= 12) {
      this.chaseStatusText.textContent = '⚠️ Pak Wahid: Mengejar!';
      this.chaseStatusText.classList.remove('danger');
    } else {
      this.chaseStatusText.textContent = '👨‍🏫 Pak Wahid: Jarak Aman';
      this.chaseStatusText.classList.remove('danger');
    }

    if (activeBuffs.length === 0) {
      if (this.hudPowerups.innerHTML !== '') {
        this.hudPowerups.innerHTML = '';
      }
    } else {
      this.hudPowerups.innerHTML = activeBuffs
        .map((b) => `<div class="powerup-badge"><span>${b.label}</span> <strong>${b.remaining}d</strong></div>`)
        .join('');
    }
  }
}

// ============================================================================
// 8. MAIN GAME ENGINE
// ============================================================================
const STORAGE_HIGHSCORE_KEY = 'kpw_highscore';
const STORAGE_TOTAL_COINS_KEY = 'kpw_total_coins';
const STORAGE_QUALITY_KEY = 'kpw_graphics_quality';

class KejaranPakWahidGame {
  constructor() {
    this.state = 'MENU';
    this.score = 0;
    this.runCoins = 0;
    this.highScore = Number(localStorage.getItem(STORAGE_HIGHSCORE_KEY) || 0);
    this.totalCoins = Number(localStorage.getItem(STORAGE_TOTAL_COINS_KEY) || 0);

    this.baseSpeed = 13.5;
    this.maxSpeed = 27.0;
    this.currentSpeed = this.baseSpeed;
    this.cameraShake = 0;

    this.audio = new AudioManager();
    this.quality = this.detectInitialQuality();

    this.ui = new UIManager({
      onStartGame: () => this.startGame(),
      onPauseGame: () => this.pauseGame(),
      onResumeGame: () => this.resumeGame(),
      onQuitToMenu: () => this.quitToMenu(),
      onToggleMute: () => {
        const muted = this.audio.toggleMute();
        this.ui.updateMuteButtons(muted);
        if (!muted && this.state === 'PLAYING') {
          this.audio.startBGM();
        }
      },
      onChangeQuality: (q) => this.applyGraphicsQuality(q),
      onAction: (action) => this.handlePlayerAction(action),
      isPlaying: () => this.state === 'PLAYING',
      isPaused: () => this.state === 'PAUSED'
    });

    this.ui.setQualitySelect(this.quality);
    this.ui.updateMuteButtons(this.audio.muted);
    this.ui.checkOrientationHint();

    if (!this.isWebGLAvailable()) {
      this.ui.showWebGLFallback();
      return;
    }

    this.initThreeScene();
    this.applyGraphicsQuality(this.quality);
    this.bindLifecycleEvents();

    this.ui.showMenu(this.highScore, this.totalCoins);
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.animate(t));
  }

  detectInitialQuality() {
    const saved = localStorage.getItem(STORAGE_QUALITY_KEY);
    if (saved === 'low' || saved === 'medium' || saved === 'high') {
      return saved;
    }
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    if (mem <= 2 || cores <= 4) {
      return 'low';
    }
    return 'medium';
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  initThreeScene() {
    const container = document.getElementById('canvas-container');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.Fog(0x0f172a, 28, 86);

    this.camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      110
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: this.quality !== 'low',
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 0.85);
    this.dirLight.position.set(6, 14, 10);
    this.dirLight.shadow.mapSize.width = 512;
    this.dirLight.shadow.mapSize.height = 512;
    this.scene.add(this.dirLight);

    this.corridor = new CorridorManager(this.scene);
    this.player = new Player(this.scene);
    this.teacher = new Teacher(this.scene);
    this.obstacles = new ObstacleManager(this.scene);
    this.collectibles = new CollectiblesManager(this.scene);

    this.updateCameraProjection();
  }

  applyGraphicsQuality(quality) {
    this.quality = quality;
    try {
      localStorage.setItem(STORAGE_QUALITY_KEY, quality);
    } catch {}
    if (!this.renderer) return;
    const dpr = window.devicePixelRatio || 1;
    if (quality === 'low') {
      this.renderer.setPixelRatio(Math.min(dpr, 1.0));
      this.renderer.shadowMap.enabled = false;
      this.dirLight.castShadow = false;
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(Math.min(dpr, 1.5));
      this.renderer.shadowMap.enabled = false;
      this.dirLight.castShadow = false;
    } else {
      this.renderer.setPixelRatio(Math.min(dpr, 2.0));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.dirLight.castShadow = true;
    }
  }

  updateCameraProjection() {
    if (!this.camera || !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    this.camera.aspect = aspect;
    if (aspect < 0.8) {
      this.camera.fov = 74;
      this.cameraBaseZ = 6.9;
      this.cameraBaseY = 3.55;
    } else if (aspect < 1.1) {
      this.camera.fov = 66;
      this.cameraBaseZ = 6.4;
      this.cameraBaseY = 3.35;
    } else {
      this.camera.fov = 58;
      this.cameraBaseZ = 5.9;
      this.cameraBaseY = 3.15;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  bindLifecycleEvents() {
    window.addEventListener('resize', () => {
      this.updateCameraProjection();
      this.ui.checkOrientationHint();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateCameraProjection();
        this.ui.checkOrientationHint();
      }, 120);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'PLAYING') {
        this.pauseGame();
      }
    });
  }

  startGame() {
    this.audio.initContext();
    this.audio.playSchoolBell();
    setTimeout(() => {
      if (this.state === 'PLAYING') {
        this.audio.playTeacherWhistle();
      }
    }, 350);

    this.state = 'PLAYING';
    this.score = 0;
    this.runCoins = 0;
    this.currentSpeed = this.baseSpeed;
    this.cameraShake = 0;

    this.player.reset();
    this.teacher.reset();
    this.corridor.reset();
    this.obstacles.reset();
    this.collectibles.reset();

    this.ui.showPlaying(this.highScore);
    this.ui.showComicBubble(
      '"PRIIIT! Heh! Ngapain nongkrong di depan XI A1?! Sini kamu!"',
      3600
    );
    this.audio.startBGM();
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.audio.stopBGM();
    this.ui.showPause();
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.lastTime = performance.now();
    this.ui.showPlaying(this.highScore);
    this.audio.startBGM();
  }

  quitToMenu() {
    this.state = 'MENU';
    this.audio.stopBGM();
    this.player.reset();
    this.teacher.reset();
    this.obstacles.reset();
    this.collectibles.reset();
    this.ui.showMenu(this.highScore, this.totalCoins);
  }

  handlePlayerAction(action) {
    if (this.state !== 'PLAYING') return;
    if (action === 'LEFT') this.player.moveLeft(this.audio);
    else if (action === 'RIGHT') this.player.moveRight(this.audio);
    else if (action === 'JUMP') this.player.jump(this.audio);
    else if (action === 'SLIDE') this.player.slide(this.audio);
  }

  handleObstacleCollision(obs) {
    this.audio.playCrash();
    this.cameraShake = 0.45;
    if (obs.isSolidWall) {
      this.teacher.distance = 0;
      this.triggerGameOver();
      return;
    }
    this.player.triggerStumble();
    this.currentSpeed = Math.max(this.baseSpeed, this.currentSpeed - 2.2);
    const caught = this.teacher.onPlayerStumble();
    if (caught) {
      this.triggerGameOver();
    } else {
      this.audio.playTeacherWhistle();
      this.audio.playTeacherBark();
      this.ui.showComicBubble(this.teacher.getRandomQuote(), 2600);
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    this.audio.stopBGM();
    this.audio.playTeacherWhistle();
    this.audio.playTeacherBark();
    this.player.setCaught();

    const finalScore = Math.floor(this.score);
    let isNewRecord = false;
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      isNewRecord = true;
      try {
        localStorage.setItem(STORAGE_HIGHSCORE_KEY, String(this.highScore));
      } catch {}
    }

    this.totalCoins += this.runCoins;
    try {
      localStorage.setItem(STORAGE_TOTAL_COINS_KEY, String(this.totalCoins));
    } catch {}

    const quote = this.teacher.getRandomGameOverQuote();
    this.ui.showGameOver(finalScore, this.runCoins, this.highScore, isNewRecord, quote);
  }

  animate(now) {
    requestAnimationFrame((t) => this.animate(t));
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;

    if (this.state === 'PLAYING') {
      const targetSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.score * 0.012);
      const effectiveSpeed = this.player.hasTurbo ? targetSpeed * 1.38 : targetSpeed;
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, effectiveSpeed, dt * 3);
      this.score += this.currentSpeed * dt * 0.85;

      this.corridor.update(dt, this.currentSpeed);
      this.player.update(dt, this.currentSpeed, this.audio);
      this.teacher.update(dt, this.player.group.position.x, this.currentSpeed, false);

      this.obstacles.update(dt, this.currentSpeed, this.player, this.collectibles, (obs) =>
        this.handleObstacleCollision(obs)
      );

      this.collectibles.update(
        dt,
        this.currentSpeed,
        this.player,
        this.teacher,
        this.audio,
        () => {
          this.runCoins += 1;
          this.score += 5;
        },
        (powerupInfo) => {
          this.ui.showComicBubble(`⚡ Dapat ${powerupInfo.label}!`, 2000);
        }
      );

      this.ui.updateHUD(
        this.score,
        this.runCoins,
        this.highScore,
        this.teacher.distance,
        this.teacher.maxDistance,
        this.collectibles.getActiveBuffList()
      );
    } else if (this.state === 'MENU') {
      this.corridor.update(dt, 4.5);
      this.player.update(dt, 9.0, null);
      this.teacher.update(dt, 0, 9.0, false);
    } else if (this.state === 'GAMEOVER') {
      this.player.update(dt, 0, null);
      this.teacher.update(dt, this.player.group.position.x, 0, true);
    }

    if (this.camera && this.player) {
      let shakeX = 0;
      let shakeY = 0;
      if (this.cameraShake > 0) {
        this.cameraShake = Math.max(0, this.cameraShake - dt * 1.8);
        shakeX = (Math.random() - 0.5) * this.cameraShake * 0.6;
        shakeY = (Math.random() - 0.5) * this.cameraShake * 0.6;
      }
      const targetCamX = this.player.group.position.x * 0.52 + shakeX;
      const targetCamY = this.cameraBaseY + this.player.y * 0.32 + shakeY;
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, dt * 10);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, dt * 10);
      this.camera.position.z = this.cameraBaseZ;
      this.camera.lookAt(
        this.player.group.position.x * 0.35,
        1.25 + this.player.y * 0.2,
        -6.0
      );
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__game = new KejaranPakWahidGame();
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
});
