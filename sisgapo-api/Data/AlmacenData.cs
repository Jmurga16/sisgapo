using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class AlmacenData
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


        //#region Obtener Todos los almacens
        //public List<AlmacenEntity> LIS_AlmacenData(E_Request_Almacen erp)
        //{

        //    List<AlmacenEntity> lstAlmacens = new List<AlmacenEntity>();

        //    try
        //    {
        //        string cOpcion = "02";
        //        ConfConexion();

        //        var conn = new SqlConnection(conf);
        //        conn.Open();

        //        SqlCommand _Command = new SqlCommand("USP_MNT_Almacens", conn);
        //        _Command.CommandType = CommandType.StoredProcedure;
        //        _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
        //        //_Command.Parameters.Clear();

        //        SqlDataReader reader = _Command.ExecuteReader();

        //        while (reader.Read())
        //        {
        //            AlmacenEntity libEnt = new AlmacenEntity();

        //            libEnt.Id_almacen = Convert.ToInt32(reader["Id_almacen"]);
        //            libEnt.descripcion = reader["descripcion"].ToString();
        //            libEnt.asignatura = reader["asignatura"].ToString();
        //            libEnt.stock = Convert.ToInt32(reader["stock"]);


        //            lstAlmacens.Add(libEnt);
        //        }

        //        conn.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception(ex.Message, ex);
        //    }

        //    return lstAlmacens;
        //}
        //#endregion

        //#region Obtener un almacen por id
        //public List<AlmacenEntity> LIS_AlmacenUnicoData(int id_almacen)
        //{

        //    List<AlmacenEntity> lstAlmacens = new List<AlmacenEntity>();

        //    try
        //    {
        //        string cOpcion = "06";
        //        ConfConexion();

        //        var conn = new SqlConnection(conf);
        //        conn.Open();

        //        SqlCommand _Command = new SqlCommand("USP_MNT_Almacens", conn);
        //        _Command.CommandType = CommandType.StoredProcedure;
        //        _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
        //        _Command.Parameters.Add(new SqlParameter("@nId_almacen", id_almacen));
        //        //_Command.Parameters.Clear();

        //        SqlDataReader reader = _Command.ExecuteReader();

        //        while (reader.Read())
        //        {
        //            AlmacenEntity libEnt = new AlmacenEntity();

        //            libEnt.Id_almacen = Convert.ToInt32(reader["Id_almacen"]);
        //            libEnt.descripcion = reader["descripcion"].ToString();
        //            libEnt.asignatura = reader["asignatura"].ToString();
        //            libEnt.stock = Convert.ToInt32(reader["stock"]);


        //            lstAlmacens.Add(libEnt);
        //        }

        //        conn.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception(ex.Message, ex);
        //    }

        //    return lstAlmacens;
        //}
        //#endregion

        //#region Obtener almacen por filtros
        //public List<AlmacenEntity> LIS_AlmacenFiltroData(AlmacenEntity objAlmacenEnt)
        //{

        //    List<AlmacenEntity> lstAlmacens = new List<AlmacenEntity>();

        //    try
        //    {
        //        string cOpcion = "03";
        //        ConfConexion();

        //        var conn = new SqlConnection(conf);
        //        conn.Open();

        //        SqlCommand _Command = new SqlCommand("USP_MNT_Almacens", conn);
        //        _Command.CommandType = CommandType.StoredProcedure;
        //        _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
        //        //_Command.Parameters.Add(new SqlParameter("@nId_asig", objAlmacenEnt.nId_asig));
        //        _Command.Parameters.Add(new SqlParameter("@cDescripcion", objAlmacenEnt.cDescripcion));
        //        _Command.Parameters.Add(new SqlParameter("@cAsignatura", objAlmacenEnt.cAsignatura));
        //        _Command.Parameters.Add(new SqlParameter("@bStock", objAlmacenEnt.bStock));
        //        //_Command.Parameters.Clear();

        //        SqlDataReader reader = _Command.ExecuteReader();

        //        while (reader.Read())
        //        {
        //            AlmacenEntity libEnt = new AlmacenEntity();

        //            libEnt.Id_almacen = Convert.ToInt32(reader["Id_almacen"]);
        //            libEnt.descripcion = reader["descripcion"].ToString();
        //            libEnt.asignatura = reader["asignatura"].ToString();
        //            libEnt.stock = Convert.ToInt32(reader["stock"]);


        //            lstAlmacens.Add(libEnt);
        //        }

        //        conn.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception(ex.Message, ex);
        //    }

        //    return lstAlmacens;
        //}
        //#endregion

        //#region Crear almacen
        //public String CREATE_AlmacenData(AlmacenEntity objAlmacenEnt)
        //{
        //    String strResultado = "";
        //    string cOpcion = "01";
        //    try
        //    {
        //        ConfConexion();

        //        var conn = new SqlConnection(conf);
        //        conn.Open();

        //        SqlCommand _Command = new SqlCommand("USP_MNT_Almacens", conn);

        //        _Command.CommandType = CommandType.StoredProcedure;
        //        _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
        //        _Command.Parameters.Add(new SqlParameter("@nId_asig", objAlmacenEnt.nId_asig));
        //        _Command.Parameters.Add(new SqlParameter("@cDescripcion", objAlmacenEnt.cDescripcion));
        //        _Command.Parameters.Add(new SqlParameter("@nStock", objAlmacenEnt.nStock));

        //        if (_Command.ExecuteNonQuery() != 0)
        //        {
        //            strResultado = "OK";
        //            //return strResultado;
        //        }

        //        conn.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        strResultado = "";
        //        throw new Exception(ex.Message, ex);
        //    }

        //    return strResultado;
        //}
        //#endregion

        //#region Actualizar almacen
        //public String UPDATE_AlmacenData(int id_almacen, AlmacenEntity objAlmacenEnt)
        //{
        //    String strResultado = "";
        //    string cOpcion = "04";
        //    try
        //    {
        //        ConfConexion();
        //        var conn = new SqlConnection(conf);
        //        conn.Open();

        //        SqlCommand _Command = new SqlCommand("USP_MNT_Almacens", conn);

        //        _Command.CommandType = CommandType.StoredProcedure;
        //        _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
        //        _Command.Parameters.Add(new SqlParameter("@nId_almacen", id_almacen));
        //        _Command.Parameters.Add(new SqlParameter("@nId_asig", objAlmacenEnt.nId_asig));
        //        _Command.Parameters.Add(new SqlParameter("@cDescripcion", objAlmacenEnt.cDescripcion));
        //        _Command.Parameters.Add(new SqlParameter("@nStock", objAlmacenEnt.nStock));

        //        if (_Command.ExecuteNonQuery() != 0)
        //        {
        //            strResultado = "OK";
        //        }

        //        conn.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        strResultado = "";
        //        throw new Exception(ex.Message, ex);
        //    }

        //    return strResultado;
        //}
        //#endregion

        //#region Eliminar almacen
        //public bool DELETE_AlmacenData(int id_almacen)
        //{
        //    string cOpcion = "05";
        //    bool res;
        //    try
        //    {
        //        ConfConexion();
        //        var conn = new SqlConnection(conf);
        //        conn.Open();

        //        SqlCommand _Command = new SqlCommand("USP_MNT_Almacens", conn);

        //        _Command.CommandType = CommandType.StoredProcedure;
        //        _Command.Parameters.Add(new SqlParameter("@cOpcion", cOpcion));
        //        _Command.Parameters.Add(new SqlParameter("@nId_almacen", id_almacen));

        //        if (_Command.ExecuteNonQuery() != 0)
        //        {
        //            res = true;
        //        }
        //        else
        //        {
        //            res = false;
        //        }

        //        conn.Close();
        //    }
        //    catch (Exception ex)
        //    {
        //        res = false;
        //        throw new Exception(ex.Message, ex);
        //    }

        //    return res;
        //}
        //#endregion

    }
}
