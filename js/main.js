var pageContents = scrapeContent();
console.log(pageContents);
setupPixelit();

function scrapeContent(){
    return  {
        "header" : getHeaderContents(),
        "main" : getBodyContents(),
    };
}

function getBodyContents(){
    let r = {
        "contents" : getContents("body", "header", "footer"),
        //"imgs" : getImgs("body", "header"), //all imgs (not inside Links or inside Header or inside Footer)
    };
    //console.log("Body: ", r);
    return r;
}

function getHeaderContents(){
    const linkTextBanList = ["sign", "login"];
    let rNavLinks = [];
    let r = {
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
        link.children.length == 0 || (link.children.length > 0 && link.children[0].tagName === "IMG")){
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

function getLink(link, selector, notInSelector = " ", notInSelector2 = " "){
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

function getTitleAndSiblings(title, selector, notInSelector = " ", notInSelector2 = " "){
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
                if (sibling.querySelector("h1, h2, h3, h4") != null && sibling.querySelector("h1, h2, h3, h4").length <= 0) {
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
            let link = getLink(elem, selector, notInSelector, notInSelector2);
            if(!isEmpty(link)){
                rContents.push(link);
            }
        }else if(elem.tagName.includes("H")){
            let title = getTitleAndSiblings(elem, selector, notInSelector, notInSelector2);
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