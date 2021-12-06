import './app.css';
import WebGLApp from "./WebGLApp";
import { 
    PerspectiveCamera,
    BoxGeometry,
    PlaneGeometry,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Mesh,
    GridHelper,
    Euler,
    CameraHelper,
    TextureLoader,
    AmbientLight,
    DoubleSide,
    DirectionalLightHelper,
     DirectionalLight,
     Vector3,
     PointLight,
     SpotLight,
     TextureLoader,
     SpotLightHelper,
     AxesHelper
} from 'three';

// import * as THREE from 'three'

import ProjectedMaterial from './ProjectedMaterial.module';
import assets from './lib/AssetManager.js'

import { loadDEM } from './Dem';

import dem_image from 'url:../public/dem_small.tif';
import sat_image from 'url:../public/sat.jpg';

import {fromUrl} from 'geotiff'


const canvas = document.querySelector('#app');

const webgl = new WebGLApp({
    canvas, 
    background: '#555',
    orbitControls: true,
    cameraPosition: new Vector3(0, -90, 60),
});

window.webgl = webgl;





// load the example texture
const texture = new TextureLoader().load(sat_image)

fromUrl(dem_image)
.then((tiff) => tiff.getImage())
.then((tifImage) => {
    const image = {
        width: tifImage.getWidth(),
        height: tifImage.getHeight(),
    };

    const geometry = new PlaneGeometry(
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
            geometry.attributes.position.setZ(index, (data[index] / 60));
        });
        console.timeEnd('parseGeom');
        console.log("Dem Done");

        return geometry;
    })

    return geom;

})
.then((terrain_geom) => {
    init(terrain_geom)
})

const init = (geometry) => {

    let yy = -40



    const proj = new PerspectiveCamera(45, 1, 0.1, 70)
    proj.position.set(0, yy, 50)
    proj.lookAt(0, yy,0)

    const projHelp = new CameraHelper(proj)
    webgl.scene.add(projHelp)

    const axesHelper = new AxesHelper( 50 );
    axesHelper.position.set(-45, -45, 0)
    webgl.scene.add( axesHelper );

    // create the mesh with the projected material
    const material = new ProjectedMaterial({
        camera: proj,
        texture,
        color: '#ccc',
        // textureScale: 0.8,
        wireframe: true
        // side: DoubleSide
    })
    const mesh = new Mesh(geometry, material)

    webgl.scene.add(mesh)

    material.project(mesh);

    // add lights
    const ambientLight = new AmbientLight(0xffffff, 1)
    webgl.scene.add(ambientLight)

    let i = 1;
    setInterval(() => {
        // mesh.rotation.z = i / 3000
        proj.position.y = yy + i/20;
        // proj.rotation.z = i/10000;
        i++;

        if(i > 2000) {i = 0}
        
        
    material.project(mesh);


    }, 1)

    webgl.start()

}













