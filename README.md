# nexTrain
Deployed Link: [nexTrain](https://vwhope.github.io/nexTrain/)

### a train timetable using Firebase and Moment.js

**Problems to Solve**
* update train table based on current time
* add user-entered trains to train table in real time
* perform date/time math to calculate time fields, format time for display
* update calculated time fields based on current time without page refresh

**Solution** 

Use Firebase database to store user-input, but not calcuated time fields. Use timing events to update time fields every minute. Use moment.js functions to re-calculate time fields (next arrival time, minutes away) based on current time
as well as format the date/time for display.
 

**Technical Skills demonstrated in project:**
* use of JavaScript library (Moment.js)
  * time/date math
  * maintaini values based on current/changing time
  * apply time/date formats  
* persistent data storage using Firebase
    * database considerations: what to store/what not to store
    * link to database
    * read/write data 
* mobile responsive design
    
**Goals of program:**
* display a list of trains in a table, with data related to each train 
  * (train name, destination, frequency, next arrival and minutes away)
* store selected data related to each train in Firebase database for persistence
* allow user to enter new trains that display in real time in the displayed train list
* calculate Next Arrival and Minutes Away time, update display based on current time

**To run program:**
* open the index.html file in the browser
* any previously entered train data will be displayed via Firebase database
* to add new train, enter data into form, click submit
  * Train Name
  * Destination
  * First Train Time in military time
  * Frequency in minutes
* as time passes, the current date/time should be reflected every minute
* as time passes, the Next Arrival and Minutes Away columns should update dynamically based on current time

**Resource Contributors:**
* Custom font "Marcellus SC" from [Google fonts](https://fonts.google.com/)
* Images used were from: [unsplash](https://unsplash.com/)

* The following photographers contributed photos:

Photographer Name | Photo used  
----------------- | ----------
Brandon Mowinkel | main photo - commuter train, blurred background 
JESHOOTS | train station, blurred train

**Future Enhancement Ideas:**
* Add weather forecast for this station for current day
* Add information about the train/station/area
* Add traffic bulletins for local area
* Add local map - you are here graphic