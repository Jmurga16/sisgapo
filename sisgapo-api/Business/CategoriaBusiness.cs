using Data;
using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class CategoriaBusiness
    {
        private readonly CategoriaData categoriaData = new CategoriaData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();


        public object BusinessCategoria(GeneralEntity genEnt)
        {
            try
            {
                bool bEscritura = genEnt != null && (genEnt.sOpcion == "03" || genEnt.sOpcion == "04" || genEnt.sOpcion == "05");
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return categoriaData.DataCategoria(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
