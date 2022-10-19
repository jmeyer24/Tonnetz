let v = new function () {
  this.size = 27;
  this.segments = 8;
  this.noteSize = 2;
  this.vertices = [];
  this.normals = [];
  this.indices = [];
  this.majorColor = Array(3).fill([0.9, 0.3, 0]).flat();
  this.minorColor = Array(3).fill([0, 0.4, 0.8]).flat();
  this.standardColor = "#ddd";
  this.noteBin = document.createElement("div");
  this.defaultNoteIndices = [];
  this.noteIndices = [];
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
  this.chordOptions = ["o", "-", "", "+", "o7", "o/7", "o/maj7", "-7", "&#8209;maj7", "7", "maj7", "+7", "+maj7"];
  this.chordFunctions = [0]; // root = 0, fifth = 7, ...
  this.diatonics = [0, 2, 4, 5, 7, 9, 11, 12];
  this.scaling = [0, 1, 1.25, 1.5, 2]
  // this.speed = ["0s", "0.7s"]
  this.clicked = Array((this.segments + 1) ** 2).fill(false);
  this.menuFocus = Math.floor((this.segments + 1) ** 2 / 2);
  this.currentChord = Math.floor(13 * Math.random());
}

$(window).on('wheel', function (event) {
  // deltaY obviously records vertical scroll, deltaX and deltaZ exist too.
  // this condition makes sure it's vertical scrolling that happened
  if (v.clicked[v.menuFocus]) {
    markChord(v.menuFocus);
  }
  if (event.originalEvent.deltaY !== 0) {
    if (event.originalEvent.deltaY < 0) {
      v.currentChord += 1;
    }
    else {
      v.currentChord -= 1;
    }
    let l = v.chordOptions.length;
    v.currentChord = ((v.currentChord % l) + l) % l;
  }
  markChord(v.menuFocus);
  // $(".menuNote").html(`${v.notes[v.noteIndices[v.menuFocus]] + v.chordOptions[v.currentChord]}`)
});

const notesPerRow = v.segments + 1;
// map the half steps to the tonnetz
// const hsTonnetzMap = [0, -2 * notesPerRow - 1, 2, notesPerRow + 1, -notesPerRow, -1, -notesPerRow + 2, 1, notesPerRow, -notesPerRow - 1, notesPerRow + 2, -notesPerRow + 1];
const hsTonnetzMap = [0, -2 * (notesPerRow + 0.5), 2, notesPerRow + 1, -notesPerRow, -1, 2 * (notesPerRow + 1), 1, -2 * notesPerRow, 3 * (notesPerRow + 1), notesPerRow + 2, -notesPerRow + 1];

// fill the v.chordFunctions array with the half steps from root for the respective chord
const fillChordFunctions = chord => {
  v.chordFunctions = [0];

  switch (chord) {
    // triads
    case v.chordOptions[0]:
      minor3();
      tritonus();
      break;
    case v.chordOptions[1]:
      minor3();
      perfect5();
      break;
    case v.chordOptions[2]:
      major3();
      perfect5();
      break;
    case v.chordOptions[3]:
      major3();
      minor6();
      break;

    // seventh chords
    case v.chordOptions[4]:
      minor3();
      tritonus();
      major6();
      break;
    case v.chordOptions[5]:
      minor3();
      tritonus();
      minor7();
      break;
    case v.chordOptions[6]:
      minor3();
      tritonus();
      major7();
      break;
    case v.chordOptions[7]:
      minor3();
      perfect5();
      minor7();
      break;
    case v.chordOptions[8]:
      minor3();
      perfect5();
      major7();
      break;
    case v.chordOptions[9]:
      major3();
      perfect5();
      minor7();
      break;
    case v.chordOptions[10]:
      major3();
      perfect5();
      major7();
      break;
    case v.chordOptions[11]:
      major3();
      minor6();
      minor7();
      break;
    case v.chordOptions[12]:
      major3();
      minor6();
      major7();
      break;

    // just the root otherwise
    default:
      break;
  }
}

// chord functions
const minor2 = () => v.chordFunctions.push(1);
const major2 = () => v.chordFunctions.push(2);
const minor3 = () => v.chordFunctions.push(3);
const major3 = () => v.chordFunctions.push(4);
const perfect4 = () => v.chordFunctions.push(5);
const tritonus = () => v.chordFunctions.push(6);
const perfect5 = () => v.chordFunctions.push(7);
const minor6 = () => v.chordFunctions.push(8);
const major6 = () => v.chordFunctions.push(9);
const minor7 = () => v.chordFunctions.push(10);
const major7 = () => v.chordFunctions.push(11);

// utility functions
const pos = (i) => [i * 3, i * 3 + 1].map((i) => v.vertices[i]);
const col = (i) => isDiatonic(i) ? "#000" : "#fff";
const isDiatonic = (i) => v.diatonics.includes(i);
const backgroundCol = (i) => isDiatonic(i) ? "#fff" : "#000";
const clickCol = (i) => isDiatonic(i) ? "#5a4" : "#5a4";

// main variables
let camera, scene, renderer;
let mesh;

initScene();
initTonnetz();
drawTonnetz();
drawNoteNames();
initMenu();
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
  scene.background = new THREE.Color(v.standardColor);

  //

  const light = new THREE.HemisphereLight();
  scene.add(light);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

//

function initTonnetz() {
  // generate vertices and normals for a simple grid geometry
  v.vertices = [];
  v.normals = [];
  v.indices = [];

  for (let i = 0; i <= v.segments; i++) {
    // const y = v.size * (i / v.segments - 1 / 2);
    const y = v.size * (i / v.segments - 1 / 2) * Math.sqrt(0.75);

    for (let j = 0; j <= v.segments; j++) {
      const x = v.size * ((j - i / 2) / v.segments - 1 / 4);

      v.vertices.push(x, -y, 0);
      v.normals.push(0, 0, 1);
    }
  }

  // generate indices (data for element array buffer)
  for (let i = 0; i < v.segments; i++) {
    for (let j = 0; j < v.segments; j++) {
      const a = i * (notesPerRow) + (j + 1);
      const b = i * (notesPerRow) + j;
      const c = (i + 1) * (notesPerRow) + j;
      const d = (i + 1) * (notesPerRow) + (j + 1);

      // generate two faces (triangles) per iteration
      v.indices.push(a, b, d); // face one
      v.indices.push(b, c, d); // face two
    }
  }

  calculateNoteIndices();
  updateNoteIndices();
}

function calculateNoteIndices() {
  // compute nodeIndices, e.g. which circle represents which note
  const n = v.notes.length;
  v.defaultNoteIndices = [0];
  for (let i = 1; i < (notesPerRow) ** 2; i++) {
    v.defaultNoteIndices.push(
      // when we are at a new row in the tonnetz
      // compute the new start of the row
      // else go to the fifth (7 halfsteps)
      (!(i % (notesPerRow))
        ? (i / (notesPerRow)) * 8
        : v.defaultNoteIndices[i - 1] + 7) % n
    );
  }
}

//

function updateNotePattern() {
  updateNoteIndices();
  drawNoteNames();
  initMenu();
}

function updateNoteIndices() {
  // reorder by offset!
  const n = v.notes.length;
  v.noteIndices = v.defaultNoteIndices.map(value => (((value + v.offset) % n) + n) % n);
}

//

function drawTonnetz() {
  // draw the plane
  for (let i = 0; i < 2 * v.segments ** 2; i++) {
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

}

function drawNoteNames() {
  // create div for the noteBin
  $("#noteBin").remove()
  $("body").append($("<div>").attr("id", "noteBin").addClass("noteBin"))

  // create the notes on the tonnetz
  for (let i = 0; i < (notesPerRow) ** 2; i++) {
    const noteInd = v.noteIndices[i]

    // TODO: resolve this issue
    const whatisthis = 31.8;

    // add a note to the noteBin
    $("#noteBin").append(
      $("<div>")
        // make it of class note
        .addClass("note")
        // style the note according to diatonic or not
        // .css('--noteScaling', 1)
        .css('--color', col(noteInd))
        .css('--background-color', backgroundCol(noteInd))
        .css('--left', `${window.innerWidth / 2 + pos(i)[0] * whatisthis}px`)
        .css('--top', `${window.innerHeight / 2 - pos(i)[1] * whatisthis}px`)
        .css('--width', `${v.noteSize}em`)
        .css('--height', `${v.noteSize}em`)
        // mouseclick events: open and center menu on clicked note
        .click(
          () => {
            if (v.clicked[v.menuFocus]) {
              markChord(v.menuFocus);
            }
            v.menuFocus = i;
            $("#menu")
              .css("--noteScaling", v.scaling[1])
              // center the menu on the clicked note
              .css('--left', `${window.innerWidth / 2 + pos(v.menuFocus)[0] * whatisthis}px`)
              .css('--top', `${window.innerHeight / 2 - pos(v.menuFocus)[1] * whatisthis}px`)
            // .css("--transitionSpeed", v.speed[1])
            // .css("transform", `scale(${v.scaling[4]})`);
            $(".menuNote")
              // change to respective note name
              // .html(v.notes[v.noteIndices[v.menuFocus]])
              // .css("--noteScaling", v.scaling[2])
              // reverse coloring
              .css('--color', col(v.noteIndices[v.menuFocus]))
              .css('--background-color', backgroundCol(v.noteIndices[v.menuFocus]))
            // expand the menu
            // color the chord
            markChord(v.menuFocus);
          }
        )
        // add the note name
        .append(document.createTextNode(v.notes[noteInd]))
    );
  }
}

function markChord(i) {
  // write chord name
  // if (v.clicked[i]) {
  $(".menuNote").html(`${v.notes[v.noteIndices[v.menuFocus]] + v.chordOptions[v.currentChord]}`)
  // }

  // following line is the same as i!!!
  // const currentInd = Array.from(v.noteBin.children).indexOf(element);

  // get the array of halfsteps from the root
  fillChordFunctions(v.chordOptions[v.currentChord]);

  // TODO: restrictions to the tonnetz, as indices go out of bounds
  // root
  // v.chordFunctions = [i];
  // minor second
  // major second
  // minor third
  // major third
  // if (i > v.segments) {
  //   v.chordFunctions.push(i - (notesPerRow));
  // }
  // fourth
  // fifth
  // if (i % (notesPerRow) < v.segments) {
  //   v.chordFunctions.push(i + 1);
  // }
  // minor sixth
  // major sixth
  // minor seventh
  // major seventh

  // color the current chord
  v.chordFunctions.map(i => hsTonnetzMap[i]).forEach((j) => {
    if (i + j < (notesPerRow) ** 2) {
      highlight(i + j);
    }
  });
}

function highlight(i) {
  // $(`#noteBin div:nth-child(${i + 1})`).css("background-color", v.clicked[i] ? backgroundCol(v.noteIndices[i]) : clickCol(v.noteIndices[i]));
  // $(`#noteBin div:nth-child(${i + 1})`).css(v.clicked[i]?{
  //   "border-width": "3px",
  //   "border-style": "solid",
  //   "border-color": "var(--standardColor)"
  // });
  $(`#noteBin div:nth-child(${i + 1})`).toggleClass("chord")
  v.clicked[i] = !v.clicked[i];
}

//

function initMenu() {
  const whatisthis = 31.8;

  $("#menu").remove();

  // TODO: markChord(i) after menu selection
  $("body").append(
    $("<div>")
      .attr("id", "menu")
      .addClass("menu")
      .css('--left', `${window.innerWidth / 2 + pos(v.menuFocus)[0] * whatisthis}px`)
      .css('--top', `${window.innerHeight / 2 - pos(v.menuFocus)[1] * whatisthis}px`)
    // .css('--menuWidth', `${v.noteSize}em`)
    // .css('--menuHeight', `${v.noteSize}em`)
  );

  // TODO: establish links and respective chords (use markChord() again)
  // ["major third", "minor third"].forEach((element) => {
  // // v.chordOptions.forEach((element) => {
  //   // TODO: add respective function for updating noteFunctions on click
  //   $("#menu").append($("<div>").addClass("menuPart").text(element))
  // });

  // create the visual center note of the menu
  // TODO: resolve this issue
  // const noteInd = v.noteIndices[v.menuFocus];
  // let el = document.createElement("div");
  // style the note according to diatonic or not
  // $(el)
  //   .addClass("menuNote")
  //   .css('--noteScaling', 1)
  //   .css('--color', "#00f")
  //   .css('--background-color', "#f00")
  //   // .css('--color', col(noteInd))
  //   // .css('--background-color', backgroundCol(noteInd))
  //   .css('--left', `${window.innerWidth / 2 + pos(v.menuFocus)[0] * whatisthis}px`)
  //   .css('--top', `${window.innerHeight / 2 - pos(v.menuFocus)[1] * whatisthis}px`)
  //   .css('--width', `${v.noteSize}em`)
  //   .css('--height', `${v.noteSize}em`)
  //   .text("test")

  $("#menu")
    // add the menuFocus note as extra note
    .append(
      $("<div>")
        .addClass("menuNote")
        .css('--width', `${v.noteSize}em`)
        .css('--height', `${v.noteSize}em`)
        // write the note name: update it every click
        .append(document.createTextNode(v.notes[v.noteIndices[v.menuFocus]]))
    )
    // shrink the menu on mouse click and on mouse leave
    .click(() => {
      markChord(v.menuFocus)
      // $("#menu")
      //   // .css("--transitionSpeed", v.speed[0])
      //   .css("--noteScaling", v.scaling[1])
    })
  // .hover(
  //   () => { markChord(v.menuFocus) },
  //   () => {
  //     // $("#menu")
  //     // // .css("--noteScaling", v.scaling[0])
  //     // // .css("--transitionSpeed", v.speed[0])
  //   }
  // )
}

//

function initGui() {
  const gui = new dat.gui.GUI();

  gui.add(v, "offset", 0, 11, 1).name("Tonnetz Center").onFinishChange(updateNotePattern);
  // gui.add(v, "size", 10, 28, 1).name("Scale Plane").onFinishChange(drawTonnetz);
  // gui.add(v, "segments", 4, 15, 1).name("Tesselation").onChange(drawTonnetz);
}

//

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  drawNoteNames();
  initMenu();
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