console.log("script loaded---");

let urlBanList = [
    "google.com",
    "netflix.com"
];

function isValidSite(){
    let load = true;
    urlBanList.forEach((site)=>{
        if (window.location.href.indexOf(site) > -1) {
            load = false;
        }
    });
    return load;
}

var pageContents = {};

if (isValidSite()) {
    pageContents = scrapeContent();
    console.log(pageContents);
    //setupPixelit();
    loadHTMLFile('teletext.html');
}

function loadHTMLFile(url){
    url = browser.runtime.getURL(url);
    fetch(url)
    .then(function(response) {
        return response.text()
    })
    .then(function(html) {
        var parser = new DOMParser();
        var teletextDocument = parser.parseFromString(html, "text/html");
        deleteDOM();
        setupHTML(teletextDocument);
        loadData();
    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
    });
}

function loadData(){
    loadNavData();
    loadFavIMG();
    loadSiteTitle();
    setInterval(setCurrentDate, 1000);
    loadContent();
}

function loadContent(){
    pageContents.main.contents.forEach((ele) =>{
        if(ele.linkUrl != undefined){
            if(ele.content.img.length > 0 && ele.content.p.length > 0){
                //link mit bild und text drin
            }else if(ele.content.img.length > 0 && ele.content.p.length <= 0){
                //link mit nur bild
                createLinkIMGBlock(ele.linkUrl, ele.content.img);
            }else if(ele.content.img.length <= 0 && ele.content.p.length > 0){
                //link mit nur text
            }
        }else if(ele.title != undefined){
            if(ele.title.nextIMGSiblings.length > 0 && ele.title.nextPSiblings.length > 0){
                //title + bild + text
            }else if(ele.title.nextIMGSiblings.length <= 0 && ele.title.nextPSiblings.length > 0){
                //title + text
            }
        }   
    });
}

function createLinkIMGBlock(url, imgURLs){
    
}

function getTime() {
    var d = new Date();
    var m = d.getMinutes();
    var h = d.getHours();
    return ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);
}

function loadSiteTitle(){
    document.querySelector("h1").innerHTML = pageContents.header.siteTitle;
}

function loadFavIMG(){
    document.querySelector(".logo-container img").src = pageContents.header.favicon;
}

function loadNavData(){
    let navList = document.querySelector("#nav-section nav ul");
    if(pageContents.header.navLinks.length > 0){
        pageContents.header.navLinks.forEach((ele, i)=>{
            navList.innerHTML += '<li><a href="'+ele.url+'"><span>'+((i+1) * 100)+'</span><span>'+ele.content.data+'</span></a></li>'
        });
    }else{
        document.querySelector("#nav-section").style.display = "none";
    }
}

function setCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    document.querySelector("#datetime").innerHTML = dd + '.' + mm + '.' + yyyy + " " + getTime();
}

function getFavicon(){
    var favicon = undefined;
    var nodeList = document.getElementsByTagName("link");
    for (var i = 0; i < nodeList.length; i++)
    {
        if((nodeList[i].getAttribute("rel") == "icon")||(nodeList[i].getAttribute("rel") == "shortcut icon") || (nodeList[i].getAttribute("rel") == "image_src"))
        {
            favicon = nodeList[i].getAttribute("href");
        }
    }
    if(favicon === undefined){

    }
    return favicon;        
}

function setupHTML(teletextDocument) {
    document.querySelector("html").append(teletextDocument.head);
    document.querySelector("html").append(teletextDocument.body);
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = browser.runtime.getURL('css/teletext.css');
    document.querySelector("head").appendChild(link);
}


function scrapeContent(){
    return  {
        "header" : getHeaderContents(),
        "main" : getBodyContents(),
    };
}

function deleteDOM(){
    let eles = document.querySelectorAll("html > *, html iframe, html script, html link");
    eles.forEach((ele)=>{
        ele.remove();
    }); 
    document.querySelector("html").removeAttribute("class");
    /* document.querySelector("body").remove(); */
}

function getBodyContents(){
    let r = {
        "contents" : getContents("body", "header", "footer"),
        //"imgs" : getImgs("body", "header"), //all imgs (not inside Links or inside Header or inside Footer)
    };
    //console.log("Body: ", r);
    return r;
}

function getSiteTitle(){
    let h1 = "";
    if (document.querySelector("h1").children[0] != undefined) {
        let ele = document.querySelector("h1").children[0];
        while(ele.children[0] != undefined){
            ele = ele.children[0];
        }
        h1 = ele.innerHTML;
    }else{
        h1 = document.querySelector("h1").innerHTML;
    }
    if(h1 != undefined && h1 !== "" && h1.length){
        return h1;
    }
    return document.title;
}

function getHeaderContents(){
    const linkTextBanList = ["sign", "login", "log in"];
    let rNavLinks = [];
    let r = {
        "siteTitle" : getSiteTitle(),
        "favicon" : getFavicon(),
        "contents" : getContents("header"),
        "navLinks" : rNavLinks, //navigation Links
        //"imgs" : getImgs("header"), //all imgs (not inside Links)
    };
    let headerLinks = document.querySelectorAll("header nav:first-of-type a, header nav.main a");
    headerLinks.forEach((link)=>{
        if(link.hasAttribute("href") &&
        link.offsetWidth > 5 &&
        !link.hasAttribute("hreflang") &&
        !linkTextBanList.some(v => link.innerHTML.toLowerCase().includes(v)) &&
        link.children.length == 0 
        /* || (link.children.length > 0 && link.children[0].tagName === "IMG") */
        && (link.tagName === "P" || link.tagName === "A" || link.tagName === "SPAN")){
            let type = "text";
            let content = link.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
            if(link.children.length > 0 && link.children[0].tagName === "IMG"){
                type = "img";
                content = link.children[0].src;
            }
            rNavLinks.push({
                "url" : link.href,
                "content" : {
                    "type" : type,
                    "data" : content,
                }
            })
        }
    });
    //console.log("Header: ", r);
    return r;
}

function getLink(link, notInSelector = " ", notInSelector2 = " "){
    let r = {};
    if($(link).parents(notInSelector).length <= 0 && 
        $(link).parents(notInSelector2).length <= 0 && 
        $(link).parents("nav").length <= 0 && 
        !$(link).is(":hidden") && 
        link.style.visibility != "hidden"){
            let imgsArray = [];
            if(link.querySelectorAll("img") != null && link.querySelectorAll("img").length > 0){
                let imgs = link.querySelectorAll("img");
                imgs.forEach((img) => {
                    imgsArray.push(img);
                })
            }
            let psArray = [];
            if(link.querySelectorAll("p") != null && link.querySelectorAll("p").length > 0){
                let ps = link.querySelectorAll("p");
                ps.forEach((p) => {
                    psArray.push(p);
                })
            }
            r = {
                "linkUrl" : link.href,
                "content" : {
                    "img" : imgsArray,
                    "p" : psArray
                }
            };
        }
    return r;
}

function getTitleAndSiblings(title, notInSelector = " ", notInSelector2 = " "){
    let r = {};

    if ($(title).parents('a').length <= 0 && $(title).parents(notInSelector).length <= 0 && $(title).parents(notInSelector2).length <= 0 && title.offsetWidth > 5) {
        let rPEles = [];
        let rIMGEles = [];
        let nextSiblings = getNextSiblings(title);
        nextSiblings.forEach((sibling)=>{
            if(sibling.tagName === "P"){
                rPEles.push(sibling.innerHTML.replace(/<\/?[^>]+(>|$)/g, ""));
            }else if(sibling.tagName === "IMG"){
                rIMGEles.push(sibling);
            }else{
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.querySelector("h1, h2, h3, h4") != null && sibling.querySelector("h1, h2, h3, h4").length <= 0) {
                    let pElems = sibling.querySelectorAll("p");
                    pElems.forEach((pEle)=>{
                        rPEles.push(pEle.innerHTML.replace(/<\/?[^>]+(>|$)/g, ""));
                    });
                    let imgElems = sibling.querySelectorAll("img");
                    imgElems.forEach((imgEle)=>{
                        if(imgEle.offsetWidth > 5){
                            rIMGEles.push(imgEle.innerHTML.replace(/<\/?[^>]+(>|$)/g, ""));
                        }
                    });
                }
            }
        });
        r = {
            "title" : title.innerHTML.replace(/<\/?[^>]+(>|$)/g, ""),
            "type" : title.tagName,
            "nextPSiblings" : rPEles,
            "nextIMGSiblings" : rIMGEles,
        };
    }
    return r;
}

function getContents(selector, notInSelector = " ", notInSelector2 = " "){
    let rContents = [];

    let contents = document.querySelectorAll(selector+" h1, "+selector+" h2, "+selector+" h3, "+selector+" h4, " + selector + " a");
    contents.forEach((elem)=>{
        if(elem.tagName === "A"){
            let link = getLink(elem, notInSelector, notInSelector2);
            if(!isEmpty(link)){
                rContents.push(link);
            }
        }else if(elem.tagName.includes("H")){
            let title = getTitleAndSiblings(elem, notInSelector, notInSelector2);
            if(!isEmpty(title)){
                rContents.push(title);
            }
        }
    });
    return rContents;
}

function getImgs(selector){
    let rImgs = [];
    let headerImgs = document.querySelectorAll(selector + " img");
    headerImgs.forEach((img)=>{
        if ($(img).parents('a').length <= 0 && img.offsetWidth > 5) {
            rImgs.push(img.src);
        }
    });
    return rImgs;
}

function getNextSiblings(elem, filter) {
    var sibs = [];
    while (elem = elem.nextSibling) {
        if (elem.nodeType === 3) continue; // text node
        if (!filter || filter(elem)) sibs.push(elem);
    }
    return sibs;
}

function isEmpty(obj) {
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }

    return true
}

function setupPixelit(){
    console.log('pixelit');
    let canvas = document.createElement("CANVAS");
    canvas.getContext("2d");
    canvas.style.height = "200px";
    canvas.style.width = "200px";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.position = "fixed";
    canvas.setAttribute("id", "pixelitCanvas");
    document.body.appendChild(canvas);
   


    let imgUrl = "https://www.hslu.ch/-/media/campus/common/images/teasers/h/startseite/2212-teaser-homepage-wb.jpg?la=de-ch&centercrop=0&h=168&w=386&usecustomfunctions=1";
    let img = document.createElement("IMG");
    img.setAttribute("src", imgUrl);
    img.setAttribute("id", "pixelitImage");
    document.body.appendChild(img);
    
    img.onload = function () {
        pixelitTest();		
    };
}

function pixelitTest(){
    console.log('pixelitTest');
    let pixelitCanvas = document.getElementById("pixelitCanvas");
    let pixelitImage = document.getElementById("pixelitImage");

    const pixelitConfig = {
        to : pixelitCanvas,
        //defaults to document.getElementById("pixelitcanvas")
        from : pixelitImage, 
        //defaults to document.getElementById("pixelitimg")
        scale : 20,
        
        palette : [[26,28,44], [93,39,93], [177, 62, 83],[239, 125, 87]], 
        
        
        maxHeight: pixelitCanvas.height, 
        //defaults to null
        maxWidth: pixelitCanvas.width, 
        //defaults to null
      }

    const px = new pixelit(pixelitConfig);
    //console.log(px);
    px.draw().pixelate().convertPalette();

    //var newImage = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}