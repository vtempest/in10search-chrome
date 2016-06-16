 if(window.word) document.body.removeChild(word);
 if (window.hideWord) clearTimeout(window.hideWord)


 document.body.insertAdjacentHTML('beforeend',	'<div  id="word">'+unescape(window.worddefine)+'</div>'); 



 setTimeout(function(){word.className="min";},1);

window.hideWord =  setTimeout(function(){word.className="";},5000)


  word.onclick=function(){
  		window.open(this.querySelector("a").href)



  }

                       