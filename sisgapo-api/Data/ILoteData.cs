using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface ILoteData
    {
        Task<object> DataLote(GeneralEntity genEnt);
    }
}
