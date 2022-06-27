function updateContent(tab: TabInformation) {
    const p = document.getElementById('information');

    if (!p) {
        throw Error("Could find paragraph");
    }

    p.innerText = tab.text;
}

window.onload = () => {
    console.log("Hallo Welt");
    chrome.runtime.sendMessage({
        msg: "update_popup",
    }, (tabInformation) => {
        console.log("Response", tabInformation)

        if (!tabInformation) {
            return;
        }

        updateContent(tabInformation);
    });
};
