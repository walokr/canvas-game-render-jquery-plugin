/**
 * ExtensibleObject has an easy way to assign properties or add user defined ones.
 * Remember: First create the object, then use setOptions (Don´t use all in the same sentense - point separated) 
 *
 * @constructor
 * @version 0.1.1 - First beta release.
 *
 */
function ExtensibleObject() {
	// When options are defined, if the name is not an object property, 
	// the extra property is added to the extraProperties_ array;
	this.extraProperties_ = new Array();
}
/* Add a new VisualObject to the Children_ array
 * 
 * @param {VisualObject} children A VisualObject to add
 * @param {integer} position Order in the list used to repaint (lowest is 0, default is adding at end of the array if undefined)
 */
ExtensibleObject.prototype.setOptions = function(options){
	for (var key in options) {
		if (this.hasOwnProperty(key)) {
			this[key] = options[key];
		}
		else
			this.extraProperties_[key] = options[key];
	}
}

ExtensibleObject.prototype.getPropertyValue = function(key){
	if (this.hasOwnProperty(key)) {
		return this[key];
	}
	else
		return this.extraProperties_[key];
}
/**
 * Enumerator for Object Position Reference
 * @readonly
 * @enum {string} 
*/
VisualObject.positionReference = {
	CENTER : "center",
	LEFT_TOP : "left-top",
	LEFT_BOTTOM : "left-bottom"
}; 
/**
 * Abstract class: All objects are VisualObject.
 * 
 * @constructor
 * @version 0.1.1 - First beta release.
 *
 */
function VisualObject() {
	ExtensibleObject.call(this);
	// Array of VisualObjects
	this.Children_ = new Array();
	// Visibility : the parent visibility is inherited but the value is not modified
	this.visible = true;	
	// Relative Position of the parent
	this.x = 0;
	this.y = 0;
	// Size relative
	this.width = 100;
	this.height = 100;
	// Rotation angle in degrees
	this.rotation = 0;
	// True if it is a dynamic object
	this.isDynamic = false;
	// Position Reference
	this.positionReference = VisualObject.positionReference.CENTER;
}	
// These two lines define VisualObject inheritance and constructor.
VisualObject.prototype = Object.create(ExtensibleObject.prototype);
VisualObject.prototype.constructor = VisualObject;

/* Add a new VisualObject to the Children_ array
 * 
 * @param {VisualObject} children A VisualObject to add
 * @param {integer} position Order in the list used to repaint (lowest is 0, default is adding at end of the array if undefined)
 */
VisualObject.prototype.addChild = function(child, position) {
	if (typeof position === 'undefined' || position >= this.Children_.length || position < 0)
		this.Children_.push(child);
	else 
		this.Children_.splice(position, 0, child);
};

/* Visible property getter
 * @return {Boolean} The visible property value (not necessary the object is shown if any parent is not visible).
 */
VisualObject.prototype.getVisible = function(){
	return this.visible;
};

/* Visible property setter
 * @param {Boolean} value Stablish the new value to the visible property value (not necessary the object is shown if any parent is not visible).
 */
VisualObject.prototype.setVisible = function(value){
	this.visible = value;
	this.changed_ = true;
};

/* Position getter
 * @return {Object} Current Position Information (x, y, posRef).
 */
VisualObject.prototype.getCurrentPosition = function(){
	return {"x" : this.x, "y" : this.y, "posRef" : this.positionReference} ;
};

/* X coord property getter
 * @return {number} The X coord value.
 */
VisualObject.prototype.getX = function(){
	return this.x;
};

/* Y coord property getter
 * @return {number} The Y coord value.
 */
VisualObject.prototype.getY = function(){
	return this.y;
};

/* Position Reference getter
 * @return {VisualObject.positionReference} The Position reference enum value adopted.
 */
VisualObject.prototype.getPositionReference = function(){
	return this.positionReference;
};

/* X coord property setter
 * @param {number} value Stablish the new X coord value.
 */
VisualObject.prototype.setX = function(value){
	if (this.x !== value){
		this.changed_ = true;
		this.x = value;
	}
};

/* Y coord property setter
 * @param {number} value Stablish the new Y coord value.
 */
VisualObject.prototype.setY = function(value){
	if (this.y !== value){
		this.changed_ = true;
		this.y = value;
	}
};

/* Refresh Object in context
 * @param {Object} ctx Context where the object must be drawn.
 */
VisualObject.prototype.refresh_ = function(ctx){
	if (this.image !== null){
		ctx.drawImage(this.image, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height);;
	}
	for (var i=0;i<this.Children_.length;i++){
		this.Children_[i].refresh_(ctx);
	}	
} 


/**
 * Canvas container.
 * 
 * @constructor
 * @param {Canvas} The canvas used to render the objects.
 * @version 0.1.1 - First beta release.
 *
 */
function Viewport(canvas){
	VisualObject.call(this);
	this.canvas_ = canvas;
	this.fps_ = 30;
	this.spritesFramesInSameValue_ = 30;
	this.timeout_ ;
	this.framesCount_ = 0;
	this.width = canvas.width;
	this.height = canvas.height;
	this.x = 0;
	this.y = 0;
}
// These two lines define Viewport inheritance and constructor.
Viewport.prototype = Object.create(VisualObject.prototype);
Viewport.prototype.constructor = Viewport;

Viewport.prototype.redraw_ = function(){
	var spritesChange = (this.framesCount_ % this.spritesFramesInSameValue_ == 0);
	if (spritesChange){
		for (var i=0;i<this.Children_.length;i++){
			this.Children_[i].update();
		}
	}
		
	var ctx=this.canvas_.getContext("2d");
	ctx.clearRect(this.x, this.y, this.width, this.height);
	for (var i=0;i<this.Children_.length;i++){
		
		this.Children_[i].refresh_(ctx);
	}
	this.framesCount_++;
	if (this.framesCount_ == this.fps_)
		this.framesCount_ = 1;
}
/* Redraws start.
 */
Viewport.prototype.start = function(){
	var _this = this;
	this.timeout_ = setInterval(function(_this) {
						_this.redraw_(_this);
					}						
					, 1/this.fps_*1000, this);
}
/* Redraws stop.
 */
Viewport.prototype.stop = function(){
	var _this = this;
	clearTimeout(_this.timeout_);
}

/* fps property getter.
 * @return {Boolean} The fps property value.
 */
Viewport.prototype.getFps = function(){
	return this.fps_;
};

/* fps property setter.
 * @param {Boolean} value New value for the fps property.
 */
Viewport.prototype.setFps = function(value){
	this.fps_ = value;
};
/* spritesFramesInSameValue property getter.
 * @return {Boolean} The fps property value.
 */
Viewport.prototype.getSpritesFramesInSameValue = function(){
	return this.spritesFramesInSameValue_;
};

/* spritsFramesInSameValue property setter.
 * @param {Boolean} value New value for the fps property.
 */
Viewport.prototype.setSpritesFramesInSameValue = function(value){
	this.spritesFramesInSameValue_ = value;
};

/**
 * Container of objects.
 * 
 * @constructor
 * @version 0.1.1 - First beta release.
 *
 */
function Layer(){ 
	VisualObject.call(this);
	// Dirty status (if true must refresh)
	this.changed_ = true;
	// The object image (may be undefined)
	this.image = null;
	// source coordinates and size (in pixeles)
	this.sourceX = 0;
	this.sourceY = 0;
	this.sourceWidth = 100;
	this.sourceHeight = 100;	
	// the states objects defines the animation
	this.states = new Object;
	// The current sprite State
	this.currentState_ = "";
	this.currentColInState_ = 0;
	this.animationsAfterMove_ = 0;
	this.pendingMovements_ = 0;
}
// These two lines define Layout inheritance and constructor.
Layer.prototype = Object.create(VisualObject.prototype);
Layer.prototype.constructor = Layer;

Layer.prototype.setCurrentState = function(value){
	if (value != this.currentState_){
		this.currentState_ = value;
		this.sourceY = this.states[this.currentState_]["row"] * this.sourceHeight;
	}
};
Layer.prototype.setAnimationsAfterMove = function(value){
	this.animationsAfterMove_ = value;
};

/* Update sprite position in image
 *
 */
Layer.prototype.update = function(){
	if (this.image !== null && (this.changed_ || this.pendingMovements_ > 0)){
		this.currentColInState_++;
		if (this.currentColInState_ > this.states[this.currentState_]["cols"].length-1)
			this.currentColInState_ = 0;
		this.sourceX = this.states[this.currentState_]["cols"][this.currentColInState_] * this.sourceWidth;
		this.changed_ = false;
		if (this.pendingMovements_ > 0)
			this.pendingMovements_--;
	}
	for (var i=0;i<this.Children_.length;i++){
		this.Children_[i].update();
	}
};

Layer.prototype.setX = function(value){
	VisualObject.prototype.setX.call(this, value);
	this.pendingMovements_ = this.animationsAfterMove_;
}

Layer.prototype.setY = function(value){
	VisualObject.prototype.setY.call(this, value);
	this.pendingMovements_ = this.animationsAfterMove_;
}

/**
 * Sprite (based on an image object).
 * 
 * @constructor
 * @version 0.1.1 - First beta release.
 *
 */
function Sprite(){ 
	Layer.call(this);
}
// These two lines define Sprite inheritance and constructor.
Sprite.prototype = Object.create(Layer.prototype);
Sprite.prototype.constructor = Sprite;

