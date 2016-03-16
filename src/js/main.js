
var apiKey = 'bc07ec53213aef6a9dbcc30e18857274';
var listDataCollection = new Backbone.Collection();
var cityModel = new Backbone.Model();
var cityEl = document.querySelector('#city');
var cityInfo = document.querySelector('.cityInfo');

// the following function will perform an XMLHttpRequest to the url

function getWeatherForecast (cityId, cb){

    $.ajax( {
        url : 'http://api.openweathermap.org/data/2.5/forecast/daily',
        data: {
            count: 7,
            id: cityId,
            appid: apiKey

        },
        method : "GET",
        success: cb 
    });

}


// function getWeatherForecast (cityId, callback) {
//     var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?count=7&id=' + cityId;
//     var data;

//     url += '&appid=' + apiKey;

//     var request = new XMLHttpRequest();

//     request.onreadystatechange = function () {
//         if (request.readyState === 4) {
//             data = JSON.parse((request.responseText));
//             callback(data);
//         }
//     };

//     request.open('GET', url);
//     request.send();
// }

// fahrenheight formula
function fahrenheit (temp) {
    return Math.floor((temp - 273.15) * 1.8000 + 32.00);
};

// wind direction formula
function windDirection (input) {
    var cardinalDirections = ['\u2191', '\u2197', '\u2192', '\u2198', '\u2193', '\u2199', '\u2190', '\u2196'];
    var output = cardinalDirections[0];
    var range = 360 / cardinalDirections.length;

    for (var i = cardinalDirections.length, j = 360; input > 0 && j > input - 22.5; (i--, j -= range)) {
        output = cardinalDirections[i];
    }

    return output;
}

function updateData (data) {
    listDataCollection.reset();
    data.list.forEach(function (obj) {
        obj.temp.min = fahrenheit(obj.temp.min);
        obj.temp.max = fahrenheit(obj.temp.max);
        obj.deg = windDirection(obj.deg);
        obj.speed = Math.ceil(obj.speed) + ' mph';
    });
    listDataCollection.add(data.list);
    cityModel.set({
        name: data.city.name,
        country: data.city.country,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon
    });
    
    // cityEl.textContent = data.city.name;
    // cityInfo.textContent = data.city.country + ' ' + data.city.coord.lat + ' ' + data.city.coord.lon;
}

function createCityView (model) {
    var el = $('<div>');

    function render () {
        var contents = cityViewTemplate(model);
        el.html(contents);
    }

    model.on('change', render);

    return {
        el: el,
        destroy: function () {
            el.remove();
            model.off('change', render);
        }
    };
}

var cityView = createCityView(cityModel);

cityEl.appendChild(cityView.el[0]);

// take some data and update the value of element with id city

    function buildApplication (collection) {
        var children = collection.map(createWeatherView);
        $('.main').empty();
        children.map(function (view) {
            $('.main').append(view.el);
        });
    }

listDataCollection.on('add', function () {
    buildApplication(listDataCollection);
});

getWeatherForecast('4056099', updateData);

// templating
var weatherViewTemplate = _.template($('#weatherTemplate').html());
var cityViewTemplate = _.template($('#cityTemplate').html());

function createWeatherView (model) {
    var el = $('<div>');
    var contents = weatherViewTemplate(model);
    el.html(contents);
    return {
        el: el
    };
}

$('input').on('keyup', function (e) {
    if (e.keyCode === 13) {
        getWeatherForecast($('input').val(), updateData);
        $('input').val('');
    }
});
$('button').on('click', function () {
    getWeatherForecast($('input').val(), updateData);
    $('input').val('');
});
