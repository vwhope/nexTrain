// nexTrain app - using Firebase and MomentJS
//
// The purpose of this code is to:
//   - use Firebase to store data
//   - work with date/time objects using MomentJS
//   - implement user-input validation
//
// Lessons learned with this assignment
//
// 1. understanding that the time object includes both date and time
// 2. pros/cons updating the entire HTML page using location.reload()
// 3. learning various ways to perform user-input validation (regular expressions, jQuery validation, HTML validation)
//
// ================================ BEGIN GLOBAL VARIABLE DEFINITIONS =======================================================
//
// set GLOBAL variables available to all functions 
//
// config file that links to application's firebase DB
var config = {
    apiKey: "AIzaSyDov32GoGzCM0YWTCAAqh0OKFxVHGeQFMY",
    authDomain: "nextrain-4c3e9.firebaseapp.com",
    databaseURL: "https://nextrain-4c3e9.firebaseio.com",
    projectId: "nextrain-4c3e9",
    storageBucket: "nextrain-4c3e9.appspot.com",
    messagingSenderId: "891982050906"
};

// initialize firebase with config file that links to the database
firebase.initializeApp(config);

// create a reference to the firebase database, in this case the referenence is to the root directory
var database = firebase.database();

// ================================ END GLOBAL VARIABLE DEFINITIONS =========================================================

// ================================ BEGIN FUNCTION DEFINITIONS  =============================================================
//

function updateClock(currentTime) {
    
    // update current time  
    currentTime = moment();
    
    // display updated time in desired format
    $('#schedule-header').text(moment(currentTime).format('dddd, MMMM Do YYYY, h:mm a')); 
} // end updateClock

// THEORETICALLY - location.reload(true) will successfully refresh the entire page like the browser does.
// the (true) parameter forces a reload from the server, where as if left blank or enter false, the page reloads from cache.
// it is not a great idea to refresh this way though, because you are reloading the entire page each time.





// ================================ END FUNCTION DEFINITIONS ================================================================
//
// HTML page loads FIRST, then this code runs 
//
$(document).ready(function() {
    
    // get current time  
    var currentTime = moment();
    
    // display it in desired format
    $('#schedule-header').text(moment(currentTime).format('dddd, MMMM Do YYYY, h:mm a')); 
    
    // update current time every minute
    setInterval(updateClock, 60000); 
    
    // update table every minute so that times change as current time changes
    setInterval(refreshTable, 60000);
    
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
    
    ///////////////////////////////////////
    // ideas for train time validation 
    // First Train Time required in 4-digit military time - cannot be blank
    // regular expression for 24 hour time is:
    // ([01]?[0-9]|2[0-3]):[0-5][0-9]
    // could use this but also could use Moment.js library for validation
    ///////////////////////////////////////
    // additional way to validate train time
    //var time = moment($("#first-train-time-input").val().trim(), "HH:mm").format("X");
    //if (time === "Invalid date") {
    //console.error("Please enter in military time HH:mm");
    //return;
    // } //////////////////////////////////
    // other validation idea
    //var is_ftt=moment($('#first-train-time-input', 'HH:mm', true)).isValid();
    ///////////////////////////////////////
        
    // First Train Time required in 4-digit military time - cannot be blank
    $('#first-train-time-input').on('input', function() {
        var input=$(this);
        var is_fft=input.val();
        if (/[0-9]/.test(is_fft)) {
            input.removeClass('invalid').addClass('valid');}
            else {input.removeClass('valid').addClass('invalid');}
        });
        
        // Frequency in minutes required - must be a number - cannot be blank
        $('#frequency-minutes-input').keyup('input', function() {
            var input=$(this);
            var is_freq=input.val();
            if (/[0-9]/.test(is_freq)) {
                input.removeClass('invalid').addClass('valid');}
                else {input.removeClass('valid').addClass('invalid');}
            });
            
            // -------------------------
            // ADD NEW TRAIN to database
            // -------------------------
            
            $("#submit-new-train").on("click", function(event) {
                event.preventDefault(); 
                
                // USER-INPUT VALIDATION AFTER Submit Button
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
                
                // get user input values for new train
                var usrTrainName = $("#train-name-input").val().trim();
                var usrDestination = $("#destination-input").val().trim();
                var tusrFirstTrainTime = $("#first-train-time-input").val().trim(); // don't parse into a number or it will kill leading zeros and cause NaN error
                var tusrFrequencyMinutes = parseInt($("#frequency-minutes-input").val().trim()); // get user-input string then convert to number
                
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
                
                
                // clear user-input data (this was happening automatically - not sure why?)
                $("#train-name-input").val('');
                $("#destination-input").val('');
                $("#first-train-time-input").val(''); 
                $("#frequency-minutes-input").val('');
                
            }); // END ADD newTrain

            //////////////////////////////////////////////////////////////
            // ONCE USER ADDS A NEW TRAIN 
            // 1. from the user-input data, calculate nxtArrivalTime and tminutesAway
            // 2. set firebase to automatically notice a new train was added to the DB 
            // 3. once noticed, update HTML/display with the new train info AND calculated fields 
                       
            function updateRow(childSnapshot) {
                
                console.log(childSnapshot.val()); // see what data looks like at this time
                                
                // set client-side variables eq to database values (the key's value)
                var usrTrainName = childSnapshot.val().trainName;
                var usrDestination = childSnapshot.val().destination;
                var usrFirstTrainTime = childSnapshot.val().firstTrainTime; // may have a # to string issue here (parseInt)
                var usrFrequencyMinutes = childSnapshot.val().frequency; // may have # to string issue here
                
                // New Train 
                console.log("User Train Name: " + usrTrainName);
                console.log("User Destination: " + usrDestination);
                console.log("User First Train Time: " + usrFirstTrainTime);
                console.log("User Frequency in min: " + usrFrequencyMinutes);
                
                // use Moment.js to calc nxtArrivalTime AND minutesAway (time/date math)
                
                // set frequency in minutes from user-input/database
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
                
                // update minutesAway
                var minutesAway = tMinutesTillTrain; 
                
                 // because there will be multiple rows, you cannot just update a single row in existing HTML
                // you must build each new row as info is added, then append new row to existing rows
                // then you can update the html page/display
                
                var newRow = $('<tr>').append(
                    $('<td>').text(usrTrainName).attr('class', 'train-name-display'),
                    $('<td>').text(usrDestination).attr('class', 'destination-display'),
                    $('<td>').text(usrFrequencyMinutes).attr('class', 'frequency-display'),
                    $('<td>').text(nxtArrivalTime).attr('class', 'next-arrival-display')
                    // $('<td>').text(minutesAway).attr('class', 'minutes-away-display')    
                    
                    );
                    // added extra -  if train is 15 minutes or less away change the background in table to pink
                    if (minutesAway < 16) {
                        newRow = newRow.append($('<td>').text(minutesAway).attr('class', 'minutes-away-soon'));
                    } else {
                        newRow = newRow.append($('<td>').text(minutesAway).attr('class', 'minutes-away-display'));     
                    }       
                    
                    // append the new row to the train schedule
                    $('#train-table > tbody').append(newRow);
                    
                    
                    console.log("Minutes Away: " + minutesAway);
                    
                    // log any errors to console so can trouble shoot
                }    
                
                database.ref().on("child_added", updateRow);
                
                function refreshTable() {
                    $('#train-table > tbody').empty(); // clears entire table    
                                        
                    // database.ref().on("child_added", function(childSnapshot) DID NOT WORK HERE
                    // it caused duplicate rows to be rendered on the screen
                    database.ref().once("value", function(data) {
                        data.forEach(updateRow)},
                                                
                        function(errorObject) {
                            console.log("The READ failed: " + errorObject.code);
                                                        
                    }); // END do once on value change
                                                
                } // end function to refresh table   
                     
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
    
                