import Http from 'http';
import Https from 'https';
import Url from 'url';
import xml2js from 'xml2js';


/*
 * @brief Retorna o tipo de protocolo da url
 * @param url
*/
function getProtocol(url) {
  const url_ = Url.parse(url);
  if(url_.protocol != 'http:' && url_.protocol != 'https:'){
    throw new Error("No HTTP or HTTPS");
  }
  return url_.protocol;
}

/*
 * @brief Faz a requisição do XML para o protocolo HTTP
 * @param url
*/
function requireXML(url) {
  const url_ = Url.parse(url);

  /* Define o streamer com base no protocolo */
  let streamer = undefined;
  if(url_.protocol == 'http:') {
    streamer = Http;
  } else if(url_.protocol == 'https:') {
    streamer = Https;
  }
  const options = {
    protocol: url_.protocol,
    hostname: url_.hostname,
    port: url_.port,
    path: url_.path
  }
  return new Promise(function(resolve, reject) {
    streamer.get(options, res=>{
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];

      if(statusCode !== 200) {
        reject(new Error("Request Failed"));
      } else if (!/^application\/xml/.test(contentType)) {
        reject(new Error("Wrong Content Type"));
      }

      res.setEncoding('utf8');
      let data = '';
      res.on('data', (chunk)=>data+=chunk);
      res.on('end', ()=>{
        resolve(data);
      });
    }).on('error', (e)=> {
      reject(new Error("Module Error"));
    });
  });
}

function XmlParser(xml_data) {
  return new Promise(function(resolve, reject) {
    xml2js.Parser().parseString(xml_data, function(e, result) {
      if (e) reject(new Error("Parsing Error"));
      resolve(result);
    });
  });
}

/*quick test*/
__getProtocol() {
  try {
    console.log(getProtocol('httpds://static.userland.com/gems/backend/sampleRss.xml'));
  } catch(e) {
    console.error(e);
  }
}

/*quick test*/
__general() {

  requireXML('http://static.userland.com/gems/backend/gratefulDead.xml')
  .then((extractedData)=>{
    XmlParser(extractedData).then(parsedData=>{
      console.log(parsedData);
    });
  })
  .catch((e)=>{
    console.error(e);
  });
}
