'use strict';
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
                    $('#no-results-message').hide();
                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then(responseJson => displayResults(responseJson))
            .catch(err => {
                $('.results-head').hide();
                $('#no-results-message').show();
                $('#no-results-message').removeClass('hidden');
                $('#no-results-message').text(`Unable to find results for ${searchTerm}`);
            })
    }
}

function formatQueryParams(params) {
    //turn the object key values into a URL string with parameters
    const queryItems = Object.keys(params)
    // map object into a string
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    // join parameters together with &
    return queryItems.join('&');
}

function displayResults(responseJson) {
    console.log(responseJson);
    const searchTerm = $('#search-term').val();
    $('#loader').hide();
    $('.results-head').removeClass('hidden');
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
            <div class="event-image item"><img class="thumbnail" src="${image}"></div>
            <div class="event-date">
            <div class="event-month item">${month}</div>
            <div class="event-day item">${day}</div>
            </div>
            <div class="event-name item">${name}</div>
            <div class="venue-address-city">
            <div class="event-venue item"><strong><a href="https://www.google.com/search?q=${venue}" target="_blank">${venue}</a></strong></div>
            <div class="address-city">
            <div class="event-address item"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${address}</a></div>
            <div class="event-city item"><a href="https://maps.google.com/?q=${address} ${city}" target="_blank">${city}</a></div>
            </div></div>
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
                    string += `<div class="event-facebook item web-info"><a class="social-media-link" href="${facebook}" target="_blank">Facebook</a></div>`;
                }
                if (externalLinks.hasOwnProperty('homepage')) {
                    let homePage = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.homepage[0].url;
                    string += `<div class="event-homepage item web-info"><a class="social-media-link" href="${homePage}" target="_blank">Homepage</a></div>`;
                }
                if (externalLinks.hasOwnProperty('wiki')) {
                    let wiki = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.wiki[0].url;
                    string += `<div class="event-wiki item web-info"><a class="social-media-link" href="${wiki}" target="_blank">Wikipedia</a></div>`;

                }
                if (externalLinks.hasOwnProperty('youtube')) {
                    let youtube = responseJson["_embedded"]["events"][i]["_embedded"].attractions[0].externalLinks.youtube[0].url;
                    string += `<div class="event-youtube item web-info"><a class="social-media-link" href="${youtube}" target="_blank">Youtube</a></div>`;
                }
            }
        }
        string += `</div>
        <button class="event-link tickets-button" type="button"><a class="event-link" href="${responseJson["_embedded"]["events"][i].url}" target="_blank">Tickets & Information</a></button></div>`;
        $('#results').delay(2000).append(string).fadeIn(400);
    }
    let currentPage = responseJson.page.number;
    let totalPages = responseJson.page.totalPages;
    // show more results button
    $('.more').removeClass('hidden');
    // remove more results button if on last page
    if (currentPage === totalPages-1) {
        $('.more').addClass('hidden');
    }
}

function moreResults(responseJson) {
    $(document).on('click', '.more', event => {
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
        if (searchTerm !== "") {
            $('#results').empty();
            $('#results').removeClass('hidden');
            $('main').removeClass('hidden');
            $('#results').append(`<h3 class="results-head hidden">Events Near ${searchTerm}</h3>`);
            $('#loader').show();
        }
        // hide view more button if unable to find results
        $('.more').addClass('hidden');
        getResults(searchTerm, pageNum);
        // only call these functions if it is the first search
        if(first) {
            moreResults();
        }
        first = false;
    });
}

$(watchForm);
$('#search-term').focus();