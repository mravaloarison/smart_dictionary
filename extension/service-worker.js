chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "define-word",
		title: "Use Smart definition for '%s'",
		contexts: ["selection"],
	});
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
	chrome.tabs.captureVisibleTab((dataUrl) => {
		chrome.storage.session.set({
			screenShotUrl: dataUrl,
			textHighlighted: data.selectionText,
		});
	});

	chrome.sidePanel.open({ tabId: tab.id });
});
