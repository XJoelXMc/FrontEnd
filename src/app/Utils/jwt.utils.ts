// jwt.utils.ts
// jwt.utils.ts
export function getUserIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    //console.log('Token completo:', token);
    
    if (!token) {
        console.error('No se encontró token en localStorage');
        return null;
    }

    try {
        // Eliminar 'Bearer ' si está presente
        const tokenWithoutBearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        
        // Decodificar el payload
        const base64Url = tokenWithoutBearer.split('.')[1];
        if (!base64Url) {
            console.error('Token con formato incorrecto');
            return null;
        }
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        ));
        
        //console.log('Payload decodificado:', payload);
        
        // Buscar el ID en diferentes ubicaciones posibles
        const userId = payload.id || payload.userId || payload.sub;
       // console.log('ID de usuario extraído:', userId);
        
        return userId ? Number(userId) : null;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}
export function getUserRoleFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const tokenWithoutBearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        const base64Url = tokenWithoutBearer.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
        
        // Asegúrate de que en tu Backend (JwtUtil.java) estés haciendo: .claim("rol", role)
        return payload.rol || payload.role || payload.authority || null;
    } catch (error) {
        console.error('Error al decodificar rol:', error);
        return null;
    }
}