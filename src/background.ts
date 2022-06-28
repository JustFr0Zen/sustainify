import Tab = chrome.tabs.Tab;

const URL_REGEX = /(^(http)s?(:\/\/))((\S)+\.)*(([\w-])+)((\.)[a-zA-Z]{2,3})((\/(\S)+)?)+/
let tabs: TabInformation[] = [];

async function update(tab: TabInformation) {
    if (tab.rating === -1) {
        await chrome.action.setBadgeText({
            text: ""
        });

        return;
    }

    await chrome.action.setBadgeText({
        text: tab.rating.toString()
    });

    await chrome.action.setBadgeBackgroundColor({
        color: getColorOfRating(tab.rating)
    })
}


function getColorOfRating(rating: number) {
    if (rating > 40) {
        return "#F0AB00";
    }

    if (rating > 30) {
        return "#F3BC33";
    }

    if (rating > 20) {
        return "#F6CD5C";
    }

    if (rating > 10) {
        return "#F9DD99";
    }

    return "#CCCCCC";
}


async function getTabInformation(tab?: Tab): Promise<TabInformation> {
    const existingTabInformation = tabs.find(({tabId}) => tabId === tab?.id);
    const urlParts = tab?.url?.match(URL_REGEX) || []

    if (urlParts === null || urlParts.length < 7) {
        return {
            lastCompany: "",
            tabId: tab?.id || 0,
            rating: -1
        };
    }

    const companyName: string = urlParts[6];

    if (existingTabInformation) {
        if (companyName === existingTabInformation.lastCompany) {
            return existingTabInformation;
        }

        tabs = tabs.filter(tab => tab !== existingTabInformation);
    }


    try {
        console.log("Trying to fetch...", `http://localhost:8080/rating/${companyName}`);
        const ratingResponse = await fetch(`http://localhost:8080/rating/${companyName}`,
            {
                method: 'GET'
            });
        const rating: RatingView = await ratingResponse.json()

        console.log("Result:", rating);

        const tabInformation: TabInformation = {
            lastCompany: companyName,
            tabId: tab?.id || 0,
            rating: rating.rating
        };

        tabs.push(tabInformation);
        return tabInformation;
    } catch (e) {
        console.log(e)
        return {
            lastCompany: "",
            tabId: tab?.id || 0,
            rating: -1
        };
    }
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

        chrome.tabs.query({active: true, currentWindow: true}, async (tabList) => {
            const tabInformation = await getTabInformation(tabList[0]);

            sendResponse(tabInformation);
        });

        return true;
    }
);

chrome.tabs.onRemoved.addListener((tabId) => {
    tabs = tabs.filter((tabInformation) => tabInformation.tabId !== tabId);
});
