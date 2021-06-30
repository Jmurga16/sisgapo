--POBLACION DE DATOS
USE DB_SISGAPO
GO

--TABLA DOCUMENTOS
INSERT INTO TBL_DOCUMENTO(sNombreDoc)
	VALUES('DNI')
INSERT INTO TBL_DOCUMENTO(sNombreDoc)
	VALUES('CARNET EXT.')
GO

--TABLA ROLES
INSERT INTO TBL_ROL(sNombreRol)
	VALUES('Administrador')
INSERT INTO TBL_ROL(sNombreRol)
	VALUES('Supervisor')
INSERT INTO TBL_ROL(sNombreRol)
	VALUES('Asistente')
GO

--TABLA ZONAS
INSERT INTO TBL_ZONA(sNombre,sRutaImagen)
	VALUES('Junin','https://ddcjunin.files.wordpress.com/2021/01/cropped-portadawp.png')
INSERT INTO TBL_ZONA(sNombre,sRutaImagen)
	VALUES('Ancash','https://camisetasdefutbol.pe/wp-content/uploads/camisetas-deportivas-futbol-ancash.jpg')
INSERT INTO TBL_ZONA(sNombre,sRutaImagen)
	VALUES('Lima','https://i.ytimg.com/vi/TrLBLghtnc4/maxresdefault.jpg')
GO

--TABLA USUARIOS
INSERT INTO TBL_USUARIO
		(sNombres,sApellidos,nTipoDoc,sNumDoc,sSexo,nRol,sDireccion,nTelefono,dFechaNacimiento,bEstado)
VALUES('Administrador',null,1,'80808080','M',1,'Calle Satipo 1', 989898989,'1990-1-1',1)
GO

INSERT INTO TBL_USUARIO
		(sNombres,sApellidos,nTipoDoc,sNumDoc,sSexo,nRol,sDireccion,nTelefono,dFechaNacimiento,bEstado)
VALUES('Alex','Quispe',1,'70807080','M',2,'Calle Salaverry 1', 989898989,'1997-5-7',1)
GO

--TABLA LOGIN
INSERT INTO TBL_LOGIN(nIdUsuario,sNombreUsuario,sContrasenia)
	VALUES(1,'admin','123456')
GO
INSERT INTO TBL_LOGIN(nIdUsuario,sNombreUsuario,sContrasenia)
	VALUES(2,'alex.quispe','123456')
GO

--TABLA LOGIN
INSERT INTO TBL_ALMACEN(sNombre,sDireccion,nIdSupervisor,nIdZona,bEstado)
	VALUES('Satipo','Calle Satipo 1',2,1,1)
GO


