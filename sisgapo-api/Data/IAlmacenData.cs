using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface IAlmacenData
    {
        Task<object> DataAlmacen(GeneralEntity genEnt);
    }
}
