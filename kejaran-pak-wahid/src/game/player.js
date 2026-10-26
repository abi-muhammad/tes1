import * as THREE from 'three';

export const LANE_WIDTH = 2.2;
export const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // State pergerakan
    this.currentLane = 1; // 0: Kiri, 1: Tengah, 2: Kanan
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

    // Power-up flags
    this.hasSuperJump = false;
    this.hasTurbo = false;
    this.hasMagnet = false;

    this.buildCharacterMesh();
    this.scene.add(this.group);
  }

  buildCharacterMesh() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfdba74 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Putih SMA
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x64748b }); // Abu-abu SMA
    const tieMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const bagMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 }); // Tas Ransel Biru
    const bagPocketMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });

    // Torso (Seragam Putih)
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.82, 0.38), shirtMat);
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    // Dasi Abu-abu & Badge OSIS di dada
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.04), tieMat);
    tie.position.set(0, 0.08, -0.2);
    this.torso.add(tie);

    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.11, 0.04),
      new THREE.MeshLambertMaterial({ color: 0xf59e0b })
    );
    badge.position.set(-0.18, 0.14, -0.2);
    this.torso.add(badge);

    // Tas Sekolah di Punggung
    this.backpack = new THREE.Group();
    const bagMain = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.64, 0.28), bagMat);
    bagMain.castShadow = true;
    const bagPocket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.1), bagPocketMat);
    bagPocket.position.set(0, -0.1, 0.16);
    this.backpack.add(bagMain, bagPocket);
    this.backpack.position.set(0, 0.04, 0.3);
    this.torso.add(this.backpack);

    // Kepala & Rambut Anak SMA
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

    // Lengan Kiri & Kanan
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

    // Kaki Kiri & Kanan (Celana Abu-abu + Sepatu Hitam)
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.18, 0.74, 0);
    const leftPants = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.64, 0.26), pantsMat);
    leftPants.position.y = -0.32;
    leftPants.castShadow = true;
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.38), shoeMat);
    leftShoe.position.set(0, -0.66, -0.05);
    this.leftLegPivot.add(leftPants, leftShoe);
    this.bodyGroup.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.18, 0.74, 0);
    const rightPants = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.64, 0.26), pantsMat);
    rightPants.position.y = -0.32;
    rightPants.castShadow = true;
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.38), shoeMat);
    rightShoe.position.set(0, -0.66, -0.05);
    this.rightLegPivot.add(rightPants, rightShoe);
    this.bodyGroup.add(this.rightLegPivot);

    // Aura Efek Turbo / Magnet
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
    this.bodyGroup.scale.set(1, 1, 1);
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
    // Jika sedang di udara, swipe bawah mempercepat turun (fast-drop) lalu langsung meluncur!
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

  // Mendapatkan kotak kolisi (AABB) karakter berdasarkan aksi saat ini
  getHitbox() {
    const height = this.isSliding ? 0.85 : 1.75;
    const centerY = this.y + height * 0.5;
    return {
      minX: this.group.position.x - 0.34,
      maxX: this.group.position.x + 0.34,
      minY: this.y,
      maxY: this.y + height,
      minZ: this.group.position.z - 0.28,
      maxZ: this.group.position.z + 0.28,
      centerY
    };
  }

  update(dt, speed, audio) {
    // Interpolasi perpindahan jalur yang mulus & responsif
    const dx = this.targetX - this.group.position.x;
    this.group.position.x += dx * Math.min(1, dt * 16);

    // Kemiringan tubuh sedikit saat pindah jalur
    this.bodyGroup.rotation.z = THREE.MathUtils.lerp(
      this.bodyGroup.rotation.z,
      -dx * 0.14,
      Math.min(1, dt * 14)
    );

    if (this.isCaught) {
      // Animasi panik saat tertangkap Pak Wahid
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

    // Fisika Lompatan
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

    // Timer Meluncur (Slide)
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Timer Tersandung (Stumble)
    if (this.stumbleTimer > 0) {
      this.stumbleTimer -= dt;
    }

    // Animasi Prosedural Berlari / Melompat / Meluncur
    const animSpeed = speed * 0.85;
    this.runCycle += dt * animSpeed;

    if (this.isSliding && this.y <= 0.05) {
      // Pose meluncur rendah melewati bawah palang
      this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, -1.15, dt * 18);
      this.bodyGroup.position.y = THREE.MathUtils.lerp(this.bodyGroup.position.y, -0.55, dt * 18);
      this.leftLegPivot.rotation.x = -0.4;
      this.rightLegPivot.rotation.x = 0.25;
      this.leftArmPivot.rotation.x = -0.6;
      this.rightArmPivot.rotation.x = -0.6;
    } else if (this.isJumping) {
      // Pose melompat di udara
      this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, 0.15, dt * 12);
      this.bodyGroup.position.y = THREE.MathUtils.lerp(this.bodyGroup.position.y, 0, dt * 15);
      this.leftLegPivot.rotation.x = 0.65;
      this.rightLegPivot.rotation.x = -0.45;
      this.leftArmPivot.rotation.x = 2.2;
      this.rightArmPivot.rotation.x = 2.2;
    } else {
      // Pose berlari normal di lorong kelas
      this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, 0.12, dt * 14);
      const bob = Math.abs(Math.sin(this.runCycle)) * 0.09;
      this.bodyGroup.position.y = bob;

      const swing = Math.sin(this.runCycle) * 0.85;
      this.leftLegPivot.rotation.x = swing;
      this.rightLegPivot.rotation.x = -swing;
      this.leftArmPivot.rotation.x = -swing * 0.9;
      this.rightArmPivot.rotation.x = swing * 0.9;
      this.backpack.rotation.z = Math.sin(this.runCycle) * 0.06;

      // Suara langkah kaki sinkron dengan gerak kaki
      const currentHalfCycle = Math.floor(this.runCycle / Math.PI);
      if (currentHalfCycle !== this.stepPhase) {
        this.stepPhase = currentHalfCycle;
        if (audio) audio.playStep(currentHalfCycle % 2 === 0);
      }
    }

    // Goyangan saat tersandung
    if (this.stumbleTimer > 0) {
      this.head.rotation.z = Math.sin(this.stumbleTimer * 35) * 0.28;
    } else {
      this.head.rotation.z = 0;
      this.head.rotation.y = 0;
    }

    // Update cincin aura power-up
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
