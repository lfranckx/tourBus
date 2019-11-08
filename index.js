const apikey = "JMjb9sqreGtV3ebvSVRfOTYbb5EiD8Ov";
const baseURL = "https://app.ticketmaster.com/discovery/v2/events.json";
let pageNum = 0;

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

// function convertDate(date) {
//     console.log(date);
//     const month = date.toLocaleString('default', {month: 'long'});
//     return month;
// }

function displayResults(responseJson) {
    console.log(responseJson);
    //empty out any prior results
    $('#results').empty();
    const searchTerm = $('#search-term').val();
    $('#results').append(`<h3 id="events-header">Events Near ${searchTerm}</h3>`)
    //iterate through the events in json response
    for (let i = 0; i < responseJson["_embedded"]["events"].length; i++) {
        let image = responseJson["_embedded"]["events"][i].images[0].url;
        let date = responseJson["_embedded"]["events"][i].dates.start.localDate;
        let address = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].address.line1;
        let city = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].city.name;
        let venue = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].name;
        // declare empty string to concat multiple strings
        let string = ``;
        string += `<div class="event-container">
            <div class="event-pictures item"><img class="thumbnail" src="${image}"></div>
            <div class="event-date item">${date.substring(5)}</div>
            <div class="event-name item">${responseJson["_embedded"]["events"][i].name}</div>
            <div class="event-venue item"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${venue}</a></div>`
        //  iterate through items that have attractions subfolder
        let eventDetails = responseJson["_embedded"]["events"][i]["_embedded"];
        if (eventDetails.hasOwnProperty('attractions')) {
            let attractions = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0];
            //  iterate through items that have externalLinks subfolder
            if (attractions.hasOwnProperty('externalLinks')) {
                let externalLinks = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks;
                // find artists with facebook, homepage, wiki, and youtube
                if (externalLinks.hasOwnProperty('facebook')) {
                    let facebook = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.facebook[0].url;
                    string += `<div class="event-facebook item web-info"><a href="${facebook}" target="_blank">Facebook</a></div>`;
                }
                if (externalLinks.hasOwnProperty('homepage')) {
                    let homePage = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.homepage[0].url;
                    string += `<div class="event-homepage item web-info"><a href="${homePage}" target="_blank">Artist Page</a></div>`;
                }
                if (externalLinks.hasOwnProperty('wiki')) {
                    let wiki = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.wiki[0].url;
                    string += `<div class="event-wiki item web-info"><a href="${wiki}" target="_blank">Wikipedia</a></div>`;

                }
                if (externalLinks.hasOwnProperty('youtube')) {
                    let youtube = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.youtube[0].url;
                    string += `<div class="event-youtube item web-info"><a href="${youtube}" target="_blank">Youtube</a></div>`;
                }
            }
        }
        // if address is unavailable remove address
        // if (address === undefined) {
        //     string -= `<div class="event-address"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${address} ${city}</a></div>`;
        // }    
        
        // if image height and width are less than 200px replace image

        // convert month from number to name
        // let month = convertDate(date);

        string += `<button class="event-link" type="button"><a href="${responseJson["_embedded"]["events"][i].url}" target="_blank">Tickets & Information</a></button></div>`;
        $('#results').append(string);
    }

    let currentPage = responseJson.page.number;
    let totalPages = responseJson.page.totalPages;

    // show results
    $('#results').removeClass('hidden');
    $('main').removeClass('hidden');
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
        const searchTerm = $('#search-term').val();
        pageNum = Math.max(0, pageNum - 1);
        console.log(pageNum);
        getResults(searchTerm, pageNum);
    });
}

function nextPageResults(responseJson) {
    $(document).on('click', '.next', event => {
        event.preventDefault();
        $('#results').empty();
        const searchTerm = $('#search-term').val();
        pageNum++
        console.log(pageNum);
        getResults(searchTerm, pageNum);
    });
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#search-term').val();
        getResults(searchTerm, pageNum);
        prevPageResults();
        nextPageResults();
    });
}

$(watchForm);