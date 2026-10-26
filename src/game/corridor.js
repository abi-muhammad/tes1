import * as THREE from 'three';

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

// Membuat tekstur Canvas untuk papan nama kelas, poster pendidikan, dan papan tata tertib
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

// Tekstur lantai keramik sekolah (grid putih krem)
function createCeramicFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 256, 256);

  // Pola ubin keramik 4x4
  const step = 64;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      ctx.fillStyle = (x / step + y / step) % 2 === 0 ? '#f8fafc' : '#e2e8f0';
      ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
    }
  }

  // Nat keramik
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

export class CorridorManager {
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

    // Dinding sekolah cat krem atas & hijau muda/toska bawah khas sekolah negeri Indonesia
    this.wallUpperMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
    this.wallLowerMat = new THREE.MeshLambertMaterial({ color: 0x0d9488 });
    this.pillarMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    this.ceilingMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    this.woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    this.glassMat = new THREE.MeshLambertMaterial({ color: 0xbae6fd });

    // Tekstur Papan Nama Kelas (XI A1, XI A2, dst.)
    this.signTextures = CLASS_NAMES.map((name) =>
      createLabelTexture(name, 'SMA HARAPAN BANGSA', '#0f172a', '#ffffff', '#facc15')
    );

    // Tekstur Poster Pendidikan & Papan Tata Tertib
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

    // 1. Lantai Keramik
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_WIDTH, SEGMENT_LENGTH),
      this.floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Garis pemandu jalur tipis di lantai keramik
    const lineGeo = new THREE.PlaneGeometry(0.06, SEGMENT_LENGTH);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    [-1.1, 1.1].forEach((lx) => {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(lx, 0.01, 0);
      group.add(line);
    });

    // 2. Plafon & Lampu Neon Lorong
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

    // 3. Dinding Kelas Kiri & Kanan
    [-1, 1].forEach((side) => {
      const wallX = side * halfW;

      // Dinding Bawah (Hijau Toska Sekolah)
      const lowerWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 1.6, SEGMENT_LENGTH),
        this.wallLowerMat
      );
      lowerWall.position.set(wallX, 0.8, 0);
      group.add(lowerWall);

      // Dinding Atas (Krem Terang)
      const upperWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, WALL_HEIGHT - 1.6, SEGMENT_LENGTH),
        this.wallUpperMat
      );
      upperWall.position.set(wallX, 1.6 + (WALL_HEIGHT - 1.6) / 2, 0);
      group.add(upperWall);

      // Pilar Beton Lorong
      [-SEGMENT_LENGTH / 2 + 0.3, 0, SEGMENT_LENGTH / 2 - 0.3].forEach((pz) => {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, WALL_HEIGHT, 0.45),
          this.pillarMat
        );
        pillar.position.set(wallX - side * 0.1, WALL_HEIGHT / 2, pz);
        group.add(pillar);
      });

      // Pintu Kayu Kelas
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.5, 1.3), this.woodMat);
      door.position.set(wallX - side * 0.08, 1.25, -4.2);
      group.add(door);

      // Jendela Kaca Kelas dengan Kusen Kayu
      [1.5, 5.2].forEach((wz) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.5, 2.2), this.woodMat);
        frame.position.set(wallX - side * 0.08, 2.2, wz);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.25, 1.95), this.glassMat);
        glass.position.set(wallX - side * 0.09, 2.2, wz);
        group.add(frame, glass);
      });
    });

    // 4. Papan Nama Kelas Menggantung (XI A1, XI A2, dst.)
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

    // 5. Poster Pendidikan & Papan Tata Tertib di Dinding
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

    // 6. Properti Pinggir Lorong (Tempat Sampah Sekolah & Siswa Lain di Tepi Kelas)
    this.addSideProps(group, halfW, index);

    return {
      group,
      leftSignMat,
      rightSignMat
    };
  }

  addSideProps(group, halfW, index) {
    // Tempat sampah hijau/kuning di pinggir tembok luar jalur lari
    const binGreenMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
    const binYellowMat = new THREE.MeshLambertMaterial({ color: 0xeab308 });

    const greenBin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.65, 8), binGreenMat);
    greenBin.position.set(-halfW + 0.55, 0.32, 3.4);
    const yellowBin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.65, 8), binYellowMat);
    yellowBin.position.set(-halfW + 0.55, 0.32, 4.0);
    group.add(greenBin, yellowBin);

    // Siswa SMA lain yang sedang berdiri di tepi dinding kelas menonton kejaran
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

      // Jika segmen sudah lewat di belakang kamera, pindahkan ke ujung depan lorong (Object Pooling)
      if (seg.group.position.z > SEGMENT_LENGTH) {
        let minZ = Infinity;
        for (let j = 0; j < this.segments.length; j++) {
          if (this.segments[j].group.position.z < minZ) {
            minZ = this.segments[j].group.position.z;
          }
        }
        seg.group.position.z = minZ - SEGMENT_LENGTH;

        // Perbarui papan nama kelas secara bergantian (XI A1, XI A2, dst.)
        this.classIndex++;
        seg.leftSignMat.map = this.signTextures[this.classIndex % this.signTextures.length];
        seg.rightSignMat.map = this.signTextures[(this.classIndex + 1) % this.signTextures.length];
      }
    }

    // Animasi siswa penonton melambaikan tangan di pinggir kelas
    const time = performance.now() * 0.006;
    for (let i = 0; i < this.bystanders.length; i++) {
      const b = this.bystanders[i];
      b.rightArm.rotation.z = 2.4 + Math.sin(time + b.phase) * 0.35;
    }
  }
}
