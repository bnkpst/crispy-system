var scene, camera, renderer;
var controls;
var fakeScene, fakeCamera;
var renderTarget;

var cube;

init();
animate();

function init() {
    scene = new THREE.Scene();

    scene.background = 0xff0000;

    camera = new THREE.PerspectiveCamera(60, 4 / 3, 0.01, 100.0);
    camera.position.set(-0.5, 0.0, 1.5);
    camera.lookAt(0,0,0)

    renderer = new THREE.WebGLRenderer({antialias: true});

    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.center.set(0.0, 0.0, 0.0);
    
    // setup fake scene rendered to texture
    fakeScene = new THREE.Scene();
    fakeScene.background = new THREE.Color(0x404040);
    
    fakeCamera = new THREE.PerspectiveCamera(60, 1.0, 0.01, 100.0);
    fakeCamera.position.set(0.0, 0.0, 3.0);
    fakeCamera.lookAt(new THREE.Vector3());
    
    renderTarget = new THREE.WebGLRenderTarget(512, 512);
    
    cube = new THREE.Mesh(
    	new THREE.BoxBufferGeometry(1.0, 1.0, 1.0),
        new THREE.MeshPhongMaterial()
    );
    fakeScene.add(cube);
    
    var directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(-1.0, 1.0, 1.0);
    fakeScene.add(directional);
    
    var plane = new THREE.Mesh(
    	new THREE.PlaneBufferGeometry(1.0, 1.0),
        new THREE.MeshBasicMaterial({
        	map: renderTarget.texture
        })
    );
    scene.add(plane);
    

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    document.body.appendChild(renderer.domElement);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    // controls.update();

	cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;

     
	renderer.render(fakeScene, fakeCamera, renderTarget);
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}