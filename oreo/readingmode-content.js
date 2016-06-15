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
document.querySelector('head').innerHTML = ''

var cite = '<div id="cite">' + article.byline + " " + article.title + " " + location.href + '</div>'
var aside = '<aside><button id="speak">Speak</button></aside>';
document.body.innerHTML = cite + aside + '<article contenteditable>' +
    article.content.replace(/<img[^>]+>/gi, '') + '</article>'


document.querySelector("#speak").addEventListener("click", function() {

    var text = document.querySelector("article").textContent.replace(/\n/g, ' ');

    chrome.runtime.sendMessage({ action: 'tts', data: text }, function() {})




}, 0)



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


    }

    // conceptList += "</aside>"


    document.body.innerHTML = conceptList + document.body.innerHTML;


    document.body.addEventListener("mouseover", function(e) {

        for (var i in e.path)
            if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "term") > -1) {
                var term = e.path[i].textContent;

                console.log(e)




                var xhr = new XMLHttpRequest();
                xhr.open('GET', "http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString=" + term, true);
                xhr.onload = function() {
                    var results = JSON.parse(xhr.responseText).results;
                    var bestResult = results[0]
                    for (var i in results)
                        if (results[i].label == term)
                            bestResult = results[i];

                    var desc = bestResult.description

                    var uri_term = results[i].uri.substring(bestResult.uri.lastIndexOf('/'))
                        // debugger
                    define.innerHTML = desc + " <a target='_blank' href='https://en.wikipedia.org/wiki" + uri_term + "'>More</a>";


                     define.style.display = "block";
                    define.style.top = e.pageY +"px";
                    define.style.left = e.pageX +"px";
                    


                };
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.send();




                break;
            }

    }, 0)


    document.body.addEventListener("mouseout", function(e) {

        for (var i in e.path)
            if (e.path[i].classList && Array.prototype.indexOf.call(e.path[i].classList, "term") > -1) {
             

                     define.style.display = "none";



                break;
            }

    }, 0)





})
