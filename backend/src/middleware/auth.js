import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Sesión vencida' });
    }
}

export function requireEscritura(req, res, next) {
    const escribe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (escribe && req.user?.rol === 'Beneficiario') {
        return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    next();
}