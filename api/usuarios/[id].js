export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query || {};
  const numId = Number(id) || 4;

  if (req.method === 'GET') {
    return res.status(200).json({
      id: numId,
      nombre: 'Administrador General DIF',
      usuario: 'prueba@gmail.com.mx',
      username: 'prueba@gmail.com.mx',
      rol: 'admin',
      dependencia: 'Dirección General DIF',
      activo: true,
    });
  }

  return res.status(200).json({ ok: true, id: numId });
}
