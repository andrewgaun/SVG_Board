/**
* This class holds a collection of tiles. Mostly used for board view movement.
*/

function Row(number, board) {
	this.columns = [];
	this.rowNumber = number;
	this.board = board;
	
	// Rows will be used for loading tiles.
	var transY = board.size * (number+1) * 1.5;
	this.row = board.svg.group( board.mainWindowGroup, 
		{id :'row-' + number, class : 'row', 
			transform:"translate(0,"+transY+")"});
	
	$(this.row).data('row', this);
	
	if ( number < board.firstRow || number > board.firstRow + board.rowLimit )
		this.row.parentNode.removeChild( this.row );
	
	return this;
}
Row.prototype.addTile = function(x) {
	var tile = new Tile(this.board, this, x);
	this.columns[x] = tile;
	this.board.fullGrid[x][this.rowNumber] = tile;
}