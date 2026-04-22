import init, { InochiViewer } from './pkg/inochi_viewer.js';

// ── Estado global ──
let viewer = null;
let animFrameId = null;
const cam = { x: 0, y: 0, zoom: 1.0, rot: 0 };
const paramState = {};
const paramDefaults = {};

// ── Elementos DOM ──
const status    = document.getElementById('status');
const canvas    = document.getElementById('inochi-canvas');
const container = document.getElementById('canvas-container');
const ctrlX     = document.getElementById('ctrl-x');
const ctrlY     = document.getElementById('ctrl-y');
const ctrlZoom  = document.getElementById('ctrl-zoom');
const ctrlRot   = document.getElementById('ctrl-rot');
const valX      = document.getElementById('val-x');
const valY      = document.getElementById('val-y');
const valZoom   = document.getElementById('val-zoom');
const valRot    = document.getElementById('val-rot');
const hudX      = document.getElementById('hud-x');
const hudY      = document.getElementById('hud-y');
const hudZoom   = document.getElementById('hud-zoom');
const hudRot    = document.getElementById('hud-rot');

// ── Init WASM ──
await init();
status.textContent = 'Listo. Carga un modelo.';

// ── Resize canvas al contenedor ──
function resizeCanvas() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width  = w;
  canvas.height = h;
  if (viewer) viewer.resize(w, h);
}
new ResizeObserver(resizeCanvas).observe(container);
resizeCanvas();

// ── Render loop ──
function loop(ts) {
  if (viewer) {
    for (const [name, val] of Object.entries(paramState)) {
      viewer.set_param(name, val.x, val.y);
    }
    viewer.render(ts);
  }
  animFrameId = requestAnimationFrame(loop);
}

// ── Cargar modelo ──
document.getElementById('model-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;

  status.textContent = `Cargando ${file.name}...`;

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (animFrameId) cancelAnimationFrame(animFrameId);

    viewer = new InochiViewer('inochi-canvas', bytes);
    applyCam();
    buildParamControls();

    status.textContent = `✅ ${file.name}`;
    document.getElementById('file-label').innerHTML =
      `🎭 ${file.name}<br/><small style="color:#444">clic para cambiar</small>`;

    animFrameId = requestAnimationFrame(loop);
  } catch (err) {
    status.textContent = `❌ ${err}`;
    console.error(err);
  }
});

// ════════════════════════════════════════
// PARÁMETROS
// ════════════════════════════════════════

function buildParamControls() {
  const list = document.getElementById('params-list');
  list.innerHTML = '';

  let params;
  try {
    params = JSON.parse(viewer.get_params_json());
  } catch (e) {
    console.warn('No se pudieron leer parámetros:', e);
    return;
  }

  if (!params.length) return;

  console.log('Parámetros del modelo:', params.map(p => p.name));

  for (const param of params) {
    const { name, min_x, min_y, max_x, max_y, def_x, def_y, is_vec2 } = param;

    // Guardar defaults para reset
    paramDefaults[name] = { x: def_x, y: def_y };

    // Estado inicial = defaults
    paramState[name] = { x: def_x, y: def_y };

    const item = document.createElement('div');
    item.className = 'param-item';

    const header = document.createElement('div');
    header.className = 'param-header';
    header.textContent = name;
    header.title = name;
    item.appendChild(header);

    // Siempre slider X
    item.appendChild(makeParamSlider(name, 'x', min_x, max_x, def_x));

    // Slider Y solo si es vec2
    if (is_vec2) {
      item.appendChild(makeParamSlider(name, 'y', min_y, max_y, def_y));
    }

    list.appendChild(item);
  }

  document.getElementById('params-section').style.display = 'block';
}

function makeParamSlider(paramName, axis, minVal, maxVal, defaultVal) {
  const row = document.createElement('div');
  row.className = 'param-row';

  const id = `param-${paramName}-${axis}`.replace(/[^a-zA-Z0-9-_]/g, '_');
  const step = (maxVal - minVal) / 200;

  const label = document.createElement('label');
  label.htmlFor = id;
  label.innerHTML = `${axis.toUpperCase()} <span id="${id}-val">${defaultVal.toFixed(2)}</span>`;

  const slider = document.createElement('input');
  slider.type         = 'range';
  slider.id           = id;
  slider.min          = minVal;
  slider.max          = maxVal;
  slider.step         = step;
  slider.value        = defaultVal;
  slider.defaultValue = defaultVal; // para reset

  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    paramState[paramName][axis] = v;
    document.getElementById(`${id}-val`).textContent = v.toFixed(2);
  });

  row.appendChild(label);
  row.appendChild(slider);
  return row;
}

function resetParams() {
  for (const [name, def] of Object.entries(paramDefaults)) {
    paramState[name].x = def.x;
    paramState[name].y = def.y;

    // Actualizar sliders X e Y en el DOM
    for (const axis of ['x', 'y']) {
      const id = `param-${name}-${axis}`.replace(/[^a-zA-Z0-9-_]/g, '_');
      const slider = document.getElementById(id);
      const valEl  = document.getElementById(`${id}-val`);
      if (slider) {
        slider.value = slider.defaultValue;
        if (valEl) valEl.textContent = parseFloat(slider.defaultValue).toFixed(2);
      }
    }
  }
}

document.getElementById('btn-reset-params').addEventListener('click', resetParams);

// ════════════════════════════════════════
// CÁMARA
// ════════════════════════════════════════

function applyCam() {
  if (!viewer) return;
  viewer.set_camera(cam.x, cam.y, cam.zoom, cam.rot * Math.PI / 180);

  // Sidebar labels
  valX.textContent    = Math.round(cam.x);
  valY.textContent    = Math.round(cam.y);
  valZoom.textContent = cam.zoom.toFixed(2);
  valRot.textContent  = Math.round(cam.rot);

  // HUD
  hudX.textContent    = Math.round(cam.x);
  hudY.textContent    = Math.round(cam.y);
  hudZoom.textContent = cam.zoom.toFixed(2);
  hudRot.textContent  = Math.round(cam.rot);

  // Sliders (sin disparar 'input')
  ctrlX.value    = Math.max(-2000, Math.min(2000, cam.x));
  ctrlY.value    = Math.max(-2000, Math.min(2000, cam.y));
  ctrlZoom.value = cam.zoom;
  ctrlRot.value  = cam.rot;
}

ctrlX.addEventListener('input',    e => { cam.x    = +e.target.value; applyCam(); });
ctrlY.addEventListener('input',    e => { cam.y    = +e.target.value; applyCam(); });
ctrlZoom.addEventListener('input', e => { cam.zoom = +e.target.value; applyCam(); });
ctrlRot.addEventListener('input',  e => { cam.rot  = +e.target.value; applyCam(); });

document.getElementById('btn-reset-cam').addEventListener('click', () => {
  cam.x = 0; cam.y = 0; cam.zoom = 1; cam.rot = 0;
  applyCam();
});

// ════════════════════════════════════════
// DRAG (mouse)
// ════════════════════════════════════════

let drag = null;

container.addEventListener('mousedown', e => {
  drag = { startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y };
  container.classList.add('grabbing');
});

window.addEventListener('mousemove', e => {
  if (!drag) return;
  cam.x = drag.camX + (e.clientX - drag.startX) / cam.zoom;
  cam.y = drag.camY + (e.clientY - drag.startY) / cam.zoom;
  applyCam();
});

window.addEventListener('mouseup', () => {
  drag = null;
  container.classList.remove('grabbing');
});

// ════════════════════════════════════════
// SCROLL ZOOM
// ════════════════════════════════════════

container.addEventListener('wheel', e => {
  e.preventDefault();
  cam.zoom = Math.max(0.05, Math.min(8, cam.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
  applyCam();
}, { passive: false });

// ════════════════════════════════════════
// TOUCH (pinch + drag)
// ════════════════════════════════════════

let touches = {};
let lastPinchDist = null;

container.addEventListener('touchstart', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    touches[t.identifier] = { x: t.clientX, y: t.clientY };
  }
  if (Object.keys(touches).length === 1) {
    const [t] = Object.values(touches);
    drag = { startX: t.x, startY: t.y, camX: cam.x, camY: cam.y };
  }
}, { passive: false });

container.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    touches[t.identifier] = { x: t.clientX, y: t.clientY };
  }

  const pts = Object.values(touches);

  if (pts.length === 2) {
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    if (lastPinchDist !== null) {
      cam.zoom = Math.max(0.05, Math.min(8, cam.zoom * (dist / lastPinchDist)));
    }
    lastPinchDist = dist;
    drag = null;
    applyCam();
  } else if (pts.length === 1 && drag) {
    cam.x = drag.camX - (pts[0].x - drag.startX) / cam.zoom;
    cam.y = drag.camY - (pts[0].y - drag.startY) / cam.zoom;
    applyCam();
  }
}, { passive: false });

container.addEventListener('touchend', e => {
  for (const t of e.changedTouches) delete touches[t.identifier];
  lastPinchDist = null;
  if (Object.keys(touches).length === 0) drag = null;
});