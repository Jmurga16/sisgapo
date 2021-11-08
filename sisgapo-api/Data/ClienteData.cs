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
    public class ClienteData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #region Conexion
        private readonly Conexion oCon;
        public ClienteData()
        {
            oCon = new Conexion(1);
        }
        #endregion



        #region Cliente
        public object DataCliente(GeneralEntity genEnt)
        {

            string msj = string.Empty;

            switch (genEnt.sOpcion)
            {
                #region 01. Lista de Clientes
                case "01":
                    try
                    {
                        List<EntListaClientes> listaClientes = new List<EntListaClientes>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Clientes", genEnt.sOpcion, genEnt.pParametro))
                        {
                            while (dr.Read())
                            {
                                EntListaClientes catEnt = new EntListaClientes();


                                catEnt.nIdCliente = Int32.Parse(Convert.ToString(dr["nIdCliente"]));
                                catEnt.sNombre = Convert.ToString(dr["sNombre"]);
                                catEnt.sEmail = Convert.ToString(dr["sEmail"]);
                                catEnt.nTelefono = Int32.Parse(Convert.ToString(dr["nTelefono"]));
                                catEnt.sDireccion = Convert.ToString(dr["sDireccion"]);
                                catEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);
                                
                                listaClientes.Add(catEnt);

                            }

                            return listaClientes;
                        }
                    }
                    catch (Exception e)
                    {
                        logger.Error(e);
                        throw;
                    }
                #endregion

                #region 02. Cliente por Id
                case "02":
                    try
                    {
                        List<EntListaClientes> listaClienteId = new List<EntListaClientes>();
                        using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Clientes", genEnt.sOpcion, genEnt.pParametro))
                        {

                            while (dr.Read())
                            {
                                EntListaClientes catEnt = new EntListaClientes();

                                catEnt.nIdCliente = Int32.Parse(Convert.ToString(dr["nIdCliente"]));
                                catEnt.sNombre = Convert.ToString(dr["sNombre"]);
                                catEnt.sEmail = Convert.ToString(dr["sEmail"]);
                                catEnt.nTelefono = Int32.Parse(Convert.ToString(dr["nTelefono"]));
                                catEnt.sDireccion = Convert.ToString(dr["sDireccion"]);
                                catEnt.sDescripcion = Convert.ToString(dr["sDescripcion"]);

                                listaClienteId.Add(catEnt);

                            }

                            return listaClienteId;
                        }
                    }
                    catch (Exception e)
                    {
                        logger.Error(e);
                        throw;
                    }
                #endregion

                #region 03. Insertar | 04. Actualizar | 05. Eliminar(Logica) -- Clientes
                case "03":
                case "04":                
                    try
                    {
                        string sResultado = Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Clientes", genEnt.sOpcion, genEnt.pParametro));

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
