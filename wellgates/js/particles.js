document.addEventListener("DOMContentLoaded", () => {
    let container = document.getElementById('particles-container');
    
    // If container doesn't exist, create it across the whole viewport automatically
    if (!container) {
      container = document.createElement("div");
      container.id = 'particles-container';
      container.style.position = 'fixed';
      container.style.inset = '0';
      container.style.zIndex = '-1';
      container.style.pointerEvents = 'none';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    const color = "#8a9a65"; // Wellgates olive/gold complementary color
    const count = 180; // Increased count for density across full screen

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 40; // Pulled back slightly for a wider web

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn("WebGL not supported or context creation failed:", e);
      return;
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const originalPositions = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 80; // Wider spawn area
      const y = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 40;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions.push({ x, y, z });
      velocities.push({
        x: (Math.random() - 0.5) * 0.1, // More initial movement
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.45,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.18,
    });
    const linesGeometry = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lines);

    let mouseX = 0;
    let mouseY = 0;
    let frameId;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / height) * 2 + 1;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        mouseX = ((touch.clientX - rect.left) / width) * 2 - 1;
        mouseY = -((touch.clientY - rect.top) / height) * 2 + 1;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchstart", handleTouchMove);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      const positionsAttr = particles.geometry.attributes.position.array;
      
      const mouseEffectX = mouseX * 35 + Math.sin(time * 0.8) * 2.5; 
      const mouseEffectY = mouseY * 25 + Math.cos(time * 0.6) * 2.5;

      for (let i = 0; i < count; i++) {
        // Individual unpredictable wandering
        const wanderX = Math.sin(time * 1.5 + i) * 1.2;
        const wanderY = Math.cos(time * 1.2 + i * 2) * 1.2;

        const targetX = originalPositions[i].x + mouseEffectX + wanderX;
        const targetY = originalPositions[i].y + mouseEffectY + wanderY;
        const targetZ = originalPositions[i].z + Math.sin(time + i) * 1.5;
        
        const dx = targetX - positionsAttr[i * 3];
        const dy = targetY - positionsAttr[i * 3 + 1];
        const dz = targetZ - positionsAttr[i * 3 + 2];
        
        // Increased tension (snappier response to mouse)
        velocities[i].x += dx * 0.003;
        velocities[i].y += dy * 0.003;
        velocities[i].z += dz * 0.003;

        positionsAttr[i * 3] += velocities[i].x;
        positionsAttr[i * 3 + 1] += velocities[i].y;
        positionsAttr[i * 3 + 2] += velocities[i].z;

        // Less friction = bouncier, more lively movement
        velocities[i].x *= 0.92;
        velocities[i].y *= 0.92;
        velocities[i].z *= 0.92;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      
      const linePositions = [];
      const connectDistance = 11;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = positionsAttr[i * 3] - positionsAttr[j * 3];
          const dy = positionsAttr[i * 3 + 1] - positionsAttr[j * 3 + 1];
          const dz = positionsAttr[i * 3 + 2] - positionsAttr[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < connectDistance) {
            linePositions.push(
              positionsAttr[i * 3],
              positionsAttr[i * 3 + 1],
              positionsAttr[i * 3 + 2],
              positionsAttr[j * 3],
              positionsAttr[j * 3 + 1],
              positionsAttr[j * 3 + 2]
            );
          }
        }
      }

      lines.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );

      scene.rotation.x += (mouseY * 0.15 - scene.rotation.x) * 0.08;
      scene.rotation.y += (mouseX * 0.15 - scene.rotation.y) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);
});
