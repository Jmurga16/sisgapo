using Entity;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SISGAPO_API.Seguridad
{
    public static class GeneradorToken
    {
        public static SesionEntity fnEmitir(CredencialEntity oCredencial)
        {
            if (oCredencial == null)
            {
                throw new ArgumentNullException(nameof(oCredencial));
            }

            DateTime dExpira = DateTime.UtcNow.AddMinutes(ConfiguracionJwt.nMinutosVigencia);

            var lstClaims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, oCredencial.nIdUsuario.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, oCredencial.nIdUsuario.ToString()),
                new Claim(ClaimTypes.Name, oCredencial.sNombreUsuario ?? String.Empty),
                new Claim(ClaimTypes.Role, oCredencial.nIdRol.ToString())
            };

            var oClave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ConfiguracionJwt.sClave));
            var oFirma = new SigningCredentials(oClave, SecurityAlgorithms.HmacSha256);

            var oToken = new JwtSecurityToken(
                issuer: ConfiguracionJwt.sEmisor,
                audience: ConfiguracionJwt.sAudiencia,
                claims: lstClaims,
                expires: dExpira,
                signingCredentials: oFirma);

            return new SesionEntity
            {
                sToken = new JwtSecurityTokenHandler().WriteToken(oToken),
                nIdUsuario = oCredencial.nIdUsuario,
                nIdRol = oCredencial.nIdRol,
                sNombreUsuario = oCredencial.sNombreUsuario,
                sNombrePersona = oCredencial.sNombrePersona,
                dExpira = dExpira
            };
        }
    }
}
