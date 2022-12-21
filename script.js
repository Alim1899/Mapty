'use strict';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// prettier-ignore

let map, mapEvent;

class Workout{
    date = new Date ();
    id = (Date.now() + '').slice(-10);
    constructor(coords,distance,duration){
        //this.date = ...
        //this.id = ...
        this.coords = coords; //lat/long
        this.distance = distance; //in km
        this.duration = duration; //in min
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords,distance,duration,cadense){
        super(coords, distance,duration);
        this.cadense = cadense;
        this.calcPace();
        this.type = 'running';

    }

    calcPace(){
        //min/km
      this.pace = this.duration/this.distance;
      return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords,distance,duration,elevationGain){
        super(coords, distance,duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this.type = 'cycling';
    }

    calcSpeed(){
        //km/h
        this.speed = this.distance/(this.duration)/60;
        return this.speed;
    }
}

// const run1 = new Running([43,46],5.2, 24, 189)
// const cycl1 = new Cycling([43,46],27, 95, 523)
// console.log(run1, cycl1);



/////////////////////////////////////////////////////////////////////
//  APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class App{
    #map;
    #mapEvent;
    #workouts = [];
constructor(){
this._getPosition();

form.addEventListener('submit', this._newWorkout.bind(this))

inputType.addEventListener('change', this._toggleElevationField.bind(this))  

}

_getPosition(){
    if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(
    this._loadMap.bind(this),
    function(){
    alert("Could not get your position")

})
}

_loadMap(position){
        const {latitude} = position.coords;
            const {longitude} = position.coords;
    
        console.log(`https://www.google.com/maps/@4${latitude},${longitude}`);
        
        const coords = [latitude,longitude]
    
         this.#map = L.map('map').setView(coords, 10);
       
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    
    
      //handling clicks on map
        this.#map.on('click', this._showForm.bind(this))
}

_showForm(mapE){
    this.mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
}

_toggleElevationField(){
    inputElevation.closest('.form__row').classList.toggle('.form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('.form__row--hidden');

}

_newWorkout(e){
    const validInputs = (...inputs) =>inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp=> inp>0)
    e.preventDefault();

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const {lat, lng} = this.mapEvent.latlng;
    let workout;

    

    //If workout running, create running object
    if(type === 'running'){
        const cadence = +inputCadence.value;
    //Check if data is valid
    if(!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
      return alert('Inputs have to be positive numbers');
    
     workout = new Running([lat,lng], distance, duration,cadence);
    }
    //If workout cyclibg, create cycling object
    if(type === 'cycling'){
        const elevation = +inputElevation.value;
        //Check if data is valid
        if(!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) 
        return alert('Inputs have to be positive numbers');
        
        workout = new Cycling([lat,lng], distance, duration,elevation);

    }
    //Add new object to workout array
    this.#workouts.push(workout);


    //Render workout on map as a marker
    this.renderWorkoutMarker(workout);
    //Render workout on list

    //


    //Hide form + Clear input fields

    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    //Display marker
    
    
}
renderWorkoutMarker(workout){
    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(L.popup({
        maxWidth:250,
        minWidth:100,
        autoClose: false,
        closeOnClick: false,
        className:`${workout.type}-popup`

    })
    )
    .setPopupContent(`${workout.distance} kilometer`)
    .openPopup();
    form.classList.add('hidden');
}

}

const app = new App;