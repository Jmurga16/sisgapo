using Entity;
using System.Threading.Tasks;

namespace Data
{
    public interface IPanelData
    {
        Task<object> DataPanel(GeneralEntity genEnt);
    }
}
