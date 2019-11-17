//just puts a box in a scene, and spins it (!!)

//import THREE into the file
// work on this? right now I'm just pulling into namespace with a script tag

//create scene
var scene = new THREE.Scene();

//perspective camera (fov, aspect ratio, near clip, far clip)
var camera = new THREE.PerspectiveCamera(75, 1600/900, 0.1, 1000);

//create and init the webgl renderer, append it to the html doc
var renderer = new THREE.WebGLRenderer();
renderer.setSize(1600, 900);
document.body.appendChild(renderer.domElement);

//This is a bit different, so stick with me
//we create a geometry and material object (box of sides 1,1,1, flat white color)
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial( { color: 0xCCCCCC } );

//...and then we apply the mesh object to the geometry object to get a cube, then
// add it to the scene.
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 6;
camera.position.x = 3;
camera.position.y = 2;

//typical requestAnimFrame loop...
function render(){
	requestAnimationFrame(render);

	//..except this. We tell the renderer which scene, and with which camera,
	//to render.
	renderer.render(scene, camera);

	//rotation is abstracted away, or at least by default
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
}
render();
