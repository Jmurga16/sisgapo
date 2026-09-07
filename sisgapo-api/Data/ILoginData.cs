using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface ILoginData
    {
        Task<CredencialEntity> ObtenerPorUsuario(string sNombreUsuario);
    }
}
