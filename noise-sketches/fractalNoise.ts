/**
 * Fractal Noise - Code Mode Sketch
 * 
 * This sketch implements Perlin FBM and Cellular noise rendering
 * through the Code Mode p5-runtime. Uses N.* globals for all parameters.
 * 
 * Original: client/src/components/noise-canvas-simple.tsx
 */

export const FRACTAL_NOISE_SKETCH = `
// Fractal Noise - Code Mode Sketch
// Uses N.* noise globals and standard p5-like functions

function setup() {
  // Set seeded random for reproducibility
  randomSeed(N.seed);
  noiseSeed(N.seed);
  
  // Set background color
  background(N.bgR, N.bgG, N.bgB);
  
  // Noise rendering parameters
  const adjustedScale = N.scale * (1 / N.zoom) * 0.05;
  const cellSize = 4; // Fixed for quality
  
  // Generate cellular points if needed
  const numPoints = Math.floor(20 + N.cellDensity * 180);
  const cellPoints = [];
  for (let i = 0; i < numPoints; i++) {
    cellPoints.push([random(0, width), random(0, height)]);
  }
  
  // Helper: Perlin FBM (Fractional Brownian Motion)
  function perlinFBM(x, y, scale) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    const oct = Math.min(N.octaves, 6); // Cap for performance
    
    for (let i = 0; i < oct; i++) {
      value += noise(x * scale * frequency, y * scale * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= N.persistence;
      frequency *= N.lacunarity;
    }
    
    return value / maxValue;
  }
  
  // Helper: Cellular noise (Worley)
  function cellularNoise(x, y, points) {
    let sampleX = x;
    let sampleY = y;
    
    // Warp distortion if using warp mode
    if (N.isWarp && N.cellDistortion > 0) {
      const distortionAmount = N.cellDistortion * 100;
      sampleX += noise(x * 0.01, y * 0.01) * distortionAmount;
      sampleY += noise(y * 0.01, x * 0.01) * distortionAmount;
    }
    
    // Find distances to closest points
    let minDist = 999999;
    let secondMinDist = 999999;
    
    for (let i = 0; i < points.length; i++) {
      const px = points[i][0];
      const py = points[i][1];
      const dx = sampleX - px;
      const dy = sampleY - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < minDist) {
        secondMinDist = minDist;
        minDist = dist;
      } else if (dist < secondMinDist) {
        secondMinDist = dist;
      }
    }
    
    // Normalize distance
    return Math.min(1.0, (secondMinDist - minDist) / 50);
  }
  
  // Render the noise grid
  noStroke();
  
  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      // Calculate Perlin value
      const perlinValue = perlinFBM(x, y, adjustedScale);
      
      // Calculate final value based on blend mode
      let finalValue = perlinValue;
      
      if (!N.isPerlinOnly) {
        const cellValue = cellularNoise(x, y, cellPoints);
        
        if (N.isBlend) {
          finalValue = perlinValue * cellValue;
        } else if (N.isWarp) {
          finalValue = (perlinValue + cellValue) / 2;
        } else if (N.isInterleave) {
          finalValue = (Math.floor(x / 20) + Math.floor(y / 20)) % 2 === 0
            ? perlinValue
            : cellValue;
        }
      }
      
      // Set opacity based on noise value
      const alpha = map(finalValue, 0, 1, 0, 255);
      
      // Fill with noise color and calculated alpha
      fill(N.noiseR, N.noiseG, N.noiseB, alpha);
      rect(x, y, cellSize, cellSize);
    }
  }
}
`;

export default FRACTAL_NOISE_SKETCH;
