/**
 * Phaser Plugin - Virtual Gamepad
 * @author      Shawn Hymel <@ShawnHymel>
 * @copyright   2016 Shawn Hymel
 * @license     {@link http://opensource.org/licenses/MIT}
 * @version     0.1.0
 *
 * Joystick math is based on work by Eugenio Fage, whose original touch control
 * plugin can be found at: 
 * https://github.com/Gamegur-us/phaser-touch-control-plugin
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Shawn Hymel
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (Phaser) {
    'use strict';

    // Static variables
    var UP_LOWER_BOUND = -7 * (Math.PI / 8);
    var UP_UPPER_BOUND = -1 * (Math.PI / 8);
    var DOWN_LOWER_BOUND = Math.PI / 8;
    var DOWN_UPPER_BOUND = 7 * (Math.PI / 8);
    var RIGHT_LOWER_BOUND = -3 * (Math.PI / 8);
    var RIGHT_UPPER_BOUND = 3 * (Math.PI / 8);
    var LEFT_LOWER_BOUND = 5 * (Math.PI / 8);
    var LEFT_UPPER_BOUND = -5 * (Math.PI / 8);

    /**
     * The Virtual Gamepad adds a thumbstick and button(s) to mobile devices.
     *
     * @class Phaser.Plugin.VirtualGamepad
     * @constructor
     * @param {Object} game - The main Game object
     * @param {Any} parent - Object that owns this plugin (e.g. Phaser.PluginManager)
     */
    Phaser.Plugin.VirtualGamepad = function (game, parent) {

        // Call parent
        Phaser.Plugin.call(this, game, parent);

        // Class members
        this.input = this.game.input;
        this.joystick = null;
        this.joystickPad = null;
        this.joystickPoint = null;
        this.joystickRadius = null;
        this.joystickPointer = null;
        this.button = null;
        this.buttonPoint = null;
        this.buttonRadius = null;

        // Polling for the joystick and button pushes
        this.preUpdate = gamepadPoll.bind(this);
    };

    Phaser.Plugin.VirtualGamepad.prototype =
        Object.create(Phaser.Plugin.prototype);
    Phaser.Plugin.VirtualGamepad.prototype.constructor =
        Phaser.Plugin.VirtualGamepad;

    /**
     * Add a joystick to the screen (only one joystick allowed for now)
     *
     * @method Phaser.Plugin.VirtualGamepad#addJoystick
     * @param {number} x - Position (x-axis) of the joystick on the canvas
     * @param {number} y - Position (y-axis) of the joystick on the canvas
     * @param {number} scale - Size of the sprite. 1.0 is 100x100 pixels
     * @param {String} key - key for the gamepad's spritesheet
     * @param {Phaser.Sprite} The joystick object just created
     */
    Phaser.Plugin.VirtualGamepad.prototype.addJoystick = function (x, y, scale, key) {

        // If we already have a joystick, return null
        if (this.joystick !== null) {
            return null;
        }

        // Add the joystick to the game
        this.joystick = this.game.add.sprite(x, y, key);
        this.joystick.frame = 2;
        this.joystick.anchor.set(0.5);
        this.joystick.fixedToCamera = true;
        this.joystick.scale.setTo(scale, scale);
        this.joystickPad = this.game.add.sprite(x, y, key);
        this.joystickPad.frame = 3;
        this.joystickPad.anchor.set(0.5);
        this.joystickPad.fixedToCamera = true;
        this.joystickPad.scale.setTo(scale, scale);

        // Remember the coordinates of the joystick
        this.joystickPoint = new Phaser.Point(x, y);

        // Set up initial joystick properties
        this.joystick.properties = {
            inUse: false,
            up: false,
            down: false,
            left: false,
            right: false,
            x: 0,
            y: 0,
            distance: 0,
            angle: 0,
            rotation: 0
        };

        // Set the touch area as defined by the button's radius
        this.joystickRadius = scale * (this.joystick.width / 2);

        return this.joystick;
    };

    /**
     * Add a button to the screen (only one button allowed for now)
     *
     * @method Phaser.Plugin.VirtualGamepad#addButton
     * @param {number} x - Position (x-axis) of the button on the canvas
     * @param {number} y - Position (y-axis) of the button on the canvas
     * @param {number} scale - Size of the sprite. 1.0 is 100x100 pixels
     * @param {String} key - key for the gamepad's spritesheet
     * @param {Phaser.Button} The button object just created
     */
    Phaser.Plugin.VirtualGamepad.prototype.addButton = function (x, y, scale, key) {

        // If we already have a button, return null
        if (this.button !== null) {
            return null;
        }

        // Add the button to the game
        this.button = this.game.add.button(x, y, key, null, this);
        this.button.anchor set(0.5);
        this.button.fixedToCamera = true;
        this.button.scale.setTo(scale, scale);

        // Remember the coordinates of the button
        this.buttonPoint = new Phaser.Point(x, y);

        // Set up initial
