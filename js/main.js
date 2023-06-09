console.log("script loaded---");

let urlBanList = [
    "google.com",
    "netflix.com",
    "web.whatsapp",
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
    initiateNav();
    focusNavInput();
    disableScrollWheel();
    pixelIt();
}

function loadContent(){
    let container = document.querySelector("#content-section");
    pageContents.main.contents.forEach((ele) =>{
        if(ele.linkUrl != undefined){
            if(ele.content.img.length > 0 && ele.content.p.length > 0){
                //link mit bild und text drin
                //console.log("link mit bild und text drin");
                container.innerHTML += createLinkIMGTextBlock(ele.linkUrl, ele.content.img, ele.content.p, "link img-text");
            }else if(ele.content.img.length > 0 && ele.content.p.length <= 0){
                //link mit nur bild
                //console.log("link mit nur bild");
                container.innerHTML += createLinkIMGTextBlock(ele.linkUrl, ele.content.img, [],  "link img-only");
            }else if(ele.content.img.length <= 0 && ele.content.p.length > 0){
                //link mit nur text
                //console.log("link mit nur text");
                container.innerHTML += createLinkIMGTextBlock(ele.linkUrl, [], ele.content.p, "link text-only");
            }
        }else if(ele.title != undefined){
            if(ele.nextIMGSiblings.length > 0 && ele.nextPSiblings.length > 0){
                //title + bild + text
                //console.log("title + bild + text");
                container.innerHTML += createTitelBildText(ele, ele.nextIMGSiblings, ele.nextPSiblings, "title-img-text");
            }else if(ele.nextIMGSiblings.length <= 0 && ele.nextPSiblings.length > 0){
                //title + text
                //console.log("title mit nur text");
                container.innerHTML += createTitelBildText(ele, [], ele.nextPSiblings, "title-text");
            }else if(ele.nextIMGSiblings.length > 0 && ele.nextPSiblings.length <= 0){
                //title + bild
                //console.log("title mit nur bild");
                container.innerHTML += createTitelBildText(ele, ele.nextIMGSiblings, [],  "title-img");
            }else if(ele.nextIMGSiblings.length <= 0 && ele.nextPSiblings.length <= 0){
                //nur titel
                //console.log("nur titel");
                container.innerHTML += createTitelBildText(ele, [], [], "title-only");
            }
        }else if(ele.text != undefined){
            //nur text
            //console.log("nur text");
            container.innerHTML += createTitelBildText(ele, [], [], "text-only");
        }
    });
}

function createTitelBildText(ele, imgs = [], texts = [], className){
    let r = '<article class="'+className+'">';
    if(ele.title != undefined){
        r += '<'+ele.type+'>'+ele.title+'</'+ele.type+'>';
    }
    if(ele.text != undefined){
        r += '<p>'+ele.text+'</p>';
    }
    if(imgs.length > 0){
        if(imgs.length > 1){
            r +=  '<div class="img-wrapper multiple">';
        }else{
            r +=  '<div class="img-wrapper">';
        }
        imgs.forEach((img)=>{
            r += '<img src="'+img+'" >';
        });
        r +=  '</div>';
    }
    if(texts.length > 0){
        texts.forEach((text)=>{
            r += '<p>'+text+'</p>';
        });
    }
    r +=  '</article>';
    return r;
}

function createLinkIMGTextBlock(url, imgs, texts = [], className){
    let r = '<article class="'+className+'">'+
    '<a href="'+url+'">';
    if(imgs.length > 0){
        if(imgs.length > 1){
            r +=  '<div class="img-wrapper multiple">';
        }else{
            r +=  '<div class="img-wrapper">';
        }
        imgs.forEach((img)=>{
            r += '<img src="'+img+'" >';
        });
        r +=  '</div>';
    }
    if(texts.length > 0){
        texts.forEach((text)=>{
            r += '<p>'+text+'</p>';
        });
    }
    r +=  '</a>'+
    '</article>';
    return r;
}

function getTime() {
    var d = new Date();
    var m = d.getMinutes();
    var h = d.getHours();
    return ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);
}

function loadSiteTitle(){

    //website title
    let title = window.location.href;
    title = title.split('/');
    //console.log(title);
    document.querySelector("h1").innerHTML = title[2];

    //site title
    document.querySelector("#site-title").innerHTML = pageContents.header.siteTitle;
}

function loadFavIMG(){
    document.querySelector(".logo-container img").src = pageContents.header.favicon;
}

function loadNavData(){
    let navList = document.querySelector("#nav-section nav ul");
    if(pageContents.header.navLinks.length > 0){
        let counter = 0;
        pageContents.header.navLinks.forEach((ele, i) => {
            if (!hasLongWord(removeSpecialChars(ele.content.data)) && counter < 13) {
                navList.innerHTML += '<li><a href="' + ele.url + '"><span class="number">' + ((counter + 1) * 100) + '</span><span>' + removeSpecialChars(ele.content.data) + '</span></a></li>'
                counter++;
            }
        });
    }else{
        document.querySelector("#nav-section").style.display = "none";
    }
}

function removeSpecialChars(str){
    return str.replace('\n','').replace('\t','');
}

function hasLongWord(str){
    if(str.indexOf(' ') >= 0){
        let words = str.split(" ");
        let longest = "";
        for (let i = 0; i < words.length; i++) {
            if (words[i].length > longest.length) {
                longest = words[i];
            }
        }
        return longest.length > 15
    }
    return str.length > 15
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
        "contents" : getContents("body"),
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
    const linkTextBanList = ["sign", "login", "log in", "en", "de"];
    let rNavLinks = [];
    let r = {
        "siteTitle" : getSiteTitle(),
        "favicon" : getFavicon(),
        "contents" : getContents("header"),
        "navLinks" : rNavLinks, //navigation Links
        //"imgs" : getImgs("header"), //all imgs (not inside Links)
    };
    let headerLinks = "";
    for (let index = 0; index < 2; index++) {
        if(headerLinks.length <= 0){
            if(index === 0){
                headerLinks = document.querySelectorAll("header nav:first-of-type a, header nav.main a");
            }else{
                headerLinks = document.querySelectorAll("nav a");
            }
            headerLinks.forEach((link)=>{
                if(link.offsetWidth > 5 &&
                /* !link.hasAttribute("hreflang") && */
                !linkTextBanList.some(v => link.innerHTML.toLowerCase().includes(v)) &&
                link.innerHTML.length > 0 
                /* || (link.children.length > 0 && link.children[0].tagName === "IMG") */
                && (link.tagName === "P" || link.tagName === "A" || link.tagName === "SPAN")){
                    if (link.hasAttribute("href")) {
                        //if(link.attr("href") == "javascript:;"){
                            //console.log(link.innerHTML);
                        //}else{
                            let type = "text";
                            let content = link.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
                            if (link.children.length > 0 && link.children[0].tagName === "IMG") {
                                type = "img";
                                content = link.children[0].src;
                            }
                            rNavLinks.push({
                                "url": link.href,
                                "content": {
                                    "type": type,
                                    "data": content,
                                }
                            })
                        //}
                    }else{
                        link.parentNode.querySelectorAll("a + * ul li a").forEach((subLink)=>{
                            if(subLink.innerHTML.length > 0 && subLink.innerHTML != "<empty string>"){
                                let type = "text";
                                let content = subLink.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
                                if (subLink.children.length > 0 && subLink.children[0].tagName === "IMG") {
                                    type = "img";
                                    content = subLink.children[0].src;
                                }
                                rNavLinks.push({
                                    "url": subLink.href,
                                    "content": {
                                        "type": type,
                                        "data": content,
                                    }
                                })
                            }
                        });
                    }
                }
            });
        }
    }
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
                    imgsArray.push(img.src);
                })
            }
            let psArray = [];
            if(link.querySelectorAll("p") != null && link.querySelectorAll("p").length > 0){
                let ps = link.querySelectorAll("p");
                ps.forEach((p) => {
                    psArray.push(p.innerHTML);
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
                if(sibling.innerHTML.length > 3){
                    if(sibling.querySelectorAll("img") != undefined && sibling.querySelectorAll("img").length > 0){
                        let imgElems = sibling.querySelectorAll("img");
                        imgElems.forEach((imgEle) => {
                            if (imgEle.offsetWidth > 5) {
                                rIMGEles.push(imgEle.src);
                            }
                        });
                    }else{
                        rPEles.push(sibling.innerHTML/* .replace(/<\/?[^>]+(>|$)/g, "") */);
                    }  
                }
            }else if(sibling.tagName === "IMG"){
                rIMGEles.push(sibling.src);
            }else{
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.querySelector("h1, h2, h3, h4") != null && sibling.querySelector("h1, h2, h3, h4").length <= 0) {
                    let pElems = sibling.querySelectorAll("p");
                    pElems.forEach((pEle)=>{
                        if(pEle.innerHTML.length > 3){
                            if(pEle.querySelectorAll("img").length > 0){
                                let imgElems = sibling.querySelectorAll("img");
                                imgElems.forEach((imgEle) => {
                                    if (imgEle.offsetWidth > 5) {
                                        rIMGEles.push(imgEle.src);
                                    }
                                });
                            }else{
                                rPEles.push(sibling.innerHTML/* .replace(/<\/?[^>]+(>|$)/g, "") */);
                            }
                            rPEles.push(pEle.innerHTML.replace(/<\/?[^>]+(>|$)/g, "") );
                        }
                    });
                    let imgElems = sibling.querySelectorAll("img");
                    imgElems.forEach((imgEle)=>{
                        if(imgEle.offsetWidth > 5){
                            rIMGEles.push(imgEle.src);
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

    let contents = document.querySelectorAll(selector+" h2, "+selector+" h3, "+selector+" h4, " + selector + " a, " + selector + " p");
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
        }if(elem.tagName === "P"){
            let p = elem.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
            if(p.length > 5){
                rContents.push({"text" : p})
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

function pixelIt(){
    document.querySelectorAll("img").forEach((img)=>{
        let canvas = document.createElement("CANVAS");
        canvas.getContext("2d");
        img.onload = function () {
            canvas.style.height = img.offsetHeight;
            canvas.style.width = img.offsetWidth;
            img.parentNode.insertBefore(canvas, img.nextSibling);

            if (img.getAttribute('src').indexOf('favicon') != -1){
                var pixelitConfig = {
                    to : canvas,
                    from : img,
                    scale : 20,
                    palette : [[0,0,0], [255,0,0], [255, 255, 255]], 
                    maxHeight: img.offsetHeight,
                    maxWidth: img.offsetWidth,
                }
            }else{
                var pixelitConfig = {
                    to : canvas,
                    from : img,
                    scale : 20,
                    palette : [[0,0,0], [255,0,0], [0, 255, 0],[0, 0, 255]], 
                    maxHeight: img.offsetHeight,
                    maxWidth: img.offsetWidth,
                }
            }

            
            try {
                const px = new pixelit(pixelitConfig);
                px.draw().pixelate().convertPalette();
            }
            catch (err) {

            } 
            
            //img.src = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            //showElement(img);
            // hideElement(canvas);
        }
    });/* 
    document.querySelector("#loading").style.display = "none"; */
    //console.log("full loaded");
}

function hideElement(ele){
    ele.style.visibility = "hidden";
    ele.style.position ="fixed";
    ele.style.zIndex = "-100";
}

function showElement(ele){
    ele.style.visibility = "visible";
    ele.style.position ="static";
    ele.style.zIndex = "1";
    ele.style.top = "unset";
    ele.style.left = "unset";
}

function focusNavInput(){
    document.addEventListener("keydown", function (e) {
        let numberInput = document.querySelector('#nav-input');        
        if(numberInput != document.activeElement){
            if (isNaN(e.key) === false) {
                numberInput.focus();
            } 
        }else{
            if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
                numberInput.blur();
            } 
        };

    });
}

function initiateNav() {
    let numbers = document.querySelectorAll(".number");
    var navArray = [];
    navArray.digits = [];
    navArray.link = [];
    //console.log(navArray);
    numbers.forEach((number) => {
        navArray.digits.push(number.innerHTML);
        navArray.link.push($(number).parent().attr('href'));
    });

    let numberInput = document.querySelector('#nav-input');

    numberInput.addEventListener("keydown", function (e) {
        if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
            let number = numberInput.value;
            numberInput.value= "";
            numberNav(number, navArray);
        } 
        
    });
}

function numberNav(number, navArray) {

        if(number == 1){
            window.location.href = window.location.origin
        }else if(number <= 4 && number >= 2){
            navOverlays(number);
        }else{
            let navIndex = navArray.digits.indexOf(number);
            window.location.href = navArray.link[navIndex];
        }   
}

function navOverlays(number){
    if(number <= 3){
        closeOverlays();
        let targetOverlay = document.getElementsByClassName(number)[0];
        targetOverlay.style.display = "block";
    }else{
        let o2 = document.querySelector("#nav-section");
        let o3 = document.querySelector("#websites-section");
        if(o2.style.display === "block"){
            o2.style.display = "none";
        }else if(o3.style.display === "block"){
            o3.style.display = "none";
        }else{
            history.back();
        }
        closeOverlays();
    }
    
}

function closeOverlays(){
    let overlays = document.querySelectorAll('.overlay');
    overlays.forEach((overlay)=>{
        overlay.style.display = "none";
    });
}

function disableScrollWheel(){
    window.addEventListener("wheel", function (e) {
        e.preventDefault();
      }, { passive: false });
}
