import init, { InochiViewer } from "./pkg/inochi_viewer.js";

let viewer = null;
let animFrameId = null;

const cam = { x: 0, y: 0, zoom: 1.0, rot: 0 };
const paramState = {};
const paramDefaults = {};

const status = document.getElementById("status");
const canvas = document.getElementById("inochi-canvas");
const container = document.getElementById("canvas-container");
const fileLabel = document.getElementById("file-label");
const modelFile = document.getElementById("model-file");

const ctrlX = document.getElementById("ctrl-x");
const ctrlY = document.getElementById("ctrl-y");
const ctrlZoom = document.getElementById("ctrl-zoom");
const ctrlRot = document.getElementById("ctrl-rot");

const valX = document.getElementById("val-x");
const valY = document.getElementById("val-y");
const valZoom = document.getElementById("val-zoom");
const valRot = document.getElementById("val-rot");

const hudX = document.getElementById("hud-x");
const hudY = document.getElementById("hud-y");
const hudZoom = document.getElementById("hud-zoom");
const hudRot = document.getElementById("hud-rot");

const paramsSection = document.getElementById("params-section");
const paramsList = document.getElementById("params-list");
const btnResetCam = document.getElementById("btn-reset-cam");
const btnResetParams = document.getElementById("btn-reset-params");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resizeCanvas() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width = w;
  canvas.height = h;

  if (viewer) {
    viewer.resize(w, h);
  }
}

function clearParamState() {
  for (const key of Object.keys(paramState)) {
    delete paramState[key];
  }

  for (const key of Object.keys(paramDefaults)) {
    delete paramDefaults[key];
  }

  paramsList.innerHTML = "";
  paramsSection.style.display = "none";
}

function stopRenderLoop() {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

function renderLoop(ts) {
  if (viewer) {
    for (const [name, value] of Object.entries(paramState)) {
      viewer.set_param(name, value.x, value.y);
    }

    viewer.render(ts);
  }

  animFrameId = requestAnimationFrame(renderLoop);
}

function makeParamSlider(paramName, axis, minVal, maxVal, defaultVal) {
  const row = document.createElement("div");
  row.className = "param-row";

  const id = `param-${paramName}-${axis}`.replace(/[^a-zA-Z0-9-_]/g, "_");
  const spanId = `${id}-val`;
  const step = Math.max((maxVal - minVal) / 200, 0.001);

  const label = document.createElement("label");
  label.htmlFor = id;
  label.innerHTML = `${axis.toUpperCase()} <span id="${spanId}">${defaultVal.toFixed(2)}</span>`;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = id;
  slider.min = String(minVal);
  slider.max = String(maxVal);
  slider.step = String(step);
  slider.value = String(defaultVal);
  slider.defaultValue = String(defaultVal);

  slider.addEventListener("input", () => {
    const numericValue = Number.parseFloat(slider.value);
    paramState[paramName][axis] = numericValue;

    const valueElement = document.getElementById(spanId);
    if (valueElement) {
      valueElement.textContent = numericValue.toFixed(2);
    }
  });

  row.appendChild(label);
  row.appendChild(slider);
  return row;
}

function buildParamControls() {
  paramsList.innerHTML = "";

  let params = [];
  try {
    params = JSON.parse(viewer.get_params_json());
  } catch (error) {
    console.warn("No se pudieron leer parametros:", error);
    return;
  }

  if (!Array.isArray(params) || params.length === 0) {
    paramsSection.style.display = "none";
    return;
  }

  for (const param of params) {
    const {
      name,
      min_x: minX,
      min_y: minY,
      max_x: maxX,
      max_y: maxY,
      def_x: defaultX,
      def_y: defaultY,
      is_vec2: isVec2,
    } = param;

    paramDefaults[name] = { x: defaultX, y: defaultY };
    paramState[name] = { x: defaultX, y: defaultY };

    const item = document.createElement("div");
    item.className = "param-item";

    const header = document.createElement("div");
    header.className = "param-header";
    header.textContent = name;
    header.title = name;

    item.appendChild(header);
    item.appendChild(makeParamSlider(name, "x", minX, maxX, defaultX));

    if (isVec2) {
      item.appendChild(makeParamSlider(name, "y", minY, maxY, defaultY));
    }

    paramsList.appendChild(item);
  }

  paramsSection.style.display = "block";
}

function resetParams() {
  for (const [name, defaults] of Object.entries(paramDefaults)) {
    if (!paramState[name]) {
      continue;
    }

    paramState[name].x = defaults.x;
    paramState[name].y = defaults.y;

    for (const axis of ["x", "y"]) {
      const id = `param-${name}-${axis}`.replace(/[^a-zA-Z0-9-_]/g, "_");
      const slider = document.getElementById(id);
      const valueElement = document.getElementById(`${id}-val`);

      if (!slider) {
        continue;
      }

      slider.value = slider.defaultValue;
      if (valueElement) {
        valueElement.textContent = Number.parseFloat(slider.defaultValue).toFixed(2);
      }
    }
  }
}

function applyCam() {
  if (!viewer) {
    return;
  }

  viewer.set_camera(cam.x, cam.y, cam.zoom, (cam.rot * Math.PI) / 180);

  valX.textContent = String(Math.round(cam.x));
  valY.textContent = String(Math.round(cam.y));
  valZoom.textContent = cam.zoom.toFixed(2);
  valRot.textContent = String(Math.round(cam.rot));

  hudX.textContent = String(Math.round(cam.x));
  hudY.textContent = String(Math.round(cam.y));
  hudZoom.textContent = cam.zoom.toFixed(2);
  hudRot.textContent = String(Math.round(cam.rot));

  ctrlX.value = String(clamp(cam.x, -2000, 2000));
  ctrlY.value = String(clamp(cam.y, -2000, 2000));
  ctrlZoom.value = String(cam.zoom);
  ctrlRot.value = String(cam.rot);
}

function resetCam() {
  cam.x = 0;
  cam.y = 0;
  cam.zoom = 1;
  cam.rot = 0;
  applyCam();
}

async function loadModelFromFile(file) {
  if (!file) {
    return;
  }

  status.textContent = `Cargando ${file.name}...`;

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());

    stopRenderLoop();
    clearParamState();

    viewer = new InochiViewer("inochi-canvas", bytes);
    applyCam();
    buildParamControls();

    fileLabel.innerHTML = `${file.name}<br /><small>clic para cambiar</small>`;
    status.textContent = `OK ${file.name}`;

    animFrameId = requestAnimationFrame(renderLoop);
  } catch (error) {
    status.textContent = `Error: ${error}`;
    console.error(error);
  }
}

function setupCameraControls() {
  ctrlX.addEventListener("input", (event) => {
    cam.x = Number(event.target.value);
    applyCam();
  });

  ctrlY.addEventListener("input", (event) => {
    cam.y = Number(event.target.value);
    applyCam();
  });

  ctrlZoom.addEventListener("input", (event) => {
    cam.zoom = Number(event.target.value);
    applyCam();
  });

  ctrlRot.addEventListener("input", (event) => {
    cam.rot = Number(event.target.value);
    applyCam();
  });

  btnResetCam.addEventListener("click", resetCam);
  btnResetParams.addEventListener("click", resetParams);
}

function setupMouseDrag() {
  let drag = null;

  container.addEventListener("mousedown", (event) => {
    drag = {
      startX: event.clientX,
      startY: event.clientY,
      camX: cam.x,
      camY: cam.y,
    };

    container.classList.add("grabbing");
  });

  window.addEventListener("mousemove", (event) => {
    if (!drag) {
      return;
    }

    cam.x = drag.camX + (event.clientX - drag.startX) / cam.zoom;
    cam.y = drag.camY + (event.clientY - drag.startY) / cam.zoom;
    applyCam();
  });

  window.addEventListener("mouseup", () => {
    drag = null;
    container.classList.remove("grabbing");
  });
}

function setupWheelZoom() {
  container.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      cam.zoom = clamp(cam.zoom * (event.deltaY > 0 ? 0.92 : 1.08), 0.05, 8);
      applyCam();
    },
    { passive: false },
  );
}

function setupTouchControls() {
  const touches = {};
  let drag = null;
  let lastPinchDistance = null;

  container.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();

      for (const touch of event.changedTouches) {
        touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
      }

      if (Object.keys(touches).length === 1) {
        const firstTouch = Object.values(touches)[0];
        drag = {
          startX: firstTouch.x,
          startY: firstTouch.y,
          camX: cam.x,
          camY: cam.y,
        };
      }
    },
    { passive: false },
  );

  container.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();

      for (const touch of event.changedTouches) {
        touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
      }

      const points = Object.values(touches);

      if (points.length === 2) {
        const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

        if (lastPinchDistance !== null) {
          cam.zoom = clamp(cam.zoom * (dist / lastPinchDistance), 0.05, 8);
        }

        lastPinchDistance = dist;
        drag = null;
        applyCam();
      } else if (points.length === 1 && drag) {
        cam.x = drag.camX - (points[0].x - drag.startX) / cam.zoom;
        cam.y = drag.camY - (points[0].y - drag.startY) / cam.zoom;
        applyCam();
      }
    },
    { passive: false },
  );

  container.addEventListener("touchend", (event) => {
    for (const touch of event.changedTouches) {
      delete touches[touch.identifier];
    }

    lastPinchDistance = null;

    if (Object.keys(touches).length === 0) {
      drag = null;
    }
  });
}

async function bootstrap() {
  try {
    await init();
    status.textContent = "Listo. Carga un modelo .inp o .inx.";
  } catch (error) {
    status.textContent = `Error al inicializar WASM: ${error}`;
    throw error;
  }

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(container);
  resizeCanvas();

  setupCameraControls();
  setupMouseDrag();
  setupWheelZoom();
  setupTouchControls();

  modelFile.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    await loadModelFromFile(file);
  });
}

bootstrap().catch((error) => {
  console.error(error);
});
