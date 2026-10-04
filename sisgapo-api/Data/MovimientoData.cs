using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace Data
{
    public class MovimientoData : IMovimientoData
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
        public async Task<object> DataMovimiento(GeneralEntity genEnt)
        {

            string msj = string.Empty;
            try
            {

                switch (genEnt.sOpcion)
                {

                    #region 01. Kardex
                    case "01":

                        List<EListaMovimientos> listaMovimientos = new List<EListaMovimientos>();

                        using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (await dr.ReadAsync())
                            {
                                EListaMovimientos movEnt = new EListaMovimientos();

                                movEnt.nIdMovimiento = Convert.ToInt32(dr["nIdMovimiento"]);
                                movEnt.nIdDetProd = Convert.ToInt32(dr["nIdDetProd"]);
                                movEnt.dFechaMov = Convert.ToString(dr["dFechaMov"]);
                                movEnt.sTipo = Convert.ToString(dr["sTipo"]);
                                movEnt.sTipoNombre = Convert.ToString(dr["sTipoNombre"]);
                                movEnt.nEntrada = Convert.ToInt32(dr["nEntrada"]);
                                movEnt.nSalida = Convert.ToInt32(dr["nSalida"]);
                                movEnt.nSaldo = Convert.ToInt32(dr["nSaldo"]);
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

                        string sResultado = Convert.ToString(await oCon.fnEjecutarEscalarAsync("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro));
                        msj = sResultado;

                        return msj;
                    #endregion

                    #region 03. Lista de Lotes
                    case "03":

                        List<EListaLoteMovimiento> listaLotes = new List<EListaLoteMovimiento>();

                        using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (await dr.ReadAsync())
                            {
                                EListaLoteMovimiento lotEnt = new EListaLoteMovimiento();

                                lotEnt.nIdDetProd = Convert.ToInt32(dr["nIdDetProd"]);
                                lotEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                lotEnt.nIdProducto = Convert.ToInt32(dr["nIdProducto"]);
                                lotEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                lotEnt.nIdAlmacen = Convert.ToInt32(dr["nIdAlmacen"]);
                                lotEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                lotEnt.nCantidad = Convert.ToInt32(dr["nCantidad"]);
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

                        using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Movimientos", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (await dr.ReadAsync())
                            {
                                EResumenMovimientos resEnt = new EResumenMovimientos();

                                resEnt.nMovimientos = Convert.ToInt32(dr["nMovimientos"]);
                                resEnt.nEntradas = Convert.ToInt32(dr["nEntradas"]);
                                resEnt.nSalidas = Convert.ToInt32(dr["nSalidas"]);
                                resEnt.nAjustes = Convert.ToInt32(dr["nAjustes"]);

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
