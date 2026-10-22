import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../database/db.js";
import { BeneficiarioRepository } from "../repositories/beneficiarioRepository.js";

const PERSONAL = [
  {
    email: "administrador@uraba-pais.local",
    password: "demo1234",
    rol: "Administrador",
    nombre: "Administrador del Sistema",
  },
  {
    email: "funcionario@uraba-pais.local",
    password: "demo1234",
    rol: "Funcionario",
    nombre: "Operador de Campo Urabá",
  },
  {
    email: "auditor@uraba-pais.local",
    password: "demo1234",
    rol: "Auditor",
    nombre: "Auditor Cooperante AICS",
  },
  {
    email: "consulta@uraba-pais.local",
    password: "demo1234",
    rol: "Consulta",
    nombre: "Consulta Pública Comunidad",
  },
];

function claveInicial(nombre) {
  const primero =
    String(nombre || "")
      .trim()
      .split(/\s+/)[0] || "";
  return primero
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function firmar(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });
}

export async function asegurarUsuarios() {
  for (const u of PERSONAL) {
    const existe = await query(
      "SELECT id_usuario FROM usuario WHERE email = $1",
      [u.email],
    );
    if (existe.rowCount > 0) continue;
    const hash = await bcrypt.hash(u.password, 10);
    await query(
      "INSERT INTO usuario (email, password_hash, rol, nombre) VALUES ($1, $2, $3, $4)",
      [u.email, hash, u.rol, u.nombre],
    );
  }
}

export class AuthController {
  static async login(req, res) {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    const personal = await query(
      "SELECT id_usuario, email, password_hash, rol, nombre FROM usuario WHERE email = $1 AND activo = TRUE",
      [email],
    );
    if (personal.rowCount > 0) {
      const u = personal.rows[0];
      const ok = await bcrypt.compare(password, u.password_hash);
      if (!ok)
        return res
          .status(401)
          .json({ success: false, message: "No se pudo entrar" });
      const token = firmar({ id: u.id_usuario, rol: u.rol, nombre: u.nombre });
      return res.json({
        success: true,
        data: { token, rol: u.rol, nombre: u.nombre },
      });
    }

    const sufijo = "@uraba-pais.local";
    const documento = email.endsWith(sufijo)
      ? email.slice(0, -sufijo.length)
      : "";
    const persona = documento
      ? await BeneficiarioRepository.findByDocumento(documento)
      : null;
    if (!persona || claveInicial(persona.nombre) !== password) {
      return res
        .status(401)
        .json({ success: false, message: "No se pudo entrar" });
    }

    const token = firmar({
      id: persona.id_beneficiario,
      rol: "Beneficiario",
      nombre: persona.nombre,
      beneficiarioId: persona.id_beneficiario,
    });
    return res.json({
      success: true,
      data: {
        token,
        rol: "Beneficiario",
        nombre: persona.nombre,
        beneficiarioId: persona.id_beneficiario,
      },
    });
  }
}
