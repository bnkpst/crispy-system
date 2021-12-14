

import WebGLApp from './WebGLApp.js';
import { Vector3, AxesHelper,
BufferGeometry, Line, LineBasicMaterial,
PerspectiveCamera, CameraHelper,
Euler,
} from 'three';


import Nav from './Nav.js';
import {gps} from './gps.js';

const canvas = document.querySelector('#app');

const webgl = new WebGLApp({
    canvas, 
    background: '#333',
    orbitControls: true,
    cameraPosition: new Vector3(0, 0, 10000),
});

window.webgl = webgl;

const nav = new Nav({
    file: gps,
})

const nav_data = nav.getData()

console.log(nav_data[0])

const stats = nav.getStats();

console.log(stats)

const proj = new PerspectiveCamera(0.143239,628.32, 1, 5000)
// const proj = new PerspectiveCamera(0.5,628.32, 1, 1000)
// proj.position.set(0, 0, 0)

const projHelp = new CameraHelper(proj)
webgl.scene.add(projHelp)


const axesHelper = new AxesHelper(10000 );

webgl.scene.add( axesHelper );

axesHelper.position.set(0, 0, 0)

webgl.camera.lookAt(0,0,0)

createTrack(nav_data, stats);

let i = 0;

setInterval(() => {

    // proj.position.set(nav_data[i].x, nav_data[i].y, nav_data[i].alt);
    proj.lookAt(0,0,0)
    proj.position.x = nav_data[i].x - stats.minX;
    proj.position.y = nav_data[i].y - stats.minY;
    proj.position.z =  nav_data[i].alt;

    const rot = new Euler( nav_data[i].p, nav_data[i].r, nav_data[i].h, 'ZXY' );

    proj.setRotationFromEuler(rot);
    
    // webgl.renderer.render(webgl.scene, webgl.camera)

    i++;

    if(i >= nav_data.length) {i = 0;}

}, 1);

webgl.start()


function createTrack (nav, stats) {
    const points3D = [];

    nav.forEach((pt) => {
        points3D.push(new Vector3(pt.x - stats.minX, pt.y - stats.minY, pt.alt));
    })

  
    const geometry = new BufferGeometry().setFromPoints( points3D );
    const material = new LineBasicMaterial( { color: 0x0000ff } );
    const line = new Line( geometry, material );
    webgl.scene.add(line);
}