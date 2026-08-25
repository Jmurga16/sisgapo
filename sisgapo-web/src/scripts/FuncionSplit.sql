CREATE FUNCTION [dbo].[Split] (@String nvarchar (4000), @Delimitador nvarchar (10)) 
                returns @ValueTable table ([id] int,[valor] nvarchar(4000))
begin
	DECLARE @NextString nvarchar(4000)
	DECLARE @Pos int
	DECLARE @NextPos int
	DECLARE @CommaCheck nvarchar(1)
	DECLARE @nFila INT = 1

	--Inicializa
	SET @NextString = ''
	SET @CommaCheck = right(@String,1) 
  
	SET @String = @String + @Delimitador
  
	--Busca la posición del primer delimitador
	SET @Pos = charindex(@Delimitador,@String)
	SET @NextPos = 1
  
	--Itera mientras exista un delimitador en el string
	WHILE (@pos <> 0)  
	BEGIN
		SET @NextString = substring(@String,1,@Pos - 1)
  
		INSERT INTO @ValueTable ([id], [valor]) Values (@nFila, @NextString)
  
		SET @String = substring(@String,@pos +1,len(@String))
   
		SET @nFila= @nFila+1
		SET @NextPos = @Pos
		SET @pos  = charindex(@Delimitador,@String)
	END
  
	RETURN
END