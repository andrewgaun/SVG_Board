function Board(options) {
	// View functions
	this.zoomIn = function() {
		if (this.scale < 1.53) {
			this.scale += .02;
			this.applyWindowEvent('zoom');
		}
	}
	this.zoomOut = function() {
		if (this.scale > .45  && this.rowLimit + 1 < this.rows.length 
				&& this.columnLimit + 1 < this.rows[0].columns.length) {
			this.scale -= .02;
			this.applyWindowEvent('zoom');
		}
	}
	this.moveLeft = function() {
		this.applyWindowEvent('moveLeft');
	}
	this.moveRight = function() {
		this.applyWindowEvent('moveRight');
	}
	this.moveDown = function() {
		this.applyWindowEvent('moveDown');
	}
	this.moveUp = function() {
		this.applyWindowEvent('moveUp');
	}
	this.generateEdgeControlTriangles = function() {
		this.upTri = this.svg.polygon( [[0,0],[this.width,0],[this.width/2,this.height/2]], 
			{id: 'up', class: 'up direction'});
		this.rightTri = this.svg.polygon( [[this.width,0],[this.width, this.height],[this.width/2,this.height/2]], 
			{id: 'right', class: 'right direction'});
		this.bottomTri = this.svg.polygon( [[this.width, this.height],[0, this.height],[this.width/2,this.height/2]], 
			{id: 'down', class: 'down direction'});
		this.leftTri = this.svg.polygon( [[0, this.height],[0,0],[this.width/2,this.height/2]], 
			{id: 'left', class: 'left direction'});
		
		var _board = this;
		$('.direction').click(function(){
			_board['move' + this.id.capitalize()]();
		});
	}
	this.generateHex = function(horizontal) {
		size = this.size;
		var shapesDefs = svg.defs('shapes');
		rotate = horizontal ?  Math.PI * 2 / 12 : 0;
		
		
		var overlay = svg.radialGradient(shapesDefs, 'overlay', 
[['59%', '', 0], ['100%', 'black']], 
	0, 0, this.size * 1.2, 0, 0, {gradientUnits: 'userSpaceOnUse'});
		
		var p = drawSVGPolygon(this.svg, 6, size, 'hex', rotate);
		
		this.terrainsMap = {};
		
		for (var t in this.terrains) {
			var terrain = this.terrains[t];
			
			this.terrainsMap[terrain.key] = terrain;
			
			var tile = svg.group(shapesDefs, terrain.name);
			svg.use(tile, '#hex', {class:terrain.name});
			if ( terrain.href ) {
				svg.image(tile, -terrain.width/2, -terrain.height/2, terrain.width, terrain.height, terrain.href, 
					{transform:'scale('+this.minRadius * 1.9 / Math.max(terrain.height, terrain.width)+')'});
			}
			svg.use(tile, '#hex', {fill:'url(#overlay)'});
			
		}
	}
	this.generateUnits = function () {
		var unitsDefs = this.svg.defs('units');
	
		this.unitMap = {}
		for (var u in this.unitsTypes) {
			var unit = this.unitsTypes[u];
			
			this.unitMap[unit.name] = unit;
		
			svg.image(unitsDefs, -unit.width/2, -unit.height/2, unit.width, unit.height, unit.href, 
				{id: unit.name, class: unit.name, 
					transform:'scale('+ this.size * 1.2 / Math.max(unit.height, unit.width)+')'});
		}
	}
	
	this.initalUnitSetup = function () {
		for (var p in this.initalSetup) {
			var player = this.initalSetup[p];
			for (var unitType in player) {
				var locations = player[unitType];
				for (var l in locations) {
					var loc = locations[l],
						tile = this.fullGrid[loc[0]][loc[1]];

					tile.addUnit(unitType, p);
				}
			}
		}	
	};

	this.applyWindowEvent = function(type){
		var changed = true;
		switch(type) {
			case 'zoom':
				this.actualSize = this.size * this.scale;
				
				var rowLimit = Math.floor( this.height / (1.5 * this.actualSize) ) - 2,
					columnLimit = Math.floor( this.width / (2 * this.minRadius * this.scale) ) - 2;

				if (this.rows.length - 1 < this.firstRow + rowLimit) {
					this.firstRow =  this.rows.length - rowLimit - 1;
				}
				
				
				if (this.boardWidth - 1 < this.firstCol + columnLimit) {
					this.firstCol =  this.boardWidth - columnLimit - 1;
				}
				

				/* RESIZE ROWS */
				for ( var y = this.firstRow + rowLimit + 1; y <= this.firstRow + this.rowLimit; y++) {
					var row = this.rows[y].row;
					this.mainWindowGroup.removeChild( row );
				}
				for ( var y = this.firstRow; y <= this.firstRow + rowLimit; y++) {
					var row = this.rows[y].row;
					this.mainWindowGroup.appendChild( row );
				}
				this.rowLimit = rowLimit;
				/* RESIZE COLUMNS */
				for ( var i in this.rows ) {
					var row  = this.rows[i];
					for ( var x = this.firstCol + columnLimit + 1; 
							x <= this.firstCol + this.columnLimit; x++) {
						if (row.columns[x]){
							var tile = row.columns[x].tile;
							row.row.removeChild( tile );
						}
					}
					
					for ( var x = this.firstCol;
							x <= this.firstCol + columnLimit; x++) {
						if (row.columns[x]){
							var tile = row.columns[x].tile;
							row.row.appendChild( tile );
						}
					}
				}
				this.columnLimit = columnLimit;
				break;
			case 'moveUp':
				var removedRow = this.rows[this.firstRow + this.rowLimit].row, 
					nextRow = this.rows[this.firstRow -1],
					pn = removedRow.parentNode;
				
				if (nextRow) {
					console.log( pn, nextRow.row, removedRow);
					pn.appendChild( nextRow.row );
					pn.removeChild( removedRow );
					this.firstRow--;
				}
				break;
			case 'moveDown':
				var removedRow = this.rows[this.firstRow].row, 
					nextRow = this.rows[this.firstRow + this.rowLimit + 1],
					pn = removedRow.parentNode;
				
				if (nextRow) {
					pn.appendChild( nextRow.row );
					pn.removeChild( removedRow );
					this.firstRow++;
				}
				break;
			case 'moveRight':		
				 if ( this.firstCol + this.columnLimit + 1 >= this.boardWidth ) 
					return;

				this.firstCol++;
				for ( var i in this.rows ) {
					var row  = this.rows[i].row, 
						removedNode = this.fullGrid[this.firstCol - 1][i].tile, 
						nextNode = this.fullGrid[ this.firstCol + this.columnLimit ][i].tile;
					row.appendChild( nextNode );
					row.removeChild( removedNode );
				}
				
				this.x -= this.minRadius * 2;
				break;
			case 'moveLeft':
				if ( this.firstCol == 0 )
					return;

				this.firstCol--;
				for ( var i in this.rows ) {
					var row  = this.rows[i].row, 
						nextNode = this.fullGrid[this.firstCol][i].tile, 
						removedNode = this.fullGrid[ this.firstCol + this.columnLimit + 1 ][i].tile;
					row.appendChild( nextNode );
					row.removeChild( removedNode );
				}
				
				this.x += this.minRadius * 2;
				break;
			default:
				changed = false;
		}
		if (changed) {
			this.refreshWindow(type);
		}
	};
	
	this.refreshWindow = function(type){
		this.svg.change(this.mainWindowGroup, 
					{transform :'scale('+this.scale+
						') translate('+(this.firstCol * this.minRadius * -2)+
						', '+(this.firstRow * this.size * -1.5)+')'});
	}

	this.makeMenu = function() {
		var menuGroup = this.menuGroup = this.svg.group('menu');

		this.svg.rect(this.menuGroup, this.width * .025, this.height * .025, 
				this.width * .2, this.height * .2, 10 , 10, {class: 'menu'});
	
		var xoff = this.width * .025 * 1.15, yoff = this.height * .025,
			innerHeight = this.height * .2 - this.height * .025, ystep = innerHeight / this.menuSize;
	
		for ( var i = 0; i < this.menuSize; i++ ) {
			yoff += ystep;
			var mid = 'menu-'+i;
			var line = this.svg.text(this.menuGroup, xoff, yoff,
				'', { 'font-size' : ystep, id : mid});
		}
		
		$(menuGroup).mouseenter(function() {
			if ($(this).attr('transform')){
				svg.change(menuGroup, {transform : null});
			}
			else {
				svg.change(menuGroup, {transform : "translate(0,"+(settings.height * .7)+")"});
			}
		});
	}

	this.keyZoomControls = function (){
		var _this = this;			
		$(document).keydown(function(event, q,w) {
			switch(event.keyCode){
				case 49:
					_this.zoomOut();
					break;
				case 50: 
					_this.zoomIn();
					break;
				case 37:
					_this.moveLeft();
					break;
				case 38: 
					_this.moveUp();
					break;
				case 39:
					_this.moveRight();
					break;
				case 40:
					_this.moveDown();
					break;
			}
		});
	}

	var settings = $.extend( {
		width : 100, 
		height : 100, 
		size : 35,
		scale : 1,
		svg : null,
		mainWindowGroup : null,
		x : 0,
		y : 0,
		boardWidth : 50,
		boardHeight : 50,
		menuSize : 5,
		firstRow : 0,
		firstCol : 0
	}, options);
	
	if ( settings.layout ) {
		var rows = settings.layout.split('\n');
		settings.boardHeight = rows.length
		settings.boardWidth = rows[0].length
	}
	
	$.extend( this, settings );
	
	var svg = settings.svg;
	this.minRadius = Math.sin(2 * Math.PI / 6) * this.size;

	this.actualSize = settings.size * settings.scale; // TMBG!
	this.generateEdgeControlTriangles();
	
	//Main board panel
	var mainWindowGroup = svg.group('mainWindow', {'transform' :'scale('+ 
		settings.scale +') translate('+settings.x+', '+settings.y+')'});

	this.mainWindowGroup = mainWindowGroup;
	// Removing this makes loading the page much faster.
	mainWindowGroup.parentNode.removeChild(mainWindowGroup);

	// Generate hex shape and ireland and israel classes.
	this.generateHex(svg, settings.size);
	
	this.generateUnits();
	
	
	this.rowLimit = Math.floor( this.height / (1.5 * this.actualSize) ) - 2;
	this.columnLimit = Math.floor( this.width / (2 * this.minRadius * this.scale) ) - 2;
	
	this.rows = [];
	this.fullGrid = [];
	
	// maybe rework
	this.layoutRows = settings.layout ? settings.layout.split('\n') : null;
	
	for (var x = 0; x < settings.boardWidth; x++) {
		this.fullGrid[x] = [];
	}
	
	for(var y = 0; y < settings.boardHeight; y++) {
		// Rows will be used for loading tiles.	  		
		var row = new Row(y, this);

		for(var x = 0; x < settings.boardWidth; x++){ 
			row.addTile(x);
		}
		
		this.rows.push(row);
	}
	this.initalUnitSetup();
	
	svg.root().appendChild(mainWindowGroup);
	this.keyZoomControls();
	
	this.makeMenu();

	return this;
}