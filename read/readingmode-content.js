var loc = document.location;
var uri = {
    spec: loc.href,
    host: loc.host,
    prePath: loc.protocol + "//" + loc.host,
    scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
    pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
};
var article = new Readability(uri, document).parse();

console.log(article)

window.title = document.querySelector('title').textContent;

document.querySelector('head').innerHTML =  '';



var cite = '<div id="cite">' + article.byline + " " + article.title + " " + location.href + '</div>'
var aside =    '<input id="slider" type=range value=25 min=0 max=80 step=1 /><div id="keywords"></div>'; // '<aside><button id="speak"></button></aside>';
document.body.innerHTML = cite + aside + '<article contenteditable>' +
    article.content.replace(/<img[^>]+>/gi, '') + '</article>'





if(0)  //CANCEL
chrome.runtime.sendMessage({
    action: 'textapi',
    data: { url: location.href }
}, function(res) {


    console.log(res)


    res = JSON.parse(res)

    //key sentences
    /*

    var keySentences = res.results[1].result.sentences;


    for (var s in keySentences) {

        document.body.innerHTML = document.body.innerHTML
            .replace(keySentences[s], "<u>" + keySentences[s] + "</u>")


    }
    */


    var conceptList = "<div id='define'></div>";

    var conceptsJSON = res.concepts;


    for (var i in conceptsJSON) {
        var term = conceptsJSON[i].surfaceForms[0].string;

        // conceptList += "<div class='term'>" + term + "</div>";



        document.body.innerHTML = document.body.innerHTML
            .replace(term, "<span class='term'>" + term + "</span>")



        console.log(term)

    }

    // conceptList += "</aside>"


    document.body.innerHTML = conceptList + document.body.innerHTML;


    document.body.addEventListener("mouseover", function(e) {

        for (var i in e.path)
            if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "term") > -1) {
                var term = e.path[i].textContent;



                chrome.runtime.sendMessage({
                    action: 'read-xhr',
                    term: term
                }, function(bestResult) {


                    var desc = bestResult.description

                    var uri_term = bestResult.uri.substring(bestResult.uri.lastIndexOf('/'))

                    e.path[i].setAttribute("data-term", uri_term);

                    // debugger
                    define.innerHTML = desc + " <a target='_blank' href='https://en.wikipedia.org/wiki" + uri_term + "'>More</a>";


                    define.style.display = "block";
                    // define.style.top = e.pageY + "px";
                    // define.style.left = e.pageX + "px";


                })


                break;
            }

    }, 0)





    document.body.addEventListener("mouseout", function(e) {

        define.style.display = "none";

        for (var i in e.path)
            if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "term") > -1) {


                define.style.display = "block";

                break;
            }

    }, 0)



    document.body.addEventListener("mousedown", function(e) {

        for (var i in e.path)
            if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "term") > -1) {


                var wikiUrl = e.path[i].getAttribute("data-term");

                if (!wikiUrl)
                    return


                chrome.runtime.sendMessage({
                    action: 'openTab',
                    url: "https://en.wikipedia.org/wiki" + wikiUrl,
                    bg: true
                }, function(bestResult) {})


                break;
            }

    }, 0)






        ///TTS



    document.querySelector("#speak").addEventListener("click", function() {

        var text = document.querySelector("article").textContent.replace(/\n/g, ' ');

        actionType = this.className == "pause" ? { action: "tts-pause" }: { action: "tts" , data: text };

        // alert(actionType.action)

        chrome.runtime.sendMessage(actionType, function() {})


        this.className = "pause"




    }, 0)



})
