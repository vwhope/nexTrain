// nexTrain app - using Firebase and MomentJS
//
// The purpose of this code is to:
//    gain experience using Firebase and working with date/time objects with MomentJS
//
// Lessons learned with this assignment
//
// 1. understanding that the time object includes both date and time
// 2. 
// ================================ BEGIN GLOBAL VARIABLE DEFINITIONS =======================================================
//
// set GLOBAL variables available to all functions - (generally don't want global- is better to make an encapsulated object)
// config file that links to my firebase DB
var config = {
    apiKey: "AIzaSyDov32GoGzCM0YWTCAAqh0OKFxVHGeQFMY",
    authDomain: "nextrain-4c3e9.firebaseapp.com",
    databaseURL: "https://nextrain-4c3e9.firebaseio.com",
    projectId: "nextrain-4c3e9",
    storageBucket: "nextrain-4c3e9.appspot.com",
    messagingSenderId: "891982050906"
};

// initialize firebase with my config file that links to the database
firebase.initializeApp(config);

// create a reference to the firebase database
var database = firebase.database();

// ================================ END GLOBAL VARIABLE DEFINITIONS =========================================================

// ================================ BEGIN FUNCTION DEFINITIONS  =============================================================
//

function updateClock(currentTime) {
    // display updated current time in the Schedule header
    
    // update current time  
    currentTime = moment();
    
    // display updated time in desired format
    $('#schedule-header').text(moment(currentTime).format('dddd, MMMM Do YYYY, h:mm a')); 
}

// ================================ END FUNCTION DEFINITIONS ================================================================
//
// HTML page loads FIRST, then this code runs 
//
$(document).ready(function() {
    
    // get current time  
    var currentTime = moment();
    
    // display it in desired format
    $('#schedule-header').text(moment(currentTime).format('dddd, MMMM Do YYYY, h:mm a')); 
    
    // call function to update current time every minute
    setInterval('updateClock()', 60000);
    
    // -------------------------
    // ADD NEW TRAIN to database
    // -------------------------
    $("#submit-new-train").on("click", function(event) {
        event.preventDefault();
        
        // get user input values for new train
        var usrTrainName = $("#train-name-input").val().trim();
        var usrDestination = $("#destination-input").val().trim();
        var tusrFirstTrainTime = parseInt($("#first-train-time-input").val().trim()); // get user-entered string and convert to number
        var tusrFrequencyMinutes = parseInt($("#frequency-minutes-input").val().trim()); // get user-entered string then convert to number
        
        // create object to hold newTrain (key: value pairs)
        var newTrain = {
            trainName: usrTrainName,
            destination: usrDestination,
            firstTrainTime: tusrFirstTrainTime,
            frequency: tusrFrequencyMinutes,
        };
        
        // add new train info to firebase root directory
        database.ref().push(newTrain);
        
        
        // log newTrain object values for internal verification - all data received as intended 
        console.log(newTrain.trainName);
        console.log(newTrain.destination);
        console.log(newTrain.firstTrainTime); // number
        console.log(newTrain.frequency); // number
        
        /////////////
        // may need to do some verification of input values before writing to DB so that I don't end up
        // with incomplete or corrupt record in the DB
        ////////////
        
        // clear user-input data (this was happening automatically - not sure why?)
        $("#train-name-input").val('');
        $("#destination-input").val('');
        $("#first-train-time-input").val(''); // get user-entered string and convert to number
        $("#frequency-minutes-input").val('');
        
    }); // END ADD newTrain
    
    // ONCE USER ADDS A NEW TRAIN
    // 1. from the user-input data, calculate nxtArrivalTime and tminutesAway
    // 2. set firebase to automatically notice a new train was added to the DB 
    // 3. Once noticed, add the new train info AND calculated fields to the HTML/display 
    //
    // setup the watch for value changes in DB and initial load of variables
    // this is the "on value change" do something
    
    database.ref().on("child_added", function(childSnapshot) {
        
        console.log(childSnapshot.val()); // see what data looks like at this time
        
        
        // set client-side variables eq to database values (NOT the KEY, but the value)
        var usrTrainName = childSnapshot.val().trainName;
        var usrDestination = childSnapshot.val().destination;
        var usrFirstTrainTime = childSnapshot.val().firstTrainTime; // may have a # to string issue here (parseInt)
        var usrFrequencyMinutes = childSnapshot.val().frequency; // may have # to string issue here
        
        // New Train 
        console.log(usrTrainName);
        console.log(usrDestination);
        console.log(usrFirstTrainTime);
        console.log(usrFrequencyMinutes);
        
        //
        // calc nxtArrivalTime AND minutesAway
        // using momentJS and time/date math
        //
        //set frequency in minutes from user-input/database
        var tFrequencyMinutes = usrFrequencyMinutes;
        console.log('Frequency: ' + tFrequencyMinutes);
        
        // set first train time to converted military train time
        // by subtracting a year here we don't have to test for multiple conditions
        // like if first train time is greater, equal or less than current time
        // as long as first train time date is less than current date/time
        // you can just keep adding frequency to first train time until
        // first train time is greater than or equal to current time
        var tFirstTrainTime = moment(usrFirstTrainTime, 'HH:mm').subtract(1, 'years');
        console.log('First Train Time: ' + tFirstTrainTime);
        
        // get difference between current time and first Train time
        var diffTime = moment().diff(moment(tFirstTrainTime), 'minutes');

        // using the difference between current time and first train time
        // divide that difference by the frequency and get the remainder
        var tRemainder = diffTime % tFrequencyMinutes;
        console.log(tRemainder);

        // now that you have the time remaining subtract it from the frequency
        var tMinutesTillTrain = tFrequencyMinutes - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);
       
        // Next Train
        var nxtArrivalTime = moment().add(tMinutesTillTrain, "minutes").format('hh:mm A');
        console.log("ARRIVAL TIME: " + nxtArrivalTime);

        /////////////
        // calc minutesAway
        var minutesAway = tMinutesTillTrain; 
        ////////////
        
        
        
        // because there will be multiple rows, you cannot just update existing HTML
        // you must build each new row and then append the new row to the existing rows
        // then you can update the html page/display
        
        var newRow = $('<tr>').append(
            $('<td>').text(usrTrainName),
            $('<td>').text(usrDestination),
            $('<td>').text(usrFrequencyMinutes),
            $('<td>').text(nxtArrivalTime),
            $('<td>').text(minutesAway)    
            );
            
            // append the new row to the train schedule
            $('#train-table > tbody').append(newRow)
            
            // log any errors to console so can trouble shoot 
        }, function(errorObject) {
            console.log("The READ failed: " + errorObject.code);
            
        }); // END on child_added
        
    }); // end document.ready function
    
    // ================================ END Program here  ==========================================================================
    // my pseudo code for the app
    // 1.  wait until html page is loaded before running any JavaScript - document.ready() 
    // 2.  set up config file for Firebase database - server-side
    // 3.  initialize global variables with default values - client-side
    // 4.  set up the on.value change for the database
    // 5.  if there is something in the database, sync it with the client side
    // 6.  set up addTrain function to add new record to DB
    // 7.  once working with one record add loop functionality to read all DB records and updat the screen
    // 8.  add calculations for the next arrival and  minutes away fields that are NOT stored in the DB
    // 9.  add graphics if time
    
    