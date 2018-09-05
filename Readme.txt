
	Guitar chords viewer based on <canvas>


	Goods

	— Simple usage;
	— Doesn't need any other JavaScript libraries.


	System requirements

	— JavaScript;
	— Browser, which is not too old :-)


	Example

	<div class="song__chords"></div>
	<script src="ChordView.js"></script>
	<script>
	    var
	        root = document.querySelector('.song__chords'),
	        tune = ['E', 'B', 'G', 'D', 'A', 'E'];

        this._view = new ChordView({
            title : 'A',
            root : root,
            tune : tune,
            chord : [
                {
                    inactive : true,
                    at : 6 // string
                },
                {
                    at : 2, // string
                    to : 2  // fret
                },
                {
                    at : 3, // string
                    to : 2  // fret
                },
                {
                    at : 4, // string
                    to : 2  // fret
                }
            ]
        });

        this._view = new ChordView({
            title : 'A♯',
            root : root,
            tune : tune,
            chord : [
                {
                    inactive : true,
                    at : 6  // string
                },
                {
                    barre : true,
                    to : 1  // fret
                },
                {
                    at : 4, // string
                    to : 3  // fret
                },
                {
                    at : 3, // string
                    to : 3  // fret
                },
                {
                    at : 2, // string
                    to : 3  // fret
                }
            ]
        });

        this._view = new ChordView({
            title : 'B7',
            root : root,
            tune : tune,
            chord : [
                {
                    inactive : true,
                    at : 6 // string
                },
                {
                    at : 1, // string
                    to : 2  // fret
                },
                {
                    at : 3, // string
                    to : 2  // fret
                },
                {
                    at : 4, // string
                    to : 1  // fret
                },
                {
                    at : 5, // string
                    to : 2  // fret
                }
            ]
        });

        this._view = new ChordView({
            title : 'C',
            root : root,
            tune : tune,
            chord : [
                {
                    inactive : true,
                    at : 6  // string
                },
                {
                    at : 2, // string
                    to : 1  // fret
                },
                {
                    at : 4, // string
                    to : 2  // fret
                },
                {
                    at : 5, // string
                    to : 3  // fret
                }
            ]
        });



	</script>