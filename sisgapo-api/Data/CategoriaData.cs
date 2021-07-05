using Entity;
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
        #region Conexion
        private Conexion oCon;
        public CategoriaData()
        {
            oCon = new Conexion(1);
        }
        #endregion


        #region Categoria
        public object DataCategoria(GeneralEntity genEnt)
        {

            string msj = string.Empty;

            #region 01. Lista de Categorias
            if (genEnt.sOpcion == "01")
            {
                try
                {
                    List<E_ListaCategorias> listaCategorias = new List<E_ListaCategorias>();
                    using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Categorias", genEnt.sOpcion, genEnt.pParametro))
                    {
                        if (dr != null)
                        {
                            while (dr.Read())
                            {
                                E_ListaCategorias catEnt = new E_ListaCategorias();


                                catEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                catEnt.sNombre      = Convert.ToString(dr["sNombre"]);
                                catEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);
                                catEnt.sEstado      = Convert.ToString(dr["sEstado"]);


                                listaCategorias.Add(catEnt);

                            }
                        }
                        return listaCategorias;
                    }
                }
                catch (Exception)
                {
                    throw;
                }
            }
            #endregion


            #region 02. Categoria por Id
            if (genEnt.sOpcion == "02")
            {
                try
                {
                    List<E_ListaCategorias> listaCategorias = new List<E_ListaCategorias>();
                    using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Categorias", genEnt.sOpcion, genEnt.pParametro))
                    {
                        if (dr != null)
                        {
                            while (dr.Read())
                            {
                                E_ListaCategorias catEnt = new E_ListaCategorias();


                                catEnt.nIdCategoria = Int32.Parse(Convert.ToString(dr["nIdCategoria"]));
                                catEnt.sNombre      = Convert.ToString(dr["sNombre"]);
                                catEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);
                                catEnt.bEstado      = Boolean.Parse(Convert.ToString(dr["bEstado"]));

                                listaCategorias.Add(catEnt);

                            }
                        }
                        return listaCategorias;
                    }
                }
                catch (Exception)
                {
                    throw;
                }
            }
            #endregion



            #region 03. Insertar | 04. Actualizar | 05. Eliminar(Logica) -- Categorias
            else if (genEnt.sOpcion == "03" || genEnt.sOpcion == "04" || genEnt.sOpcion == "05")
            {
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
            }
            #endregion


            else
            {
                return null;
            }

        }
        #endregion


    }
}
