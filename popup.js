for (const cmd of ["start", "stop", "replay"]) {
	document.getElementById(cmd).onclick = async () => {
		const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
		chrome.tabs.sendMessage(tab.id, { cmd });
	}
}
