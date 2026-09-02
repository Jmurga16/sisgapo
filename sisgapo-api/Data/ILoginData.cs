using Entity;

namespace Data
{
    public interface ILoginData
    {
        CredencialEntity ObtenerPorUsuario(string sNombreUsuario);
    }
}
