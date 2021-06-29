using System;

namespace Entity
{
    public class UsuarioEntity
    {

        public string sOpcion { get; set; }

        public string pParametro { get; set; }

    }

    public class E_Request_Usuario
    {
        public string sOpcion { get; set; }
    }

    public class E_ListaUsuarios
    {
        public int nIdUsuario { get; set; }
        public string sNombrePersona { get; set; }
        public string sNombreUsuario { get; set; }
        public string sNombreRol { get; set; }
        public string sEstado { get; set; }
    }

    public class E_ListaUsuarioId
    {        
        public string sNombres { get; set; }
        public string sApellidos { get; set; }
        public int nTipoDoc { get; set; }
        public string sNumDoc { get; set; }
        public string sSexo { get; set; }
        public int nIdRol { get; set; }
        public string sDireccion { get; set; }
        public int nTelefono { get; set; }
        //public DateTime dFechaNacimiento { get; set; }        
        public string sContrasenia { get; set; }
    }

}
