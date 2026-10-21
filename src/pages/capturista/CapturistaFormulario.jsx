import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getBeneficiarioById,
  crearBeneficiario,
  actualizarBeneficiario,
} from '../../services/api';
import { 
  User, 
  MapPin, 
  Accessibility, 
  Users, 
  HeartHandshake, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar,
  HeartPulse,
  Scale,
  Utensils,
  ShieldCheck,
  Building2,
  Printer
} from 'lucide-react';
import { exportFichaBeneficiarioPDF } from '../../utils/exportUtils';
import './CapturistaFormulario.css';

const FORM_INITIAL = {
  // 0. Dependencia y Unidad Responsable
  dependencia_emisora: 'Dirección de Asistencia Social',

  // 1. Solicitud y Datos Personales
  fecha_solicitud: new Date().toISOString().split('T')[0],
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  curp: '',
  fecha_nacimiento: '',
  edad: '',
  sexo: '',
  estado_civil: '',

  // 2. Dependencia y Tutor
  es_dependiente_economico: 'No',
  cuenta_con_dependientes: 'No',
  nombre_tutor: '',

  // 3. Domicilio
  tipo_vialidad: 'Calle',
  nombre_vialidad: '',
  numero_exterior: '',
  tipo_asentamiento: 'Colonia',
  nombre_asentamiento: '',
  codigo_postal: '',

  // 4. Discapacidad y Ayuda Solicitada
  tipo_discapacidad: '',
  tipo_ayuda_solicitada: '',
  recibio_apoyo_dif_estatal: 'No',
  descripcion_apoyo_estatal: '',
  // 5. Servicios Médicos y Apoyos Gubernamentales
  cuenta_servicio_medico: 'No',
  cuenta_apoyo_gubernamental: 'No',
  descripcion_apoyo_gubernamental: '',

  // 6. Servicios Institucionales DIF Solicitados / Otorgados (Anexo 5)
  servicios_dif: {
    // Servicios de salud (CEMTRI)
    tl: false, tf: false, to: false, sh: false, cems: false, eavd: false, tcc: false, cpsic: false,
    // Casa del Abuelo
    estancia: false, evento: false, ejercicio: false, platica: false,
    // Proyectos
    tux_lentes: false, prostodoncia: false,
    // Servicios Jurídicos
    aj: false, pl: false,
    // Servicios de la Procuraduría
    ajmf: false, al: false, cac: false, alojamiento: false, b_alimento: false,
    // Servicios a Grupos Vulnerables
    ctfi: false, unetoc: false, cai: false, tc: false, penms: false, cm: false, aam: false, dpa: false,
    // Servicios Alimentarios
    capr: false, de: false, came: false, cann: false, atmsv: false,
  },

  // 7. Observaciones
  observaciones: '',
};

/**
 * CapturistaFormulario — Formulario oficial DIF Tuxtla Gutiérrez para el Padrón de Ayudas Técnicas
 */
function CapturistaFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const esEdicion = Boolean(id);
  const canGuardar = esEdicion ? hasPermission('beneficiarios.editar') : hasPermission('beneficiarios.crear');

  const [form, setForm] = useState(FORM_INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!esEdicion && user?.dependencia) {
      setForm((prev) => ({
        ...prev,
        dependencia_emisora: prev.dependencia_emisora || user.dependencia,
      }));
    }
  }, [user, esEdicion]);

  useEffect(() => {
    if (!esEdicion) return;
    setLoading(true);
    getBeneficiarioById(id)
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          ...data,
          dependencia_emisora: data.dependencia_emisora || data.dependencia || prev.dependencia_emisora,
        }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, esEdicion]);

  // Cálculo automático de edad según fecha de nacimiento
  const handleFechaNacimientoChange = (e) => {
    const fecha = e.target.value;
    let edadCalculada = '';
    if (fecha) {
      const hoy = new Date();
      const cumple = new Date(fecha);
      let edad = hoy.getFullYear() - cumple.getFullYear();
      const mes = hoy.getMonth() - cumple.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
        edad--;
      }
      edadCalculada = edad >= 0 ? edad.toString() : '';
    }
    setForm({
      ...form,
      fecha_nacimiento: fecha,
      edad: edadCalculada,
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleServicioToggle = (clave) => {
    setForm((prev) => ({
      ...prev,
      servicios_dif: {
        ...prev.servicios_dif,
        [clave]: !prev.servicios_dif?.[clave],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canGuardar) {
      setError(`No tienes permiso para ${esEdicion ? 'editar' : 'registrar'} beneficiarios en el padrón.`);
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        dependencia: form.dependencia_emisora || 'Dirección de Asistencia Social',
      };
      if (esEdicion) {
        await actualizarBeneficiario(id, payload);
        setSuccess('Expediente del beneficiario DIF actualizado con éxito.');
      } else {
        await crearBeneficiario(payload);
        setSuccess('Beneficiario registrado exitosamente en el Padrón de Ayudas Técnicas DIF.');
        setForm(FORM_INITIAL);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            <span>{esEdicion ? 'Editar Expediente DIF 2027' : 'Nuevo Registro — Padrón DIF 2027'}</span>
          </h1>
          <p className="page-subtitle">
            Sistema para el Desarrollo Integral de la Familia (DIF) — Padrón de Beneficiarios para Otorgar "Ayudas Técnicas" (Anexo 5).
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportFichaBeneficiarioPDF(form)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            background: '#eff6ff',
            color: '#1e40af',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Printer size={16} />
          <span>Descargar Cédula PDF Completa</span>
        </button>
      </div>

      {!canGuardar && (
        <div className="alert alert--error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>
            Modo de solo lectura: Tu rol o cuenta no tiene habilitado el permiso <strong>{esEdicion ? 'Editar Beneficiario (beneficiarios.editar)' : 'Registrar Nuevo Beneficiario (beneficiarios.crear)'}</strong>.
          </span>
        </div>
      )}

      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert--success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="beneficiario-form-card">
        {/* ── 0. DEPENDENCIA Y UNIDAD RESPONSABLE ────────────────── */}
        <div className="form-card-section" style={{ borderLeft: '4px solid #0284c7', background: '#f8fafc', marginBottom: '1.25rem' }}>
          <div className="form-section-header">
            <div className="form-section-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="form-section-title" style={{ margin: 0 }}>Dependencia y Unidad Responsable del Expediente</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Organismo municipal y funcionario emisor a cargo de la captura de este formulario
              </span>
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: '1rem' }}>
            <div className="form-field">
              <label className="form-label">
                Dependencia / Organismo Emisor <span className="required-mark">*</span>
              </label>
              <select
                className="form-select"
                name="dependencia_emisora"
                value={form.dependencia_emisora || 'Dirección de Asistencia Social'}
                onChange={handleChange}
                required
              >
                <option value="Dirección General DIF">DIF Municipal — Dirección General</option>
                <option value="Dirección de Asistencia Social">DIF Municipal — Dirección de Asistencia Social</option>
                <option value="Coordinación de Salud y CEMTRI">DIF Municipal — Coordinación de Salud y CEMTRI</option>
                <option value="Casa del Abuelo y Adultos Mayores">DIF Municipal — Casa del Abuelo (Adultos Mayores)</option>
                <option value="Procuraduría de Protección DIF">DIF Municipal — Procuraduría de Protección (NNA)</option>
                <option value="Secretaría de Desarrollo Social">Secretaría de Desarrollo Social Municipal</option>
                <option value="Instituto Municipal de las Mujeres">Instituto Municipal de las Mujeres</option>
                <option value="Secretaría de Planeación Municipal">Secretaría de Planeación Municipal</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Funcionario / Capturista en Turno</label>
              <div style={{
                padding: '0.55rem 0.85rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.88rem',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '40px'
              }}>
                <User size={15} style={{ color: '#0284c7' }} />
                <span>
                  <strong>{user?.nombre || 'Capturista'}</strong> ({user?.rol ? user.rol.toUpperCase() : 'CAPTURISTA'}) • <span style={{ color: '#64748b' }}>{user?.dependencia || 'DIF Municipal'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 1. DATOS DEL SOLICITANTE ───────────────────────────── */}
        <div className="form-card-section">
          <div className="form-section-header">
            <div className="form-section-icon">
              <User size={18} />
            </div>
            <h2 className="form-section-title">1. Datos Personales del Solicitante</h2>
          </div>

          <div className="form-grid form-grid-3">
            <div className="form-field">
              <label className="form-label">
                Fecha de Solicitud <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                name="fecha_solicitud"
                value={form.fecha_solicitud}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">
                CURP <span className="required-mark">*</span>
              </label>
              <input
                className="form-input"
                name="curp"
                value={form.curp}
                onChange={handleChange}
                maxLength={18}
                required
                placeholder="18 caracteres"
                style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
              />
            </div>
            <div className="form-field">
              <label className="form-label">
                Sexo <span className="required-mark">*</span>
              </label>
              <select
                className="form-select"
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione sexo</option>
                <option value="H">Hombre (H)</option>
                <option value="M">Mujer (M)</option>
              </select>
            </div>
          </div>

          <div className="form-grid form-grid-3" style={{ marginTop: '1.25rem' }}>
            <div className="form-field">
              <label className="form-label">
                Nombre(s) <span className="required-mark">*</span>
              </label>
              <input
                className="form-input"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ej. Jorge Luis"
              />
            </div>
            <div className="form-field">
              <label className="form-label">
                Primer Apellido (ApePat) <span className="required-mark">*</span>
              </label>
              <input
                className="form-input"
                name="apellido_paterno"
                value={form.apellido_paterno}
                onChange={handleChange}
                required
                placeholder="Ej. Caceres"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Segundo Apellido (ApeMat)</label>
              <input
                className="form-input"
                name="apellido_materno"
                value={form.apellido_materno}
                onChange={handleChange}
                placeholder="Ej. Murillo"
              />
            </div>
          </div>

          <div className="form-grid form-grid-3" style={{ marginTop: '1.25rem' }}>
            <div className="form-field">
              <label className="form-label">
                Fecha de Nacimiento <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleFechaNacimientoChange}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Edad (años)</label>
              <input
                type="number"
                className="form-input"
                name="edad"
                value={form.edad}
                onChange={handleChange}
                placeholder="Ej. 55"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Estado Civil</label>
              <select
                className="form-select"
                name="estado_civil"
                value={form.estado_civil}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione estado civil</option>
                <option value="Soltero(a)">Soltero(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Viudo(a)">Viudo(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Unión libre">Unión libre</option>
                <option value="Separado(a)">Separado(a)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 2. SITUACIÓN FAMILIAR Y TUTOR ──────────────────────── */}
        <div className="form-card-section">
          <div className="form-section-header">
            <div className="form-section-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Users size={18} />
            </div>
            <h2 className="form-section-title">2. Situación Sociofamiliar y Tutor</h2>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-field">
              <label className="form-label">¿Es Dependiente Económico?</label>
              <select
                className="form-select"
                name="es_dependiente_economico"
                value={form.es_dependiente_economico}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Si">Sí</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">¿Cuenta con Dependientes Económicos?</label>
              <select
                className="form-select"
                name="cuenta_con_dependientes"
                value={form.cuenta_con_dependientes}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Si">Sí</option>
              </select>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">
              Nombre del Tutor (en caso de ser menor de edad o contar con incapacidad legal)
            </label>
            <input
              className="form-input"
              name="nombre_tutor"
              value={form.nombre_tutor}
              onChange={handleChange}
              placeholder="Nombre completo del tutor o representante legal"
            />
          </div>
        </div>

        {/* ── 3. DOMICILIO DEL BENEFICIARIO ───────────────────────── */}
        <div className="form-card-section">
          <div className="form-section-header">
            <div className="form-section-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <MapPin size={18} />
            </div>
            <h2 className="form-section-title">3. Domicilio</h2>
          </div>

          <div className="form-grid form-grid-3">
            <div className="form-field">
              <label className="form-label">Tipo de Vialidad</label>
              <select
                className="form-select"
                name="tipo_vialidad"
                value={form.tipo_vialidad}
                onChange={handleChange}
              >
                <option value="Calle">Calle</option>
                <option value="Avenida">Avenida</option>
                <option value="Andador">Andador</option>
                <option value="Calzada">Calzada</option>
                <option value="Privada">Privada</option>
                <option value="Carretera">Carretera</option>
              </select>
            </div>
            <div className="form-field" style={{ flex: 1.5 }}>
              <label className="form-label">
                Nombre de Vialidad <span className="required-mark">*</span>
              </label>
              <input
                className="form-input"
                name="nombre_vialidad"
                value={form.nombre_vialidad}
                onChange={handleChange}
                placeholder="Ej. Venustiano Carranza / Presa Malpaso"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">
                Número Exterior <span className="required-mark">*</span>
              </label>
              <input
                className="form-input"
                name="numero_exterior"
                value={form.numero_exterior}
                onChange={handleChange}
                placeholder="Ej. 15 / S/N"
                required
              />
            </div>
          </div>

          <div className="form-grid form-grid-3" style={{ marginTop: '1.25rem' }}>
            <div className="form-field">
              <label className="form-label">Tipo de Asentamiento</label>
              <select
                className="form-select"
                name="tipo_asentamiento"
                value={form.tipo_asentamiento}
                onChange={handleChange}
              >
                <option value="Colonia">Colonia</option>
                <option value="Fraccionamiento">Fraccionamiento</option>
                <option value="Residencial">Residencial</option>
                <option value="Barrio">Barrio</option>
                <option value="Ejido">Ejido</option>
                <option value="Ranchería">Ranchería</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">
                Nombre del Asentamiento <span className="required-mark">*</span>
              </label>
              <input
                className="form-input"
                name="nombre_asentamiento"
                value={form.nombre_asentamiento}
                onChange={handleChange}
                placeholder="Ej. Los Limones / La Hacienda"
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">
                Código Postal <span className="required-mark">*</span>
              </label>
              <input
                className="form-input"
                name="codigo_postal"
                value={form.codigo_postal}
                onChange={handleChange}
                maxLength={5}
                placeholder="Ej. 29015"
                required
              />
            </div>
          </div>
        </div>

        {/* ── 4. DISCAPACIDAD Y AYUDA TÉCNICA SOLICITADA ────────── */}
        <div className="form-card-section">
          <div className="form-section-header">
            <div className="form-section-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Accessibility size={18} />
            </div>
            <h2 className="form-section-title">4. Discapacidad y Ayuda Técnica Solicitada</h2>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-field">
              <label className="form-label">
                Tipo de Discapacidad <span className="required-mark">*</span>
              </label>
              <select
                className="form-select"
                name="tipo_discapacidad"
                value={form.tipo_discapacidad}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo de discapacidad</option>
                <option value="Motriz">Motriz</option>
                <option value="Visual">Visual</option>
                <option value="Auditiva">Auditiva</option>
                <option value="Intelectual">Intelectual</option>
                <option value="Psicosocial">Psicosocial</option>
                <option value="Múltiple">Múltiple</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">
                Tipo de Ayuda Solicitada <span className="required-mark">*</span>
              </label>
              <select
                className="form-select"
                name="tipo_ayuda_solicitada"
                value={form.tipo_ayuda_solicitada}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione ayuda técnica</option>
                <option value="Silla de ruedas">Silla de ruedas</option>
                <option value="Andadera">Andadera</option>
                <option value="Bastón de apoyo">Bastón de apoyo</option>
                <option value="Bastón para invidente">Bastón para invidente (blanco)</option>
                <option value="Muletas">Muletas</option>
                <option value="Silla de ruedas PCI">Silla de ruedas PCI (Parálisis Cerebral Infantil)</option>
                <option value="Silla de ruedas PCA">Silla de ruedas PCA (Parálisis Cerebral Adulto)</option>
                <option value="Auxiliar Auditivo">Auxiliar Auditivo</option>
                <option value="Otro">Otro apoyo técnico</option>
              </select>
            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ marginTop: '1.25rem' }}>
            <div className="form-field">
              <label className="form-label">
                ¿Ha solicitado o recibido este tipo de apoyo por el DIF Estatal?
              </label>
              <select
                className="form-select"
                name="recibio_apoyo_dif_estatal"
                value={form.recibio_apoyo_dif_estatal}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Si">Sí</option>
              </select>
            </div>
            {form.recibio_apoyo_dif_estatal === 'Si' && (
              <div className="form-field">
                <label className="form-label">Describa el apoyo recibido del DIF Estatal</label>
                <input
                  className="form-input"
                  name="descripcion_apoyo_estatal"
                  value={form.descripcion_apoyo_estatal}
                  onChange={handleChange}
                  placeholder="Detalles del apoyo recibido"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 5. SERVICIOS MÉDICOS Y APOYOS GUBERNAMENTALES ─────── */}
        <div className="form-card-section">
          <div className="form-section-header">
            <div className="form-section-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <HeartHandshake size={18} />
            </div>
            <h2 className="form-section-title">5. Servicios Médicos y Apoyos Gubernamentales</h2>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-field">
              <label className="form-label">¿Cuenta con Servicio Médico?</label>
              <select
                className="form-select"
                name="cuenta_servicio_medico"
                value={form.cuenta_servicio_medico}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Si - IMSS">Sí - IMSS</option>
                <option value="Si - ISSSTE">Sí - ISSSTE</option>
                <option value="Si - IMSS Bienestar">Sí - IMSS Bienestar</option>
                <option value="Si - ISSTECH">Sí - ISSTECH</option>
                <option value="Si - Privado">Sí - Privado</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">¿Cuenta con Apoyo Gubernamental?</label>
              <select
                className="form-select"
                name="cuenta_apoyo_gubernamental"
                value={form.cuenta_apoyo_gubernamental}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Si">Sí</option>
              </select>
            </div>
          </div>

          {form.cuenta_apoyo_gubernamental === 'Si' && (
            <div className="form-field" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Describa el Apoyo Gubernamental con el que cuenta</label>
              <input
                className="form-input"
                name="descripcion_apoyo_gubernamental"
                value={form.descripcion_apoyo_gubernamental}
                onChange={handleChange}
                placeholder="Ej. Pensión para el Bienestar de las Personas Adultas Mayores / Becas"
              />
            </div>
          )}
        </div>

        {/* ── 6. SERVICIOS INSTITUCIONALES DIF (ANEXO 5) ──────── */}
        <div className="form-card-section">
          <div className="form-section-header">
            <div className="form-section-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <HeartPulse size={18} />
            </div>
            <div>
              <h2 className="form-section-title">6. Servicios Institucionales DIF Solicitados / Otorgados</h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                Marque con un clic los servicios específicos que recibe o solicita el ciudadano en las áreas del DIF.
              </div>
            </div>
          </div>

          {/* 1. Servicios de Salud - CEMTRI */}
          <div className="services-category-block">
            <div className="services-category-title">
              <HeartPulse size={16} color="#059669" />
              <span>Servicios de Salud — CEMTRI</span>
            </div>
            <div className="services-checkbox-grid">
              {[
                { key: 'tl', code: 'T.L.', desc: 'Terapia de Lenguaje' },
                { key: 'tf', code: 'T.F.', desc: 'Terapia Física' },
                { key: 'to', code: 'T.O.', desc: 'Terapia Ocupacional' },
                { key: 'sh', code: 'S.H.', desc: 'Salud / Rehabilitación' },
                { key: 'cems', code: 'CEMS', desc: 'Centro de Especialidades' },
                { key: 'eavd', code: 'E.A.V.D.', desc: 'Actividades Vida Diaria' },
                { key: 'tcc', code: 'T.C.C.', desc: 'Terapia Cognitivo-Cond.' },
                { key: 'cpsic', code: 'C.Psic.', desc: 'Consulta Psicológica' },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`service-chip-label ${form.servicios_dif?.[item.key] ? 'active' : ''}`}
                  onClick={() => handleServicioToggle(item.key)}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.servicios_dif?.[item.key])}
                    onChange={() => {}}
                  />
                  <div>
                    <div className="service-code">{item.code}</div>
                    <div className="service-desc">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Casa del Abuelo y Proyectos */}
          <div className="services-category-block">
            <div className="services-category-title">
              <Users size={16} color="#d97706" />
              <span>Casa del Abuelo y Proyectos Especiales</span>
            </div>
            <div className="services-checkbox-grid">
              {[
                { key: 'estancia', code: 'Estancia', desc: 'Estancia de Día' },
                { key: 'evento', code: 'Evento', desc: 'Eventos y Recreación' },
                { key: 'ejercicio', code: 'Ejercicio', desc: 'Activación Física' },
                { key: 'platica', code: 'Plática', desc: 'Pláticas y Talleres' },
                { key: 'tux_lentes', code: 'Tux Lentes', desc: 'Programa Visual' },
                { key: 'prostodoncia', code: 'Prostodoncia', desc: 'Salud Bucal' },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`service-chip-label ${form.servicios_dif?.[item.key] ? 'active' : ''}`}
                  onClick={() => handleServicioToggle(item.key)}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.servicios_dif?.[item.key])}
                    onChange={() => {}}
                  />
                  <div>
                    <div className="service-code">{item.code}</div>
                    <div className="service-desc">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Servicios Jurídicos y Procuraduría */}
          <div className="services-category-block">
            <div className="services-category-title">
              <Scale size={16} color="#2563eb" />
              <span>Servicios Jurídicos y de la Procuraduría</span>
            </div>
            <div className="services-checkbox-grid">
              {[
                { key: 'aj', code: 'A.J.', desc: 'Asesoría Jurídica' },
                { key: 'pl', code: 'P.L.', desc: 'Patrocinio Legal' },
                { key: 'ajmf', code: 'A.J.M.F.', desc: 'Materia Familiar' },
                { key: 'al', code: 'A.L.', desc: 'Acompañamiento Legal' },
                { key: 'cac', code: 'C.A.C.', desc: 'Centro de Atención' },
                { key: 'alojamiento', code: 'Alojamiento', desc: 'Albergue Temporal' },
                { key: 'b_alimento', code: 'B.Alimento', desc: 'Apoyo Alimentario' },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`service-chip-label ${form.servicios_dif?.[item.key] ? 'active' : ''}`}
                  onClick={() => handleServicioToggle(item.key)}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.servicios_dif?.[item.key])}
                    onChange={() => {}}
                  />
                  <div>
                    <div className="service-code">{item.code}</div>
                    <div className="service-desc">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Servicios a Grupos Vulnerables */}
          <div className="services-category-block">
            <div className="services-category-title">
              <ShieldCheck size={16} color="#7c3aed" />
              <span>Servicios a Grupos Vulnerables</span>
            </div>
            <div className="services-checkbox-grid">
              {[
                { key: 'ctfi', code: 'C.T.F.I.', desc: 'Trabajo Familiar' },
                { key: 'unetoc', code: 'UNETOC', desc: 'Atención Integral' },
                { key: 'cai', code: 'CAI', desc: 'Atención Infantil' },
                { key: 'tc', code: 'T.C.', desc: 'Talleres Comunitarios' },
                { key: 'penms', code: 'P.E.N.M.S.', desc: 'Protección Especial' },
                { key: 'cm', code: 'C.M.', desc: 'Comedor Comunitario' },
                { key: 'aam', code: 'A.A.M.', desc: 'Atención Adulto Mayor' },
                { key: 'dpa', code: 'D.P.A.', desc: 'Desarrollo y Apoyo' },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`service-chip-label ${form.servicios_dif?.[item.key] ? 'active' : ''}`}
                  onClick={() => handleServicioToggle(item.key)}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.servicios_dif?.[item.key])}
                    onChange={() => {}}
                  />
                  <div>
                    <div className="service-code">{item.code}</div>
                    <div className="service-desc">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Servicios Alimentarios */}
          <div className="services-category-block">
            <div className="services-category-title">
              <Utensils size={16} color="#dc2626" />
              <span>Servicios Alimentarios</span>
            </div>
            <div className="services-checkbox-grid">
              {[
                { key: 'capr', code: 'C.A.P.R.', desc: 'Comedor y Asistencia' },
                { key: 'de', code: 'D.E.', desc: 'Desayunos Escolares' },
                { key: 'came', code: 'C.A.M.E.', desc: 'Alimentación Materna' },
                { key: 'cann', code: 'C.A.N.N.', desc: 'Nutrición Niñas y Niños' },
                { key: 'atmsv', code: 'A.T.M.S.V.', desc: 'Asistencia Sujetos Vulnerables' },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`service-chip-label ${form.servicios_dif?.[item.key] ? 'active' : ''}`}
                  onClick={() => handleServicioToggle(item.key)}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.servicios_dif?.[item.key])}
                    onChange={() => {}}
                  />
                  <div>
                    <div className="service-code">{item.code}</div>
                    <div className="service-desc">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. OBSERVACIONES ───────────────────────────────────── */}
        <div className="form-card-section">
          <div className="form-section-header">
            <div className="form-section-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
              <Calendar size={18} />
            </div>
            <h2 className="form-section-title">7. Observaciones Generales</h2>
          </div>
          <div className="form-field">
            <textarea
              className="form-textarea"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={3}
              placeholder="Notas del capturista sobre documentación entregada, dictamen médico o seguimiento..."
            />
          </div>
        </div>

        {/* ── ACCIONES ────────────────────────────────────────────── */}
        <div className="form-button-bar">
          <button type="button" className="btn-form-cancel" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Cancelar</span>
          </button>
          {canGuardar && (
            <button type="submit" className="btn-form-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Guardando en Padrón DIF...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{esEdicion ? 'Guardar Cambios' : 'Registrar Beneficiario DIF'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CapturistaFormulario;
