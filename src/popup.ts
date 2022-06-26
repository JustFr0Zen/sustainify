function updateContent(tab: TabInformation) {
    const p = document.getElementById('information');

    if (!p) {
        throw Error("Could find paragraph");
    }

    p.innerText = tab.text;
}

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.runtime.sendMessage({
        msg: "update_popup",
        tab: tabs[0]
    }, (tabInformation) => {
        updateContent(tabInformation);
    });
});

// chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//     chrome.runtime.sendMessage("update-popup", (response) => {
//         if (!response) {
//             return;
//         }
//
//         updateContent(response)
//     })
// });
