var scene, camera, renderer, screen;
var clock = new THREE.Clock();
var time = 0;
var rotation = THREE.Math.degToRad(15);

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(2, 1, 2).setLength(15);
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x202020);
  document.body.appendChild(renderer.domElement);
  
  var overlay = document.getElementById( 'overlay' );
	overlay.remove();
  
  var video = document.getElementById( 'video' );
  video.volume = 0;
	video.play();
  var videoTex = new THREE.VideoTexture( video );

  var controls = new THREE.OrbitControls(camera, renderer.domElement);

  var projCamera = new THREE.PerspectiveCamera(35, 1.2, 0.01, 10 );
  projCamera.position.set( 0, 0, 9 );
  projCamera.updateMatrixWorld();

  var helper = new THREE.CameraHelper( projCamera );
  scene.add( helper );

  screen = new THREE.Mesh(new THREE.BoxBufferGeometry(16, 9, 2), 
    new THREE.ShaderMaterial({
      uniforms: {
        baseColor: {value: new THREE.Color(0xcccccc)},
        cameraMatrix: { type: 'm4', value: projCamera.matrixWorldInverse },
        projMatrix: { type: 'm4', value: projCamera.projectionMatrix },
        texture: {value: videoTex }
      },
      vertexShader: `

        varying vec4 vWorldPos;

        void main() {

          vWorldPos = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * vWorldPos;

        }

      `,
      fragmentShader: `

        uniform vec3 baseColor;
        uniform sampler2D texture;
        uniform mat4 cameraMatrix;
        uniform mat4 projMatrix;

        varying vec4 vWorldPos;

        void main() {

          vec4 texc = projMatrix * cameraMatrix * vWorldPos;
          vec2 uv = texc.xy / texc.w / 2.0 + 0.5;

          vec3 color = ( max( uv.x, uv.y ) <= 1. && min( uv.x, uv.y ) >= 0. ) ? texture2D(texture, uv).rgb : vec3(1.0);
          gl_FragColor = vec4(baseColor * color, 1.0);

        }
      `,
      side: THREE.DoubleSide
    })
  );
  screen.position.z = -2;
  var boxGeom = new THREE.BoxBufferGeometry(16, 9, 2, 16, 9, 2);
  var gridBoxGeom = GridBoxGeometry(boxGeom);
  var grid = new THREE.LineSegments(gridBoxGeom, new THREE.LineBasicMaterial({color: 0x777777}));
  screen.add(grid);
  scene.add(screen);

  
}

function render() {
  requestAnimationFrame(render);
  time += clock.getDelta();
  screen.rotation.y = Math.sin(time * 0.314) * rotation;
  screen.rotation.x = Math.cos(time * 0.54) * rotation;
  screen.position.z = Math.sin(time * 0.71) * 4 - 2;
  screen.position.y = Math.cos(time * 0.44) * 2;
  renderer.render(scene, camera);
}

var startButton = document.getElementById( 'startButton' );
  startButton.addEventListener( 'click', function () {

    init();
    render();

}, false );
  
function GridBoxGeometry(geometry, independent) {
  if (!(geometry instanceof THREE.BoxBufferGeometry)) {
    console.log("GridBoxGeometry: the parameter 'geometry' has to be of the type THREE.BoxBufferGeometry");
    return geometry;
  }
  independent = independent !== undefined ? independent : false;

  let newGeometry = new THREE.BoxBufferGeometry();
  let position = geometry.attributes.position;
  newGeometry.attributes.position = independent === false ? position : position.clone();

  let segmentsX = geometry.parameters.widthSegments || 1;
  let segmentsY = geometry.parameters.heightSegments || 1;
  let segmentsZ = geometry.parameters.depthSegments || 1;

  let startIndex = 0;
  let indexSide1 = indexSide(segmentsZ, segmentsY, startIndex);
  startIndex += (segmentsZ + 1) * (segmentsY + 1);
  let indexSide2 = indexSide(segmentsZ, segmentsY, startIndex);
  startIndex += (segmentsZ + 1) * (segmentsY + 1);
  let indexSide3 = indexSide(segmentsX, segmentsZ, startIndex);
  startIndex += (segmentsX + 1) * (segmentsZ + 1);
  let indexSide4 = indexSide(segmentsX, segmentsZ, startIndex);
  startIndex += (segmentsX + 1) * (segmentsZ + 1);
  let indexSide5 = indexSide(segmentsX, segmentsY, startIndex);
  startIndex += (segmentsX + 1) * (segmentsY + 1);
  let indexSide6 = indexSide(segmentsX, segmentsY, startIndex);

  let fullIndices = [];
  fullIndices = fullIndices.concat(indexSide1);
  fullIndices = fullIndices.concat(indexSide2);
  fullIndices = fullIndices.concat(indexSide3);
  fullIndices = fullIndices.concat(indexSide4);
  fullIndices = fullIndices.concat(indexSide5);
  fullIndices = fullIndices.concat(indexSide6);

  newGeometry.setIndex(fullIndices);

  function indexSide(x, y, shift) {
    let indices = [];
    for (let i = 0; i < y + 1; i++) {
      let index11 = 0;
      let index12 = 0;
      for (let j = 0; j < x; j++) {
        index11 = (x + 1) * i + j;
        index12 = index11 + 1;
        let index21 = index11;
        let index22 = index11 + (x + 1);
        indices.push(shift + index11, shift + index12);
        if (index22 < ((x + 1) * (y + 1) - 1)) {
          indices.push(shift + index21, shift + index22);
        }
      }
      if ((index12 + x + 1) <= ((x + 1) * (y + 1) - 1)) {
        indices.push(shift + index12, shift + index12 + x + 1);
      }
    }
    return indices;
  }
  return newGeometry;
};