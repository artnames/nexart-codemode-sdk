/**
 * NexArt Code Mode Phase 1 Validation Test Sketches
 * 
 * These sketches validate the Phase 1 requirements:
 * - Push/pop transform isolation
 * - VAR[0..9] response
 * - Deterministic output (same seed = same output)
 * - Loop mode animation
 * - Color format support
 * - Error handling for forbidden APIs
 */

export const validationSketches = {
  /**
   * Test 1: Transform Stack Isolation
   * Validates that push()/pop() correctly isolates transform state.
   */
  transformStack: `
function setup() {
  background('#1a1a2e');
  
  // Original state
  fill(255);
  noStroke();
  
  // Draw center reference
  ellipse(width/2, height/2, 20);
  
  // Push, transform, draw
  push();
    translate(width/2, height/2);
    rotate(PI/4);
    fill(255, 0, 0);
    rect(-100, -100, 200, 200);
  pop();
  
  // After pop - should be back to original transform
  // This circle should be at top-left corner, not rotated
  fill(0, 255, 0);
  ellipse(100, 100, 80);
  
  // Nested push/pop
  push();
    translate(width - 200, 200);
    push();
      scale(2);
      fill(0, 0, 255);
      rect(0, 0, 50, 50);
    pop();
    // After inner pop - should be at translate but not scaled
    fill(255, 255, 0);
    rect(60, 0, 50, 50);
  pop();
  
  // After outer pop - original coords
  fill(255, 0, 255);
  ellipse(width - 100, height - 100, 60);
}`,

  /**
   * Test 2: VAR[0..3] Response
   * Validates that protocol variables control artwork output.
   */
  varResponse: `
function setup() {
  background(0);
  noStroke();
  
  // VAR[0] controls number of shapes (0-100 → 5-50)
  let count = map(VAR[0], 0, 100, 5, 50);
  
  // VAR[1] controls hue (0-100 → 0-360)
  let hueBase = map(VAR[1], 0, 100, 0, 360);
  
  // VAR[2] controls size (0-100 → 20-100)
  let size = map(VAR[2], 0, 100, 20, 100);
  
  // VAR[3] controls opacity (0-100 → 50-255)
  let alpha = map(VAR[3], 0, 100, 50, 255);
  
  colorMode(HSB, 360, 100, 100, 255);
  
  for (let i = 0; i < count; i++) {
    let x = random(width);
    let y = random(height);
    let h = (hueBase + i * 10) % 360;
    
    fill(h, 80, 90, alpha);
    ellipse(x, y, size);
  }
  
  // Display VAR values for verification
  fill(255);
  textSize(40);
  text('VAR[0]=' + VAR[0] + ' (count=' + Math.round(count) + ')', 50, 100);
  text('VAR[1]=' + VAR[1] + ' (hue=' + Math.round(hueBase) + ')', 50, 150);
  text('VAR[2]=' + VAR[2] + ' (size=' + Math.round(size) + ')', 50, 200);
  text('VAR[3]=' + VAR[3] + ' (alpha=' + Math.round(alpha) + ')', 50, 250);
}`,

  /**
   * Test 3: Determinism
   * Same seed should produce identical output across runs.
   */
  determinism: `
function setup() {
  background('#0f0f23');
  
  // Seed is set externally, but we can verify determinism
  // by using random() and noise() which should be seeded
  
  noStroke();
  
  // Generate "random" pattern - should be identical with same seed
  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    let r = random(10, 50);
    
    fill(random(255), random(255), random(255), 200);
    ellipse(x, y, r);
  }
  
  // Noise-based gradient - should be identical with same seed
  for (let x = 0; x < width; x += 20) {
    for (let y = height - 300; y < height; y += 20) {
      let n = noise(x * 0.01, y * 0.01);
      fill(n * 255);
      rect(x, y, 20, 20);
    }
  }
}`,

  /**
   * Test 4: Loop Mode Animation
   * Validates smooth animation using normalized time t.
   */
  loopAnimation: `
function setup() {
  // Initialize any one-time state
}

function draw() {
  background('#1a1a2e');
  
  let centerX = width / 2;
  let centerY = height / 2;
  
  // Use VAR for customization
  let ringCount = map(VAR[0], 0, 100, 3, 12);
  let rotationSpeed = map(VAR[1], 0, 100, 1, 5);
  
  noFill();
  strokeWeight(3);
  
  // Animated rings
  for (let i = 0; i < ringCount; i++) {
    let phase = i / ringCount;
    let angle = (t * rotationSpeed + phase) * TWO_PI;
    let radius = 100 + i * 60 + sin(angle) * 30;
    
    // Color interpolation
    let c = lerpColor('#ff6b6b', '#4ecdc4', phase);
    stroke(c);
    
    push();
      translate(centerX, centerY);
      rotate(angle * 0.5);
      ellipse(0, 0, radius * 2, radius * 1.5);
    pop();
  }
  
  // Center pulsing circle
  let pulse = 0.5 + sin(t * TWO_PI * 3) * 0.5;
  fill(lerpColor('#ffffff', '#ff6b6b', pulse));
  noStroke();
  ellipse(centerX, centerY, 100 + pulse * 50);
}`,

  /**
   * Test 5: Color Format Support
   * Validates all supported color formats.
   */
  colorFormats: `
function setup() {
  background(30);
  noStroke();
  
  let y = 100;
  let boxSize = 150;
  let gap = 20;
  let x = 50;
  
  // Grayscale
  fill(0);
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill(128);
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill(255);
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill(128, 127); // Gray with alpha
  rect(x, y, boxSize, boxSize);
  
  // RGB values
  y += boxSize + gap * 2;
  x = 50;
  
  fill(255, 0, 0);
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill(0, 255, 0);
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill(0, 0, 255);
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill(255, 0, 0, 128); // Red with alpha
  rect(x, y, boxSize, boxSize);
  
  // Hex colors
  y += boxSize + gap * 2;
  x = 50;
  
  fill('#f6f5f2');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('#ff6b6b');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('#4ecdc4');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('#fff'); // Short hex
  rect(x, y, boxSize, boxSize);
  
  // CSS rgb/rgba
  y += boxSize + gap * 2;
  x = 50;
  
  fill('rgb(246,245,242)');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('rgb(255, 107, 107)');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('rgba(78, 205, 196, 0.8)');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('rgba(255, 0, 0, 0.5)');
  rect(x, y, boxSize, boxSize);
  
  // CSS hsl
  y += boxSize + gap * 2;
  x = 50;
  
  fill('hsl(180, 50%, 50%)');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('hsl(0, 100%, 50%)');
  rect(x, y, boxSize, boxSize);
  x += boxSize + gap;
  
  fill('hsla(240, 100%, 50%, 0.7)');
  rect(x, y, boxSize, boxSize);
  
  // lerpColor test
  y += boxSize + gap * 2;
  x = 50;
  
  let c1 = color('#ff0000');
  let c2 = color('#0000ff');
  
  for (let i = 0; i <= 10; i++) {
    let t = i / 10;
    fill(lerpColor(c1, c2, t));
    rect(x + i * 60, y, 55, boxSize);
  }
}`,

  /**
   * Test 6: Forbidden API Detection
   * This sketch should FAIL with a clear error.
   */
  forbiddenAsync: `
function setup() {
  background(255);
  
  // This should throw an error
  setTimeout(() => {
    ellipse(100, 100, 50);
  }, 1000);
}`,

  /**
   * Test 7: Color Function Extraction
   * Validates red(), green(), blue(), hue(), saturation(), brightness()
   */
  colorExtraction: `
function setup() {
  background(30);
  fill(255);
  textSize(30);
  
  let testColor = color('#ff6b6b');
  
  // Extract and display color components
  let y = 100;
  text('Test color: #ff6b6b', 50, y); y += 50;
  text('red(): ' + red(testColor), 50, y); y += 50;
  text('green(): ' + green(testColor), 50, y); y += 50;
  text('blue(): ' + blue(testColor), 50, y); y += 50;
  text('alpha(): ' + alpha(testColor), 50, y); y += 50;
  text('hue(): ' + hue(testColor).toFixed(1), 50, y); y += 50;
  text('saturation(): ' + saturation(testColor).toFixed(1), 50, y); y += 50;
  text('brightness(): ' + brightness(testColor).toFixed(1), 50, y); y += 100;
  
  // Visual color swatch
  noStroke();
  fill(testColor);
  rect(50, y, 200, 200);
  
  // HSB color test
  colorMode(HSB, 360, 100, 100);
  fill(180, 80, 90);
  rect(300, y, 200, 200);
  
  // Extract from HSB color
  fill(255);
  colorMode(RGB, 255);
  let hsbColor = 'hsl(180, 80%, 45%)';
  y += 250;
  text('hsl(180, 80%, 45%):', 50, y); y += 50;
  text('hue(): ' + hue(hsbColor).toFixed(1), 50, y);
}`,

  /**
   * Test 8: VAR Write Protection
   * This sketch should FAIL with a descriptive error about VAR being read-only.
   * Validates Phase 1 Protocol enforcement.
   */
  varWriteProtection: `
function setup() {
  background(255);
  
  // This should throw a protocol error:
  // "[Code Mode Protocol Error] VAR is read-only. Cannot write to VAR[0]."
  VAR[0] = 50;
  
  // This should never execute
  ellipse(100, 100, 50);
}`,

  /**
   * Test 9: VAR Read Verification
   * Validates that VAR values are correctly injected and readable.
   */
  varReadVerification: `
function setup() {
  background('#1a1a2e');
  fill(255);
  textSize(40);
  
  // Display all VAR values
  let y = 100;
  for (let i = 0; i < 10; i++) {
    text('VAR[' + i + '] = ' + VAR[i], 50, y);
    y += 60;
  }
  
  // Verify VAR.length is exactly 10
  text('VAR.length = ' + VAR.length, 50, y);
  y += 60;
  
  // Verify VAR is frozen
  text('Object.isFrozen(VAR) = ' + Object.isFrozen(VAR), 50, y);
}`
};

/**
 * Run validation tests
 * Returns array of test results
 */
export function runValidationTests() {
  console.log('Phase 1 Validation Sketches ready for testing:');
  console.log('1. transformStack - Test push()/pop() isolation');
  console.log('2. varResponse - Test VAR[0..3] parameter control');
  console.log('3. determinism - Test same seed = same output');
  console.log('4. loopAnimation - Test smooth loop mode animation');
  console.log('5. colorFormats - Test all color format support');
  console.log('6. forbiddenAsync - Should FAIL with error');
  console.log('7. colorExtraction - Test color function extraction');
  console.log('8. varWriteProtection - Should FAIL with protocol error');
  console.log('9. varReadVerification - Test VAR injection and frozen state');
  
  return Object.keys(validationSketches);
}
