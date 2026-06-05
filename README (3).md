# Portafolio — Arodi Vásquez

**[Ver portafolio en vivo →](https://arodi.dev)** *(reemplazar con URL de deploy)*

---

## Reflexión del proyecto

### ¿A qué tipo de audiencia o trabajo está dirigido este portafolio?

Este portafolio está dirigido a **startups medianas y agencias de desarrollo** que buscan un desarrollador fullstack junior capaz de trabajar en múltiples partes del stack. No apunto a empresas grandes con roles altamente especializados donde un desarrollador junior haría solo una cosa durante meses. Me interesa un equipo donde una persona pueda tocar el frontend, el backend, y la base de datos dentro del mismo sprint.

El criterio de selección fue: ¿este portafolio convence a un CTO de una startup de 15-40 personas de que puedo ser útil desde el primer mes? Eso significa demostrar amplitud técnica real, no solo listar frameworks.

---

### ¿Qué tecnologías elegí usar y por qué?

**Next.js como base:** Elegí Next.js porque combina React para la UI con capacidades de backend mediante API Routes en el mismo proyecto. Eso es exactamente la propuesta de valor que quiero demostrar: que entiendo cómo funcionan las dos capas, no solo una. Un portafolio estático con React puro habría sido una mentira sobre mis capacidades.

**CSS vanilla para estilos:** Podría haber usado Tailwind y terminado el diseño en la mitad del tiempo. Decidí no hacerlo porque quiero que quede claro que entiendo el lenguaje base. Un desarrollador que solo conoce Tailwind tiene un conocimiento frágil — en cuanto el framework no alcanza, no sabe qué hacer. CSS vanilla con variables custom también fue más eficiente para la estética espacial específica que quería.

**JavaScript vanilla para animaciones:** Las partículas, el cursor custom y las estrellas fugaces están escritas con Canvas API y JS puro, sin Three.js ni librerías de animación. Esto demuestra que entiendo cómo funciona el rendering en el browser y no solo cómo usar abstracciones encima.

**Proyectos en Python, Java y C++:** Incluí proyectos en cuatro lenguajes deliberadamente. No para impresionar con la cantidad, sino porque cada uno demuestra una capacidad diferente: TypeScript/Node.js para fullstack web, Python para scripting y datos, Java para OOP estructurada, C++ para algoritmia y performance. Para el tipo de empresa al que apunto, esa versatilidad es un activo real.

---

### ¿Qué tecnología del curso decidí no usar, y por qué?

**No usé Tailwind CSS.** Era la opción obvia y habría acelerado el desarrollo considerablemente. La decisión fue deliberada: el objetivo era demostrar comprensión profunda de CSS, no velocidad de prototipado. Cualquier desarrollador puede seguir la documentación de Tailwind. Lo que diferencia es saber por qué `transform: translateZ(0)` crea un stacking context, o por qué las animaciones CSS son más performantes que las de JS cuando operan en propiedades que no disparan layout.

Además, la estética espacial específica — nebulosas, partículas, gradientes radiales complejos — habría sido más difícil de lograr dentro del sistema de utilidades de Tailwind. CSS vanilla me dio control total.

---

### ¿Dónde me arriesgué y dónde la jugué seguro?

**Me arriesgué en:**

- **La estética espacial.** Es una apuesta. Un portafolio oscuro con partículas y temática de planetas puede parecer un proyecto de práctica antes que un portafolio profesional serio. La decisión fue que la coherencia y la ejecución técnica contrarrestan ese riesgo — si algo funciona bien y está bien construido, comunica competencia independientemente del tema.
- **Cursor personalizado y Canvas animations.** Añaden complejidad sin añadir funcionalidad. El riesgo es que se rompan en algún browser o en mobile. Mitigué desactivándolos completamente en mobile.
- **El API Demo simulado.** La validación server-side está simulada en el frontend para el portafolio estático. Un reviewer técnico puede notar eso. La apuesta es que el código mismo — la lógica de validación, el manejo de errores, la respuesta estructurada — demuestra el conocimiento aunque el transporte sea local.

**La jugué seguro en:**

- **Estructura de secciones.** Hero, About, Projects, Contact es el layout estándar de portafolio. No reinventé eso porque la navegabilidad importa más que la originalidad estructural.
- **Cuatro proyectos bien documentados.** Podría haber puesto ocho proyectos. Decidí que cuatro con arquitectura explicada, stack visible y highlights concretos comunican más que ocho con solo un link a GitHub.
- **Responsive design.** Invertí tiempo en que funcione bien en mobile aunque la experiencia ideal sea desktop. No es glamoroso pero es parte de "calidad de ejecución".

---

### Si tuviera otra semana, ¿qué mejoraría?

1. **Deploy de la API real.** Mover el portafolio a Next.js en Vercel y hacer que el formulario de contacto llame a una API Route real que envíe a un servicio como Resend o Nodemailer. Actualmente la validación es client-side disfrazada — funciona como demo pero no es el backend real que describo.

2. **Case studies más profundos.** Cada proyecto tiene bullets concisos, pero me gustaría tener páginas individuales con: el problema que resolvía, decisiones de arquitectura, qué salió mal y cómo lo arreglé, y qué haría diferente. Ese tipo de narrativa es lo que distingue a alguien que terminó un proyecto de alguien que aprendió de él.

3. **Dark nebula parallax.** El fondo nebuloso es un CSS gradient estático. Con otra semana implementaría un parallax real donde las capas de nebulosa se mueven a velocidades diferentes con el scroll, sin librerías externas.

4. **Blog técnico mínimo.** Uno o dos posts cortos sobre decisiones técnicas específicas demostrarían capacidad de comunicación escrita — algo que las startups valoran tanto como el código.

---

## Stack del portafolio

- **HTML5 + CSS vanilla** — sin frameworks de UI
- **JavaScript vanilla** — Canvas API, IntersectionObserver, custom cursor
- **Fonts:** Syne (display) + DM Mono (monospace) via Google Fonts
- **Deploy:** GitHub Pages / Vercel

## Estructura del repo

```
/
├── index.html          # Portafolio completo (single-file para GitHub Pages)
├── README.md           # Este archivo
└── /projects           # (próximamente) Case studies individuales
```
