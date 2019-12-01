'use strict';

///////////////////////
// SCENE INITIALIZATION
///////////////////////

//const parameters
const WIN_WIDTH = 800;
const WIN_HEIGHT = 450;
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

/////////////////////////
// THE MEAT OF THE PROGRAM
////////////////////////


//seed stuff?
//each entry in this array is a Three.Group, and that Group will contain the Seed object data, maybe?
var seedGroups = [];
var seedBulbMaterial = new THREE.MeshPhongMaterial({
    color: 0x613e09,
    shininess: 5
});

//i have no idea what I'm doing here!
const seedRules = {
    "A":"AZ",
    "B":"AV",
    "V":"[A]"

};

const seedExtraRules = {
    "A":1,
    "Z":1, //side lengths?
    "+":0.523599 //radians??
};


var MouseForDelta = new THREE.Vector2();
var seedReady = false;
var seedText = '';
//on click, throw down a seed! I guess???
renderer.domElement.addEventListener('click', event => {
    let deltaX = Math.abs(MouseForDelta.x - event.clientX);
    let deltaY = Math.abs(MouseForDelta.y - event.clientY);
    if(seedReady && event.button === 0 && deltaY < 5 && deltaX < 5){

        //fire raycaster, check if clear line to ground plane
        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(scene.children, false);

        //the first thing we hit is the groundplane
        if(intersects.length > 0 && intersects[0].object === groundPlane){

            //create a new group, put a seedbulb (?) in it, then put it in the scene
            let newGroup = new THREE.Group();
            let mesh = new THREE.Mesh(new THREE.SphereGeometry(1,8,8), seedBulbMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            newGroup.add(mesh);
            seedGroups.push(newGroup);
            newGroup.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
            scene.add(newGroup);

            //TODO: maybe here, add the seedtext/the seed made from the seedText to an object, and
            //put it in the .userData property on the newGroup?
            newGroup.userData = {seed:new Seed(seedText, seedRules, seedExtraRules), iterations:0};

            seedReady = false;
        }
    }
});

//an onMouseDown to help deal with dragEvents causing a click as well
renderer.domElement.addEventListener('mousedown', event =>{
    MouseForDelta.x = event.clientX;
    MouseForDelta.y = event.clientY;
});

//textbox and button and event for button that pulls text from textbox for seed generation
var seedTextBox = document.createElement('input');
seedTextBox.setAttribute('type','text');
seedTextBox.setAttribute('placeholder', 'enter seed string');
document.body.appendChild(seedTextBox);
var seedTextBoxButton = document.createElement('button');
seedTextBoxButton.setAttribute('type', 'button');
seedTextBoxButton.innerHTML = "Submit to seed";
document.body.appendChild(seedTextBoxButton);
seedTextBoxButton.onclick = function(){
    if(seedTextBox.value === ''){
        return;
    }

    seedText = seedTextBox.value;
    seedTextBox.value = '';
    seedReady = true;
};

//TODO: a function that takes in a THREE.Group, increments the related seed iterator,
//and then remakes the meshes in the group according to the new rules?

//TODO: a button and an event function that drives the above function across all groups
//in the seedGroups array?

function render(){
    requestAnimationFrame(render);

    // //raycast
    // raycaster.setFromCamera(mouse, camera);
    // //probably want the target type be something other than all scene objects
    // let intersects = raycaster.intersectObjects(scene.children);
    // if(intersects.length > 0){
    //     for(let i = 0; i < intersects.length; ++i){
    //         //can't exclude objects from raycaster, only include, so do this
    //         if(intersects[i].object === axesHelper){
    //             continue;
    //         }
    //         axesHelper.position.x = intersects[i].point.x;
    //         axesHelper.position.y = intersects[i].point.y;
    //         axesHelper.position.z = intersects[i].point.z;
    //         break;
    //     }
    // }

    //limit the camera to inside an area
    controls.target.x = Math.min(CAMERA_BOUNDS_X, Math.max(-CAMERA_BOUNDS_X, controls.target.x ));
    controls.target.z = Math.min(CAMERA_BOUNDS_Z, Math.max(-CAMERA_BOUNDS_Z, controls.target.z));

    //since the controls are dampened, this has to be called
    controls.update();


    renderer.render(scene, camera);
}

renderer.domElement.addEventListener('mousemove', onMouseMoveUpdatePos, false);

render();
