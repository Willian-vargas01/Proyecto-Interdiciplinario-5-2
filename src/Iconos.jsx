const trazos = {
  inicio: 'M3 11l9-8 9 8M5 9.5V21h5v-6h4v6h5V9.5',
  lotes: 'M12 3l9 5-9 5-9-5 9-5zM3 12.5l9 5 9-5M3 17l9 5 9-5',
  aves: 'M12 3c3.5 0 6 5.2 6 9.5a6 6 0 0 1-12 0C6 8.2 8.5 3 12 3z',
  vacunacion: 'M18 3l3 3M14.5 6.5l3 3M6 15l9-9 3 3-9 9H6v-3zM4 20l3-3',
  alimentacion: 'M3 12h18a9 9 0 0 1-18 0zM9 8c0-2 1.5-2.5 1.5-4.5M15 8c0-2 1.5-2.5 1.5-4.5',
  inventario: 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8',
  ventas: 'M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3zM9 8h6M9 12h6',
  personal: 'M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 20v-2a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8',
  solicitudes: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  achicar: 'M15 6l-6 6 6 6',
  ampliar: 'M9 6l6 6-6 6',
  salir: 'M9 21H5V3h4M16 17l5-5-5-5M21 12H9'
};

export default function Icono({ nombre }) {
  return (
    <svg className="icono" viewBox="0 0 24 24" aria-hidden="true">
      <path d={trazos[nombre]} />
    </svg>
  );
}
