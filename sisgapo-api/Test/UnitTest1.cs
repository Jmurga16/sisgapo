using Business;
using Entity;
using System;
using Xunit;

namespace Test
{
    public class UnitTest1
    {
        [Fact]
        public void Test1()
        {
            //Arrange
            var loginBusiness = new LoginBusiness();

            //Act
            var expected = new ResultEntity { nIdRol = 1, Result = 1 };
            var result = loginBusiness.BusinessAlmacen(new LoginEntity { sNombreUsuario = "admin", sContrasenia = "123456" });

            //Assert
            Assert.Equal(expected, result);

        }
    }
}
