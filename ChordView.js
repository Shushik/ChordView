/**
 * Guitar chords viewer based on Canvas
 *
 * @class ChordView
 */
var ChordView = ChordView || (function() {

    class self {

        /**
         * @constructor
         *
         * @param {object} args
         */
        constructor(args = {}) {
            // No need to go further
            if (typeof args != 'object') {
                throw new TypeError('Config should be an object');
            }

            // Create main stacks
            this._data = {};

            // Init main stacks
            this._init(args);
            this.copy(args.root, {id : args.id, cname : args.cname});
        }

        /**
         * Turn arabic number into roman
         *
         * @static
         * @private
         * @method _romanize
         *
         * @param {number}
         *
         * @returns {string}
         */
        static _romanize(arabic) {
            if (typeof arabic != 'number' || arabic < 1) {
                return '';
            }

            var
                it0    = 0,
                al0    = '',
                roman  = '',
                lookup = {
                             M : 1000, CM : 900, D : 500, CD : 400, C : 100,
                             XC : 90, L : 50, XL : 40, X : 10, IX : 9,
                             V : 5, IV : 4, I : 1
                         };

            for (al0 in lookup) {
                while (arabic >= lookup[al0]) {
                    roman += al0;
                    arabic -= lookup[al0];
                }
            }

            return roman;
        }

        /**
         * Copy image from <canvas> to <img>
         *
         * @private
         * @method _copy
         *
         * @param {string|object} to
         * @param {object=}       attrs
         *
         * @returns {object}
         */
        _copy(to, attrs) {
            to = to instanceof HTMLElement ?
                 to :
                 document.querySelector(to);

            var
                img = document.createElement('img');

            // Create image DOM node
            img.src    = this.encode();
            img.alt    = this._data.title;
            img.title  = this._data.title;
            img.width  = this._data.width;
            img.height = this._data.height;

            // Add id or class attributes if given
            if (attrs) {
                if (attrs.id) {
                    img.id = attrs.id;
                }

                if (attrs.cname) {
                    img.className = attrs.cname;
                }
            }

            // Save image if parent node is given
            if (to) {
                to.appendChild(img);
            }

            return img;
        }

        /**
         * Init DOM stack
         *
         * @private
         * @method _draw
         */
        _draw() {
            var
                node = null;

            if (!self._canvas) {
                // Init canvas DOM node
                self._canvas = document.createElement('canvas')
                self._canvas.width  = this._data.width;
                self._canvas.height = this._data.height;

                self._canvas.style.top      = '-9000px';
                self._canvas.style.left     = '-9000px';
                self._canvas.style.position = 'fixed';

                // Save canvas DOM node
                document.body.appendChild(self._canvas);
            }

            // Get canvas context
            this._canvas = self._canvas.getContext('2d');
            this._canvas.clearRect(0, 0, this._data.width, this._data.height);

            // Fill canvas with a background color
            if (self._conf.canvas.background && self._conf.canvas.background != 'transparent') {
                this._canvas.fillStyle = self._conf.canvas.background;
                this._canvas.fillRect(0, 0, this._data.width, this._data.height);
            }

            // Draw neck and hand
            this._drawNut();
            this._drawTitle();
            this._drawFrets();
            this._drawStrings();
            this._drawChord();

            // Remove canvas context link
            delete this._canvas;
        }

        /**
         * Init data stack
         *
         * @private
         * @method _init
         *
         * @param {object} args
         */
        _init(args) {
            if (args.title) {
                this._initTitle(args.title);
            }

            this._initStrings(args.tune);
            this._initChord(args.chord);
            this._initFrets(args.fret);
            this._initOffsets();
        }

        /**
         * Draw first fret number
         *
         * @private
         * @method _drawNut
         */
        _drawNut() {
            if (this._data.nut) {
                this._canvas.font         = self._conf.nut.font;
                this._canvas.textAlign    = 'left';
                this._canvas.fillStyle    = self._conf.nut.color;
                this._canvas.textBaseline = 'top';

                this._canvas.fillText(
                    this._data.nut - (this._data.dislocate ? 1 : 0),
                    this._data.right + self._conf.nut.left,
                    this._data.top
                );
            }
        }

        /**
         * Draw fret
         *
         * @private
         * @method _drawFret
         */
        _drawFret(pos = 0, name = '') {
            var
                num    = pos + 1,
                top    = this._data.top + pos * self._conf.fret.height,
                suffix = top % 2 ? 0 : 0.5;

            this._canvas.beginPath();
            this._canvas.moveTo(this._data.left, top + suffix);
            this._canvas.lineTo(this._data.right, top + suffix);
            this._canvas.lineWidth = 1;
            this._canvas.strokeStyle = self._conf.fret.color;
            this._canvas.stroke();
        }

        /**
         * Init chord data
         *
         * @private
         * @method _initChord
         *
         * @param {object} raw
         */
        _initChord(raw) {
            var
                barre = false,
                max   = 0,
                min   = 0,
                al0   = '',
                item  = null,
                frets = [],
                clean = null;

            this._data.chord = [];

            // No need to go further
            if (!raw || !(raw instanceof Array)) {
                return;
            }

            for (al0 in raw) {
                item = raw[al0];
                clean = {};

                // Set and fix string number
                if (!item.at) {
                    clean.at = 1;
                } else if (item.at > this._data.strings.length) {
                    clean.at = this._data.strings.length;
                } else {
                    clean.at = item.at;
                }

                // Set finger number
                if (item.by > -1 && item.by < 5) {
                    clean.by = item.by;
                }

                if (item.inactive) {
                    // Mark string as inactive
                    this._data.strings[item.at - 1] = '×';
                } else {
                    // Set and fix fret number
                    if (!item.to) {
                        clean.to = 1;
                    } else if (item.to > this._data.frets) {
                        clean.to = this._data.frets;
                    } else {
                        clean.to = item.to;
                    }

                    // Get distance between out fingers
                    max = Math.max(max, clean.to);
                    min = min === 0 ? clean.to : Math.min(min, clean.to);

                    // Set and fix barre properties
                    if (item.barre) {
                        clean.barre = true;

                        if (item.at < 2) {
                            clean.at = 2;
                        }
                    }

                    // Save into chord stack
                    this._data.chord.push(clean);

                    // Save into minimal fret seeking stack
                    frets.push(clean.to);
                }
            }

            // Center «short» chords
            this._data.max       = max;
            this._data.min       = min;
            this._data.dislocate = ((min > 1) && max - min < 2) && !clean.barre ? true : false;

            // Revert strings array
            this._data.strings.reverse();

            // Get the minimal fret in chord
            this._data.nut = Math.min.apply(null, frets);
        }

        /**
         * Draw barre
         *
         * @private
         * @method _drawBarre
         *
         * @param {number} pos
         * @param {object} data
         */
        _drawBarre(pos = 0, data = {}) {
            var
                to     = data.to - this._data.nut + 1,
                top    = this._data.top + to * self._conf.fret.height - self._conf.fret.height / 2,
                suffix = top % 2 ? 0.5 : 0;

            this._canvas.beginPath();
            this._canvas.moveTo(this._data.left, top + suffix);
            this._canvas.lineTo(this._data.right, top + suffix);
            this._canvas.lineWidth = self._conf.finger.radius;
            this._canvas.strokeStyle = self._conf.finger.color;
            this._canvas.stroke();
        }

        /**
         * Draw chord
         *
         * @private
         * @method _drawChord
         */
        _drawChord() {
            var
                it0  = this._data.chord.length,
                item = null;

            while (--it0 > -1) {
                item = this._data.chord[it0];

                if (item.barre) {
                    this._drawBarre(it0, item);
                } else {
                    this._drawFinger(it0, item);
                }
            }
        }

        /**
         * Init frets data
         *
         * @private
         * @method _initFrets
         */
        _initFrets() {
            var
                it0 = this._data.nut - 1,
                ln0 = it0 + self._conf.frets.limit;

            // Create frets data stack
            this._data.frets = [];

            while (it0++ < ln0) {
                this._data.frets.push(self._romanize(it0 - 1))
            }
        }

        /**
         * Draw frets
         *
         * @private
         * @method _drawFrets
         */
        _drawFrets() {
            var
                it0 = this._data.frets.length;

            while (--it0 > -1) {
                this._drawFret(it0, this._data.frets[it0]);
            }
        }

        /**
         * Init title
         *
         * @private
         * @method _initTitle
         *
         * @param {string} raw
         */
        _initTitle(raw = '') {
            raw += '';

            var
                it0      = -1,
                clean    = '',
                replaces = {
                               '#' : '♯',
                               'b' : '♭'
                           };

            if (raw.length) {
                while (++it0 < raw.length) {
                    if (it0 === 0) {
                        clean += raw[it0].toUpperCase()
                    } else if (it0 === 1 && replaces[raw[it0]]) {
                        clean += replaces[raw[it0]];
                    } else {
                        clean += raw[it0];
                    }
                }
            }

            this._data.alias = raw;
            this._data.title = clean;
        }

        /**
         * Draw title
         *
         * @private
         * @method _drawTitle
         */
        _drawTitle() {
            if (this._data.title) {
                this._canvas.font         = self._conf.title.font;
                this._canvas.textAlign    = 'center';
                this._canvas.fillStyle    = self._conf.title.color;
                this._canvas.textBaseline = 'middle';
                this._canvas.fillText(this._data.title, (this._data.right + self._conf.canvas.right) / 2, self._conf.canvas.top + self._conf.title.top);
            }
        }

        /**
         * Draw finger
         *
         * @private
         * @method _drawFinger
         *
         * @param {number} pos
         * @param {object} data
         */
        _drawFinger(pos = 0, data = {}) {
            var
                at     = this._data.strings.length - data.at + 1,
                to     = data.to - this._data.nut + (this._data.dislocate ? 2 : 1),
                top    = this._data.top + to * self._conf.fret.height - self._conf.fret.height / 2,
                left   = this._data.left + at * self._conf.string.width - self._conf.string.width / 2,
                suffix = top % 2 ? 0.5 : 0;

            this._canvas.beginPath();
            this._canvas.arc(left, top + suffix, self._conf.finger.radius, 0, 2 * Math.PI, false);
            this._canvas.fillStyle = self._conf.finger.color;
            this._canvas.fill();
        }

        /**
         * Draw string
         *
         * @private
         * @method _drawString
         */
        _drawString(pos = 0, name = '') {
            var
                num    = pos + 1,
                left   = self._conf.canvas.left + self._conf.string.width / 2,
                suffix = left % 2 ? 0 : 0.5;

            this._canvas.beginPath();
            this._canvas.moveTo(left + self._conf.string.width * pos + suffix, this._data.top);
            this._canvas.lineTo(left + self._conf.string.width * pos + suffix, this._data.bottom);
            this._canvas.lineWidth = 1;
            this._canvas.strokeStyle = self._conf.string.color;
            this._canvas.stroke();

            if (name == '×') {
                this._canvas.font         = self._conf.string.font;
                this._canvas.textAlign    = 'center';
                this._canvas.fillStyle    = self._conf.string.color;
                this._canvas.textBaseline = 'middle';
                this._canvas.fillText(name, left + self._conf.string.width * pos + suffix, this._data.top + self._conf.string.top);
            }
        }

        /**
         * Init offsets
         *
         * @private
         * @method _initOffsets
         */
        _initOffsets() {
            // Horisontal offsets
            this._data.left  = self._conf.canvas.left;
            this._data.right = this._data.left + this._data.strings.length * self._conf.string.width;
            this._data.width = this._data.right + self._conf.canvas.right;

            if (this._data.nut) {
                this._data.width += (this._data.nut > 9 ? 2 : 1) * self._conf.nut.letter + self._conf.nut.left;
            }

            // Vertical offsets
            this._data.top = self._conf.canvas.top;

            if (this._data.title) {
                this._data.top += self._conf.title.top + self._conf.title.bottom;
            }

            this._data.bottom = this._data.top + (this._data.frets.length - 1) * self._conf.fret.height + self._conf.fret.height / 2;
            this._data.height = this._data.bottom + self._conf.canvas.bottom;
        }

        /**
         * Init strings Data
         *
         * @private
         * @method _initStrings
         *
         * @param {object} raw
         */
        _initStrings(raw = self._conf.strings.tune) {
            raw = raw && raw instanceof Array ? raw : self._conf.strings.tune;

            var
                it0 = -1;

            // Create strings data stack
            this._data.tune    = [];
            this._data.strings = [];

            while (++it0 < raw.length) {
                this._data.tune.push(raw[it0]);
                this._data.strings.push(raw[it0]);
            }
        }

        /**
         * Draw strings
         *
         * @private
         * @method _drawStrings
         */
        _drawStrings() {
            var
                it0 = this._data.strings.length;

            while (--it0 > -1) {
                this._drawString(it0, this._data.strings[it0]);
            }
        }

        /**
         * Get saved chord data
         *
         * @method share
         *
         * @returns {object}
         */
        share() {
            return this._data;
        }

        /**
         * Copy image from <canvas> to <img>
         *
         * @method copy
         *
         * @param {string|object} to
         * @param {object=}       attrs
         *
         * @returns {object}
         */
        copy(to, attrs) {
            this._draw()
            return this._copy(to, attrs);
        }

        /**
         * Get base64 string from last canvas result
         *
         * @method encode
         *
         * @returns {string}
         */
        encode() {
            return self._canvas.toDataURL();
        }

    }

    /**
     * Config
     *
     * @static
     * @private
     * @member {object} _conf
     */
    self._conf = {
        nut : {
            left : 3,
            letter : 5,
            font : 'normal 6pt Verdana',
            color : 'rgba(0, 0, 0, 1)'
        },
        fret : {
            height : 8
        },
        frets : {
            limit : 5
        },
        title : {
            top : 6.5,
            bottom : 10,
            font : 'normal 8.5pt Times',
            color : 'rgba(0, 0, 0, 1)'
        },
        canvas : {
            top : 0,
            left : 0,
            right : 0,
            bottom : 0,
            background : 'transparent'
        },
        finger : {
            radius : 2,
            color : 'rgba(0, 0, 0, 1)'
        },
        string : {
            top : -3,
            width : 5,
            font : 'normal 5pt Verdana',
            color : 'rgba(51, 51, 51, 1)'
        },
        strings : {
            tune : ['E', 'B', 'G', 'D', 'A', 'E']
        }
    };

    /**
     * Common canvas DOM node
     *
     * @static
     * @private
     * @member {object} _canvas
     */
    self._canvas = null;

    return self;

})();