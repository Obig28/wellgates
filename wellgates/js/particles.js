document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const color = "#8a9a65"; // Wellgates olive/gold complementary color
    const count = 60;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;

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
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 30;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions.push({ x, y, z });
      velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.05,
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.4,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.15,
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
      
      const mouseEffectX = mouseX * 15 + Math.sin(time * 0.5) * 1.5; 
      const mouseEffectY = mouseY * 10 + Math.cos(time * 0.3) * 1.5;

      for (let i = 0; i < count; i++) {
        const targetX = originalPositions[i].x + mouseEffectX;
        const targetY = originalPositions[i].y + mouseEffectY;
        const targetZ = originalPositions[i].z;
        
        const dx = targetX - positionsAttr[i * 3];
        const dy = targetY - positionsAttr[i * 3 + 1];
        const dz = targetZ - positionsAttr[i * 3 + 2];
        
        velocities[i].x += dx * 0.0008;
        velocities[i].y += dy * 0.0008;
        velocities[i].z += dz * 0.0008;

        positionsAttr[i * 3] += velocities[i].x;
        positionsAttr[i * 3 + 1] += velocities[i].y;
        positionsAttr[i * 3 + 2] += velocities[i].z;

        velocities[i].x *= 0.95;
        velocities[i].y *= 0.95;
        velocities[i].z *= 0.95;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      
      const linePositions = [];
      const connectDistance = 9;
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

      scene.rotation.x += (mouseY * 0.1 - scene.rotation.x) * 0.05;
      scene.rotation.y += (mouseX * 0.1 - scene.rotation.y) * 0.05;

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
