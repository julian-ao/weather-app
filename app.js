const select_place = document.getElementById("select-place");
const place_title = document.getElementById("place-title");
const time_top = document.getElementById("time-top");
const type_weather_now = document.getElementById("type-weather-now");
const emoji_now = document.getElementById("emoji-now");
const temp_now = document.getElementById("temp-now");
const wind_speed_now = document.getElementById("wind-speed-now");
const wind_direction_now = document.getElementById("wind-direction-now");
const humidity_now = document.getElementById("humidity-now");

const top_card = document.getElementById("top-card");
const main_card = document.getElementById("main-card");
const graph_card = document.getElementById("graph-card");

const graph_days = document.getElementById("graph-days");
const graph_grid = document.getElementById("graph-grid");
const graph_lines = document.getElementById("graph-lines");

const search_input = document.getElementById("search-input");
const search_btn = document.getElementById("search-btn");
const search_results = document.getElementById("search-results");

const main = document.querySelector("main");

// LEGGER TIL ALLE STEDENE I SØKE-LISTA
addSearchElements();

let d = new Date();
let dayOfWeek = d.getDay();
let year = d.getFullYear();
let month = d.getMonth() + 1;
let day = d.getDate();
let hour = d.getHours();


// HVOR PÅ API-EN MAN FINNER DE NESTE DAGENE KL 12
nextDays =  [2, 38 - hour, 62 - hour, 76 - hour, 80 - hour, 84 - hour, 88 - hour, 92 - hour, 96 - hour, 100 - hour];

// ALLE KLOKKESLETT PÅ DØGNET
nextHours = [00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 00];

days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

// FUNKSJON SOM ENDRER PÅ PÅ SIDEN 
async function updateAll(place){

    let lat = cities[place].lat;
    let lon = cities[place].lon;

    // HENTER API //
    let url = "https://api.met.no/weatherapi/locationforecast/2.0/.json?lat=" + lat + "&lon=" + lon;
    console.log(url);
    const res = await fetch(url);
    const data = await res.json();

    const sc = data.properties.timeseries;

    let typeWeather = sc[2].data.next_1_hours.summary.symbol_code;
    typeWeather = typeWeather.split("_")[0]; // FJERNER _night FRA symbol_code

    main.style.display = "block"; // VISER MAIN
    
    // ENDRER TOP-INFORMASJONEN //
    place_title.innerHTML = `${cities[place].city}`;
    time_top.innerHTML = `(${nextHours[hour]}-${nextHours[hour + 1]})`;
    type_weather_now.innerHTML = `${typer[typeWeather].beskrivelse}`;
    emoji_now.innerHTML = `${typer[typeWeather].emoji}`;
    temp_now.innerHTML = `${sc[2].data.instant.details.air_temperature}° C`;
    wind_speed_now.innerHTML = `${sc[2].data.instant.details.wind_speed} ${data.properties.meta.units.wind_speed}`;
    wind_direction_now.style.transform = "rotate(" + sc[2].data.instant.details.wind_from_direction + "deg)";

    // ENDRER TEMPERATUREN TIL BLÅ ELLER RØD
    temp_now.classList.remove("red-text");
    temp_now.classList.remove("blue-text");
    if(sc[2].data.instant.details.air_temperature > 0){
        temp_now.classList.add("red-text");
    } else {
        temp_now.classList.add("blue-text");
    }

    let highestHeight = 0;

    search_input.value = "";
    addSearchElements(); // FLYTT

    // DE NESTE 7 DAGENE //
    graph_grid.innerHTML = ``;
    main_card.innerHTML = ``;
    for(i = 0; i < 7; i++){

        let temperature = sc[nextDays[i]].data.instant.details.air_temperature;

        typeWeather = sc[i].data.next_1_hours.summary.symbol_code;
        typeWeather = typeWeather.split("_")[0]; // FJERNER _night FRA symbol_code

        // SKRIVER UT HTML-KODEN FOR HVER DAG
        main_card.innerHTML += `
        <div class="cell" id="cell${i + 1}">
            <div class="cell-day" id="cell-day${i + 1}">${days[dayOfWeek + i - 1]}</div>
            <div class="cell-right">
                <div class="cell-temp" id="cell-temp${i + 1}">${sc[nextDays[i]].data.instant.details.air_temperature}° C</div>
                <div class="cell-weather" id="cell-weather${i + 1}">${typer[typeWeather].emoji}</div>
            </div>
        </div>`;

        // LETER ETTER TEMPERATUREN MED HØYEST VERDI
        if(temperature > 0){
            if(temperature > highestHeight){
                highestHeight = temperature;
            }
        }
        if(temperature <= 0){
            if(-temperature > highestHeight){
                highestHeight = -temperature;
            }
        }
            
    }

    document.getElementById("cell-day1").innerHTML += ` (nå)`; // LEGGER TIL (nå) PÅ FØRSTE DEG
    
    for(i = 0; i < 7; i++){

        let temperature = sc[nextDays[i]].data.instant.details.air_temperature;

        // LAGER SØYLENE I DIAGRAMMET
        // DEN TEMPERATUREN MED HØYEST VERDI ER 100% AV HØYDEN
        if(sc[nextDays[i]].data.instant.details.air_temperature > 0){
            graph_grid.innerHTML += `<div class="graph-col red-background" style="height:${temperature * (220 / highestHeight)}px; margin-top: ${220 - (temperature * (220 / highestHeight))}px">
            ${temperature}° C
            </div>`;
        } else {
            graph_grid.innerHTML += `<div class="graph-col blue-background" style="height:${-temperature * (220 / highestHeight)}px; margin-top: ${220 + (temperature * (220 / highestHeight))}px">
            ${temperature}° C
            </div>`;
        }  
    }

    // LEGGER TIL DAGENE PÅ GRAFEN
    graph_days.innerHTML = ``;
    for(i = 0; i < 7; i++){
        if(i == 0){
            graph_days.innerHTML += `<p style="width: max-content">${days[dayOfWeek + i - 1]} (nå)</p>`; 
        } else{
            graph_days.innerHTML += `<p>${days[dayOfWeek + i - 1]}</p>`;
        }
    }

    // LINJENE PÅ GRAFEN (IKKE FERDIG)
    graph_lines.style.height = "230px";
    
}


// SØKEFUNKSJONER

// FJERNER DET SOM STÅR I INPUT-FELTET NÅR MAN TRYKKER PÅ DET
search_input.onclick = function(){
    search_input.value = "";
    addSearchElements();
}

search_input.oninput = function(){

    let numberOfSearchResults = 0;

    search_results.innerHTML = ``; // TØMMER SØKERESULTATENE NÅR MAN SKRIVER

    for(i = 0 ; i <= cities.length - 1; i++){

        let search = cities[i].city.toUpperCase().search(search_input.value.toUpperCase()); // SJEKKER OM DET SOM STÅR I INPUT-FELTET STEMER MED BY-NAVNENE
        if(search >= 0){ // HVIS DET SOM STÅR I INPUT-FELTET STEMMER MED BYNAVNET
            numberOfSearchResults ++;
            search_results.innerHTML += `<div class="search-element" onClick="updateAll(${i})">${cities[i].city}<div class="region">, ${cities[i].admin}</div></div>`;
        }
        if(numberOfSearchResults < 7){ // HVIS DET ER UNDER 7 SØKERESULTATER, SKAL HØYDET DEFINERES AV HVOR MANGE SØKERESULTATER DET ER
            search_results.style.height = "max-content";
        } else {
            search_results.style.height = "200px";
        }
    }
    if(numberOfSearchResults == 0){ // HVIS DET ER 0 SØKERESULTATER
        search_results.innerHTML = `<div class="search-element">Beklager! Vi fant ikke stedet "${search_input.value}" i våre databaser</div>`;
    }

}

function addSearchElements(){ // LEGGER TIL ALLE BYENE I SØKERESULTATENE
    search_results.innerHTML = ``;
    for(i = 0 ; i <= cities.length - 1; i++){
        search_results.innerHTML += `<div class="search-element" onClick="updateAll(${i})">${cities[i].city}<div class="region">, ${cities[i].admin}</div></div>`;
    }
    search_results.style.height = "200px";
}