using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface ICategoriaData
    {
        Task<object> DataCategoria(GeneralEntity genEnt);
    }
}
