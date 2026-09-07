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
        private readonly IZonaData zonaData;

        public ZonaBusiness() : this(new ZonaData())
        {
        }

        public ZonaBusiness(IZonaData zonaData)
        {
            this.zonaData = zonaData ?? throw new ArgumentNullException(nameof(zonaData));
        }

        public async Task<List<ZonaEntity>> LIS_ZonaBusiness()
        {
            return await zonaData.LIS_ZonaData();
        }

        public async Task<List<ZonaEntity>> LIS_ZonaUnicoBusiness(int id_zona)
        {
            return await zonaData.LIS_ZonaUnicoData(id_zona);
        }

        public async Task<String> CREATE_ZonaBusiness(ZonaEntity objZonasEnt)
        {
            return await zonaData.CREATE_ZonaData(objZonasEnt);
        }

        public async Task<String> UPDATE_ZonaBusiness(ZonaEntity objZonasEnt)
        {
            return await zonaData.UPDATE_ZonaData(objZonasEnt);
        }

        public async Task<String> ESTADO_ZonaBusiness(int nIdZona, bool bEstado)
        {
            return await zonaData.ESTADO_ZonaData(nIdZona, bEstado);
        }

    
    }
}
