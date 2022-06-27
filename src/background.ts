import Tab = chrome.tabs.Tab;

const URL_REGEX = /(^(http)s?(:\/\/))((\S)+\.)*(([\w-])+)((\.)[a-zA-Z]{2,3})((\/(\S)+)?)+/
let tabs: TabInformation[] = [];

async function update(tab: TabInformation) {
    await chrome.action.setBadgeText({
        text: tab.text
    });
}


async function getTabInformation(tab?: Tab): Promise<TabInformation> {
    const existingTabInformation = tabs.find(({tabId}) => tabId === tab?.id);
    const urlParts = tab?.url?.match(URL_REGEX) || []

    if (urlParts === null || urlParts.length < 7) {
        return {
            lastCompany: "",
            tabId: tab?.id || 0,
            text: ""
        };
    }

    const companyName: string = urlParts[6];

    if (existingTabInformation) {
        if (companyName === existingTabInformation.lastCompany) {
            return existingTabInformation;
        }

        tabs = tabs.filter(tab => tab !== existingTabInformation);
    }

    const tabInformation: TabInformation = {
        lastCompany: companyName,
        tabId: tab?.id || 0,
        text: companyName
    };

    tabs.push(tabInformation);
    return tabInformation;
}

chrome.tabs.onActivated.addListener(async () => {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabList) => {
        const tabInfo = await getTabInformation(tabList[0]);

        await update(tabInfo);
    });
});

chrome.tabs.onUpdated.addListener(async (_, __, tab) => {
    const tabInfo = await getTabInformation(tab);

    await update(tabInfo);
});

chrome.runtime.onMessage.addListener(
    (request, _, sendResponse) => {
        if (request.msg !== "update_popup") {
            return false;
        }

        chrome.tabs.query({active:true, currentWindow: true}, async (tabList) => {
            const tabInformation = await getTabInformation(tabList[0]);

            sendResponse(tabInformation);
        });

        return true;
    }
);

chrome.tabs.onRemoved.addListener((tabId) => {
    tabs = tabs.filter((tabInformation) => tabInformation.tabId !== tabId);
});
