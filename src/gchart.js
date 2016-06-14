// GChart
// requires pixi.js
(function(w){
if(w.gchart) return;
//
function ChartPoint(x,y,labelx,labely){
	var self = this;
	self.pos = new PIXI.Point(x,y);
	self.labelx = labelx;
	self.labely = labely;
}
function LineChartLine(){
	var self = this;
	self.parent = null;
	self.points = [];
	self.lineStyle = {
		lineWidth: 1,
		color: 0x0000ff,
		alpha: 1.0
	};
	self.graphics = new PIXI.Graphics();

	self.draw = function(){
		if(self.parent == null) return;
		self.graphics.clear();
		self.graphics.lineStyle(self.lineStyle.lineWidth,self.lineStyle.color,self.lineStyle.alpha);
		for(var i = 0; i < self.points.length; i++){
			var p = self.parent._rel(self.points[i].pos);
			if(i == 0)
				self.graphics.moveTo(p.x, p.y);
			else
				self.graphics.lineTo(p.x, p.y);
			//TODO: labels and interactive stuff!
		}
	};

	self.push = function(x, y, labelX, labelY){
		var p = new ChartPoint(x,y,labelX,labelY);
		self.points.push(p);
	};
}
function LineChart(width, height){
	var self = this;
	self.size = new PIXI.Point(width,height);
	self.baselineOfset = new PIXI.Point(2,-2);
	self.padding = new PIXI.Point(50,50);

	self.minX = 0;
	self.maxX = 100;
	self.minY = 0;
	self.maxY = 100;
	//
	self.lines = new PIXI.Graphics();
	self.lineList = [];
	//
	self.guideYCFG = {
		format: function(v){return (Math.round(v*100)/100).toString()},
		labels: [],
		quantity: 0,
		lineStyle: {
			lineWidth: 1,
			color: 0x0000ff,
			alpha: 0.3
		},
		labelStyle: {
			font: '14px Arial',
			fill: '#0000dd',
			align: 'right'
		},
		labelOffsetX: -4
	};
	self.guideY = new PIXI.Graphics();
	self.guideXCFG = {
		format: function(v){return (Math.round(v*100)/100).toString()},
		labels: [],
		quantity: 0,
		lineStyle: {
			lineWidth: 1,
			color: 0x0000ff,
			alpha: 0.3
		},
		labelStyle: {
			font: '14px Arial',
			fill: '#0000dd',
			align: 'center'
		},
		labelOffsetY: 4
	};
	self.guideX = new PIXI.Graphics();
	//
	self.container = new PIXI.Container();
	//
	self.setWidth = function(v){
		self.size.x = v;
		return self;
	};
	self.getWidth = function(){
		return self.size.x;
	};
	self.setHeight = function(v){
		self.size.y = v;
		return self;
	};
	self.getHeight = function(){
		return self.size.y;
	};
	self.baseline = new PIXI.Graphics();
	self.container.addChild(self.baseline);
	self.container.addChild(self.lines);
	self.container.addChild(self.guideY);
	self.container.addChild(self.guideX);

	self.x0 = function(){
		return self.padding.x;
	};
	self.x1 = function(){
		return self.size.x-self.padding.x;
	};
	self.y0 = function(){
		return self.padding.y;
	};
	self.y1 = function(){
		return self.size.y-self.padding.y;
	};

	self._rel = function(p){
		var o = new PIXI.Point(0,0);
		// (p.x-self.minX)/(self.maxX-self.maxX) = (o.x-self.x0())/(self.x1()-self.x0())
		// ((p.x-self.minX)/(self.maxX-self.maxX))*(self.x1()-self.x0()) = (o.x-self.x0())
		// ((p.x-self.minX)/(self.maxX-self.maxX))*(self.x1()-self.x0()) + self.x0() = o.x
		o.x = ((p.x-self.minX)/(self.maxX-self.minX))*(self.x1()-self.x0()) + self.x0();
		o.y = ((p.y-self.minY)/(self.maxY-self.minY))*(self.y0()-self.y1()) + self.y1();
		return o;
	}

	self.addLine = function(line){
		line.parent = self;
		self.lines.addChild(line.graphics);
		self.lineList.push(line);
	};

	self.updateGuideY = function(){
		self.guideY.removeChildren();
		if(self.guideYCFG.labels.length > 0){
			var ls = self.guideYCFG.lineStyle;
			for(var i = 0; i < self.guideYCFG.labels.length; i++){
				var f = new PIXI.Text(self.guideYCFG.labels[i][1], self.guideYCFG.labelStyle);
				f.x = self.x0()+self.baselineOfset.x+self.guideYCFG.labelOffsetX;
				f.y = self._rel(new PIXI.Point(0,self.guideYCFG.labels[i][0])).y;
				f.anchor = new PIXI.Point(1,0.5);
				self.guideY.addChild(f);
				// line
				self.guideY.lineStyle(ls.lineWidth,ls.color,ls.alpha);
				self.guideY.moveTo(f.x-self.guideYCFG.labelOffsetX,f.y);
				self.guideY.lineTo(self.x1(),f.y);
			}
		}else if(self.guideYCFG.quantity > 1){
			var ls = self.guideYCFG.lineStyle;
			var div = (self.maxY - self.minY)/self.guideYCFG.quantity;
			for(var i = 0; i < self.guideYCFG.quantity-1; i++){
				var raw_value = div * (i+1) + self.minY;
				var f = new PIXI.Text(self.guideYCFG.format(raw_value) , self.guideYCFG.labelStyle);
				f.x = self.x0()+self.baselineOfset.x+self.guideYCFG.labelOffsetX;
				f.y = self._rel(new PIXI.Point(0,raw_value)).y;
				f.anchor = new PIXI.Point(1,0.5);
				self.guideY.addChild(f);
				// line
				self.guideY.lineStyle(ls.lineWidth,ls.color,ls.alpha);
				self.guideY.moveTo(f.x-self.guideYCFG.labelOffsetX,f.y);
				self.guideY.lineTo(self.x1(),f.y);
			}
		}
	};
	self.updateGuideX = function(){
		self.guideX.removeChildren();
		if(self.guideXCFG.labels.length > 0){
			var ls = self.guideXCFG.lineStyle;
			for(var i = 0; i < self.guideXCFG.labels.length; i++){
				var f = new PIXI.Text(self.guideXCFG.labels[i][1], self.guideXCFG.labelStyle);
				f.x = self._rel(new PIXI.Point(self.guideXCFG.labels[i][0],0)).x;
				f.y = self.y1()+self.baselineOfset.y+self.guideXCFG.labelOffsetY;
				f.anchor = new PIXI.Point(0.5,0);
				self.guideX.addChild(f);
				// line
				self.guideX.lineStyle(ls.lineWidth,ls.color,ls.alpha);
				self.guideX.moveTo(f.x,f.y-self.guideXCFG.labelOffsetY);
				self.guideX.lineTo(f.x,self.y0());
			}
		}else if(self.guideXCFG.quantity > 1){
			var ls = self.guideXCFG.lineStyle;
			var div = (self.maxX - self.minX)/self.guideXCFG.quantity;
			for(var i = 0; i < self.guideXCFG.quantity+1; i++){
				var raw_value = div * (i) + self.minX;
				var f = new PIXI.Text(self.guideXCFG.format(raw_value), self.guideXCFG.labelStyle);
				f.x = self._rel(new PIXI.Point(raw_value,0)).x;
				f.y = self.y1()+self.baselineOfset.y+self.guideXCFG.labelOffsetY;
				f.anchor = new PIXI.Point(0.5,0);
				self.guideX.addChild(f);
				// line
				self.guideX.lineStyle(ls.lineWidth,ls.color,ls.alpha);
				self.guideX.moveTo(f.x,f.y-self.guideXCFG.labelOffsetY);
				self.guideX.lineTo(f.x,self.y0());
			}
		}
	};

	self.update = function(all){
		// draw baseline
		self.baseline.clear();
		self.baseline.lineStyle(2,0x000000,1);
		// hor
		self.baseline.moveTo(self.x0(),self.y1()+self.baselineOfset.y);
		self.baseline.lineTo(self.x1(),self.y1()+self.baselineOfset.y);
		// vert
		self.baseline.moveTo(self.x0()+self.baselineOfset.x,self.y0());
		self.baseline.lineTo(self.x0()+self.baselineOfset.x,self.y1());

		
		if(all){
			// draw the guides
			// y
			self.updateGuideY();
			self.updateGuideX();
		}

		for(var i = 0; i < self.lineList.length; i++){
			self.lineList[i].draw();
		}

		return self;
	};
	//init
	self.update();
}
w.gchart = {
	LineChart: LineChart,
	LineChartLine: LineChartLine
};
//
})(window);