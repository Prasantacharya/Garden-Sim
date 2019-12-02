'use strict';

///////////////////////
// SCENE INITIALIZATION
///////////////////////

//const parameters
const WIN_WIDTH = 800;
const WIN_HEIGHT = 450;
const VIEW_FOV = 75;
const GROUND_SIZE = 300;
const CAMERA_BOUNDS_X = 90;
const CAMERA_BOUNDS_Z = 90;

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
    "A":["AW"],
    "B":["AV"],
    "V":["+[A]W", "-[A]W"]
};

const seedExtraRules = {
    "A":new THREE.Vector3(0,1,0),
    "W":new THREE.Vector3(0,1,0), //side lengths?

    //golden angles, +- -> x, */ -> y , () -> z
    "+":new THREE.Vector3(0.3752458, 0, 0),
    "-":new THREE.Vector3(-0.3752458, 0, 0),
    "*":new THREE.Vector3(0, 0.3752458, 0),
    "/":new THREE.Vector3(0, -0.3752458, 0),
    "(":new THREE.Vector3(0, 0, 0.3752458),
    ")":new THREE.Vector3(0, 0, -0.3752458)
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
window.onload = function(){
    var seedGrowButton = document.getElementById('Grow');
    seedGrowButton.onclick = function(){
        for(let i = 0; i < seedGroups.length; ++i){
            seedGroups[i].userData.iterations += 1;
            //call regenerate/reiterate/regrow function on seedGroups[i] here
            nextIterate(seedGroups[i].userData.seed, 1); // updates the seedGroup's string
            let t = generatePoints3d(seedGroups[i].userData.seed, 0,0);
            console.log(t);

            //remove old meshes from group
            // type error here
            for(let j = seedGroups[i].children.length-1; j > 0; --j){
                seedGroups[i].children[j].geometry.dispose();
                seedGroups[i].remove(seedGroups[i].children[j]);
            }

            //add new meshes to group
            for(let j = 0; j < t.length; ++j){
                let path = new THREE.CatmullRomCurve3(t[j]);
                let geo = new THREE.TubeGeometry(path, t[j].length*5, 0.5, 6, false);
                let mesh = new THREE.Mesh(geo, torusMaterial);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                seedGroups[i].add(mesh);
                
                geo = new THREE.SphereGeometry(0.5, 8, 8);
                mesh = new THREE.Mesh(geo, torusMaterial);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                seedGroups[i].add(mesh);
                mesh.position.x = t[j][t[j].length-1].x;
                mesh.position.y = t[j][t[j].length-1].y;
                mesh.position.z = t[j][t[j].length-1].z;
            }
        }
    }
}

// seed path generation here
function nextIterate(seed, i){
    console.log(makeString(seed, i));
  return seed.updateString(makeString(seed, i));// changes the seed's string to be the i-th iteration
}

// generates the points and the paths
// returns them as a list of of continious points
// ex: [[a,b,c], [d,e,f], [g,h,i,j]]. the letters are Vector3's
// [a,b,c] is continious, [d,e,f] is continious, and [g,h,i,j] is continious
function generatePoints3d(seed, xStart, yStart){
  let string = seed.getString();
  let x = xStart;// starting x position
  let y = yStart;// starting y position
  let z = 0;

  let degree = new THREE.Vector3(0,0,0);
  let stack = [];
  let points = [[new THREE.Vector3(x,y,z)]];

  let currentPath = 0;
  for(let char of string){
    if(valid(char) && (char in seed.extra)){
      // valid(char) just makes sure that the character is in the alphabet
      let rotate = new THREE.Euler(degree.x, degree.y, degree.z, "XYZ");
      let addition = seed.extra[char];
      x += addition.x;
      y += addition.y;
      z += addition.z;
      let newPath = new THREE.Vector3(x,y,z);
      points[currentPath].push(newPath.applyEuler(rotate));
    } else if(char === "+" || char === "-" || char === "*" || char === "/" || char === "(" || char === ")"){
      // increase the rotation degree
      // degree += seed.extra[char];
      degree.x += seed.extra[char].x;
      degree.y += seed.extra[char].y;
      degree.z += seed.extra[char].z;
    } else if(char === "["){
      // push it onto the stack
      stack.unshift([x,y,z,degree]);
    } else if(char === "]"){
      // pops them off the stack
      x = stack[0][0];
      y = stack[0][1];
      z = stack[0][2];
      degree = stack[0][3];
      stack.splice(0,1);
      currentPath += 1;
      points.push([new THREE.Vector3(x,y,z)]);
    }
  }
  return points;
}

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
