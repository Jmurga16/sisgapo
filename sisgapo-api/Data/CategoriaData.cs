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
    public class CategoriaData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #region Conexion
        private readonly Conexion oCon;
        public CategoriaData()
        {
            oCon = new Conexion(1);
        }
        #endregion

       

        #region Categoria
        public object DataCategoria(GeneralEntity genEnt)
        {

            string msj = string.Empty;

            switch (genEnt.sOpcion)
            {
                #region 01. Lista de Categorias
                case "01":
                    try
                    {
                        List<EntListaCategorias> listaCategorias = new List<EntListaCategorias>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Categorias", genEnt.sOpcion, genEnt.pParametro))
                        {
                                while (dr.Read())
                                {
                                    EntListaCategorias catEnt = new EntListaCategorias();


                                    catEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                    catEnt.sNombre = Convert.ToString(dr["sNombre"]);
                                    catEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);
                                    catEnt.sEstado = Convert.ToString(dr["sEstado"]);


                                    listaCategorias.Add(catEnt);

                                }
                            
                            return listaCategorias;
                        }
                    }
                    catch (Exception e)
                    {
                        logger.Error(e);
                        throw;
                    }
                #endregion

                #region 02. Categoria por Id
                case "02":
                    try
                    {
                        List<EntListaCategorias> listaCategoriaId = new List<EntListaCategorias>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Categorias", genEnt.sOpcion, genEnt.pParametro))
                        {
                            
                            while(dr.Read())
                            {
                                EntListaCategorias catEnt = new EntListaCategorias();

                                catEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                catEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);
                                catEnt.sNombre = Convert.ToString(dr["sNombre"]);                                
                                catEnt.bEstado = Boolean.Parse(Convert.ToString(dr["bEstado"]));

                                listaCategoriaId.Add(catEnt);

                            } 
                 
                            return listaCategoriaId;
                        }
                    }
                    catch (Exception e)
                    {
                        logger.Error(e);
                        throw;
                    }
                #endregion

                #region 03. Insertar | 04. Actualizar | 05. Eliminar(Logica) -- Categorias
                case "03":
                case "04":
                case "05":
                    try
                    {
                        string sResultado = Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Categorias", genEnt.sOpcion, genEnt.pParametro));
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