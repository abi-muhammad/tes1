import * as THREE from 'three';
import { AudioManager } from './game/audio.js';
import { Player } from './game/player.js';
import { Teacher } from './game/teacher.js';
import { CorridorManager } from './game/corridor.js';
import { ObstacleManager } from './game/obstacles.js';
import { CollectiblesManager } from './game/powerups.js';
import { UIManager } from './game/ui.js';

const STORAGE_HIGHSCORE_KEY = 'kpw_highscore';
const STORAGE_TOTAL_COINS_KEY = 'kpw_total_coins';
const STORAGE_QUALITY_KEY = 'kpw_graphics_quality';

class KejaranPakWahidGame {
  constructor() {
    this.state = 'MENU'; // MENU | PLAYING | PAUSED | GAMEOVER
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
    // Deteksi sederhana RAM / jumlah core untuk perangkat Android
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

    // Pencahayaan ringan & hangat khas lorong sekolah siang hari
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 0.85);
    this.dirLight.position.set(6, 14, 10);
    this.dirLight.shadow.mapSize.width = 512;
    this.dirLight.shadow.mapSize.height = 512;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 35;
    this.scene.add(this.dirLight);

    // Entitas Permainan
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
    // Pada layar Portrait Android (aspect < 1), perluas FOV dan mundurkan kamera sedikit
    // agar ketiga jalur lari (kiri, tengah, kanan) tetap terlihat utuh dan nyaman!
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

    // Otomatis jeda permainan ketika tab browser Android masuk ke background
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
    switch (action) {
      case 'LEFT':
        this.player.moveLeft(this.audio);
        break;
      case 'RIGHT':
        this.player.moveRight(this.audio);
        break;
      case 'JUMP':
        this.player.jump(this.audio);
        break;
      case 'SLIDE':
        this.player.slide(this.audio);
        break;
      default:
        break;
    }
  }

  handleObstacleCollision(obs) {
    this.audio.playCrash();
    this.cameraShake = 0.45;

    // Jika menabrak lemari tinggi secara frontal, langsung tertangkap Pak Wahid
    if (obs.isSolidWall) {
      this.teacher.distance = 0;
      this.triggerGameOver();
      return;
    }

    // Jika menabrak meja/tas/palang, pemain tersandung dan Pak Wahid mendekat drastis!
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
      // Kecepatan bertambah bertahap seiring jarak
      const targetSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.score * 0.012);
      const effectiveSpeed = this.player.hasTurbo ? targetSpeed * 1.38 : targetSpeed;
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, effectiveSpeed, dt * 3);

      // Tambah skor berdasarkan jarak lari
      this.score += this.currentSpeed * dt * 0.85;

      this.corridor.update(dt, this.currentSpeed);
      this.player.update(dt, this.currentSpeed, this.audio);
      this.teacher.update(dt, this.player.group.position.x, this.currentSpeed, false);

      this.obstacles.update(
        dt,
        this.currentSpeed,
        this.player,
        this.collectibles,
        (obs) => this.handleObstacleCollision(obs)
      );

      this.collectibles.update(
        dt,
        this.currentSpeed,
        this.player,
        this.teacher,
        this.audio,
        () => {
          this.runCoins += 1;
          this.score += 5; // Bonus poin uang jajan
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
      // Animasi kamera idle di lorong kelas saat di menu
      this.corridor.update(dt, 4.5);
      this.player.update(dt, 9.0, null);
      this.teacher.update(dt, 0, 9.0, false);
    } else if (this.state === 'GAMEOVER') {
      this.player.update(dt, 0, null);
      this.teacher.update(dt, this.player.group.position.x, 0, true);
    }

    // Update Kamera Third-Person mengikuti siswa
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

// Inisialisasi Game saat DOM siap
window.addEventListener('DOMContentLoaded', () => {
  window.__game = new KejaranPakWahidGame();

  // Registrasi Service Worker PWA secara opsional & aman (menggunakan path relatif './sw.js')
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Kegagalan SW tidak boleh mengganggu jalannya game
      });
    });
  }
});
