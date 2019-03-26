const _ = require("lodash");
console.log("test sending duplicates..");
var arr = [
    {
        status: "closed",
        sentDate: "2019-03-08T08:00:59"
    },
    {
        status: "closed",
        sentDate: "2019-03-08T08:00:54"
    },
    {
        status: "closed",
        sentDate: "2019-03-08T08:10:59"
    },
    {
        status: "closed",
        sentDate: "2019-03-08T08:10:51"
    },
    {
        status: "closed",
        sentDate: "2019-03-08T08:20:59"
    }
]

 var todaysDate = new Date();
 todaysDate.setUTCDate(8);
 console.log(todaysDate);
 var min = todaysDate.getMinutes();
 var max = min +2;
 console.log(min)
 console.log(max);

 newArr = _.uniqBy(arr, 'sentDate');
 console.log(newArr);

 const uniqueArr = _.uniqWith(
    arr,
    (devA, devB) => 
        new Date(devA.sentDate).getMinutes() !== new Date(devB.sentDate).getMinutes() 
  );
console.log("new uniqe--->")
console.log(uniqueArr);

const uniqueArr2 = _.uniqWith(
    arr,
    (devA, devB) => 
        new Date(devA.sentDate).getMinutes() === new Date(devB.sentDate).getMinutes() 
  );
console.log("new uniqe--->")
console.log(uniqueArr2);

console.log("Intersection")
var result = _.intersection(uniqueArr, uniqueArr2);
console.log(result);