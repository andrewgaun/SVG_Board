String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
	
function drawSVGPolygon(svg, sides, length, id, rotate) {
	var points = genPoints(sides, length, null, rotate);
	
	var p = svg.polygon( $('#shapes')[0], points, {id: id, class: id});
	$(p).data({'points': points});
	return p;
}

function genPoints(sides, length, center, rotate){
	center = center || [0,0];
	rotate = rotate || 0;
	var x = center[0], y = center[1], points = [];
	for (i = 0; i < sides; i++) {
		var nx = x + length * Math.cos(2 * Math.PI * i / sides + rotate);
		var ny = y + length * Math.sin(2 * Math.PI * i / sides + rotate);
		points.push([nx,ny]);
	}
	return points;
}