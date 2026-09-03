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
    public class MovimientoData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #region Conexion
        private readonly Conexion oCon;

        public MovimientoData()
        {
            oCon = new Conexion(1);
        }
        #endregion

        #region Movimiento
        public object DataMovimiento(GeneralEntity genEnt)
        {

            string msj = string.Empty;
            try
            {

                switch (genEnt.sOpcion)
                {

                    #region 01. Kardex
                    case "01":

                        List<EListaMovimientos> listaMovimientos = new List<EListaMovimientos>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaMovimientos movEnt = new EListaMovimientos();

                                movEnt.nIdMovimiento = Int32.Parse(Convert.ToString(dr["nIdMovimiento"]));
                                movEnt.nIdDetProd = Int32.Parse(Convert.ToString(dr["nIdDetProd"]));
                                movEnt.dFechaMov = Convert.ToString(dr["dFechaMov"]);
                                movEnt.sTipo = Convert.ToString(dr["sTipo"]);
                                movEnt.sTipoNombre = Convert.ToString(dr["sTipoNombre"]);
                                movEnt.nEntrada = Int32.Parse(Convert.ToString(dr["nEntrada"]));
                                movEnt.nSalida = Int32.Parse(Convert.ToString(dr["nSalida"]));
                                movEnt.nSaldo = Int32.Parse(Convert.ToString(dr["nSaldo"]));
                                movEnt.sMotivo = Convert.ToString(dr["sMotivo"]);
                                movEnt.sNombrePersona = Convert.ToString(dr["sNombrePersona"]);
                                movEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                movEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                movEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                movEnt.sNombreUM = Convert.ToString(dr["sNombreUM"]);

                                listaMovimientos.Add(movEnt);

                            }

                            return listaMovimientos;

                        }
                    #endregion

                    #region 02. Registrar movimiento
                    case "02":

                        string sResultado = Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro));
                        msj = sResultado;

                        return msj;
                    #endregion

                    #region 03. Lista de Lotes
                    case "03":

                        List<EListaLoteMovimiento> listaLotes = new List<EListaLoteMovimiento>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EListaLoteMovimiento lotEnt = new EListaLoteMovimiento();

                                lotEnt.nIdDetProd = Int32.Parse(Convert.ToString(dr["nIdDetProd"]));
                                lotEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                lotEnt.nIdProducto = Int32.Parse(Convert.ToString(dr["nIdProducto"]));
                                lotEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                lotEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                lotEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                lotEnt.nCantidad = Int32.Parse(Convert.ToString(dr["nCantidad"]));
                                lotEnt.sNombreUM = Convert.ToString(dr["sNombreUM"]);
                                lotEnt.dFechaVenc = Convert.ToString(dr["dFechaVenc"]);

                                listaLotes.Add(lotEnt);

                            }

                            return listaLotes;

                        }
                    #endregion

                    #region 04. Totales del kardex
                    case "04":

                        List<EResumenMovimientos> listaResumen = new List<EResumenMovimientos>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EResumenMovimientos resEnt = new EResumenMovimientos();

                                resEnt.nMovimientos = Int32.Parse(Convert.ToString(dr["nMovimientos"]));
                                resEnt.nEntradas = Int32.Parse(Convert.ToString(dr["nEntradas"]));
                                resEnt.nSalidas = Int32.Parse(Convert.ToString(dr["nSalidas"]));
                                resEnt.nAjustes = Int32.Parse(Convert.ToString(dr["nAjustes"]));

                                listaResumen.Add(resEnt);

                            }

                            return listaResumen;

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
