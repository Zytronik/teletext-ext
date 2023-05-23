const linkTextBanList = ["sign", "login"];

scrapeContent();

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

const colorpPalette = [
    [26,28,44],
    [93,39,93],
    [177, 62, 83],
    [239, 125, 87]
];

function pixelitTest(){
    let imgUrl = "https://www.hslu.ch/-/media/campus/common/images/teasers/h/startseite/2212-teaser-homepage-wb.jpg?la=de-ch&centercrop=0&h=168&w=386&usecustomfunctions=1";

    const px = new pixelit({"palette": colorPalette});
    px.draw().pixelate().setFromImgSource(imgUrl).convertPalette();
}