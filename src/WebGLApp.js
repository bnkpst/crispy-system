import { 
    PerspectiveCamera,
    WebGLRenderer,
    Scene
 } from "three"


export default class WebGLApp { 

    constructor({
        canvas,
        width,
        height,
        background = '#333',
        backgroundAlpha = 1,
    } ={}) {
        this.width = width
        this.height = height
        this.scene = new Scene()
        this.camera = new PerspectiveCamera( 45,  width / height, 0.1, 1000 )
        this.renderer = new WebGLRenderer({canvas})
        this.renderer.setSize( width, height )
        this.renderer.setClearColor(background, backgroundAlpha)
        this.isRunning = false
    }
    
    start = () => {
        if (this.isRunning) return
        this.renderer.setAnimationLoop(this.animate)
        this.isRunning = true
        return this
    }
    
    stop = () => {
        if (!this.isRunning) return
        this.renderer.setAnimationLoop(null)
        this.isRunning = false
        return this
    }
    
    animate = () => {
        requestAnimationFrame( this.animate );
        this.renderer.render( this.scene, this.camera );
    };
}
