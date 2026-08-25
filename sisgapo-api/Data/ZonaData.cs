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
            //La cadena se resuelve una sola vez por proceso en ConfiguracionBD.
            conf = ConfiguracionBD.sCadenaConexion;
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
                    zonaEnt.bEstado = Convert.ToBoolean(reader["bEstado"]);
                    zonaEnt.sEstado = reader["sEstado"].ToString();

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
                
                ConfConexion();
                string sOpcion = "02";

                var conn = new SqlConnection(conf);
                conn.Open();

                SqlCommand _Command = new SqlCommand("USP_MNT_Zonas", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));
                _Command.Parameters.Add(new SqlParameter("@nIdZona", nIdZona));
                _Command.Parameters.Add(new SqlParameter("@sNombre", ""));
                _Command.Parameters.Add(new SqlParameter("@sRutaImagen", ""));
             

                SqlDataReader dreader = _Command.ExecuteReader();

                while (dreader.Read())
                {
                    ZonaEntity zonaEnt = new ZonaEntity();

                    zonaEnt.nIdZona = Convert.ToInt32(dreader["nIdZona"]);
                    zonaEnt.sNombre = dreader["sNombre"].ToString();
                    zonaEnt.sRutaImagen = dreader["sRutaImagen"].ToString();
                    zonaEnt.bEstado = Convert.ToBoolean(dreader["bEstado"]);
                    zonaEnt.sEstado = dreader["sEstado"].ToString();

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
        //Antes usaba ExecuteNonQuery y devolvia "OK" a ciegas: si el procedimiento
        //rechazaba el nombre por duplicado, devolvia "" y la pantalla navegaba igual
        //al listado. Ahora se lee la respuesta 'cod|mensaje' del procedimiento.
        public String CREATE_ZonaData(ZonaEntity objZonaEnt)
        {
            return fnEjecutarEscritura("03", objZonaEnt.nIdZona, objZonaEnt.sNombre, objZonaEnt.sRutaImagen, true);
        }


        //Actualizar zona
        public String UPDATE_ZonaData(ZonaEntity objZonaEnt)
        {
            return fnEjecutarEscritura("04", objZonaEnt.nIdZona, objZonaEnt.sNombre, objZonaEnt.sRutaImagen, true);
        }


        //Activar / dar de baja (baja logica)
        public String ESTADO_ZonaData(int nIdZona, bool bEstado)
        {
            return fnEjecutarEscritura("05", nIdZona, "", "", bEstado);
        }


        //Las tres escrituras comparten firma y contrato de respuesta.
        private String fnEjecutarEscritura(string sOpcion, int nIdZona, string sNombre, string sRutaImagen, bool bEstado)
        {
            String strResultado = "";

            try
            {
                ConfConexion();

                using (var conn = new SqlConnection(conf))
                {
                    conn.Open();

                    SqlCommand _Command = new SqlCommand("USP_MNT_Zonas", conn);
                    _Command.CommandType = CommandType.StoredProcedure;
                    _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));
                    _Command.Parameters.Add(new SqlParameter("@nIdZona", nIdZona));
                    _Command.Parameters.Add(new SqlParameter("@sNombre", sNombre ?? ""));
                    _Command.Parameters.Add(new SqlParameter("@sRutaImagen", sRutaImagen ?? ""));
                    _Command.Parameters.Add(new SqlParameter("@bEstado", bEstado));

                    object oResultado = _Command.ExecuteScalar();
                    strResultado = Convert.ToString(oResultado);
                }
            }
            catch (Exception ex)
            {
                logger.Error(ex);
                throw;
            }

            return strResultado;
        }
    }
}
