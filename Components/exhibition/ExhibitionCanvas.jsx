import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ROOMS_CONFIG, ARTWORKS, DOORS_CONFIG } from './ExhibitionData';

export default function ExhibitionCanvas({ 
  onRoomChange, 
  onArtworkClick, 
  wallsVisible,
  isActive,
  isOverlayOpen = false // <--- NOUVEAU PARAMÈTRE
}) 
{ 
  console.log("ExhibitionCanvas rendu", { isActive, isOverlayOpen });
  
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Refs pour les contrôles
  const controlsRef = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isRunning: false
  });

  const interactablesRef = useRef([]);
  const wallsRef = useRef([]);
  const currentRoomRef = useRef('room0');
  
  // Vue (Souris)
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const isMouseDraggingRef = useRef(false);

  // --- Helpers ---
  function parseDimensions(dimStr) {
    if (!dimStr) return { width: 1, height: 1, depth: 0.05 };
    const nums = dimStr.match(/\d+/g)?.map(Number);
    if (!nums || nums.length < 2) return { width: 1, height: 1, depth: 0.05 };
    return {
      width: nums[0] / 25,
      height: nums[1] / 25,
      depth: (nums[2] || 5) / 25
    };
  }

  function openYoutubeModal(videoId) {
    const existingModal = document.getElementById('yt-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'yt-modal';
    modal.style = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999;
      display: flex; align-items: center; justify-content: center; flex-direction: column;
    `;
    modal.addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('mousedown', (e) => e.stopPropagation());

    const iframe = document.createElement('iframe');
    iframe.width = "80%";
    iframe.height = "80%";
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;
  
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌ Fermer';
    closeBtn.style = `
      margin-top: 20px; padding: 10px 20px; font-size: 18px; cursor: pointer;
      border: none; border-radius: 5px; background: #fff; color: #000;
    `;
    closeBtn.onclick = () => modal.remove();
  
    modal.appendChild(iframe);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
  }

  // --- Création de Salle ---
  const createRoom = useCallback((scene, config) => {
    const group = new THREE.Group();
    const roomSize = 20;
    const roomHeight = 15;
    const pos = config.position;

    // SOL
    let floorColor = new THREE.Color(config.color).multiplyScalar(0.7);
    if (config.id === 'room1') floorColor = new THREE.Color(0x2a1850);
    if (config.id === 'room2') floorColor = new THREE.Color(0x401010);
    if (config.id === 'room3') floorColor = new THREE.Color(0x102838);

    const floorGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: floorColor, roughness: 0.9, metalness: 0.0
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(pos.x, 0, pos.z);
    group.add(floor);

    // PLAFOND
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: floorColor, roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(pos.x, roomHeight, pos.z);
    group.add(ceiling);

    // MURS
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.color), roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide
    });

    const createWall = (width, height, position, rotation) => {
      const geometry = new THREE.PlaneGeometry(width, height);
      const wall = new THREE.Mesh(geometry, wallMaterial.clone());
      wall.position.copy(position);
      wall.rotation.y = rotation;
      wallsRef.current.push(wall);
      return wall;
    };

    const halfSize = roomSize / 2;
    group.add(createWall(roomSize, roomHeight, new THREE.Vector3(pos.x, roomHeight/2, pos.z - halfSize), 0));
    group.add(createWall(roomSize, roomHeight, new THREE.Vector3(pos.x, roomHeight/2, pos.z + halfSize), Math.PI));
    group.add(createWall(roomSize, roomHeight, new THREE.Vector3(pos.x + halfSize, roomHeight/2, pos.z), -Math.PI/2));
    group.add(createWall(roomSize, roomHeight, new THREE.Vector3(pos.x - halfSize, roomHeight/2, pos.z), Math.PI/2));

    // Lumière
    const ambientLight = new THREE.PointLight(new THREE.Color(config.accentColor), 0.5, 30);
    ambientLight.position.set(pos.x, roomHeight - 1, pos.z);
    group.add(ambientLight);

    scene.add(group);
    return group;
  }, []);

  // --- Création Oeuvres ---
  // --- Création Oeuvres ---
  const createArtwork = useCallback((scene, artwork, roomConfig) => {
    let mesh;

    // --- LOGIQUE POUR LES SYMBOLES LUMINEUX (CARTEL ENFANT) ---
    const checkChildLabel = (art) => {
      // On vérifie si "Cartel Enfant" est présent dans la description ou les slides
      const textToSearch = art.descriptionSlides ? art.descriptionSlides[0] : (art.description || "");
      return textToSearch.includes("Cartel Enfant");
    };

    if (checkChildLabel(artwork)) {
      const markerGroup = new THREE.Group();
      
      // Petit cercle doré au sol
      const circleGeom = new THREE.CircleGeometry(0.4, 32);
      const circleMat = new THREE.MeshBasicMaterial({ 
        color: 0xffd700, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide 
      });
      const circle = new THREE.Mesh(circleGeom, circleMat);
      circle.rotation.x = -Math.PI / 2;
      circle.position.y = 0.05; // Juste au dessus du sol
      markerGroup.add(circle);

      // Petite lumière d'ambiance jaune sous l'œuvre
      const pointLight = new THREE.PointLight(0xffd700, 1.5, 3);
      pointLight.position.y = 0.5;
      markerGroup.add(pointLight);

      // Positionner le groupe au pied de l'œuvre (X et Z de l'œuvre, Y au sol)
      markerGroup.position.set(
        artwork.position?.x ?? roomConfig.position.x,
        0,
        artwork.position?.z ?? roomConfig.position.z
      );
      scene.add(markerGroup);
    }
    // -------------------------------------------------------

    // GLB
    if (artwork.type === 'glb') {
      const loader = new GLTFLoader();
      loader.load(artwork.url, (gltf) => {
        const model = gltf.scene;
        if (artwork.dimensions) {
          const dims = parseDimensions(artwork.dimensions);
          model.scale.set(dims.width, dims.height, dims.width);
        }
        model.position.set(
          artwork.position?.x ?? roomConfig.position.x,
          artwork.position?.y ?? 0,
          artwork.position?.z ?? roomConfig.position.z
        );
        model.rotation.set(
          artwork.rotation?.x || 0,
          artwork.rotation?.y || 0,
          artwork.rotation?.z || 0
        );
        model.userData = { type: 'artwork', data: artwork };
        model.traverse((child) => {
          if (child.isMesh) {
             child.castShadow = true; 
             child.receiveShadow = true;
             child.userData = { type: 'artwork', data: artwork };
          }
        });
        interactablesRef.current.push(model);
        scene.add(model);
      });
      return;
    }

    // Youtube
    if (artwork.type === 'youtube') {
      const thumbnailUrl = `https://img.youtube.com/vi/${artwork.youtubeId}/hqdefault.jpg`;
      const loader = new THREE.TextureLoader();
      const texture = loader.load(thumbnailUrl);
      const dims = parseDimensions(artwork.dimensions);
      const geom = new THREE.PlaneGeometry(dims.width, dims.height);
      const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(geom, mat);
      mesh.userData = { type: 'youtube', data: artwork };
    }
    // Painting
    else if (artwork.type === 'painting') {
      const frameGeom = new THREE.BoxGeometry(1, 1, 0.05);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
      mesh = new THREE.Mesh(frameGeom, frameMat);

      if (artwork.image) {
        new THREE.TextureLoader().load(artwork.image, (tex) => {
          const imgGeom = new THREE.PlaneGeometry(0.95, 0.95);
          const imgMat = new THREE.MeshBasicMaterial({ map: tex });
          const imgMesh = new THREE.Mesh(imgGeom, imgMat);
          imgMesh.position.z = 0.03;
          mesh.add(imgMesh);
        });
      }
      if (artwork.dimensions) {
        const dims = parseDimensions(artwork.dimensions);
        mesh.scale.set(dims.width, dims.height, 1);
      }
      mesh.userData = { type: 'artwork', data: artwork };
    }
    else {
      const geom = new THREE.SphereGeometry(0.5, 32, 32);
      const mat = new THREE.MeshStandardMaterial({ color: 'white' });
      mesh = new THREE.Mesh(geom, mat);
      mesh.userData = { type: 'artwork', data: artwork };
    }

    if (mesh) {
      mesh.position.set(
        artwork.position?.x ?? roomConfig.position.x,
        artwork.position?.y ?? 1.5,
        artwork.position?.z ?? roomConfig.position.z
      );
      if (artwork.rotation) {
        mesh.rotation.set(artwork.rotation.x||0, artwork.rotation.y||0, artwork.rotation.z||0);
      }
      interactablesRef.current.push(mesh);
      scene.add(mesh);
    }
  }, []);

  // --- Création Portes ---
  const createDoor = useCallback((scene, doorConfig) => {
    const doorGroup = new THREE.Group();

    const frameGeom = new THREE.BoxGeometry(2.5, 4, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({
      color: doorConfig.color, emissive: doorConfig.color, emissiveIntensity: 0.3
    });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    doorGroup.add(frame);

    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = (doorConfig.label === 'Esprit' || doorConfig.label === 'HALL') ? doorConfig.color : '#ffffff';
    ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(doorConfig.label, 128, 64);
    
    const labelGeom = new THREE.PlaneGeometry(2, 1);
    const labelMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas), side: THREE.DoubleSide
    });
    const label = new THREE.Mesh(labelGeom, labelMat);

    if (doorConfig.id === 'door_mind' || doorConfig.id === 'door_mind_back') {
      label.position.set(0, 0.5, -0.16);
      label.rotation.y = Math.PI;
    } else {
      label.position.set(0, 0.5, 0.16);
    }
    doorGroup.add(label);

    doorGroup.position.set(doorConfig.position.x, 2, doorConfig.position.z);
    doorGroup.rotation.y = doorConfig.rotation.y;

    doorGroup.userData = {
      type: 'door', targetRoom: doorConfig.targetRoom, hoverable: true
    };
    interactablesRef.current.push(doorGroup);
    scene.add(doorGroup);
  }, []);


  // ============================
  // MAIN EFFECT
  // ============================
  useEffect(() => {
    if (!containerRef.current || !isActive) return;
    
    // Si c'est juste un changement de isOverlayOpen, on ne veut pas tout recharger
    // Mais ici, l'architecture impérative nous oblige à tout recréer si on ne fait pas attention.
    // Pour l'instant, le code ci-dessous recrée tout si isActive change.
    // Comme isActive est toujours true dans la nouvelle version d'App.js, le canvas ne se recharge pas !
    
    // Note : On vide le container seulement si on est au premier rendu
    if (rendererRef.current) {
        // Le canvas existe déjà, on ne fait rien (on laisse les listeners gérer isOverlayOpen)
        return; 
    }

    interactablesRef.current = [];
    wallsRef.current = [];
    while(containerRef.current.firstChild) containerRef.current.removeChild(containerRef.current.firstChild);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 60);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.7, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Initialisation Monde
    createRoom(scene, ROOMS_CONFIG.room0);
    createRoom(scene, ROOMS_CONFIG.room1);
    createRoom(scene, ROOMS_CONFIG.room2);
    createRoom(scene, ROOMS_CONFIG.room3);
    DOORS_CONFIG.forEach(door => createDoor(scene, door));
    Object.entries(ARTWORKS).forEach(([roomId, artworks]) => {
      const roomConfig = ROOMS_CONFIG[roomId];
      if (artworks && Array.isArray(artworks)) {
        artworks.forEach(art => createArtwork(scene, art, roomConfig));
      }
    });

    // -----------------------------------------------------
    // BOUCLE D'ANIMATION
    // -----------------------------------------------------
    const animate = () => {
      requestAnimationFrame(animate);
      if (!rendererRef.current) return;

      const delta = clockRef.current.getDelta();
      const controls = controlsRef.current;
      const speed = controls.isRunning ? 50 : 25;

      // Calcul des vecteurs de direction
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0; 
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
      right.normalize();

      // Application du mouvement SEULEMENT si l'overlay est fermé
      // Cependant, on vérifie dans onKeyDown pour l'input, ici on applique juste la physique.
      // Si on veut être sûr, on peut reset les velocity si isOverlayOpen change,
      // mais gérer ça via les listeners est plus simple.

      if (controls.moveForward) camera.position.add(forward.multiplyScalar(speed * delta));
      if (controls.moveBackward) camera.position.add(forward.multiplyScalar(-speed * delta));
      if (controls.moveRight) camera.position.add(right.multiplyScalar(speed * delta));
      if (controls.moveLeft) camera.position.add(right.multiplyScalar(-speed * delta));

      // Limites de salle
      const currentRoom = currentRoomRef.current;
      if(ROOMS_CONFIG[currentRoom]) {
        const roomPos = ROOMS_CONFIG[currentRoom].position;
        const limit = 9; 
        camera.position.x = Math.max(roomPos.x - limit, Math.min(roomPos.x + limit, camera.position.x));
        camera.position.z = Math.max(roomPos.z - limit, Math.min(roomPos.z + limit, camera.position.z));
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
       // Clean up seulement si le composant est vraiment détruit
       if (rendererRef.current) {
         rendererRef.current.dispose();
         rendererRef.current = null;
       }
    };

  }, [isActive, createRoom, createArtwork, createDoor]); // Dépendances réduites pour éviter reload


  // -----------------------------------------------------
  // LISTENERS (Mis à jour pour utiliser la prop isOverlayOpen)
  // -----------------------------------------------------
  
  // On utilise un ref pour accéder à la valeur actuelle de isOverlayOpen dans les event listeners
  const isOverlayOpenRef = useRef(isOverlayOpen);
  useEffect(() => {
    isOverlayOpenRef.current = isOverlayOpen;
    // Si on ouvre l'overlay, on arrête tout mouvement en cours
    if (isOverlayOpen) {
        controlsRef.current = {
            moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, isRunning: false
        };
    }
  }, [isOverlayOpen]);


  useEffect(() => {
    const handleResize = () => {
      if(!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const onKeyDown = (e) => {
      // ⛔ BLOQUER SI OVERLAY OUVERT
      if (isOverlayOpenRef.current) return;

      switch(e.code) {
        case 'ArrowUp': case 'KeyW': case 'KeyZ': 
          controlsRef.current.moveForward = true; break;
        case 'ArrowDown': case 'KeyS': 
          controlsRef.current.moveBackward = true; break;
        case 'ArrowLeft': case 'KeyA': case 'KeyQ': 
          controlsRef.current.moveLeft = true; break;
        case 'ArrowRight': case 'KeyD': 
          controlsRef.current.moveRight = true; break;
        case 'ShiftLeft': 
          controlsRef.current.isRunning = true; break;
      }
    };

    const onKeyUp = (e) => {
      switch(e.code) {
        case 'ArrowUp': case 'KeyW': case 'KeyZ': 
          controlsRef.current.moveForward = false; break;
        case 'ArrowDown': case 'KeyS': 
          controlsRef.current.moveBackward = false; break;
        case 'ArrowLeft': case 'KeyA': case 'KeyQ': 
          controlsRef.current.moveLeft = false; break;
        case 'ArrowRight': case 'KeyD': 
          controlsRef.current.moveRight = false; break;
        case 'ShiftLeft': 
          controlsRef.current.isRunning = false; break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Souris
    const onMouseDown = (e) => {
      // ⛔ BLOQUER SI OVERLAY OUVERT
      if (isOverlayOpenRef.current) return;

      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
      isMouseDraggingRef.current = false;
    };

    const onMouseMove = (e) => {
      // ⛔ BLOQUER SI OVERLAY OUVERT
      if (isOverlayOpenRef.current) return;

      if (e.buttons === 0) return;
      const dx = e.clientX - mouseDownPosRef.current.x;
      const dy = e.clientY - mouseDownPosRef.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isMouseDraggingRef.current = true;

      yawRef.current -= e.movementX * 0.002;
      pitchRef.current -= e.movementY * 0.002;
      pitchRef.current = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, pitchRef.current));
      
      if(cameraRef.current) {
        cameraRef.current.rotation.order = 'YXZ';
        cameraRef.current.rotation.y = yawRef.current;
        cameraRef.current.rotation.x = pitchRef.current;
      }
    };

    const getInteractiveParent = (object) => {
      let current = object;
      while (current) {
        if (current.userData && (current.userData.type || current.userData.hoverable)) {
          return current;
        }
        current = current.parent;
      }
      return null;
    };

    const onMouseHover = (e) => {
       // ⛔ Optionnel : masquer curseur interactif si overlay ouvert
       if (isOverlayOpenRef.current) {
         if(containerRef.current) containerRef.current.style.cursor = 'default';
         return;
       }

      if(!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(interactablesRef.current, true);
      
      let isHovering = false;
      if (intersects.length > 0) {
        const hitObj = getInteractiveParent(intersects[0].object);
        if (hitObj) isHovering = true;
      }
      containerRef.current.style.cursor = isHovering ? 'pointer' : 'crosshair';
    };

    const onClick = (e) => {
      // ⛔ BLOQUER SI OVERLAY OUVERT
      if (isOverlayOpenRef.current) return;

      if (isMouseDraggingRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(interactablesRef.current, true);

      if (intersects.length > 0) {
        const targetObj = getInteractiveParent(intersects[0].object);

        if (targetObj) {
          const { type, data, targetRoom } = targetObj.userData;

          if (type === 'youtube' && data) {
            openYoutubeModal(data.youtubeId);
          } 
          else if (type === 'artwork' && data) {
            onArtworkClick(data);
          } 
          else if (type === 'door' && targetRoom) {
            const newRoomConfig = ROOMS_CONFIG[targetRoom];
            if (newRoomConfig) {
              cameraRef.current.position.set(newRoomConfig.position.x, 1.7, newRoomConfig.position.z);
              yawRef.current = 0; pitchRef.current = 0;
              cameraRef.current.rotation.set(0,0,0);
              currentRoomRef.current = targetRoom;
              if (onRoomChange) onRoomChange(targetRoom);
            }
          }
        }
      }
    };

    if (containerRef.current) {
        containerRef.current.addEventListener('mousedown', onMouseDown);
        containerRef.current.addEventListener('mousemove', onMouseMove);
        containerRef.current.addEventListener('mousemove', onMouseHover);
        containerRef.current.addEventListener('click', onClick);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', onMouseDown);
        containerRef.current.removeEventListener('mousemove', onMouseMove);
        containerRef.current.removeEventListener('mousemove', onMouseHover);
        containerRef.current.removeEventListener('click', onClick);
      }
    };

  }, []); // On laisse [] pour les listeners, on utilise isOverlayOpenRef pour lire la valeur fraîche

  // Mise à jour visibilité murs
  useEffect(() => {
    wallsRef.current.forEach(w => w.visible = wallsVisible);
  }, [wallsVisible]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0"
      style={{ touchAction: 'none', cursor: 'crosshair' }}
    />
  );
}