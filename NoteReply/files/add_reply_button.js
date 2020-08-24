/**
 * Note Reply - a MantisBT plugin that adds a reply button to issues
 *
 * You should have received a copy of the GNU General Public License
 * along with Note Reply.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @copyright Copyright (C) 2020 Intra2net AG - www.intra2net.com
 */

(function() {
    const quotePrefix = "> ";

    // selectors
    const hiddenSpanId = "notereply-btn-reply";
    const navbarId = "navbar";
    const bugnoteAddPaneId = "bugnote_add";
    const bugnoteTextId = "bugnote_text";
    const bugnoteClass = ".bugnote";
    const bugnoteNoteClass = ".bugnote-note";
    const bugDescriptionSelector = "td.bug-description";

    /**
     * Get selected text inside an element.
     * @param {Node} element Element within which to look for selected text
     * @returns {(string|null)} Selected text or null if nothing is selected inside that element
     */
    function getSelectedTextInElement(element) {
        let selection = window.getSelection();
        let text = selection.toString();
        if (!text || !element.contains(selection.anchorNode)) {
            return null;
        }
        return text;
    }

    /**
     * Reply to the selected text within an element or to its whole content.
     * @param {object} event Click event that triggered this function
     * @param {Node} element Note element with text to replied to
     */
    function replyItem(event, element) {
        let selectedText = getSelectedTextInElement(element);
        if (!selectedText) {
            selectedText = element.textContent.trim();
        }
        // quote the text -- not the fastest solution but there probably won't be huge notes
        selectedText = selectedText.split("\n").map(x => `${quotePrefix}${x}`).join("\n");

        let textArea = document.getElementById(bugnoteTextId);
        if (textArea.value) {
            textArea.value += `\n\n`;
        }
        // append to the text area instead of replacing -- this allows the user
        // to build the reply with parts of multiple notes
        // (and jump two lines so the user can start typing right away)
        textArea.value += `${selectedText}\n\n`;
        // also scroll it all the way down
        textArea.scrollTop = textArea.scrollHeight;
        // focus on the text area
        textArea.focus();

        // and nicely bring the note textarea into view
        // we need to take the navbar into account as it stays on top of all the elements
        let navBarHeight = document.getElementById(navbarId).offsetHeight;
        // use the panel instead of the text area - it's visually better to be scrolled to
        // a "complete" section than to the middle of an element
        let bugnoteAddPanel = document.getElementById(bugnoteAddPaneId);
        // calculate the distance from the top where we will need to scroll
        let distFromTop = window.pageYOffset + bugnoteAddPanel.getBoundingClientRect().top - navBarHeight;
        window.scrollTo({
            top: distFromTop,
            behavior: "smooth"
        });

        // just in case we have any other handlers
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Add the reply button for the issue description.
     * @param {Node} detailsTable Table HTML node containing the issue details
     * @param {string} btnLabel Label for the reply button
     */
    function addDescriptionReplyButton(detailsTable, btnLabel) {
        let btnGroup = detailsTable.querySelector("tfoot .btn-group");
        let descriptionContainer = detailsTable.querySelector(bugDescriptionSelector);

        let btn = document.createElement("a");
        btn.setAttribute("class", "btn btn-primary btn-sm btn-white btn-round");
        btn.setAttribute("href", "#");
        btn.addEventListener("click", e => replyItem(e, descriptionContainer));
        btn.innerHTML = btnLabel;

        let div = document.createElement("div");
        div.setAttribute("class", "pull-left padding-right-2");
        div.appendChild(btn)

        btnGroup.appendChild(div);
    }

    /**
     * Add a reply button to every note of the issue.
     * @param {string} btnLabel Label for the reply button
     */
    function addNoteReplyButtons(btnLabel) {
        let btnGroupsNotes = document.querySelectorAll(`${bugnoteClass} .category .btn-group`);
        for (let i = 0; i < btnGroupsNotes.length; i++) {
            let noteContainer = btnGroupsNotes[i].closest(bugnoteClass);
            let noteTextContainer = noteContainer.querySelector(bugnoteNoteClass);

            let btn = document.createElement("a");
            btn.setAttribute("class", "btn btn-primary btn-xs btn-white btn-round");
            btn.setAttribute("href", "#");
            btn.addEventListener("click", e => replyItem(e, noteTextContainer));
            btn.innerHTML = btnLabel;

            let div = document.createElement("div");
            div.setAttribute("class", "pull-left");
            div.appendChild(btn)

            btnGroupsNotes[i].appendChild(div);
        }
    }

    /**
     * Add a reply button for the issue description and for the notes.
     */
    function addReplyButtons() {
        let guideElement = document.getElementById(hiddenSpanId);
        // the element we need is not present - we're probably not viewing a bug
        // or we don't have permission to add notes
        if (!guideElement) {
            return;
        }

        let replyLabel = guideElement.textContent;
        addDescriptionReplyButton(guideElement.closest("table"), replyLabel);
        addNoteReplyButtons(replyLabel);
    }

    window.addEventListener("load", addReplyButtons);
})();