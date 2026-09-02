using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;

namespace Data
{
    public class PanelData
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
        public object DataPanel(GeneralEntity genEnt)
        {
            try
            {
                switch (genEnt.sOpcion)
                {
                    #region 01. Tarjetas de resumen
                    case "01":
                    {
                        List<EPanelResumen> listaResumen = new List<EPanelResumen>();

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (dr.Read())
                            {
                                EPanelResumen oEnt = new EPanelResumen();

                                oEnt.nAlmacenes = Int32.Parse(Convert.ToString(dr["nAlmacenes"]));
                                oEnt.nProductos = Int32.Parse(Convert.ToString(dr["nProductos"]));
                                oEnt.nCategorias = Int32.Parse(Convert.ToString(dr["nCategorias"]));
                                oEnt.nZonas = Int32.Parse(Convert.ToString(dr["nZonas"]));
                                oEnt.nValorInventario = Int64.Parse(Convert.ToString(dr["nValorInventario"]));
                                oEnt.nUnidades = Int64.Parse(Convert.ToString(dr["nUnidades"]));
                                oEnt.nPorVencer30 = Int32.Parse(Convert.ToString(dr["nPorVencer30"]));
                                oEnt.nVencidos = Int32.Parse(Convert.ToString(dr["nVencidos"]));

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

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (dr.Read())
                            {
                                EPanelPorAlmacen oEnt = new EPanelPorAlmacen();

                                oEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                oEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                oEnt.sNombreZona = Convert.ToString(dr["sNombreZona"]);
                                oEnt.nProductos = Int32.Parse(Convert.ToString(dr["nProductos"]));
                                oEnt.nUnidades = Int64.Parse(Convert.ToString(dr["nUnidades"]));
                                oEnt.nValor = Int64.Parse(Convert.ToString(dr["nValor"]));

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

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (dr.Read())
                            {
                                EPanelPorCategoria oEnt = new EPanelPorCategoria();

                                oEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                oEnt.sNombreCategoria = Convert.ToString(dr["sNombreCategoria"]);
                                oEnt.nProductos = Int32.Parse(Convert.ToString(dr["nProductos"]));
                                oEnt.nUnidades = Int64.Parse(Convert.ToString(dr["nUnidades"]));
                                oEnt.nValor = Int64.Parse(Convert.ToString(dr["nValor"]));

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

                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Panel", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (dr.Read())
                            {
                                EPanelPorVencer oEnt = new EPanelPorVencer();

                                oEnt.nIdCatProd = Int32.Parse(Convert.ToString(dr["nIdCatProd"]));
                                oEnt.nIdProducto = Int32.Parse(Convert.ToString(dr["nIdProducto"]));
                                oEnt.sNombreProducto = Convert.ToString(dr["sNombreProducto"]);
                                oEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                oEnt.sNombreCategoria = Convert.ToString(dr["sNombreCategoria"]);
                                oEnt.sNombreLote = Convert.ToString(dr["sNombreLote"]);
                                oEnt.dFechaVenc = Convert.ToString(dr["dFechaVenc"]);
                                oEnt.nDiasRestantes = Int32.Parse(Convert.ToString(dr["nDiasRestantes"]));
                                oEnt.nCantidad = Int32.Parse(Convert.ToString(dr["nCantidad"]));
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
