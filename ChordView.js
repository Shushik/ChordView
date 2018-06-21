/**
 * Guitar chords viewer based on <canvas>
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 3.0
 * @license MIT
 *
 * @class ChordView
 */
var ChordView = ChordView || (function() {

    // Class definition
    class self {

        /**
         * @static
         * @const {number} NUT_LEFT
         */
        static get NUT_LEFT() {
            return 3;
        }

        /**
         * @static
         * @const {number} NUT_LEFT
         */
        static get NUT_LETTER() {
            return 5;
        }

        /**
         * @static
         * @const {string} NUT_FONT
         */
        static get NUT_FONT() {
            return 'normal 6pt Verdana';
        }

        /**
         * @static
         * @const {string} NUT_COLOR
         */
        static get NUT_COLOR() {
            return 'rgba(0, 0, 0, 1)';
        }

        /**
         * @static
         * @const {number} FRET_WIDTH
         */
        static get FRET_WIDTH() {
            return 1;
        }

        /**
         * @static
         * @const {number} FRET_HEIGHT
         */
        static get FRET_HEIGHT() {
            return 8;
        }

        /**
         * @static
         * @const {string} FRET_COLOR
         */
        static get FRET_COLOR() {
            return 'rgba(0, 0, 0, 0.5)';
        }

        /**
         * @static
         * @const {number} FRETS_LIMIT
         */
        static get FRETS_LIMIT() {
            return 5;
        }

        /**
         * @static
         * @const {number} TITLE_TOP
         */
        static get TITLE_TOP() {
            return 6.5;
        }

        /**
         * @static
         * @const {number} TITLE_BOTTOM
         */
        static get TITLE_BOTTOM() {
            return 10;
        }

        /**
         * @static
         * @const {string} TITLE_FONT
         */
        static get TITLE_FONT() {
            return 'normal 8.5pt Times';
        }

        /**
         * @static
         * @const {string} TITLE_COLOR
         */
        static get TITLE_COLOR() {
            return 'rgba(0, 0, 0, 1)';
        }

        /**
         * @static
         * @const {number} CANVAS_TOP
         */
        static get CANVAS_TOP() {
            return 0;
        }

        /**
         * @static
         * @const {number} CANVAS_LEFT
         */
        static get CANVAS_LEFT() {
            return 5;
        }

        /**
         * @static
         * @const {number} CANVAS_RIGHT
         */
        static get CANVAS_RIGHT() {
            return 5;
        }

        /**
         * @static
         * @const {number} CANVAS_BOTTOM
         */
        static get CANVAS_BOTTOM() {
            return 0;
        }

        /**
         * @static
         * @const {string} CANVAS_BACKGROUND
         */
        static get CANVAS_BACKGROUND() {
            return 'transparent';
        }

        /**
         * @static
         * @const {number} FINGER_RADIUS
         */
        static get FINGER_RADIUS() {
            return 2;
        }

        /**
         * @static
         * @const {string} FINGER_COLOR
         */
        static get FINGER_COLOR() {
            return 'rgba(0, 0, 0, 1)';
        }

        /**
         * @static
         * @const {number} STRING_TOP
         */
        static get STRING_TOP() {
            return -4;
        }

        /**
         * @static
         * @const {number} STRING_SPAN
         */
        static get STRING_SPAN() {
            return 5;
        }

        /**
         * @static
         * @const {number} STRING_WIDTH
         */
        static get STRING_WIDTH() {
            return 1;
        }

        /**
         * @static
         * @const {string} STRING_FONT
         */
        static get STRING_FONT() {
            return 'normal 5pt Verdana';
        }

        /**
         * @static
         * @const {string} STRING_COLOR
         */
        static get STRING_COLOR() {
            return 'rgba(51, 51, 51, 0.5)';
        }

        /**
         * @static
         * @const {object} STRINGS_TUNE
         */
        static get STRINGS_TUNE() {
            return ['E', 'B', 'G', 'D', 'A', 'E'];
        }

        /**
         * @static
         * @method romanize
         *
         * @param {number}
         *
         * @returns {string}
         */
        static romanize(arabic) {
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
         * @constructor
         *
         * @param {object} args
         */
        constructor(args = {}) {
            // No need to go further
            if (typeof args != 'object') {
                throw new Error('Config should be an object');
            } else if (!(args.root instanceof HTMLElement)) {
                throw new Error('Root DOM node for chord doesn`t exist');
            }

            // Create data stack
            this._data = {};

            // Create canvas stack
            this._canvas = {};

            // Init main stacks
            this._init(args);
            this._draw(args);
        }

        /**
         * @private
         * @method _init
         *
         * @param {object} args
         */
        _init(args) {
            if (args.title && typeof args.title == 'string') {
                this._initTitle(args.title);
            }

            this._initStrings(args.tune);
            this._initChord(args.chord);
            this._initFrets(args.fret);
            this._initOffsets();
        }

        /**
         * @private
         * @method _draw
         *
         * @param {object} args
         */
        _draw(args) {
            var
                al0 = '';

            // Init canvas DOM
            if (!this._canvas.node) {
                this._canvas.node = document.createElement('canvas');
                this._canvas.node.width  = this._data.width;
                this._canvas.node.height = this._data.height;

                args.root.appendChild(this._canvas.node);

                // Add className
                if (args.id) {
                    this._canvas.node.id = args.id;
                }

                // Add className
                if (args.cname) {
                    this._canvas.node.className = args.cname;
                }

                // Add data-attributes
                if (args.data && typeof args.data == 'object') {
                    for (k in args.data) {
                        this._canvas.node.setAttribute('data-' + al0, args.data[al0]);
                    }
                }
            }

            // Get canvas context
            this._canvas.ctx = this._canvas.node.getContext('2d');
            this._canvas.ctx.clearRect(0, 0, this._data.width, this._data.height);

            // Fill canvas with a background color
            if (self.CANVAS_BACKGROUND && self.CANVAS_BACKGROUND != 'transparent') {
                this._canvas.ctx.fillStyle = self.CANVAS_BACKGROUND;
                this._canvas.ctx.fillRect(0, 0, this._data.width, this._data.height);
            }

            // Draw neck and hand
            this._drawNut();
            this._drawTitle();
            this._drawFrets();
            this._drawStrings();
            this._drawChord();
        }

        /**
         * @private
         * @method _drawNut
         */
        _drawNut() {
            var
                top = 0,
                suffix = 0;

            if (this._data.nut) {
                if (
                    this._data.frets[0] === '' ||
                    (this._data.dislocate && this._data.frets[0] === 'I')
                ) {
                    // Draw nut line
                    top = this._data.top + 0 * self.FRET_HEIGHT;
                    suffix = top % 2 ? 0 : 0.5;

                    this._canvas.ctx.beginPath();
                    this._canvas.ctx.moveTo(this._data.left, top + suffix - 1);
                    this._canvas.ctx.lineTo(this._data.right, top + suffix - 1);
                    this._canvas.ctx.lineWidth = self.FRET_WIDTH;
                    this._canvas.ctx.strokeStyle = self.FRET_COLOR;
                    this._canvas.ctx.stroke();
                } else {
                    // Draw fret number
                    this._canvas.ctx.font = self.NUT_FONT;
                    this._canvas.ctx.textAlign = 'left';
                    this._canvas.ctx.fillStyle = self.NUT_COLOR;
                    this._canvas.ctx.textBaseline = 'top';
                    this._canvas.ctx.fillText(
                        this._data.nut - (this._data.dislocate ? 1 : 0),
                        this._data.right + self.NUT_LEFT,
                        this._data.top
                    );
                }
            }
        }

        /**
         * @private
         * @method _drawFret
         *
         * @param {number} pos
         */
        _drawFret(pos = 0) {
            var
                num = pos + 1,
                top = this._data.top + pos * self.FRET_HEIGHT,
                suffix = top % 2 ? 0 : 0.5;

            this._canvas.ctx.beginPath();
            this._canvas.ctx.moveTo(this._data.left, top + suffix);
            this._canvas.ctx.lineTo(this._data.right, top + suffix);
            this._canvas.ctx.lineWidth = self.FRET_WIDTH;
            this._canvas.ctx.strokeStyle = self.FRET_COLOR;
            this._canvas.ctx.stroke();
        }

        /**
         * @private
         * @method _drawBarre
         *
         * @param {number} pos
         * @param {object} data
         */
        _drawBarre(pos = 0, data = {}) {
            var
                to = data.to - this._data.nut + 1,
                top = this._data.top + to * self.FRET_HEIGHT - self.FRET_HEIGHT / 2,
                suffix = top % 2 ? 0.5 : 0;

            this._canvas.ctx.beginPath();
            this._canvas.ctx.moveTo(this._data.left, top + suffix);
            this._canvas.ctx.lineTo(this._data.right, top + suffix);
            this._canvas.ctx.lineWidth = self.FINGER_RADIUS;
            this._canvas.ctx.strokeStyle = self.FINGER_COLOR;
            this._canvas.ctx.stroke();
        }

        /**
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
         * @private
         * @method _initChord
         *
         * @param {object} raw
         */
        _initChord(raw) {
            var
                barre = false,
                max = 0,
                min = 0,
                al0 = '',
                item = null,
                frets = [],
                clean = null;

            // Create chord stack
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
            this._data.max = max;
            this._data.min = min;
            this._data.dislocate = ((min > 1) && max - min < 2) && !clean.barre ?
                                   true :
                                   false;

            // Revert strings array
            this._data.strings.reverse();

            // Get the minimal fret in chord
            this._data.nut = Math.min.apply(null, frets);
        }

        /**
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
         * @private
         * @method _initFrets
         */
        _initFrets() {
            var
                it0 = this._data.nut - 1,
                ln0 = it0 + self.FRETS_LIMIT;

            // Create frets data stack
            this._data.frets = [];

            while (it0++ < ln0) {
                this._data.frets.push(self.romanize(it0 - 1))
            }
        }

        /**
         * @private
         * @method _drawTitle
         */
        _drawTitle() {
            if (this._data.title) {
                this._canvas.ctx.font = self.TITLE_FONT;
                this._canvas.ctx.textAlign = 'center';
                this._canvas.ctx.fillStyle = self.TITLE_COLOR;
                this._canvas.ctx.textBaseline = 'middle';
                this._canvas.ctx.fillText(
                    this._data.title,
                    (this._data.right + self.CANVAS_RIGHT) / 2,
                    self.CANVAS_TOP + self.TITLE_TOP
                );
            }
        }

        /**
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
                top    = this._data.top + to * self.FRET_HEIGHT - self.FRET_HEIGHT / 2,
                left   = this._data.left + at * self.STRING_SPAN - self.STRING_SPAN / 2,
                suffix = top % 2 ? 0.5 : 0;

            this._canvas.ctx.beginPath();
            this._canvas.ctx.arc(left, top + suffix, self.FINGER_RADIUS, 0, 2 * Math.PI, false);
            this._canvas.ctx.fillStyle = self.FINGER_COLOR;
            this._canvas.ctx.fill();
        }

        /**
         * @private
         * @method _drawString
         *
         * @param {number} pos
         */
        _drawString(pos = 0) {
            var
                num    = pos + 1,
                left   = self.CANVAS_LEFT + self.STRING_SPAN / 2,
                suffix = left % 2 ? 0 : 0.5;

            this._canvas.ctx.beginPath();
            this._canvas.ctx.moveTo(left + self.STRING_SPAN * pos + suffix, this._data.top);
            this._canvas.ctx.lineTo(left + self.STRING_SPAN * pos + suffix, this._data.bottom);
            this._canvas.ctx.lineWidth = self.STRING_WIDTH;
            this._canvas.ctx.strokeStyle = self.STRING_COLOR;
            this._canvas.ctx.stroke();

            if (name == '×') {
                this._canvas.ctx.font = self.STRING_FONT;
                this._canvas.ctx.textAlign = 'center';
                this._canvas.ctx.fillStyle = self.FINGER_COLOR;
                this._canvas.ctx.textBaseline = 'middle';
                this._canvas.ctx.fillText(
                    name,
                    left + self.STRING_SPAN * pos + suffix,
                    this._data.top + self.STRING_TOP
                );
            }
        }

        /**
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
         * @private
         * @method _initStrings
         *
         * @param {object} raw
         */
        _initStrings(raw = self.STRINGS_TUNE) {
            raw = raw && raw instanceof Array ? raw : self.STRINGS_TUNE;

            var
                it0 = -1;

            // Create strings data stack
            this._data.tune = [];
            this._data.strings = [];

            while (++it0 < raw.length) {
                this._data.tune.push(raw[it0]);
                this._data.strings.push(raw[it0]);
            }
        }

        /**
         * @private
         * @method _initOffsets
         */
        _initOffsets() {
            // Horisontal offsets
            this._data.left = self.CANVAS_LEFT;
            this._data.right = this._data.left + this._data.strings.length * self.STRING_SPAN;
            this._data.width = this._data.right + self.CANVAS_RIGHT;

            if (this._data.nut) {
                this._data.width += (this._data.nut > 9 ? 2 : 1) *
                                    self.NUT_LETTER +
                                    self.NUT_LEFT;
            }

            // Vertical offsets
            this._data.top = self.CANVAS_TOP;

            if (this._data.title) {
                this._data.top += self.TITLE_TOP + self.TITLE_BOTTOM;
            }

            this._data.bottom = this._data.top + (this._data.frets.length - 1) *
                                self.FRET_HEIGHT + self.FRET_HEIGHT / 2;
            this._data.height = this._data.bottom + self.CANVAS_BOTTOM;
        }

    }

    // Class export
    return self;

})();
