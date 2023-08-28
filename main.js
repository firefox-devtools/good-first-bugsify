// The manifest enforces that this extension is loaded only on sites like
// https://bugzilla.mozilla.org/show_bug.cgi?id=... only

let button;
let commit;

insertButton();



function insertButton() {
	let buttonId = 'goodfirstbugsifybutton';
	button = document.getElementById(buttonId);
	commit = document.getElementById('commit');

	// We check for the commit button, as it won't be there if you're not logged in
	if(commit && !button) {
		button = document.createElement('button');
		button.id = buttonId;
		button.textContent = 'Undo';
		commit.parentNode.insertBefore(button, commit);

		button.addEventListener('click', (e) => {
			goodFirstBugsify();
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
	}
}

function goodFirstBugsify() {
	
	let safetyString = '*** Delete this line when you are done: I HAVE COMPLETED ALL THE FIELDS IN THE TEMPLATE AND THIS COMMENT IS READY TO GO ***';

	// input#keywords: +good-first-bug (if not present already)
	let keywords = document.getElementById('keywords');
	let str = 'good-first-bug';


	if(keywords.value.indexOf(str) === -1) {
		keywords.value += ' ' + str;
	}
	
	// textarea#comment: insert instructions text
	let commentArea = document.getElementById('comment');

	// This apparently wrong indentation is to overcome the fact
	// that otherwise the value in the textarea displays the indentation
	// as whitespace. And it's really weird for a user.
	commentArea.value = 
`This is a good first bug. It means it's simple enough for someone who is not experienced with the codebase to have a go at fixing it, and learn more, preparing them for more complicated tasks.

Here's some help to get you started if you've never contributed to Firefox Developer Tools:

First, get the source code from mozilla's repository and make sure you can build and run your own copy of Firefox: http://docs.firefox-dev.tools/getting-started/build.html

Once you check out the code, go to devtools/[{REPLACE WITH FILE PATHS}] and [{INSERT INSTRUCTIONS RELEVANT TO BUG. For example: edit file abc.js, look for function XYZ, convert argument to lower case before printing, etc...}].

To test this works well, [{INSERT MANUAL TESTING INSTRUCTIONS if relevant. Also try to include an online simple and obvious test case, using Bugzilla's URL field.}].

[{OPTIONAL You should also add a new test case in the INSERT TEST FILE NAME, to make sure this bug doesn't happen again in the future.}]

When you think you have fixed the problem, you can submit a patch using the instructions here: http://docs.firefox-dev.tools/contributing/making-prs.html

When asked, use [{MOZREVIEW reviewer alias, for example: :youralias}] as your reviewer.

The reviewer will get in touch with you soon and let you know if there are any issues with the code, and provide advice to fix them before finally getting the code accepted into the repository.

If you have any questions, get in touch with us via our Slack: https://devtools-html-slack.herokuapp.com/ or any of the other ways listed here: http://firefox-dev.tools/#getting-in-touch (IRC, forums, etc).

Thank you for contributing to DevTools. You're great!`;

	commentArea.value += '\n\n' + safetyString;
	
	let pendingGaps = document.createElement('div');
	commentArea.parentNode.insertBefore(pendingGaps, commentArea.nextSibling);


	setCommitEnabled(false);

	// Finds template 'gaps' by looking for any [{...}] block, in the whole text.
	// Note: the ? makes the search not greedy so it doesn't capture all the blocks in just one by letting the inner }][{ be subsumed into just one big result.
	let re = /(\[\{.+?\}\])/g;

	commentArea.oninput = () => {
		let text = commentArea.value;

		let ok = true;
		ok = ok && (text.indexOf(safetyString) === -1);

		let gaps = text.match(re);
		// If there are no matches, the result is null, not an empty Array
		ok = ok && (gaps === null); 
		
		if(gaps) {
			pendingGaps.innerHTML = gaps.length + ' to fill: <ul>' + gaps.map((g) => `<li>${g}</li>`).join('\n') + '</ul>';
		}

		setCommitEnabled(ok);
	};

	// Also remove the button to make this a good first bug, because... do we really
	// need to press it several times? Possibly not.
	button.parentNode.removeChild(button);
}

function setCommitEnabled(value) {
	let newFilterValue = value ? '' : 'grayscale(100) opacity(30%)';
	let newCursorValue = value ? 'initial' : 'not-allowed';
	commit.style.filter = newFilterValue;
	commit.style.cursor = newCursorValue;
	if(!value) {
		commit.disabled = true;
	} else {
		delete commit.disabled;
	}
}
