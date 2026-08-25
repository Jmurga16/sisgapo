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


