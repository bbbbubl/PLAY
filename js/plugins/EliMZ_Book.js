//==========================================================================
// EliMZ_Book.js
//==========================================================================

/*:
@target MZ

@plugindesc v1.3 - Essential plugin for all Eli plugins.
@author Hakuen Studio
@url https://www.patreon.com/posts/40821023

@help
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
If you like my work, please consider supporting me on Patreon!
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
============================================================================
Introduction
============================================================================

    This plugin optimizes all of my other plugins, making them less code and 
easier to maintain and implement improvements. It is not a core plugin, it 
does not overwrite any function of the standard codes of the rpg maker mz.

============================================================================
Features
============================================================================

Provide methods and code that add a better performance on all Eli plugins.

============================================================================
How to use
============================================================================

Put above all other Eli plugins.

You can use it in script calls. You can also copy and paste these's 
functions to your own plugins. Just give me the credits ^^

● Eli_Book
• eli.scene() → Returns the current scene.
• eli.ruleOf3(a, b, c) → Realize a simple rule of 3.
• eli.isScene(My_Scene) → Returns true if you are in the specified scene.
• eli.isFormula(String) → If the string is not a number, it will eval. 
Otherwise, it will parseInt.
• eli.nameToRGB(htmlColorName) → Convert an html color name to RGB color.
• eli.hexToRgb(hexColor) → Convert a hex color to RGB color.
• eli.convertEscapeVariablesOnly(text) → It will return a text with the 
\v[ID] converted.
• eli.convertEscapeCharacters(text) → Returns a text with all escape 
characters converted.
• eli.toLowerCaseArray(array) → Will return a new array with all string 
elements to lower case.
• eli.centerX(objWidth, baseWidth) → Returns the centered position of X.
• eli.centerY(objHeight, baseHeight) → Returns the centered position of Y.
• eli.centerPos(objWidth, objHeight, baseWidth, baseHeight) → Returns the 
centered position of X and Y.
• eli.divideByTheLargest(num1, num2) → Divides the largest number by 
the smallest.

● Game Player
• $gamePlayer.meta() → Return the meta of the actor Id that is the party 
leader.

● Game Event
• $gameMap.event(ID).meta() → Return the meta ​of the event id specified.
• $gameMap.event(ID).note() → Return the note of the event id specified.

● Image Manager
• ImageManager.saveOldCache() → It has to be used on the start method of a 
scene. It will save the current cache state.
• ImageManager.restoreOldCache() → It has to be used on the terminate method 
of a scene. It will set the cache to the saved one.
With this functions you simulate a clear cache, but only clear the cache 
generated for the current scene, and restore it to the old one, before 
enter on this scene.

● Sprite
• mySprite.scaledBitmapWidth() → Returns the sprite dimension value 
considering the scale.
• mySprite.scaledBitmapWidth() → Returns the sprite dimension value 
considering the scale.
• mySprite.stretchToScreen(aspectRatio, baseWidth, baseHeight) → Stretch 
the sprite bitmap to the screen. You can choose to keep or not the aspect 
ratio. The other parameters are set by the Screen size by default.

============================================================================
Terms of Use
============================================================================

https://www.hakuenstudio.com/rpg-maker/terms-of-use

============================================================================
Links
============================================================================

Facebook - https://www.facebook.com/hakuenstudio
Instagram - https://www.instagram.com/hakuenstudio
Twitter - https://twitter.com/hakuen_studio
Itch Io - https://hakuenstudio.itch.io/

============================================================================
Update log
============================================================================
Version 1.3 - 09/26/2020
- Created my own button class
Version 1.2 - 09/23/2020
- Changed the convert colors function.
Version 1.1 - 09/16/2020
• Add new methods(see more on help file):
• eli.ruleOf3 (don't laugh... xD)
• eli.centerX
• eli.centerY
• eli.centerPos
• eli.divideByTheLargest
• Sprite.prototype.scaledBitmapWidth
• Sprite.prototype.scaledBitmapHeight
• Sprite.prototype.stretchToScreen
• ImageManager.saveOldCache
• ImageManager.restoreOldCache
Version 1.0 - 10/09/2020
• Plugin release!
*/

"use strict"

/* ========================================================================== */
/*                                 BASIC SETUP                                */
/* ========================================================================== */

var Eli = Eli || {};
Eli.Book = Eli.Book || {};

var Imported = Imported || {};
Imported.Eli_Book = true;

Eli.Book.Version = 1.3; 

Eli.Book.Parameters = PluginManager.parameters(`EliMZ_Book`);
Eli.Book.Param = Eli.Book.Param || {};

/* ========================================================================== */
/*                                PLUGIN CLASS                                */
/* ========================================================================== */

class Eli_Book {

    constructor(){
        this.initialize();
    };

    initialize(){
        this.escapeCodes = [];
        this.extractMetaReg = /<([^<>:]+)(:?)([^>]*)>/g;
        this.reserveImages = [];
    };

    convertParameters(parameters){ // Thanks to LTN games!
        const parseParameters = function(string)  {
            try {
                return JSON.parse(string, (key, value) => {
                    try {
                        return parseParameters(value)
                    } catch (e) {
                        return value
                    } 
                })
            } catch (e) {
                return string
                }
        }
        return parseParameters(JSON.stringify(parameters));
    };

    scene(){
        return SceneManager._scene;
    };

    isScene(scene){
        return this.scene() instanceof scene;
    }

    isFormula(param) {
        return isNaN(param) ? eval(param) : +param;
    };
    
    startWithNumber(param) {
        return isNaN(param[0]) ? String(param) : +param;
    };

    colorNames(){
        const colors = [
            "ALICEBLUE", "ANTIQUEWHITE", "AQUA", "AQUAMARINE", "AZURE", "BEIGE", "BISQUE", "BLACK", "BLANCHEDALMOND", "BLUE", "BLUEVIOLET", "BROWN", 
            "BURLYWOOD", "CADETBLUE", "CHARTREUSE", "CHOCOLATE", "CORAL", "CORNFLOWERBLUE", "CORNSILK", "CRIMSON", "CYAN", "DARKBLUE", "DARKCYAN", 
            "DARKGOLDENROD", "DARKGRAY", "DARKGREY", "DARKGREEN", "DARKKHAKI", "DARKMAGENTA", "DARKOLIVEGREEN", "DARKORANGE", "DARKORCHID", "DARKRED", 
            "DARKSALMON", "DARKSEAGREEN", "DARKSLATEBLUE", "DARKSLATEGRAY", "DARKSLATEGREY", "DARKTURQUOISE", "DARKVIOLET", "DEEPPINK", "DEEPSKYBLUE", 
            "DIMGRAY", "DIMGREY", "DODGERBLUE", "FIREBRICK", "FLORALWHITE", "FORESTGREEN", "FUCHSIA", "GAINSBORO", "GHOSTWHITE", "GOLD", "GOLDENROD", 
            "GRAY", "GREY", "GREEN", "GREENYELLOW", "HONEYDEW", "HOTPINK", "INDIANRED", "INDIGO", "IVORY", "KHAKI", "LAVENDER", "LAVENDERBLUSH", 
            "LAWNGREEN", "LEMONCHIFFON", "LIGHTBLUE", "LIGHTCORAL", "LIGHTCYAN", "LIGHTGOLDENRODYELLOW", "LIGHTGRAY", "LIGHTGREY", "LIGHTGREEN", 
            "LIGHTPINK", "LIGHTSALMON", "LIGHTSEAGREEN", "LIGHTSKYBLUE", "LIGHTSLATEGRAY", "LIGHTSLATEGREY", "LIGHTSTEELBLUE", "LIGHTYELLOW", 
            "LIME", "LIMEGREEN", "LINEN", "MAGENTA", "MAROON", "MEDIUMAQUAMARINE", "MEDIUMBLUE", "MEDIUMORCHID", "MEDIUMPURPLE", "MEDIUMSEAGREEN", 
            "MEDIUMSLATEBLUE", "MEDIUMSPRINGGREEN", "MEDIUMTURQUOISE", "MEDIUMVIOLETRED", "MIDNIGHTBLUE", "MINTCREAM", "MISTYROSE", "MOCCASIN", 
            "NAVAJOWHITE", "NAVY", "OLDLACE", "OLIVE", "OLIVEDRAB", "ORANGE", "ORANGERED", "ORCHID", "PALEGOLDENROD", "PALEGREEN", "PALETURQUOISE", 
            "PALEVIOLETRED", "PAPAYAWHIP", "PEACHPUFF", "PERU", "PINK", "PLUM", "POWDERBLUE", "PURPLE", "REBECCAPURPLE", "RED", "ROSYBROWN", "ROYALBLUE", 
            "SADDLEBROWN", "SALMON", "SANDYBROWN", "SEAGREEN", "SEASHELL", "SIENNA", "SILVER", "SKYBLUE", "SLATEBLUE", "SLATEGRAY", "SLATEGREY", "SNOW", 
            "SPRINGGREEN", "STEELBLUE", "TAN", "TEAL", "THISTLE", "TOMATO", "TURQUOISE", "VIOLET", "WHEAT", "WHITE", "WHITESMOKE", "YELLOW", "YELLOWGREEN",
        ];
          return colors;
    };
    
    // Thanks! - https://css-tricks.com/converting-color-spaces-in-javascript/
    nameToRGB(name) {
        // Create fake div
        const fakeDiv = document.createElement("div");
        fakeDiv.style.color = name;
        document.body.appendChild(fakeDiv);
        // Get color of div
        const cs = window.getComputedStyle(fakeDiv);
        const pv = cs.getPropertyValue("color");
        // Remove div after obtaining desired color value
        document.body.removeChild(fakeDiv);
        return pv;
    };
    
    hexToRgb(hex) {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgb(${r}, ${g}, ${b})`;
    };

    convertColors(color, needArray){
        if(color[0] === '#'){
            color = this.hexToRgb(color);
        } else if(isNaN(color[0])){
            color = this.nameToRGB(color);
        }
        if(needArray){
            color = color.replace('rgb(', '').replace(')', '');
            color = color.split(',').map(item => +item);
        }
        return color;
    };
    
    getTextWidth(text, fontSize, standardPadding, textPadding){
        const sprite = new Sprite();
        const pad1 = standardPadding*2;
        const pad2 = textPadding*2;
        sprite.bitmap = new Bitmap(1,1);
        sprite.bitmap.fontSize = fontSize;
        let width = ~~((sprite.bitmap.measureTextWidth(text) + pad1 + pad2));
        //if(text.contains("\i")) width += 32
        if(width & 1) width += 1;
            return width;
    };
    
    presetPos(width, height, custom1, custom2, preset){
        const centerX = (Graphics.width - (Graphics.width / 2)) - (width / 2);
        const endX = Graphics.width - width;
        const centerY = (Graphics.height - (Graphics.height / 2)) - (height / 2);
        const endY = Graphics.height - height;
        const defPos = [
            {x:custom1, y:custom2},     // 0
            {x:0,       y:0},           // 1 Top left
            {x:centerX, y:0},           // 2 Top center
            {x:endX,    y:0},           // 3 Top Right
            {x:0,       y:centerY},     // 4 Center left
            {x:centerX, y:centerY},     // 5 Center center
            {x:endX,    y:centerY},     // 6 Center right
            {x:0,       y:endY},        // 7 Bottom left
            {x:centerX, y:endY},        // 8 Bottom center
            {x:endX,    y:endY}         // 9 Bottom right
        ]
        const pX = defPos[preset].x;
        const pY = defPos[preset].y;
        return {x:pX, y:pY};
    };
    
    makeDeepCopy(object){
        return JSON.parse(JSON.stringify(object));
    };
    
    convertEscapeVariablesOnly(text){
        const tempWin = new Window_Base(new Rectangle(0,0,0,0));
        text = tempWin.convertEscapeVariablesOnly(text);
        return text;
    };
    
    convertEscapeCharacters(text){
        const tempWin = new Window_Base(new Rectangle(0,0,0,0));
        text = tempWin.convertEscapeCharacters(text);
        return text;
    };
    
    extractText(text, startChar, endChar){ // Extrai o texto de dentro de dois [] ou () {}...
        const startIndex = text.indexOf(startChar) + 1;
        const endIndex = text.indexOf(endChar);
        const extractedText = text.substring(startIndex, endIndex);
            return extractedText;
    };
     
    toBoolean(string){
        return JSON.parse(string.toLowerCase());
    };
    
    setPosXy(array){
        const argLower = this.toLowerCaseArray(array);
        const index = [ argLower.indexOf('x:'), argLower.indexOf('y:') ];
        const posX  = index[0] !== -1 ? array[index[0]+1] : false;
        const posY  = index[1] !== -1 ? array[index[1]+1] : false;
            return {x:posX, y:posY};
    };
    
    manipulateWindows(args){
        const argLower = this.toLowerCaseArray(args);
        const index = [
            argLower.indexOf('x:'), argLower.indexOf('y:'), 
            argLower.indexOf('w:'), argLower.indexOf('h:'), argLower.indexOf('opacity:')
        ];
        const posX      = index[0] !== -1 ? args[index[0]+1] : false;
        const posY      = index[1] !== -1 ? args[index[1]+1] : false;
        const width     = index[2] !== -1 ? args[index[2]+1] : false;
        const height    = index[3] !== -1 ? args[index[3]+1] : false;
        const opacity   = index[4] !== -1 ? args[index[4]+1] : false;
            return {x:posX, y:posY, width: width, height: height, opacity: opacity};
    };
    
    manipulatePictures(args){
        const argLower = this.toLowerCaseArray(args);
        const index = [
            argLower.indexOf('id:'), argLower.indexOf('name:'), argLower.indexOf('origin:'), 
            argLower.indexOf('x:'), argLower.indexOf('y:'), 
            argLower.indexOf('scaleX:'), argLower.indexOf('scaleY:'), 
            argLower.indexOf('opacity:'), argLower.indexOf('blendmode:'),
            argLower.indexOf('easingType:')
        ];
        const id        = index[0] !== -1 ? args[index[0]+1] : false;
        const name      = index[1] !== -1 ? args[index[1]+1] : false;
        const origin    = index[2] !== -1 ? args[index[2]+1] : false;
        const posX      = index[3] !== -1 ? args[index[3]+1] : false;
        const posY      = index[4] !== -1 ? args[index[4]+1] : false;
        const scaleX    = index[5] !== -1 ? args[index[5]+1] : false;
        const scaleY    = index[6] !== -1 ? args[index[6]+1] : false;
        const opacity   = index[7] !== -1 ? args[index[7]+1] : false;
        const blend     = index[8] !== -1 ? args[index[8]+1] : false;
        const easy      = index[9] !== -1 ? args[index[9]+1] : false;
            return {id: id, name: name, origin: origin, x: posX, y: posY, 
                scaleX: scaleX, scaleY: scaleY, opacity: opacity, 
                blendMode: blend, easingType: easy};
    };
    
    addToDecrypterIgnoreList(folder, file){
        const image = `img/${folder}/${file}.png`;
        if(!Decrypter._ignoreList.includes(image)) Decrypter._ignoreList.push(image);
    };

    ruleOf3(a, b, c){
        return (c*b)/a;
    };

    divideByTheLargest(num1, num2){
        const max = Math.max(num1, num2);
        const min = Math.min(num1, num2);
        return max / min;
    };

    centerX(objWidth, baseWidth = Graphics.width){
        return Math.abs(objWidth - baseWidth) / 2;
    };

    centerY(objHeight, baseHeight = Graphics.height){
        return Math.abs(objHeight - baseHeight) / 2;
    };

    centerPos(objWidth, objHeight, baseWidth, baseHeight){
        const pos = {
            x:  this.centerX(objWidth, baseWidth),
            y:  this.centerY(objHeight, baseHeight),
        }
        return pos;
    };

    evaluateCondition(param){
        const functionToCall = param.conditionType;
        const value = param.conditionValue;
        return this[`${functionToCall}Condition`](value);
    };

    switchCondition(conditionValue){
        return $gameSwitches.value(+conditionValue);
    };

    variableCondition(conditionValue){
        const value = conditionValue.split(' ');
        const operator = ['===', '>', '<', '>=', '<='];
        const index = operator.indexOf(value[1]);
        let result = 0;
        switch(operator[index]){
            case '===':
                result = $gameVariables.value(+value[0]) === +value[2];
                break;
            case '>':
                result = $gameVariables.value(+value[0]) > +value[2];
                break;
            case '<':
                result = $gameVariables.value(+value[0]) < +value[2];
                break;
            case '>=':
                result = $gameVariables.value(+value[0]) >= +value[2];
                break;
            case '<=':
                result = $gameVariables.value(+value[0]) <= +value[2];
                break;
        }
        return result;
    };

    booleanCondition(conditionValue){
        return typeof conditionValue === 'string' ? eli.toBoolean(conditionValue) : conditionValue;
    };

    scriptCondition(conditionValue){
        return eval(conditionValue);
    };

    toLowerCaseArray(arr){
        return arr.map(element => element === 'string' ? element.toLowerCase() : element)
    };
    
    formatDollarSign(str){
        return str.replace('%24', '$');
    };

};

const eli = new Eli_Book();

/* ========================================================================== */
/*                          CLASS TO SAVE PLUGIN DATA                         */
/* ========================================================================== */

function Eli_Data() {
    this.initialize.apply(this, arguments);
};

Eli_Data.prototype.initialize = function(){
    this.contents = {};
};

Eli_Data.prototype.createNewContent = function(pluginName){
    this.contents[pluginName] = {};
};

Eli_Data.prototype.createContentWithPluginParameters = function(pluginName, pluginParameters){
    this.contents[pluginName] = eli.makeDeepCopy(pluginParameters);
};

Eli_Data.prototype.addNewDataToContent = function(pluginName, newData, value){
    this.contents[pluginName][newData] = value;
};

var $eliData = null;

/* ========================================================================== */
/*                                    CORE                                    */
/* ========================================================================== */
{

/* --------------------------------- SPRITE --------------------------------- */

Sprite.prototype.setScale = function(x, y){
    this.scale.set(x, y);
};

Sprite.prototype.scaledBitmapWidth = function(){
    return eli.ruleOf3(1, this.bitmap.width, this.scale.x);
};

Sprite.prototype.scaledBitmapHeight = function(){
    return eli.ruleOf3(1, this.bitmap.height, this.scale.y);
};

Sprite.prototype.centerX = function(baseWidth){
    const x = eli.centerX(this.scaledBitmapWidth(), baseWidth);
    this.x = x;
};

Sprite.prototype.centerY = function(baseHeight){
    const y = eli.centerY(this.scaledBitmapHeight(), baseHeight);
    this.y = y;
};

Sprite.prototype.centerPos = function(baseWidth, baseHeight){
    const x = eli.centerX(this.scaledBitmapWidth(), baseWidth);
    const y = eli.centerY(this.scaledBitmapHeight(), baseHeight);
    this.move(x, y);
};

Sprite.prototype.stretchToScreen = function(ratio, baseWidth = Graphics.width, baseHeight = Graphics.height){
        const bitmapWidth = this.bitmap.width
        const bitmapHeight = this.bitmap.height
        const upScale = baseWidth > bitmapWidth || baseHeight > bitmapHeight;
        if(!ratio){
            const widthRatio = eli.divideByTheLargest(bitmapWidth, baseWidth);
            const heightRatio = eli.divideByTheLargest(bitmapHeight, baseHeight);
            const sX = Math.abs(1-widthRatio);
            const sY = Math.abs(1-heightRatio);
            if(upScale){
                this.setScale(1 + sX, 1 + sY);
            }else{
                this.setScale(1 - sX, 1 - sY);
            }
        }else{
            const widthRatio = baseWidth / bitmapWidth;
            const heightRatio = baseHeight / bitmapHeight;
            const finalScale = Math.min(widthRatio, heightRatio);
            this.setScale(finalScale, finalScale);
        }
        this.centerPos(baseWidth, baseHeight);
};

}

/* ========================================================================== */
/*                                   MANAGER                                  */
/* ========================================================================== */
{

/* ------------------------------ DATA MANAGER ------------------------------ */

Eli.Book.DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    Eli.Book.DataManager_createGameObjects.call(this);
    $eliData = new Eli_Data();
};

Eli.Book.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    let alias = Eli.Book.DataManager_makeSaveContents.call(this);
    alias.eli = $eliData;
    return alias;
};

Eli.Book.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    Eli.Book.DataManager_extractSaveContents.call(this, contents);
    $eliData = contents.eli;
};

/* ------------------------------ IMAGE MANAGER ----------------------------- */

ImageManager._previousFolders = [];
ImageManager._previousFiles = [];

ImageManager.saveOldCache = function(){
    const urls = Object.keys(this._cache);
    this._previousFolders = [];
    this._previousFiles = [];
    for(let i = 0, l = urls.length; i < l; i++) {
        const url = urls[i];
        const folderIndex = url.lastIndexOf('/') + 1;
        const folderName = url.substring(0, folderIndex);
        const fileIndex = url.indexOf('.png');
        const fileName = url.substring(folderIndex, fileIndex);
        this._previousFolders.push(folderName);
        this._previousFiles.push(eli.formatDollarSign(fileName));
    }
};

ImageManager.restoreOldCache = function(){
    this.clear();
    for(let i = 0, l = this._previousFolders.length; i < l; i++){
        const folder = this._previousFolders[i];
        const file = this._previousFiles[i];
        this.loadBitmap(folder, file);
    }
};

}

/* ========================================================================== */
/*                                   OBJECTS                                  */
/* ========================================================================== */
{

/* --------------------------- GAME CHARACTER BASE -------------------------- */

Game_CharacterBase.prototype.isEvent = function(){
    return this instanceof Game_Event;
};

Game_CharacterBase.prototype.isPlayer = function(){
    return this instanceof Game_Player;
};

Game_CharacterBase.prototype.isFollower = function(){
    return this instanceof Game_Follower;
};

/* ------------------------------- GAME EVENT ------------------------------- */

Eli.Book.Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    Eli.Book.Game_Event_initialize.call(this, mapId, eventId);
    this._note = $dataMap.events[eventId].note;
    this._meta = {};
    this.makeMetaData();
};

Game_Event.prototype.meta = function(){ 
    return this._meta;
};

Game_Event.prototype.note = function(){ 
    return this._note;
};

Game_Event.prototype.makeMetaData = function(){
    const re = eli.extractMetaReg;
    let match;
    while(match = re.exec(this._note)) {
        if (match[2] === ':') {
            this._meta[match[1]] = isNaN(match[3]) ? match[3] : +match[3];
        } else {
            this._meta[match[1]] = true;
        }
    }
};

/* ------------------------------- GAME PLAYER ------------------------------ */

Game_Player.prototype.meta = function(){
    return $dataActors[$gameParty.leader()._actorId].meta;
};

}

/* ========================================================================== */
/*                                   SCENES                                   */
/* ========================================================================== */
{
/* ------------------------------- SCENE BASE ------------------------------- */

Eli.Book.Scene_Base_update = Scene_Base.prototype.update;
Scene_Base.prototype.update = function() {
    this.beforeUpdate();
    Eli.Book.Scene_Base_update.call(this);
    this.afterUpdate();
};

Scene_Base.prototype.beforeUpdate = function(){};
Scene_Base.prototype.afterUpdate = function(){};

/* -------------------------------- SCENE MAP ------------------------------- */

Eli.Book.Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    if(this._transfer){
        this.beforeStart();
    }
    Eli.Book.Scene_Map_start.call(this);
    this.afterStart();
};

Eli.Book.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    this.beforeUpdate();
    Eli.Book.Scene_Map_update.call(this);
    this.afterUpdate();
};

Eli.Book.Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    this.beforeTerminate();
    Eli.Book.Scene_Map_terminate.call(this);
    this.afterTerminate();
};

Scene_Map.prototype.beforeStart = function(){};
Scene_Map.prototype.afterStart = function(){};
Scene_Map.prototype.beforeUpdate = function(){};
Scene_Map.prototype.afterUpdate = function(){};
Scene_Map.prototype.beforeTerminate = function(){};
Scene_Map.prototype.afterTerminate = function(){};

/* ------------------------------ SCENE BATTLE ------------------------------ */

Eli.Book.Scene_Battle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
    this.beforeUpdate();
    Eli.Book.Scene_Battle_update.call(this);
    this.afterUpdate();
};

Scene_Battle.prototype.beforeUpdate = function(){};
Scene_Battle.prototype.afterUpdate = function(){};

}

/* ========================================================================== */
/*                                   SPRITES                                  */
/* ========================================================================== */

class Sprite_EliButton extends Sprite_Clickable{

    constructor(buttonType, image){
        super(buttonType, image);
    };

    initialize(buttonType, image){
        Sprite.prototype.initialize.call(this);
        this._image = image
        this._buttonType = buttonType;
        this._clickHandler = null;
        this._coldFrame = null;
        this._hotFrame = null;
        this.loadButtonImage();
    };

    loadButtonImage() {
        this.bitmap = ImageManager.loadSystem(this._image);
        this.bitmap.addLoadListener(this.setupFrames.bind(this))
    };

    setupFrames() {
        const x = 0;
        const width = this.bitmap.width;
        const height = this.bitmap.height/2;
        this.setColdFrame(x, 0, width, height);
        this.setHotFrame(x, height, width, height);
        this.updateFrame();
        this.updateOpacity();
    };

    setColdFrame(x, y, width, height) {
        this._coldFrame = new Rectangle(x, y, width, height);
    };
    
    setHotFrame(x, y, width, height) {
        this._hotFrame = new Rectangle(x, y, width, height);
    };

    updateFrame() {
        const frame = this.isPressed() ? this._hotFrame : this._coldFrame;
        if (frame) {
            this.setFrame(frame.x, frame.y, frame.width, frame.height);
        }
    };

    updateOpacity() {
        this.opacity = this._pressed ? 255 : 192;
    };

    update() {
        Sprite.prototype.update.call(this);
        this.updateFrame();
        this.updateOpacity();
        this.processTouch();
    };

    setClickHandler(method) {
        this._clickHandler = method;
    };
    
    onClick() {
        if (this._clickHandler) {
            this._clickHandler();
        } else {
            Input.virtualClick(this._buttonType);
        }
    };

};

/* ========================================================================== */
/*                                   WINDOWS                                  */
/* ========================================================================== */
{

/* ------------------------------- WINDOW BASE ------------------------------ */

Window_Base.prototype.convertEscapeVariablesOnly = function(text){
    text = text.replace(/\\/g, '\x1b');
    text = text.replace(/\x1b\x1b/g, '\\');
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(+arguments[1]);
    }.bind(this));
    return text;
};

}

function getId(searchName, dataName){
    return searchName;
};

function getUniqueId(searchMeta){
    return searchMeta;
};

/*
© ® » «  ∆ ™ ≠ ≤ ≥ ▫ ♫
• ■ ▪ ● ▬ ♦
► ▲ ▼ ◄
→ ← ↑ ↔ ↨
*/