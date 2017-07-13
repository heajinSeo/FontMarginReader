/*
	Chrysler Font Measuring Tool
	by Heajin Seo. Jan.2017
*/

var fontMeasure = {
	
	status : 'ready',
	container : null,
	assetPath : '',
	fontArray : [],
	loadingInx : 0,
	testString : "QJjABCDEFGHIKLMNOPRSTUVWXYZgpqybdfhikltacemnorsuvwxz1234567890,;.:$%+-†",
	testStringLength : function(){ return this.testString.length; },
	/*{ 
		upperCase:'ABCDEFGHIKLMNOPRSTUVWXYZ', median : 'acemnorsuvwxz', capheight : 'bdfhiklt', baseline:'gpqy', descender:'QJj',  
		one:'1', numbers:'234567890', 
		specialDescend:',;', special:'.:', dallor:'$', perent:'%', plus:'+', minus:'-', dagger:'†'
	},*/
	fonts : [],
	margins : {},
	patterns : {},
	testTimer : null,
	
	init : function(_obj){
		for(p in _obj)
			this[p] = _obj[p];
		this.container = document.getElementById(this.container);
		this.loading(this.loadingInx);
	},
	
	loading : function(_inx){
		if(_inx == this.fontArray.length)
			return window.setTimeout(this.renderObjectToHtml.bind(this), 2000);
		this.loadingFont(this.fontArray[_inx]);
		this.loadingInx = _inx;
	},
	
	loadingFont : function(_data){
		var fontName = _data.replace(/\s/g,"-").replace(/\./gi, '');
		var fontFile = this.assetPath+_data.replace(/\s/g,"-");
		
		for(var se in this.fonts){
			if(this.fonts[se].file == fontFile)
				return console.log(this.margins[fontName]);
		}
		this.fonts.push( this.createFontObject(fontName, fontFile) );
		this.generateMatrix(fontName);
		
		var label = document.createElement('div');
		label.innerHTML = fontName;
		label.style.fontFamily = 'fontName';
		label.style.marginTop = '30px';
		this.container.appendChild(label);
		
		if(this.status != 'loading'){
			this.status = 'loading';
			this.testTimer = window.setInterval(this.loadingCheck.bind(this), 250);
		}
	},
	
	loadingCheck : function(){
		var session, complete, clearTimer = true;
		for(var se in this.fonts){
			complete = true;
			if(this.fonts[se].loaded == false){
				this.fonts[se].loaded = Boolean(Math.abs(this.fonts[se].width - this.fonts[se].dom.offsetWidth) < 5);
				this.fonts[se].width = this.fonts[se].dom.offsetWidth;
			}
			(complete) && (complete = this.fonts[se].loaded);
			(clearTimer) && (clearTimer = complete && this.fonts[se].tested);
			if(complete && !this.fonts[se].tested){
				this.callback(this.fonts[se].name);
				this.fonts[se].tested = true;
			}
		}
		
		if(clearTimer){
			this.status = 'complete';
			window.clearInterval(this.testTimer);
		}
	},
	
	createFontObject : function(_name, _file){
		this.createCSSnode(_name, _file);
		return {name:_name, file:_file, loaded:false, tested:false, width:-1, dom: this.createDiv(_name) };
	},
	
	createDiv : function(_name, _content){
		var tempDiv = document.createElement("div");
			tempDiv.id = 'TestDiv_'+ _name;
			tempDiv.innerHTML = typeof _content == 'undefined' ? "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890,.:;\"'$%+-†" : _content;
			tempDiv.setAttribute('style', "position:absolute;display:inline-block;opacity:0;width:auto;font-size:100px;font-family:"+ _name +", 'Arial';");
		document.getElementsByTagName('body')[0].appendChild(tempDiv);
		return tempDiv;
	},
	
	createCSSnode : function(_name, _file){
		var R = parseInt(Math.random() * 100000);
		var fontRules = "@font-face { font-family:"+ _name +"; src: url("+ _file +".woff?"+R+") format('woff'), url("+ _file +".ttf?"+R+") format('truetype'); }";
		var CSSnode = document.createElement("style");
			CSSnode.type = "text/css";
			CSSnode.appendChild( document.createTextNode(fontRules) );
		document.getElementsByTagName('head')[0].appendChild(CSSnode);
	},
	
	callback : function(_fontName){
		console.log(_fontName, ' is completely loading.');
		this.margins[_fontName] = [];
		var testString = "QJjABCDEFGHIKLMNOPRSTUVWXYZgpqybdfhikltacemnorsuvwxz1234567890,;.:$%+-†".split('');
		for(var i=0; i < testString.length; i++){
			this.margins[_fontName].push({ font:_fontName, dom:this.createDiv(_fontName, testString[i]), canvas:null, top:0, left:0, right:0, bottom:0 });
			window.setTimeout(this.createCanvas.call(this, this.margins[_fontName][i]), 200);
		}
	},
	
	createCanvas : function(_obj){
		var canvas = document.createElement("canvas");
		canvas.style.border = '1px solid #999';
		canvas.width = _obj.dom.offsetWidth;
		canvas.height = _obj.dom.offsetHeight;
		this.container.appendChild(canvas);
		_obj.canvas = canvas;
		var ctx = canvas.getContext("2d");
		ctx.font = "100px "+_obj.font;
		ctx.textBaseline = 'top';
		ctx.fillText(_obj.dom.innerHTML, 0, 0);
		this.trackingCanvas(_obj);
	},
	
	trackingCanvas : function(_obj){
		
		var ctx = _obj.canvas.getContext("2d"),
			accuracy = 1, topMargin = -1, leftMargin = -1, bottomMargin = 0, rightMargin = 0, 
			pixelData, i = 0, j = 0;
			
		for(i=0; i < _obj.canvas.width; i++){
			for( j=0; j < _obj.canvas.height; j++){
				pixelData = ctx.getImageData(i, j, 1, 1);
				if(pixelData.data[3] < 255)
					continue;
				(leftMargin < 0) && (leftMargin = i * accuracy);
				rightMargin = Math.max(rightMargin, i * accuracy+1);
			}
		}
		for(i=0; i < _obj.canvas.height; i++){
			for( j=0; j < _obj.canvas.width; j++){
				pixelData = ctx.getImageData(j, i, 1, 1);
				if(pixelData.data[3] < 255)
					continue;
				(topMargin < 0) && (topMargin = i * accuracy);
				bottomMargin = Math.max(bottomMargin, i * accuracy);
			}
		}
		
		ctx.strokeStyle = '#ff0000';
		ctx.beginPath();
		ctx.moveTo(leftMargin, 0);
		ctx.lineTo(leftMargin, _obj.canvas.height);
		ctx.moveTo(rightMargin, 0);
		ctx.lineTo(rightMargin, _obj.canvas.height);
		ctx.stroke();
		
		ctx.strokeStyle = '#0000ff';
		ctx.beginPath();
		ctx.moveTo(0, topMargin);
		ctx.lineTo(_obj.canvas.width, topMargin);
		ctx.moveTo(0, bottomMargin);
		ctx.lineTo(_obj.canvas.width, bottomMargin);
		ctx.stroke();
		
		_obj.content = _obj.dom.innerHTML;
		_obj.height = _obj.dom.offsetHeight;
		_obj.top = topMargin;
		_obj.left = leftMargin;
		_obj.right = _obj.canvas.width - rightMargin;
		_obj.bottom = _obj.canvas.height - bottomMargin;
		
		//this.container.removeChild(_obj.canvas);
		document.getElementsByTagName('body')[0].removeChild(_obj.dom);
		delete _obj.font;
		delete _obj.dom;
		delete _obj.canvas;
	},
	
	generateMatrix : function(_fontName){
		if(typeof this.margins[_fontName] == 'undefined')
			return window.setTimeout(function(){ this.generateMatrix(_fontName)}.bind(this), 500);
		
		var verified = Boolean(this.margins[_fontName].length == this.testStringLength());
		for(var i=0; i < this.margins[_fontName].length; i++){
			(verified) && (verified = Boolean(typeof this.margins[_fontName][i].content != 'undefined')); 
		}
		
		if(!verified)
			return window.setTimeout(function(){ this.generateMatrix(_fontName)}.bind(this), 500);
		
		var filteredHeight = '', filteredTop = [], filteredBottom = [], filteredLeft = [], filteredRight = [];
		for(i=0; i < this.margins[_fontName].length; i++){
			filteredHeight = Math.max(filteredHeight, this.margins[_fontName][i].height);
			setValue(filteredTop, this.margins[_fontName][i].content, this.margins[_fontName][i].top);
			setValue(filteredBottom, this.margins[_fontName][i].content, this.margins[_fontName][i].bottom);
			setValue(filteredLeft, this.margins[_fontName][i].content, this.margins[_fontName][i].left);
			setValue(filteredRight, this.margins[_fontName][i].content, this.margins[_fontName][i].right);
		} 
		this.patterns[_fontName] = {'height':filteredHeight, 'top':setPattern(filteredTop), 'left':setPattern(filteredLeft), 'right':setPattern(filteredRight), 'bottom':setPattern(filteredBottom)};
		this.loading(this.loadingInx+1);
		
		function setValue(_array, _cont, _value){
			if(_value < 5)
				_value = 0;
				
			for(var k=0; k < _array.length; k++){
				if(_array[k].value == _value || _array[k].value == _value + 1 || _array[k].value == _value - 1)
					return _array[k].content += _cont;
			}
			return _array.push({ content:_cont, value:_value});
		}
		function setPattern(_array){
			var returned = [];
			for(var k=0; k < _array.length; k++)
				returned.push({ pattern :getExp(_array[k].content), value:_array[k].value});
			return returned;
		}
		function getExp(_string){
			var Exp = '', con = _string.split('');
			for(var i=0; i < con.length; i++)
				Exp = Exp + (i > 0 ? '|' : '') + (con[i].match(/[^A-Za-z0-9|\|]/gi) ? '\\' : '') +con[i];
			Exp += '';
			return Exp;//new RegExp(Exp, "g");;
		}
	},
	
	renderObjectToHtml : function(){
		var innerHTML = 'var Chrysler_fontMargins = {<br>';
		for(var font in this.patterns){
			innerHTML += '&ensp;&ensp;"'+font+'":{<br>';
			for(var pro in this.patterns[font]){
				if(pro == 'height'){
					innerHTML += '&ensp;&ensp;&ensp;&ensp;'+pro+':'+ this.patterns[font][pro] +',<br>';
					continue;
				}
				innerHTML += '&ensp;&ensp;&ensp;&ensp;'+pro+':[<br>';
				for(var i=0; i < this.patterns[font][pro].length; i++){
					innerHTML += '&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;{ pattern : new RegExp(/'+ this.patterns[font][pro][i].pattern+'/), value:'+ this.patterns[font][pro][i].value+'}'+ (i == this.patterns[font][pro].length-1 ? '<br>' : ',<br>');
				}
				innerHTML += '&ensp;&ensp;&ensp;&ensp;],<br>';
			}
			innerHTML += '&ensp;&ensp;},<br>';
		}
		innerHTML += '}';
		this.container.innerHTML = innerHTML;
	}
}
