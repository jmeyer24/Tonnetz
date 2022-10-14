let v = new function(){
  this.size = 28;
  this.segments = 8;
  this.circleRatio = 1/35;
  this.vertices = [];
  this.normals = [];
  this.indices = [];
  this.majorColor = Array(3).fill([1, 0.3, 0]).flat();
  this.minorColor = Array(3).fill([0, 0.3, 0.7]).flat();
  this.circles;
  this.noteIndices = [0];
  this.offset = 0;
this.notes = [
  "C",
  "Db\nC#",
  "D",
  "Eb\nD#",
  "E",
  "F",
  "Gb\nF#",
  "G",
  "Ab\nG#",
  "A",
  "Bb\nA#",
  "B",
]
this.diatonics = [0, 2, 4, 5, 7, 9, 11, 12];
}

// create div for the circles
el = document.createElement("div");
document.body.appendChild(el);
v.circles = el;


let camera, scene, renderer;
let mesh;

initScene();
initGui();
animate();

function initScene() {
  //

  camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    1,
    3500
  );
  camera.position.z = 64;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  //

  const light = new THREE.HemisphereLight();
  scene.add(light);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);

  drawTonnetz();
}

//

function drawTonnetz(){
  scene.remove.apply(scene, scene.children);

  // generate vertices and normals for a simple grid geometry
  v.vertices = [];
  v.normals = [];
  v.indices = [];
  
  for (let i = 0; i <= v.segments; i++) {
    const y = v.size * (i/v.segments - 1/2);

    for (let j = 0; j <= v.segments; j++) {
      const x = v.size * ((j - i / 2) / v.segments - 1/4);

      v.vertices.push(x, -y, 0);
      v.normals.push(0, 0, 1);
    }
  }

  // generate indices (data for element array buffer)
  for (let i = 0; i < v.segments; i++) {
    for (let j = 0; j < v.segments; j++) {
      const a = i * (v.segments + 1) + (j + 1);
      const b = i * (v.segments + 1) + j;
      const c = (i + 1) * (v.segments + 1) + j;
      const d = (i + 1) * (v.segments + 1) + (j + 1);

      // generate two faces (triangles) per iteration
      v.indices.push(a, b, d); // face one
      v.indices.push(b, c, d); // face two
    }
  }

  // draw the plane
  for (let i = 0; i < 2 * v.segments**2; i++) {
    let ind = v.indices.slice(i * 3, (i + 1) * 3);

    let geometry = new THREE.BufferGeometry();
    geometry.setIndex([0, 1, 2]);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        ind
          .map((i) => [i * 3, i * 3 + 1, i * 3 + 2].map((j) => v.vertices[j]))
          .flat(),
        3
      )
    );
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(
        ind
          .map((i) => [i * 3, i * 3 + 1, i * 3 + 2].map((j) => v.normals[j]))
          .flat(),
        3
      )
    );
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(i % 2 ? v.majorColor : v.minorColor, 3)
    );

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  }
  
  drawCircles();
}

function drawCircles() {
  let n = v.notes.length;

  while (v.circles.firstChild) {
    v.circles.removeChild(v.circles.lastChild);
  }

  // compute nodeIndices, e.g. which circle represents which note
  v.noteIndices = [0];
  for (let i = 1; i < (v.segments + 1) ** 2; i++) {
    v.noteIndices.push(
      // when we are at a new row in the tonnetz
      // compute the new start of the row
      // else go to the fifth (7 halfsteps)
      (!(i % (v.segments + 1))
        ? (i / (v.segments + 1)) * 8
        : v.noteIndices[i - 1] + 7) % n
    );
  }
  // reorder by offset!
  v.noteIndices = v.noteIndices.map(value => (((value + v.offset) % n) + n) % n);
  console.log(v.noteIndices);

  // draw circles and their notes
  for (let i = 0; i < (v.segments + 1) ** 2; i++) {
    let ind = v.noteIndices[i];
    let pos = [i * 3, i * 3 + 1, i * 3 + 2].map((i) => v.vertices[i]);
    let thisCol = v.diatonics.includes(ind) ? "#fff" : "#000";
    let thisColText = v.diatonics.includes(ind)
      ? "#000"
      : "#fff";

    const cgeometry = new THREE.CircleGeometry(v.size * v.circleRatio, 32);
    const cmaterial = new THREE.MeshBasicMaterial({ color: thisCol });
    const circle = new THREE.Mesh(cgeometry, cmaterial);
    circle.position.set(pos[0], pos[1], pos[2]);
    scene.add(circle);

    const whatisthis = 31.8;
    const el = document.createElement("div");
    el.classList.add("note");
    el.style.left = `${window.innerWidth / 2 + pos[0] * whatisthis}px`;
    el.style.top = `${window.innerHeight / 2 - pos[1] * whatisthis}px`;

    const noteString = document.createTextNode(v.notes[ind]);
    el.appendChild(noteString);
    el.style.color = thisColText;

    v.circles.appendChild(el);
  }
}

//

function initGui(){
  const gui = new dat.gui.GUI();

  gui.add(v, "offset", 0, 11, 1).name("Tonnetz Center").onFinishChange(drawTonnetz);
  // gui.add(v, "size", 10, 28, 1).name("Scale Plane").onFinishChange(drawTonnetz);
  // gui.add(v, "segments", 4, 15, 1).name("Tesselation").onChange(drawTonnetz);
  // gui.add(v, "circleRatio", 1/100, 1/10, 1/100).name("Circle Fraction").onFinishChange(drawTonnetz);
}

//

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  const time = Date.now() * 0.001;
  renderer.render(scene, camera);
}