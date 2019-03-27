var sourceRef = db.ref("source");
sourceRef.x = "1";
sourceRef.y = "2";
const destinationCopied = {
    x: sourceRef.x,
    y: sourceRef.y
};
destinationRef.push(destinationCopied);