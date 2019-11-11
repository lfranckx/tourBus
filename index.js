const apikey = "JMjb9sqreGtV3ebvSVRfOTYbb5EiD8Ov";
const baseURL = "https://app.ticketmaster.com/discovery/v2/events.json";
let pageNum = 0;

function getResults(searchTerm, pageNum) {
    if (searchTerm !== "") {
        const params = {
            apikey: apikey,
            city: searchTerm,
            keyword: 'music',
            sort: 'date,asc',
            radius: 12,
            unit: 'miles',
            size: 6,
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
                $('#no-results-message').removeClass('hidden');
                $('#no-results-message').text(`Unable to find results.  Try a different city.`);
                $('#js-error-message').text(`${err.message}`);
            })
    }
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
    const searchTerm = $('#search-term').val();
    $('#loader').show(2000);
    $('#loader').hide(); 
    // iterate through the events in json response
    for (let i = 0; i < responseJson["_embedded"]["events"].length; i++) {
        let image = responseJson["_embedded"]["events"][i].images[0].url;
        let date = new Date(responseJson["_embedded"]["events"][i].dates.start.localDate);
        let month = date.toDateString().substring(4, 7);
        let day = date.toDateString().substring(8, 10);
        let name = responseJson["_embedded"]["events"][i].name;
        let address = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].address.line1;
        let city = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].city.name;
        let venue = responseJson["_embedded"]["events"][i]["_embedded"].venues[0].name;
        // declare empty string to concat multiple strings
        let string = ``;
        string += `<div class="event-container">
            <div class="event-pictures item"><img class="thumbnail" src="${image}"></div>
            <div class="event-date">
            <div class="event-month item">${month}</div>
            <div class="event-day item">${day}</div>
            </div>
            <div class="event-name item">${name}</div>
            <div class="venue-city">
            <div class="event-venue item"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${venue}</a></div>
            <div class="event-city item"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${city}</a></div>
            </div>
            <div class="social-media-container">`
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
                    string += `<div class="event-homepage item web-info"><a href="${homePage}" target="_blank">Homepage</a></div>`;
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
        string += `</div>
        <button class="event-link buttons" type="button"><a class="event-link" href="${responseJson["_embedded"]["events"][i].url}" target="_blank">Tickets & Information</a></button></div>`;
        $('#results').delay(2000).append(string).fadeIn(400);
    }
    let currentPage = responseJson.page.number;
    let totalPages = responseJson.page.totalPages;
    // show next page button
    $('.next').removeClass('hidden');
    // show previous page button if on page higher than 1st page
    // if (currentPage >= 1) {
    //     $('.prev').removeClass('hidden');
    // }
    // remove next page button if on last page
    if (currentPage === totalPages-1) {
        $('.next').addClass('hidden');
    }
    // remove previous page button if on first page
    // if (currentPage === 0) {
    //     $('.prev').addClass('hidden');
    // }
}

// function prevPageResults(responseJson) {
//     $(document).on('click', '.prev', event => {
//         event.preventDefault();
//         $('#results').empty();
//         const searchTerm = $('#search-term').val();
//         pageNum = Math.max(0, pageNum - 1);
//         console.log(pageNum);
//         getResults(searchTerm, pageNum);
//     });
// }

function nextPageResults(responseJson) {
    $(document).on('click', '.next', event => {
        event.preventDefault();
        const searchTerm = $('#search-term').val();
        pageNum++
        console.log(pageNum);
        getResults(searchTerm, pageNum);
    });
}

function watchForm() {
    let first = true;
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#search-term').val();
        pageNum = 0;
        $('#results').removeClass('hidden').fadeIn(1000);
        $('main').removeClass('hidden').fadeIn(1000);
        // empty out any prior results
        $('#results').empty();
        $('#results').delay(2000).append(`<h3 class="results-head">Events Near ${searchTerm}</h3>`);
        getResults(searchTerm, pageNum);
        // only call these functions if it is the first search
        if(first) {
            // prevPageResults();
            nextPageResults();
        }
        first = false;
    });
}

$(watchForm);