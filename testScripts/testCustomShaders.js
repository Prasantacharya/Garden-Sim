//Exploration into using custom shaders instead of the Three.js materials

//import THREE into the file
// work on this? right now I'm just pulling into namespace with a script tag

//create scene
const scene = new THREE.Scene();

//perspective camera (fov, aspect ratio, near clip, far clip)
var camera = new THREE.PerspectiveCamera(75, 1600/900, 0.1, 1000);

//create and init the webgl renderer, append it to the html doc
var renderer = new THREE.WebGLRenderer();
renderer.setSize(1600, 900);
document.body.appendChild(renderer.domElement);

//create a geometry (box of sides 1,1,1)
var geometry = new THREE.BoxGeometry(1, 1, 1);

//let's see an example of creating a custom material, instead (material == shader)
//var material = new THREE.MeshBasicMaterial( { color: 0xCCCCCC } );
var material = new THREE.ShaderMaterial({

	//uniforms must be declared in both this block AND the vertexShader
	uniforms:{

	},

	//we can just pull from the DOM for shaders, though we need to get strings (?)
	//also, ShaderMaterial prepends some pre-declared stuff for convenience.
	//RawShaderMaterial does not
	vertexShader: document.getElementById('vertex-shader').textContent,

	fragmentShader: document.getElementById('fragment-shader').textContent
});

//the rest is the same. Apply material to geometry, etc
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 2;
camera.position.x = 0;
camera.position.y = 0;


function render(){
	requestAnimationFrame(render);

	renderer.render(scene, camera);

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
}
render();
