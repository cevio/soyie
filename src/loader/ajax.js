module.exports = function sendAjaxRequest(url, callback) {
  var XMLHttpReq = new XMLHttpRequest();
  XMLHttpReq.open("GET", url, true);
  XMLHttpReq.onreadystatechange = function processResponse() {
    if (XMLHttpReq.readyState == 4) {
      if (XMLHttpReq.status == 200) {
        callback(XMLHttpReq.responseText);
      }
    }
  };
  XMLHttpReq.send(null);
};
