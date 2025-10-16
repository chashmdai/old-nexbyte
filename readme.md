# Nexbyte v3 — Front‑End UI (Tienda + Admin)

[![SemVer](https://img.shields.io/badge/version-v3.1.0-blue.svg)]() [![Status](https://img.shields.io/badge/status-active-success.svg)]() [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Interfaz web **estática** en **HTML/CSS/JavaScript** para el proyecto **Nexbyte**. Incluye dos áreas principales: **Tienda** (público) y **Admin** (back‑office). Esta versión incorpora **modo oscuro**, **animaciones suaves**, pulido visual, y nuevas páginas de contenido.

> **Nota**: Este repo es *front‑end puro* (sin backend). Algunas vistas simulan flujos y estados. Datos de ejemplo en `assets/data/home.json` y almacenamiento en `localStorage` para carrito.

---

## Índice
- [Características clave](#características-clave)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Guía rápida de uso](#guía-rápida-de-uso)
- [Validaciones y reglas de negocio (JS)](#validaciones-y-reglas-de-negocio-js)
- [Accesibilidad y semántica](#accesibilidad-y-semántica)
- [Estilos y tema oscuro](#estilos-y-tema-oscuro)
- [Administración (back‑office)](#administración-back-office)
- [Roles del sistema](#roles-del-sistema)
- [Checklist de la entrega (rúbrica)](#checklist-de-la-entrega-rúbrica)
- [Workflow de Git y versionado](#workflow-de-git-y-versionado)
- [Guión de demo sugerido](#guión-de-demo-sugerido)
- [Créditos](#créditos)
- [Changelog](#changelog)

---

## Características clave
- **Tienda pública** con páginas: Home, Productos, Detalle de producto, Carrito, Blog(s) y Detalles, Nosotros, Contacto, Registro e Inicio de sesión.
- **Carrito** con persistencia en `localStorage` (añadir/remover productos, recálculo, guardado entre sesiones).
- **Validaciones en JS**: formularios con mensajes y sugerencias, siguiendo restricciones solicitadas por la pauta.
- **Admin** con menú lateral y vistas de gestión (Usuario/Producto: listado, crear, editar, ver detalle).
- **Tema oscuro** consistente en todo el sitio, transiciones y micro‑interacciones.
- **Arquitectura simple** de JS para layout y utilidades (`assets/js/layout.js`, `assets/js/layout-admin.js`, `assets/js/ui.js`).

## Estructura del proyecto
```
Nexbyte v3/
├─ admin/
│  ├─ index.html
│  ├─ contactos.html
│  ├─ inventario.html
│  ├─ producto-{nuevo,editar,mostrar}.html
│  ├─ productos-listado.html
│  ├─ usuario-{nuevo,editar,mostrar}.html
│  ├─ usuarios-listado.html
│  └─ reportes.html
├─ tienda/
│  ├─ index.html
│  ├─ productos.html
│  ├─ detalle-producto.html
│  ├─ carrito.html
│  ├─ blogs.html
│  ├─ blog-{1,2,3,4}.html
│  ├─ contacto.html
│  ├─ nosotros.html
│  ├─ registro.html
│  ├─ login.html
│  ├─ ayuda.html
│  ├─ garantias.html
│  └─ soporte.html
├─ assets/
│  ├─ css/
│  │  ├─ admin.css
│  │  └─ tienda.css
│  ├─ data/
│  │  └─ home.json
│  ├─ img/ (imágenes del tema)
│  └─ js/
│     ├─ layout.js
│     ├─ layout-admin.js
│     └─ ui.js
└─ README.md (este archivo)
```

## Guía rápida de uso
1. **Abrir localmente**: basta con abrir `tienda/index.html` o usar *Live Server* de VS Code.
2. **Navegación**: seguir el menú principal; las rutas son relativas y no requieren servidor.
3. **Datos de ejemplo**: la home carga datos desde `assets/data/home.json` y el carrito usa `localStorage`.
4. **Admin**: abrir `admin/index.html` para ver el menú y navegar por las vistas de gestión.

> Recomendado: si necesitas un server mínimo, puedes usar `python -m http.server 5173` (opcional).

## Validaciones y reglas de negocio (JS)
Se implementan validaciones y ayudas en las vistas marcadas con formularios. Reglas principales:

**Login (tienda/login.html)**
- Correo: requerido, máx. 100; dominios permitidos: `@duoc.cl`, `@profesor.duoc.cl`, `@gmail.com`.
- Contraseña: requerida, largo entre 4 y 10.

**Contacto (tienda/contacto.html)**
- Nombre: requerido, máx. 100.
- Correo: máx. 100; dominios permitidos como arriba.
- Comentario: requerido, máx. 500.

**Carrito (tienda/productos.html y tienda/detalle-producto.html)**
- Listado se genera desde un arreglo JS.
- Añadir al carrito + reglas básicas (cantidad mínima 1, sin negativos, total dinámico).
- Persistencia en `localStorage`.

**Admin – Productos (nuevo/editar)**
- Código: requerido; texto; min 3.
- Nombre: requerido; máx. 100.
- Descripción: opcional; máx. 500.
- Precio: requerido; min 0; admite decimales.
- Stock: requerido; entero ≥ 0.
- Stock crítico: opcional; entero ≥ 0 (alerta visual).
- Categoría: requerido (select).
- Imagen: opcional.

**Admin – Usuarios (nuevo/editar)**
- RUN: requerido; validar dígito verificador; sin puntos ni guion (ej: `19011022K`); largo 7–9.
- Nombres/Apellidos: requeridos; nombres máx. 50, apellidos máx. 100.
- Correo: requerido; máx. 100; dominios permitidos.
- Fecha de nacimiento: opcional.
- Tipo de usuario: select con `Administrador`, `Cliente`, `Vendedor`.
- Región/Comuna: selects dependientes desde arreglo JS complementario.
- Dirección: requerida; máx. 300.

> Los mensajes de error y sugerencias se muestran en contexto del campo para mejorar la usabilidad.

## Accesibilidad y semántica
- Estructura HTML5: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Etiquetas asociadas a inputs (`label for`), `aria-*` donde corresponde, focos visibles.
- Contraste adecuado en tema oscuro y navegación mediante teclado.

## Estilos y tema oscuro
- Hoja de estilos **externa** por ámbito (`assets/css/tienda.css` y `assets/css/admin.css`).
- Tokens de color, espaciado y tipografía para consistencia.
- Transiciones en hover/focus y micro‑interacciones para feedback.
- Diseño responsive básico (layouts fluidos y breakpoints esenciales).

## Administración (back‑office)
- **Home Admin** con menú lateral persistente.
- Mantenedores de **Usuarios** y **Productos**: listado, crear, editar y ver detalle.
- Plantillas con validaciones, ayudas y estados vacíos; preparación para futuro backend.

## Roles del sistema
- **Administrador**: acceso total.
- **Vendedor**: puede visualizar listas y detalles (productos, órdenes); sin acceso a configuración.
- **Cliente**: acceso solo a la tienda.

## Checklist de la entrega (rúbrica)
- [x] Estructura HTML semántica, navegación, imágenes, botones, formularios y footer.
- [x] CSS personalizado **externo** aplicado en todas las páginas.
- [x] Validaciones JS con mensajes y sugerencias contextualizadas.
- [x] Carrito con `localStorage` y reglas básicas.
- [x] 6+ plantillas cubriendo roles **cliente** y **administrador** (tienda + admin).
- [x] Commits claros y ordenados; tag de release `v3.1.0`.
- [x] Documento **ERS** (versión inicial) preparado en carpeta de documentación (externo al repo o linkeado).

## Workflow de Git y versionado
- Convención de mensajes: `feat`, `refactor`, `style`, `fix`, `chore`.
- Ramas sugeridas: `main` (estable), `dev` (integración) y features por módulo.
- Lanzamientos con **SemVer**. Última release: **`v3.1.0`** (tema oscuro + animaciones + contenido nuevo).

## Guión de demo sugerido
1. Presentación rápida (2 min): objetivo y estructura del repo.
2. Recorrido Tienda (6 min): Home → Productos → Detalle → **Carrito (localStorage)** → Blogs/Contacto → **Validaciones**.
3. Recorrido Admin (5 min): Home → Usuarios/Productos (listado/crear/editar/detalle) → **Validaciones**.
4. Cierre (2 min): Git (commits, tag `v3.1.0`), ERS y próximos pasos (backend / persistencia real).

## Créditos
- **Cliente/Desarrollador**: Nexbyte — Proyecto académico DSY1104.
- **Tecnologías**: HTML5, CSS3, JavaScript (ES6+).

## Changelog
### v3.1.0
- Tema oscuro unificado, transiciones y micro‑interacciones.
- Limpieza semántica en HTML Tienda/Admin.
- Optimizaciones en `layout.js` y `layout-admin.js`.
- Nuevas páginas públicas: Ayuda, Garantías, Soporte, Blogs 3–4.
- Nuevos assets: `ui.js`, `data/home.json`, imágenes del tema.
- Bug extraño: Si se elimina `docs/perrito.jpg` el proyecto no funciona
