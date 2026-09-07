using Entity;
using Microsoft.Extensions.Configuration;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
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
            conf = ConfiguracionBD.sCadenaConexion;
            return conf;
        }

        //Obtener Todos los zonas
        public async Task<List<ZonaEntity>> LIS_ZonaData()
        {

            List<ZonaEntity> lstZonas = new List<ZonaEntity>();

            SqlConnection conn = null;

            try
            {
                string sOpcion = "01";
                ConfConexion();

                conn = new SqlConnection(conf);
                await conn.OpenAsync();

                SqlCommand _Command = new("USP_MNT_Zonas", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));
                _Command.Parameters.Add(new SqlParameter("@nIdZona", 0));
                _Command.Parameters.Add(new SqlParameter("@sNombre", ""));
                _Command.Parameters.Add(new SqlParameter("@sRutaImagen", ""));


                SqlDataReader reader = await _Command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    ZonaEntity zonaEnt = new ZonaEntity();

                    zonaEnt.nIdZona = Convert.ToInt32(reader["nIdZona"]);
                    zonaEnt.sNombre = reader["sNombre"].ToString();
                    zonaEnt.sRutaImagen = reader["sRutaImagen"].ToString();
                    zonaEnt.bEstado = Convert.ToBoolean(reader["bEstado"]);
                    zonaEnt.sEstado = reader["sEstado"].ToString();

                    lstZonas.Add(zonaEnt);
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

            return lstZonas;
        }

        //Obtener un zona por id
        public async Task<List<ZonaEntity>> LIS_ZonaUnicoData(int nIdZona)
        {

            List<ZonaEntity> lstZonas = new List<ZonaEntity>();

            SqlConnection conn = null;

            try
            {

                ConfConexion();
                string sOpcion = "02";

                conn = new SqlConnection(conf);
                await conn.OpenAsync();

                SqlCommand _Command = new SqlCommand("USP_MNT_Zonas", conn);
                _Command.CommandType = CommandType.StoredProcedure;
                _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));
                _Command.Parameters.Add(new SqlParameter("@nIdZona", nIdZona));
                _Command.Parameters.Add(new SqlParameter("@sNombre", ""));
                _Command.Parameters.Add(new SqlParameter("@sRutaImagen", ""));


                SqlDataReader dreader = await _Command.ExecuteReaderAsync();

                while (await dreader.ReadAsync())
                {
                    ZonaEntity zonaEnt = new ZonaEntity();

                    zonaEnt.nIdZona = Convert.ToInt32(dreader["nIdZona"]);
                    zonaEnt.sNombre = dreader["sNombre"].ToString();
                    zonaEnt.sRutaImagen = dreader["sRutaImagen"].ToString();
                    zonaEnt.bEstado = Convert.ToBoolean(dreader["bEstado"]);
                    zonaEnt.sEstado = dreader["sEstado"].ToString();

                    lstZonas.Add(zonaEnt);
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

            return lstZonas;
        }


        //Crear zona
        public async Task<String> CREATE_ZonaData(ZonaEntity objZonaEnt)
        {
            return await fnEjecutarEscritura("03", objZonaEnt.nIdZona, objZonaEnt.sNombre, objZonaEnt.sRutaImagen, true);
        }


        //Actualizar zona
        public async Task<String> UPDATE_ZonaData(ZonaEntity objZonaEnt)
        {
            return await fnEjecutarEscritura("04", objZonaEnt.nIdZona, objZonaEnt.sNombre, objZonaEnt.sRutaImagen, true);
        }


        //Activar / dar de baja (baja logica)
        public async Task<String> ESTADO_ZonaData(int nIdZona, bool bEstado)
        {
            return await fnEjecutarEscritura("05", nIdZona, "", "", bEstado);
        }


        private async Task<String> fnEjecutarEscritura(string sOpcion, int nIdZona, string sNombre, string sRutaImagen, bool bEstado)
        {
            String strResultado = "";

            try
            {
                ConfConexion();

                using (var conn = new SqlConnection(conf))
                {
                    await conn.OpenAsync();

                    SqlCommand _Command = new SqlCommand("USP_MNT_Zonas", conn);
                    _Command.CommandType = CommandType.StoredProcedure;
                    _Command.Parameters.Add(new SqlParameter("@sOpcion", sOpcion));
                    _Command.Parameters.Add(new SqlParameter("@nIdZona", nIdZona));
                    _Command.Parameters.Add(new SqlParameter("@sNombre", sNombre ?? ""));
                    _Command.Parameters.Add(new SqlParameter("@sRutaImagen", sRutaImagen ?? ""));
                    _Command.Parameters.Add(new SqlParameter("@bEstado", bEstado));

                    object oResultado = await _Command.ExecuteScalarAsync();
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
