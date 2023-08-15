/*global chrome */

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const sidebarOpen = !!document.getElementById("KronosSidebar");
      if (sidebarOpen) {
        const elem = document.getElementById("KronosSidebar");
        elem.parentNode.removeChild(elem);
      } else {
        const body = document.querySelector("body");
        const div = document.createElement("div");
        div.id = "KronosSidebar";
        div.style.cssText = `
                    height: 100vh;
                    width: 300px;
                    position: fixed;
                    z-index: 999;
                    top: 0px;
                    right: 0px;
                `;
        const sidebar = document.createElement("iframe");
        sidebar.style.cssText = `
                    width: 100%;
                    height: 100%;
                    border: none;
                `;
        sidebar.src = chrome.runtime.getURL("index.html");
        sidebar.id = "krosidebar";

        div.appendChild(sidebar);
        body.appendChild(div);

        // --- Import Calendar to GCal --- //

        // Get link to iCal file.
        const iCalUrl = document.getElementById(
          "ctl00_customSideContents_calDlTerm"
        ).href;

        // Store the link in local storage.
        chrome.storage.local.set({ iCalUrl: iCalUrl }, function () {
          console.log("set iCalUrl: " + iCalUrl);
        });
      }
    },
  });
});
