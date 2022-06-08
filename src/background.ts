const URL_REGEX = /(^(http)[s]?(:\/\/))((\w)+\.)*((\w)+)((\.)[a-zA-Z]{2,3})((\/(\S)+)?)+/

chrome.webNavigation.onCompleted.addListener(async ({url}) => {
    const matches = url.match(URL_REGEX) || []

    if (matches === null || matches.length < 7) {
        return;
    }

    await chrome.action.setBadgeText({
        text: matches[6] || "😢" // domain name
    });
});
