import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();

/*const lopta = new THREE.SphereGeometry(0.2, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const visualiser = new THREE.Mesh(lopta, material);*/

const container = document.getElementById('turntable-container');
const camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 3, 1000);
camera.position.set(12, 60, 67);
if(window.innerWidth < 750){
    camera.position.set(20, 55, 100);
}
camera.lookAt(0, 0, 0);

const render = new THREE.WebGLRenderer({
    alpha: true, 
    antialias: true,
});


render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
render.setSize(container.clientWidth, container.clientHeight);

render.shadowMap.enabled = true;
render.shadowMap.type = THREE.PCFSoftShadowMap;

render.toneMapping = THREE.ACESFilmicToneMapping;
render.toneMappingExposure = 1.2;

render.outputEncoding = THREE.sRGBEncoding;

container.appendChild(render.domElement);

const directLighting = new THREE.DirectionalLight(0xffffff, 1.5);
directLighting.position.set(10, 50, 30);
//directLighting.add(visualiser)
directLighting.castShadow = true;

directLighting.shadow.mapSize.width = 2048;
directLighting.shadow.mapSize.height = 2048;
directLighting.shadow.camera.near = 0.5;
directLighting.shadow.camera.far = 500;

const ambientLighting = new THREE.AmbientLight(0xffffff, 0.1);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-10, 20, -10);

const rimLight = new THREE.DirectionalLight(0xaaccff, 0.3);
rimLight.position.set(0, 10, -50);

scene.add(directLighting);
scene.add(ambientLighting);
scene.add(fillLight);
scene.add(rimLight);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const song = document.getElementById('daily-song');
song.loop = false;
let toneArm;
let needleArm;
let needlePin;
let ringsArm;
window.addEventListener('click', onMouseClick);

/*const mouseControl = new OrbitControls(camera, render.domElement);
mouseControl.enableDamping = true;
mouseControl.dampingFactor = 0.05;
mouseControl.enableZoom = true;*/

function onMouseClick(event){
    const rect = render.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const fire = raycaster.intersectObjects(scene.children, true);
    if(fire.length > 0){
        const piece = fire[0].object.name;
        console.log("Click detected at:", piece);
        if(piece === 'needle_system_msh_needle_mat_0' || piece === 'arm_msh_metal_mat_0' || piece === 'arm_msh_phongE4_0'){
            toggleMusic();
        }
    }
}

const loader = new GLTFLoader();
const text = document.getElementById('loader');

let armPivot;
loader.load('../assets/scene.gltf', function(gltf){
    const model = gltf.scene;
    

    model.traverse((child) => {
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
            

            if(child.material){
                child.material.needsUpdate = true;
                 child.material.metalness = 0.5;
                 child.material.roughness = 0.5;
            }
        }
    });
    
    scene.add(model);
    text.classList.add('fade-out');
    
    toneArm = model.getObjectByName('arm_msh_metal_mat_0');
    needleArm = model.getObjectByName('needle_system_msh_needle_mat_0');
    ringsArm = model.getObjectByName('arm_msh_phongE4_0');
    needlePin = model.getObjectByName('needle_msh_metal_mat1_0');
    
    armPivot = new THREE.Group();
    scene.add(armPivot);
    armPivot.position.set(21, 19, -12.5);
    armPivot.attach(toneArm);
    armPivot.attach(needleArm);
    armPivot.attach(ringsArm);
    armPivot.attach(needlePin);
});

function toggleMusic(){
    if(song.paused){
        song.play();
    } else {
        song.pause();
    }
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    render.setSize(container.clientWidth, container.clientHeight);
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animation() {
    requestAnimationFrame(animation);
    const start = -0.30;
    const end = -0.65;
    let targetRotation = 0;
    let targetLower;
    if(song.paused){
        targetLower = 0
    }
    else{
        targetLower = 0.30
    }
    
    
    if(song.paused === false && song.duration > 0){
        const progress = song.currentTime / song.duration;
        targetRotation = start + (end - start) * progress;
    }
    
    if(armPivot){
        armPivot.rotation.y = THREE.MathUtils.lerp(armPivot.rotation.y, targetRotation, 0.05);
        armPivot.rotation.z = THREE.MathUtils.lerp(armPivot.rotation.z, targetLower, 0.05);
    }
    //mouseControl.update();
    render.render(scene, camera);
}
animation();