using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entity
{
    public class ZonaEntity
    {
        public string sOpcion { get; set; }
        public int nIdZona { get; set; }
        [Required(ErrorMessage = "El nombre de la zona es obligatorio.")]
        [MaxLength(100)]
        public string sNombre { get; set; }
        public string sRutaImagen { get; set; }
        public bool bEstado { get; set; }
        public string sEstado { get; set; }
    }
}
