export const environment = {
  production: true,

  // HTTPS, no HTTP: la API hace UseHttpsRedirection fuera de Development y un 307
  // en el preflight de CORS rompe las llamadas. Ver 06-hallazgos.md S-08.
  //
  // El host de Azure original ya no existe (NXDOMAIN). Deja aqui la URL real del
  // despliegue cuando lo hagas; mientras tanto apunta al mismo puerto que en local
  // para que un build de produccion no llame a un dominio muerto.
  API_URL_INV: "https://localhost:44360/",
};
