"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./waves.module.css";

class Gradient {
  constructor(
    private readonly x: number,
    private readonly y: number,
  ) {}

  dot2(x: number, y: number) {
    return this.x * x + this.y * y;
  }
}

class Noise {
  private readonly gradients = [
    new Gradient(1, 1),
    new Gradient(-1, 1),
    new Gradient(1, -1),
    new Gradient(-1, -1),
    new Gradient(1, 0),
    new Gradient(-1, 0),
    new Gradient(1, 0),
    new Gradient(-1, 0),
    new Gradient(0, 1),
    new Gradient(0, -1),
    new Gradient(0, 1),
    new Gradient(0, -1),
  ];

  private readonly permutationSource = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
    234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
    134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
    116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
    124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
    47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
    154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
    108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
    242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
    239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
    141, 128, 195, 78, 66, 215, 61, 156, 180,
  ];

  private readonly permutation = new Array<number>(512);
  private readonly gradientPermutation = new Array<Gradient>(512);

  constructor(seed = 7) {
    this.seed(seed);
  }

  private seed(seed: number) {
    let normalized = seed;
    if (normalized > 0 && normalized < 1) normalized *= 65536;
    normalized = Math.floor(normalized);
    if (normalized < 256) normalized |= normalized << 8;

    for (let index = 0; index < 256; index += 1) {
      const value =
        index & 1
          ? this.permutationSource[index] ^ (normalized & 255)
          : this.permutationSource[index] ^ ((normalized >> 8) & 255);
      this.permutation[index] = this.permutation[index + 256] = value;
      this.gradientPermutation[index] = this.gradientPermutation[index + 256] =
        this.gradients[value % 12];
    }
  }

  private fade(value: number) {
    return value * value * value * (value * (value * 6 - 15) + 10);
  }

  private lerp(start: number, end: number, progress: number) {
    return (1 - progress) * start + progress * end;
  }

  perlin2(xValue: number, yValue: number) {
    let xFloor = Math.floor(xValue);
    let yFloor = Math.floor(yValue);
    const x = xValue - xFloor;
    const y = yValue - yFloor;
    xFloor &= 255;
    yFloor &= 255;

    const n00 = this.gradientPermutation[
      xFloor + this.permutation[yFloor]
    ].dot2(x, y);
    const n01 = this.gradientPermutation[
      xFloor + this.permutation[yFloor + 1]
    ].dot2(x, y - 1);
    const n10 = this.gradientPermutation[
      xFloor + 1 + this.permutation[yFloor]
    ].dot2(x - 1, y);
    const n11 = this.gradientPermutation[
      xFloor + 1 + this.permutation[yFloor + 1]
    ].dot2(x - 1, y - 1);
    const fadeX = this.fade(x);

    return this.lerp(
      this.lerp(n00, n10, fadeX),
      this.lerp(n01, n11, fadeX),
      this.fade(y),
    );
  }
}

type Offset = { x: number; y: number };
type WavePoint = {
  x: number;
  y: number;
  wave: Offset;
  cursor: Offset & { vx: number; vy: number };
};

type MouseState = {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  smoothX: number;
  smoothY: number;
  velocitySmooth: number;
  angle: number;
  isSet: boolean;
};

type WavesProps = {
  backgroundColor?: string;
  className?: string;
  friction?: number;
  lineColor?: string;
  maxCursorMove?: number;
  style?: CSSProperties;
  tension?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  waveSpeedX?: number;
  waveSpeedY?: number;
  xGap?: number;
  yGap?: number;
};

export function Waves({
  backgroundColor = "transparent",
  className,
  friction = 0.92,
  lineColor = "rgba(94, 234, 212, 0.24)",
  maxCursorMove = 80,
  style,
  tension = 0.008,
  waveAmpX = 28,
  waveAmpY = 14,
  waveSpeedX = 0.006,
  waveSpeedY = 0.008,
  xGap = 16,
  yGap = 44,
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef({
    friction,
    lineColor,
    maxCursorMove,
    tension,
    waveAmpX,
    waveAmpY,
    waveSpeedX,
    waveSpeedY,
    xGap,
    yGap,
  });

  useEffect(() => {
    configRef.current = {
      friction,
      lineColor,
      maxCursorMove,
      tension,
      waveAmpX,
      waveAmpY,
      waveSpeedX,
      waveSpeedY,
      xGap,
      yGap,
    };
  }, [
    friction,
    lineColor,
    maxCursorMove,
    tension,
    waveAmpX,
    waveAmpY,
    waveSpeedX,
    waveSpeedY,
    xGap,
    yGap,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return;
    const interactionTarget = container.parentElement ?? container;

    const noise = new Noise();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let lines: WavePoint[][] = [];
    let width = 0;
    let height = 0;
    let left = 0;
    let top = 0;
    let isVisible = true;
    const mouse: MouseState = {
      x: -10,
      y: 0,
      lastX: 0,
      lastY: 0,
      smoothX: 0,
      smoothY: 0,
      velocitySmooth: 0,
      angle: 0,
      isSet: false,
    };

    const setLines = () => {
      const config = configRef.current;
      const totalLines = Math.ceil((width + 200) / config.xGap);
      const totalPoints = Math.ceil((height + 30) / config.yGap);
      const xStart = (width - config.xGap * totalLines) / 2;
      const yStart = (height - config.yGap * totalPoints) / 2;

      lines = Array.from({ length: totalLines + 1 }, (_, lineIndex) =>
        Array.from({ length: totalPoints + 1 }, (_, pointIndex) => ({
          x: xStart + config.xGap * lineIndex,
          y: yStart + config.yGap * pointIndex,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        })),
      );
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
      width = bounds.width;
      height = bounds.height;
      left = bounds.left;
      top = bounds.top;
      canvas.width = Math.max(Math.round(width * pixelRatio), 1);
      canvas.height = Math.max(Math.round(height * pixelRatio), 1);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      setLines();
    };

    const movePoints = (time: number) => {
      const config = configRef.current;
      for (const points of lines) {
        for (const point of points) {
          const movement =
            noise.perlin2(
              (point.x + time * config.waveSpeedX) * 0.002,
              (point.y + time * config.waveSpeedY) * 0.0015,
            ) * 12;
          point.wave.x = Math.cos(movement) * config.waveAmpX;
          point.wave.y = Math.sin(movement) * config.waveAmpY;

          if (!reducedMotion.matches && mouse.isSet) {
            const dx = point.x - mouse.smoothX;
            const dy = point.y - mouse.smoothY;
            const distance = Math.hypot(dx, dy);
            const radius = Math.max(175, mouse.velocitySmooth);
            if (distance < radius) {
              const strength = 1 - distance / radius;
              const force = Math.cos(distance * 0.001) * strength;
              point.cursor.vx +=
                Math.cos(mouse.angle) *
                force *
                radius *
                mouse.velocitySmooth *
                0.00065;
              point.cursor.vy +=
                Math.sin(mouse.angle) *
                force *
                radius *
                mouse.velocitySmooth *
                0.00065;
            }
          }

          point.cursor.vx += -point.cursor.x * config.tension;
          point.cursor.vy += -point.cursor.y * config.tension;
          point.cursor.vx *= config.friction;
          point.cursor.vy *= config.friction;
          point.cursor.x = Math.min(
            config.maxCursorMove,
            Math.max(
              -config.maxCursorMove,
              point.cursor.x + point.cursor.vx * 2,
            ),
          );
          point.cursor.y = Math.min(
            config.maxCursorMove,
            Math.max(
              -config.maxCursorMove,
              point.cursor.y + point.cursor.vy * 2,
            ),
          );
        }
      }
    };

    const moved = (point: WavePoint, withCursor = true) => ({
      x: point.x + point.wave.x + (withCursor ? point.cursor.x : 0),
      y: point.y + point.wave.y + (withCursor ? point.cursor.y : 0),
    });

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = configRef.current.lineColor;

      for (const points of lines) {
        const first = moved(points[0], false);
        context.moveTo(first.x, first.y);
        points.forEach((point, index) => {
          const isLast = index === points.length - 1;
          const current = moved(point, !isLast);
          context.lineTo(current.x, current.y);
        });
      }
      context.stroke();
    };

    const tick = (time: number) => {
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.1;
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.1;
      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      const velocity = Math.hypot(dx, dy);
      mouse.velocitySmooth += (velocity - mouse.velocitySmooth) * 0.1;
      mouse.velocitySmooth = Math.min(100, mouse.velocitySmooth);
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.angle = Math.atan2(dy, dx);

      movePoints(time);
      draw();
      if (!reducedMotion.matches && isVisible) {
        frameId = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(tick);
    };

    const updatePointer = (event: PointerEvent) => {
      mouse.x = event.clientX - left;
      mouse.y = event.clientY - top;
      if (!mouse.isSet) {
        mouse.smoothX = mouse.lastX = mouse.x;
        mouse.smoothY = mouse.lastY = mouse.y;
        mouse.isSet = true;
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else cancelAnimationFrame(frameId);
    });
    const handleMotionPreference = () => start();

    interactionTarget.addEventListener("pointermove", updatePointer);
    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    reducedMotion.addEventListener("change", handleMotionPreference);
    resize();
    start();

    return () => {
      cancelAnimationFrame(frameId);
      interactionTarget.removeEventListener("pointermove", updatePointer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className ?? ""}`}
      style={{ backgroundColor, ...style }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
