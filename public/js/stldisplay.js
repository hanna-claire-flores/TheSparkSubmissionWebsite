import * as THREE from "/three/build/three.module.js";
import { OrbitControls } from "/three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "/three/examples/jsm/loaders/STLLoader.js";
import { GUI } from "/gui/build/dat.gui.module.js";

function STLViewer(model, elementID) {
  var elem = document.getElementById(elementID);

  //----------------------------------------------//
  //--------------------CAMERA--------------------//
  //----------------------------------------------//
  var camera = new THREE.PerspectiveCamera(
    70,
    elem.clientWidth / elem.clientHeight,
    1,
    1000
  );

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  //--------------display progress bar
  var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = (xhr.loaded / xhr.total) * 100;
      $(".progress-bar").attr("aria-valuenow", Math.round(percentComplete, 2));
      $(".progress-bar").attr(
        "style",
        "width: " + Math.round(percentComplete, 2) + "%"
      );
      if (Math.round(percentComplete, 2) == 100) {
        $(".progress").remove();
      }
    }
  };

  //-------Resize on window resize-----------------//
  renderer.setSize(elem.clientWidth, elem.clientHeight);
  elem.appendChild(renderer.domElement);

  window.addEventListener(
    "resize",
    function () {
      renderer.setSize(elem.clientWidth, elem.clientHeight);
      camera.aspect = elem.clientWidth / elem.clientHeight;
      camera.updateProjectionMatrix();
    },
    false
  );

  //----------------------------------------------//
  //-------------------CONTROLS-------------------//
  //----------------------------------------------//

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.rotateSpeed = 2;
  controls.dampingFactor = 0.1;
  controls.enableZoom = true;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7f7f7);

  //----------------------------------------------//
  //-----------------BOTTOM PLANE-----------------//
  //----------------------------------------------//
  var size = 230;
  var divisions = 23;
  var centerColor = 0xff0000;
  var gridColor = 0xbbbbbb;
  var gridHelper = new THREE.GridHelper(
    size,
    divisions,
    centerColor,
    gridColor
  );
  scene.add(gridHelper);

  //----------------------------------------------//
  //-----------------BUILD VOLUME-----------------//
  //----------------------------------------------//
  const cubeSize = 230;
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
  const wireframeGeo = new THREE.EdgesGeometry(cubeGeo);
  const cubeMat = new THREE.LineBasicMaterial({
    color: gridColor,
    linewidth: 2,
  });
  const box = new THREE.LineSegments(wireframeGeo, cubeMat);
  box.position.set(0, cubeSize / 2, 0);
  scene.add(box);

  //----------------------------------------------//
  //--------------------LIGHTS--------------------//
  //----------------------------------------------//
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7a7a7a, 0.87));

  const color = 0xffe6ee;
  const intensity = 0.3;
  const light = new THREE.PointLight(color, intensity);
  light.position.set(100, 150, 200);
  scene.add(light);

  //----------------------------------------------//
  //------------------STL LOADER------------------//
  //----------------------------------------------//
  new STLLoader().load(
    model,
    function (geometry) {
      //-----------MATERIAL-------------//
      var material = new THREE.MeshPhongMaterial({
        color: 0x85e085,
        //color: 0xffffff,
        specular: 0x5b1307,
        shininess: 100,
      });

      //-------------MESH---------------//
      var mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);

      //----------POSITIONING-----------//
      var middle = new THREE.Vector3();
      geometry.computeBoundingBox();

      geometry.boundingBox.getCenter(middle);
      mesh.geometry.applyMatrix(
        new THREE.Matrix4().makeTranslation(-middle.x, -middle.y, 0)
      );

      //-------------CAMERA-------------//
      camera.position.z = 150;
      camera.position.y = 250;

      //------------ANIMATION-----------//
      var animate = function () {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    },
    onProgress
  );

  //----------------------------------------------//
  //---------------------GUI----------------------//
  //----------------------------------------------//
  const gui = new GUI({
    autoPlace: false,
    width: 90,
  });
  var customContainer = document.getElementById("gui-container");
  customContainer.appendChild(gui.domElement);
  gui.add(controls, "autoRotate").name("Auto Rotate");
}

$(document).ready(function () {
  var relativePath = $("#model").attr("filename").split("app").pop();
  STLViewer(relativePath, "model");
});
