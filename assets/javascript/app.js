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
} // end updateClock

// every minute, iterate through each row in train-table
// re-calc nxtArrivalTime and MinutesAway fields based on current moment in time
// update display values 
// function updateTimeFields() {
//  $('<tr>').forEach(function() {
//      console.log($('#frequency-display').html());

//  });

// } // end updateTimeFields

function updateTable() {
    currentTime = moment();
    $('#train-table').load('index.html');
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
    
    // USER-INPUT VALIDATION PRIOR to Submit Button
    //
    // Train name required - cannot be blank
    $('#train-name-input').on('input', function() {
        var input=$(this);
        var is_name=input.val();
        console.log(is_name);
        
        if (is_name) {input.removeClass('invalid').addClass('valid');}
        else {input.removeClass('valid').addClass('invalid');}
    });
    
    // Train destination required - cannot be blank
    $('#destination-input').on('input', function() {
        var input=$(this);
        var is_dest=input.val();
        if (is_dest) {input.removeClass('invalid').addClass('valid');}
        else {input.removeClass('valid').addClass('invalid');}
    });
    
    // First Train Time required in 4-digit military time - cannot be blank
    $('#first-train-time-input').on('input', function() {
        var input=$(this);
        var is_ftt=input.val();
        if (is_ftt) {input.removeClass('invalid').addClass('valid');}
        else {input.removeClass('valid').addClass('invalid');}
    });
    
    
    // Frequency in minutes required - must be a number - cannot be blank
    $('#frequency-minutes-input').keyup('input', function() {
        var input=$(this);
        var is_freq=input.val();
        if (is_freq) {input.removeClass('invalid').addClass('valid');}
        else {input.removeClass('valid').addClass('invalid');}
    });
    
    // -------------------------
    // ADD NEW TRAIN to database
    // -------------------------
    
    $("#submit-new-train").on("click", function(event) {
        event.preventDefault(); 
        
        //////////////////////////////////////////////////////////////////////    
        
        
        // put form input into an array, if errors don't submit form
        var form_data=$('#new-train').serializeArray();
        console.log(form_data);
        
        var error_free = true;
        for (var input in form_data) {
            var element=$('#new-train_' + form_data[input] ['name']);
            var valid=element.hasClass('valid');
            var error_element=$('span', element.parent());
            
            if (!valid){error_element.removeClass('error').addClass('error_show'); error_free = false;}
            else {error_element.removeClass('error_show').addClass('error');}
            
        }
        
        if (!error_free) {
            event.preventDefault();
        }
        else {
            console.log('No errors found!');
        }
        
        
        
        /////////////////////////////////////////////////////////////////////////////////////////////////
        
        // get user input values for new train
        var usrTrainName = $("#train-name-input").val().trim();
        var usrDestination = $("#destination-input").val().trim();
        var tusrFirstTrainTime = $("#first-train-time-input").val().trim(); // don't parse into a number or it will kill leading zeros and cause NAN error
        var tusrFrequencyMinutes = parseInt($("#frequency-minutes-input").val().trim()); // get user-entered string then convert to number
        
        // create object to hold newTrain (KEY: value pairs) 
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
    // setup watch for when new child is added to DB, also on initial load of variables
    // this is the "on child_added change" do something
    
    database.ref().on("child_added", function(childSnapshot) {
        
        console.log(childSnapshot.val()); // see what data looks like at this time
        
        
        // set client-side variables eq to database values (the key's value)
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
        // update minutesAway
        var minutesAway = tMinutesTillTrain; 
        ////////////
        
        
        
        // because there will be multiple rows, you cannot just update a single row in existing HTML
        // you must build each new row as info is added, then append new row to existing rows
        // then you can update the html page/display
        
        var newRow = $('<tr>').append(
            $('<td>').text(usrTrainName).attr('id', 'train-name-display'),
            $('<td>').text(usrDestination).attr('id', 'destination-display'),
            $('<td>').text(usrFrequencyMinutes).attr('id', 'frequency-display'),
            $('<td>').text(nxtArrivalTime).attr('id', 'next-arrival-display'),
            $('<td>').text(minutesAway).attr('id', 'minutes-away-display')    
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
    // 4.  set up the on.child-added change for the database
    // 5.  if there is something in the database, sync it with the client side
    // 6.  create addTrain function to add new train record to Firebase database
    // 7.  include input validation checking for addTrain function
    // 8.  get code working with one record first, then add additional functionality
    // 9.  add calculations for Next Arrival and Minutes Away fields that are NOT stored in the DB
    // 10. add visual/graphic elements and additional functionality if time
    
    