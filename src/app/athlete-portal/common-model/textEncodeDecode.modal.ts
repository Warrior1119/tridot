
export class TextEncodeDecode {
  getEncodedText(text){
    if(text==null||text==undefined){
      return text;
    }
    return encodeURI(text);
  }
  getDecodedText(text){
    try {
      if(text==null||text==undefined){
        return text;
     }
      return decodeURI(text);
    
    }catch (e) {
       
      return text;
    }
   
  } 
}
