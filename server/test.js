var openTimeStamp =  new Date();
var closedTimeStamp =  new Date();
var batteryTimeStamp =  new Date();
var threshold = 5;
console.log(openTimeStamp);
while(true){
    let countTimestamp = new Date();
    let doorOpentime = (countTimestamp - openTimeStamp);
    //console.log(doorOpentime)
    var diffMins = Math.round((doorOpentime % 86400000) % 36000000 / 60000);
    //console.log(diffMins)
    if(diffMins > threshold){
        console.log("ITS 1 MINUTE !");
        console.log(countTimestamp);
        openTimeStamp =  new Date();
    }
}
