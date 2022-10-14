let camera, scene, renderer;

let mesh;

let notes = [
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
];

init();
animate();

function init() {
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

  const geometry = new THREE.BufferGeometry();

  const indices = [];

  const vertices = [];
  const normals = [];
  const colors = [];

  const size = 28;
  const whatisthis = 31.8;
  const segments = 12;

  const segmentSize = size / segments;

  // generate vertices, normals and color data for a simple grid geometry

  for (let i = 0; i <= segments; i++) {
    const y = i * segmentSize - size / 2;

    for (let j = 0; j <= segments; j++) {
      const x = (j - i / 2) * segmentSize - size / 4;

      vertices.push(x, -y, 0);
      normals.push(0, 0, 1);
    }
  }

  // generate indices (data for element array buffer)

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + (j + 1);
      const b = i * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + j;
      const d = (i + 1) * (segments + 1) + (j + 1);

      // generate two faces (triangles) per iteration
      indices.push(a, b, d); // face one
      indices.push(b, c, d); // face two
    }
  }
  let flatColors1 = [];
  let flatColors2 = [];
  for (let i = 0; i < 3; i++) {
    flatColors1.push(1, 0.3, 0);
    flatColors2.push(0, 0.3, 0.7);
  }

  //

  for (let i = 0; i < 2 * segments * segments; i++) {
    let ind = indices.slice(i * 3, (i + 1) * 3);

    let geometry = new THREE.BufferGeometry();
    geometry.setIndex([0, 1, 2]);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        ind
          .map((i) => [i * 3, i * 3 + 1, i * 3 + 2].map((j) => vertices[j]))
          .flat(),
        3
      )
    );
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(
        ind
          .map((i) => [i * 3, i * 3 + 1, i * 3 + 2].map((j) => normals[j]))
          .flat(),
        3
      )
    );
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(i % 2 ? flatColors1 : flatColors2, 3)
    );

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  }

  let noteIndices = [0];
  for (let i = 1; i < (segments + 1) ** 2; i++) {
    noteIndices.push(
      // when we are at a new row in the tonnetz
      // compute the new start of the row
      // else go to the fifth (7 halfsteps)
      (!(i % (segments + 1))
        ? (i / (segments + 1)) * 8
        : noteIndices[i - 1] + 7) % notes.length
    );
  }
  console.log(noteIndices);
  for (let i = 0; i < (segments + 1) ** 2; i++) {
    let ind = noteIndices[i];
    let pos = [i * 3, i * 3 + 1, i * 3 + 2].map((i) => vertices[i]);
    let thisCol = [0, 2, 4, 5, 7, 9, 11, 12].includes(ind) ? "#fff" : "#000";
    let thisColText = [0, 2, 4, 5, 7, 9, 11, 12].includes(ind)
      ? "#000"
      : "#fff";

    const cgeometry = new THREE.CircleGeometry(size / 35, 32);
    const cmaterial = new THREE.MeshBasicMaterial({ color: thisCol });
    const circle = new THREE.Mesh(cgeometry, cmaterial);
    circle.position.set(pos[0], pos[1], pos[2]);
    scene.add(circle);

    const el = document.createElement("div");
    el.classList.add("note");
    el.style.left = `${window.innerWidth / 2 + pos[0] * whatisthis}px`;
    el.style.top = `${window.innerHeight / 2 - pos[1] * whatisthis}px`;

    const noteString = document.createTextNode(notes[ind]);
    el.appendChild(noteString);
    el.style.color = thisColText;

    document.body.appendChild(el);
  }

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

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
