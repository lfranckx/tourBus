const key = "AIzaSyC1HapLKiQEa0kqzv54kEFdpdyn4TV8Ktw";
const baseURL = "";

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        getResults(searchTerm);
    });
}

function getResults(searchTerm) {
    const params = {
        query: "Live Music Venue",
        location: searchTerm,
        radius: '16100'
        apikey: key
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

function displayResults(responseJson) {
    console.log(responseJson);

    //remove any prior results
    $('#results-list').empty();
    // for 
    for (let i = 0; i < responseJson.data.length; i++) {
        $('#results-list').append(
            `<li>${responseJson.}`
        )
    }
}

function formatQueryParams(params) {
    // declare variable for key values
    const queryItems = Object.keys(params);
    // map object into a string and turn : into =
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    // join string together with &
    return queryItems.join('&');
}

$(watchFrom)