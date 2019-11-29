'use strict';

//const parameters
const WIN_WIDTH = 1600;
const WIN_HEIGHT = 900;
const VIEW_FOV = 75;
const GROUND_SIZE = 200;
const CAMERA_BOUNDS_X = 20;
const CAMERA_BOUNDS_Z = 20;

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
var groundPlaneMesh = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 1, 1);
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
sunLight.position.set(200, 300, 0);
scene.add(sunLight);

//shadow settings
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
//l,r,top,bot are based on the scene dimensions right now.
//TODO: turn these magic numbers into consts
sunLight.shadow.camera.left = -GROUND_SIZE/2;
sunLight.shadow.camera.right = GROUND_SIZE/2;
sunLight.shadow.camera.top = GROUND_SIZE/2;
sunLight.shadow.camera.bottom = -GROUND_SIZE/2;
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


//computes an array of vectors for path generation? Maybe?
//just a placeholder for now
function computePointsFromString(string){
    let points = [];

    let i = 0;
    let x = 0, y = 0;
    for(; i < string.length; ++i){
        let char = string.charAt(i);
        
        if(char === "B"){
            ++i;
            break;
        }

        points.push( new THREE.Vector3(0, y, 0));
        y += 2;
    }

    for(; i < string.length; ++i){
        let char = string.charAt(i);
        if(char === "B"){
            ++i;
            break;
        }

        points.push(new THREE.Vector3(x+2, y, 0));
        ++x;
        ++y;
    }

    return points;
}

//var path1 = new THREE.CatmullRomCurve3(computePointsFromString("AAAA"));
var path2 = new THREE.CatmullRomCurve3(computePointsFromString("AAAAAABAAAA"));

//var pathGeo1 = new THREE.TubeGeometry(path1, 256, 2, 8, false);
var pathGeo2 = new THREE.TubeGeometry(path2, 512, 1, 8, false);
var pathMesh2 = new THREE.Mesh(pathGeo2, torusMaterial);
pathMesh2.translateX(10);
pathMesh2.translateZ(10);
pathMesh2.castShadow = true;
pathMesh2.receiveShadow = true;
scene.add(pathMesh2);


function render(){
    requestAnimationFrame(render);

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

    //limit the camera to inside an area
    controls.target.x = Math.min(CAMERA_BOUNDS_X, Math.max(-CAMERA_BOUNDS_X, controls.target.x ));
    controls.target.z = Math.min(CAMERA_BOUNDS_Z, Math.max(-CAMERA_BOUNDS_Z, controls.target.z));

    //since the controls are dampened, this has to be called
    controls.update();


    renderer.render(scene, camera);
}

window.addEventListener('mousemove', onMouseMoveUpdatePos, false);

render();
