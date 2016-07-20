

slider.oninput = function() {

  init()
}




function getFrequency2(string, title) {


  var percent = slider.value;


  var cleanString = string
  	.replace(/[\'’”\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  var frequencies = {},
    word, frequency, i;

  var ignore = "a about above after again against ah all also always am among an and any anyone are as at away be been begin beginning begun being below between but by ca can cannot come could did do doing during each either else end et etc even ever far for from further get go goes going got had has have he her herself him himself his how i if in into is it its itself last lastly less many may me might more must my myself near nearly never new next no not now o of off often oh on only or other otherwise our ourselves out over perhaps put puts quite said saw say see seen shall she should since so some something such  than that the their them themselves then there therefore these they this those though thus to too unless until up upon us ve very was we were what when where which while who whom  whose why with within without would yes you your yours yourself example using us"

  //"I a about an and are as at be by com for from has how in is it of on or that the this to was what when where who will with the";

  var ignoreExp = new RegExp("\\b(" + ignore.replace(/ /g, "|") + ")\\b", "gi")


  cleanString = cleanString.replace(ignoreExp, '').replace(/  /g, ' ')
  

  title = title.replace(ignoreExp, '').replace(/  /g, ' ')

  var words = cleanString.split(' ')
  		.filter(function(w){
      	return w.length > 3 && ignore.indexOf(w.toLowerCase()+" ")==-1;
       });

  for (var i in words) {
    word = words[i];
    frequencies[word] = frequencies[word] || 0;
    frequencies[word]++;
  }


  var titlewords = title.split(' ')
		 .filter(function(w){
        return w.length > 3 && ignore.indexOf(w.toLowerCase()+" ")==-1;
       });


  for (var i in titlewords)
    if (frequencies[titlewords[i]])
      frequencies[titlewords[i]] += 10;
    else
      frequencies[titlewords[i]] = 10;

	window.frequencies = frequencies;
  
  words = Object.keys(frequencies);

  // console.log(frequencies)

  var keywords = words.sort(function(a, b) {
      return frequencies[b] - frequencies[a];
    }).slice(0, Math.floor(words.length * percent / 100)) //.toString();

  window.keywords = keywords;


  var sentences = string
  	.replace(/(u.s|mr|mrs|dr)\./gi, "")
  .split(/(\.)['”" \)\n]/g).filter(function(i) {
    return i != ".";
  });

  // console.log(sentences)

  var scores = {}


  for (var i in sentences) {
    sentence = sentences[i]

    scores[sentence] = 0

    for (var j in keywords)
      if (sentence.indexOf(keywords[j]) > -1)
        scores[sentence] += frequencies[keywords[j]]
        
        
    scores[sentence] = scores[sentence] / 5 + scores[sentence] 
    		/ sentence.split(' ').length;
  }
  
  
  


  sentences = Object.keys(scores);

  var keysentences = sentences.sort(function(a, b) {
      return scores[b] - scores[a];
    }).slice(0, Math.floor(sentences.length * percent / 100)) //.toString();


  return keysentences

}


function init() {




text=document.querySelector("article").textContent

title = title||""



  var keys = getFrequency2(text, title)

  //console.log(keys)

  text =   document.querySelector("article").innerHTML.replace(/(<p>|<br>)/gi,"__PAR__").replace(/<script.+script>/ig, "").replace(/(<([^>]+)>)/ig, "");



  for (var i in keys)
    text = text.replace(keys[i], "<em>" + keys[i] + "</em>")


  ///for (var i in keywords)
  
     //text = text.replace(new RegExp(keywords[i], "gi"), "<em>" + keywords[i] + "</em>")
      
      wordle = [];
      
      keywords = keywords.slice(0,15);
      for (var i in keywords)	
 		     wordle.push({text: keywords[i], weight: frequencies[keywords[i]]})

	

  document.querySelector("article").innerHTML = text.replace(/__PAR__/gi, "<br>");
  
  
  console.log(JSON.stringify(wordle))

$('#keywords').empty().delay(100).jQCloud(wordle, {
  width: 300,
  height: 150,
});

}


init()
