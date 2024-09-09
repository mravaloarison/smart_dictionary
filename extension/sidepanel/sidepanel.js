let loading = false;

// Get the selected text and screenshot URL from the session storage
chrome.storage.session.get(
	["textHighlighted", "screenShotUrl"],
	({ textHighlighted, screenShotUrl }) => {
		generateExplanation(textHighlighted, screenShotUrl);
	}
);

// Listen for changes in the session storage
chrome.storage.session.onChanged.addListener((changes) => {
	const textHighlightedChange = changes["textHighlighted"];
	const screenShotUrlChange = changes["screenShotUrl"];

	if (!textHighlightedChange && !screenShotUrlChange) return;

	generateExplanation(
		textHighlightedChange.newValue,
		screenShotUrlChange.newValue
	);
});

// Generate the explanation for the selected word
function generateExplanation(word, screenShotUrl) {
	if (!word) return;

	const loadingIcon = createLoadingIcon();
	const audioIcon = createAudioIcon();

	const definitionTextElement = document.getElementById("definition-text");
	const definitionWordElement = document.getElementById("definition-word");
	const audioSection = document.getElementById("audio-section");

	audioSection.innerHTML = "";

	definitionTextElement.innerText = "";
	definitionTextElement.appendChild(loadingIcon);
	definitionWordElement.innerText = word;

	generateAPICall(word, screenShotUrl)
		.then((res) => {
			definitionTextElement.innerHTML = res;
			animateText(res, "definition-text", 5);

			setTimeout(() => {
				audioSection.appendChild(audioIcon);
				audioIcon.addEventListener("click", () =>
					handleChromeTTS(res, audioIcon)
				);
			}, res.length * 6);
		})
		.catch((error) => console.error("Error:", error))
		.finally(() => loadingIcon.remove());
}

// Call the API to get the explanation for the selected word
async function generateAPICall(word, screenShotUrl) {
	const response = await fetch("http://localhost:5000/generate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			selected_paragraph: word,
			screenshot_url: screenShotUrl,
		}),
	});

	const data = await response.json();
	const res = data.response;

	return !res ? "An error occurred while fetching the explanation." : res;
}

// Handle text-to-speech
function handleChromeTTS(text, audioIcon) {
	if (!text) return;

	speak(text);

	audioIcon.classList.toggle("playing");
}

// Create loading icon
function createLoadingIcon() {
	const loadingIcon = document.createElement("img");
	loadingIcon.src = "../images/loading.png";
	loadingIcon.alt = "Loading icon";
	loadingIcon.id = "icon";

	return loadingIcon;
}

// Create audio icon
function createAudioIcon() {
	const audioIcon = document.createElement("img");
	audioIcon.src =
		"https://img.icons8.com/?size=300&id=AMsRr4TzHaCn&format=png&color=000000";
	audioIcon.alt = "Audio icon";
	audioIcon.id = "audio-icon";

	return audioIcon;
}

// Text-to-speech function
function speak(text) {
	const synth = window.speechSynthesis;
	const speakText = new SpeechSynthesisUtterance(text);

	synth.speaking ? synth.cancel() : synth.speak(speakText);
}

// text animation
function animateText(text, containerId, delay) {
	const container = document.getElementById(containerId);
	container.innerHTML = "";

	let index = 0;

	function typeChar() {
		if (index < text.length) {
			container.innerHTML += text[index];
			index++;
			setTimeout(typeChar, delay);
		}
	}

	typeChar();
}
