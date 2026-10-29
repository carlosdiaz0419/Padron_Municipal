export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const users = [
    { id: 4, nombre: 'Administrador General DIF', usuario: 'prueba@gmail.com.mx', username: 'prueba@gmail.com.mx', rol: 'admin', dependencia: 'Dirección General DIF', activo: true },
    { id: 5, nombre: 'Capturista DIF Municipal', usuario: 'difmunicipal@gmail.com.mx', username: 'difmunicipal@gmail.com.mx', rol: 'capturista', dependencia: 'Dirección de Asistencia Social', activo: true },
    { id: 6, nombre: 'Supervisor General DIF', usuario: 'supervisor@gmail.com.mx', username: 'supervisor@gmail.com.mx', rol: 'supervisor', dependencia: 'Dirección de Asistencia Social', activo: true },
  ];

  if (req.method === 'GET') {
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    return res.status(201).json({
      id: Date.now(),
      nombre: body.nombre || body.usuario || 'Nuevo Usuario',
      usuario: body.usuario || body.username || 'usuario@dif.gob.mx',
      username: body.usuario || body.username || 'usuario@dif.gob.mx',
      rol: body.rol || 'capturista',
      dependencia: body.dependencia || 'Dirección General DIF',
      activo: body.activo !== false,
    });
  }

  return res.status(200).json({ ok: true });
}
