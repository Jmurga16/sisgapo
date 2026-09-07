using Entity;
using Microsoft.Extensions.Configuration;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using System.IO;
using System.Threading.Tasks;

namespace Data
{
    public class UsuarioData : IUsuarioData
    {
        private string conf;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        public string ConfConexion()
        {
            conf = ConfiguracionBD.sCadenaConexion;
            return conf;
        }



        #region Obtener Todos los usuarios
        public async Task<object> LIS_UsuarioData(GeneralEntity erp)
        {

            SqlConnection conn = null;

            try
            {

                List<EntListaUsuarios> lstUsuarios = new List<EntListaUsuarios>();
                List<EntListaUsuarioId> unitUsuario = new List<EntListaUsuarioId>();
                String strResultado = "";

                ConfConexion();

                conn = new SqlConnection(conf);
                await conn.OpenAsync();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", erp.sOpcion));
                _Command.Parameters.Add(new SqlParameter("@pParametro", erp.pParametro));
               

                #region Listar Todo || Listar con Filtro
                if (erp.sOpcion == "01" || erp.sOpcion == "02")
                {
                    SqlDataReader reader = await _Command.ExecuteReaderAsync();

                    while (await reader.ReadAsync())
                    {
                        EntListaUsuarios usrEnt = new EntListaUsuarios();

                        usrEnt.nIdUsuario = Convert.ToInt32(reader["nIdUsuario"]);
                        usrEnt.sNombrePersona = reader["sNombrePersona"].ToString();
                        usrEnt.sNombreUsuario = reader["sNombreUsuario"].ToString();
                        usrEnt.sNombreRol = reader["sNombreRol"].ToString();
                        usrEnt.sEstado = reader["sEstado"].ToString();


                        lstUsuarios.Add(usrEnt);
                    }

                    return lstUsuarios;
                }
                #endregion
                               

                #region Listar por Id
                if (erp.sOpcion == "03")
                {
                    SqlDataReader reader = await _Command.ExecuteReaderAsync();

                    while (await reader.ReadAsync())
                    {
                        EntListaUsuarioId usrEntId = new EntListaUsuarioId();
                                               
                        usrEntId.sNombres     = reader["sNombres"].ToString();
                        usrEntId.sApellidos   = reader["sApellidos"].ToString();
                        usrEntId.nTipoDoc     = Convert.ToInt32(reader["nTipoDoc"]);
                        usrEntId.sNumDoc      = reader["sNumDoc"].ToString();
                        usrEntId.sSexo        = reader["sSexo"].ToString();
                        usrEntId.nIdRol       = Convert.ToInt32(reader["nRol"]);
                        usrEntId.sDireccion   = reader["sDireccion"].ToString();
                        usrEntId.sTelefono    = reader["sTelefono"].ToString();
                        usrEntId.sNombreUsuario = reader["sNombreUsuario"].ToString();
                        usrEntId.dFechaNac    = reader["dFechaNac"].ToString();
                        usrEntId.dFechaNacimiento = Convert.ToDateTime(reader["dFechaNacimiento"]);

                        unitUsuario.Add(usrEntId);
                    }

                    return unitUsuario;
                }
                #endregion

                #region 04:Insertar | 05:Actualizar
                else if (erp.sOpcion == "04" || erp.sOpcion == "05" || erp.sOpcion == "06")
                {

                    if (await _Command.ExecuteNonQueryAsync() != 0)
                    {
                        strResultado = "OK";

                    }

                    return strResultado;

                }
                #endregion

                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                logger.Error(ex);
                throw;
            }
            finally
            {
                conn?.Dispose();
            }

        }
        #endregion


    }
}
