using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entity
{
    public class GeneralEntity
    {
        [Required(ErrorMessage = "Falta sOpcion.")]
        [RegularExpression(@"^\d{2}$", ErrorMessage = "sOpcion son dos digitos.")]
        public string sOpcion { get; set; }
        public string pParametro { get; set; }
        public string[] parametros { get; set; }

    }


}
