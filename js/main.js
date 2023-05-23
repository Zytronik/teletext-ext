const linkTextBanList = ["sign", "login"];

scrapeContent();
setupPixelit();

var pageContents = {};

function scrapeContent(){
    return pageContents = {
        "header" : getHeaderContents()
    };
}

function getHeaderContents(){
    /* let r = {
        "links" : 
    }; */
    let headerLinks = document.querySelectorAll("header nav:first-of-type a, header nav.main a");
    headerLinks.forEach((link)=>{
        if(link.hasAttribute("href") && link.offsetWidth > 5 && !link.hasAttribute("hreflang") && !linkTextBanList.some(v => link.innerHTML.toLowerCase().includes(v))){
            
        }
    });
        
}

function setupPixelit(){
    console.log('pixelit');
    let canvas = document.createElement("CANVAS");
    canvas.getContext("2d");
    canvas.style.height = "200px";
    canvas.style.width = "200px";
    canvas.style.position = "fixed";
    canvas.setAttribute("id", "pixelitCanvas");
    document.body.appendChild(canvas);
   


    let imgUrl = "https://www.hslu.ch/-/media/campus/common/images/teasers/h/startseite/2212-teaser-homepage-wb.jpg?la=de-ch&centercrop=0&h=168&w=386&usecustomfunctions=1";
    let img = document.createElement("IMG");
    img.setAttribute("src", imgUrl);
    img.setAttribute("id", "pixelitImage");
    document.body.appendChild(img);
    
    pixelitTest();
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
    console.log(px);
    px.setDrawTo(pixelitCanvas);
    px.draw().pixelate().convertPalette();

    //var newImage = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}