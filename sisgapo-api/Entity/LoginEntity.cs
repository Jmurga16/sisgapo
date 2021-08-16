using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entity
{
    public class LoginEntity
    {        
   
        public string sNombreUsuario { get; set; }
        public string sContrasenia { get; set; }
    }
    public class ResultEntity
    {
        public int nIdRol { get; set; }
        public int Result { get; set; }
    }
}
