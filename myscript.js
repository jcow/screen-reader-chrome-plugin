




// resources
// https://codepen.io/matt-west/pen/wGzuJ
// https://developer.chrome.com/extensions/getstarted
// https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/resume
// https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/onend
// #manifest-iframe



var div = document.createElement("div");
div.innerHTML = `

  <style>
    #hos-container {
      position: fixed;
      right:0;
      top: 0;
      height: 100%;
      width: 200px;
      background-color: #aaa;
      display: none;
      cursor: pointer;
      color: #ccff33 !important;
      z-index: 2147483647;
    }

    #hos-container button.control-button {
        height: 196px;
        width: 196px;
        background-color: #FFF;
        text-align: center;
        border: 2px solid #333;
        font-size: 36px;
    }
  </style>

  <div id="hos-container">
    <button id="play-button" class="control-button">PLAY</button>
    <button id="resume-button" style="display:none" class="control-button">RESUME</button>
    <button id="pause-button" style="display:none" class="control-button">PAUSE</button>
    <button id="cancel-button" style="display:none" class="control-button">CANCEL</button>
  </div>



`;

document.body.appendChild(div);




var hardOfSight = {

  STATE_PAUSED: "PAUSED",
  STATE_PLAYING: "PLAYING",
  STATE_DEFAULT: "DEFAULT",

  state: "",
  container_id: "hos-container",
  is_container_showing: false,

  keys: {
    "ALT": 18,
    "SHIFT": 16,
    "R": 82
  },

  keyMap: {},
  synth: new SpeechSynthesisUtterance(),

  init: function() {
    this.state = this.STATE_DEFAULT;
    this.bind();
  },

  isKeyDown: function(s) {
    return this.keyMap.hasOwnProperty(this.keys[s]) && this.keyMap[this.keys[s]] === true;
  },

  switchToPlayingState: function() {

    speechSynthesis.resume();

    this.state = this.STATE_PLAYING;
    document.getElementById('play-button').style.display = "none";
    document.getElementById('pause-button').style.display = "block";
    document.getElementById('resume-button').style.display = "none";
    document.getElementById('cancel-button').style.display = "none";
  },

  switchToDefaultState: function() {
    this.state = this.STATE_DEFAULT;

    speechSynthesis.cancel();

    document.getElementById('play-button').style.display = "block";
    document.getElementById('pause-button').style.display = "none";
    document.getElementById('resume-button').style.display = "none";
    document.getElementById('cancel-button').style.display = "none";
  },

  switchToPauseState: function() {
    this.state = this.STATE_PAUSED;

    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
    }

    document.getElementById('play-button').style.display = "none";
    document.getElementById('pause-button').style.display = "none";
    document.getElementById('resume-button').style.display = "block";
    document.getElementById('cancel-button').style.display = "block";
  },

  bind: function() {

    onkeydown = onkeyup = function(e) {
        if(e.type == "keyup") {
          console.log(this.keyMap);
        }

        this.keyMap[e.keyCode] = e.type == 'keydown';

        if(this.isKeyDown("ALT") && this.isKeyDown("SHIFT") && this.isKeyDown("R")) {
            this.is_container_showing = !this.is_container_showing;

            var display = (this.is_container_showing === true) ? "block" : "none";
            document.getElementById(this.container_id).style.display = display;
        }

    }.bind(this);

    // play button
    document.getElementById('play-button').addEventListener('click', function() {

      var selectedText = window.getSelection().toString();

      if(selectedText == "") {
        selectedText = "No text highlighted";
      }

      if(selectedText != "") {

        this.switchToPlayingState();

        this.synth.text = selectedText;

        this.synth.voice = speechSynthesis.getVoices().filter(function(voice) {
          return voice.name == 'Google UK English Male';
        })[0];

        speechSynthesis.speak(this.synth);
      }

    }.bind(this));

    // resume
    document.getElementById('resume-button').addEventListener('click', function() {
      this.switchToPlayingState();
    }.bind(this));

    // paused
    document.getElementById('pause-button').addEventListener('click', function() {
      this.switchToPauseState();
    }.bind(this));

    document.getElementById('cancel-button').addEventListener('click', function() {
      this.switchToDefaultState();
    }.bind(this));

    // done playing stuff
    this.synth.onend = function(event) {
        this.switchToDefaultState();
    }.bind(this);

    // Some silly bug with synthesis.  If we're attempting to play, continue to play.
    setInterval(function () {
        if (this.state === this.STATE_PLAYING && speechSynthesis.speaking) {
            speechSynthesis.resume();
        }
    }.bind(this), 2000);

    // if navigating away
    window.onbeforeunload = function(event) {
        this.state = this.STATE_DEFAULT;
        if(speechSynthesis.speaking) {
          speechSynthesis.pause();
        }
    };

  }



}

hardOfSight.init();
