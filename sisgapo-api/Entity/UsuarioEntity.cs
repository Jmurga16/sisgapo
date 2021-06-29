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
        public string sNombreUsuario { get; set; }
        public string sNombreRol { get; set; }
        public string sEstado { get; set; }
    }

}
