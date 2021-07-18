using Entity;
using Microsoft.Extensions.Configuration;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{

    public class ZonaData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
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
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
            return conf;
        }

        //Obtener Todos los zonas
        public List<ZonaEntity> LIS_ZonaData()
        {

            List<ZonaEntity> lstZonas = new List<ZonaEntity>();

            try
            {
                string sOpcion = "01";
                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new("USP_MNT_Zonas", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));
                _Command.Parameters.Add(new SqlParameter("@nIdZona", 0));
                _Command.Parameters.Add(new SqlParameter("@sNombre", ""));
                _Command.Parameters.Add(new SqlParameter("@sRutaImagen", ""));
               

                SqlDataReader reader = _Command.ExecuteReader();

                while (reader.Read())
                {
                    ZonaEntity zonaEnt = new ZonaEntity();

                    zonaEnt.nIdZona = Convert.ToInt32(reader["nIdZona"]);
                    zonaEnt.sNombre = reader["sNombre"].ToString();
                    zonaEnt.sRutaImagen = reader["sRutaImagen"].ToString();
                   
                    lstZonas.Add(zonaEnt);
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                logger.Error(ex);
                throw;
            }

            return lstZonas;
        }

        //Obtener un zona por id
        public List<ZonaEntity> LIS_ZonaUnicoData(int nIdZona)
        {

            List<ZonaEntity> lstZonas = new List<ZonaEntity>();

            try
            {
                string sOpcion = "02";
                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Zonas", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));
                _Command.Parameters.Add(new SqlParameter("@nIdZona", nIdZona));
                _Command.Parameters.Add(new SqlParameter("@sNombre", ""));
                _Command.Parameters.Add(new SqlParameter("@sRutaImagen", ""));
             

                SqlDataReader reader = _Command.ExecuteReader();

                while (reader.Read())
                {
                    ZonaEntity zonaEnt = new ZonaEntity();

                    zonaEnt.nIdZona = Convert.ToInt32(reader["nIdZona"]);
                    zonaEnt.sNombre = reader["sNombre"].ToString();
                    zonaEnt.sRutaImagen = reader["sRutaImagen"].ToString();


                    lstZonas.Add(zonaEnt);
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                logger.Error(ex);
                throw;
            }

            return lstZonas;
        }


        //Crear zona
        public String CREATE_ZonaData(ZonaEntity objZonaEnt)
        {
            String strResultado = "";
            string sOpcion = "03";
            try
            {
                ConfConexion();

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Zonas", conn);

                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));                
                _Command.Parameters.Add(new SqlParameter("@nIdZona", objZonaEnt.nIdZona));
                _Command.Parameters.Add(new SqlParameter("@sNombre", objZonaEnt.sNombre));
                _Command.Parameters.Add(new SqlParameter("@sRutaImagen", objZonaEnt.sRutaImagen));
                

                if (_Command.ExecuteNonQuery() != 0)
                {
                    strResultado = "OK";                    
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                strResultado = "";
                logger.Error(ex);
                throw;
            }

            return strResultado;
        }
    }
}
