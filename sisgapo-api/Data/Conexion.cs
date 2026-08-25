using Microsoft.ApplicationBlocks.Data;
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
    public class Conexion
    {

        #region Variables
        private readonly String oSqlConnIN;
        private readonly SqlTransaction sqlTransaction = null;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #endregion


        #region Conexion
        public Conexion(Int32 idDatabase)
        {
            try
            {
                //Solo existe una base de datos. Antes, cualquier otro valor dejaba la
                //cadena nula en silencio y el error aparecía mucho después.
                if (idDatabase != 1)
                {
                    throw new ArgumentOutOfRangeException(nameof(idDatabase),
                        "SISGAPO solo tiene una base de datos configurada (idDatabase = 1).");
                }

                oSqlConnIN = ConfiguracionBD.sCadenaConexion;
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }

        }
        #endregion
        

        #region EjecutarDataReader
        public SqlDataReader ejecutarDataReader(String sProcedure, params object[] valores)
        {
            try
            {
                return SqlHelper.ExecuteReader(this.oSqlConnIN, sProcedure, valores);
            }
            catch (Exception ex)
            {
                Console.Write("Error: " + ex.Message);
                throw;
            }
        }
        #endregion


        #region EjecutarEscalar       
        public String EjecutarEscalar(String sProcedure, params object[] valores)
        {
            SqlParameter[] arParms = new SqlParameter[valores.Length];

 
            DataSet ds = ObtenerParametros(sProcedure);

            if (ds.Tables.Count == 0)
                return null;
            else if (ds.Tables.Count > 0)
            {
                DataTable dt = ds.Tables[0]; //Estructura del Stored           
                Int32 i = 0;
                foreach (DataRow dr in dt.Rows)
                {
                    //Omite el parámetro de retorno del procedimiento
                    if (!dr["Parameter_name"].Equals("@RETURN_VALUE"))
                    {
                        arParms[i] = new SqlParameter(dr["Parameter_name"].ToString(), f_obtenerSQLType(dr["Type_name"].ToString()));
                        arParms[i].Value = valores[i];
                        i++;
                    }
                }
                if (i != valores.Length)
                    throw new ArgumentException("La cantidad de parámetros ingresados no coincide con las del procedimiento.");
            }

            //Se verifica si existe una Transaccion de BD activa
            String sValor;
            if (sqlTransaction != null)
            {
                sValor = SqlHelper.ExecuteScalar
                    (
                    sqlTransaction,
                    CommandType.StoredProcedure,
                    sProcedure,
                    arParms
                    ).ToString();
            }
            else
            {
                sValor = SqlHelper.ExecuteScalar
                    (
                    this.oSqlConnIN,
                    CommandType.StoredProcedure,
                    sProcedure,
                    arParms
                    ).ToString();
            }
            return sValor;
        }
        #endregion


        #region Metodos: Obtener Parametros / Obtener Tipo de dato SQL
        private DataSet ObtenerParametros(string vProcedure)
        {
            object vSquema = DBNull.Value;
            if (vProcedure.Contains("."))
            {
                vSquema = vProcedure.Substring(0, vProcedure.IndexOf('.'));
                vProcedure = vProcedure.Substring(vProcedure.IndexOf('.') + 1);
            }

            SqlParameter[] sqlParameters = { new SqlParameter("@procedure_name", SqlDbType.NChar, 256),
                                      new SqlParameter("@group_number", SqlDbType.Int, 4),
                                      new SqlParameter("@procedure_schema", SqlDbType.NChar, 256),
                                      new SqlParameter("@parameter_name", SqlDbType.NChar, 256) };

            sqlParameters[0].Value = vProcedure;
            sqlParameters[1].Value = DBNull.Value;
            sqlParameters[2].Value = vSquema;
            sqlParameters[3].Value = DBNull.Value;

            DataSet ds;



            if (sqlTransaction != null)
            {


                ds = SqlHelper.ExecuteDataset(
                    sqlTransaction,
                    CommandType.StoredProcedure,
                    "sp_procedure_params_rowset",
                    sqlParameters
                    );

            }
            else
            {
                ds = SqlHelper.ExecuteDataset
                   (
                   oSqlConnIN,
                   CommandType.StoredProcedure,
                   "sp_procedure_params_rowset",
                   sqlParameters
                   );
            }
            return ds;

        }

        private static SqlDbType f_obtenerSQLType(string sNombreTipo)
        {
            SqlDbType tTipo;

            switch (sNombreTipo)
            {
                case "bit":
                    tTipo = SqlDbType.Bit;
                    break;

                case "char":
                    tTipo = SqlDbType.Char;
                    break;

                case "varchar":
                    tTipo = SqlDbType.VarChar;
                    break;

                case "decimal":
                    tTipo = SqlDbType.Decimal;
                    break;

                case "float":
                    tTipo = SqlDbType.Float;
                    break;

                case "int":
                    tTipo = SqlDbType.Int;
                    break;

                case "smallint":
                    tTipo = SqlDbType.SmallInt;
                    break;

                case "tinyint":
                    tTipo = SqlDbType.TinyInt;
                    break;

                case "datetime":
                    tTipo = SqlDbType.DateTime;
                    break;

                case "smalldatetime":
                    tTipo = SqlDbType.SmallDateTime;
                    break;

                case "nvarchar":
                    tTipo = SqlDbType.NVarChar;
                    break;

                case "image":
                    tTipo = SqlDbType.Image;
                    break;

                case "xml":
                    tTipo = SqlDbType.Xml;
                    break;

                case "text":
                    tTipo = SqlDbType.Text;
                    break;

                case "ntext":
                    tTipo = SqlDbType.NText;
                    break;

                case "bigint":
                    tTipo = SqlDbType.BigInt;
                    break;

                default:
                    throw (new Exception("Tipo de dato SQL no soportado:" + sNombreTipo));
            }

            return tTipo;
        }
        
        #endregion

    }

}
