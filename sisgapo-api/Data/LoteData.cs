using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class LoteData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #region Conexion
        private readonly Conexion oCon;

        public LoteData()
        {
            oCon = new Conexion(1);
        }
        #endregion

        #region Lote
        public object DataLote(GeneralEntity genEnt)
        {

            string msj = string.Empty;
            try
            {

                switch (genEnt.sOpcion)
                {

                    #region 01. Lista de Lotes
                    case "01":

                        List<EListaLotes> listaLotes = new List<EListaLotes>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Lotes", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaLotes lotEnt = new EListaLotes();

                                lotEnt.nIdDetProd = Int32.Parse(Convert.ToString(dr["nIdDetProd"]));
                                lotEnt.nIdProducto = Int32.Parse(Convert.ToString(dr["nIdProducto"]));
                                lotEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                lotEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                lotEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                lotEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                lotEnt.sNombreCategoria = Convert.ToString(dr["sNombreCategoria"]);
                                lotEnt.nIdLote = Int32.Parse(Convert.ToString(dr["nIdLote"]));
                                lotEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                lotEnt.dFechaFab = Convert.ToString(dr["dFechaFab"]);
                                lotEnt.dFechaVenc = Convert.ToString(dr["dFechaVenc"]);
                                lotEnt.nDiasRestantes = Int32.Parse(Convert.ToString(dr["nDiasRestantes"]));
                                lotEnt.nCantidad = Int32.Parse(Convert.ToString(dr["nCantidad"]));
                                lotEnt.sNombreUM = Convert.ToString(dr["sNombreUM"]);
                                lotEnt.nPrecio = Int32.Parse(Convert.ToString(dr["nPrecio"]));
                                lotEnt.sEstado = Convert.ToString(dr["sEstado"]);

                                listaLotes.Add(lotEnt);

                            }

                            return listaLotes;

                        }
                    #endregion

                    #region 02. Lote por Id
                    case "02":

                        List<EListaLotesById> listaLotesId = new List<EListaLotesById>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Lotes", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaLotesById lotEnt = new EListaLotesById();

                                lotEnt.nIdDetProd = Int32.Parse(Convert.ToString(dr["nIdDetProd"]));
                                lotEnt.nIdProducto = Int32.Parse(Convert.ToString(dr["nIdProducto"]));
                                lotEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                lotEnt.nIdLote = Int32.Parse(Convert.ToString(dr["nIdLote"]));
                                lotEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                lotEnt.dFechaFab = Convert.ToString(dr["dFechaFab"]);
                                lotEnt.dFechaVenc = Convert.ToString(dr["dFechaVenc"]);
                                lotEnt.nIdUnidadMedida = Int32.Parse(Convert.ToString(dr["nIdUnidadMedida"]));
                                lotEnt.nCantidad = Int32.Parse(Convert.ToString(dr["nCantidad"]));
                                lotEnt.nPrecio = Int32.Parse(Convert.ToString(dr["nPrecio"]));
                                lotEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);
                                lotEnt.bEstado = Convert.ToBoolean(dr["bEstado"]);

                                listaLotesId.Add(lotEnt);

                            }

                            return listaLotesId;

                        }
                    #endregion

                    #region 03. Insertar | 04. Actualizar | 05. Activar/Desactivar
                    case "03":
                    case "04":
                    case "05":

                        string sResultado = Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Lotes", genEnt.sOpcion, genEnt.pParametro));
                        msj = sResultado;

                        return msj;
                    #endregion

                    #region 06. Lista de Productos
                    case "06":

                        List<EListaProductoLote> listaProductos = new List<EListaProductoLote>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Lotes", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaProductoLote prodEnt = new EListaProductoLote();

                                prodEnt.nIdProducto = Int32.Parse(Convert.ToString(dr["nIdProducto"]));
                                prodEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                prodEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                prodEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);

                                listaProductos.Add(prodEnt);

                            }

                            return listaProductos;

                        }
                    #endregion

                    default:
                        return null;
                }
            }
            catch (Exception exc)
            {
                logger.Error(exc);
                throw;
            }

        }
        #endregion

    }
}
