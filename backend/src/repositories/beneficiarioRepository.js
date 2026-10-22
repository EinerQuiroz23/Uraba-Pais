import { query } from "../database/db.js";

/**
 * Repositorio de Persistencia: Beneficiarios
 * Consultas SQL contra la tabla beneficiario con JOIN a municipio.
 */
export class BeneficiarioRepository {
  /**
   * Obtiene todos los beneficiarios con el nombre del municipio
   * Soporta filtros opcionales de búsqueda y municipio
   */
  static async findAll({ search, id_municipio } = {}) {
    let sql = `
      SELECT b.id_beneficiario, b.codigo_interno, b.nombre, b.documento, b.telefono,
             b.tipo_documento, b.sexo, b.edad, b.zona, b.nacionalidad, b.tipo_poblacion,
             b.id_municipio, m.nombre AS municipio_nombre
      FROM beneficiario b
      JOIN municipio m ON m.id_municipio = b.id_municipio
    `;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(
        `(b.nombre ILIKE $${idx} OR b.documento ILIKE $${idx} OR b.telefono ILIKE $${idx} OR b.codigo_interno ILIKE $${idx})`,
      );
    }

    if (id_municipio) {
      params.push(id_municipio);
      conditions.push(`b.id_municipio = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY b.id_beneficiario DESC";

    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Busca un beneficiario por ID
   */
  static async findById(id) {
    const res = await query(
      `
      SELECT b.id_beneficiario, b.codigo_interno, b.nombre, b.documento,
       b.tipo_documento, b.telefono, b.sexo, b.edad, b.zona,
       b.nacionalidad, b.tipo_poblacion, b.id_municipio,
       m.nombre AS municipio_nombre
      FROM beneficiario b
      JOIN municipio m ON m.id_municipio = b.id_municipio
      WHERE b.id_beneficiario = $1
    `,
      [id],
    );
    return res.rows[0] || null;
  }

  /**
   * Busca un beneficiario por documento
   */
  static async findByDocumento(documento) {
    if (!documento) return null;
    const res = await query(
      `
      SELECT b.id_beneficiario, b.codigo_interno, b.nombre, b.documento,
       b.tipo_documento, b.telefono, b.sexo, b.edad, b.zona,
       b.nacionalidad, b.tipo_poblacion, b.id_municipio,
       m.nombre AS municipio_nombre
      FROM beneficiario b
      JOIN municipio m ON m.id_municipio = b.id_municipio
      WHERE LOWER(b.documento) = LOWER($1)
    `,
      [documento.trim()],
    );
    return res.rows[0] || null;
  }

  /**
   * Crea un nuevo beneficiario (todos los campos de la tabla)
   */
  static async create({
    nombre,
    documento,
    telefono,
    id_municipio,
    tipo_documento = null,
    sexo = null,
    edad = null,
    zona = null,
    nacionalidad = null,
    tipo_poblacion = null,
  }) {
    const maxRes = await query(`
      SELECT COALESCE(MAX(
        CAST(NULLIF(regexp_replace(codigo_interno, '[^0-9]', '', 'g'), '') AS INTEGER)
      ), 0)::int AS maximo
      FROM beneficiario
    `);
    const siguiente = Number(maxRes.rows[0].maximo) + 1;
    const codigo = `URABA-${String(siguiente).padStart(2, "0")}`;

    const res = await query(
      `
      INSERT INTO beneficiario (
        nombre, documento, telefono, id_municipio, codigo_interno,
        tipo_documento, sexo, edad, zona, nacionalidad, tipo_poblacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id_beneficiario, codigo_interno, nombre, documento, telefono,
                id_municipio, tipo_documento, sexo, edad, zona, tipo_poblacion
    `,
      [
        nombre,
        documento || null,
        telefono || null,
        id_municipio,
        codigo,
        tipo_documento || null,
        sexo || null,
        edad != null && edad !== "" ? Number(edad) : null,
        zona || null,
        nacionalidad || null,
        tipo_poblacion || null,
      ],
    );
    return res.rows[0];
  }

  /**
   * Actualiza un beneficiario existente (campos opcionales)
   */
  static async update(id, data = {}) {
    const fields = [];
    const params = [];
    let idx = 1;

    const map = {
      nombre: data.nombre,
      documento: data.documento,
      telefono: data.telefono,
      id_municipio: data.id_municipio,
      tipo_documento: data.tipo_documento,
      sexo: data.sexo,
      edad: data.edad,
      zona: data.zona,
      nacionalidad: data.nacionalidad,
      tipo_poblacion: data.tipo_poblacion,
    };

    for (const [col, val] of Object.entries(map)) {
      if (val === undefined) continue;
      if (col === "edad") {
        fields.push(`edad = $${idx++}`);
        params.push(val != null && val !== "" ? Number(val) : null);
      } else if (
        col === "documento" ||
        col === "telefono" ||
        col === "tipo_documento" ||
        col === "sexo" ||
        col === "zona" ||
        col === "nacionalidad" ||
        col === "tipo_poblacion"
      ) {
        fields.push(`${col} = $${idx++}`);
        params.push(val || null);
      } else {
        fields.push(`${col} = $${idx++}`);
        params.push(val);
      }
    }

    if (fields.length === 0) return null;

    params.push(id);
    const res = await query(
      `
      UPDATE beneficiario SET ${fields.join(", ")}
      WHERE id_beneficiario = $${idx}
      RETURNING id_beneficiario, nombre, documento, telefono, id_municipio,
                tipo_documento, sexo, edad, zona, tipo_poblacion
    `,
      params,
    );
    return res.rows[0] || null;
  }

  /**
   * Elimina un beneficiario
   */
  static async delete(id) {
    const res = await query(
      "DELETE FROM beneficiario WHERE id_beneficiario = $1 RETURNING id_beneficiario",
      [id],
    );
    return res.rowCount > 0;
  }

  /**
   * Cuenta total de beneficiarios
   */
  static async count() {
    const res = await query("SELECT COUNT(*)::int AS total FROM beneficiario");
    return res.rows[0].total;
  }

  static async findFamiliares(id_beneficiario) {
    const res = await query(
      `SELECT nombre, parentesco, edad
      FROM familiar
      WHERE id_beneficiario = $1
      ORDER BY id_familiar`,
      [id_beneficiario],
    );
    return res.rows.map((f) => ({
      nombres: f.nombre,
      parentesco: f.parentesco,
      edad: f.edad,
    }));
  }
}
