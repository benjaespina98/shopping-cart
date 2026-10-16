import { lazy } from 'react';

// React.lazy para piezas accesorias (carrito, avisos) que se descargan en idle. Si el chunk no baja
// (sin red, o un hash viejo tras un deploy) el rechazo llegaría al ErrorBoundary de las rutas y se
// perdería toda la página pública por algo que no es esencial: acá se resuelve a un componente vacío.
export function lazyOptional(importer) {
  return lazy(() =>
    importer().catch((err) => {
      console.error('No se pudo cargar un componente opcional:', err);
      return { default: () => null };
    })
  );
}
