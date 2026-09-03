using System;
using Microsoft.Data.SqlClient;
using Xunit;

namespace Test
{
    /// <summary>
    /// Pruebas de integración de los procedimientos de Lotes y Movimientos contra
    /// SQL Server. Son las que faltaban: la lógica de negocio del sistema vive en
    /// T-SQL, así que hasta ahora nada la cubría.
    ///
    /// Necesitan la base cargada con sisgapo-docs/sql y la variable
    /// SISGAPO_TEST_CONNECTION_STRING apuntando a ella. Sin la variable se omiten.
    /// </summary>
    public class InventarioIntegracionTests
    {
        [HechoConBaseDeDatos]
        public void LaExistenciaDeCadaLoteEsLaSumaDeSusMovimientos()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            {
                //Es el invariante del modulo: nCantidad no es un campo suelto, es el
                //saldo del kardex. Si alguna vez deja de cuadrar, el modulo miente.
                int nDescuadres = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn,
                    "SELECT COUNT(*) FROM TBL_DET_PRODUCTO det " +
                    "WHERE det.nCantidad <> ISNULL((SELECT SUM(mov.nCantidad) FROM TBL_MOVIMIENTO mov " +
                    "                                WHERE mov.nIdDetProd = det.nIdDetProd), 0)"));

                Assert.Equal(0, nDescuadres);
            }
        }

        [HechoConBaseDeDatos]
        public void ElSeedTieneProductosConVariosLotes()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            {
                //Lo que el modelo de 2021 no permitia representar.
                int nProductos = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn,
                    "SELECT COUNT(*) FROM (SELECT nIdProducto FROM TBL_DET_PRODUCTO " +
                    "                       GROUP BY nIdProducto HAVING COUNT(*) > 1) t"));

                Assert.True(nProductos > 0, "El seed deberia traer productos con mas de un lote.");
            }
        }

        [HechoConBaseDeDatos]
        public void ElAltaDeUnProductoDejaSuEntradaEnElKardex()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                Assert.Equal(40, oProducto.fnExistencia());
                Assert.Equal(40, oProducto.fnSumaMovimientos());

                string sTipo = Convert.ToString(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT sTipo FROM TBL_MOVIMIENTO WHERE nIdDetProd = {0}", oProducto.nIdDetProd)));

                Assert.Equal("E", sTipo);
            }
        }

        [HechoConBaseDeDatos]
        public void LaEntradaYLaSalidaMuevenElSaldoDelLote()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                string sEntrada = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|E|10|Recepcion de prueba|1", oProducto.nIdDetProd));
                string sSalida = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|S|15|Despacho de prueba|1", oProducto.nIdDetProd));

                Assert.StartsWith("1|", sEntrada);
                Assert.StartsWith("1|", sSalida);
                Assert.Equal(35, oProducto.fnExistencia());
                Assert.Equal(35, oProducto.fnSumaMovimientos());
            }
        }

        [HechoConBaseDeDatos]
        public void UnaSalidaMayorQueLaExistenciaSeRechazaSinTocarElSaldo()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|S|41|Despacho imposible|1", oProducto.nIdDetProd));

                Assert.StartsWith("0|", sRespuesta);
                Assert.Equal(40, oProducto.fnExistencia());
                Assert.Equal(1, fnMovimientos(conn, oProducto.nIdDetProd));
            }
        }

        [HechoConBaseDeDatos]
        public void ElAjusteRegistraLaDiferenciaNoLaCantidadContada()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                //El inventario fisico cuenta 33 donde el sistema decia 40: la
                //diferencia (-7) es lo que se guarda como movimiento.
                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|A|33|Inventario fisico|1", oProducto.nIdDetProd));

                Assert.StartsWith("1|", sRespuesta);
                Assert.Equal(33, oProducto.fnExistencia());

                int nAjuste = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT nCantidad FROM TBL_MOVIMIENTO WHERE nIdDetProd = {0} AND sTipo = 'A'",
                    oProducto.nIdDetProd)));

                Assert.Equal(-7, nAjuste);
            }
        }

        [HechoConBaseDeDatos]
        public void UnMovimientoSinMotivoSeRechaza()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|E|5||1", oProducto.nIdDetProd));

                Assert.StartsWith("0|", sRespuesta);
                Assert.Equal(40, oProducto.fnExistencia());
            }
        }

        [HechoConBaseDeDatos]
        public void UnProductoAdmiteVariosLotesConVencimientosDistintos()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "03",
                    String.Format("{0}||2026-02-01|2027-06-01|1|25|12|Segunda partida|1", oProducto.nIdProducto));

                Assert.StartsWith("1|", sRespuesta);

                int nLotes = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT COUNT(*) FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0}", oProducto.nIdProducto)));

                Assert.Equal(2, nLotes);
                //40 del alta del producto y 25 del alta del lote, cada uno con su entrada.
                Assert.Equal(65, oProducto.fnSumaMovimientos());
            }
        }

        [HechoConBaseDeDatos]
        public void LosLotesDeUnProductoCompartenUnidadDeMedida()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                //El alta del producto usa la U.M. 1. Sumar después una partida en
                //U.M. 2 produciría un total sin significado en el listado agregado.
                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "03",
                    String.Format("{0}||2026-02-01|2027-06-01|2|25|12|Unidad distinta|1",
                        oProducto.nIdProducto));

                Assert.StartsWith("0|", sRespuesta);

                int nLotes = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT COUNT(*) FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0}",
                    oProducto.nIdProducto)));

                Assert.Equal(1, nLotes);
                Assert.Equal(40, oProducto.fnExistencia());

                string sAltaValida = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "03",
                    String.Format("{0}||2026-02-01|2027-06-01|1|25|12|Unidad compatible|1",
                        oProducto.nIdProducto));

                Assert.StartsWith("1|", sAltaValida);

                int nIdSegundoLote = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT MAX(nIdDetProd) FROM TBL_DET_PRODUCTO WHERE nIdProducto = {0}",
                    oProducto.nIdProducto)));
                string sCodigo = Convert.ToString(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT lot.sNombreLote FROM TBL_DET_PRODUCTO det " +
                    "INNER JOIN TBL_LOTE lot ON lot.nIdLote = det.nIdLote " +
                    "WHERE det.nIdDetProd = {0}", nIdSegundoLote)));

                string sEdicion = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "04",
                    String.Format("{0}|{1}|2026-02-01|2027-06-01|2|12|Unidad distinta",
                        nIdSegundoLote, sCodigo));

                Assert.StartsWith("0|", sEdicion);

                int nUnidades = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT COUNT(DISTINCT nIdUnidadMedida) FROM TBL_DET_PRODUCTO " +
                    "WHERE nIdProducto = {0}", oProducto.nIdProducto)));

                Assert.Equal(1, nUnidades);
                Assert.Equal(65, oProducto.fnSumaMovimientos());
            }
        }

        [HechoConBaseDeDatos]
        public void ElCodigoDeLoteNoSePuedeRepetir()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                string sCodigo = Convert.ToString(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                    "SELECT lot.sNombreLote FROM TBL_LOTE lot " +
                    "INNER JOIN TBL_DET_PRODUCTO det ON det.nIdLote = lot.nIdLote " +
                    "WHERE det.nIdProducto = {0}", oProducto.nIdProducto)));

                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "03",
                    String.Format("{0}|{1}|2026-02-01|2027-06-01|1|25|12|Codigo repetido|1",
                        oProducto.nIdProducto, sCodigo));

                Assert.StartsWith("0|", sRespuesta);
            }
        }

        [HechoConBaseDeDatos]
        public void NoSePuedeDarDeBajaUnLoteConExistencia()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                string sConExistencia = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "05",
                    String.Format("{0}|0", oProducto.nIdDetProd));

                Assert.StartsWith("0|", sConExistencia);

                //Vaciado el lote, la baja si procede.
                BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|S|40|Despacho total|1", oProducto.nIdDetProd));

                string sVacio = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "05",
                    String.Format("{0}|0", oProducto.nIdDetProd));

                Assert.StartsWith("1|", sVacio);
            }
        }

        [HechoConBaseDeDatos]
        public void NoSePuedeMoverUnLoteDadoDeBaja()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            using (ProductoDePrueba oProducto = new ProductoDePrueba(conn, fnNombre(), 40))
            {
                BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|S|40|Despacho total|1", oProducto.nIdDetProd));
                BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Lotes", "05",
                    String.Format("{0}|0", oProducto.nIdDetProd));

                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Movimientos", "02",
                    String.Format("{0}|E|5|Recepcion sobre lote de baja|1", oProducto.nIdDetProd));

                Assert.StartsWith("0|", sRespuesta);
            }
        }

        private static int fnMovimientos(SqlConnection conn, int nIdDetProd)
        {
            return Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                "SELECT COUNT(*) FROM TBL_MOVIMIENTO WHERE nIdDetProd = {0}", nIdDetProd)));
        }

        private static string fnNombre()
        {
            //El nombre entra en el codigo del lote y en la busqueda de limpieza.
            return "Prueba " + Guid.NewGuid().ToString("N").Substring(0, 8);
        }
    }
}
