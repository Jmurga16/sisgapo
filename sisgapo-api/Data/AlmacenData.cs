using Entity;
using Microsoft.Extensions.Configuration;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class AlmacenData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #region Conexion
        private readonly Conexion oCon;
        
        public AlmacenData()
        {
            oCon = new Conexion(1);
        }
        #endregion


        #region Almacen
        public object DataAlmacen(GeneralEntity genEnt)
        {

            string msj = string.Empty;

            switch (genEnt.sOpcion)
            {
                #region 01. Lista de Almacenes
                case "01":
                    try
                    {
                        List<EListaAlmacenes> listaAlmacenes = new List<EListaAlmacenes>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null) { 
                                while (dr.Read())
                                {
                                    EListaAlmacenes almEnt = new EListaAlmacenes();


                                    almEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                    almEnt.sNombreZona = Convert.ToString(dr["sNombreZona"]);
                                    almEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                    almEnt.sEstado = Convert.ToString(dr["sEstado"]);


                                    listaAlmacenes.Add(almEnt);

                                }
                            }
                            return listaAlmacenes;
                            
                        }
                        
                    }
                    catch (Exception exc1)
                    {
                        logger.Error(exc1);
                        throw;
                    }
                #endregion
                    
                #region 02. Almacen por Id
                case "02":
                    try
                    {
                        List<EListaAlmacenId> listaAlmacenes = new List<EListaAlmacenId>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null)
                            {
                                while (dr.Read())
                                {
                                    EListaAlmacenId almEnt = new EListaAlmacenId();

                                    almEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                    almEnt.sNombre = Convert.ToString(dr["sNombre"]);
                                    almEnt.sDireccion = Convert.ToString(dr["sDireccion"]);
                                    almEnt.nIdZona = Int32.Parse(Convert.ToString(dr["nIdZona"]));
                                    almEnt.bEstado = Boolean.Parse(Convert.ToString(dr["bEstado"]));
                                    almEnt.nIdSupervisor = Int32.Parse(Convert.ToString(dr["nIdSupervisor"]));

                                    listaAlmacenes.Add(almEnt);

                                }
                            }
                            return listaAlmacenes;
                        }
                    }
                    catch (Exception exc2)
                    {
                        logger.Error(exc2);
                        throw;
                    }
                #endregion

                #region 03. Lista de Zonas
                case "03":
                    try
                    {
                        List<EListaZonas> listaZonas = new List<EListaZonas>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null)
                            {
                                while (dr.Read())
                                {
                                    EListaZonas zonEnt = new EListaZonas();

                                    zonEnt.nIdZona = Int32.Parse(Convert.ToString(dr["nIdZona"]));
                                    zonEnt.sNombreZona = Convert.ToString(dr["sNombreZona"]);

                                    listaZonas.Add(zonEnt);

                                }
                            }
                            return listaZonas;
                        }
                    }
                    catch (Exception exc3)
                    {
                        logger.Error(exc3);
                        throw;
                    }
                #endregion

                #region 04. Lista de Supervisores
                case "04":
                    try
                    {
                        List<EListaSupervisores> listaSupervisores = new List<EListaSupervisores>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null)
                            {
                                while (dr.Read())
                                {
                                    EListaSupervisores almEnt = new EListaSupervisores();

                                    almEnt.nIdSupervisor = Int32.Parse(Convert.ToString(dr["nIdSupervisor"]));
                                    almEnt.sNombrePersona = Convert.ToString(dr["sNombrePersona"]);

                                    listaSupervisores.Add(almEnt);

                                }
                            }
                            return listaSupervisores;
                        }
                    }
                    catch (Exception exc4)
                    {
                        logger.Error(exc4);
                        throw;
                    }
                #endregion

                #region 05. Insertar | 06. Actualizar | 07. Eliminar(Logica) -- Almacenes
                case "05": case "06": case "07":
                    try
                    {
                        string sResultado = Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro));
                        msj = sResultado;
                    }
                    catch (Exception ex)
                    {
                        msj = ex.Message;
                    }
                    return msj;
                #endregion

                default:
                    return null;
            }                    

        }
        #endregion

        //public object opcion(IDataReader dr)
        //{

        //}


    }
}
