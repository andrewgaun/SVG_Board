function Unit(tile, player, options) {
	var settings = $.extend( {
		move : 0,
		range : 1,
		str : 10
	}, options);
	
	this.tile = tile;
	
	this.element = tile.board.svg.use(this.tile.tile, '#' + settings.name, 
		{class : 'unit' } );
	
	$.extend( this, settings );
	return this;
}
Unit.prototype.click = function() {
	this.moveRange = this.moveRange 
		|| this.tile.getTilesInRange(this.move, this.landMovementConstraint);
	for (var t in this.moveRange) {
		if (this.moveRange[t] != this.tile) {
			var className = this.moveRange[t].unit ? 'highlight attack' : 'highlight move';
			this.tile.board.svg.use( this.moveRange[t].tile, '#hex', {class:className} );
		}
	}
	return this.clickReaction;
}
Unit.prototype.clickReaction = function(tile) {
	if (this.moveRange[tile.name]) {
/*			if ( tile.unit ) {
			
		}
		else
*/
			this.moveUnit( tile );
		return true;
	}
}

Unit.prototype.landMovementConstraint = function(tile){
	return !tile.terrain.land;
}
Unit.prototype.moveUnit = function(tile) {
	this.tile.unit = null;
	this.element.parentNode.removeChild( this.element );
	this.tile = tile;
	this.element = tile.board.svg.use(this.tile.tile, '#' + this.name, 
		{class : 'unit' } );
	tile.unit = this;
	this.moveRange = null;
}