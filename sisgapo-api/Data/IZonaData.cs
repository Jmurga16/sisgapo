using Entity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public interface IZonaData
    {
        Task<List<ZonaEntity>> LIS_ZonaData();
        Task<List<ZonaEntity>> LIS_ZonaUnicoData(int nIdZona);
        Task<string> CREATE_ZonaData(ZonaEntity objZonaEnt);
        Task<string> UPDATE_ZonaData(ZonaEntity objZonaEnt);
        Task<string> ESTADO_ZonaData(int nIdZona, bool bEstado);
    }
}
