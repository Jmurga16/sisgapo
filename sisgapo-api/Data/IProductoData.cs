using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface IProductoData
    {
        Task<object> DataProducto(GeneralEntity genEnt);
    }
}
