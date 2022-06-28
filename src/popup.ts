function updateContent(tab: TabInformation) {
    const content = document.getElementById('content');

    if (!content) {
        throw Error("Could find content section");
    }

    content.innerHTML = "";

    if (tab.rating === -1) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("column");
        wrapper.classList.add("column-center");

        const x = document.createElement("p");
        x.classList.add("error-x");
        x.innerText = "❌";

        const errorText = document.createElement("p");
        errorText.classList.add("error-text");
        errorText.innerText = "Diese Seite ist nicht hinterlegt";

        wrapper.appendChild(x);
        wrapper.appendChild(errorText);
        content.appendChild(wrapper);

        return;
    }

    const wrapper = document.createElement("div")
    wrapper.classList.add("grid");

    const scoreHeading = document.createElement("div");
    scoreHeading.classList.add("sub-heading");
    scoreHeading.innerText = "Score";

    const scoreValue = document.createElement("div");
    scoreValue.classList.add("value");
    scoreValue.innerText = tab.rating.toString();


    const impactHeading = document.createElement("div");
    impactHeading.classList.add("sub-heading");
    impactHeading.innerText = "Einfluss";

    const impactValue = document.createElement("div");
    impactValue.classList.add("value");
    impactValue.innerText = getClassificationOfRating(tab.rating);

    wrapper.appendChild(scoreHeading);
    wrapper.appendChild(scoreValue);
    wrapper.appendChild(impactHeading);
    wrapper.appendChild(impactValue);

    content.appendChild(wrapper);
}

function getClassificationOfRating(rating: number): string {
    if (rating > 40) {
        return "Schwerwiegend";
    }

    if (rating > 30) {
        return "Hoch";
    }

    if (rating > 20) {
        return "Mittel";
    }

    if (rating > 10) {
        return "Geringfügig";
    }

    return "Vernachlässigbar";
}

window.onload = () => {
    chrome.runtime.sendMessage({
        msg: "update_popup",
    }, (tabInformation) => {
        if (!tabInformation) {
            return;
        }

        updateContent(tabInformation);
    });
};
