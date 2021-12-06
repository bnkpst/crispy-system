import * as THREE from 'three';
import {fromUrl} from 'geotiff';
import ProjectedMaterial from './ProjectedMaterial.module';

import dem_image from 'url:../public/dem_small.tif';
import sat_image from 'url:../public/uv.jpg';

let camera, scene, renderer;
let material, mesh;

fromUrl(dem_image)
.then((tiff) => tiff.getImage())
.then((tifImage) => {
    const image = {
        width: tifImage.getWidth(),
        height: tifImage.getHeight(),
    };

    const geometry = new THREE.PlaneGeometry(
        image.width,
        image.height,
        image.width - 1,
        image.height - 1
    );

    const geom = tifImage.readRasters({ interleave: true })
    .then((data) => {
        console.time('parseGeom');
        const arr1 = new Array(geometry.attributes.position.count);
        const arr = arr1.fill(1);
        arr.forEach((a, index) => {
            geometry.attributes.position.setZ(index, (data[index] / 80) );
        });
        console.timeEnd('parseGeom');
        console.log("Dem Done");

        return geometry;
    })

    return geom;

})
.then((terrain_geom) => {
    console.log("All goo")
    init(terrain_geom)
})

function init(geometry) {

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 100;
    camera.position.y = -60
    camera.lookAt(0,0,0);

	scene = new THREE.Scene();

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    scene.add(dirLight);
    dirLight.position.set(30,30,30)
    dirLight.lookAt(0,0,0)
    const dirHelp = new THREE.DirectionalLightHelper(dirLight)
    scene.add(dirHelp)


    const texture = new THREE.TextureLoader().load(sat_image);

    // texture.format = THREE.RGBFormat
    // texture.wrapS = THREE.ClampToEdgeWrapping
    // texture.wrapT = THREE.ClampToEdgeWrapping
    // texture.minFilter = THREE.LinearMipMapLinearFilter
    // texture.magFilter = THREE.LinearFilter
    // texture.generateMipmaps = true

    console.log(texture);

    const proj = new THREE.PerspectiveCamera(15, 1, 0.1, 100)
    proj.position.set(10, 10, 20)
    proj.lookAt(1000, 0, 0)

    const helper = new THREE.CameraHelper(proj)
    scene.add(helper)

    // material = new THREE.MeshBasicMaterial({
    //     map: texture,
    //     wireframe: true
    // });

    material = new ProjectedMaterial({
        camera: proj,
        texture: texture,
        color: '#ffffff',
        // side: THREE.DoubleSide
  })

    
    geometry = new THREE.BoxGeometry(10, 10, 10)
	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    // scene.add(ambientLight)



	renderer = new THREE.WebGLRenderer( { 
        antialias: true, 
        alpha: false,
    } );
    // renderer.setClearColor(background, backgroundAlpha)
    renderer.setClearColor('#777', 1)
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animation );
	document.body.appendChild( renderer.domElement );
   
    // renderer.render( scene, camera );

}

function animation( time ) {

	mesh.rotation.z = time / 2000;
	// mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}