using Data;
using Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class AlmacenBusiness
    {

        AlmacenData almacenData = new AlmacenData();

        public object BusinessAlmacen(GeneralEntity genEnt)
        {
            try
            {

                return almacenData.DataAlmacen(genEnt);

            }
            catch (Exception)
            {

                throw;

            }
        }


    }
}
