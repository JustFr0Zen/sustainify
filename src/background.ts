import Tab = chrome.tabs.Tab;

const URL_REGEX = /(^(http)s?(:\/\/))((\S)+\.)*(([\w-])+)((\.)[a-zA-Z]{2,3})((\/(\S)+)?)+/
let tabs: TabInformation[] = [];

async function update(tab: TabInformation) {
    await chrome.action.setBadgeText({
        text: tab.text
    });
}


async function getTabInformation(tab: Tab): Promise<TabInformation> {
    const existingTabInformation = tabs.find(({tabId}) => tabId === tab.id);

    if (existingTabInformation) {
        return existingTabInformation;
    }

    //TODO
    const urlParts = tab.url?.match(URL_REGEX) || []

    if (urlParts === null || urlParts.length < 7) {
        return {
            tabId: tab.id || 0,
            text: ""
        };
    }

    const tabInformation = {
        tabId: tab.id || 0,
        text: urlParts[6]
    };

    tabs.push(tabInformation);

    return tabInformation;
}

chrome.runtime.onMessage.addListener(
    function (request, _, sendResponse) {
        if (request.msg !== "update_popup") {
            return;
        }

        const tab = request.tab;

        getTabInformation(tab).then(async tabInformation => {
            await update(tabInformation);

            sendResponse(tabInformation)
        });
    }
);

chrome.tabs.onRemoved.addListener((tabId) => {
    tabs = tabs.filter((tabInformation) => tabInformation.tabId !== tabId);
});

