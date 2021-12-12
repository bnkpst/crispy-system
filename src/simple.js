import * as THREE from 'three';

///////////////////This is the basic scene setup
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

renderer.setClearColor(0xcccccc, 1)
document.body.appendChild( renderer.domElement );

///////////////////This is where we create our off-screen render target
//Create a different scene to hold our buffer objects
var bufferScene = new THREE.Scene();
//Create the texture that will store our result
var bufferTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {
     minFilter: THREE.LinearFilter, 
     magFilter: THREE.NearestFilter,
     format: THREE.RGBFormat 
    });


const l2 = new THREE.AmbientLight(0xffffff, 1.0)
bufferScene.add(l2)
//Let's create a red box
var redMaterial = new THREE.MeshBasicMaterial({color:0xF06565});
var boxGeometry = new THREE.BoxGeometry( 5, 5, 5 );
var boxObject = new THREE.Mesh( boxGeometry, redMaterial );
boxObject.position.z = -10; 
bufferScene.add(boxObject);//We add it to the bufferScene instead of the normal scene!

///And a blue plane behind it
var blueMaterial = new THREE.MeshBasicMaterial({color:0x7074FF})
var plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
var planeObject = new THREE.Mesh(plane,blueMaterial);
planeObject.position.z = -15;
bufferScene.add(planeObject);//We add it to the bufferScene instead of the normal scene!

renderer.render(bufferScene,camera,bufferTexture);


const l1 = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(l1)
////////////////////////////Now we use our bufferTexture as a material to render it onto our main scene
var boxMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, map: bufferTexture.texture});
var boxGeometry2 = new THREE.BoxGeometry( 5, 5, 5 );
var mainBoxObject = new THREE.Mesh(boxGeometry2,boxMaterial);
mainBoxObject.position.z = -10;
scene.add(mainBoxObject);

//Render everything!
function render() {

  requestAnimationFrame( render );

  //Make the box rotate on box axises
  boxObject.rotation.y += 0.01;
  boxObject.rotation.x += 0.01;
  //Rotate the main box too
  mainBoxObject.rotation.y += 0.01;
  mainBoxObject.rotation.x += 0.01;

  renderer.setRenderTarget( bufferTexture );

renderer.setClearColor(0xffddff);

renderer.clear();

renderer.render( bufferScene, camera );

renderer.setRenderTarget( null );

renderer.setClearColor(0x000000);

renderer.render( scene, camera );

//   //Render onto our off screen texture
//   renderer.render(bufferScene,camera,bufferTexture);

//   //Finally, draw to the screen
// renderer.render( scene, camera );



}
render();