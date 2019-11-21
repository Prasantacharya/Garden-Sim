'use strict';

//const parameters
const WIN_WIDTH = 1600;
const WIN_HEIGHT = 900;
const VIEW_FOV = 75;

//scene, camera, renderer, etc
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xDDDDDD);
const camera = new THREE.PerspectiveCamera(VIEW_FOV, WIN_WIDTH/WIN_HEIGHT, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(WIN_WIDTH, WIN_HEIGHT);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//camera controls init and config (lmb spin, rmb pan along ground, scroll zoom)
//controls can be changed if needed.
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.20;
controls.maxPolarAngle = Math.PI/2 - 0.1;
controls.minDistance = 5;
controls.maxDistance = 100;
controls.zoomSpeed = 0.5;
controls.panSpeed = 0.85;

//setup of GroundPlane (ie a plane for ground...)
//TODO: convert plane params from magic numbers to consts
var groundPlaneMesh = new THREE.PlaneGeometry(100, 100, 1, 1);
groundPlaneMesh.rotateX(Math.PI/2);
var groundPlaneMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    color: 0x577A3E,
    reflectivity: 0,
    shininess: 15
});
var groundPlane = new THREE.Mesh(groundPlaneMesh, groundPlaneMaterial);
groundPlane.receiveShadow = true;
groundPlane.translateY(-1)
scene.add(groundPlane);

///Raycaster stuff for picking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector3();

function onMouseMoveUpdatePos( event ){
    mouse.x = ( event.clientX / WIN_WIDTH ) * 2 - 1;
    mouse.y = -( event.clientY / WIN_HEIGHT ) * 2 + 1;
    mouse.z = 1.0;
}

//ambient light
var ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

//directional light that casts shadows
var sunLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
sunLight.castShadow = true;
sunLight.position.set(20, 30, 0);
scene.add(sunLight);

//shadow settings
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
//l,r,top,bot are based on the scene dimensions right now.
//TODO: turn these magic numbers into consts
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 30;
sunLight.shadow.camera.bottom = -4;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.updateProjectionMatrix();

//helpers for debug
var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

//torusKnot for shadow debugging
var torusGeometry = new THREE.TorusKnotGeometry(6, 1, 128, 16);
var torusMaterial = new THREE.MeshPhongMaterial({
    side: THREE.FrontSide,
    color: 0xffff00,
    reflectivity: 0.8,
    shininess: 70
});
var torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.castShadow = true;
torus.receiveShadow = true;
torus.translateY(8);
scene.add(torus);

//Camera parameters
camera.translateZ(20);
camera.translateY(21);
camera.translateX(4);
camera.lookAt(0,0,0);

function render(){
    requestAnimationFrame(render);

    //since the controls are dampened, this has to be called
    controls.update();

    //raycast
    raycaster.setFromCamera(mouse, camera);
    //probably want the target type be something other than all scene objects
    let intersects = raycaster.intersectObjects(scene.children);
    if(intersects.length > 0){
        for(let i = 0; i < intersects.length; ++i){
            //can't exclude objects from raycaster, only include, so do this
            if(intersects[i].object === axesHelper){
                continue;
            }
            axesHelper.position.x = intersects[i].point.x;
            axesHelper.position.y = intersects[i].point.y;
            axesHelper.position.z = intersects[i].point.z;
            break;
        }
    }


    renderer.render(scene, camera);
}

window.addEventListener('mousemove', onMouseMoveUpdatePos, false);

render();
