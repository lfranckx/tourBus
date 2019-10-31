const apikey = "JMjb9sqreGtV3ebvSVRfOTYbb5EiD8Ov";
const baseURL = "https://app.ticketmaster.com/discovery/v2/events.json";

function getResults(searchTerm, pageNum) {
    const params = {
        apikey: apikey,
        city: searchTerm,
        keyword: 'music',
        sort: 'date,asc',
        radius: 12,
        unit: 'miles',
        page: pageNum
    }
    const queryString = formatQueryParams(params);
    const url = baseURL + '?' + queryString;
    console.log(url);

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
            $('#js-error-message').text(`Error: ${err.message}`);
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
    for (let i = 0; i < responseJson["_embedded"]["events"].length; i++) {
            $('#results').append(
                `<ul class="show-container">
                <li class="show-date">${responseJson["_embedded"]["events"][i].dates.start.localDate}</li>
                <li class="show-name">${responseJson["_embedded"]["events"][i].name}</li>
                <li class="show-pictures"><img class="thumbnail" src="${responseJson["_embedded"]["events"][i].images[0].url}"></li>
                <li class="show-venue">${responseJson["_embedded"]["events"][i]["_embedded"].venues[0].name}</li>        
                <li class="show-address">${responseJson["_embedded"]["events"][i]["_embedded"].venues[0].address.line1}</li>
                <li class="show-address">${responseJson["_embedded"]["events"][i]["_embedded"].venues[0].city.name}</li>
                <li class="show-link"><a href="${responseJson["_embedded"]["events"][i].url}">Buy Tickets</a></li>
                </ul>`)
    }
    $('#next-button').removeClass('hidden');
    $('#results').removeClass('hidden');
}

function nextPageResults(responseJson) {
    $('#next-button').click(event => {
        console.log("getting next page results");
        event.preventDefault();
        $('#results').empty();
        const searchTerm = $('#js-search-term').val();
        let pageNum = responseJson.page.number;
        pageNum++;
        getResults(searchTerm, pageNum);
    });
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        let pageNum = 0;
        getResults(searchTerm, pageNum);
    });
}

$(watchForm);
$(nextPageResults);