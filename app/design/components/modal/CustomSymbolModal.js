'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, Circle, Line, Path, Text } from 'fabric';

const EDITOR_WIDTH = 1000;
const EDITOR_HEIGHT = 550;
const GRID_SIZE = 1;
const INITIAL_ZOOM = 50;
const MIN_ZOOM = 25;
const MAX_ZOOM = 200;

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

function getArcTravel(first, last, center, clockwise) {
  const startAngle = Math.atan2(first.y - center.y, first.x - center.x);
  const endAngle = Math.atan2(last.y - center.y, last.x - center.x);
  const fullTurn = Math.PI * 2;
  const delta = clockwise ? startAngle - endAngle : endAngle - startAngle;
  return delta < 0 ? delta + fullTurn : delta;
}

function getArcDefinitionFromCircle(first, last, circle, tangentVector, tangent, clockwiseHint = false) {
  const startAngle = Math.atan2(first.y - circle.center.y, first.x - circle.center.x);
  const endAngle = Math.atan2(last.y - circle.center.y, last.x - circle.center.x);
  const fullTurn = Math.PI * 2;
  const radiusVector = { x: first.x - circle.center.x, y: first.y - circle.center.y };
  const clockwiseTangent = { x: radiusVector.y, y: -radiusVector.x };
  const counterClockwiseTangent = { x: -radiusVector.y, y: radiusVector.x };
  const clockwise = tangent && tangentVector
    ? (clockwiseTangent.x * tangentVector.x + clockwiseTangent.y * tangentVector.y) > (counterClockwiseTangent.x * tangentVector.x + counterClockwiseTangent.y * tangentVector.y)
    : clockwiseHint;
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
  return {
    path: shapes.map(shape => {
      const vertex = shape.vertex.map((point, index) => ({
        x: point.x,
        y: point.y,
        label: `V${index + 1}`,
        start: point.start ?? (index === 0 ? 1 : 0),
        display: 1
      }));
      const normalizedShape = {
        vertex,
        arcs: (shape.arcs || []).map(arc => ({
          start: vertex[shape.vertex.indexOf(arc.startPoint)].label,
          end: vertex[shape.vertex.indexOf(arc.endPoint)].label,
          radius: arc.radius,
          direction: arc.direction,
          sweep: arc.sweep
        }))
      };
      if (shape.fill) normalizedShape.fill = shape.fill;
      return normalizedShape;
    })
  };
}

function getEditorListData(completedShapes, activeShape) {
  const shapes = [...completedShapes, ...(activeShape.vertex.length ? [activeShape] : [])];
  const vertices = shapes.flatMap(shape => shape.vertex).map((vertex, index) => ({ ...vertex, label: `V${index + 1}` }));
  const segments = [];
  let vertexOffset = 0;
  shapes.forEach((shape, shapeIndex) => {
    shape.vertex.slice(0, -1).forEach((startVertex, index) => {
      const endVertex = shape.vertex[index + 1];
      segments.push({
        key: `S${shapeIndex}-${index}`,
        startLabel: vertices[vertexOffset + index].label,
        endLabel: vertices[vertexOffset + index + 1].label,
        arc: shape.arcs.find(candidate => candidate.endPoint === endVertex)
      });
    });
    if (completedShapes.includes(shape) && shape.vertex.length > 2) {
      const lastIndex = shape.vertex.length - 1;
      segments.push({
        key: `S${shapeIndex}-close`,
        startLabel: vertices[vertexOffset + lastIndex].label,
        endLabel: vertices[vertexOffset].label,
        arc: shape.arcs.find(candidate => candidate.endPoint === shape.vertex[0])
      });
    }
    vertexOffset += shape.vertex.length;
  });
  return { vertices, segments };
}

export default function CustomSymbolModal({ isOpen, onClose, onCreate, initialName = 'CustomSymbol', existingNames = [] }) {
  const canvasElementRef = useRef(null);
  const dialogElementRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const shapeRef = useRef({ vertex: [], arcs: [] });
  const completedShapesRef = useRef([]);
  const completeShapeRef = useRef(null);
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
  const [completedShapeCount, setCompletedShapeCount] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [color, setColor] = useState('White');
  const [fillMode, setFillMode] = useState('default');
  const fillModeRef = useRef('default');
  const [fillColor, setFillColor] = useState('#ffffff');
  const fillColorRef = useRef('#ffffff');
  const [nameError, setNameError] = useState('');
  const [pointerValues, setPointerValues] = useState({ x: '0', y: '0', length: '0', angle: '0' });
  const [coordinateMode, setCoordinateMode] = useState('cartesian');
  const coordinateModeRef = useRef('cartesian');
  const [arcMode, setArcMode] = useState('radius-point');
  const arcModeRef = useRef('radius-point');
  const [tangentToLast, setTangentToLast] = useState(false);
  const tangentToLastRef = useRef(false);
  const [arcDirection, setArcDirection] = useState('auto');
  const arcDirectionRef = useRef('auto');
  const [arcSize, setArcSize] = useState('small');
  const arcSizeRef = useRef('small');
  const [arcInputs, setArcInputs] = useState({ radius: '2', length: '', angle: '' });
  const arcInputsRef = useRef({ radius: '2', length: '', angle: '' });
  const snapEnabledRef = useRef(true);
  const snapHintRef = useRef(null);
  const updateVertexRef = useRef(null);
  const updateSegmentRef = useRef(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [vertexCoordinates, setVertexCoordinates] = useState([]);
  const [selectedVertexLabel, setSelectedVertexLabel] = useState(null);
  const [segmentEntries, setSegmentEntries] = useState([]);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState(null);

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
    fabricCanvas.setZoom(INITIAL_ZOOM);
    const resizeCanvas = () => {
      const canvasRatio = EDITOR_WIDTH / EDITOR_HEIGHT;
      const dialogWidth = dialogElementRef.current?.clientWidth || EDITOR_WIDTH;
      const maxCanvasHeight = Math.max(220, Math.min(EDITOR_HEIGHT, window.innerHeight * 0.58));
      const availableWidth = Math.max(320, Math.min(EDITOR_WIDTH, dialogWidth - 40, maxCanvasHeight * canvasRatio));
      const availableHeight = availableWidth * EDITOR_HEIGHT / EDITOR_WIDTH;
      fabricCanvas.setDimensions({ width: availableWidth, height: availableHeight });
      fabricCanvas.absolutePan({ x: -availableWidth / 2, y: -availableHeight / 2 });
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
    completedShapesRef.current = [];
    setCompletedShapeCount(0);
    segmentHistoryRef.current = [];
    activePointsRef.current = [];
    closedRef.current = false;
    setIsClosed(false);
    setVertexCount(0);
    setSegmentCount(0);
    setVertexCoordinates([]);
    setSelectedVertexLabel(null);
    setSegmentEntries([]);
    setSelectedSegmentKey(null);
    snapEnabledRef.current = true;
    setSnapEnabled(true);
    setNameError('');
    fillModeRef.current = 'default';
    setFillMode('default');
    fillColorRef.current = '#ffffff';
    setFillColor('#ffffff');
    const initialPointerValues = { x: '0', y: '0', length: '0', angle: '0' };
    pointerValuesRef.current = initialPointerValues;
    setPointerValues(initialPointerValues);
    coordinateModeRef.current = 'cartesian';
    setCoordinateMode('cartesian');
    arcModeRef.current = 'radius-point';
    setArcMode('radius-point');
    tangentToLastRef.current = false;
    setTangentToLast(false);
    arcDirectionRef.current = 'auto';
    setArcDirection('auto');
    arcSizeRef.current = 'small';
    setArcSize('small');
    arcInputsRef.current = { radius: '2', length: '', angle: '' };
    setArcInputs(arcInputsRef.current);

    const clearActivePoints = () => {
      fabricCanvas.getObjects().filter(object => object.isEditorGuide).forEach(object => fabricCanvas.remove(object));
      guidanceLineRef.current = null;
      activePointsRef.current = [];
      setPointCount(0);
    };
    const clearGuides = () => {
      fabricCanvas.getObjects().filter(object => object.isEditorGuide).forEach(object => fabricCanvas.remove(object));
      guidanceLineRef.current = null;
      snapHintRef.current = null;
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
      const gridStep = GRID_SIZE * (zoom < INITIAL_ZOOM * 0.75 ? 2 : zoom > INITIAL_ZOOM * 2.5 ? 0.5 : 1);
      const firstColumn = Math.floor(sceneLeft / gridStep) * gridStep;
      const firstRow = Math.floor(sceneTop / gridStep) * gridStep;
      for (let x = firstColumn; x <= sceneRight; x += gridStep) {
        fabricCanvas.add(new Line([x, sceneTop, x, sceneBottom], { stroke: '#34434a', strokeWidth: 0.02, selectable: false, evented: false, isEditorGrid: true }));
      }
      for (let y = firstRow; y <= sceneBottom; y += gridStep) {
        fabricCanvas.add(new Line([sceneLeft, y, sceneRight, y], { stroke: '#34434a', strokeWidth: 0.02, selectable: false, evented: false, isEditorGrid: true }));
      }
      fabricCanvas.add(new Line([0, sceneTop, 0, sceneBottom], { stroke: '#6b8b95', strokeWidth: 0.04, selectable: false, evented: false, isEditorGrid: true }));
      fabricCanvas.add(new Line([sceneLeft, 0, sceneRight, 0], { stroke: '#6b8b95', strokeWidth: 0.04, selectable: false, evented: false, isEditorGrid: true }));
      fabricCanvas.getObjects().filter(object => object.isEditorGrid).forEach(object => fabricCanvas.sendObjectToBack(object));
      fabricCanvas.requestRenderAll();
    };
    resizeCanvas();
    const updateSnapHint = point => {
      if (snapHintRef.current) {
        fabricCanvas.remove(snapHintRef.current);
        snapHintRef.current = null;
      }
      if (!snapEnabledRef.current) {
        fabricCanvas.requestRenderAll();
        return;
      }
      const zoom = fabricCanvas.getZoom() || 1;
      const transform = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const gridStep = GRID_SIZE * (zoom < INITIAL_ZOOM * 0.75 ? 2 : zoom > INITIAL_ZOOM * 2.5 ? 0.5 : 1);
      const gridPoint = { x: Math.round(point.x / gridStep) * gridStep, y: Math.round(point.y / gridStep) * gridStep };
      const candidates = [{ point: gridPoint, distance: Math.hypot(point.x - gridPoint.x, point.y - gridPoint.y) }];
      shapeRef.current.vertex.forEach(vertex => candidates.push({ point: vertex, distance: Math.hypot(point.x - vertex.x, point.y - vertex.y) }));
      const closest = candidates.sort((left, right) => left.distance - right.distance)[0];
      if (closest.distance > 14 / transform[0]) {
        fabricCanvas.requestRenderAll();
        return;
      }
      snapHintRef.current = new Circle({
        left: closest.point.x,
        top: closest.point.y,
        radius: 0.18,
        fill: 'transparent',
        stroke: '#ffd166',
        strokeWidth: 0.03,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
        isEditorGuide: true
      });
      fabricCanvas.add(snapHintRef.current);
      fabricCanvas.requestRenderAll();
    };
    const getSnapPoint = point => {
      if (!snapEnabledRef.current) return point;
      const zoom = fabricCanvas.getZoom() || 1;
      const gridStep = GRID_SIZE * (zoom < INITIAL_ZOOM * 0.75 ? 2 : zoom > INITIAL_ZOOM * 2.5 ? 0.5 : 1);
      const candidates = [{ x: Math.round(point.x / gridStep) * gridStep, y: Math.round(point.y / gridStep) * gridStep }];
      candidates.push(...shapeRef.current.vertex);
      const closest = candidates.sort((left, right) => Math.hypot(point.x - left.x, point.y - left.y) - Math.hypot(point.x - right.x, point.y - right.y))[0];
      return Math.hypot(point.x - closest.x, point.y - closest.y) <= 14 / zoom ? { x: closest.x, y: closest.y } : point;
    };
    const addVertexMarker = (point, label) => {
      const spot = new Circle({
        left: point.x,
        top: point.y,
        radius: 0.12,
        fill: '#55d6be',
        stroke: '#d9fff7',
        strokeWidth: 0.02,
        selectable: false,
        evented: false,
      });
      const markers = [spot];
      if (label) {
        markers.push(new Text(label, {
          left: point.x + 0.2,
          top: point.y - 0.25,
          fill: '#d9fff7',
          fontSize: 0.35,
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
    const syncVertexCoordinates = () => {
      const listData = getEditorListData(completedShapesRef.current, shapeRef.current);
      setVertexCoordinates(listData.vertices);
      setSegmentEntries(listData.segments);
    };
    const redrawShapes = () => {
      fabricCanvas.getObjects().filter(object => !object.isEditorGrid && !object.isEditorGuide).forEach(object => fabricCanvas.remove(object));
      const shapes = [...completedShapesRef.current, ...(shapeRef.current.vertex.length ? [shapeRef.current] : [])];
      shapes.forEach(shape => {
        shape.vertex.forEach((vertex, index) => {
          addVertexMarker(vertex, `V${index + 1}`).forEach(object => { object.isEditorShape = true; });
        });
        shape.vertex.forEach((vertex, index) => {
          const nextVertex = shape.vertex[index + 1];
          if (!nextVertex) return;
          const arc = shape.arcs.find(candidate => candidate.endPoint === nextVertex);
          if (arc) {
            const circle = getCircleWithRadius(vertex, nextVertex, arc.radius, null, false);
            if (circle) {
              arc.center = circle.center;
              const path = `M ${vertex.x} ${vertex.y} A ${arc.radius} ${arc.radius} 0 ${arc.sweep ? 1 : 0} ${arc.direction === 0 ? 0 : 1} ${nextVertex.x} ${nextVertex.y}`;
              fabricCanvas.add(new Path(path, { stroke: '#f5f0df', fill: '', strokeWidth: 0.06, selectable: false, evented: false, isEditorShape: true }));
              return;
            }
          }
          fabricCanvas.add(new Line([vertex.x, vertex.y, nextVertex.x, nextVertex.y], { stroke: '#f5f0df', strokeWidth: 0.06, selectable: false, evented: false, isEditorShape: true }));
        });
        if (completedShapesRef.current.includes(shape) && shape.vertex.length > 2) {
          const first = shape.vertex[0];
          const last = shape.vertex.at(-1);
          fabricCanvas.add(new Line([last.x, last.y, first.x, first.y], { stroke: '#55d6be', strokeWidth: 0.06, selectable: false, evented: false, isEditorShape: true }));
        }
      });
      fabricCanvas.requestRenderAll();
    };
    updateVertexRef.current = (label, key, value) => {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) return;
      const vertexIndex = Number(label.slice(1)) - 1;
      const vertices = [...completedShapesRef.current.flatMap(shape => shape.vertex), ...shapeRef.current.vertex];
      const vertex = vertices[vertexIndex];
      if (!vertex) return;
      vertex[key] = Math.round(numericValue * 1000) / 1000;
      syncVertexCoordinates();
      redrawShapes();
    };
    updateSegmentRef.current = (segment, key, value) => {
      if (!segment.arc) return;
      if (key === 'radius') {
        const radius = Number(value);
        if (!Number.isFinite(radius) || radius <= 0) return;
        segment.arc.radius = Math.round(radius * 1000) / 1000;
      } else if (key === 'direction') {
        segment.arc.direction = value === 'clockwise' ? 0 : 1;
      } else if (key === 'size') {
        segment.arc.sweep = value === 'large' ? 1 : 0;
      }
      syncVertexCoordinates();
      redrawShapes();
    };
    const prepareShapeForFill = shape => {
      if (fillModeRef.current !== 'negative' || completedShapesRef.current.length === 0) return shape;
      const negativeBounds = shape.vertex.reduce((bounds, point) => ({
        minX: Math.min(bounds.minX, point.x),
        minY: Math.min(bounds.minY, point.y),
        maxX: Math.max(bounds.maxX, point.x),
        maxY: Math.max(bounds.maxY, point.y)
      }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
      const negativeCenter = {
        x: (negativeBounds.minX + negativeBounds.maxX) / 2,
        y: (negativeBounds.minY + negativeBounds.maxY) / 2
      };
      const baseShape = [...completedShapesRef.current].reverse().find(candidate => {
        const bounds = candidate.vertex.reduce((result, point) => ({
          minX: Math.min(result.minX, point.x),
          minY: Math.min(result.minY, point.y),
          maxX: Math.max(result.maxX, point.x),
          maxY: Math.max(result.maxY, point.y)
        }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
        const containsCenter = negativeCenter.x >= bounds.minX && negativeCenter.x <= bounds.maxX
          && negativeCenter.y >= bounds.minY && negativeCenter.y <= bounds.maxY;
        const overlapsBounds = negativeBounds.minX <= bounds.maxX && negativeBounds.maxX >= bounds.minX
          && negativeBounds.minY <= bounds.maxY && negativeBounds.maxY >= bounds.minY;
        return containsCenter || overlapsBounds;
      });
      if (!baseShape) return shape;
      const negativeVertices = [...shape.vertex].reverse().map((point, index) => ({
        ...point,
        start: index === 0 ? 1 : 0
      }));
      const reversedVertexMap = new Map(shape.vertex.map((point, index) => [point, negativeVertices[shape.vertex.length - 1 - index]]));
      baseShape.vertex.push(...negativeVertices);
      baseShape.arcs.push(...shape.arcs.map(arc => ({
        ...arc,
        startPoint: reversedVertexMap.get(arc.endPoint),
        endPoint: reversedVertexMap.get(arc.startPoint),
        direction: arc.direction ? 0 : 1,
        sweep: arc.sweep ? 0 : 1
      })));
      return null;
    };
    const completeActiveShape = () => {
      if (shapeRef.current.vertex.length < 3) return;
      const completedShape = {
        vertex: [...shapeRef.current.vertex],
        arcs: [...shapeRef.current.arcs],
        fill: fillModeRef.current === 'true-color' ? fillColorRef.current : undefined
      };
      const preparedShape = prepareShapeForFill(completedShape);
      if (preparedShape) completedShapesRef.current.push(preparedShape);
      setCompletedShapeCount(completedShapesRef.current.length);
    };
    completeShapeRef.current = completeActiveShape;
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
        const preview = new Line([lastVertex.x, lastVertex.y, point.x, point.y], { stroke: '#f5f0df', strokeWidth: 0.06, selectable: false, evented: false });
        fabricCanvas.add(preview);
        segmentHistoryRef.current.push({ vertex: point, preview, markers });
      }
      setVertexCount(shapeRef.current.vertex.length);
      syncVertexCoordinates();
      setSegmentCount(segmentHistoryRef.current.length);
      fabricCanvas.requestRenderAll();
    };
    addNextVertexRef.current = addNextVertex;
    const getIncomingTangent = first => {
      const previous = shapeRef.current.vertex.at(-2);
      const previousArc = shapeRef.current.arcs.find(arc => arc.endPoint === first);
      if (!previousArc?.center) {
        if (!previous) return null;
        const length = Math.hypot(first.x - previous.x, first.y - previous.y) || 1;
        return { x: (first.x - previous.x) / length, y: (first.y - previous.y) / length };
      }
      const radial = { x: first.x - previousArc.center.x, y: first.y - previousArc.center.y };
      const tangent = previousArc.direction === 1
        ? { x: -radial.y, y: radial.x }
        : { x: radial.y, y: -radial.x };
      const length = Math.hypot(tangent.x, tangent.y) || 1;
      return { x: tangent.x / length, y: tangent.y / length };
    };
    const getRadiusArcCandidate = (first, last) => {
      const tangentDirection = getIncomingTangent(first);
      const radius = Number(arcInputsRef.current.radius);
      const arcAngle = Number(arcInputsRef.current.angle);
      const arcLength = Number(arcInputsRef.current.length);
      const hasArcAngle = Number.isFinite(arcAngle) && arcAngle !== 0;
      const hasArcLength = Number.isFinite(arcLength) && arcLength !== 0 && radius > 0;
      const arcExtent = hasArcAngle ? Math.abs(arcAngle) : (hasArcLength ? Math.abs(arcLength / radius * 180 / Math.PI) : 0);
      const requestedAngleValue = hasArcAngle
        ? arcAngle * Math.PI / 180
        : (hasArcLength ? arcLength / radius : 0);
      const hasRequestedAngle = hasArcAngle || hasArcLength;
      const requestedDirection = arcDirectionRef.current === 'clockwise' ? -1 : 1;
      const requestedExtent = arcSizeRef.current === 'large'
        ? Math.max(0.001, Math.PI * 2 - arcExtent * Math.PI / 180)
        : arcExtent * Math.PI / 180;
      const requestedAngle = hasRequestedAngle
        ? requestedDirection * requestedExtent
        : requestedAngleValue;
      const pointerSide = tangentDirection && last
        ? tangentDirection.x * (last.y - first.y) - tangentDirection.y * (last.x - first.x)
        : 1;
      const side = pointerSide < 0 ? -1 : 1;
      const signedAngle = hasRequestedAngle
        ? requestedAngle
        : arcExtent * side;
      const tangentArc = tangentToLastRef.current && tangentDirection
        ? getTangentArc(first, tangentDirection, radius, last, signedAngle)
        : null;
      let endpoint = tangentArc?.endpoint || last;
      let circle = tangentArc;
      let clockwiseHint = false;
      if (!circle && requestedAngle !== 0) {
        const directionLength = Math.hypot(last.x - first.x, last.y - first.y);
        const angle = Math.max(-Math.PI * 2 + 0.001, Math.min(Math.PI * 2 - 0.001, requestedAngle));
        if (directionLength === 0 || Math.abs(angle) < 0.001) return null;
        const direction = { x: (last.x - first.x) / directionLength, y: (last.y - first.y) / directionLength };
        const halfAngle = Math.abs(angle) / 2;
        const chordLength = 2 * radius * Math.sin(halfAngle);
        const midpoint = { x: first.x + direction.x * chordLength / 2, y: first.y + direction.y * chordLength / 2 };
        const normal = { x: -direction.y, y: direction.x };
        const side = angle < 0 ? -1 : 1;
        circle = {
          center: { x: midpoint.x + normal.x * radius * Math.cos(halfAngle) * side, y: midpoint.y + normal.y * radius * Math.cos(halfAngle) * side },
          radius
        };
        endpoint = { x: first.x + direction.x * chordLength, y: first.y + direction.y * chordLength };
        clockwiseHint = angle < 0;
      }
      if (!circle) {
        const chordX = endpoint.x - first.x;
        const chordY = endpoint.y - first.y;
        const chordLength = Math.hypot(chordX, chordY);
        if (!Number.isFinite(radius) || radius <= 0 || chordLength === 0 || chordLength > radius * 2) return null;
        const midpoint = { x: (first.x + endpoint.x) / 2, y: (first.y + endpoint.y) / 2 };
        const offset = Math.sqrt(Math.max(0, radius * radius - (chordLength / 2) ** 2));
        const normal = { x: -chordY / chordLength, y: chordX / chordLength };
        const candidates = [
          { x: midpoint.x + normal.x * offset, y: midpoint.y + normal.y * offset },
          { x: midpoint.x - normal.x * offset, y: midpoint.y - normal.y * offset }
        ].map(center => ({ center, radius }));
        const direction = arcDirectionRef.current;
        const size = arcSizeRef.current;
        if (direction !== 'auto' || size !== 'small') {
          const matches = candidates.filter(candidate => {
            const clockwiseTravel = getArcTravel(first, endpoint, candidate.center, true);
            const clockwise = direction === 'clockwise'
              ? true
              : direction === 'counterclockwise'
                ? false
                : size === 'large' ? clockwiseTravel > Math.PI : clockwiseTravel <= Math.PI;
            const travel = getArcTravel(first, endpoint, candidate.center, clockwise);
            return size === 'large' ? travel > Math.PI : travel <= Math.PI;
          });
          circle = matches[0] || candidates[0];
          clockwiseHint = direction === 'clockwise'
            ? true
            : direction === 'counterclockwise'
              ? false
              : getArcTravel(first, endpoint, circle.center, true) > Math.PI;
        } else {
          circle = getCircleWithRadius(first, endpoint, radius, null, false);
        }
      }
      if (!circle) return null;
      const explicitDirection = arcDirectionRef.current !== 'auto' && !tangentArc;
      const directionHint = explicitDirection
        ? arcDirectionRef.current === 'clockwise'
        : clockwiseHint;
      const definition = getArcDefinitionFromCircle(first, endpoint, circle, tangentDirection, !!tangentArc, directionHint);
      if (!tangentArc && arcSizeRef.current === 'large') {
        const clockwise = arcDirectionRef.current === 'clockwise' || (arcDirectionRef.current === 'auto' && clockwiseHint);
        const travel = getArcTravel(first, endpoint, circle.center, clockwise);
        if (travel <= Math.PI) {
          definition.sweep = 1;
          definition.path = `M ${first.x} ${first.y} A ${circle.radius} ${circle.radius} 0 1 ${clockwise ? 0 : 1} ${endpoint.x} ${endpoint.y}`;
        }
      }
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
        stroke: '#91a8b0', fill: '', strokeWidth: 0.03, strokeDashArray: [0.12, 0.12], selectable: false, evented: false, isEditorGuide: true
      });
      fabricCanvas.add(guidanceLineRef.current);
      fabricCanvas.requestRenderAll();
    };
    const showTwoPointArcPreview = point => {
      if (arcModeRef.current !== 'two-points' || closedRef.current || activePointsRef.current.length < 2) return;
      const [first, middle] = activePointsRef.current;
      const circle = getCircleThroughPoints(first, middle, point);
      if (guidanceLineRef.current) fabricCanvas.remove(guidanceLineRef.current);
      if (!circle) {
        guidanceLineRef.current = null;
        fabricCanvas.requestRenderAll();
        return;
      }
      const definition = getArcDefinition(first, middle, point, circle);
      guidanceLineRef.current = new Path(definition.path, {
        stroke: '#91a8b0', fill: '', strokeWidth: 0.03, strokeDashArray: [0.12, 0.12], selectable: false, evented: false, isEditorGuide: true
      });
      fabricCanvas.add(guidanceLineRef.current);
      fabricCanvas.requestRenderAll();
    };
    const closeCurrentShape = () => {
      const vertices = shapeRef.current.vertex;
      if (vertices.length < 3) return false;
      if (Math.hypot(vertices.at(-1).x - vertices[0].x, vertices.at(-1).y - vertices[0].y) >= 0.32) {
        fabricCanvas.add(new Line([vertices.at(-1).x, vertices.at(-1).y, vertices[0].x, vertices[0].y], { stroke: '#55d6be', strokeWidth: 0.06, selectable: false, evented: false }));
      }
      completeActiveShape();
      clearGuides();
      shapeRef.current = { vertex: [], arcs: [] };
      segmentHistoryRef.current = [];
      closedRef.current = false;
      setIsClosed(false);
      setVertexCount(0);
      setSegmentCount(0);
      syncVertexCoordinates();
      fabricCanvas.requestRenderAll();
      return true;
    };
    const handleMouseDown = event => {
      if (event.e.button === 1 || event.e.altKey) {
        isPanningRef.current = true;
        panPositionRef.current = { x: event.e.clientX, y: event.e.clientY };
        return;
      }
      if (closedRef.current) {
        shapeRef.current = { vertex: [], arcs: [] };
        segmentHistoryRef.current = [];
        closedRef.current = false;
        setIsClosed(false);
        setSegmentCount(0);
      }
      const point = getSnapPoint(fabricCanvas.getScenePoint(event.e));
      const vertices = shapeRef.current.vertex;
      const closeAfterArc = toolRef.current === 'arc'
        && arcModeRef.current === 'radius-point'
        && activePointsRef.current.length === 0
        && vertices.length >= 3
        && Math.hypot(point.x - vertices[0].x, point.y - vertices[0].y) < 0.32;
      if (!closeAfterArc && activePointsRef.current.length === 0 && vertices.length >= 3 && Math.hypot(point.x - vertices[0].x, point.y - vertices[0].y) < 0.32) {
        closeCurrentShape();
        return;
      }
      if (toolRef.current === 'arc' && arcModeRef.current === 'two-points' && shapeRef.current.vertex.length > 0 && activePointsRef.current.length === 0) {
        const previous = shapeRef.current.vertex.at(-1);
        activePointsRef.current.push(previous);
      }
      if (toolRef.current === 'arc' && arcModeRef.current === 'radius-point' && shapeRef.current.vertex.length > 0 && activePointsRef.current.length === 0) {
        activePointsRef.current.push(shapeRef.current.vertex.at(-1));
      }
      activePointsRef.current.push(point);
      fabricCanvas.add(new Circle({ left: point.x, top: point.y, radius: 0.08, fill: '#55d6be', selectable: false, evented: false, isEditorGuide: true,  }));
      setPointCount(activePointsRef.current.length);

      if (toolRef.current === 'line') {
        const vertices = shapeRef.current.vertex;
        if (vertices.length === 0) {
          vertices.push(point);
          addVertexMarker(point, `V${vertices.length}`);
          setVertexCount(vertices.length);
          syncVertexCoordinates();
        } else {
          const previous = vertices.at(-1);
          vertices.push(point);
          setVertexCount(vertices.length);
          syncVertexCoordinates();
          const markers = addVertexMarker(point, `V${vertices.length}`);
          const preview = new Line([previous.x, previous.y, point.x, point.y], { stroke: '#f5f0df', strokeWidth: 0.06, selectable: false, evented: false });
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
          const previous = shapeRef.current.vertex.at(-1);
          if (previous && Math.hypot(last.x - previous.x, last.y - previous.y) < 0.32) {
            shapeRef.current.vertex.push({ x: last.x, y: last.y });
            const newVertex = shapeRef.current.vertex.at(-1);
            const markers = addVertexMarker(newVertex, `V${shapeRef.current.vertex.length}`);
            const preview = new Line([previous.x, previous.y, newVertex.x, newVertex.y], { stroke: '#f5f0df', strokeWidth: 0.06, selectable: false, evented: false });
            fabricCanvas.add(preview);
            segmentHistoryRef.current.push({ vertex: newVertex, preview, markers });
            setVertexCount(shapeRef.current.vertex.length);
            setSegmentCount(segmentHistoryRef.current.length);
            syncVertexCoordinates();
          }
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
          shapeRef.current.arcs.push({ startPoint: arcStart, endPoint: arcLast, center: circle.center, radius: circle.radius, direction: arcDefinition.direction, sweep: arcDefinition.sweep });
          setVertexCount(shapeRef.current.vertex.length);
          syncVertexCoordinates();
          markers.push(...addVertexMarker(arcLast, `V${shapeRef.current.vertex.length}`));
          const preview = new Path(arcDefinition.path, { stroke: '#f5f0df', fill: '', strokeWidth: 0.06, selectable: false, evented: false });
          fabricCanvas.add(preview);
          segmentHistoryRef.current.push({ vertex: arcLast, arc: shapeRef.current.arcs.at(-1), preview, markers });
          setSegmentCount(segmentHistoryRef.current.length);
        }
        clearActivePoints();
      }
      if (closeAfterArc && activePointsRef.current.length === 0) {
        closeCurrentShape();
        return;
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

      const pointer = getSnapPoint(fabricCanvas.getScenePoint(event.e));
      updatePointerValues(pointer);
      updateSnapHint(pointer);

      if (!closedRef.current && arcModeRef.current === 'radius-point' && toolRef.current === 'arc') {
        showRadiusArcPreview(pointer);
      } else if (!closedRef.current && arcModeRef.current === 'two-points' && toolRef.current === 'arc' && activePointsRef.current.length >= 2) {
        showTwoPointArcPreview(pointer);
      } else if (!closedRef.current && shapeRef.current.vertex.length > 0 && activePointsRef.current.length === 0) {
        const lastVertex = shapeRef.current.vertex.at(-1);
        if (guidanceLineRef.current) fabricCanvas.remove(guidanceLineRef.current);
        guidanceLineRef.current = new Line([lastVertex.x, lastVertex.y, pointer.x, pointer.y], {
          stroke: '#91a8b0',
          strokeWidth: 0.03,
          strokeDashArray: [0.12, 0.12],
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
      updateVertexRef.current = null;
      updateSegmentRef.current = null;
    };
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (shapeRef.current.vertex.length < 3 && completedShapesRef.current.length === 0) return;
    const symbolName = name.trim() || 'CustomSymbol';
    if (existingNames.includes(symbolName)) {
      setNameError('A symbol with this name already exists.');
      return;
    }
    setNameError('');
    if (!closedRef.current) closePolygon();
    const shapes = [...completedShapesRef.current];
    if (shapeRef.current.vertex.length >= 3) shapes.push(shapeRef.current);
    onCreate(normalizeShapes(shapes), symbolName, color);
    onClose();
  };

  const closePolygon = () => {
    if (shapeRef.current.vertex.length < 3) return;
    const vertices = shapeRef.current.vertex;
    fabricCanvasRef.current?.add(new Line([vertices.at(-1).x, vertices.at(-1).y, vertices[0].x, vertices[0].y], { stroke: '#55d6be', strokeWidth: 0.06, selectable: false, evented: false }));
    completeShapeRef.current?.();
    fabricCanvasRef.current?.getObjects().filter(object => object.isEditorGuide).forEach(object => fabricCanvasRef.current.remove(object));
    guidanceLineRef.current = null;
    snapHintRef.current = null;
    activePointsRef.current = [];
    shapeRef.current = { vertex: [], arcs: [] };
    segmentHistoryRef.current = [];
    closedRef.current = false;
    setIsClosed(false);
    setVertexCount(0);
    setPointCount(0);
    setSegmentCount(0);
    const listData = getEditorListData(completedShapesRef.current, shapeRef.current);
    setVertexCoordinates(listData.vertices);
    setSegmentEntries(listData.segments);
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
    const listData = getEditorListData(completedShapesRef.current, shapeRef.current);
    setVertexCoordinates(listData.vertices);
    setSegmentEntries(listData.segments);
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

  const selectFillMode = event => {
    const nextMode = event.target.value;
    fillModeRef.current = nextMode;
    setFillMode(nextMode);
  };

  const updateFillColor = event => {
    fillColorRef.current = event.target.value;
    setFillColor(event.target.value);
  };

  const toggleTangent = event => {
    tangentToLastRef.current = event.target.checked;
    setTangentToLast(event.target.checked);
  };

  const selectArcDirection = event => {
    arcDirectionRef.current = event.target.value;
    setArcDirection(event.target.value);
  };

  const selectArcSize = event => {
    arcSizeRef.current = event.target.value;
    setArcSize(event.target.value);
  };

  const toggleSnap = event => {
    snapEnabledRef.current = event.target.checked;
    setSnapEnabled(event.target.checked);
    if (!event.target.checked && fabricCanvasRef.current) {
      fabricCanvasRef.current.getObjects().filter(object => object.isEditorGuide && object === snapHintRef.current).forEach(object => fabricCanvasRef.current.remove(object));
      snapHintRef.current = null;
      fabricCanvasRef.current.requestRenderAll();
    }
  };

  const updateVertexCoordinate = (vertex, key, value) => {
    updateVertexRef.current?.(vertex.label, key, value);
  };

  const updateSegmentInput = (segment, key, value) => {
    updateSegmentRef.current?.(segment, key, value);
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
        <div className="custom-symbol-toolbar custom-symbol-tool-row">
          <button type="button" className={`toggle-button ${tool === 'line' ? 'active' : ''}`} onClick={() => selectTool('line')}>Line</button>
          <button type="button" className={`toggle-button ${tool === 'arc' ? 'active' : ''}`} onClick={() => selectTool('arc')}>Arc</button>
          <label className="custom-symbol-check custom-symbol-snap-toggle">
            <input type="checkbox" checked={snapEnabled} onChange={toggleSnap} />
            Snap
          </label>
        </div>
        <div className="custom-symbol-fill-settings">
          <label className="custom-symbol-coordinate">
            <span>Fill</span>
            <select className="input-field" value={fillMode} onChange={selectFillMode}>
              <option value="default">Default</option>
              <option value="true-color">True color</option>
              <option value="negative">Negative</option>
            </select>
          </label>
          {fillMode === 'true-color' && (
            <label className="custom-symbol-color-picker">
              <span>Color</span>
              <input type="color" value={fillColor} onChange={updateFillColor} aria-label="Fill color" />
            </label>
          )}
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
                <label className="custom-symbol-coordinate">
                  <span>Direction</span>
                  <select className="input-field" value={arcDirection} onChange={selectArcDirection}>
                    <option value="auto">Auto</option>
                    <option value="clockwise">Clockwise</option>
                    <option value="counterclockwise">Counterclockwise</option>
                  </select>
                </label>
                <label className="custom-symbol-coordinate">
                  <span>Arc size</span>
                  <select className="input-field" value={arcSize} onChange={selectArcSize}>
                    <option value="small">Small (&lt;= 180 deg)</option>
                    <option value="large">Large (&gt; 180 deg)</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        <div className="custom-symbol-toolbar">
          <span>{tool === 'line' ? 'Click points in sequence' : arcMode === 'radius-point' ? 'Click the arc end point' : 'Click the arc middle, then its end point'}</span>
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
        <div className="custom-symbol-editor-row">
          <canvas ref={canvasElementRef} className="custom-symbol-canvas" aria-label="Custom symbol drawing canvas" />
          <aside className="custom-symbol-vertex-list" aria-label="Added vertex coordinates">
            <div className="custom-symbol-vertex-heading">Vertices <span>{vertexCoordinates.length}</span></div>
            {vertexCoordinates.length === 0 ? <span className="custom-symbol-empty-list">No vertices yet</span> : vertexCoordinates.map(vertex => {
              const segment = segmentEntries.find(entry => entry.startLabel === vertex.label);
              return (
                <React.Fragment key={vertex.label}>
                  <div className={`custom-symbol-vertex ${selectedVertexLabel === vertex.label ? 'active' : ''}`} key={vertex.label} role="button" tabIndex={0} onClick={() => setSelectedVertexLabel(vertex.label)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setSelectedVertexLabel(vertex.label); }}>
                    <strong>{vertex.label}</strong>
                    {selectedVertexLabel === vertex.label ? (
                      <>
                        <label>X <input className="input-field" type="number" step="0.001" value={vertex.x.toFixed(3)} onClick={event => event.stopPropagation()} onChange={event => updateVertexCoordinate(vertex, 'x', event.target.value)} /></label>
                        <label>Y <input className="input-field" type="number" step="0.001" value={vertex.y.toFixed(3)} onClick={event => event.stopPropagation()} onChange={event => updateVertexCoordinate(vertex, 'y', event.target.value)} /></label>
                      </>
                    ) : (
                      <><span>X {vertex.x.toFixed(1)}</span><span>Y {vertex.y.toFixed(1)}</span></>
                    )}
                  </div>
                  {segment && (
                    <div className={`custom-symbol-segment ${segment.arc && selectedSegmentKey === segment.key ? 'active' : ''}`}>
                      {segment.arc ? (
                        <>
                          <button type="button" className="custom-symbol-segment-label" aria-expanded={selectedSegmentKey === segment.key} onClick={() => setSelectedSegmentKey(selectedSegmentKey === segment.key ? null : segment.key)}>
                            {segment.startLabel} to {segment.endLabel} Arc
                          </button>
                          {selectedSegmentKey === segment.key && (
                            <div className="custom-symbol-segment-inputs">
                              <label>Radius <input className="input-field" type="number" min="0.001" step="0.001" value={segment.arc.radius.toFixed(3)} onChange={event => updateSegmentInput(segment, 'radius', event.target.value)} /></label>
                              <label>Direction <select className="input-field" value={segment.arc.direction === 0 ? 'clockwise' : 'counterclockwise'} onChange={event => updateSegmentInput(segment, 'direction', event.target.value)}><option value="clockwise">Clockwise</option><option value="counterclockwise">Counterclockwise</option></select></label>
                              <label>Arc size <select className="input-field" value={segment.arc.sweep ? 'large' : 'small'} onChange={event => updateSegmentInput(segment, 'size', event.target.value)}><option value="small">Small</option><option value="large">Large</option></select></label>
                            </div>
                          )}
                        </>
                      ) : (
                        <span>{segment.startLabel} to {segment.endLabel} Line</span>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </aside>
        </div>
        <div className="custom-symbol-actions">
          <button type="button" className="toggle-button" onClick={onClose}>Cancel</button>
          <button type="button" className="toggle-button" onClick={undoLastSegment} disabled={isClosed || !segmentCount}>Undo</button>
          <button type="button" className="toggle-button" onClick={closePolygon} disabled={isClosed || vertexCount < 3}>Close polygon</button>
          <button type="button" className="panel-action-button" onClick={handleCreate} disabled={!isClosed && !completedShapeCount}>Add symbol</button>
        </div>
      </div>
    </div>
    ),
    document.body
  );
}

function getTangentArc(first, tangentVector, radius, endpoint, angleDegrees) {
  if (!tangentVector || !Number.isFinite(radius) || radius <= 0) return null;
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