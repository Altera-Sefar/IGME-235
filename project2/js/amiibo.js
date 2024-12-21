"use strict";
window.onload = init;

// Variables to keep track of data

// Stores possible amiibos to display
let amiibos = [];
let amiibosSansCards = [];

// Stores values for dropdowns
let characters = [];
let games = [];

// The current amiibo selected
let currentCharacter = {};

// References to dropdowns/elements of page
let characterDrop;
let gameDrop;
let image;
let skip;
let submit;
let restart;
let skipsRemaining = 3;
let skipInfo;
let lives = 3;
let lifeInfo;
let score = 0;
let scoreInfo;
let highScore = 0;
let highScoreInfo;
let gameInfo;
let checkbox;
let startButton;
// Variables for local storage
const prefix = "jcc4331-";
const storedScoreKey = prefix + "score";
const storedScore = localStorage.getItem(storedScoreKey);

// Setups reference to elements on page, button functions, displays
// initial data, and grabs a random amiibo to display and set as the current amiibo

function init() {
	// Store references to dropdowns and buttons
	characterDrop = document.querySelector("#characters");
	gameDrop = document.querySelector("#series");
	image = document.querySelector("#currentCharacter");
	submit = document.querySelector("#submit");
	skip = document.querySelector("#skip");
	restart = document.querySelector("#restart");
	gameInfo = document.querySelector("#gameProgress")

	// Display skips available at the beginning
	skipInfo = document.querySelector("#remaining");
	skipInfo.innerHTML = "Skips Remaining: " + skipsRemaining;

	// Displays score at the beginning
	scoreInfo = document.querySelector("#score");
	scoreInfo.innerHTML = "Score: " + score;

	// Displays lives
	lifeInfo = document.querySelector("#lives");
	lifeInfo.innerHTML = "Lives: " + lives;

	startButton = document.querySelector("#start");

	// Reference to card checkbox
	checkbox = document.querySelector("#cards");

	// Display high score based on if there was a previous high score
	highScoreInfo = document.querySelector("#HighScore");
	if (storedScore !== null) {
		highScoreInfo.innerHTML = "Highscore: " + storedScore;
	}
	else {
		highScoreInfo.innerHTML = "Highscore: " + highScore
	}

	startButton.onclick = function () {
		getData();
		gameInfo.innerHTML = "Game: In Progress";
		// Establish submit button on click
		submit.onclick = function () {

			// Get the value of the game drop down
			// BECAUSE FOR SOME REASON VALUE ONLY TAKES THE FIRST WORD??????????
			let why = currentCharacter.series.split(" ");
			why = why[0];

			// Proceed if there are lives remaining
			if (lives > 0) {
				// If the current character and game guess are correct, increase points
				if (characterDrop.value == currentCharacter.character
					&& gameDrop.value == why) {
					score++;
					scoreInfo.innerHTML = "Score: " + score;
				}
				// If it isn't, lose a life
				else {
					lives--;
					lifeInfo.innerHTML = "Lives: " + lives;

					// If the game is over, set the high score and display that the game has ended.
					// Store current high score in local storage.
					if (lives == 0) {
						highScore = score;
						highScoreInfo.innerHTML = "Highscore: " + highScore;
						gameInfo.innerHTML = "Game: Over"
						localStorage.setItem(storedScoreKey, highScore);
					}
				}

				// Get a new character.
				getAmiibo();
			}
		}
		// Establish skip button on click
		// If there are skips and lives remaining, change
		// the current amiibo with no consequences
		skip.onclick = function () {

			// If there are skips remaining,
			// choose a new character and lose a skip.
			if (skipsRemaining > 0 && lives > 0) {

				// Get a new character
				getAmiibo();

				// Update skips and display
				skipsRemaining--;
				skipInfo.innerHTML = "Skips Remaining: " + skipsRemaining;
			}
		}
		// Set restart button on click
		// Resets score, lives, and skips and 
		// updates display with correct values
		restart.onclick = function () {
			getAmiibo();
			score = 0;
			lives = 3;
			skipsRemaining = 3;
			gameInfo.innerHTML = "Game: In Progress";
			scoreInfo.innerHTML = "Score: " + score;
			lifeInfo.innerHTML = "Lives: " + lives;
			skipInfo.innerHTML = "Skips Remaining: " + skipsRemaining;
		}

	}
}

// Retrieves data from the Amiibo API
function getData() {
	// 1 - main entry point to web service
	const SERVICE_URL = "https://www.amiiboapi.com/api/amiibo/";
	// 5 - create a new XHR object
	let xhr = new XMLHttpRequest();


	// 6 - set the onload handler
	xhr.onload = dataLoaded;

	// 7 - set the onerror handler
	xhr.onerror = dataError;

	// 8 - open connection and send the request
	xhr.open("GET", SERVICE_URL);
	xhr.send();
}

function dataError(e) {
	console.log("An error occurred");
}

// Reads in the Amiibo API data and creates object to select later
// There amiibos objects will be pushed into an array with character, series, and 
// image properties to call on later. Series and characters are put into their own array 
// so sort out duplicate copies and display those characters and names into a dropdown menu
function dataLoaded(e) {
	// 1 - e.target is the xhr object
	let xhr = e.target;

	// 2 - xhr.responseText is the JSON file we just downloaded
	//console.log(xhr.responseText);

	// 3 - turn the text into a parsable JavaScript object
	let obj = JSON.parse(xhr.responseText);


	// Get the entire log of amiibos to choose from
	let results = obj.amiibo;

	// Create amiibo objects based on character, series, and type.
	for (let i = 0; i < results.length; i++) {
		let amiiboCharacter = {};

		amiiboCharacter.character = results[i].character;
		amiiboCharacter.series = results[i].gameSeries;
		amiiboCharacter.image = results[i].image;
		amiiboCharacter.type = results[i].type;
		if (amiiboCharacter.type != "Card") {
			amiibosSansCards.push(amiiboCharacter);
		}

		// Push to arrays accordingly
		amiibos.push(amiiboCharacter);
		characters.push(amiiboCharacter.character);
		games.push(amiiboCharacter.series);

	}

	// Sort lists alphabetically and remove repeats
	characters = characters.sort();
	characters = [... new Set(characters)];
	games = games.sort();
	games = [... new Set(games)];

	// Fills the dropdown menu
	for (let i = 0; i < characters.length; i++) {
		characterDrop.innerHTML += "<option value=" + characters[i] + ">" + characters[i] + "</option>"
	}
	for (let i = 0; i < games.length; i++) {
		gameDrop.innerHTML += "<option value=" + games[i] + ">" + games[i] + "</option>"
	}
	getAmiibo();
}

// Something went wrong :p
function dataError(e) {
	console.log("An error occurred");
}

// Selects a random amiibo to display and to set as the current amiibo to guess
// This uses Math.Floor[Math.random()*amiibos.length)] to select teh amiibo
// Different display method are used whether the amiibo is a card or a figure.
function getAmiibo() {

	// If amiibo cards are excluded, choose from amiibosSanCards array, otherwise from the normal array.
	if (checkbox.checked == true) {
		currentCharacter = amiibosSansCards[Math.floor(Math.random() * amiibosSansCards.length)]
	}
	else {
		currentCharacter = amiibos[Math.floor(Math.random() * amiibos.length)];
	}

	//Display settings for image.
	if (currentCharacter.type == "Card") {
		image.style.width = "280px";
		image.style.height = "250px";
		image.innerHTML = "<img src = '" + currentCharacter.image + "' alt = 'character'>"
		image.style.objectFit = "none";
		image.style.overflow = "hidden";
	}
	else {
		image.innerHTML = "<img src = '" + currentCharacter.image + "' alt = 'character' width = 250px height = 325px>";
		image.style.width = "280px";
		image.style.height = "400px";
		image.style.objectFit = "contain";
		image.style.overflow = "visible";
	}
}
