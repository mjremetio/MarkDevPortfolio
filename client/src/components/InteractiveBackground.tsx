import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/hooks/useTheme';

const InteractiveBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);
    
    // Create constellation stars
    const starCount = 100;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    // Use consistent brand colors with your theme
    const primaryColor = theme === 'dark' ? 0x6366f1 : 0x4f46e5; // Indigo
    const secondaryColor = theme === 'dark' ? 0xec4899 : 0xdb2777; // Pink
    
    const color1 = new THREE.Color(primaryColor);
    const color2 = new THREE.Color(secondaryColor);
    
    const stars: THREE.Vector3[] = [];
    
    for (let i = 0; i < starCount; i++) {
      // Position stars in a more structured pattern for constellation-like effect
      const radius = 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
      
      stars.push(new THREE.Vector3(x, y, z));
      
      // Color
      const mixRatio = Math.random();
      const starColor = new THREE.Color().lerpColors(color1, color2, mixRatio);
      
      starColors[i * 3] = starColor.r;
      starColors[i * 3 + 1] = starColor.g;
      starColors[i * 3 + 2] = starColor.b;
      
      // Size - make some stars larger for visual interest
      starSizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    // Create star shader material
    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float distance = length(gl_PointCoord - vec2(0.5, 0.5));
          if (distance > 0.5) discard;
          
          // Create a star-like glow effect
          float intensity = 1.0 - distance * 2.0;
          gl_FragColor = vec4(vColor, intensity);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
    
    const starSystem = new THREE.Points(starGeometry, starMaterial);
    scene.add(starSystem);
    
    // Create constellation lines
    const linesMaterial = new THREE.LineBasicMaterial({ 
      color: theme === 'dark' ? 0x6366f1 : 0x4f46e5,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    
    // Create connections between stars to form constellations
    const constellationLines: THREE.Line[] = [];
    
    // Create some predefined constellation shapes
    const constellationShapes = [
      // Pentagon
      (centerX: number, centerY: number, centerZ: number, size: number) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          points.push(new THREE.Vector3(
            centerX + Math.cos(angle) * size,
            centerY + Math.sin(angle) * size,
            centerZ
          ));
        }
        points.push(points[0]); // Close the shape
        return points;
      },
      // Triangle
      (centerX: number, centerY: number, centerZ: number, size: number) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          points.push(new THREE.Vector3(
            centerX + Math.cos(angle) * size,
            centerY + Math.sin(angle) * size,
            centerZ
          ));
        }
        points.push(points[0]); // Close the shape
        return points;
      },
      // Square
      (centerX: number, centerY: number, centerZ: number, size: number) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          points.push(new THREE.Vector3(
            centerX + Math.cos(angle) * size,
            centerY + Math.sin(angle) * size,
            centerZ
          ));
        }
        points.push(points[0]); // Close the shape
        return points;
      },
      // Custom shape (e.g., house-like)
      (centerX: number, centerY: number, centerZ: number, size: number) => {
        return [
          new THREE.Vector3(centerX - size, centerY - size, centerZ),
          new THREE.Vector3(centerX + size, centerY - size, centerZ),
          new THREE.Vector3(centerX + size, centerY + size * 0.5, centerZ),
          new THREE.Vector3(centerX, centerY + size * 1.2, centerZ),
          new THREE.Vector3(centerX - size, centerY + size * 0.5, centerZ),
          new THREE.Vector3(centerX - size, centerY - size, centerZ)
        ];
      }
    ];
    
    // Create constellation shapes
    const constellationCount = 4; 
    
    for (let c = 0; c < constellationCount; c++) {
      const shapeIndex = Math.floor(Math.random() * constellationShapes.length);
      const shape = constellationShapes[shapeIndex];
      
      // Random position and size for the shape
      const centerX = (Math.random() - 0.5) * 6;
      const centerY = (Math.random() - 0.5) * 6;
      const centerZ = (Math.random() - 0.5) * 6;
      const size = 1 + Math.random() * 2;
      
      const points = shape(centerX, centerY, centerZ, size);
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, linesMaterial);
      constellationLines.push(line);
      scene.add(line);
      
      // Add stars at the vertices of the shape
      points.forEach(point => {
        const starIndex = Math.floor(Math.random() * starCount);
        starPositions[starIndex * 3] = point.x;
        starPositions[starIndex * 3 + 1] = point.y;
        starPositions[starIndex * 3 + 2] = point.z;
        
        // Make these stars a bit brighter
        starSizes[starIndex] = Math.random() * 0.2 + 0.1;
        
        // Update the stars array with the new position
        stars[starIndex] = new THREE.Vector3(point.x, point.y, point.z);
      });
    }
    
    // Update star geometry after modifications
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    // Add some random connections between stars for a natural look
    const connectionCount = 20;
    for (let i = 0; i < connectionCount; i++) {
      const index1 = Math.floor(Math.random() * starCount);
      const index2 = Math.floor(Math.random() * starCount);
      
      // Only connect if stars are reasonably close to each other
      const star1 = stars[index1];
      const star2 = stars[index2];
      const distance = star1.distanceTo(star2);
      
      if (distance < 3) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([star1, star2]);
        const line = new THREE.Line(lineGeometry, linesMaterial);
        constellationLines.push(line);
        scene.add(line);
      }
    }
    
    camera.position.z = 10;
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Very slow, gentle rotation effect
      starSystem.rotation.x += 0.0003;
      starSystem.rotation.y += 0.0004;
      
      // Add slight breathing effect to the entire system
      const breathingScale = 1 + 0.02 * Math.sin(time * 0.3);
      starSystem.scale.set(breathingScale, breathingScale, breathingScale);
      
      // Rotate all constellation lines to match the stars
      constellationLines.forEach((line, index) => {
        line.rotation.x = starSystem.rotation.x;
        line.rotation.y = starSystem.rotation.y;
        
        // Make lines pulsate with different frequencies
        const lineMaterial = line.material as THREE.LineBasicMaterial;
        lineMaterial.opacity = 0.1 + 0.2 * Math.sin(time * 0.2 + index * 0.5);
      });
      
      // Subtle camera movement based on mouse
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      
      // Enhanced twinkle effect for stars
      const sizes = starSystem.geometry.attributes.size.array as Float32Array;
      const colors = starSystem.geometry.attributes.color.array as Float32Array;
      
      for (let i = 0; i < starCount; i++) {
        // Size twinkle
        const originalSize = starSizes[i];
        const twinkleFactor = 1 + 0.3 * Math.sin(time * (0.5 + Math.random() * 0.5) + i * 3.14);
        sizes[i] = originalSize * twinkleFactor;
        
        // Color brightness twinkle - subtle effect
        const i3 = i * 3;
        const brightness = 0.9 + 0.2 * Math.sin(time * 0.7 + i);
        
        colors[i3] = Math.min(colors[i3] * brightness, 1.0);
        colors[i3 + 1] = Math.min(colors[i3 + 1] * brightness, 1.0);
        colors[i3 + 2] = Math.min(colors[i3 + 2] * brightness, 1.0);
      }
      
      starSystem.geometry.attributes.size.needsUpdate = true;
      starSystem.geometry.attributes.color.needsUpdate = true;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      
      // Clean up resources
      scene.remove(starSystem);
      starGeometry.dispose();
      (starMaterial as THREE.Material).dispose();
      
      constellationLines.forEach(line => {
        scene.remove(line);
        line.geometry.dispose();
      });
      (linesMaterial as THREE.Material).dispose();
    };
  }, [theme]);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default InteractiveBackground;