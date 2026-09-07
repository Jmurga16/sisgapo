using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface IUsuarioData
    {
        Task<object> LIS_UsuarioData(GeneralEntity erp);
    }
}
