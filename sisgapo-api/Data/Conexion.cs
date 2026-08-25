using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Data
{
    /// <summary>
    /// Acceso a los procedimientos almacenados.
    ///
    /// Reescrita en 2026. La versión anterior tenía dos problemas de rendimiento
    /// y uno de mantenimiento:
    ///
    /// [1] Cada escritura hacía DOS viajes a la base de datos. Antes de ejecutar
    ///     el procedimiento, llamaba a `ObtenerParametros`, que ejecutaba el
    ///     procedimiento de sistema no documentado `sp_procedure_params_rowset`
    ///     para descubrir la firma en tiempo de ejecución. Sin caché: en cada
    ///     petición, otra vez. Ahora la firma está declarada abajo, que es
    ///     información que se conoce en tiempo de compilación.
    ///
    /// [2] El método `f_obtenerSQLType` existía solo para traducir los nombres de
    ///     tipo que devolvía ese procedimiento, y lanzaba una excepción con
    ///     cualquier tipo que no contemplara (`date`, `datetime2`, `money`…).
    ///
    /// [3] Dependía de `Microsoft.ApplicationBlocks.Data` (SqlHelper, del Data
    ///     Access Application Block de ~2005), un ensamblado solo para .NET
    ///     Framework que el compilador avisaba con NU1701 y que no recibe
    ///     parches desde hace dos décadas. Al ser el único consumidor, quitarlo
    ///     de aquí lo saca del proyecto entero.
    ///
    /// El resultado son 253 líneas menos las ~120 del descubrimiento de firmas,
    /// ADO.NET plano, y la mitad de llamadas a la base en cada escritura.
    /// Ver 06-hallazgos.md §D-05 y §S-06.
    /// </summary>
    public class Conexion
    {

        #region Variables
        private readonly String oSqlConnIN;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #endregion


        #region Firmas de los procedimientos

        /// <summary>
        /// Definición de un parámetro: nombre, tipo y longitud (-1 = MAX).
        /// </summary>
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

        /// <summary>
        /// Firma de cada procedimiento al que se llama desde aquí. Sustituye al
        /// descubrimiento en tiempo de ejecución.
        ///
        /// Cinco de los seis comparten el contrato sOpcion/pParametro; `USP_MNT_Login`
        /// es la excepción. `USP_MNT_Zonas` no aparece porque `ZonaData` construye
        /// sus propios SqlCommand: es el módulo REST.
        ///
        /// Al añadir un procedimiento nuevo hay que registrarlo aquí. Si no, la
        /// llamada falla con un mensaje explícito en vez de con un error de SQL.
        /// </summary>
        private static readonly Dictionary<string, DefParametro[]> dicFirmas =
            new Dictionary<string, DefParametro[]>(StringComparer.OrdinalIgnoreCase)
            {
                ["USP_MNT_Almacenes"] = FirmaOpcionParametro(),
                ["USP_MNT_Categorias"] = FirmaOpcionParametro(),
                ["USP_MNT_Productos"] = FirmaOpcionParametro(),
                ["USP_MNT_Usuarios"] = FirmaOpcionParametro(),
                ["USP_MNT_Panel"] = FirmaOpcionParametro(),
                ["USP_MNT_Login"] = new[]
                {
                    new DefParametro("@sNombreUsuario", SqlDbType.VarChar, 100),
                    new DefParametro("@sContrasenia",   SqlDbType.VarChar, 100)
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
        /// <summary>
        /// Ejecuta un procedimiento de lectura. El SqlDataReader devuelto cierra su
        /// propia conexión al liberarse (CommandBehavior.CloseConnection), así que
        /// quien llama debe envolverlo en un using — como ya hacen todas las clases
        /// *Data.
        /// </summary>
        public SqlDataReader ejecutarDataReader(String sProcedure, params object[] valores)
        {
            SqlConnection conn = null;

            try
            {
                conn = new SqlConnection(oSqlConnIN);

                SqlCommand oCmd = new SqlCommand(sProcedure, conn);
                oCmd.CommandType = CommandType.StoredProcedure;
                fnAgregarParametros(oCmd, sProcedure, valores);

                conn.Open();

                return oCmd.ExecuteReader(CommandBehavior.CloseConnection);
            }
            catch (Exception ex)
            {
                //Si algo falla antes de devolver el reader, la conexión no tiene quien
                //la cierre: hay que soltarla aquí o se queda ocupando el pool.
                if (conn != null)
                {
                    conn.Dispose();
                }

                logger.Error(ex, "Error ejecutando {0}", sProcedure);
                throw;
            }
        }
        #endregion


        #region EjecutarEscalar
        /// <summary>
        /// Ejecuta un procedimiento de escritura y devuelve su primer valor, que en
        /// este sistema es siempre la cadena 'cod|mensaje'.
        /// </summary>
        public String EjecutarEscalar(String sProcedure, params object[] valores)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(oSqlConnIN))
                {
                    SqlCommand oCmd = new SqlCommand(sProcedure, conn);
                    oCmd.CommandType = CommandType.StoredProcedure;
                    fnAgregarParametros(oCmd, sProcedure, valores);

                    conn.Open();

                    object oResultado = oCmd.ExecuteScalar();

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
