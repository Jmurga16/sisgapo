using System;
using System.Data;
using Microsoft.Data.SqlClient;
using Xunit;

namespace Test
{
    /// <summary>
    /// Marca una prueba de integración contra SQL Server. Si no hay cadena de
    /// conexión configurada la prueba se omite en vez de fallar, para que
    /// `dotnet test` siga funcionando en una máquina sin base de datos.
    /// </summary>
    public sealed class HechoConBaseDeDatosAttribute : FactAttribute
    {
        public HechoConBaseDeDatosAttribute()
        {
            if (!BaseDeDatosPruebas.bDisponible)
            {
                Skip = "Define SISGAPO_TEST_CONNECTION_STRING para ejecutar las pruebas de integración.";
            }
        }
    }

    public static class BaseDeDatosPruebas
    {
        public const string sVariable = "SISGAPO_TEST_CONNECTION_STRING";

        public static string sCadenaConexion
        {
            get { return Environment.GetEnvironmentVariable(sVariable); }
        }

        public static bool bDisponible
        {
            get { return !String.IsNullOrWhiteSpace(sCadenaConexion); }
        }

        public static SqlConnection fnAbrir()
        {
            SqlConnection conn = new SqlConnection(sCadenaConexion);
            conn.Open();
            return conn;
        }

        /// <summary>
        /// Ejecuta un procedimiento del contrato sOpcion/pParametro y devuelve el
        /// primer valor, que es como lo llama la capa Data.
        /// </summary>
        public static string fnEjecutar(SqlConnection conn, string sProcedimiento, string sOpcion, string pParametro)
        {
            using (SqlCommand oCmd = new SqlCommand(sProcedimiento, conn))
            {
                oCmd.CommandType = CommandType.StoredProcedure;
                oCmd.Parameters.Add(new SqlParameter("@sOpcion", SqlDbType.VarChar, 2) { Value = sOpcion });
                oCmd.Parameters.Add(new SqlParameter("@pParametro", SqlDbType.VarChar, -1) { Value = pParametro });

                object oResultado = oCmd.ExecuteScalar();

                return oResultado == null || oResultado == DBNull.Value
                    ? null
                    : Convert.ToString(oResultado);
            }
        }

        public static object fnEscalar(SqlConnection conn, string sSentencia)
        {
            using (SqlCommand oCmd = new SqlCommand(sSentencia, conn))
            {
                object oResultado = oCmd.ExecuteScalar();

                return oResultado == DBNull.Value ? null : oResultado;
            }
        }

        public static void fnEjecutarSentencia(SqlConnection conn, string sSentencia)
        {
            using (SqlCommand oCmd = new SqlCommand(sSentencia, conn))
            {
                oCmd.ExecuteNonQuery();
            }
        }
    }

    /// <summary>
    /// Producto de usar y tirar: se crea con USP_MNT_Productos y se borra al salir,
    /// para que las pruebas no dejen rastro en el catálogo de la demo.
    /// </summary>
    public sealed class ProductoDePrueba : IDisposable
    {
        private readonly SqlConnection conn;

        public ProductoDePrueba(SqlConnection conn, string sNombre, int nCantidad)
        {
            this.conn = conn;

            string sRespuesta = BaseDeDatosPruebas.fnEjecutar(
                conn,
                "USP_MNT_Productos",
                "06",
                String.Format("{0}|1|1|1|{1}|10|2026-01-01|2027-01-01|Producto de prueba|1", sNombre, nCantidad));

            Assert.StartsWith("1|", sRespuesta);

            nIdProducto = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(
                conn,
                String.Format("SELECT MAX(nIdProducto) FROM TBL_PRODUCTO WHERE sNombre = '{0}'", sNombre)));

            nIdDetProd = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(
                conn,
                String.Format("SELECT nIdDetProd FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0}", nIdProducto)));
        }

        public int nIdProducto { get; }

        public int nIdDetProd { get; }

        public int fnExistencia()
        {
            return Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(
                conn,
                String.Format("SELECT nCantidad FROM TBL_DET_PRODUCTO WHERE nIdDetProd = {0}", nIdDetProd)));
        }

        public int fnSumaMovimientos()
        {
            return Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(
                conn,
                String.Format(
                    "SELECT ISNULL(SUM(nCantidad), 0) FROM TBL_MOVIMIENTO WHERE nIdDetProd IN " +
                    "(SELECT nIdDetProd FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0})",
                    nIdProducto)));
        }

        public void Dispose()
        {
            BaseDeDatosPruebas.fnEjecutarSentencia(conn, String.Format(
                "DELETE FROM TBL_MOVIMIENTO WHERE nIdDetProd IN " +
                "(SELECT nIdDetProd FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0});" +
                "DECLARE @tLotes TABLE (nIdLote INT);" +
                "INSERT INTO @tLotes SELECT nIdLote FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0};" +
                "DELETE FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0};" +
                "DELETE FROM TBL_LOTE WHERE nIdLote IN (SELECT nIdLote FROM @tLotes);" +
                "DELETE FROM TBL_CAT_PROD WHERE nIdProducto = {0};" +
                "DELETE FROM TBL_PRODUCTO WHERE nIdProducto = {0};",
                nIdProducto));
        }
    }
}
