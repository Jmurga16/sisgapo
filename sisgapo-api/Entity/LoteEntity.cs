using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entity
{
    public class LoteEntity
    {

    }

    public class EListaLotes
    {
        public int nIdDetProd { get; set; }
        public int nIdProducto { get; set; }
        public string sNombreProducto { get; set; }
        public int nIdAlmacen { get; set; }
        public string sNombreAlmacen { get; set; }
        public int nIdCategoria { get; set; }
        public string sNombreCategoria { get; set; }
        public int nIdLote { get; set; }
        public string sNombreLote { get; set; }
        public string dFechaFab { get; set; }
        public string dFechaVenc { get; set; }
        public int nDiasRestantes { get; set; }
        public int nCantidad { get; set; }
        public string sNombreUM { get; set; }
        public int nPrecio { get; set; }
        public string sEstado { get; set; }
    }

    public class EListaLotesById
    {
        public int nIdDetProd { get; set; }
        public int nIdProducto { get; set; }
        public string sNombreProducto { get; set; }
        public int nIdLote { get; set; }
        public string sNombreLote { get; set; }
        public string dFechaFab { get; set; }
        public string dFechaVenc { get; set; }
        public int nIdUnidadMedida { get; set; }
        public int nCantidad { get; set; }
        public int nPrecio { get; set; }
        public string sDescripcion { get; set; }
        public bool bEstado { get; set; }
    }

    public class EListaProductoLote
    {
        public int nIdProducto { get; set; }
        public string sNombreProducto { get; set; }
        public int nIdAlmacen { get; set; }
        public string sNombreAlmacen { get; set; }
    }
}
