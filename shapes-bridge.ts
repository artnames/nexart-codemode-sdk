/**
 * Shapes Bridge for Code Mode
 * 
 * Injects H.* frozen globals for Shapes rendering in Code Mode.
 * H = geometric/shapes namespace (avoiding S which is used by SoundArt).
 */

import type { ShapesSnapshot, ShapeDefinition } from '../../shared/shapesSnapshot';
import type { P5Runtime } from './p5-runtime';

export interface ShapesGlobals {
  H: {
    backgroundColor: string;
    shapes: readonly ShapeDefinition[];
    shapeCount: number;
    strokeCount: number;
    seed: number;
    canvasWidth: number;
    canvasHeight: number;
  };
}

/**
 * Create frozen H.* globals from a ShapesSnapshot
 */
export function createShapesGlobals(snapshot: ShapesSnapshot): ShapesGlobals {
  const H = Object.freeze({
    backgroundColor: snapshot.backgroundColor,
    shapes: Object.freeze(snapshot.shapes.map(s => Object.freeze({ ...s }))),
    shapeCount: snapshot.shapes.length,
    strokeCount: snapshot.strokeCount,
    seed: snapshot.seed,
    canvasWidth: snapshot.canvasWidth,
    canvasHeight: snapshot.canvasHeight,
  });
  
  return { H };
}

/**
 * Inject Shapes globals into the runtime
 */
export function injectShapesGlobals(
  runtime: P5Runtime,
  snapshot: ShapesSnapshot
): P5Runtime & ShapesGlobals {
  const globals = createShapesGlobals(snapshot);
  
  console.log('[Shapes] Injecting H.* globals:', {
    shapeCount: globals.H.shapeCount,
    backgroundColor: globals.H.backgroundColor,
    seed: globals.H.seed,
  });
  
  return {
    ...runtime,
    ...globals,
  };
}

/**
 * Generate a sketch that renders all shapes from H.* globals
 */
export function getShapesSketchCode(): string {
  return `
function setup() {
  background(H.backgroundColor);
  
  for (var i = 0; i < H.shapeCount; i++) {
    var shape = H.shapes[i];
    
    push();
    translate(shape.x, shape.y);
    rotate(radians(shape.rotation));
    
    if (shape.fillColor) {
      fill(shape.fillColor);
    } else {
      noFill();
    }
    
    if (shape.strokeColor && shape.strokeWidth > 0) {
      stroke(shape.strokeColor);
      strokeWeight(shape.strokeWidth);
    } else {
      noStroke();
    }
    
    if (shape.type === 'circle') {
      ellipse(0, 0, shape.size, shape.size);
    } else if (shape.type === 'square') {
      rect(-shape.size/2, -shape.size/2, shape.size, shape.size);
    } else if (shape.type === 'triangle') {
      var h = (Math.sqrt(3) / 2) * shape.size;
      triangle(0, -h/2, shape.size/2, h/2, -shape.size/2, h/2);
    } else if (shape.type === 'hexagon') {
      beginShape();
      for (var j = 0; j < 6; j++) {
        var angle = (Math.PI / 3) * j;
        vertex((shape.size/2) * Math.cos(angle), (shape.size/2) * Math.sin(angle));
      }
      endShape(CLOSE);
    } else if (shape.type === 'line') {
      line(-shape.size/2, 0, shape.size/2, 0);
    }
    
    pop();
  }
}
`;
}
