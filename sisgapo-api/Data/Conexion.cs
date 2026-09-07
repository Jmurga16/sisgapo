using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace Data
{
    
    public class Conexion
    {

        #region Variables
        
        private static String oSqlConnIN => ConfiguracionBD.sCadenaConexion;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #endregion


        #region Firmas de los procedimientos

        private readonly struct DefParametro
        {
            public DefParametro(string sNombre, SqlDbType tTipo, int nTamanio)
            {
                this.sNombre = sNombre;
                this.tTipo = tTipo;
                this.nTamanio = nTamanio;
            }

            public string sNombre { get; }
            public SqlDbType tTipo { get; }
            public int nTamanio { get; }
        }

        private static readonly Dictionary<string, DefParametro[]> dicFirmas =
            new Dictionary<string, DefParametro[]>(StringComparer.OrdinalIgnoreCase)
            {
                ["USP_MNT_Almacenes"] = FirmaOpcionParametro(),
                ["USP_MNT_Categorias"] = FirmaOpcionParametro(),
                ["USP_MNT_Productos"] = FirmaOpcionParametro(),
                ["USP_MNT_Lotes"] = FirmaOpcionParametro(),
                ["USP_MNT_Movimientos"] = FirmaOpcionParametro(),
                ["USP_MNT_Usuarios"] = FirmaOpcionParametro(),
                ["USP_MNT_Panel"] = FirmaOpcionParametro(),
                ["USP_MNT_Login"] = new[]
                {
                    new DefParametro("@sNombreUsuario", SqlDbType.VarChar, 100)
                }
            };

        private static DefParametro[] FirmaOpcionParametro()
        {
            return new[]
            {
                new DefParametro("@sOpcion",    SqlDbType.VarChar, 2),
                new DefParametro("@pParametro", SqlDbType.VarChar, -1)
            };
        }

        #endregion


        #region Conexion
        public Conexion(Int32 idDatabase)
        {
            if (idDatabase != 1)
            {
                throw new ArgumentOutOfRangeException(nameof(idDatabase),
                    "SISGAPO solo tiene una base de datos configurada (idDatabase = 1).");
            }
        }
        #endregion


        #region EjecutarDataReaderAsync

        public async Task<SqlDataReader> fnEjecutarDataReaderAsync(String sProcedure, params object[] valores)
        {
            SqlConnection conn = null;

            try
            {
                conn = new SqlConnection(oSqlConnIN);

                SqlCommand oCmd = new SqlCommand(sProcedure, conn);
                oCmd.CommandType = CommandType.StoredProcedure;
                fnAgregarParametros(oCmd, sProcedure, valores);

                await conn.OpenAsync();

                return await oCmd.ExecuteReaderAsync(CommandBehavior.CloseConnection);
            }
            catch (Exception ex)
            {
                if (conn != null)
                {
                    conn.Dispose();
                }

                logger.Error(ex, "Error ejecutando {0}", sProcedure);
                throw;
            }
        }
        #endregion


        #region EjecutarEscalarAsync
        public async Task<String> fnEjecutarEscalarAsync(String sProcedure, params object[] valores)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(oSqlConnIN))
                {
                    SqlCommand oCmd = new SqlCommand(sProcedure, conn);
                    oCmd.CommandType = CommandType.StoredProcedure;
                    fnAgregarParametros(oCmd, sProcedure, valores);

                    await conn.OpenAsync();

                    object oResultado = await oCmd.ExecuteScalarAsync();

                    return oResultado == null || oResultado == DBNull.Value
                        ? null
                        : Convert.ToString(oResultado);
                }
            }
            catch (Exception ex)
            {
                logger.Error(ex, "Error ejecutando {0}", sProcedure);
                throw;
            }
        }
        #endregion


        #region Armado de parametros
        private static void fnAgregarParametros(SqlCommand oCmd, string sProcedure, object[] valores)
        {
            if (!dicFirmas.TryGetValue(sProcedure, out DefParametro[] arFirma))
            {
                throw new ArgumentException(
                    $"El procedimiento '{sProcedure}' no está registrado en Conexion.dicFirmas. " +
                    "Añade su firma antes de llamarlo.", nameof(sProcedure));
            }

            int nRecibidos = valores == null ? 0 : valores.Length;

            if (nRecibidos != arFirma.Length)
            {
                throw new ArgumentException(
                    $"'{sProcedure}' espera {arFirma.Length} parámetros y recibió {nRecibidos}.",
                    nameof(valores));
            }

            for (int i = 0; i < arFirma.Length; i++)
            {
                DefParametro oDef = arFirma[i];

                SqlParameter oParam = oDef.nTamanio == 0
                    ? new SqlParameter(oDef.sNombre, oDef.tTipo)
                    : new SqlParameter(oDef.sNombre, oDef.tTipo, oDef.nTamanio);

                oParam.Value = valores[i] ?? (object)DBNull.Value;

                oCmd.Parameters.Add(oParam);
            }
        }
        #endregion

    }

}
