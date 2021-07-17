using Entity;
using Microsoft.Extensions.Configuration;
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
                        List<E_ListaAlmacenes> listaAlmacenes = new List<E_ListaAlmacenes>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null)
                            {
                                while (dr.Read())
                                {
                                    E_ListaAlmacenes almEnt = new E_ListaAlmacenes();


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
                    catch (Exception)
                    {
                        throw;
                    }
                #endregion
                    
                #region 02. Almacen por Id
                case "02":
                    try
                    {
                        List<E_ListaAlmacenId> listaAlmacenes = new List<E_ListaAlmacenId>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null)
                            {
                                while (dr.Read())
                                {
                                    E_ListaAlmacenId almEnt = new E_ListaAlmacenId();

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
                    catch (Exception)
                    {
                        throw;
                    }
                #endregion

                #region 03. Lista de Zonas
                case "03":
                    try
                    {
                        List<E_ListaZonas> listaZonas = new List<E_ListaZonas>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null)
                            {
                                while (dr.Read())
                                {
                                    E_ListaZonas zonEnt = new E_ListaZonas();

                                    zonEnt.nIdZona = Int32.Parse(Convert.ToString(dr["nIdZona"]));
                                    zonEnt.sNombreZona = Convert.ToString(dr["sNombreZona"]);

                                    listaZonas.Add(zonEnt);

                                }
                            }
                            return listaZonas;
                        }
                    }
                    catch (Exception)
                    {
                        throw;
                    }
                #endregion

                #region 04. Lista de Supervisores
                case "04":
                    try
                    {
                        List<E_ListaSupervisores> listaSupervisores = new List<E_ListaSupervisores>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Almacenes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            if (dr != null)
                            {
                                while (dr.Read())
                                {
                                    E_ListaSupervisores almEnt = new E_ListaSupervisores();

                                    almEnt.nIdSupervisor = Int32.Parse(Convert.ToString(dr["nIdSupervisor"]));
                                    almEnt.sNombrePersona = Convert.ToString(dr["sNombrePersona"]);

                                    listaSupervisores.Add(almEnt);

                                }
                            }
                            return listaSupervisores;
                        }
                    }
                    catch (Exception)
                    {
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


    }
}
