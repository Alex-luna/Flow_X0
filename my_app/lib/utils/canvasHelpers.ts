// Existing canvas helpers...

// Types for node positioning
export interface Position {
  x: number;
  y: number;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export interface ViewportInfo {
  x: number;
  y: number;
  zoom: number;
}

// Default node dimensions based on type
export const NODE_DIMENSIONS = {
  funnel: { width: 105, height: 135 },
  traditional: { width: 80, height: 30 },
  default: { width: 105, height: 135 }
};

// Grid settings for node positioning
export const GRID_SIZE = 16;
export const NODE_SPACING = 20; // Minimum space between nodes

/**
 * Check if two nodes would overlap given their positions and dimensions
 */
export function checkNodeCollision(
  pos1: Position, 
  dims1: NodeDimensions, 
  pos2: Position, 
  dims2: NodeDimensions,
  padding: number = NODE_SPACING
): boolean {
  const left1 = pos1.x - padding;
  const right1 = pos1.x + dims1.width + padding;
  const top1 = pos1.y - padding;
  const bottom1 = pos1.y + dims1.height + padding;

  const left2 = pos2.x;
  const right2 = pos2.x + dims2.width;
  const top2 = pos2.y;
  const bottom2 = pos2.y + dims2.height;

  return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2);
}

/**
 * Get node dimensions based on type
 */
export function getNodeDimensions(nodeType: string): NodeDimensions {
  if (nodeType === 'decision' || nodeType === 'process' || nodeType === 'data' || nodeType === 'connector') {
    return NODE_DIMENSIONS.traditional;
  }
  return NODE_DIMENSIONS.funnel;
}

/**
 * Check if a position is occupied by any existing node
 */
export function isPositionOccupied(
  position: Position, 
  nodeType: string, 
  existingNodes: Array<{ position: Position; data: { type: string } }>
): boolean {
  const newNodeDims = getNodeDimensions(nodeType);
  
  return existingNodes.some(node => {
    const existingNodeDims = getNodeDimensions(node.data.type);
    return checkNodeCollision(position, newNodeDims, node.position, existingNodeDims);
  });
}

/**
 * Snap position to grid
 */
export function snapToGrid(position: Position): Position {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
  };
}

/**
 * Find the next available position for a new node
 * Prioritizes positions to the right and slightly below existing nodes
 */
export function findFreePosition(
  preferredPosition: Position,
  nodeType: string,
  existingNodes: Array<{ position: Position; data: { type: string } }>,
  viewportInfo?: ViewportInfo,
  snapToGridEnabled: boolean = true
): Position {
  let testPosition = snapToGridEnabled ? snapToGrid(preferredPosition) : preferredPosition;
  
  // If the preferred position is free, use it
  if (!isPositionOccupied(testPosition, nodeType, existingNodes)) {
    return testPosition;
  }

  const step = GRID_SIZE * 2; // Move in grid increments
  
  // Search pattern: right first, then down-right, then down, then left, etc.
  const searchPattern = [
    { dx: 1, dy: 0 },   // Right
    { dx: 1, dy: 1 },   // Down-right
    { dx: 0, dy: 1 },   // Down
    { dx: -1, dy: 1 },  // Down-left
    { dx: -1, dy: 0 },  // Left  
    { dx: -1, dy: -1 }, // Up-left
    { dx: 0, dy: -1 },  // Up
    { dx: 1, dy: -1 },  // Up-right
  ];

  // Try increasing distances
  for (let distance = 1; distance <= 10; distance++) {
    for (const direction of searchPattern) {
      const candidatePosition = {
        x: preferredPosition.x + (direction.dx * step * distance),
        y: preferredPosition.y + (direction.dy * step * distance)
      };

      testPosition = snapToGridEnabled ? snapToGrid(candidatePosition) : candidatePosition;

      // Ensure position is within reasonable bounds (expanded for infinite canvas)
      if (testPosition.x < -50000 || testPosition.x > 50000 || testPosition.y < -50000 || testPosition.y > 50000) {
        continue;
      }

      if (!isPositionOccupied(testPosition, nodeType, existingNodes)) {
        return testPosition;
      }
    }
  }

  // Fallback: generate a position based on viewport center or existing nodes
  const fallbackPosition = generateFallbackPosition(existingNodes, viewportInfo);
  return snapToGridEnabled ? snapToGrid(fallbackPosition) : fallbackPosition;
}

/**
 * Generate a fallback position when no free space is found nearby
 */
function generateFallbackPosition(
  existingNodes: Array<{ position: Position; data: { type: string } }>,
  viewportInfo?: ViewportInfo
): Position {
  if (existingNodes.length === 0) {
    return viewportInfo ? 
      { x: viewportInfo.x, y: viewportInfo.y } : 
      { x: 250, y: 250 };
  }

  // Find the rightmost node and place new node to its right
  const rightmostNode = existingNodes.reduce((rightmost, node) => 
    node.position.x > rightmost.position.x ? node : rightmost
  );

  const rightmostDims = getNodeDimensions(rightmostNode.data.type);
  
  return {
    x: rightmostNode.position.x + rightmostDims.width + NODE_SPACING * 2,
    y: rightmostNode.position.y
  };
}

/**
 * Get the center position of the current viewport
 */
export function getViewportCenter(
  viewportInfo: ViewportInfo,
  canvasWidth: number = 800,
  canvasHeight: number = 600
): Position {
  return {
    x: -viewportInfo.x + (canvasWidth / 2) / viewportInfo.zoom,
    y: -viewportInfo.y + (canvasHeight / 2) / viewportInfo.zoom
  };
}

/**
 * Smart node positioning that considers viewport, existing nodes, and user preferences
 */
export function getSmartNodePosition(
  nodeType: string,
  existingNodes: Array<{ position: Position; data: { type: string } }>,
  viewportInfo?: ViewportInfo,
  clickPosition?: Position,
  snapToGridEnabled: boolean = true
): Position {
  let preferredPosition: Position;

  if (clickPosition) {
    // User clicked/dropped at specific position
    preferredPosition = clickPosition;
  } else if (viewportInfo) {
    // Use viewport center as preferred position
    preferredPosition = getViewportCenter(viewportInfo);
  } else {
    // Fallback to default position
    preferredPosition = { x: 250, y: 250 };
  }

  return findFreePosition(preferredPosition, nodeType, existingNodes, viewportInfo, snapToGridEnabled);
} 