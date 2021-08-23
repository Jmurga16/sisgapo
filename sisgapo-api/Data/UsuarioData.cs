using Entity;
using Microsoft.Extensions.Configuration;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;

namespace Data
{
    public class UsuarioData
    {
        private string conf;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        public string ConfConexion()
        {

            //Construir la conexión
            try
            {
                var builder = new ConfigurationBuilder()
             .SetBasePath(Directory.GetCurrentDirectory())
             .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

                IConfiguration configuration = builder.Build();
                conf = configuration["ConnectionStrings:connectionString"];
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
            return conf;
        }



        #region Obtener Todos los usuarios
        public object LIS_UsuarioData(UsuarioEntity erp)
        {
                        
            try
            {

                List<EntListaUsuarios> lstUsuarios = new List<EntListaUsuarios>();
                List<EntListaUsuarioId> unitUsuario = new List<EntListaUsuarioId>();
                String strResultado = "";

                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", erp.sOpcion));
                _Command.Parameters.Add(new SqlParameter("@pParametro", erp.pParametro));
               

                #region Listar Todo || Listar con Filtro
                if (erp.sOpcion == "01" || erp.sOpcion == "02")
                {
                    SqlDataReader reader = _Command.ExecuteReader();

                    while (reader.Read())
                    {
                        EntListaUsuarios usrEnt = new EntListaUsuarios();

                        usrEnt.nIdUsuario = Convert.ToInt32(reader["nIdUsuario"]);
                        usrEnt.sNombrePersona = reader["sNombrePersona"].ToString();
                        usrEnt.sNombreUsuario = reader["sNombreUsuario"].ToString();
                        usrEnt.sNombreRol = reader["sNombreRol"].ToString();
                        usrEnt.sEstado = reader["sEstado"].ToString();


                        lstUsuarios.Add(usrEnt);
                    }

                    conn.Close();

                    return lstUsuarios;
                }
                #endregion
                               

                #region Listar por Id
                if (erp.sOpcion == "03")
                {
                    SqlDataReader reader = _Command.ExecuteReader();

                    while (reader.Read())
                    {
                        EntListaUsuarioId usrEntId = new EntListaUsuarioId();
                                               
                        usrEntId.sNombres     = reader["sNombres"].ToString();
                        usrEntId.sApellidos   = reader["sApellidos"].ToString();
                        usrEntId.nTipoDoc     = Convert.ToInt32(reader["nTipoDoc"]);
                        usrEntId.sNumDoc      = reader["sNumDoc"].ToString();
                        usrEntId.sSexo        = reader["sSexo"].ToString();
                        usrEntId.nIdRol       = Convert.ToInt32(reader["nRol"]);
                        usrEntId.sDireccion   = reader["sDireccion"].ToString();
                        usrEntId.nTelefono    = Convert.ToInt32(reader["nTelefono"]);
                        usrEntId.sContrasenia = reader["sContrasenia"].ToString();
                        usrEntId.dFechaNac    = reader["dFechaNac"].ToString();
                        usrEntId.dFechaNacimiento = Convert.ToDateTime(reader["dFechaNacimiento"]);

                        unitUsuario.Add(usrEntId);
                    }

                    conn.Close();

                    return unitUsuario;
                }
                #endregion

                #region 04:Insertar | 05:Actualizar
                else if (erp.sOpcion == "04" || erp.sOpcion == "05" || erp.sOpcion == "06")
                {

                    if (_Command.ExecuteNonQuery() != 0)
                    {
                        strResultado = "OK";
                        
                    }
                    conn.Close();

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
            

        }
        #endregion


    }
}
