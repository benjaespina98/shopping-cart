// Miniatura borrosa (~850 bytes) de la foto que hoy está marcada como "hero" en el
// panel (Panel › Sitio web) — generada una vez desde Cloudinary con la misma receta
// que usa el blur-up de CldImage (w_32, e_blur:800, q_1, f_auto) y embebida acá como
// data URI.
//
// Por qué existe: la home no sabe qué foto es el hero hasta que responde
// GET /api/projects. Hasta ese momento no había nada que mostrar y se veía la caja
// lisa color marca — el "fondo azul" que se nota antes de que aparezca la foto. Esto
// se pinta en su lugar, instantáneo (viaja en el bundle, cero red), y una vez que
// llega el dato real CldImage hace su propio blur-up hacia la foto nítida encima.
//
// Se pone desactualizado si el admin cambia la foto del hero: la foto vieja se vería
// borrosa hasta que cargue la nueva (y un instante más durante el fundido). Si eso se nota,
// regenerarlo. Si la API no responde o no hay proyectos, queda a la vista (igual que antes). Si en algún momento se nota muy distinta,
// se regenera pegando la URL de Cloudinary de la foto nueva en:
//   https://res.cloudinary.com/<cloud>/image/upload/w_32,e_blur:800,q_1,f_auto/<resto-de-la-url>
// y volcando el resultado en base64 acá.
export const HERO_BLUR_PLACEHOLDER =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAlgCWAAD/4gI0SUNDX1BST0ZJTEUAAQEAAAIkYXBwbAQAAABtbnRyUkdCIFhZWiAH4QAHAAcADQAWACBhY3NwQVBQTAAAAABBUFBMAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWFwcGzKGpWCJX8QTTiZE9XR6hWCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAAGVjcHJ0AAABZAAAACN3dHB0AAABiAAAABRyWFlaAAABnAAAABRnWFlaAAABsAAAABRiWFlaAAABxAAAABRyVFJDAAAB2AAAACBjaGFkAAAB+AAAACxiVFJDAAAB2AAAACBnVFJDAAAB2AAAACBkZXNjAAAAAAAAAAtEaXNwbGF5IFAzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHRleHQAAAAAQ29weXJpZ2h0IEFwcGxlIEluYy4sIDIwMTcAAFhZWiAAAAAAAADzUQABAAAAARbMWFlaIAAAAAAAAIPfAAA9v////7tYWVogAAAAAAAASr8AALE3AAAKuVhZWiAAAAAAAAAoOAAAEQsAAMi5cGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltzZjMyAAAAAAABDEIAAAXe///zJgAAB5MAAP2Q///7ov///aMAAAPcAADAbv/bAEMA///////////////////////////////////////////////////////////////////////////////////////bAEMB///////////////////////////////////////////////////////////////////////////////////////AABEIABgAIAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAAf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKgAAoIAgoAP/9k=';
