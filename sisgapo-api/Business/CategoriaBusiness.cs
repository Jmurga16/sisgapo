using Data;
using Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class CategoriaBusiness
    {
        CategoriaData categoriaData = new CategoriaData();

        public object BusinessCategoria(GeneralEntity genEnt)
        {
            try
            {

                return categoriaData.DataCategoria(genEnt);

            }
            catch (Exception)
            {

                throw;

            }
        }
    }
}
