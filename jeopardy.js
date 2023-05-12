// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CATEGORIES = 5;
let categories = [];
const gameBoard = document.getElementById('jeopardy');
const btn = document.getElementById('restart');


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds(catIds) {
	let randomIds = _.sampleSize(catIds.data, NUM_CATEGORIES);
	let categoryIds = [];
	for (cat of randomIds) {
		categoryIds.push(cat.id);
	}
	return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

function getCategory(catId) {
    let cat = catId.data;
	let clues = _.sampleSize(cat, NUM_QUESTIONS_PER_CATEGORIES);
	let catData = {
		title: cat[0].category.title,
		clues: []
	};
	clues.map((arr) => {
		let cluesArr = {
			question: arr.question,
			answer: arr.answer,
			showing: null
		};
		catData.clues.push(cluesArr);
	});
	categories.push(catData);
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    let titles = categories.map((title) => {
		return title.title;
	});
	$("thead").add("tr");
	for (let x = 0; x < NUM_CATEGORIES; x++) {
		const catHeader = document.createElement("th");
		catHeader.innerText = titles[x];
		$("thead").append(catHeader);
	}
	for (let y = 0; y < NUM_QUESTIONS_PER_CATEGORIES; y++) {
		const row = document.createElement("tr");
		for (let x = 0; x < NUM_CATEGORIES; x++) {
			const cell = document.createElement("td");
			cell.innerHTML = `<div id=${x}-${y}>?</div>`;
			row.append(cell);
		}
		gameBoard.append(row);
	}
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(e) {
    let x = e.target.id[0];
	let y = e.target.id[2];
	
	if (e.target.classList.contains("answer")) {
		return;
	} else if (e.target.classList.contains("question")) {
		e.target.innerText = categories[x].clues[y].answer;
		e.target.classList.remove("question");
		e.target.classList.add("answer");
	} else {
		e.target.innerText = categories[x].clues[y].question;
		e.target.classList.add("question");
	}
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const resCategories = await axios.get("http://jservice.io/api/categories", {
		params: {
			count: 50
		}
	});
    console.log(resCategories);
	let catIds = getCategoryIds(resCategories);

	for (id of catIds) {
		const resTitles = await axios.get("http://jservice.io/api/clues", {
			params: {
				category: id
			}
		});
		getCategory(resTitles);
	}
	fillTable();
}


/** On click of start / restart button, set up game. */
$(btn).on("click", function() {
	location.reload();
});


/** On page load, add event handler for clicking clues */
$(document).ready(function() {
	setupAndStart();
	$(gameBoard).on("click", "div", handleClick);
});
