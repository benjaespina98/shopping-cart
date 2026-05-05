# 🎨 Design System - Playa y Sol E-Commerce

## 1. PALETA DE COLORES

### Primarios (Brand Identity)
```
🔵 AZUL PROFUNDO (Confianza, profesionalismo, agua/piscina)
  - Primary: #1F2937 (Gris-azul profundo) - Headers, CTAs principales
  - Primary-600: #0369A1 (Azul cielo) - Links, acciones, hover
  - Primary-50: #F0F9FF (Azul muy claro) - Backgrounds, subtle accents

🟠 NARANJA/DORADO (Energía, acción, urgencia)
  - Accent: #F59E0B (Amber 500) - Botones secundarios, destacados
  - Accent-600: #D97706 (Amber 600) - Hover, active states
  - Accent-50: #FFFBEB (Amber muy claro) - Backgrounds suaves

🟢 VERDE (Confirmación, WhatsApp)
  - Success: #10B981 (Esmeralda) - WhatsApp button, confirmaciones
  - Success-600: #059669 - Hover
  - Success-50: #ECFDF5 - Backgrounds
```

### Neutros (Accesibilidad)
```
Grises profesionales:
  - Neutral-900: #111827 - Texto principal
  - Neutral-700: #374151 - Texto secundario
  - Neutral-500: #6B7280 - Text light / placeholders
  - Neutral-300: #D1D5DB - Borders
  - Neutral-100: #F3F4F6 - Backgrounds suaves
  - Neutral-50: #F9FAFB - Off-white
```

### Estados (UX Feedback)
```
Error: #EF4444 (Rojo)
Warning: #F59E0B (Amber)
Success: #10B981 (Verde)
Info: #3B82F6 (Azul)
```

---

## 2. TIPOGRAFÍA

### Google Fonts (Modernas, accesibles)
```
📝 Títulos: "Poppins" (Bold, SemiBold, Medium)
  - Extra grande (H1): 48px / 56px (web) | 32px (mobile) - Bold 700
  - Grande (H2): 36px / 44px (web) | 24px (mobile) - SemiBold 600
  - Medio (H3): 24px / 32px (web) | 20px (mobile) - SemiBold 600
  - Pequeño (H4): 16px / 20px - SemiBold 600

📄 Body: "Inter" (Regular, Medium, SemiBold)
  - Large: 18px / 28px - Regular 400
  - Base: 16px / 24px - Regular 400
  - Small: 14px / 20px - Regular 400
  - XSmall: 12px / 16px - Regular 400

🔤 Mono (Precios): "JetBrains Mono" - SemiBold 600
```

### Jerarquía de Tamaños

| Elemento       | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|----------------|---|---|---|---|
| H1 (Hero)      | 48px | 32px | 700 (Bold) | 1.2 |
| H2 (Secciones) | 36px | 24px | 600 (SemiBold) | 1.2 |
| H3 (Cards)     | 24px | 20px | 600 (SemiBold) | 1.3 |
| Body Large     | 18px | 16px | 400 | 1.5 |
| Body Base      | 16px | 14px | 400 | 1.6 |
| Body Small     | 14px | 12px | 400 | 1.5 |
| Label          | 12px | 11px | 600 (SemiBold) | 1.4 |
| Precio         | 20px | 18px | 600 (Mono) | 1.2 |

---

## 3. SISTEMA DE ESPACIADO (8px Grid)

```
Base: 8px (1 unidad)
xs: 4px (0.5 unidades)
sm: 8px (1 unidad)
md: 16px (2 unidades)
lg: 24px (3 unidades)
xl: 32px (4 unidades)
2xl: 48px (6 unidades)
3xl: 64px (8 unidades)
```

### Aplicación
```
- Padding componentes: 16px (horizontal) / 12px (vertical)
- Margins entre secciones: 48px - 64px
- Gaps entre items: 16px - 24px
- Line-height multiplier: 1.5 - 1.6 (body), 1.2 - 1.3 (titles)
```

---

## 4. COMPONENTES VISUALES

### Botones

#### CTA Primario (Comprar, Confirmar)
```css
Fondo: Azul profundo (#0369A1)
Texto: Blanco (Bold, 16px)
Padding: 14px 28px
Border-radius: 12px
Shadow: 0 4px 12px rgba(3, 105, 161, 0.3)
Hover: Darkened + Shadow aumento
Active: Scale 0.98
Focus: Ring 4px + offset 2px
```

#### CTA Secundario (Alternativa)
```css
Fondo: Naranja (#F59E0B)
Texto: Blanco (SemiBold, 16px)
Padding: 14px 28px
Border-radius: 12px
Shadow: 0 2px 8px rgba(245, 158, 11, 0.2)
```

#### CTA WhatsApp (IMPORTANTE)
```css
Fondo: Verde WhatsApp (#25D366)
Texto: Blanco (Bold, 18px)
Padding: 16px 32px
Border-radius: 12px
Shadow: 0 6px 16px rgba(37, 211, 102, 0.4)
Icon: 24px white
Hover: Brightened + Lift animation
Pulse animation (opcional, para destacar)
```

#### Botón Ghost (Secundario simple)
```css
Fondo: Transparent
Border: 2px Neutral-300
Texto: Neutral-700 (SemiBold, 14px)
Padding: 10px 16px
Border-radius: 8px
Hover: Border-600 + Neutral-100 bg
```

### Cards

#### Producto Card
```css
Fondo: Blanco
Border: 1px Neutral-200
Border-radius: 16px
Shadow: 0 2px 8px rgba(0,0,0,0.06)
Hover: Shadow up + Y-translate -4px
Overflow: hidden (imágenes)
Padding: 0 (imagen full-width top)
Body padding: 16px
```

#### Info Card
```css
Fondo: Neutral-50 o gradient claro
Border: 1px Neutral-200
Border-radius: 12px
Shadow: 0 1px 4px rgba(0,0,0,0.04)
Padding: 20px
```

### Formas & Inputs

#### Input / Textarea
```css
Fondo: Blanco
Border: 2px Neutral-300
Border-radius: 10px
Padding: 12px 16px
Typography: Body Base (16px)
Focus: Border Primary-600 + Ring
Placeholder: Neutral-500
Shadow: Inset 0 1px 2px rgba(0,0,0,0.02)
```

#### Select / Dropdown
```css
Igual que input
Icono: Chevron derecha
Cursor: pointer
```

### Bordes y Radios

```css
xs: 4px (inputs pequeños)
sm: 8px (botones pequeños, badges)
md: 12px (cards, inputs normales)
lg: 16px (cards grandes, modals)
full: 9999px (pills, avatares)
```

### Sombras

```css
xs: 0 1px 2px rgba(0,0,0,0.05)
sm: 0 2px 8px rgba(0,0,0,0.06)
md: 0 4px 12px rgba(0,0,0,0.08)
lg: 0 8px 24px rgba(0,0,0,0.12)
xl: 0 12px 32px rgba(0,0,0,0.15)
hover: Aumentar a nivel superior
```

---

## 5. COMPONENTES CLAVE POR PÁGINA

### Header / Navbar
- Logo + marca: "Playa y Sol" (Poppins Bold, 24px)
- Nav links: Poppins Medium, 16px, Neutral-700
- Active state: Azul profundo + underline 3px
- Cart badge: Circular rojo (#EF4444), Bold white
- Background: Blanco con shadow subtle
- Responsive: Menu hamburguesa en mobile

### Hero Section
- H1: Poppins Bold 48px, Neutral-900
- Subtítulo: Inter Regular 18px, Neutral-700
- CTA primario: Azul + Grande
- Imagen: Full-width, aspect-ratio correcta
- Background: Gradiente sutil (Neutral-50 → Neutral-100)

### Listado de Productos
- Grid: 1 col (mobile) → 2 cols (tablet) → 3-4 cols (desktop)
- Spacing: 24px gap
- Filtros: Sticky arriba, limpio
- Cards: Con overlay hover (imagen)
- Paginación: Moderna, numerada

### Página Producto
- Galería imagen: Grande, zoom hover
- Info derecha: Nombre, precio, descripción
- Rating: Stars + cantidad reviews
- Cantidad selector: +/- buttons o input
- CTA: WhatsApp + Agregar carrito (dual)
- Relacionados: Carousel horizontal

### Carrito
- Table/list limpio
- Resumen derecha: Total, tax, shipping
- CTA WhatsApp GRANDE y visible
- Botón "Continuar comprando"
- Empty state: Icono + mensaje

### Contacto
- Form limpio a izquierda
- Info contacto derecha (card)
- Whatsapp botón: Destacado
- Google Maps embebido
- Horarios tabla

### Footer
- Grid 4 columnas (desktop)
- Links organizados
- Newsletter subscription
- Social icons
- Copyright

---

## 6. MEJORAS UX

### Navegación
- ✅ Navbar sticky con shadow
- ✅ Breadcrumbs en producto
- ✅ Search bar visible
- ✅ Mobile menu intuitivo

### Conversión
- ✅ WhatsApp CTA siempre visible (floating button en mobile)
- ✅ Call-to-action clara en hero
- ✅ Precio destacado en producto
- ✅ Botones de compra 40px+ height
- ✅ Urgencia: Stock count visible

### Feedback del Usuario
- ✅ Loading states
- ✅ Toast notifications (success, error)
- ✅ Hover states claros
- ✅ Focus states accesibles
- ✅ Error messages útiles

### Accesibilidad (WCAG AA)
- ✅ Contraste mínimo 4.5:1 para textos
- ✅ Focus indicators visibles
- ✅ Alt text en imágenes
- ✅ Semantic HTML
- ✅ Skip links
- ✅ Form labels asociadas

### Mobile-First
- ✅ Touch targets mínimo 48px
- ✅ Spacing adecuado en mobile
- ✅ Tipografía legible sin zoom
- ✅ Forms optimizadas (input types correctos)
- ✅ Floating WhatsApp button

---

## 7. COLORES HEX FINALES

```
Primary: #0369A1 (Azul cielo moderno)
Primary-Dark: #025A82
Primary-Light: #E0F2FE

Accent: #F59E0B (Naranja/Dorado)
Accent-Dark: #D97706
Accent-Light: #FEF3C7

Success: #10B981 (Verde)
Error: #EF4444 (Rojo)
Warning: #F59E0B (Amber)

Neutral-900: #111827
Neutral-800: #1F2937
Neutral-700: #374151
Neutral-600: #4B5563
Neutral-500: #6B7280
Neutral-400: #9CA3AF
Neutral-300: #D1D5DB
Neutral-200: #E5E7EB
Neutral-100: #F3F4F6
Neutral-50: #F9FAFB
```

---

## 8. TRANSICIONES Y ANIMACIONES

```css
Standard: 200ms ease-out (hover states)
Slow: 300ms ease-in-out (modals, página)
Fast: 100ms ease-in (quick feedback)

Preferir: transform, opacity, box-shadow
Evitar: width, height (performance)

Efectos sugeridos:
- Hover lift: translateY(-2px)
- Pulse: Para WhatsApp button
- Fade: Loading states
- Slide: Mobile menu
```

---

## 9. RESPONSIVE BREAKPOINTS

```
Mobile: < 640px (320px - 640px)
Tablet: 640px - 1024px
Desktop: > 1024px

Ajustes:
- Tipografía: Reducir en mobile
- Padding: 16px mobile → 24px desktop
- Grid: 1 col mobile → 2-4 desktop
- Buttons: Full-width mobile, inline desktop
```

---

## RESUMEN RÁPIDO

| Aspecto | Valor |
|---|---|
| **Color Primario** | #0369A1 (Azul) |
| **Color Acento** | #F59E0B (Naranja) |
| **WhatsApp CTA** | #25D366 (Verde) |
| **Font Titles** | Poppins (Bold/SemiBold) |
| **Font Body** | Inter (Regular) |
| **Border Radius** | 12px (estándar), 10px (inputs) |
| **Shadow Estándar** | 0 2px 8px rgba(0,0,0,0.06) |
| **Spacing Base** | 8px (grid) |
| **CTA Button Height** | 44px (mobile), 48px (desktop) |
| **Mobile-First** | ✅ Sí |

