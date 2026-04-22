use console_error_panic_hook::set_once as set_panic_hook;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, WebGl2RenderingContext};

use inox2d::formats::inp::parse_inp;
use inox2d::model::Model;
use inox2d::render::InoxRendererExt;
use inox2d_opengl::OpenglRenderer;

macro_rules! console_log {
    ($($t:tt)*) => (web_sys::console::log_1(&format!($($t)*).into()))
}

#[wasm_bindgen]
pub struct InochiViewer {
    renderer: OpenglRenderer,
    model: Model,
    canvas: HtmlCanvasElement,
    last_timestamp: f64,
    pending_params: Vec<(String, f32, f32)>,
}

#[wasm_bindgen]
impl InochiViewer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str, model_data: &[u8]) -> Result<InochiViewer, JsValue> {
        set_panic_hook();

        console_log::init_with_level(log::Level::Debug).expect("Error al inicializar el logger");

        let document = web_sys::window()
            .ok_or("No hay window")?
            .document()
            .ok_or("No hay document")?;

        let canvas = document
            .get_element_by_id(canvas_id)
            .ok_or("No se encontró el canvas")?
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| "El elemento no es un canvas")?;

        let webgl2 = canvas
            .get_context("webgl2")
            .map_err(|_| "Error al obtener contexto WebGL2")?
            .ok_or("WebGL2 no disponible")?
            .dyn_into::<WebGl2RenderingContext>()
            .map_err(|_| "No se pudo castear a WebGl2RenderingContext")?;

        let gl = glow::Context::from_webgl2_context(webgl2);
        console_log!("✅ Contexto WebGL2 + glow creado");

        let mut model =
            parse_inp(model_data).map_err(|e| format!("Error al parsear el modelo: {e}"))?;
        console_log!("✅ Modelo cargado");

        model.puppet.init_transforms();
        model.puppet.init_rendering();
        model.puppet.init_params();

        // ── Debug: info de parámetros ──
        for (_, param) in model.puppet.iter_params() {
            console_log!(
                "Param: '{}' | is_vec2: {} | min: ({},{}) | max: ({},{}) | default: ({},{}) | axis_x: {:?} | axis_y: {:?}",
                param.name,
                param.is_vec2,
                param.min.x, param.min.y,
                param.max.x, param.max.y,
                param.defaults.x, param.defaults.y,
                param.axis_points.x,
                param.axis_points.y
            );
            for (i, binding) in param.bindings.iter().enumerate() {
                let values_str = match &binding.values {
                    inox2d::params::BindingValues::TransformSX(matrix) => {
                        let vals: Vec<f32> = (0..matrix.width())
                            .flat_map(|x| (0..matrix.height()).map(move |y| (x, y)))
                            .filter_map(|(x, y)| matrix.get(x, y).copied())
                            .collect();
                        format!("TransformSX {:?}", vals)
                    }
                    inox2d::params::BindingValues::TransformSY(matrix) => {
                        let vals: Vec<f32> = (0..matrix.width())
                            .flat_map(|x| (0..matrix.height()).map(move |y| (x, y)))
                            .filter_map(|(x, y)| matrix.get(x, y).copied())
                            .collect();
                        format!("TransformSY {:?}", vals)
                    }
                    inox2d::params::BindingValues::ZSort(_)       => "ZSort".to_string(),
                    inox2d::params::BindingValues::TransformTX(_) => "TransformTX".to_string(),
                    inox2d::params::BindingValues::TransformTY(_) => "TransformTY".to_string(),
                    inox2d::params::BindingValues::TransformRX(_) => "TransformRX".to_string(),
                    inox2d::params::BindingValues::TransformRY(_) => "TransformRY".to_string(),
                    inox2d::params::BindingValues::TransformRZ(_) => "TransformRZ".to_string(),
                    inox2d::params::BindingValues::Deform(_)      => "Deform".to_string(),
                    inox2d::params::BindingValues::Opacity        => "Opacity".to_string(),
                };
                console_log!("  Binding {}: {}", i, values_str);
            }
        }
        // ── Fin debug ──

        console_log!("✅ Puppet inicializado");

        let mut renderer =
            OpenglRenderer::new(gl, &model).map_err(|e| format!("Error al crear renderer: {e}"))?;

        renderer.resize(canvas.width(), canvas.height());
        console_log!("✅ Renderer listo");

        Ok(InochiViewer {
            renderer,
            model,
            canvas,
            last_timestamp: 0.0,
            pending_params: Vec::new(),
        })
    }

    pub fn get_params_json(&self) -> String {
        let entries: Vec<String> = self.model.puppet
            .iter_params()
            .map(|(_, param)| {
                format!(
                    r#"{{"name":{name:?},"min_x":{min_x},"min_y":{min_y},"max_x":{max_x},"max_y":{max_y},"def_x":{def_x},"def_y":{def_y},"is_vec2":{is_vec2}}}"#,
                    name    = param.name,
                    min_x   = param.min.x,
                    min_y   = param.min.y,
                    max_x   = param.max.x,
                    max_y   = param.max.y,
                    def_x   = param.defaults.x,
                    def_y   = param.defaults.y,
                    is_vec2 = param.is_vec2,
                )
            })
            .collect();

        format!("[{}]", entries.join(","))
    }

    pub fn set_param(&mut self, name: &str, x: f32, y: f32) {
        if let Some(entry) = self.pending_params.iter_mut().find(|e| e.0 == name) {
            entry.1 = x;
            entry.2 = y;
        } else {
            self.pending_params.push((name.to_string(), x, y));
        }
    }

    pub fn render(&mut self, timestamp: f64) {
        let dt = if self.last_timestamp == 0.0 {
            0.0
        } else {
            ((timestamp - self.last_timestamp) / 1000.0) as f32
        };
        self.last_timestamp = timestamp;

        let w = self.canvas.width();
        let h = self.canvas.height();
        self.renderer.resize(w, h);
        self.renderer.clear();

        self.model.puppet.begin_frame();

        if let Some(param_ctx) = self.model.puppet.param_ctx.as_mut() {
            for (name, x, y) in &self.pending_params {
                let _ = param_ctx.set(name, glam::Vec2::new(*x, *y));
            }
        }

        self.model.puppet.end_frame(dt);

        self.renderer.on_begin_draw(&self.model.puppet);
        self.renderer.draw(&self.model.puppet);
        self.renderer.on_end_draw(&self.model.puppet);
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.canvas.set_width(width);
        self.canvas.set_height(height);
        self.renderer.resize(width, height);
    }

    pub fn set_camera(&mut self, x: f32, y: f32, zoom: f32, rotation: f32) {
        self.renderer.camera.position = glam::Vec2::new(x, y);
        self.renderer.camera.scale = glam::Vec2::splat(zoom);
        self.renderer.camera.rotation = rotation;
    }

    pub fn set_position(&mut self, x: f32, y: f32) {
        self.renderer.camera.position = glam::Vec2::new(x, y);
    }

    pub fn set_zoom(&mut self, zoom: f32) {
        self.renderer.camera.scale = glam::Vec2::splat(zoom);
    }

    pub fn set_rotation(&mut self, radians: f32) {
        self.renderer.camera.rotation = radians;
    }

    pub fn get_camera_x(&self) -> f32 {
        self.renderer.camera.position.x
    }
    pub fn get_camera_y(&self) -> f32 {
        self.renderer.camera.position.y
    }
    pub fn get_zoom(&self) -> f32 {
        self.renderer.camera.scale.x
    }
}
