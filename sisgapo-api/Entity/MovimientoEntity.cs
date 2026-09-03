using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entity
{
    public class MovimientoEntity
    {

    }

    public class EListaMovimientos
    {
        public int nIdMovimiento { get; set; }
        public int nIdDetProd { get; set; }
        public string dFechaMov { get; set; }
        public string sTipo { get; set; }
        public string sTipoNombre { get; set; }
        public int nEntrada { get; set; }
        public int nSalida { get; set; }
        public int nSaldo { get; set; }
        public string sMotivo { get; set; }
        public string sNombrePersona { get; set; }
        public string sNombreLote { get; set; }
        public string sNombreProducto { get; set; }
        public string sNombreAlmacen { get; set; }
        public string sNombreUM { get; set; }
    }

    public class EResumenMovimientos
    {
        public int nMovimientos { get; set; }
        public int nEntradas { get; set; }
        public int nSalidas { get; set; }
        public int nAjustes { get; set; }
    }

    public class EListaLoteMovimiento
    {
        public int nIdDetProd { get; set; }
        public string sNombreLote { get; set; }
        public int nIdProducto { get; set; }
        public string sNombreProducto { get; set; }
        public int nIdAlmacen { get; set; }
        public string sNombreAlmacen { get; set; }
        public int nCantidad { get; set; }
        public string sNombreUM { get; set; }
        public string dFechaVenc { get; set; }
    }
}
