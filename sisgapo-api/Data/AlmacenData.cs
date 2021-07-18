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

        List<EListaAlmacenes> listaAlmacenes = new List<EListaAlmacenes>();
        List<EListaAlmacenId> listaAlmacenId = new List<EListaAlmacenId>();

        #region Almacen
        public object DataAlmacen(GeneralEntity genEnt)
        {

            string msj = string.Empty;
            try
            {
                            
                switch (genEnt.sOpcion)
                {
              
                    #region 01. Lista de Almacenes
                    case "01":
                                                    
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                        
                                while (dr.Read())
                                {
                                    EListaAlmacenes almEnt = new EListaAlmacenes();


                                    almEnt.nIdAlmacen = Int32.Parse(Convert.ToString(dr["nIdAlmacen"]));
                                    almEnt.sNombreZona = Convert.ToString(dr["sNombreZona"]);
                                    almEnt.sNombreAlmacen = Convert.ToString(dr["sNombreAlmacen"]);
                                    almEnt.sEstado = Convert.ToString(dr["sEstado"]);


                                    listaAlmacenes.Add(almEnt);

                                }
                        
                            return listaAlmacenes;
                        
                        }
                    #endregion
                    
                    #region 02. Almacen por Id
                    case "02":
                      
                       using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
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

                               listaAlmacenId.Add(almEnt);

                               }
                       
                           return listaAlmacenId;
                       }
                       
                    #endregion

                    #region 03. Lista de Zonas
                    case "03":
                       
                       List<EListaZonas> listaZonas = new List<EListaZonas>();
                       using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                       {
                       
                               while (dr.Read())
                               {
                                   EListaZonas zonEnt = new EListaZonas();

                                   zonEnt.nIdZona = Int32.Parse(Convert.ToString(dr["nIdZona"]));
                                   zonEnt.sNombreZona = Convert.ToString(dr["sNombreZona"]);

                                   listaZonas.Add(zonEnt);

                               }
                       
                           return listaZonas;
                       }
                       
                        
                    #endregion

                    #region 04. Lista de Supervisores
                    case "04":
                       
                       List<EListaSupervisores> listaSupervisores = new List<EListaSupervisores>();
                       using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                       {                         
                               while (dr.Read())
                               {
                                   EListaSupervisores almEnt = new EListaSupervisores();

                                   almEnt.nIdSupervisor = Int32.Parse(Convert.ToString(dr["nIdSupervisor"]));
                                   almEnt.sNombrePersona = Convert.ToString(dr["sNombrePersona"]);

                                   listaSupervisores.Add(almEnt);

                               }
                       
                           return listaSupervisores;
                       }
                                        
                    #endregion

                    #region 05. Insertar | 06. Actualizar | 07. Eliminar(Logica) -- Almacenes
                    case "05": case "06": case "07":
                        
                        string sResultado = Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro));
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
