'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, Circle, Line, Path, Text } from 'fabric';

const EDITOR_WIDTH = 1000;
const EDITOR_HEIGHT = 550;
const GRID_SIZE = 25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

function getCircleThroughPoints(first, middle, last) {
  const denominator = 2 * (first.x * (middle.y - last.y) + middle.x * (last.y - first.y) + last.x * (first.y - middle.y));
  if (Math.abs(denominator) < 0.001) return null;

  const firstSquare = first.x ** 2 + first.y ** 2;
  const middleSquare = middle.x ** 2 + middle.y ** 2;
  const lastSquare = last.x ** 2 + last.y ** 2;
  const center = {
    x: (firstSquare * (middle.y - last.y) + middleSquare * (last.y - first.y) + lastSquare * (first.y - middle.y)) / denominator,
    y: (firstSquare * (last.x - middle.x) + middleSquare * (first.x - last.x) + lastSquare * (middle.x - first.x)) / denominator
  };
  return { center, radius: Math.hypot(first.x - center.x, first.y - center.y) };
}

function getCircleWithRadius(first, last, radius, tangentStart, tangent) {
  const chordX = last.x - first.x;
  const chordY = last.y - first.y;
  const chordLength = Math.hypot(chordX, chordY);
  if (!Number.isFinite(radius) || radius <= 0 || chordLength === 0 || chordLength > radius * 2) return null;

  const midpoint = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 };
  const offset = Math.sqrt(Math.max(0, radius * radius - (chordLength / 2) ** 2));
  const normal = { x: -chordY / chordLength, y: chordX / chordLength };
  const candidates = [
    { x: midpoint.x + normal.x * offset, y: midpoint.y + normal.y * offset },
    { x: midpoint.x - normal.x * offset, y: midpoint.y - normal.y * offset }
  ];

  if (tangent && tangentStart) {
    const direction = { x: first.x - tangentStart.x, y: first.y - tangentStart.y };
    const center = candidates.sort((left, right) => {
      const leftSide = direction.x * (left.y - first.y) - direction.y * (left.x - first.x);
      const rightSide = direction.x * (right.y - first.y) - direction.y * (right.x - first.x);
      return Math.abs(rightSide) - Math.abs(leftSide);
    })[0];
    return { center, radius };
  }
  return { center: candidates[0], radius };
}

function getArcDefinitionFromCircle(first, last, circle, tangentStart, tangent) {
  const startAngle = Math.atan2(first.y - circle.center.y, first.x - circle.center.x);
  const endAngle = Math.atan2(last.y - circle.center.y, last.x - circle.center.x);
  const fullTurn = Math.PI * 2;
  const tangentVector = tangentStart
    ? { x: first.x - tangentStart.x, y: first.y - tangentStart.y }
    : null;
  const radiusVector = { x: first.x - circle.center.x, y: first.y - circle.center.y };
  const clockwiseTangent = { x: radiusVector.y, y: -radiusVector.x };
  const counterClockwiseTangent = { x: -radiusVector.y, y: radiusVector.x };
  const clockwise = tangent && tangentVector
    ? (clockwiseTangent.x * tangentVector.x + clockwiseTangent.y * tangentVector.y) > (counterClockwiseTangent.x * tangentVector.x + counterClockwiseTangent.y * tangentVector.y)
    : false;
  const delta = clockwise ? startAngle - endAngle : endAngle - startAngle;
  const angle = delta < 0 ? delta + fullTurn : delta;
  const largeArc = tangent ? angle > Math.PI : angle > Math.PI;
  return {
    direction: clockwise ? 0 : 1,
    sweep: largeArc ? 1 : 0,
    path: `M ${first.x} ${first.y} A ${circle.radius} ${circle.radius} 0 ${largeArc ? 1 : 0} ${clockwise ? 0 : 1} ${last.x} ${last.y}`
  };
}

function getArcDefinition(first, middle, last, circle) {
  const cross = (middle.x - first.x) * (last.y - middle.y) - (middle.y - first.y) * (last.x - middle.x);
  const direction = cross < 0 ? 0 : 1;
  const startAngle = Math.atan2(first.y - circle.center.y, first.x - circle.center.x);
  const middleAngle = Math.atan2(middle.y - circle.center.y, middle.x - circle.center.x);
  const endAngle = Math.atan2(last.y - circle.center.y, last.x - circle.center.x);
  const fullTurn = Math.PI * 2;
  const travel = (from, to) => {
    const delta = direction ? to - from : from - to;
    return delta < 0 ? delta + fullTurn : delta;
  };
  const middleTravel = travel(startAngle, middleAngle);
  const endTravel = travel(startAngle, endAngle);
  const sweep = middleTravel > endTravel ? 1 : 0;

  return {
    direction,
    sweep,
    path: `M ${first.x} ${first.y} A ${circle.radius} ${circle.radius} 0 ${sweep} ${direction} ${last.x} ${last.y}`
  };
}

function normalizeShapes(shapes) {
  const points = shapes.flatMap(shape => shape.vertex);
  const minX = Math.min(...points.map(point => point.x));
  const maxX = Math.max(...points.map(point => point.x));
  const minY = Math.min(...points.map(point => point.y));
  const maxY = Math.max(...points.map(point => point.y));
  const scale = 4 / Math.max(maxX - minX, maxY - minY, 1);

  return {
    path: shapes.map(shape => {
      const vertex = shape.vertex.map((point, index) => ({
        x: (point.x - (minX + maxX) / 2) * scale,
        y: (point.y - (minY + maxY) / 2) * scale,
        label: `V${index + 1}`,
        start: index === 0 ? 1 : 0,
        display: 1
      }));
      return {
        vertex,
        arcs: (shape.arcs || []).map(arc => ({
          start: vertex[shape.vertex.indexOf(arc.startPoint)].label,
          end: vertex[shape.vertex.indexOf(arc.endPoint)].label,
          radius: arc.radius * scale,
          direction: arc.direction,
          sweep: arc.sweep
        }))
      };
    })
  };
}

export default function CustomSymbolModal({ isOpen, onClose, onCreate, initialName = 'CustomSymbol', existingNames = [] }) {
  const canvasElementRef = useRef(null);
  const dialogElementRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const shapeRef = useRef({ vertex: [], arcs: [] });
  const segmentHistoryRef = useRef([]);
  const activePointsRef = useRef([]);
  const guidanceLineRef = useRef(null);
  const addNextVertexRef = useRef(null);
  const pointerValuesRef = useRef({ x: '0', y: '0', length: '0', angle: '0' });
  const isPanningRef = useRef(false);
  const panPositionRef = useRef(null);
  const closedRef = useRef(false);
  const toolRef = useRef('line');
  const [tool, setTool] = useState('line');
  const [name, setName] = useState('CustomSymbol');
  const [pointCount, setPointCount] = useState(0);
  const [vertexCount, setVertexCount] = useState(0);
  const [segmentCount, setSegmentCount] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [color, setColor] = useState('White');
  const [nameError, setNameError] = useState('');
  const [pointerValues, setPointerValues] = useState({ x: '0', y: '0', length: '0', angle: '0' });
  const [coordinateMode, setCoordinateMode] = useState('cartesian');
  const coordinateModeRef = useRef('cartesian');
  const [arcMode, setArcMode] = useState('two-points');
  const arcModeRef = useRef('two-points');
  const [tangentToLast, setTangentToLast] = useState(false);
  const tangentToLastRef = useRef(false);
  const [arcInputs, setArcInputs] = useState({ radius: '50', length: '', angle: '' });
  const arcInputsRef = useRef({ radius: '50', length: '', angle: '' });

  useEffect(() => {
    if (!isOpen || !canvasElementRef.current) return undefined;
    setName(initialName);
    const fabricCanvas = new Canvas(canvasElementRef.current, {
      width: EDITOR_WIDTH,
      height: EDITOR_HEIGHT,
      selection: false,
      backgroundColor: '#15191d'
    });
    fabricCanvasRef.current = fabricCanvas;
    const resizeCanvas = () => {
      const availableWidth = Math.max(320, Math.min(EDITOR_WIDTH, (dialogElementRef.current?.clientWidth || EDITOR_WIDTH) - 40));
      const availableHeight = availableWidth * EDITOR_HEIGHT / EDITOR_WIDTH;
      fabricCanvas.setDimensions({ width: availableWidth, height: availableHeight });
      if (fabricCanvas.wrapperEl) {
        fabricCanvas.wrapperEl.style.width = `${availableWidth}px`;
        fabricCanvas.wrapperEl.style.height = `${availableHeight}px`;
      }
      canvasElementRef.current.style.width = `${availableWidth}px`;
      canvasElementRef.current.style.height = `${availableHeight}px`;
      drawGrid();
    };
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (dialogElementRef.current) resizeObserver.observe(dialogElementRef.current);
    shapeRef.current = { vertex: [], arcs: [] };
    segmentHistoryRef.current = [];
    activePointsRef.current = [];
    closedRef.current = false;
    setIsClosed(false);
    setVertexCount(0);
    setSegmentCount(0);
    setNameError('');
    const initialPointerValues = { x: '0', y: '0', length: '0', angle: '0' };
    pointerValuesRef.current = initialPointerValues;
    setPointerValues(initialPointerValues);
    coordinateModeRef.current = 'cartesian';
    setCoordinateMode('cartesian');
    arcModeRef.current = 'two-points';
    setArcMode('two-points');
    tangentToLastRef.current = false;
    setTangentToLast(false);

    const clearActivePoints = () => {
      fabricCanvas.getObjects().filter(object => object.isEditorGuide).forEach(object => fabricCanvas.remove(object));
      guidanceLineRef.current = null;
      activePointsRef.current = [];
      setPointCount(0);
    };
    const drawGrid = () => {
      fabricCanvas.getObjects().filter(object => object.isEditorGrid).forEach(object => fabricCanvas.remove(object));
      const width = fabricCanvas.getWidth();
      const height = fabricCanvas.getHeight();
      const transform = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const zoom = fabricCanvas.getZoom();
      const sceneLeft = (0 - transform[4]) / transform[0];
      const sceneTop = (0 - transform[5]) / transform[3];
      const sceneRight = (width - transform[4]) / transform[0];
      const sceneBottom = (height - transform[5]) / transform[3];
      const gridStep = GRID_SIZE * (zoom < 0.75 ? 2 : zoom > 2.5 ? 0.5 : 1);
      const firstColumn = Math.floor(sceneLeft / gridStep) * gridStep;
      const firstRow = Math.floor(sceneTop / gridStep) * gridStep;
      for (let x = firstColumn; x <= sceneRight; x += gridStep) {
        fabricCanvas.add(new Line([x, sceneTop, x, sceneBottom], { stroke: '#34434a', strokeWidth: 1, strokeUniform: true, selectable: false, evented: false, isEditorGrid: true }));
      }
      for (let y = firstRow; y <= sceneBottom; y += gridStep) {
        fabricCanvas.add(new Line([sceneLeft, y, sceneRight, y], { stroke: '#34434a', strokeWidth: 1, strokeUniform: true, selectable: false, evented: false, isEditorGrid: true }));
      }
      fabricCanvas.getObjects().filter(object => object.isEditorGrid).forEach(object => fabricCanvas.sendObjectToBack(object));
      fabricCanvas.requestRenderAll();
    };
    resizeCanvas();
    const addVertexMarker = (point, label) => {
      const spot = new Circle({
        left: point.x,
        top: point.y,
        radius: 5,
        fill: '#55d6be',
        stroke: '#d9fff7',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      const markers = [spot];
      if (label) {
        markers.push(new Text(label, {
          left: point.x + 9,
          top: point.y - 10,
          fill: '#d9fff7',
          fontSize: 14,
          fontWeight: '600',
          selectable: false,
          evented: false
        }));
      }
      fabricCanvas.add(...markers);
      return markers;
    };
    const updatePointerValues = point => {
      const lastVertex = shapeRef.current.vertex.at(-1);
      const deltaX = lastVertex ? point.x - lastVertex.x : point.x;
      const deltaY = lastVertex ? point.y - lastVertex.y : point.y;
      const relativeValues = {
        x: deltaX.toFixed(1),
        y: deltaY.toFixed(1),
        length: Math.hypot(deltaX, deltaY).toFixed(1),
        angle: (Math.atan2(deltaY, deltaX) * 180 / Math.PI).toFixed(1)
      };
      const nextValues = relativeValues;
      pointerValuesRef.current = nextValues;
      setPointerValues(nextValues);
    };
    const addNextVertex = () => {
      if (closedRef.current || toolRef.current !== 'line') return;
      const lastVertex = shapeRef.current.vertex.at(-1);
      const enteredX = Number(pointerValuesRef.current.x);
      const enteredY = Number(pointerValuesRef.current.y);
      const enteredLength = Number(pointerValuesRef.current.length);
      const enteredAngle = Number(pointerValuesRef.current.angle) * Math.PI / 180;
      const x = coordinateModeRef.current === 'cartesian' ? enteredX : enteredLength * Math.cos(enteredAngle);
      const y = coordinateModeRef.current === 'cartesian' ? enteredY : enteredLength * Math.sin(enteredAngle);
      if (![x, y].every(Number.isFinite)) return;
      const point = lastVertex ? { x: lastVertex.x + x, y: lastVertex.y + y } : { x, y };
      if (!lastVertex) {
        shapeRef.current.vertex.push(point);
        const markers = addVertexMarker(point, 'V1');
        segmentHistoryRef.current.push({ vertex: point, markers });
      } else {
        shapeRef.current.vertex.push(point);
        const markers = addVertexMarker(point, `V${shapeRef.current.vertex.length}`);
        const preview = new Line([lastVertex.x, lastVertex.y, point.x, point.y], { stroke: '#f5f0df', strokeWidth: 3, selectable: false, evented: false });
        fabricCanvas.add(preview);
        segmentHistoryRef.current.push({ vertex: point, preview, markers });
      }
      setVertexCount(shapeRef.current.vertex.length);
      setSegmentCount(segmentHistoryRef.current.length);
      fabricCanvas.requestRenderAll();
    };
    addNextVertexRef.current = addNextVertex;
    const getRadiusArcCandidate = (first, last) => {
      const previous = shapeRef.current.vertex.at(-2);
      const radius = Number(arcInputsRef.current.radius);
      const arcAngle = Number(arcInputsRef.current.angle);
      const arcLength = Number(arcInputsRef.current.length);
      const hasArcAngle = Number.isFinite(arcAngle) && arcAngle !== 0;
      const hasArcLength = Number.isFinite(arcLength) && arcLength !== 0 && radius > 0;
      const arcExtent = hasArcAngle ? Math.abs(arcAngle) : (hasArcLength ? Math.abs(arcLength / radius * 180 / Math.PI) : 0);
      const pointerSide = previous && last
        ? (first.x - previous.x) * (last.y - first.y) - (first.y - previous.y) * (last.x - first.x)
        : 1;
      const side = pointerSide < 0 ? -1 : 1;
      const signedAngle = arcExtent * side;
      const tangentArc = tangentToLastRef.current && previous
        ? getTangentArc(first, previous, radius, last, signedAngle)
        : null;
      const endpoint = tangentArc?.endpoint || last;
      const circle = tangentArc || getCircleWithRadius(first, endpoint, radius, previous, false);
      if (!circle) return null;
      const definition = getArcDefinitionFromCircle(first, endpoint, circle, previous, !!tangentArc);
      return { endpoint, circle, definition };
    };
    const showRadiusArcPreview = point => {
      if (arcModeRef.current !== 'radius-point' || closedRef.current) return;
      const vertices = shapeRef.current.vertex;
      const first = vertices.at(-1) || activePointsRef.current[0];
      if (!first) return;
      const candidate = getRadiusArcCandidate(first, point);
      if (guidanceLineRef.current) fabricCanvas.remove(guidanceLineRef.current);
      if (!candidate) return;
      guidanceLineRef.current = new Path(candidate.definition.path, {
        stroke: '#91a8b0', fill: '', strokeWidth: 1, strokeDashArray: [6, 6], selectable: false, evented: false, isEditorGuide: true
      });
      fabricCanvas.add(guidanceLineRef.current);
      fabricCanvas.requestRenderAll();
    };
    const handleMouseDown = event => {
      if (event.e.button === 1 || event.e.altKey) {
        isPanningRef.current = true;
        panPositionRef.current = { x: event.e.clientX, y: event.e.clientY };
        return;
      }
      if (closedRef.current) return;
      const point = fabricCanvas.getScenePoint(event.e);
      if (toolRef.current === 'arc' && arcModeRef.current === 'two-points' && shapeRef.current.vertex.length > 0 && activePointsRef.current.length === 0) {
        const previous = shapeRef.current.vertex.at(-1);
        activePointsRef.current.push(previous);
      }
      if (toolRef.current === 'arc' && arcModeRef.current === 'radius-point' && shapeRef.current.vertex.length > 0 && activePointsRef.current.length === 0) {
        activePointsRef.current.push(shapeRef.current.vertex.at(-1));
      }
      activePointsRef.current.push(point);
      fabricCanvas.add(new Circle({ left: point.x, top: point.y, radius: 4, fill: '#55d6be', selectable: false, evented: false, isEditorGuide: true,  }));
      setPointCount(activePointsRef.current.length);

      if (toolRef.current === 'line') {
        const vertices = shapeRef.current.vertex;
        if (vertices.length === 0) {
          vertices.push(point);
          addVertexMarker(point, `V${vertices.length}`);
          setVertexCount(vertices.length);
        } else if (vertices.length >= 3 && Math.hypot(point.x - vertices[0].x, point.y - vertices[0].y) < 16) {
          fabricCanvas.add(new Line([vertices.at(-1).x, vertices.at(-1).y, vertices[0].x, vertices[0].y], { stroke: '#55d6be', strokeWidth: 3, selectable: false, evented: false }));
          closedRef.current = true;
          setIsClosed(true);
          clearActivePoints();
          fabricCanvas.requestRenderAll();
          return;
        } else {
          const previous = vertices.at(-1);
          vertices.push(point);
          setVertexCount(vertices.length);
          const markers = addVertexMarker(point, `V${vertices.length}`);
          const preview = new Line([previous.x, previous.y, point.x, point.y], { stroke: '#f5f0df', strokeWidth: 3, selectable: false, evented: false });
          fabricCanvas.add(preview);
          segmentHistoryRef.current.push({ vertex: point, preview, markers });
          setSegmentCount(segmentHistoryRef.current.length);
        }
        clearActivePoints();
      }

      const arcPointCount = arcModeRef.current === 'two-points' ? 3 : (shapeRef.current.vertex.length > 0 ? 2 : 2);
      if (toolRef.current === 'arc' && activePointsRef.current.length === arcPointCount) {
        const [first, middle, selectedLast] = activePointsRef.current;
        const last = arcModeRef.current === 'two-points' ? selectedLast : middle;
        const radiusCandidate = arcModeRef.current === 'radius-point' ? getRadiusArcCandidate(first, last) : null;
        if (arcModeRef.current === 'radius-point' && !radiusCandidate) {
          clearActivePoints();
          return;
        }
        const arcLast = radiusCandidate?.endpoint || last;
        const circle = arcModeRef.current === 'two-points'
          ? getCircleThroughPoints(first, middle, last)
          : radiusCandidate?.circle;
        if (circle) {
          const previous = shapeRef.current.vertex.at(-1);
          const arcStart = previous || first;
          const arcDefinition = arcModeRef.current === 'two-points'
            ? getArcDefinition(first, middle, last, circle)
            : radiusCandidate.definition;
          const markers = [
            ...(!previous ? addVertexMarker(first, 'V1') : []),
            ...(arcModeRef.current === 'two-points' ? addVertexMarker(middle) : [])
          ];
          if (!previous) shapeRef.current.vertex.push(first);
          shapeRef.current.vertex.push(arcLast);
          shapeRef.current.arcs.push({ startPoint: arcStart, endPoint: arcLast, radius: circle.radius, direction: arcDefinition.direction, sweep: arcDefinition.sweep });
          setVertexCount(shapeRef.current.vertex.length);
          markers.push(...addVertexMarker(arcLast, `V${shapeRef.current.vertex.length}`));
          const preview = new Path(arcDefinition.path, { stroke: '#f5f0df', fill: '', strokeWidth: 3, selectable: false, evented: false });
          fabricCanvas.add(preview);
          segmentHistoryRef.current.push({ vertex: arcLast, arc: shapeRef.current.arcs.at(-1), preview, markers });
          setSegmentCount(segmentHistoryRef.current.length);
        }
        clearActivePoints();
      }
      fabricCanvas.requestRenderAll();
    };
    const handleMouseMove = event => {
      if (isPanningRef.current && panPositionRef.current) {
        const deltaX = event.e.clientX - panPositionRef.current.x;
        const deltaY = event.e.clientY - panPositionRef.current.y;
        fabricCanvas.relativePan({ x: deltaX, y: deltaY });
        panPositionRef.current = { x: event.e.clientX, y: event.e.clientY };
        drawGrid();
        return;
      }

      updatePointerValues(fabricCanvas.getScenePoint(event.e));

      if (!closedRef.current && arcModeRef.current === 'radius-point' && toolRef.current === 'arc') {
        showRadiusArcPreview(fabricCanvas.getScenePoint(event.e));
      } else if (!closedRef.current && shapeRef.current.vertex.length > 0 && activePointsRef.current.length === 0) {
        const lastVertex = shapeRef.current.vertex.at(-1);
        const pointer = fabricCanvas.getScenePoint(event.e);
        if (guidanceLineRef.current) fabricCanvas.remove(guidanceLineRef.current);
        guidanceLineRef.current = new Line([lastVertex.x, lastVertex.y, pointer.x, pointer.y], {
          stroke: '#91a8b0',
          strokeWidth: 1,
          strokeDashArray: [6, 6],
          selectable: false,
          evented: false,
          isEditorGuide: true
        });
        fabricCanvas.add(guidanceLineRef.current);
        fabricCanvas.requestRenderAll();
      }
    };
    const handleMouseUp = () => {
      isPanningRef.current = false;
      panPositionRef.current = null;
    };
    const handleWheel = event => {
      event.preventDefault();
      const pointer = fabricCanvas.getScenePoint(event);
      const currentZoom = fabricCanvas.getZoom();
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * (event.deltaY > 0 ? 0.9 : 1.1)));
      fabricCanvas.zoomToPoint(pointer, nextZoom);
      drawGrid();
      fabricCanvas.requestRenderAll();
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);
    fabricCanvas.upperCanvasEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.upperCanvasEl.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
      fabricCanvas.dispose();
      fabricCanvasRef.current = null;
      addNextVertexRef.current = null;
    };
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (shapeRef.current.vertex.length < 3) return;
    const symbolName = name.trim() || 'CustomSymbol';
    if (existingNames.includes(symbolName)) {
      setNameError('A symbol with this name already exists.');
      return;
    }
    setNameError('');
    if (!closedRef.current) closePolygon();
    onCreate(normalizeShapes([shapeRef.current]), symbolName, color);
    onClose();
  };

  const closePolygon = () => {
    if (closedRef.current || shapeRef.current.vertex.length < 3) return;
    const vertices = shapeRef.current.vertex;
    fabricCanvasRef.current?.add(new Line([vertices.at(-1).x, vertices.at(-1).y, vertices[0].x, vertices[0].y], { stroke: '#55d6be', strokeWidth: 3, selectable: false, evented: false }));
    closedRef.current = true;
    setIsClosed(true);
    fabricCanvasRef.current?.requestRenderAll();
  };

  const undoLastSegment = () => {
    const segment = segmentHistoryRef.current.pop();
    if (!segment || closedRef.current) return;
    const vertices = shapeRef.current.vertex;
    if (vertices.at(-1) === segment.vertex) vertices.pop();
    if (segment.arc) shapeRef.current.arcs = shapeRef.current.arcs.filter(arc => arc !== segment.arc);
    fabricCanvasRef.current?.remove(segment.preview);
    segment.markers?.forEach(marker => fabricCanvasRef.current?.remove(marker));
    setVertexCount(vertices.length);
    setSegmentCount(segmentHistoryRef.current.length);
    fabricCanvasRef.current?.requestRenderAll();
  };

  const selectTool = nextTool => {
    toolRef.current = nextTool;
    fabricCanvasRef.current?.getObjects().filter(object => object.isEditorGuide).forEach(object => fabricCanvasRef.current.remove(object));
    activePointsRef.current = [];
    setPointCount(0);
    setTool(nextTool);
  };

  const switchCoordinateMode = () => {
    const nextMode = coordinateMode === 'cartesian' ? 'polar' : 'cartesian';
    coordinateModeRef.current = nextMode;
    setCoordinateMode(nextMode);
  };

  const handleCoordinateKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addNextVertexRef.current?.();
    }
  };

  const updateArcInput = (key, value) => {
    const nextInputs = { ...arcInputsRef.current, [key]: value };
    arcInputsRef.current = nextInputs;
    setArcInputs(nextInputs);
  };

  const selectArcMode = event => {
    const nextMode = event.target.value;
    arcModeRef.current = nextMode;
    setArcMode(nextMode);
  };

  const toggleTangent = event => {
    tangentToLastRef.current = event.target.checked;
    setTangentToLast(event.target.checked);
  };

  return createPortal(
    (
    <div className="custom-symbol-modal" role="dialog" aria-modal="true" aria-labelledby="custom-symbol-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogElementRef} className="modal-content custom-symbol-dialog" onMouseDown={event => event.stopPropagation()}>
        <div className="custom-symbol-header">
          <h2 id="custom-symbol-title">Create symbol</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close">x</button>
        </div>
        <label className="input-label" htmlFor="custom-symbol-name">Name</label>
        <input id="custom-symbol-name" className={`input-field ${nameError ? 'input-field-error' : ''}`} value={name} onChange={event => { setName(event.target.value); setNameError(''); }} aria-invalid={!!nameError} aria-describedby={nameError ? 'custom-symbol-name-error' : undefined} />
        {nameError && <p id="custom-symbol-name-error" className="custom-symbol-error">{nameError}</p>}
        <div className="custom-symbol-color" role="group" aria-label="Symbol color">
        </div>
        <div className="custom-symbol-toolbar">
          <button type="button" className={`toggle-button ${tool === 'line' ? 'active' : ''}`} onClick={() => selectTool('line')}>Line</button>
          <button type="button" className={`toggle-button ${tool === 'arc' ? 'active' : ''}`} onClick={() => selectTool('arc')}>Arc</button>
        </div>
        <div className={`custom-symbol-arc-settings ${tool !== 'arc' ? 'custom-symbol-control-hidden' : ''}`} aria-hidden={tool !== 'arc'}>
            <label className="input-label" htmlFor="custom-symbol-arc-mode">Arc construction</label>
            <select id="custom-symbol-arc-mode" className="input-field" value={arcMode} onChange={selectArcMode}>
              <option value="two-points">2 points</option>
              <option value="radius-point">Radius and point</option>
            </select>
            <label className="custom-symbol-check">
              <input type="checkbox" checked={tangentToLast} onChange={toggleTangent} />
              Tangent to last line/curve
            </label>
            {arcMode === 'radius-point' && (
              <div className="custom-symbol-arc-inputs">
                {[
                  ['radius', 'Radius'],
                  ['length', 'Arc length'],
                  ['angle', 'Arc angle']
                ].map(([key, label]) => (
                  <label key={key} className="custom-symbol-coordinate">
                    <span>{label}</span>
                    <input className="input-field" type="number" step="0.1" value={arcInputs[key]} onChange={event => updateArcInput(key, event.target.value)} />
                  </label>
                ))}
              </div>
            )}
          </div>
        <div className="custom-symbol-toolbar">
          <span>{tool === 'line' ? 'Click points in sequence' : 'Click the arc middle, then its end point'}</span>
          <span>{pointCount} pending points</span>
        </div>
        <div className={`custom-symbol-coordinates ${tool !== 'line' ? 'custom-symbol-control-hidden' : ''}`} role="group" aria-label="Next vertex coordinates" aria-hidden={tool !== 'line'}>
          {[
            ['x', 'X'],
            ['y', 'Y'],
            ['length', 'Length'],
            ['angle', 'Angle']
          ].map(([key, label]) => (
            <label key={key} className="custom-symbol-coordinate">
              <span>{label}</span>
              <input
                className={`input-field ${coordinateMode === 'cartesian' ? (key === 'length' || key === 'angle' ? 'coordinate-display' : '') : (key === 'x' || key === 'y' ? 'coordinate-display' : '')}`}
                type="number"
                step="0.1"
                value={pointerValues[key]}
                readOnly={coordinateMode === 'cartesian' ? key === 'length' || key === 'angle' : key === 'x' || key === 'y'}
                onKeyDown={handleCoordinateKeyDown}
                onChange={event => {
                  if (coordinateMode === 'cartesian' ? key === 'length' || key === 'angle' : key === 'x' || key === 'y') return;
                  const nextValues = { ...pointerValuesRef.current, [key]: event.target.value };
                  pointerValuesRef.current = nextValues;
                  setPointerValues(nextValues);
                }}
              />
            </label>
          ))}
          <button type="button" className="toggle-button" onClick={switchCoordinateMode}>
            Edit {coordinateMode === 'cartesian' ? 'Length / Angle' : 'X / Y'}
          </button>
          <button type="button" className="toggle-button" onClick={() => addNextVertexRef.current?.()} disabled={isClosed || tool !== 'line'}>Add next vertex</button>
        </div>
        <canvas ref={canvasElementRef} className="custom-symbol-canvas" aria-label="Custom symbol drawing canvas" />
        <div className="custom-symbol-actions">
          <button type="button" className="toggle-button" onClick={onClose}>Cancel</button>
          <button type="button" className="toggle-button" onClick={undoLastSegment} disabled={isClosed || !segmentCount}>Undo</button>
          <button type="button" className="toggle-button" onClick={closePolygon} disabled={isClosed || vertexCount < 3}>Close polygon</button>
          <button type="button" className="panel-action-button" onClick={handleCreate} disabled={!isClosed}>Add symbol</button>
        </div>
      </div>
    </div>
    ),
    document.body
  );
}

function getTangentArc(first, tangentStart, radius, endpoint, angleDegrees) {
  if (!tangentStart || !Number.isFinite(radius) || radius <= 0) return null;
  const tangentLength = Math.hypot(first.x - tangentStart.x, first.y - tangentStart.y) || 1;
  const tangentVector = { x: (first.x - tangentStart.x) / tangentLength, y: (first.y - tangentStart.y) / tangentLength };
  const inputAngle = Number.isFinite(angleDegrees) ? angleDegrees * Math.PI / 180 : 0;
  const pointerSide = endpoint
    ? tangentVector.x * (endpoint.y - first.y) - tangentVector.y * (endpoint.x - first.x)
    : 1;
  const side = inputAngle !== 0 ? (inputAngle < 0 ? -1 : 1) : (pointerSide < 0 ? -1 : 1);
  const normal = { x: -tangentVector.y, y: tangentVector.x };
  const center = { x: first.x + normal.x * radius * side, y: first.y + normal.y * radius * side };
  const startAngle = Math.atan2(first.y - center.y, first.x - center.x);
  const signedAngle = inputAngle !== 0
    ? inputAngle
    : Math.atan2(endpoint.y - center.y, endpoint.x - center.x) - startAngle;
  const endAngle = startAngle + signedAngle;
  return {
    center,
    radius,
    endpoint: { x: center.x + radius * Math.cos(endAngle), y: center.y + radius * Math.sin(endAngle) }
  };
}