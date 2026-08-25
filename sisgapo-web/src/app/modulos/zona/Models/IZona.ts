export interface ZonaData {
    nIdZona: number;
    sNombre: string;
    sRutaImagen: string;
    bEstado?: boolean;
    sEstado?: string;
}

//Respuesta de las escrituras: el mismo contrato que el resto de módulos.
export interface RespuestaData {
    cod: string;
    mensaje: string;
}
