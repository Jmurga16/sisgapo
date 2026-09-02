using System;
using System.Collections.Generic;

namespace Entity
{
    //Opción 01 — tarjetas de resumen
    public class EPanelResumen
    {
        public int nAlmacenes { get; set; }
        public int nProductos { get; set; }
        public int nCategorias { get; set; }
        public int nZonas { get; set; }
        public long nValorInventario { get; set; }
        public long nUnidades { get; set; }
        public int nPorVencer30 { get; set; }
        public int nVencidos { get; set; }
    }

    //Opción 02 — existencias por almacén
    public class EPanelPorAlmacen
    {
        public int nIdAlmacen { get; set; }
        public string sNombreAlmacen { get; set; }
        public string sNombreZona { get; set; }
        public int nProductos { get; set; }
        public long nUnidades { get; set; }
        public long nValor { get; set; }
    }

    //Opción 03 — existencias por categoría
    public class EPanelPorCategoria
    {
        public int nIdCategoria { get; set; }
        public string sNombreCategoria { get; set; }
        public int nProductos { get; set; }
        public long nUnidades { get; set; }
        public long nValor { get; set; }
    }

    //Opción 04 — productos próximos a vencer
    public class EPanelPorVencer
    {
        public int nIdCatProd { get; set; }
        public int nIdProducto { get; set; }
        public string sNombreProducto { get; set; }
        public string sNombreAlmacen { get; set; }
        public string sNombreCategoria { get; set; }
        public string sNombreLote { get; set; }
        public string dFechaVenc { get; set; }
        public int nDiasRestantes { get; set; }
        public int nCantidad { get; set; }
        public string sNombreUM { get; set; }
    }
}
