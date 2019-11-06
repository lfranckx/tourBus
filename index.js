const apikey = "JMjb9sqreGtV3ebvSVRfOTYbb5EiD8Ov";
const baseURL = "https://app.ticketmaster.com/discovery/v2/events.json";
// declare global variable for page number to use in change page functions
let pageNum = 0;

function getResults(searchTerm, pageNum) {
    const params = {
        apikey: apikey,
        city: searchTerm,
        keyword: 'music',
        sort: 'date,asc',
        radius: 12,
        unit: 'miles',
        size: 10,
        page: pageNum
    }
    const queryString = formatQueryParams(params);
    const url = baseURL + '?' + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $('#js-error-message').removeClass('hidden');
            $('#js-error-message').text(`${err.message}`);
        })
}

function formatQueryParams(params) {
    // declare variable for key values
    const queryItems = Object.keys(params)
    // map object into a string and turn : into =
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    // join string together with &
    return queryItems.join('&');
}

function displayResults(responseJson) {
    console.log(responseJson);
    //empty out any prior results
    $('#results').empty();
    //iterate through the events in json response
    for (let i = 0; i < responseJson["_embedded"]["events"].length; i++) {
        // set variables to use for appending items in the results
        let date = responseJson["_embedded"]["events"][i].dates.start.localDate;
        let address = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].address.line1;
        let city = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].city.name;
        let eventDetails = responseJson["_embedded"]["events"][i]["_embedded"];
        // concat strings for the different results
        let string = ``;
        string.concat(
            `<div class="event-date">${date.substring(5)}</div>
            <div class="event-name">${responseJson["_embedded"]["events"][i].name}</div>
            <div class="event-pictures"><img class="thumbnail" src="${responseJson["_embedded"]["events"][i].images[0].url}"></div>
            <div class="event-venue">${responseJson["_embedded"]["events"][i]["_embedded"].venues[0].name}</div>        
            <div class="event-address"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${address} ${city}</a></div>
            <div class="event-link"><a href="${responseJson["_embedded"]["events"][i].url}" target="_blank">Buy Tickets</a></div>`);
        //  iterate through items that have attractions subfolder
        if (eventDetails.hasOwnProperty(attractions)) {
            let attractions = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0];
            // iterate through items that have externalLinks subfolder
            if (attractions.hasOwnProperty(externalLinks)) {
                let facebook = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.facebook[0].url;
                let homePage = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.homepage[0].url;
                let wiki = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.wiki[0].url;
                let youtube = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.youtube[0].url;
                string.append(
                `<div class="event-facebook"><a href="${facebook}">Facebook</a></div>
                <div class="event-homepage"><a href="${homePage}">${homePage}</a></div>
                <div class="event-wiki"><a href="${wiki}">Wikipedia</a></div>
                <div class="event-youtube"><a href="${youtube}">Youtube</a></div>
                <div class="event-link"><a href="${responseJson["_embedded"]["events"][i].url}" target="_blank">Buy Tickets</a></div>`);
            }
        }
        $('#results').append(string);
    }

    let currentPage = responseJson.page.number;
    let totalPages = responseJson.page.totalPages;

    // show results
    $('#results').removeClass('hidden');
    // show next page button
    $('.next').removeClass('hidden');
    // show previous page button if on page higher than 1st page
    if (currentPage >= 1) {
        $('.prev').removeClass('hidden');
    }
    // remove next page button if on last page
    if (currentPage === totalPages-1) {
        $('.next').addClass('hidden');
    }
    // remove previous page button if on first page
    if (currentPage === 0) {
        $('.prev').addClass('hidden');
    }
}

function prevPageResults(responseJson) {
    $(document).on('click', '.prev', event => {
        event.preventDefault();
        $('#results').empty();
        const searchTerm = $('#js-search-term').val();
        pageNum = Math.max(0, pageNum - 1);
        console.log(pageNum);
        getResults(searchTerm, pageNum);
    });
}

function nextPageResults(responseJson) {
    $(document).on('click', '.next', event => {
        event.preventDefault();
        $('#results').empty();
        const searchTerm = $('#js-search-term').val();
        pageNum++
        console.log(pageNum);
        getResults(searchTerm, pageNum);
    });
}
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        getResults(searchTerm, pageNum);
        prevPageResults();
        nextPageResults();
    });
}

$(watchForm);