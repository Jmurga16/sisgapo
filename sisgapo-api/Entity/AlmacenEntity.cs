using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entity
{
    public class AlmacenEntity
    {


    }
    
    public class E_ListaAlmacenes
    {
        public int nIdAlmacen { get; set; }
        public string sNombreZona { get; set; }
        public string sNombreAlmacen { get; set; }
        public string sEstado { get; set; }
        
    }

    public class E_ListaAlmacenId
    {
        public int nIdAlmacen { get; set; }
        public string sNombre { get; set; }
        public string sDireccion { get; set; }
        public int nIdSupervisor { get; set; }
        public int nIdZona { get; set; }
        public bool bEstado { get; set; }

    }


    public class E_ListaZonas
    {
        public int nIdZona { get; set; }
        public string sNombreZona { get; set; }        
    }

    public class E_ListaSupervisores
    {
        public int nIdSupervisor { get; set; }
        public string sNombrePersona { get; set; }
    }

}
