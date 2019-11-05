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
    //iterate through json response
    for (let i = 0; i < responseJson["_embedded"]["events"].length; i++) {
        let address = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].address.line1;
        let city = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].city.name;
        let date = responseJson["_embedded"]["events"][i].dates.start.localDate;
        // let artistSite = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.homepage[0].url;
        $('#results').append(
        `<ul class="event-container">
        <li class="event-date">${date.substring(5)}</li>
        <li class="event-name">${responseJson["_embedded"]["events"][i].name}</li>
        <li class="event-pictures"><img class="thumbnail" src="${responseJson["_embedded"]["events"][i].images[0].url}"></li>
        <li class="event-venue">${responseJson["_embedded"]["events"][i]["_embedded"].venues[0].name}</li>        
        <li class="event-address"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${address} ${city}</a></li>
        <li class="event-link"><a href="${responseJson["_embedded"]["events"][i].url}" target="_blank">Buy Tickets</a></li>
        </ul>`);
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