// CREATING A NEW BACKBONE COLLECTION THAT CAN EXTEND TWO FUNCTIONS:

var ForecastCollection = Backbone.Collection.extend({

    getAverageMaxTemp: function () {
        return this.reduce(function (prev, model) {
            return model.get('temp').max + prev;
        }, 0) / this.length;
    },

    getAverageMinTemp: function () {
        return this.reduce(function (prev, model) {
            return model.get('temp').min + prev;
        }, 0) / this.length;
    }

});

// ALL MY VARIABLES: 

var apiKey = 'bc07ec53213aef6a9dbcc30e18857274';
var listDataCollection = new ForecastCollection();
var cityModel = new Backbone.Model();
var cityEl = document.querySelector('#city');
var cityInfo = document.querySelector('.cityInfo');

// THE FOLLOWING FUNCTIONS WILL PERFORM AN XMLHttpRequest TO THE URL:

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

getWeatherForecast('4056099', updateData);


// FIND FAHRENHEIT FORMULA:

function fahrenheit (temp) {
    return Math.floor((temp - 273.15) * 1.8000 + 32.00);
};

// FIND WIND DIRECTION FORMULA:

function windDirection (input) {
    var cardinalDirections = ['\u2191', '\u2197', '\u2192', '\u2198', '\u2193', '\u2199', '\u2190', '\u2196'];
    var output = cardinalDirections[0];
    var range = 360 / cardinalDirections.length;

    for (var i = cardinalDirections.length, j = 360; input > 0 && j > input - 22.5; (i--, j -= range)) {
        output = cardinalDirections[i];
    }

    return output;
}

// UPDATE DATA FUNCTION: 

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
    console.log(listDataCollection.getAverageMinTemp());
    
    // cityEl.textContent = data.city.name;
    // cityInfo.textContent = data.city.country + ' ' + data.city.coord.lat + ' ' + data.city.coord.lon;
}

var cityView = createCityView(cityModel);

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


cityEl.appendChild(cityView.el[0]);

function createAvgView (collection) {

    var el = $('<div>');
    var template = _.template();

    function render () {
        el.html(template({
            hi: collection.getAverageMaxTemp()
        }))
        console.log(collection.getAverageMinTemp());
        console.log(collection.getAverageMaxTemp());
    }

    collection.on('add', render);

    render();

    return {
        el: el
    };
}

var avgView = createAvgView(listDataCollection);


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

//FIND AVERAGE WEATHER DESCRIPTION :

var weatherDescrip = function (collection) {
    var modeCount = 0;
    var modeValue;


    collection.forEach(function (x) {
        var total = 0;

        collection.forEach(function (y) {
            if (x.get('weather')[0].description === y.get('weather')[0].description){
               total++;
            }
        });

        if (total > modeCount) {
            modeCount = total;
            modeValue = x.get('weather')[0].description;
        }
    });

    return modeValue;
}

weatherDescrip(listDataCollection);


// TEMPLATING :

var weatherViewTemplate = _.template($('#weatherTemplate').html());
var cityViewTemplate = _.template($('#cityTemplate').html());


// THIS TEMPLATE CREATES MY WEATHER VIEW

function createWeatherView (model) {
    var el = $('<div>');
    var contents = weatherViewTemplate(model);
    el.html(contents);
    return {
        el: el
    };
}

// INPUT FUNCTIONS 

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

function getWeatherForecast (cityId, callback) {
    var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?count=7&id=' + cityId;
    var data;

    url += '&appid=' + apiKey;

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            data = JSON.parse((request.responseText));
            callback(data);
        }
    };

    request.open('GET', url);
    request.send();
}


