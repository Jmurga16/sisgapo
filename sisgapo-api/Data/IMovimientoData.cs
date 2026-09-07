using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface IMovimientoData
    {
        Task<object> DataMovimiento(GeneralEntity genEnt);
    }
}
