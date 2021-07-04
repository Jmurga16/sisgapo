using Entity;
using Microsoft.Extensions.Configuration;
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
            catch (Exception)
            {

                throw;
            }
            return conf;
        }



        #region Obtener Todos los usuarios
        public object LIS_UsuarioData(UsuarioEntity erp)
        {
                        
            try
            {

                List<E_ListaUsuarios> lstUsuarios = new List<E_ListaUsuarios>();
                List<E_ListaUsuarioId> unitUsuario = new List<E_ListaUsuarioId>();
                String strResultado = "";

                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", erp.sOpcion));
                _Command.Parameters.Add(new SqlParameter("@pParametro", erp.pParametro));
                //_Command.Parameters.Clear();

                #region Listar Todo
                if (erp.sOpcion == "01")
                {
                    SqlDataReader reader = _Command.ExecuteReader();

                    while (reader.Read())
                    {
                        E_ListaUsuarios usrEnt = new E_ListaUsuarios();

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

                #region Listar Filtros
                if (erp.sOpcion == "02")
                {
                    SqlDataReader reader = _Command.ExecuteReader();

                    while (reader.Read())
                    {
                        E_ListaUsuarios usrEnt = new E_ListaUsuarios();

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
                        E_ListaUsuarioId usrEnt = new E_ListaUsuarioId();
                                               
                        usrEnt.sNombres     = reader["sNombres"].ToString();
                        usrEnt.sApellidos   = reader["sApellidos"].ToString();
                        usrEnt.nTipoDoc     = Convert.ToInt32(reader["nTipoDoc"]);
                        usrEnt.sNumDoc      = reader["sNumDoc"].ToString();
                        usrEnt.sSexo        = reader["sSexo"].ToString();
                        usrEnt.nIdRol       = Convert.ToInt32(reader["nRol"]);
                        usrEnt.sDireccion   = reader["sDireccion"].ToString();
                        usrEnt.nTelefono    = Convert.ToInt32(reader["nTelefono"]);
                        usrEnt.sContrasenia = reader["sContrasenia"].ToString();


                        unitUsuario.Add(usrEnt);
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
                throw new Exception(ex.Message, ex);
            }
            

        }
        #endregion


        #region Comentada
        /*
        #region Obtener un usuario por id
        public List<UsuarioEntity> LIS_UsuarioUnicoData(int id_usuario)
        {

            List<UsuarioEntity> lstUsuarios = new List<UsuarioEntity>();

            try
            {
                string cOpcion = "06";
                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
                _Command.Parameters.Add(new SqlParameter("@nId_usuario", id_usuario));
                //_Command.Parameters.Clear();

                SqlDataReader reader = _Command.ExecuteReader();

                while (reader.Read())
                {
                    UsuarioEntity libEnt = new UsuarioEntity();

                    libEnt.Id_usuario = Convert.ToInt32(reader["Id_usuario"]);
                    libEnt.descripcion = reader["descripcion"].ToString();
                    libEnt.asignatura = reader["asignatura"].ToString();
                    libEnt.stock = Convert.ToInt32(reader["stock"]);


                    lstUsuarios.Add(libEnt);
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return lstUsuarios;
        }
        #endregion

        #region Obtener usuario por filtros
        public List<UsuarioEntity> LIS_UsuarioFiltroData(UsuarioEntity objUsuarioEnt)
        {

            List<UsuarioEntity> lstUsuarios = new List<UsuarioEntity>();

            try
            {
                string cOpcion = "03";
                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
                //_Command.Parameters.Add(new SqlParameter("@nId_asig", objUsuarioEnt.nId_asig));
                _Command.Parameters.Add(new SqlParameter("@cDescripcion", objUsuarioEnt.cDescripcion));
                _Command.Parameters.Add(new SqlParameter("@cAsignatura", objUsuarioEnt.cAsignatura));
                _Command.Parameters.Add(new SqlParameter("@bStock", objUsuarioEnt.bStock));
                //_Command.Parameters.Clear();

                SqlDataReader reader = _Command.ExecuteReader();

                while (reader.Read())
                {
                    UsuarioEntity libEnt = new UsuarioEntity();

                    libEnt.Id_usuario = Convert.ToInt32(reader["Id_usuario"]);
                    libEnt.descripcion = reader["descripcion"].ToString();
                    libEnt.asignatura = reader["asignatura"].ToString();
                    libEnt.stock = Convert.ToInt32(reader["stock"]);


                    lstUsuarios.Add(libEnt);
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return lstUsuarios;
        }
        #endregion

        #region Crear usuario
        public String CREATE_UsuarioData(UsuarioEntity objUsuarioEnt)
        {
            String strResultado = "";
            string cOpcion = "01";
            try
            {
                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);

                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
                _Command.Parameters.Add(new SqlParameter("@nId_asig", objUsuarioEnt.nId_asig));
                _Command.Parameters.Add(new SqlParameter("@cDescripcion", objUsuarioEnt.cDescripcion));
                _Command.Parameters.Add(new SqlParameter("@nStock", objUsuarioEnt.nStock));

                if (_Command.ExecuteNonQuery() != 0)
                {
                    strResultado = "OK";
                    //return strResultado;
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                strResultado = "";
                throw new Exception(ex.Message, ex);
            }

            return strResultado;
        }
        #endregion

        #region Actualizar usuario
        public String UPDATE_UsuarioData(int id_usuario, UsuarioEntity objUsuarioEnt)
        {
            String strResultado = "";
            string cOpcion = "04";
            try
            {
                ConfConexion();
                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);

                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
                _Command.Parameters.Add(new SqlParameter("@nId_usuario", id_usuario));
                _Command.Parameters.Add(new SqlParameter("@nId_asig", objUsuarioEnt.nId_asig));
                _Command.Parameters.Add(new SqlParameter("@cDescripcion", objUsuarioEnt.cDescripcion));
                _Command.Parameters.Add(new SqlParameter("@nStock", objUsuarioEnt.nStock));

                if (_Command.ExecuteNonQuery() != 0)
                {
                    strResultado = "OK";
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                strResultado = "";
                throw new Exception(ex.Message, ex);
            }

            return strResultado;
        }
        #endregion

        #region Eliminar usuario
        public bool DELETE_UsuarioData(int id_usuario)
        {
            string cOpcion = "05";
            bool res;
            try
            {
                ConfConexion();
                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);

                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
                _Command.Parameters.Add(new SqlParameter("@nId_usuario", id_usuario));

                if (_Command.ExecuteNonQuery() != 0)
                {
                    res = true;
                }
                else
                {
                    res = false;
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                res = false;
                throw new Exception(ex.Message, ex);
            }

            return res;
        }
        #endregion

        */
        #endregion

    }
}
