import { Camera, Geometry, Mesh, Program, Renderer, Texture, Transform, type OGLRenderingContext } from "ogl";

import type { PhonePose, Rgb } from "@/components/story/story-pose";

/**
 * The story's phone as a lit 3D object (OGL, about 18 KB gzip with the
 * engine; loaded only with the scroll cinema, as the visitor scrolls toward
 * the story, and only where WebGL 2 runs on a real GPU — see
 * `story-phone-canvas.tsx`).
 *
 * A generic device: a bevelled rounded slab in a lilac titanium, dark glass
 * front and back, two side keys, and the screen. No camera bump, notch or
 * logo that could read as another brand's hardware. There is no environment
 * map: the metal and the glass reflect a procedural studio of soft boxes — a
 * white key, a top light and rims in the current dock colour — so the GPU
 * does a few smoothsteps per pixel and nothing is precomputed.
 *
 * The screen shows the app's own captures (the same WebP files as the CSS
 * phone) unlit and not tone-mapped; only the wipe's glowing edge and a faint
 * glass glare are added on top — at most +0.06 face-on, rising to a Fresnel
 * sheen of about +0.2 at grazing angles while the phone turns. It draws only
 * when asked to — once per frame while the story's progress changes — and
 * never on its own.
 */

const CAPTURE_RATIO = 1206 / 2622;
/** The device, in world units: 2 tall, the screen at exactly the capture's ratio. */
const H = 2.0;
const BEZEL = 0.03;
const SCREEN_H = H - 2 * BEZEL;
const SCREEN_W = SCREEN_H * CAPTURE_RATIO;
const W = SCREEN_W + 2 * BEZEL;
const RADIUS = 0.15;
const THICKNESS = 0.13;
const BEVEL = 0.03;
/** The camera never moves; the field of view sets the phone's pixel size. */
const CAMERA_Z = 5.4;

/** Where one device of the finale's range comes to rest. */
type Slot = { x: number; y: number; z: number; ry: number; rz: number; s: number };

/**
 * The finale's range, low under "Start talking." in a slight arc, left to
 * right: Home, Servers, the phone itself (on Moments, a little larger and
 * forward) and Chats. The phone settles just right of the centre, across
 * it, so the middle of the row is never an empty gap; Home, Servers and
 * Chats come out from behind it at the centre and move straight out to
 * their places, Home (the furthest) first, so no two paths cross. Sized so
 * the phones' tops stay under the line's descenders.
 */
const LEAD_SLOT: Slot = { x: 0.2, y: -0.815, z: 0.1, ry: -6, rz: -1, s: 0.54 };
const SLOTS: readonly Slot[] = [
  { x: -1.075, y: -0.91, z: -0.34, ry: 22, rz: 4.5, s: 0.5 },
  { x: -0.445, y: -0.83, z: -0.08, ry: 9, rz: 1.5, s: 0.5 },
  { x: 0.84, y: -0.88, z: -0.24, ry: -18, rz: -3.5, s: 0.5 },
];
/** When each of Home, Servers and Chats sets off, as a share of the move. */
const FAN_DELAY = [0.08, 0.16, 0.12];

type Ring = [x: number, y: number, nx: number, ny: number][];

/** Outline of a rounded rectangle with outward normals, counter-clockwise. */
function outline(w: number, h: number, r: number, segments: number): Ring {
  const points: Ring = [];
  const corners = [
    [w / 2 - r, -h / 2 + r, -Math.PI / 2],
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
  ];
  for (const [cx, cy, start] of corners) {
    for (let index = 0; index <= segments; index++) {
      const angle = start + (index / segments) * (Math.PI / 2);
      points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, Math.cos(angle), Math.sin(angle)]);
    }
  }
  return points;
}

/** A bevelled rounded slab: walls and bevels (the frame), and the two lids (glass). */
function slab(gl: OGLRenderingContext, w: number, h: number, r: number, t: number, b: number, segments = 10, bevelSteps = 6) {
  const ring = outline(w, h, r, segments);
  const n = ring.length;
  const profile: [inset: number, z: number, cr: number, sz: number][] = [];
  for (let k = 0; k <= bevelSteps; k++) {
    const angle = (Math.PI / 2) * (1 - k / bevelSteps);
    profile.push([b - b * Math.cos(angle), t / 2 - b + b * Math.sin(angle), Math.cos(angle), Math.sin(angle)]);
  }
  for (let k = 0; k <= bevelSteps; k++) {
    const angle = -(Math.PI / 2) * (k / bevelSteps);
    profile.push([b - b * Math.cos(angle), -(t / 2 - b) + b * Math.sin(angle), Math.cos(angle), Math.sin(angle)]);
  }
  const position: number[] = [];
  const normal: number[] = [];
  const index: number[] = [];
  for (const [inset, z, cr, sz] of profile) {
    for (const [x, y, nx, ny] of ring) {
      position.push(x - nx * inset, y - ny * inset, z);
      normal.push(nx * cr, ny * cr, sz);
    }
  }
  for (let j = 0; j < profile.length - 1; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * n + i;
      const c = j * n + ((i + 1) % n);
      index.push(a, a + n, c, c, a + n, c + n);
    }
  }
  const walls = new Geometry(gl, {
    position: { size: 3, data: new Float32Array(position) },
    normal: { size: 3, data: new Float32Array(normal) },
    index: { data: new Uint16Array(index) },
  });

  const lidPosition: number[] = [];
  const lidNormal: number[] = [];
  const lidIndex: number[] = [];
  for (const side of [1, -1]) {
    const base = lidPosition.length / 3;
    lidPosition.push(0, 0, (side * t) / 2);
    lidNormal.push(0, 0, side);
    for (const [x, y, nx, ny] of ring) {
      lidPosition.push(x - nx * b, y - ny * b, (side * t) / 2);
      lidNormal.push(0, 0, side);
    }
    for (let i = 0; i < n; i++) lidIndex.push(base, base + 1 + i, base + 1 + ((i + 1) % n));
  }
  const lids = new Geometry(gl, {
    position: { size: 3, data: new Float32Array(lidPosition) },
    normal: { size: 3, data: new Float32Array(lidNormal) },
    index: { data: new Uint16Array(lidIndex) },
  });
  return { walls, lids };
}

function screenGeometry(gl: OGLRenderingContext, w: number, h: number, r: number) {
  const ring = outline(w, h, r, 12);
  const position = [0, 0, 0];
  const uv = [0.5, 0.5];
  const normal = [0, 0, 1];
  for (const [x, y] of ring) {
    position.push(x, y, 0);
    uv.push(x / w + 0.5, y / h + 0.5);
    normal.push(0, 0, 1);
  }
  const index: number[] = [];
  for (let i = 0; i < ring.length; i++) index.push(0, 1 + i, 1 + ((i + 1) % ring.length));
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(position) },
    normal: { size: 3, data: new Float32Array(normal) },
    uv: { size: 2, data: new Float32Array(uv) },
    index: { data: new Uint16Array(index) },
  });
}

const VERTEX = /* glsl */ `#version 300 es
  in vec3 position; in vec3 normal; in vec2 uv;
  uniform mat4 modelMatrix; uniform mat4 viewMatrix; uniform mat4 projectionMatrix; uniform vec3 cameraPosition;
  out vec3 vN; out vec3 vV; out vec2 vUv; out vec3 vP;
  void main() {
    vP = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - world.xyz);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * world;
  }`;

const VERTEX_SOLID = VERTEX.replace("in vec2 uv;", "").replace("vUv = uv;", "vUv = vec2(0.0);");

const STUDIO = /* glsl */ `
  uniform vec3 uTint;
  vec3 studio(vec3 r) {
    float top = smoothstep(0.35, 0.95, r.y);
    float key = (1.0 - smoothstep(0.0, 0.28, abs(r.x + 0.7))) * smoothstep(-0.5, 0.3, r.y);
    float rim = smoothstep(0.25, 0.95, r.x) + smoothstep(0.2, 0.9, -r.z) * 0.5 + smoothstep(0.3, 0.95, -r.x) * 0.35;
    float low = (1.0 - smoothstep(-0.9, -0.2, r.y)) * 0.3;
    return vec3(0.015) + vec3(top * 0.8 + key * 1.3) + uTint * (rim * 1.7 + low);
  }
  vec3 finish(vec3 c) { c = c / (1.0 + c); return pow(c, vec3(1.0 / 2.2)); }`;

const FRAME_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  in vec3 vN; in vec3 vV; in vec2 vUv; out vec4 color;
  uniform vec3 uBase;
  ${STUDIO}
  void main() {
    vec3 n = normalize(vN); vec3 v = normalize(vV);
    vec3 r = reflect(-v, n);
    float f = 0.55 + 0.45 * pow(1.0 - max(dot(n, v), 0.0), 2.0);
    color = vec4(finish(uBase * studio(r) * f), 1.0);
  }`;

// Dark glass: a deep violet-black that mostly reflects darkness, one long
// soft box that slides across it as the phone turns, and the rim colour at
// grazing angles — so the back reads as glass, never as a grey panel.
const GLASS_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  in vec3 vN; in vec3 vV; in vec2 vUv; in vec3 vP; out vec4 color;
  ${STUDIO}
  void main() {
    vec3 n = normalize(vN); vec3 v = normalize(vV);
    vec3 r = reflect(-v, n);
    float fr = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
    // Where the soft box lands on the glass: it follows the reflection, and
    // sweeps across the surface as the phone turns.
    float s = r.x * 0.8 + r.y * 0.6 + vP.x * 0.5 + vP.y * 0.28;
    float streak = 1.0 - smoothstep(0.0, 0.12, abs(s - 0.5));
    float sheen = 1.0 - smoothstep(0.0, 0.7, abs(s - 0.5));
    vec3 env = studio(r) * 0.2 + vec3(streak) * 1.2 + vec3(sheen) * 0.35 + uTint * sheen * 0.4;
    color = vec4(finish(vec3(0.0035, 0.0025, 0.007) + env * max(fr, 0.07)), 1.0);
  }`;

// The captures are uploaded as they are (sRGB bytes) and written out
// unchanged; the wipe's edge and the glass glare are added on top.
const SCREEN_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  in vec3 vN; in vec3 vV; in vec2 vUv; out vec4 color;
  uniform sampler2D uA; uniform sampler2D uB; uniform float uWipe; uniform vec3 uEdge;
  vec3 capture(sampler2D t, vec2 uv) { uv = clamp(uv, 0.0, 1.0); return texture(t, vec2(uv.x, 1.0 - uv.y)).rgb; }
  void main() {
    float w = uWipe;
    vec3 a = capture(uA, vec2(vUv.x, vUv.y - w * 0.12)) * (1.0 - 0.62 * w);
    vec3 b = capture(uB, vec2(vUv.x, vUv.y + (1.0 - w) * 0.10));
    vec3 col = mix(a, b, step(vUv.y, w));
    float moving = step(0.002, w) * step(w, 0.998);
    col += uEdge * (exp(-abs(vUv.y - w) * 140.0) * 1.1 + exp(-abs(vUv.y - w) * 40.0) * 0.16) * moving;
    vec3 n = normalize(vN); vec3 v = normalize(vV); vec3 r = reflect(-v, n);
    float band = (1.0 - smoothstep(0.0, 0.2, abs(r.x * 0.85 + r.y * 0.5 - 0.18))) * 0.06;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.35;
    color = vec4(col + band + fres, 1.0);
  }`;

const linear = (color: Rgb): number[] => color.map((channel) => Math.pow(channel, 2.2));
const LILAC_TITANIUM: Rgb = [0xb3 / 255, 0xa2 / 255, 0xcf / 255];

/** Where the phone sits in the canvas: its height in CSS px, and its centre's offset from the canvas centre. */
export type PhoneView = { phonePx: number; offsetX: number; offsetY: number };

export type PhoneEngine = {
  /** Draws one pose. */
  draw(pose: PhonePose): void;
  /** Takes the canvas's new size, where the phone sits in it and (optionally)
   * a new resolution, and draws again. */
  layout(view: PhoneView, dpr?: number): void;
  /** A lower drawing-buffer resolution, for a device that cannot keep up. */
  setDpr(dpr: number): void;
  readonly dpr: number;
  dispose(): void;
};

/** Hands the main thread back for a frame between the steps of building the phone. */
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Builds the phone on a canvas whose WebGL 2 context the caller has already
 * created (with `failIfMajorPerformanceCaveat`), once every capture is
 * decoded and uploaded. The work is spread over a few frames — each shader
 * link and each capture upload is its own short task — so starting it never
 * blocks the page in one long one. Rejects if anything fails; the caller
 * keeps the CSS phone then.
 */
export async function createPhoneEngine(
  canvas: HTMLCanvasElement,
  options: { captures: readonly string[]; dpr: number; antialias: boolean; textureWidth: number },
): Promise<PhoneEngine> {
  // The captures load through an image, like the CSS phone's <img>: the
  // browser asks for the format it prefers (WebP) and shares its cache with
  // the page, so a capture the page already has is not fetched again.
  const height = Math.round(options.textureWidth / CAPTURE_RATIO);
  const sources = await Promise.all(
    options.captures.map(async (url): Promise<ImageBitmap | HTMLImageElement> => {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      await image.decode();
      try {
        return await createImageBitmap(image, {
          resizeWidth: options.textureWidth,
          resizeHeight: height,
          resizeQuality: "high",
        });
      } catch {
        return image;
      }
    }),
  );

  let dpr = options.dpr;
  const renderer = new Renderer({
    canvas,
    dpr,
    alpha: true,
    antialias: options.antialias,
    premultipliedAlpha: true,
    powerPreference: "low-power",
    webgl: 2,
  });
  const gl = renderer.gl;
  if (!renderer.isWebgl2) throw new Error("WebGL 2 unavailable");
  gl.clearColor(0, 0, 0, 0);
  // CSS owns the canvas's display size; OGL only sizes the drawing buffer.
  canvas.style.width = "";
  canvas.style.height = "";

  const camera = new Camera(gl, { fov: 25, near: 0.1, far: 50 });
  camera.position.set(0, 0, CAMERA_Z);
  const scene = new Transform();
  const root = new Transform();
  root.setParent(scene);
  const phone = new Transform();
  phone.setParent(root);

  const tint = { value: linear([0x7b / 255, 0x2f / 255, 0xf7 / 255]) };
  await nextFrame();
  const frameProgram = new Program(gl, {
    vertex: VERTEX_SOLID,
    fragment: FRAME_FRAGMENT,
    cullFace: false,
    uniforms: { uTint: tint, uBase: { value: linear(LILAC_TITANIUM) } },
  });
  await nextFrame();
  const glassProgram = new Program(gl, {
    vertex: VERTEX_SOLID,
    fragment: GLASS_FRAGMENT,
    cullFace: false,
    uniforms: { uTint: tint },
  });

  const anisotropy = Math.min(4, renderer.parameters.maxAnisotropy ?? 0);
  const textures: Texture[] = [];
  // Upload every capture now, not on its chapter's first frame mid-scroll.
  for (const source of sources) {
    await nextFrame();
    const texture = new Texture(gl, {
      // OGL uploads an ImageBitmap as it does an image (texImage2D takes both).
      image: source as HTMLImageElement,
      flipY: false,
      generateMipmaps: true,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      anisotropy,
    });
    texture.update(0);
    if ("close" in source) source.close();
    textures.push(texture);
  }
  await nextFrame();

  const body = slab(gl, W, H, RADIUS, THICKNESS, BEVEL);
  const keys = ([[0.2, 0.42], [0.32, 0.02]] as const).map(
    ([height, y]) => [slab(gl, 0.06, height, 0.025, 0.045, 0.012, 4, 3), y] as const,
  );
  const screen = screenGeometry(gl, SCREEN_W, SCREEN_H, RADIUS - BEZEL);
  const geometries = [body.walls, body.lids, ...keys.flatMap(([key]) => [key.walls, key.lids]), screen];
  const programs: Program[] = [frameProgram, glassProgram];

  /** What one device's screen shows: two captures, the wipe between them and its edge. */
  type ScreenState = { a: Texture; b: Texture; wipe: number; edge: number[] };

  // One screen program for every device; each sets its own values just
  // before it draws (one shader link at start instead of one per device).
  const screenUniforms = {
    uA: { value: textures[0] },
    uB: { value: textures[1] },
    uWipe: { value: 0 },
    uEdge: { value: [0, 0, 0] },
  };
  await nextFrame();
  const screenProgram = new Program(gl, {
    vertex: VERTEX,
    fragment: SCREEN_FRAGMENT,
    cullFace: false,
    uniforms: screenUniforms,
  });
  programs.push(screenProgram);

  /** One device: bevelled body, two side keys and a screen showing `state`. */
  function device(state: ScreenState) {
    const group = new Transform();
    new Mesh(gl, { geometry: body.walls, program: frameProgram }).setParent(group);
    new Mesh(gl, { geometry: body.lids, program: glassProgram }).setParent(group);
    for (const [key, y] of keys) {
      for (const geometry of [key.walls, key.lids]) {
        const mesh = new Mesh(gl, { geometry, program: frameProgram });
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(W / 2 - 0.012, y, 0);
        mesh.setParent(group);
      }
    }
    const glass = new Mesh(gl, { geometry: screen, program: screenProgram });
    glass.onBeforeRender(() => {
      screenUniforms.uA.value = state.a;
      screenUniforms.uB.value = state.b;
      screenUniforms.uWipe.value = state.wipe;
      screenUniforms.uEdge.value = state.edge;
    });
    glass.position.z = THICKNESS / 2 + 0.0015;
    glass.setParent(group);
    return group;
  }

  const main: ScreenState = { a: textures[0], b: textures[1], wipe: 0, edge: [0, 0, 0] };
  device(main).setParent(phone);

  // The range: one more device per other destination, each on its own capture.
  const others = [0, 1, 2].map((index) => {
    const group = device({ a: textures[index], b: textures[index], wipe: 0, edge: [0, 0, 0] });
    group.setParent(root);
    group.visible = false;
    return group;
  });

  let view: PhoneView = { phonePx: 1, offsetX: 0, offsetY: 0 };
  let last: PhonePose | null = null;
  let disposed = false;

  function applyView() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.dpr = dpr;
    renderer.setSize(width, height);
    canvas.style.width = "";
    canvas.style.height = "";
    // One unit is half the phone's height in px wherever the canvas is: the
    // field of view follows the canvas, the camera stays put.
    const fov = (2 * Math.atan(height / (view.phonePx * CAMERA_Z)) * 180) / Math.PI;
    camera.perspective({ fov, aspect: width / height });
    const unit = view.phonePx / 2;
    root.position.set(view.offsetX / unit, -view.offsetY / unit, 0);
  }

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const DEG = Math.PI / 180;

  function place(group: Transform, slot: Slot, t: number, from: Slot) {
    group.position.set(lerp(from.x, slot.x, t), lerp(from.y, slot.y, t), lerp(from.z, slot.z, t));
    group.rotation.set(0, lerp(from.ry, slot.ry, t) * DEG, lerp(from.rz, slot.rz, t) * DEG);
    const scale = lerp(from.s, slot.s, t);
    group.scale.set(scale, scale, scale);
  }

  function pose(p: PhonePose) {
    phone.position.set(0, 0, 0);
    phone.rotation.set(p.rx * DEG, p.ry * DEG, p.rz * DEG);
    phone.scale.set(p.scale, p.scale, p.scale);
    main.a = textures[p.from];
    main.b = textures[p.to];
    main.wipe = p.wipe;
    main.edge = [...p.edge];
    tint.value = linear(p.rim);

    const k = p.fan;
    const turned = ((p.ry % 360) + 360) % 360;
    const at: Slot = { x: 0, y: 0, z: 0, ry: turned > 180 ? turned - 360 : turned, rz: p.rz, s: p.scale };
    const lead = ease(Math.min(1, k / 0.7));
    if (k > 0) place(phone, LEAD_SLOT, lead, at);
    // The others set off from the centre, just behind the phone (at its
    // height and size so far), each straight out to its own place.
    others.forEach((group, index) => {
      const t = ease(Math.min(1, Math.max(0, (k - FAN_DELAY[index]) / 0.7)));
      group.visible = t > 0;
      if (!group.visible) return;
      place(group, SLOTS[index], t, {
        x: 0,
        y: lerp(0, LEAD_SLOT.y, lead),
        z: lerp(0, LEAD_SLOT.z, lead) - 0.25,
        ry: 0,
        rz: 0,
        s: lerp(p.scale, LEAD_SLOT.s, lead) * 0.98,
      });
    });
  }

  function render() {
    renderer.render({ scene, camera, sort: false, frustumCull: false });
  }

  return {
    draw(next) {
      if (disposed) return;
      last = next;
      pose(next);
      render();
    },
    layout(next, nextDpr) {
      if (disposed) return;
      view = next;
      if (nextDpr) dpr = nextDpr;
      applyView();
      if (last) {
        pose(last);
        render();
      }
    },
    setDpr(next) {
      if (disposed || next === dpr) return;
      dpr = next;
      applyView();
      if (last) render();
    },
    get dpr() {
      return dpr;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (!gl.isContextLost()) {
        geometries.forEach((geometry) => geometry.remove());
        programs.forEach((program) => program.remove());
        textures.forEach((texture) => gl.deleteTexture(texture.texture));
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
