const apikey = "JMjb9sqreGtV3ebvSVRfOTYbb5EiD8Ov";
const baseURL = "https://app.ticketmaster.com/discovery/v2/events.json";


$(watchForm)

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        getResults(searchTerm);
    });
}

function getResults(searchTerm) {
    const params = {
        apikey: apikey,
        city: searchTerm,
        keyword: 'music',
        sort: 'date,asc',
        radius: 12,
        unit: 'miles'
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
    $('#results-list').empty();
    let list = responseJson["_embedded"]["events"];
    for (let i = 0; i < list.length;) {
        $('#results-list').append(
        `<li class="show-name">${list[i].name}</li>`
        )
    }
    $('#results').removeClass('hidden');
}