function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

const  chatActive = false

const messageObject = {
    type:'',
    cookie:'',
    msg: ''
}

function createMessage (message) {

    if(!chatActive) {
        messageObject.type='intitate'
        messageObject.cookie= getCookie("cookieName")
        messageObject.msg=''
    }
    else {
        messageObject.type='chat'
        messageObject.cookie= getCookie("cookieName")
        messageObject.msg=message
    }

    return messageObject
}
  const ws = new WebSocket('ws://localhost:8081')
ws.onopen = ()=> {
  console.log("connection opend!");
  
}
ws.onmessage = (data )=> {
 console.log(data.data) 
}