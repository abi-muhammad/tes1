import * as THREE from 'three';

export const TEACHER_QUOTES = [
  '"Heh! Ngapain nongkrong di depan kelas XI A1?!"',
  '"Berhenti kamu! Bajunya dimasukkan dulu!"',
  '"PRIIIT! Jam pelajaran kok malah santai di lorong!"',
  '"Sini kamu! Rambut gondrong, sepatu warna-warni!"',
  '"Jangan lari! Pak Wahid catat di buku poin BK!"',
  '"Awas ya! Nanti ikut Bapak bersihkan perpustakaan!"'
];

export const GAMEOVER_QUOTES = [
  '"Kamu ini ya! Jam pelajaran malah nongkrong di depan kelas XI A1! Ikut Bapak ke Ruang BK sekarang!"',
  '"Hosh... hosh... Bapak masih kuat lari tahu! Sekarang kerjakan 50 soal Matematika di meja piket!"',
  '"Ketangkap kan! Besok pagi berdiri di lapangan upacara sama teman-temanmu itu!"',
  '"Niat mau kabur ke kantin ya?! Masuk kelas sekarang, Pak Wahid yang ngajar jam pertama!"'
];

export class Teacher {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Jarak pengejaran dalam meter (0 = tertangkap, 20 = aman jauh)
    this.maxDistance = 20;
    this.distance = 12;
    this.runCycle = 0;

    this.buildTeacherMesh();
    this.scene.add(this.group);
  }

  buildTeacherMesh() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xfdba74 });
    const batikMat = new THREE.MeshLambertMaterial({ color: 0xb45309 }); // Seragam Khaki/Batik Guru
    const batikPatternMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const peciMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1c1917 });
    const rulerMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });

    // Torso Pak Wahid (Sedikit lebih berisi & berwibawa)
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.88, 0.44), batikMat);
    this.torso.position.y = 1.22;
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    // Motif Batik & Lencana Korpri/Nama Dada
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

    // Kepala Pak Wahid + Peci + Kacamata + Kumis Tebal Komedi
    this.head = new THREE.Group();
    this.head.position.set(0, 0.68, 0);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.54, 0.54), skinMat);
    headMesh.castShadow = true;

    // Peci Hitam
    const peci = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 0.58), peciMat);
    peci.position.set(0, 0.28, 0);

    // Kumis Tebal Melintang
    this.mustache = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.12), darkMat);
    this.mustache.position.set(0, -0.1, -0.26);

    // Kacamata Guru
    const glassFrame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.08), darkMat);
    glassFrame.position.set(0, 0.06, -0.26);

    this.head.add(headMesh, peci, this.mustache, glassFrame);
    this.torso.add(this.head);

    // Lengan Kiri & Kanan (Tangan Kanan memegang Penggaris Kayu / Buku Absen)
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

    // Penggaris Kayu Panjang khas Guru Disiplin
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.04), rulerMat);
    ruler.position.set(0, -0.58, -0.2);
    ruler.rotation.x = Math.PI / 3;
    this.rightArmPivot.add(rightArm, ruler);
    this.torso.add(this.rightArmPivot);

    // Kaki Pak Wahid
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
    this.distance = 8.5; // Mulai cukup dekat sehingga terlihat mengejar di awal
    this.runCycle = 0;
    this.group.position.set(0, 0, 3.8);
    this.group.rotation.y = 0;
  }

  // Dipanggil saat pemain menabrak rintangan ringan / tersandung
  onPlayerStumble() {
    this.distance = Math.max(0, this.distance - 7.5);
    return this.distance <= 0.5;
  }

  // Dipanggil saat pemain mengambil Turbo Es Teh
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
      // Pak Wahid berdiri di samping siswa sambil mengacungkan penggaris
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

    // Saat pemain berlari lancar tanpa menabrak, jarak aman bertambah perlahan
    this.distance = Math.min(this.maxDistance, this.distance + dt * 0.95);

    // Posisi Z di belakang kamera/pemain (pemain di Z = 0, kamera di Z = +6.5)
    // Ketika jarak Pak Wahid dekat (< 10m), Pak Wahid tampak jelas di layar mengejar tepat di belakang siswa!
    const targetZ = 1.4 + (this.distance / this.maxDistance) * 5.2;
    this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, targetZ, dt * 6);
    this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, playerX, dt * 6.5);
    this.group.rotation.y = Math.PI; // Menghadap ke arah lari siswa (-Z)

    // Animasi lari komedi Pak Wahid
    this.runCycle += dt * (speed * 0.92);
    const swing = Math.sin(this.runCycle) * 0.95;
    this.bodyGroup.position.y = Math.abs(Math.sin(this.runCycle)) * 0.11;
    this.leftLegPivot.rotation.x = swing;
    this.rightLegPivot.rotation.x = -swing;
    this.leftArmPivot.rotation.x = -swing;
    // Tangan kanan mengacungkan penggaris sambil lari
    this.rightArmPivot.rotation.x = -0.9 + Math.sin(this.runCycle) * 0.45;
    this.mustache.rotation.z = Math.sin(this.runCycle * 2) * 0.08;
  }
}
