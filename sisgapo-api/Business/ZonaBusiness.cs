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
    public class ZonaBusiness
    {
        private readonly ZonaData zonaData = new ZonaData();
        
        public List<ZonaEntity> LIS_ZonaBusiness()
        {
            return zonaData.LIS_ZonaData();
        }

        public List<ZonaEntity> LIS_ZonaUnicoBusiness(int id_zona)
        {
            return zonaData.LIS_ZonaUnicoData(id_zona);
        }

        public String CREATE_ZonaBusiness(ZonaEntity objZonasEnt)
        {
            return zonaData.CREATE_ZonaData(objZonasEnt);
        }

    
    }
}
