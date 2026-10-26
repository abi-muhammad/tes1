import * as THREE from 'three';
import { LANES } from './player.js';

export const POWERUP_TYPES = {
  MAGNET: {
    id: 'MAGNET',
    label: '🧲 Magnet Jajan',
    duration: 9.0,
    color: 0xfacc15
  },
  SUPER_JUMP: {
    id: 'SUPER_JUMP',
    label: '👟 Sepatu Basket',
    duration: 9.0,
    color: 0x4ade80
  },
  TURBO: {
    id: 'TURBO',
    label: '🧋 Es Teh Turbo',
    duration: 5.5,
    color: 0x38bdf8
  }
};

export class CollectiblesManager {
  constructor(scene) {
    this.scene = scene;
    this.activeCoins = [];
    this.coinPool = [];
    this.activePowerups = [];
    this.powerupPool = [];

    this.activeBuffs = {
      MAGNET: 0,
      SUPER_JUMP: 0,
      TURBO: 0
    };

    this.coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.1, 12);
    this.coinMat = new THREE.MeshLambertMaterial({
      color: 0xfacc15,
      emissive: 0x854d0e
    });

    this.powerupGeo = new THREE.OctahedronGeometry(0.46, 0);
  }

  acquireCoin() {
    if (this.coinPool.length > 0) {
      const coin = this.coinPool.pop();
      coin.mesh.visible = true;
      coin.collected = false;
      return coin;
    }
    const mesh = new THREE.Mesh(this.coinGeo, this.coinMat);
    mesh.rotation.z = Math.PI / 2;
    this.scene.add(mesh);
    return { mesh, collected: false };
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
    return { typeKey, mesh, collected: false };
  }

  reset() {
    while (this.activeCoins.length > 0) {
      this.releaseCoin(this.activeCoins.pop());
    }
    while (this.activePowerups.length > 0) {
      const p = this.activePowerups.pop();
      p.mesh.visible = false;
      this.scene.remove(p.mesh);
    }
    this.activeBuffs.MAGNET = 0;
    this.activeBuffs.SUPER_JUMP = 0;
    this.activeBuffs.TURBO = 0;
  }

  // Dipanggil oleh ObstacleManager setiap baris rintangan muncul
  spawnForPattern(pattern, zPos) {
    // Cari jalur yang bukan TALL_LOCKER untuk menaruh deretan koin
    const candidateLanes = [0, 1, 2].filter((idx) => pattern[idx] !== 'TALL_LOCKER');
    if (candidateLanes.length === 0) return;

    const chosenLane = candidateLanes[Math.floor(Math.random() * candidateLanes.length)];
    const obsType = pattern[chosenLane];

    // Buat barisan 5 koin (melengkung ke atas jika di atas meja/tas, atau rendah jika di kolong spanduk)
    const coinCount = 5;
    for (let i = 0; i < coinCount; i++) {
      const coin = this.acquireCoin();
      const offsetZ = (i - 2) * 1.9;
      let y = 0.65;

      if (obsType === 'DESK_CHAIR' || obsType === 'BAG_BOOKS') {
        // Lengkungan lompatan di atas meja
        const arc = Math.cos(((i - 2) / 2.2) * (Math.PI / 2));
        y = 0.65 + arc * 1.45;
      } else if (obsType === 'HIGH_BANNER') {
        // Koin rendah di kolong spanduk
        y = 0.48;
      }

      coin.mesh.position.set(LANES[chosenLane], y, zPos + offsetZ);
      this.activeCoins.push(coin);
    }

    // Peluang 18% memunculkan Power-up di jalur lain yang kosong
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
    // Kurangi durasi power-up aktif
    Object.keys(this.activeBuffs).forEach((k) => {
      if (this.activeBuffs[k] > 0) {
        this.activeBuffs[k] = Math.max(0, this.activeBuffs[k] - dt);
      }
    });
    this.syncPlayerFlags(player);

    const moveZ = speed * dt;
    const playerPos = player.group.position;

    // Update Koin
    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];
      coin.mesh.position.z += moveZ;
      coin.mesh.rotation.y += dt * 4.5;

      // Tarikan Magnet Uang Jajan jika aktif
      if (player.hasMagnet && coin.mesh.position.z > -16 && coin.mesh.position.z < 3) {
        coin.mesh.position.x = THREE.MathUtils.lerp(coin.mesh.position.x, playerPos.x, dt * 11);
        coin.mesh.position.y = THREE.MathUtils.lerp(
          coin.mesh.position.y,
          playerPos.y + 0.9,
          dt * 11
        );
      }

      // Cek jarak ambil koin
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

    // Update Power-ups
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
