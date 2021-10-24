/**
 * Guitar chords viewer based on <canvas>
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 4.0
 * @license MIT
 */

/**
 * @const {number} NUT_LEFT
 */
const NUT_LEFT = 3;

/**
 * @const {number} NUT_LEFT
 */
const NUT_LETTER = 5;

/**
 * @const {string} NUT_FONT
 */
const NUT_FONT = 'normal 6pt Verdana';

/**
 * @const {string} NUT_COLOR
 */
const NUT_COLOR = 'rgba(0, 0, 0, 1)';

/**
 * @const {number} FRET_WIDTH
 */
const FRET_WIDTH = 1;

/**
 * @const {number} FRET_HEIGHT
 */
const FRET_HEIGHT = 8;

/**
 * @const {string} FRET_COLOR
 */
const FRET_COLOR = 'rgba(0, 0, 0, 0.5)';

/**
 * @const {number} FRETS_LIMIT
 */
const FRETS_LIMIT = 5;

/**
 * @const {number} TITLE_TOP
 */
const TITLE_TOP = 6.5;

/**
 * @const {number} TITLE_EMPTY
 */
const TITLE_EMPTY = 6.5;

/**
 * @const {number} TITLE_BOTTOM
 */
const TITLE_BOTTOM = 12;

/**
 * @const {string} TITLE_FONT
 */
const TITLE_FONT = 'normal 8.5pt Times';

/**
 * @const {string} TITLE_COLOR
 */
const TITLE_COLOR = 'rgba(0, 0, 0, 1)';

/**
 * @const {number} CANVAS_TOP
 */
const CANVAS_TOP = 0;

/**
 * @const {number} CANVAS_LEFT
 */
const CANVAS_LEFT = 5;

/**
 * @const {number} CANVAS_RIGHT
 */
const CANVAS_RIGHT = 5;

/**
 * @const {number} CANVAS_SCALE_AMOUNT
 */
const CANVAS_SCALE = 2;

/**
 * @const {number} CANVAS_BOTTOM
 */
const CANVAS_BOTTOM = 0;

/**
 * @const {string} CANVAS_BACKGROUND
 */
const CANVAS_BACKGROUND = 'transparent';

/**
 * @const {number} FINGER_RADIUS
 */
const FINGER_RADIUS = 2;

/**
 * @const {string} FINGER_COLOR
 */
const FINGER_COLOR = 'rgba(0, 0, 0, 1)';

/**
 * @const {number} STRING_TOP
 */
const STRING_TOP = -4;

/**
 * @const {number} STRING_SPAN
 */
const STRING_SPAN = 5;

/**
 * @const {number} STRING_WIDTH
 */
const STRING_WIDTH = 1;

/**
 * @const {string} STRING_FONT
 */
const STRING_FONT = 'normal 5pt Verdana';

/**
 * @const {string} STRING_COLOR
 */
const STRING_COLOR = 'rgba(51, 51, 51, 0.5)';

/**
 * @const {Array<string>} STRINGS_TUNE
 */
const STRINGS_TUNE = ['E', 'B', 'G', 'D', 'A', 'E'];

/**
 * @const {object} STRING_OPENED
 */
export const STRING_OPENED = 'o';

/**
 * @const {object} STRING_INACTIVE
 */
export const STRING_INACTIVE = '×';

/**
 * @const {string} ERROR_ARGS_NOT_OBJECT
 */
const ERROR_ARGS_NOT_OBJECT = 'Config should be an object';

/**
 * @const {string} ERROR_NEED_DOM_NODE
 */
const ERROR_NEED_DOM_NODE = 'Root DOM node for chord doesn`t exist';

/**
 * @const {string} ERROR_WRONG_CHORD_FORMAT
 */
const ERROR_WRONG_CHORD_FORMAT = 'Chord field should be an object';

/**
 * @class Self
 */
export default class Self {

    /**
     * @member {string} title
     */
    get title() {
        return this._data.title;
    }

    /**
     * @member {string} encoded
     */
    get encoded() {
        return this._canvas.node.toDataURL();
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

        let it0 = 0;
        let al0 = '';
        let roman = '';
        let lookup = {
            M: 1000, CM: 900, D: 500, CD: 400, C: 100,
            XC: 90, L: 50, XL: 40, X: 10, IX: 9,
            V: 5, IV: 4, I: 1
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
            throw new Error(ERROR_ARGS_NOT_OBJECT);
        } else if (!(args.root instanceof HTMLElement)) {
            throw new Error(ERROR_NEED_DOM_NODE);
        }

        /**
         * @private
         * @member {object} _data
         * @member {boolean} _data.empty
         * @member {boolean} _data.dislocate
         * @member {number} _data.max
         * @member {number} _data.min
         * @member {number} _data.nut
         * @member {number} _data.top
         * @member {number} _data.left
         * @member {number} _data.right
         * @member {number} _data.width
         * @member {number} _data.bottom
         * @member {number} _data.height
         * @member {string} _data.title
         * @member {Array} _data.frets
         * @member {Array} _data.chord
         * @member {Array} _data.strings
         */
        // Create data stack
        this._data = {};

        /**
         * @private
         * @member {object} _data
         * @member {object} _canvas.ctx
         * @member {HTMLElement} _canvas.node
         */
        // Create canvas stack
        this._canvas = {};

        // Init main stacks
        this._init(args);
        this._draw(args);
    }

    /**
     * @destructor
     */
    uninstall() {
        if (this._canvas && this._canvas.node) {
            this._canvas.ctx = null;
            this._canvas.node.parentNode.removeChild(this._canvas.node);
            this._canvas = null;
        }

        this._data = null;
    }

    /**
     * @private
     * @method _init
     *
     * @param {object} args
     */
    _init(args) {
        let {fret, tune, chord, title} = args;

        if (title && typeof title == 'string') {
            this._initTitle(title);
        }

        this._initStrings(tune);
        this._initChord(chord);
        this._initFrets(fret);
        this._initOffsets();
    }

    /**
     * @private
     * @method _draw
     *
     * @param {object} args
     */
    _draw(args) {
        // Init canvas DOM
        if (!this._canvas.node) {
            this._createRootNode(args);
        }

        // Get canvas context
        this._canvas.ctx = this._canvas.node.getContext('2d');
        this._canvas.ctx.clearRect(
            0,
            0,
            this._data.width,
            this._data.height
        );
        this._canvas.ctx.scale(CANVAS_SCALE, CANVAS_SCALE);

        // Fill canvas with a background color
        if (CANVAS_BACKGROUND && CANVAS_BACKGROUND != 'transparent') {
            this._canvas.ctx.fillStyle = CANVAS_BACKGROUND;
            this._canvas.ctx.fillRect(
                0,
                0,
                this._data.width,
                this._data.height
            );
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
        let empty = !this._data.chord || !this._data.chord.length;
        let top = 0;
        let suffix = 0;
        let first = this._data.frets[0];

        if (first === '' || (this._data.dislocate && first === 'I') || empty) {
            // Draw nut line
            top = this._data.top + 0 * FRET_HEIGHT;
            suffix = top % 2 ? 0 : 0.5;

            this._canvas.ctx.beginPath();
            this._canvas.ctx.moveTo(this._data.left, top + suffix - 1);
            this._canvas.ctx.lineTo(this._data.right, top + suffix - 1);
            this._canvas.ctx.lineWidth = FRET_WIDTH;
            this._canvas.ctx.strokeStyle = FRET_COLOR;
            this._canvas.ctx.stroke();
        } else {
            // Draw fret number
            this._canvas.ctx.font = NUT_FONT;
            this._canvas.ctx.textAlign = 'left';
            this._canvas.ctx.fillStyle = NUT_COLOR;
            this._canvas.ctx.textBaseline = 'top';
            this._canvas.ctx.fillText(
                this._data.nut - (this._data.dislocate ? 1 : 0),
                this._data.right + NUT_LEFT,
                this._data.top
            );
        }
    }

    /**
     * @private
     * @method _drawFret
     *
     * @param {number} pos
     * @param {string} name
     */
    _drawFret(pos = 0, name = '') {
        let num = pos + 1;
        let top = this._data.top + pos * FRET_HEIGHT;
        let suffix = top % 2 ? 0 : 0.5;

        this._canvas.ctx.beginPath();
        this._canvas.ctx.moveTo(this._data.left, top + suffix);
        this._canvas.ctx.lineTo(this._data.right, top + suffix);
        this._canvas.ctx.lineWidth = FRET_WIDTH;
        this._canvas.ctx.strokeStyle = FRET_COLOR;
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
        let to = data.to - this._data.nut + 1;
        let top = this._data.top + to * FRET_HEIGHT - FRET_HEIGHT / 2;
        let suffix = top % 2 ? 0.5 : 0;

        this._canvas.ctx.beginPath();
        this._canvas.ctx.moveTo(this._data.left, top + suffix);
        this._canvas.ctx.lineTo(this._data.right, top + suffix);
        this._canvas.ctx.lineWidth = FINGER_RADIUS;
        this._canvas.ctx.strokeStyle = FINGER_COLOR;
        this._canvas.ctx.stroke();
    }

    /**
     * @private
     * @method _drawChord
     */
    _drawChord() {
        let it0  = this._data.chord.length;
        let item = null;

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
    _translateChord(raw) {
        // No need to go further
        if (raw instanceof Array) {
            return raw;
        } else if (typeof raw != 'object') {
            throw new Error(ERROR_WRONG_CHORD_FORMAT);
            return null;
        }

        let al0 = '';
        let chord = [];

        for (al0 in raw) {
            if (raw[al0] !== undefined) {
                if (al0 == 'barre') {
                    chord.push({
                        barre: true,
                        to: raw[al0]
                    });
                } else if (
                    raw[al0] === false ||
                    raw[al0] === -1 ||
                    raw[al0] === STRING_INACTIVE
                ) {
                    chord.push({
                        inactive: true,
                        at: al0
                    });
                } else if (
                    raw[al0] === true ||
                    raw[al0] === 0 ||
                    raw[al0] === STRING_OPENED
                ) {
                    chord.push({
                        opened: true,
                        at: al0
                    });
                } else {
                    chord.push({at: al0, to: raw[al0]});
                }
            }
        }

        return chord;
    }

    /**
     * @private
     * @method _initChord
     *
     * @param {object} raw
     */
    _initChord(raw) {
        let max = 0;
        let min = 0;
        let al0 = '';
        let item = null;
        let chord = this._translateChord(raw);
        let clean = null;
        let frets = [];

        // 
        this._data.empty = true;

        // Create chord stack
        this._data.chord = [];

        // No need to go further
        if (!chord) {
            this._data.dislocate = true;
            this._data.nut = 1;
            return;
        }

        for (al0 in chord) {
            item = this._initChordItem(chord[al0], frets, max, min);
            max = item.max;
            min = item.min;
            clean = item.clean;
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
        this._data.nut = frets.length ? Math.min.apply(null, frets) : 1;
    }

    /**
     * @private
     * @method _initChordItem
     *
     * @param {object} item
     * @param {object} frets
     * @param {number} max
     * @param {number} min
     *
     * @returns {object}
     */
    _initChordItem(item, frets, max, min) {
        let clean = {};

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
            this._data.strings[item.at - 1] = STRING_INACTIVE;
        } else if (item.opened || item.to === 0) {
            // Mark string as opened
            this._data.strings[item.at - 1] = STRING_OPENED;
        } else {
            // 
            this._data.empty = false;

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

        return {max, min, clean};
    }

    /**
     * @private
     * @method _drawFrets
     */
    _drawFrets() {
        let it0 = this._data.frets.length;

        while (--it0 > -1) {
            this._drawFret(it0, this._data.frets[it0]);
        }
    }

    /**
     * @private
     * @method _initFrets
     */
    _initFrets() {
        let it0 = this._data.nut - 1;
        let ln0 = it0 + FRETS_LIMIT;

        // Create frets data stack
        this._data.frets = [];

        while (it0++ < ln0) {
            this._data.frets.push(Self.romanize(it0 - 1))
        }
    }

    /**
     * @private
     * @method _drawTitle
     */
    _drawTitle() {
        if (this._data.title) {
            this._canvas.ctx.font = TITLE_FONT;
            this._canvas.ctx.textAlign = 'center';
            this._canvas.ctx.fillStyle = TITLE_COLOR;
            this._canvas.ctx.textBaseline = 'middle';
            this._canvas.ctx.fillText(
                this._data.title,
                (this._data.right + CANVAS_RIGHT) / 2,
                CANVAS_TOP + TITLE_TOP
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
        this._data.title = `${raw}`;
    }

    /**
     * @private
     * @method _drawFinger
     *
     * @param {number} pos
     * @param {object} data
     */
    _drawFinger(pos = 0, data = {}) {
        let at = this._data.strings.length - data.at + 1;
        let to = data.to - this._data.nut + (this._data.dislocate ? 2 : 1);
        let top = this._data.top + to * FRET_HEIGHT - FRET_HEIGHT / 2;
        let left = this._data.left + at * STRING_SPAN - STRING_SPAN / 2;
        let suffix = top % 2 ? 0.5 : 0;

        this._canvas.ctx.beginPath();
        this._canvas.ctx.arc(left, top + suffix, FINGER_RADIUS, 0, 2 * Math.PI, false);
        this._canvas.ctx.fillStyle = FINGER_COLOR;
        this._canvas.ctx.fill();
    }

    /**
     * @private
     * @method _drawString
     *
     * @param {number} pos
     * @param {string} name
     */
    _drawString(pos = 0, name = '') {
        let num = pos + 1;
        let left = CANVAS_LEFT + STRING_SPAN / 2;
        let suffix = left % 2 ? 0 : 0.5;

        this._canvas.ctx.beginPath();
        this._canvas.ctx.moveTo(left + STRING_SPAN * pos + suffix, this._data.top);
        this._canvas.ctx.lineTo(left + STRING_SPAN * pos + suffix, this._data.bottom);
        this._canvas.ctx.lineWidth = STRING_WIDTH;
        this._canvas.ctx.strokeStyle = STRING_COLOR;
        this._canvas.ctx.stroke();

        if (name == STRING_INACTIVE || name == STRING_OPENED) {
            this._canvas.ctx.font = STRING_FONT;
            this._canvas.ctx.textAlign = 'center';
            this._canvas.ctx.fillStyle = FINGER_COLOR;
            this._canvas.ctx.textBaseline = 'middle';
            this._canvas.ctx.fillText(
                name,
                left + STRING_SPAN * pos + suffix,
                this._data.top + STRING_TOP
            );
        }
    }

    /**
     * @private
     * @method _drawStrings
     */
    _drawStrings() {
        let it0 = this._data.strings.length;

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
    _initStrings(raw = STRINGS_TUNE) {
        raw = raw && raw instanceof Array ? raw : STRINGS_TUNE;

        let it0 = -1;

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
        this._data.left = CANVAS_LEFT;
        this._data.right = this._data.left +
                           this._data.strings.length * STRING_SPAN;
        this._data.width = this._data.right + CANVAS_RIGHT;

        if (this._data.nut) {
            this._data.width += (this._data.nut > 9 ? 2 : 1) *
                                NUT_LETTER +
                                NUT_LEFT;
        }

        // Vertical offsets
        this._data.top = CANVAS_TOP;

        if (this._data.title) {
            this._data.top += TITLE_TOP + TITLE_BOTTOM;
        } else {
            this._data.top += TITLE_EMPTY;
        }

        this._data.bottom = this._data.top + (this._data.frets.length - 1) *
                            FRET_HEIGHT + FRET_HEIGHT / 2;
        this._data.height = this._data.bottom + CANVAS_BOTTOM;
    }

    _createRootNode(args) {
        let {id, data, root, cname} = args;

        let al0 = '';

        this._canvas.node = document.createElement('canvas');
        this._canvas.node.width  = this._data.width * CANVAS_SCALE;
        this._canvas.node.height = this._data.height * CANVAS_SCALE;
        this._canvas.node.style.width = `${this._data.width}px`;
        this._canvas.node.style.height = `${this._data.height}px`;

        root.appendChild(this._canvas.node);

        // Add className
        if (id) {
            this._canvas.node.id = id;
        }

        // Add className
        if (cname) {
            this._canvas.node.className = cname;
        }

        // Add data-attributes
        if (data && typeof data == 'object') {
            for (al0 in data) {
                this._canvas.node.setAttribute('data-' + al0, data[al0]);
            }
        }
    }

}
