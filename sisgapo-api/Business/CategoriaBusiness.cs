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
        private readonly ICategoriaData categoriaData;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public CategoriaBusiness() : this(new CategoriaData())
        {
        }

        public CategoriaBusiness(ICategoriaData categoriaData)
        {
            this.categoriaData = categoriaData ?? throw new ArgumentNullException(nameof(categoriaData));
        }

        public async Task<object> BusinessCategoria(GeneralEntity genEnt)
        {
            try
            {
                bool bEscritura = genEnt != null && (genEnt.sOpcion == "03" || genEnt.sOpcion == "04" || genEnt.sOpcion == "05");
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return await categoriaData.DataCategoria(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
