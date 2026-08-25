using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class ProductoData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #region Conexion
        private readonly Conexion oCon;

        public ProductoData()
        {
            oCon = new Conexion(1);
        }
        #endregion
        
        private readonly List<EListaProductos> listaProductos = new List<EListaProductos>();

        #region Producto
        public object DataProducto(GeneralEntity genEnt)
        {

            string msj = string.Empty;
            try
            {

                switch (genEnt.sOpcion)
                {

                    #region 01. Lista de Almacenes
                    case "01":

                        List<EListaAlmacenProd> listaAlmacenes = new List<EListaAlmacenProd>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Productos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaAlmacenProd almEnt = new EListaAlmacenProd();


                                almEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));                                
                                almEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);                               


                                listaAlmacenes.Add(almEnt);

                            }

                            return listaAlmacenes;

                        }
                    #endregion

                    #region 02. Lista de Categorías
                    case "02":

                        List<EListaCategoriaProd> listaCategorias = new List<EListaCategoriaProd>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Productos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaCategoriaProd catEnt = new EListaCategoriaProd();

                                catEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                catEnt.sNombreCategoria = Convert.ToString(dr["sNombreCategoria"]);


                                listaCategorias.Add(catEnt);

                            }

                            return listaCategorias;
                        }

                    #endregion

                    #region 03. Lista de Productos
                    case "03":

                        
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Productos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaProductos prodEnt = new EListaProductos();

                                prodEnt.nIdCatProd = Int32.Parse(Convert.ToString(dr["nIdCatProd"]));
                                prodEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                prodEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                prodEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                prodEnt.sNombreCategoria = Convert.ToString(dr["sNombreCategoria"]);
                                prodEnt.nIdProducto = Int32.Parse(Convert.ToString(dr["nIdProducto"]));
                                prodEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                prodEnt.nIdDetProd = Int32.Parse(Convert.ToString(dr["nIdDetProd"]));
                                prodEnt.nCantidad = Int32.Parse(Convert.ToString(dr["nCantidad"]));
                                prodEnt.sNombreUM = Convert.ToString(dr["sNombreUM"]);
                                prodEnt.nPrecio = Int32.Parse(Convert.ToString(dr["nPrecio"]));
                                prodEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                prodEnt.dFechaVenc = Convert.ToString(dr["dFechaVenc"]);
                                prodEnt.sEstado = Convert.ToString(dr["sEstado"]);

                                listaProductos.Add(prodEnt);

                            }

                            return listaProductos;
                        }


                    #endregion

                    #region 04. Lista de Unidades de Medida
                    case "04":

                        List<EListaUnidadMedidaProd> listaUnidadMedida = new List<EListaUnidadMedidaProd>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Productos", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (dr.Read())
                            {
                                EListaUnidadMedidaProd umEnt = new EListaUnidadMedidaProd();

                                umEnt.nIdUnidadMedida = Int32.Parse(Convert.ToString(dr["nIdUnidadMedida"]));
                                umEnt.sNombreUM = Convert.ToString(dr["sNombreUM"]);

                                listaUnidadMedida.Add(umEnt);

                            }

                            return listaUnidadMedida;
                        }

                    #endregion

                    #region 05. Lista de Productos por Id
                    case "05":

                        List<EListaProductosById> listaProductosId = new List<EListaProductosById>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Productos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaProductosById prodEnt = new EListaProductosById();

                                prodEnt.nIdCatProd = Int32.Parse(Convert.ToString(dr["nIdCatProd"]));
                                prodEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));                                
                                prodEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));                                
                                prodEnt.nIdProducto = Int32.Parse(Convert.ToString(dr["nIdProducto"]));
                                prodEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);      
                                prodEnt.nCantidad = Int32.Parse(Convert.ToString(dr["nCantidad"]));
                                prodEnt.nIdUnidadMedida = Int32.Parse(Convert.ToString(dr["nIdUnidadMedida"]));                                
                                prodEnt.nPrecio = Int32.Parse(Convert.ToString(dr["nPrecio"]));
                                prodEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);
                                prodEnt.nIdLote = Int32.Parse(Convert.ToString(dr["nIdLote"]));
                                prodEnt.dFechaFab = Convert.ToString(dr["dFechaFab"]);                                
                                prodEnt.dFechaVenc = Convert.ToString(dr["dFechaVenc"]);
                                

                                listaProductosId.Add(prodEnt);

                            }

                            return listaProductosId;
                        }


                    #endregion

                    #region 06. Insertar | 07. Actualizar | 08. Eliminar(Logica) -- Almacenes
                    case "06":
                    case "07":
                    case "08":


                        string sResultado = Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Productos", genEnt.sOpcion, genEnt.pParametro));
                        msj = sResultado;

                        return msj;
                    #endregion

                    default:
                        return null;
                }
            }
            catch (Exception exc4)
            {
                logger.Error(exc4);
                throw;
            }

        }
        #endregion


    }
}
