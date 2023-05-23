scrapeContent();

var pageContents = {};

function scrapeContent(){
    console.log("test");
    return pageContents = {
        "header" : getHeaderContents()
    };
}

function getHeaderContents(){
    let headerLinks = document.querySelectorAll("header a");
    headerLinks.forEach((link)=>{
        console.log(link);
    });
}