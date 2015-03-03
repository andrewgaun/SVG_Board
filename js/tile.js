function Tile(board, row, x) {
	this.tileClick = function() {
		var tile = $(this), 
			board = tile.board,
			terrain = tile.terrain,
			unit = tile.unit,
			menu = [];	
	}
	var xoffset = row.rowNumber % 2 ? 1.5 : 1;
	var transX = board.minRadius * (x + xoffset) * 2;
	
	this.name = x + '-' + row.rowNumber;
	this.tile = board.svg.group(row.row, 
		{ class: 'tile col-'+x + ' ' + this.name, 
			transform:"translate("+transX+",0)"});

	this.terrain = board.terrainsMap[board.layoutRows[row.rowNumber].charAt(x)];
	board.svg.use(this.tile, '#' + this.terrain.name);
	
	this.x = x;
	this.row = row;
	this.board = board;
	
	if ( x < board.firstCol || x > board.firstCol + board.columnLimit )
		this.tile.parentNode.removeChild( this.tile );
	
	$(this.tile).data('tile', this).mouseenter(this.tileHover).click(this.click);
	
	return this;
}
Tile.prototype.addUnit = function(unit, player){
	if ( typeof unit == 'string' )
		unit = new Unit(this, player, this.board.unitMap[unit]);
	this.unit = unit;
}
Tile.prototype.tileHover = function() {
	var tile = $(this).data('tile'), 
		board = tile.board,
		terrain = tile.terrain,
		unit = tile.unit,
		menu = [];
	
	for ( var i = 0; i < board.menuSize; i++ ) { menu[i]=''; }
	menu[0] = 'Terrain: ' + terrain.name.capitalize();
	
	if ( unit ) {
		menu[1] = 'Unit: ' + tile.unit.name.capitalize();
		menu[2] = 'Movement: ' + tile.unit.move;
		menu[3] = 'Range: ' + tile.unit.range;
		menu[4] = 'Strength: ' + tile.unit.str;
	}
	for ( var i = 0; i < board.menuSize; i++ ) {
		$('#menu-'+i).text(menu[i]);
	}
}
Tile.prototype.click = function() {
	var tile = $(this).data('tile');

	if ( tile.board.activeTile ) {
		$('.highlight').remove();
		if ( tile.board.activeTile.reaction ) {
			var done = 
				tile.board.activeTile.reaction.call( tile.board.activeTile.unit, tile);
			delete( tile.board.activeTile.reaction );
			if (done)
				return;
		}
	}
	
	if ( tile.unit ) {
		tile.reaction = tile.unit.click();
		tile.board.activeTile = tile;
	}
}
Tile.prototype.getTilesInRange = function(range, constraint, tiles){	
	tiles = tiles || {};
	constraint = constraint || function(){return false};
	
	if (range < 0 || constraint(this))
		return tiles;
	
	tiles[this.name] = this;

	for (var i = this.x; i <= this.x + 1; i++){
		for (var j = this.row.rowNumber - 1; j <= this.row.rowNumber + 1; j++){
			var t = j % 2 ? i-1 :i;
			
			if (t >= 0 && j >= 0 && t < this.board.boardWidth && j < this.board.boardHeight)
				tiles = this.board.fullGrid[t][j].getTilesInRange(range-1, constraint, tiles);
		}
	}
	
	var x = this.row.rowNumber % 2 ?  this.x + 1 : this.x - 1;
	if (x >= 0 && x < this.board.boardWidth)
		return this.board.fullGrid[x][this.row.rowNumber].getTilesInRange(range-1, constraint, tiles);
	return tiles;
}