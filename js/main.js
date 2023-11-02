//=============================================================================
// main.js v1.7.0
//=============================================================================

const scriptUrls = [
    "js/libs/pixi.js",
    "js/libs/pako.min.js",
    "js/libs/localforage.min.js",
    "js/libs/effekseer.min.js",
    "js/libs/vorbisdecoder.js",
    "js/rmmz_core.js",
    "js/rmmz_managers.js",
    "js/rmmz_objects.js",
    "js/rmmz_scenes.js",
    "js/rmmz_sprites.js",
    "js/rmmz_windows.js",
    "js/plugins.js",
    "js/phaser-plugin-virtual-gamepad.js",
    "js/phaser.min.js"
];
const effekseerWasmUrl = "js/libs/effekseer.wasm";

class Main {
    constructor() {
        this.xhrSucceeded = false;
        this.loadCount = 0;
        this.error = null;
    }

    run() {
        this.showLoadingSpinner();
        this.testXhr();
        this.hookNwjsClose();
        this.loadMainScripts();
    }

    showLoadingSpinner() {
        const loadingSpinner = document.createElement("div");
        const loadingSpinnerImage = document.createElement("div");
        loadingSpinner.id = "loadingSpinner";
        loadingSpinnerImage.id = "loadingSpinnerImage";
        loadingSpinner.appendChild(loadingSpinnerImage);
        document.body.appendChild(loadingSpinner);
    }

    eraseLoadingSpinner() {
        const loadingSpinner = document.getElementById("loadingSpinner");
        if (loadingSpinner) {
            document.body.removeChild(loadingSpinner);
        }
    }

    testXhr() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", document.currentScript.src);
        xhr.onload = () => (this.xhrSucceeded = true);
        xhr.send();
    }

    hookNwjsClose() {
        // [Note] When closing the window, the NW.js process sometimes does
        //   not terminate properly. This code is a workaround for that.
        if (typeof nw === "object") {
            nw.Window.get().on("close", () => nw.App.quit());
        }
    }

    loadMainScripts() {
        for (const url of scriptUrls) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            script.async = false;
            script.defer = true;
            script.onload = this.onScriptLoad.bind(this);
            script.onerror = this.onScriptError.bind(this);
            script._url = url;
            document.body.appendChild(script);
        }
        this.numScripts = scriptUrls.length;
        window.addEventListener("load", this.onWindowLoad.bind(this));
        window.addEventListener("error", this.onWindowError.bind(this));
    }

    onScriptLoad() {
        if (++this.loadCount === this.numScripts) {
            PluginManager.setup($plugins);
        }
    }

    onScriptError(e) {
        this.printError("Failed to load", e.target._url);
    }

    printError(name, message) {
        this.eraseLoadingSpinner();
        if (!document.getElementById("errorPrinter")) {
            const errorPrinter = document.createElement("div");
            errorPrinter.id = "errorPrinter";
            errorPrinter.innerHTML = this.makeErrorHtml(name, message);
            document.body.appendChild(errorPrinter);
        }
    }

    makeErrorHtml(name, message) {
        const nameDiv = document.createElement("div");
        const messageDiv = document.createElement("div");
        nameDiv.id = "errorName";
        messageDiv.id = "errorMessage";
        nameDiv.innerHTML = name;
        messageDiv.innerHTML = message;
        return nameDiv.outerHTML + messageDiv.outerHTML;
    }

    onWindowLoad() {
        if (!this.xhrSucceeded) {
            const message = "Your browser does not allow to read local files.";
            this.printError("Error", message);
        } else if (this.isPathRandomized()) {
            const message = "Please move the Game.app to a different folder.";
            this.printError("Error", message);
        } else if (this.error) {
            this.printError(this.error.name, this.error.message);
        } else {
            this.initEffekseerRuntime();
        }
    }

    onWindowError(event) {
        if (!this.error) {
            this.error = event.error;
        }
    }

    isPathRandomized() {
        // [Note] We cannot save the game properly when Gatekeeper Path
        //   Randomization is in effect.
        return (
            typeof process === "object" &&
            process.mainModule.filename.startsWith("/private/var")
        );
    }

    initEffekseerRuntime() {
        const onLoad = this.onEffekseerLoad.bind(this);
        const onError = this.onEffekseerError.bind(this);
        effekseer.initRuntime(effekseerWasmUrl, onLoad, onError);
    }

    onEffekseerLoad() {
        this.eraseLoadingSpinner();
        SceneManager.run(Scene_Boot);
    }

    onEffekseerError() {
        this.printError("Failed to load", effekseerWasmUrl);
    }
}

const main = new Main();
main.run();

var PhaserGame = function() {
    this.player = null;
};

PhaserGame.prototype = {
    preload: function() {
        // Load the gamepad spritesheet. Note that the width must equal height
        // of the sprite.
        this.load.spritesheet('gamepad', 'assets/gamepad/gamepad_spritesheet.png', 100, 100);
        this.load.image('space', 'assets/space_bg.jpg');
        this.load.image('ship', 'assets/ship.png');
        this.load.image('laser', 'assets/laser.png');
    },

    create: function() {
        this.game.renderer.roundPixels = true;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.add.tileSprite(0, 0, game.width, game.height, 'space');
        this.lasers = game.add.group();
        this.lasers.enableBody = true;
        this.lasers.physicsBodyType = Phaser.Physics.ARCADE;
        this.lasers.createMultiple(40, 'laser');
        this.lasers.setAll('scale.x', 0.5);
        this.lasers.setAll('scale.y', 0.5);
        this.lasers.setAll('anchor.x', 0.5);
        this.lasers.setAll('anchor.y', 0.5);
        this.laserTime = 0;
        this.player = this.add.sprite(250, 250, 'ship');
        this.player.scale.setTo(0.8, 0.8);
        this.player.anchor.set(0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.drag.set(100);
        this.player.body.maxVelocity.set(300);
        this.player.lastAngle = -90;
        var style = { font: '14px Arial', fill: '#ffffff', align: 'left', stroke: '#000000' };
        this.directionText = this.add.text(20, 20, '', style);
        this.rectangularText = this.add.text(140, 20, '', style);
        this.polarText = this.add.text(260, 20, '', style);
        this.pushText = this.add.text(380, 20, '', style);
        // Add the VirtualGamepad plugin to the game
        this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);
        // Add a joystick to the game (only one is allowed right now)
        this.joystick = this.gamepad.addJoystick(100, 420, 1.2, 'gamepad');
        // Add a button to the game (only one is allowed right now)
        this.button = this.gamepad.addButton(400, 420, 1.0, 'gamepad');
    },

    update: function() {
        this.updateDebugText();
        // Read joystick data to set ship's angle and acceleration
        if (this.joystick.properties.inUse) {
            this.player.angle = this.joystick.properties.angle;
            this.player.lastAngle = this.player.angle;
        } else {
            this.player.angle = this.player.lastAngle;
        }
        this.player.body.acceleration.x = 4 * this.joystick.properties.x;
        this.player.body.acceleration.y = 4 * this.joystick.properties.y;
        // Fire the lasers!
        if (this.button.isDown) {
            this.fireLaser();
        }
        this.screenWrap(this.player);
        this.lasers.forEachExists(this.screenWrap, this);
    },

    fireLaser: function() {
        if (game.time.now > this.laserTime) {
            this.laser = this.lasers.getFirstExists(false);
            if (this.laser) {
                this.laser.reset(this.player.body.x + 20, this.player.body.y + 12);
                this.laser.lifespan = 2000;
                this.laser.angle = this.player.angle;
                game.physics.arcade.velocityFromRotation(this.player.rotation, 400, this.laser.body.velocity);
                this.laserTime = game.time.now + 100;
            }
        }
    },

    screenWrap: function(sprite) {
        if (sprite.x < 0) {
            sprite.x = game.width;
        } else if (sprite.x > game.width) {
            sprite.x = 0;
        }
        if (sprite.y < 0) {
            sprite.y = game.height;
        } else if (sprite.y > game.height) {
            sprite.y = 0;
        }
    },

    updateDebugText: function() {
        this.directionText.setText("Direction:\n up: " +
            this.joystick.properties.up + "\n down: " +
            this.joystick.properties.down + "\n left: " +
            this.joystick.properties.left + "\n right: " +
            this.joystick.properties.right);
        this.rectangularText.setText("Rectangular:\n x: " +
            this.joystick.properties.x + "\n y: " + this.joystick.properties.y);
        this.polarText.setText("Polar:\n distance: " +
            this.joystick.properties.distance + "\n angle: " +
            (Math.round(this.joystick.properties.angle * 100) / 100) +
            "\n rotation: " +
            (Math.round(this.joystick.properties.rotation * 100) / 100));
        this.pushText.setText("Joystick: " + this.joystick.properties.inUse +
            "\nButton: " + this.button.isDown);
    }
};

var game = new Phaser.Game(500, 500, Phaser.CANVAS);
game.state.add('Game', PhaserGame, true);
