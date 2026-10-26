import * as THREE from 'three';
import { LANES } from './player.js';

// Tipe Rintangan Lorong Sekolah:
// 1. DESK_CHAIR (Meja & Kursi Kelas) -> Lompat atau pindah jalur
// 2. BAG_BOOKS (Tas Sekolah & Tumpukan Buku + Tempat Sampah) -> Lompat atau pindah jalur
// 3. HIGH_BANNER (Palang Piket / Spanduk Sekolah Tinggi) -> Meluncur (Slide) di kolongnya
// 4. TALL_LOCKER (Lemari Piala / Rak Tinggi) -> Wajib pindah jalur (atau lewat dengan Turbo)

export class ObstacleManager {
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
      // Meja belajar kayu + kursi sekolah
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.9), this.woodLightMat);
      top.position.y = 0.85;
      top.castShadow = true;
      group.add(top);

      [-0.65, 0.65].forEach((lx) => {
        [-0.35, 0.35].forEach((lz) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), this.woodMat);
          leg.position.set(lx, 0.425, lz);
          group.add(leg);
        });
      });

      // Buku di atas meja
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.28), this.bookMat1);
      book.position.set(-0.25, 0.94, 0);
      group.add(book);

      minY = 0;
      maxY = 0.98;
    } else if (type === 'BAG_BOOKS') {
      // Tas sekolah tergeletak + tumpukan buku paket + tempat sampah
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.68, 0.45), this.bagRedMat);
      bag.position.set(-0.32, 0.34, 0);
      bag.castShadow = true;

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
      // Palang Piket / Spanduk Kelas Tinggi (Pemain harus MELUNCUR di bawahnya!)
      const leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.35, 8), this.metalMat);
      leftPole.position.set(-0.82, 1.175, 0);
      const rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.35, 8), this.metalMat);
      rightPole.position.set(0.82, 1.175, 0);

      const board = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.95, 0.2), this.bannerMat);
      board.position.set(0, 1.72, 0);
      board.castShadow = true;

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.24), this.bannerStripeMat);
      stripe.position.set(0, 1.42, 0);

      group.add(leftPole, rightPole, board, stripe);
      // Kolong bawah bebas dari y = 0 sampai y = 1.12 -> Bisa dilewati dengan Slide (tinggi slide = 0.85)
      minY = 1.12;
      maxY = 2.3;
    } else if (type === 'TALL_LOCKER') {
      // Lemari Piala / Loker Besi Tinggi (Harus pindah jalur)
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.35, 0.85), this.lockerMat);
      cabinet.position.y = 1.175;
      cabinet.castShadow = true;

      const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.4, 8), this.goldMat);
      trophy.position.set(0, 1.5, -0.44);

      group.add(cabinet, trophy);
      minY = 0;
      maxY = 2.35;
      isSolidWall = true;
    }

    return {
      type,
      group,
      minY,
      maxY,
      isSolidWall,
      lane: 1,
      hit: false
    };
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
      const obs = this.activeObstacles.pop();
      this.releaseObstacle(obs);
    }
    this.spawnTimer = 0.6;
  }

  // Generator pola rintangan 3 jalur yang selalu adil (minimal 1 jalur aman atau bisa dilompati/diluncuri)
  spawnPattern(zPos, collectiblesManager) {
    const patterns = [
      // 1 rintangan acak
      ['DESK_CHAIR', null, null],
      [null, 'DESK_CHAIR', null],
      [null, null, 'BAG_BOOKS'],
      [null, 'HIGH_BANNER', null],
      ['HIGH_BANNER', null, 'DESK_CHAIR'],
      // 2 rintangan dengan variasi lompat & meluncur
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

    // Beri tahu manajer koin/powerup untuk menaruh koin di jalur yang selaras dengan rintangan
    if (collectiblesManager) {
      collectiblesManager.spawnForPattern(pattern, zPos);
    }
  }

  update(dt, speed, player, collectiblesManager, onCollision) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      // Jarak antar baris rintangan menyesuaikan kecepatan agar selalu adil
      const interval = Math.max(0.78, 1.58 - (speed - 13) * 0.035);
      this.spawnTimer = interval;
      this.spawnPattern(-78, collectiblesManager);
    }

    const pBox = player.getHitbox();
    const moveZ = speed * dt;

    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      obs.group.position.z += moveZ;

      // Efek mental jika dihantam saat Turbo aktif
      if (obs.hit && player.hasTurbo) {
        obs.group.position.y += dt * 10;
        obs.group.rotation.x += dt * 8;
      }

      // Cek tabrakan (AABB 3D)
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

      // Hapus dan kembalikan ke pool jika sudah lewat di belakang kamera
      if (obs.group.position.z > 10) {
        this.activeObstacles.splice(i, 1);
        this.releaseObstacle(obs);
      }
    }
  }
}
