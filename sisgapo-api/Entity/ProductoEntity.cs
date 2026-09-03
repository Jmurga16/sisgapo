using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entity
{
    public class ProductoEntity
    {

    }

    public class EListaAlmacenProd
    {
        public int nIdAlmacen { get; set; }
        public string sNombreAlmacen { get; set; }
    }

    public class EListaCategoriaProd
    {
        public int nIdCategoria { get; set; }
        public string sNombreCategoria { get; set; }
    }
    public class EListaUnidadMedidaProd
    {
        public int nIdUnidadMedida { get; set; }
        public string sNombreUM { get; set; }
    }


    public class EListaProductos
    {
        public int nIdCatProd { get; set; }
        public int nIdAlmacen { get; set; }
        public string sNombreAlmacen { get; set; }
        public int nIdCategoria { get; set; }
        public string sNombreCategoria { get; set; }
        public int nIdProducto { get; set; }
        public string sNombreProducto { get; set; }
        public int nLotes { get; set; }
        public int nCantidad { get; set; }
        public string sNombreUM { get; set; }
        public long nValor { get; set; }
        public string dFechaVenc { get; set; }
        public string sEstado { get; set; }
    }

    public class EListaProductosById
    {
        public int nIdCatProd { get; set; }
        public int nIdAlmacen { get; set; }       
        public int nIdCategoria { get; set; }        
        public int nIdProducto { get; set; }
        public string sNombreProducto { get; set; }

    }

}
