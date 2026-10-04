using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace Data
{
    public class PanelData : IPanelData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        #region Conexion
        private readonly Conexion oCon;
        public PanelData()
        {
            oCon = new Conexion(1);
        }
        #endregion


        #region Panel
        public async Task<object> DataPanel(GeneralEntity genEnt)
        {
            try
            {
                switch (genEnt.sOpcion)
                {
                    #region 01. Tarjetas de resumen
                    case "01":
                    {
                        List<EPanelResumen> listaResumen = new List<EPanelResumen>();

                        using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (await dr.ReadAsync())
                            {
                                EPanelResumen oEnt = new EPanelResumen();

                                oEnt.nAlmacenes = Convert.ToInt32(dr["nAlmacenes"]);
                                oEnt.nProductos = Convert.ToInt32(dr["nProductos"]);
                                oEnt.nCategorias = Convert.ToInt32(dr["nCategorias"]);
                                oEnt.nZonas = Convert.ToInt32(dr["nZonas"]);
                                oEnt.nValorInventario = Convert.ToDecimal(dr["nValorInventario"]);
                                oEnt.nUnidades = Convert.ToInt64(dr["nUnidades"]);
                                oEnt.nPorVencer30 = Convert.ToInt32(dr["nPorVencer30"]);
                                oEnt.nVencidos = Convert.ToInt32(dr["nVencidos"]);

                                listaResumen.Add(oEnt);
                            }
                        }

                        return listaResumen;
                    }
                    #endregion

                    #region 02. Existencias por almacen
                    case "02":
                    {
                        List<EPanelPorAlmacen> listaAlmacenes = new List<EPanelPorAlmacen>();

                        using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (await dr.ReadAsync())
                            {
                                EPanelPorAlmacen oEnt = new EPanelPorAlmacen();

                                oEnt.nIdAlmacen = Convert.ToInt32(dr["nIdAlmacen"]);
                                oEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                oEnt.sNombreZona = Convert.ToString(dr["sNombreZona"]);
                                oEnt.nProductos = Convert.ToInt32(dr["nProductos"]);
                                oEnt.nUnidades = Convert.ToInt64(dr["nUnidades"]);
                                oEnt.nValor = Convert.ToDecimal(dr["nValor"]);

                                listaAlmacenes.Add(oEnt);
                            }
                        }

                        return listaAlmacenes;
                    }
                    #endregion

                    #region 03. Existencias por categoria
                    case "03":
                    {
                        List<EPanelPorCategoria> listaCategorias = new List<EPanelPorCategoria>();

                        using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (await dr.ReadAsync())
                            {
                                EPanelPorCategoria oEnt = new EPanelPorCategoria();

                                oEnt.nIdCategoria = Convert.ToInt32(dr["nIdCategoria"]);
                                oEnt.sNombreCategoria = Convert.ToString(dr["sNombreCategoria"]);
                                oEnt.nProductos = Convert.ToInt32(dr["nProductos"]);
                                oEnt.nUnidades = Convert.ToInt64(dr["nUnidades"]);
                                oEnt.nValor = Convert.ToDecimal(dr["nValor"]);

                                listaCategorias.Add(oEnt);
                            }
                        }

                        return listaCategorias;
                    }
                    #endregion

                    #region 04. Proximos a vencer
                    case "04":
                    {
                        List<EPanelPorVencer> listaPorVencer = new List<EPanelPorVencer>();

                        using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (await dr.ReadAsync())
                            {
                                EPanelPorVencer oEnt = new EPanelPorVencer();

                                oEnt.nIdCatProd = Convert.ToInt32(dr["nIdCatProd"]);
                                oEnt.nIdProducto = Convert.ToInt32(dr["nIdProducto"]);
                                oEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                oEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                oEnt.sNombreCategoria = Convert.ToString(dr["sNombreCategoria"]);
                                oEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                oEnt.dFechaVenc = Convert.ToString(dr["dFechaVenc"]);
                                oEnt.nDiasRestantes = Convert.ToInt32(dr["nDiasRestantes"]);
                                oEnt.nCantidad = Convert.ToInt32(dr["nCantidad"]);
                                oEnt.sNombreUM = Convert.ToString(dr["sNombreUM"]);

                                listaPorVencer.Add(oEnt);
                            }
                        }

                        return listaPorVencer;
                    }
                    #endregion

                    default:
                        return null;
                }
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }
        #endregion

    }
}
