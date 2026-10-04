using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace Data
{
    public class UsuarioData : IUsuarioData
    {
        private readonly Conexion conexion = new Conexion(1);
        private readonly Logger logger = LogManager.GetCurrentClassLogger();



        #region Obtener Todos los usuarios
        public async Task<object> LIS_UsuarioData(GeneralEntity erp)
        {

            SqlConnection conn = null;

            try
            {
                if (erp.sOpcion == "04" || erp.sOpcion == "05" || erp.sOpcion == "06")
                {
                    return await conexion.fnEjecutarEscalarAsync("USP_MNT_Usuarios", erp.sOpcion, erp.pParametro);
                }

                List<EntListaUsuarios> lstUsuarios = new List<EntListaUsuarios>();
                List<EntListaUsuarioId> unitUsuario = new List<EntListaUsuarioId>();

                conn = await conexion.fnAbrirConexionAsync();

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

                return null;
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
