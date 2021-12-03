import './app.css'
import WebGLApp from "./WebGLApp"
import { 
    DirectionalLight, DirectionalLightHelper,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh
} from 'three';

const canvas = document.querySelector('#app')

const webgl = new WebGLApp({canvas: canvas, width: window.innerWidth, height: window.innerHeight})

const geometry = new BoxGeometry();
const material = new MeshBasicMaterial( { color: 0x10ff10, wireframe: true } );
const cube = new Mesh( geometry, material );

webgl.scene.add( cube );
webgl.camera.position.z = 10;

webgl.start()


