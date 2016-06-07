//required utils
//$(s)
function $(s){ 

  this._s=s; //privatize selector string for later methods
  _e = document.querySelectorAll(s);
  this= this._e = _e ;

}

$.prototype.eq = function(i){

   return i !=undefined ? _e[i] : _e; //return first elem, or array 
}


//$(s).each()
$.prototype.each = function(fn){

  console.log(this); //list of matched elems

  for (i=0;el=this[i++];)    
    fn.call(el) 

}





//to use $ instead of new $ -- must be at end 
_$=$;
var $ = function(s){ return new _$(s); }

// $(".g").each( function(){

//       console.log( this.href )

//   })
