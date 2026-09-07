using System;
using System.ComponentModel.DataAnnotations;

namespace Entity
{
    public class LoginEntity
    {
        [Required]
        [MaxLength(100)]
        public string sNombreUsuario { get; set; }

        [Required]
        public string sContrasenia { get; set; }
    }

    //Lleva el hash: no debe devolverse al cliente.
    public class CredencialEntity
    {
        public int nIdUsuario { get; set; }
        public int nIdRol { get; set; }
        public string sNombreUsuario { get; set; }
        public string sContrasenia { get; set; }
        public string sNombrePersona { get; set; }
    }

    public class SesionEntity
    {
        public string sToken { get; set; }
        public int nIdUsuario { get; set; }
        public int nIdRol { get; set; }
        public string sNombreUsuario { get; set; }
        public string sNombrePersona { get; set; }
        public DateTime dExpira { get; set; }
    }
}
