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
	VALUES('Junin','https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Nevado_de_Huaytapallana.jpg/960px-Nevado_de_Huaytapallana.jpg')
INSERT INTO TBL_ZONA(sNombre,sRutaImagen)
	VALUES('Ancash','https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Nevado_Huascar%C3%A1n_%C3%81ncash.jpg/960px-Nevado_Huascar%C3%A1n_%C3%81ncash.jpg')
INSERT INTO TBL_ZONA(sNombre,sRutaImagen)
	VALUES('Lima','https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=600&h=400&fit=crop')
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

--TABLA ALMACEN
INSERT INTO TBL_ALMACEN(sNombre,sDireccion,nIdSupervisor,nIdZona,bEstado)
	VALUES('Satipo','Calle Satipo 1',2,1,1)
GO

INSERT INTO TBL_ALMACEN(sNombre,sDireccion,nIdSupervisor,nIdZona,bEstado)
	VALUES('Almacen Fisico 1 - Ancash','Calle Huaylas 101',2,1,1)
GO


--TABLA CATEGORIA
INSERT INTO TBL_CATEGORIA(sNombre,sDescripcion, bEstado)
	VALUES('Café Orgánico','Tipo de café producido sin la ayuda de sustancias químicas artificiales',1)
GO
INSERT INTO TBL_CATEGORIA(sNombre,sDescripcion, bEstado)
	VALUES('Frutos Secos','En su composición natural tienen menos de un 50 % de agua',1)
GO

--TABLA PRODUCTO
INSERT INTO TBL_PRODUCTO(sNombre, bEstado)
	VALUES('Café Orgánico: The Bean Coffee Company - Tostado Medio',1)
GO
INSERT INTO TBL_PRODUCTO(sNombre, bEstado)
	VALUES('Café Orgánico: Seatle´s Best Coffee - Tostado Oscuro',1)
GO
INSERT INTO TBL_PRODUCTO(sNombre, bEstado)
	VALUES('Café Orgánico de Perú: AmazonFresh',1)
GO

INSERT INTO TBL_PRODUCTO(sNombre, bEstado)
	VALUES('Frutos secos activados Alquimia',1)
GO

INSERT INTO TBL_PRODUCTO(sNombre, bEstado)
	VALUES('Chips artesanales de kale Luz Vital',1)
GO

--UNIDAD MEDIDA
INSERT INTO TBL_UNIDADMEDIDA(sNombre)
	VALUES('Kilogramos')
GO
INSERT INTO TBL_UNIDADMEDIDA(sNombre)
	VALUES('Gramos')
GO
INSERT INTO TBL_UNIDADMEDIDA(sNombre)
	VALUES('Unidad')
GO
INSERT INTO TBL_UNIDADMEDIDA(sNombre)
	VALUES('Paquete')
GO


--TABLA LOTE
INSERT INTO TBL_LOTE(sNombreLote , dFechaFab, dFechaVenc)
	VALUES('CA10001','2021-04-04','2021-10-10')
GO
INSERT INTO TBL_LOTE(sNombreLote , dFechaFab, dFechaVenc)
	VALUES('CA20001','2021-05-05','2021-11-11')
GO
INSERT INTO TBL_LOTE(sNombreLote , dFechaFab, dFechaVenc)
	VALUES('CA30001','2021-06-06','2021-12-12')
GO
INSERT INTO TBL_LOTE(sNombreLote , dFechaFab, dFechaVenc)
	VALUES('FS10001','2021-07-07','2022-1-1')
GO
INSERT INTO TBL_LOTE(sNombreLote , dFechaFab, dFechaVenc)
	VALUES('FS20001','2021-08-08','2022-2-2')
GO

--DETALLE PRODUCTO
INSERT INTO TBL_DET_PRODUCTO(nIdProducto,sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
	VALUES(1,'Mezclado de acidez y cuerpo que comienza a regalar a los aromas',
			3,16,10,1)
GO

INSERT INTO TBL_DET_PRODUCTO(nIdProducto,sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
	VALUES(2,'Los granos de café se tuestan a mano en pequeños lotes para garantizar el café más fresco posible',
			3,10,8,2)
GO

INSERT INTO TBL_DET_PRODUCTO(nIdProducto,sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
	VALUES(3,'Café peruano tostado medio fragante con un final suave',4,12,18,3)
GO

INSERT INTO TBL_DET_PRODUCTO(nIdProducto,sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
	VALUES(4,'Los frutos acitvados despierta la vitalidad enzimatica de la semilla',2,50,15,4)
GO

INSERT INTO TBL_DET_PRODUCTO(nIdProducto,sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
	VALUES(5,'Chips de kale',2,20,14,5)
GO

--TABLA CATEGORIA X PRODUCTO
INSERT INTO TBL_CAT_PROD(nIdAlmacen,nIdCategoria,nIdProducto)
	VALUES(1,1,1)
GO

INSERT INTO TBL_CAT_PROD(nIdAlmacen,nIdCategoria,nIdProducto)
	VALUES(1,1,2)
GO

INSERT INTO TBL_CAT_PROD(nIdAlmacen,nIdCategoria,nIdProducto)
	VALUES(2,1,3)
GO

INSERT INTO TBL_CAT_PROD(nIdAlmacen,nIdCategoria,nIdProducto)
	VALUES(1,2,4)
GO

INSERT INTO TBL_CAT_PROD(nIdAlmacen,nIdCategoria,nIdProducto)
	VALUES(2,2,5)
GO


