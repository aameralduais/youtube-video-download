// ==UserScript==
// @name           YouTube Video Download
// @namespace      sooaweso.me
// @description    Download videos from YouTube. Simple, lightweight and supports all formats, including WebM.
// @version        4.0
// @author         rossy
// @license        MIT License
// @grant          none
// @updateURL      https://github.com/rossy2401/youtube-video-download/raw/master/youtube-video-download.user.js
// @include        http://www.youtube.com/watch?*
// @include        https://www.youtube.com/watch?*
// @include        http://*.c.youtube.com/videoplayback?*
// ==/UserScript==

(function() {
 "use strict";

 function formatSize(bytes)
 {
  if (bytes < 1048576)
   return (bytes / 1024).toFixed(1) + " KiB";
  else
   return (bytes / 1048576).toFixed(1) + " MiB";
 }

 document.addEventListener("ytd-update-link", function(event) {
  if (window.chrome)
  {
   var xhr = new XMLHttpRequest();
   var data = JSON.parse(event.data);
   var set = false;

   xhr.open("HEAD", data.href, true);
   xhr.onreadystatechange = function(e) {
    if (xhr.readyState >= 2)
    {
     if (!set)
     {
      set = true;

      var length = xhr.getResponseHeader("Content-length");
      var target = document.getElementById(data.target);
      target.setAttribute("title", target.getAttribute("title") + ", " + formatSize(Number(length)));
     }

     xhr.abort();
    }
   };
   xhr.send(null);
  }
 }, false);

 function script()
 {
  var version = 4.0, hash = "973c25f";
// -- Object tools --
// has(obj, key) - Does the object contain the given key?
var has = Function.call.bind(Object.prototype.hasOwnProperty);
// extend(obj, a, b, c, ...) - Add the properties of other objects to this
// object
function extend(obj)
{
 for (var i = 1, max = arguments.length; i < max; i ++)
  for (var key in arguments[i])
   if (has(arguments[i], key))
    obj[key] = arguments[i][key];
 return obj;
}
// merge(a, b, c, ...) - Create an object with the merged properties of other
// objects
function merge()
{
 return extend.bind(null, {}).apply(null, arguments);
}
var copy = merge;
// -- Array tools --
// arrayify(a) - Turn an array-like object into an array
var slice = Function.call.bind(Array.prototype.slice),
    arrayify = slice;
// index(on, a) - Index an array of objects by a key
function index(on, a)
{
 var obj = {};
 for (var i = 0, max = a.length; i < max; i ++)
  if (a[i].has(on))
   obj[a[i][on]] = a[i];
 return obj;
}
// pluck(on, a) - Return a list of property values
function pluck(on, a)
{
 return a.map(function(o) { return o[on]; });
}
// indexpluck(on, a) - Index and pluck
function indexpluck(key, value, a)
{
 var obj = {};
 for (var i = 0, max = a.length; i < max; i ++)
  if (a[i].has(key))
   obj[a[i][key]] = a[i][value];
 return obj;
}
// equi(on, a, b, c, ...) - Performs a equijoin on all the objects in the given
// arrays
function equi(on)
{
 var obj = {}, ret = [];
 for (var i = 1, imax = arguments.length; i < imax; i ++)
  for (var j = 0, jmax = arguments[i].length; j < jmax; j ++)
   if (has(arguments[i][j], on))
    obj[arguments[i][j][on]] = merge(obj[arguments[i][j][on]] || {}, arguments[i][j])
 for (var prop in obj)
  if (has(obj, prop))
   ret.push(obj[prop]);
 return ret;
}
// -- URI tools --
// decodeURIPlus(str) - Decode a URI component, including conversion from '+'
// to ' '
function decodeURIPlus(str)
{
 return decodeURIComponent(str.replace(/\+/g, " "));
}
// encodeURIPlus(str) - Encode a URI component, including conversion from ' '
// to '+'
function encodeURIPlus(str)
{
 return encodeURIComponent(str).replace(/ /g, "%20");
}
// decodeQuery(query) - Convert a query string to an object
function decodeQuery(query)
{
 var obj = {};
 query.split("&").forEach(function(str) {
  var m = str.match(/^([^=]*)=(.*)$/);
  if (m)
   obj[decodeURIPlus(m[1])] = decodeURIPlus(m[2]);
  else
   obj[decodeURIPlus(str)] = "";
 });
 return obj;
}
// encodeQuery(query) - Convert a query string back into a URI
function encodeQuery(query)
{
 var components = [];
 for (var name in query)
  if (has(query, name))
   components.push(encodeURIPlus(name) + "=" + encodeURIPlus(query[name]));
 return components.join("&");
}
// URI(uri) - Convert a URI to a mutable object
function URI(uri)
{
 if (!(this instanceof URI))
  return new URI(uri);
 var m = uri.match(/([^\/]+)\/\/([^\/]+)([^?]*)(?:\?(.+))?/);
 if (m)
 {
  this.protocol = m[1];
  this.host = m[2];
  this.pathname = m[3];
  this.query = m[4] ? decodeQuery(m[4]) : {};
 }
 else
 {
  this.href = uri;
  this.query = {};
 }
}
URI.prototype.toString = function() {
 if (this.href)
  return this.href;
 var encq = this.query && encodeQuery(this.query);
 return (this.protocol || "http") + "//" + this.host + this.pathname + (encq ? "?" + encq : "");
};
// -- Function tools --
function identity(a) { return a; }
// runWith - Run JavaScript code with an object's properties as local variables
function runWith(str, obj)
{
 var names = [],
     values = [];
 for (var name in obj)
  if (has(obj, name))
  {
   names.push(name);
   values.push(obj[name]);
  }
 var func = Function.apply(null, names.concat(str));
 return func.apply(null, values);
}
// -- String tools --
// format(str, obj) - Formats a string with a syntax similar to Python template
// strings, except the identifiers are executed as JavaScript code.
function format(str, obj)
{
 return str.replace(/\${([^}]+)}/g, function(match, name) {
  try {
   return runWith("return (" + name + ");", obj);
  }
  catch (e) {
   return match;
  }
 });
}
// trim(str) - Trims whitespace from the start and end of the string.
function trim(str)
{
 return str.replace(/^\s+/, "").replace(/\s+$/, "");
}
// formatFileName(str) - Formats a file name (sans extension) to obey certain
// restrictions on certain platforms. Makes room for a 4 character extension,
// ie. ".webm".
function formatFileName(str)
{
 return str
  .replace(/[\\/<>:"\?\*\|]/g, "-")
  .replace(/[\x00-\x1f]/g, "-")
  .replace(/^\./g, "-")
  .replace(/^\s+/, "")
  .substr(0, 250);
}
// Try - Do things or do other things if they don't work
var Try = (function() {
 var self = {
  all: all,
 };
 function all()
 {
  var args = Array.prototype.slice(arguments),
   arg;
  for (var i = 0, imax = arguments.length; i < imax; i ++)
   if (arguments[i] instanceof Array)
    for (var j = 0, jmax = arguments[i].length; j < jmax; j ++)
     try {
      return arguments[i][j]();
     }
     catch (e) {}
   else
    try {
     return arguments[i]();
    }
    catch (e) {}
 }
 return self;
})();
// VideoInfo - Get global video metadata
var VideoInfo = (function() {
 var self = {
  init: init,
 };
 // init() - Populates the VideoInfo object with video metadata
 function init()
 {
  self.title = Try.all(
   function() {
    return yt.playerConfig.args.title;
   },
   function() {
    return document.querySelector("meta[name=title]").getAttribute("content");
   },
   function() {
    return document.querySelector("meta[property=\"og:title\"]").getAttribute("content");
   },
   function() {
    return document.getElementById("eow-title").getAttribute("title");
   },
   function() {
    return document.title.match(/^(.*) - YouTube$/)[1];
   }
  );
  self.author = Try.all(
   function() {
    return document.querySelector("#watch-uploader-info > .author").textContent;
   },
   function() {
    return document.querySelector("#watch-userbanner").getAttribute("title");
   },
   function() {
    return document.querySelector("span[itemprop=author] > link[itemprop=url]").getAttribute("href").match(/www.youtube.com\/user\/([^\/]+)/)[1];
   }
  );
 }
 return self;
})();
var Languages = {
 "en": {"download-button-tip": "Download this video","download-button-text": "Download","menu-button-tip": "Choose from additional formats","group-options": "Options","group-high-definition": "High definition","group-standard-definition": "Standard definition","group-mobile": "Mobile","group-unknown": "Unknown formats","group-update": "An update is available","option-check": "Check for updates","option-format": "Title format","button-options": "options","button-options-close": "close","button-update": "Click here to update YouTube Video Download","error-no-downloads": "No downloadable streams found"},
};
Languages.current = Languages.en;
function T(item) { return Languages.current[item] || Languages.en[item]; }
// StreamMap - Get and convert format maps
var StreamMap = (function() {
 var self = {
  getStreams: getStreams,
  getURL: getURL,
  sortFunc: sortFunc,
  getExtension: getExtension,
 };
 // Just in case the auto format detection code breaks, fall back on these
 // defaults for determining what is in the streams
 var defaultStreams = [
  { itag: 5 , width: 320, height: 240, container: "FLV" , acodec:"MP3" , vcodec: "H.263" },
  { itag: 17 , width: 176, height: 144, container: "3GPP", acodec:"AAC" , vcodec: "MPEG-4" },
  { itag: 18 , width: 640, height: 360, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "Baseline", level: 3.0 },
  { itag: 22 , width: 1280, height: 720, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "High" , level: 3.1 },
  { itag: 34 , width: 640, height: 360, container: "FLV" , acodec:"AAC" , vcodec: "H.264" , vprofile: "Main" },
  { itag: 35 , width: 854, height: 480, container: "FLV" , acodec:"AAC" , vcodec: "H.264" , vprofile: "Main" },
  { itag: 36 , width: 320, height: 240, container: "3GPP", acodec:"AAC" , vcodec: "MPEG-4", vprofile: "Simple" },
  { itag: 37 , width: 1920, height: 1080, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "High" , level: 3.1 },
  { itag: 38 , width: 2048, height: 1536, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "High" , level: 3.1 },
  { itag: 43 , width: 640, height: 360, container: "WebM", acodec:"Vorbis", vcodec: "VP8" },
  { itag: 44 , width: 854, height: 480, container: "WebM", acodec:"Vorbis", vcodec: "VP8" },
  { itag: 45 , width: 1280, height: 720, container: "WebM", acodec:"Vorbis", vcodec: "VP8" },
  { itag: 46 , width: 1920, height: 1080, container: "WebM", acodec:"Vorbis", vcodec: "VP8" },
  { itag: 82 , width: 640, height: 360, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "Baseline", level: 3.0, stereo3d: true },
  { itag: 83 , width: 854, height: 480, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "Baseline", level: 3.1, stereo3d: true },
  { itag: 84 , width: 1280, height: 720, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "High", level: 3.1, stereo3d: true },
  { itag: 85 , width: 1920, height: 1080, container: "MP4" , acodec:"AAC" , vcodec: "H.264" , vprofile: "High", level: 3.1, stereo3d: true },
  { itag: 100, width: 640, height: 360, container: "WebM", acodec:"Vorbis", vcodec: "VP8" , stereo3d: true },
  { itag: 101, width: 854, height: 480, container: "WebM", acodec:"Vorbis", vcodec: "VP8" , stereo3d: true },
  { itag: 102, width: 1280, height: 720, container: "WebM", acodec:"Vorbis", vcodec: "VP8" , stereo3d: true },
 ];
 function containerToNum(container)
 {
  return {
   "MP4": 1,
   "FLV": 2,
   "WebM": 3,
   "3GPP": 4,
  }[container] || 5;
 }
 // sortFunc(a, b) - Sort streams from best to worst
 function sortFunc(a, b)
 {
  if (a.height && b.height && a.height != b.height)
   return b.height - a.height;
  if (a.stereo3d && !b.stereo3d)
   return 1;
  else if (!a.stereo3d && b.stereo3d)
   return -1;
  if (a.container && b.container && a.container != b.container)
   return containerToNum(a.container) - containerToNum(b.container);
  return (Number(b.itag) - Number(a.itag)) || 0;
 }
 // decodeType(type) - Decode the mime type of the video
 function decodeType(type)
 {
  var m = type.match(/^[^ ;]*/)[0],
      ret = { container: "Unknown" };
  if (m == "video/mp4")
  {
   ret.container = "MP4";
   ret.vcodec = "H.264";
   ret.acodec = "AAC";
   var m = type.match(/avc1\.(....)(..)/)
   if (m)
   {
    ret.level = parseInt(m[2], 16) / 10;
    if (m[1] == "58A0")
     ret.vprofile = "Extended";
    else if (m[1] == "6400")
     ret.vprofile = "High";
    else if (m[1] == "4D40")
     ret.vprofile = "Main";
    else if (m[1] == "42E0")
     ret.vprofile = "Baseline";
    else if (m[1] == "4200")
     ret.vprofile = "Baseline";
   }
  }
  else if (m == "video/webm")
  {
   ret.container = "WebM";
   ret.vcodec = "VP8";
   ret.acodec = "Vorbis";
  }
  else if (m == "video/x-flv")
  {
   ret.container = "FLV";
  }
  else if (m == "video/3gpp")
  {
   ret.container = "3GPP";
   ret.vcodec = "MPEG-4";
   ret.acodec = "AAC";
  }
  return ret;
 }
 // processStream(stream) - Add some format information to the stream
 function processStream(stream)
 {
  if (stream.type)
  {
   stream = merge(stream, decodeType(stream.type));
   if (stream.container == "FLV")
    if (stream.flashMajor == 7)
    {
     stream.vcodec = "H.263";
     stream.acodec = "MP3";
    }
    else
    {
     stream.vcodec = "H.264";
     stream.acodec = "AAC";
    }
  }
  return stream;
 }
 // decodeFormat(format) - Decode an element of the fmt_list array
 function decodeFormat(format)
 {
  format = format.split("/");
  var size = format[1].split("x");
  return {
   itag: format[0],
   width: Number(size[0]),
   height: Number(size[1]),
   flashMajor: Number(format[2]),
   flashMinor: Number(format[3]),
   flashPatch: Number(format[4]),
  };
 }
 // getFlashArgs() - Get the flashvars from the page
 function getFlashArgs()
 {
  return Try.all(
   function() {
    return yt.playerConfig.args;
   },
   function() {
    return decodeQuery(document.getElementById("movie_player").getAttribute("flashvars"));
   }
  );
 }
 // getStreams() - Get the streams from the page
 function getStreams()
 {
  try {
   var flashArgs = getFlashArgs(),
       streams = equi("itag", defaultStreams, flashArgs.url_encoded_fmt_stream_map.split(",").map(decodeQuery));
   try {
    streams = equi("itag", streams, flashArgs.fmt_list.split(",").map(decodeFormat));
   }
   catch (e) {}
  } catch (e) {}
  return streams.map(processStream);
 }
 // getURL(stream) - Get a URL from a stream
 function getURL(stream, title)
 {
  if (stream.url)
  {
   var uri = new URI(stream.url);
   if (!uri.query.signature && stream.sig)
    uri.query.signature = stream.sig;
   if (title)
    uri.query.title = formatFileName(title);
   return uri.toString();
  }
 }
 // getExtension(stream) - Get the file extension associated with the
 // container type of the specified stream
 function getExtension(stream)
 {
  return {
   "MP4": ".mp4",
   "WebM": ".webm",
   "3GPP": ".3gp",
   "FLV": ".flv",
  }[stream.container] || "";
 }
 return self;
})();
// Interface - Handles the user interface for the watch page
var Interface = (function() {
 var self = {
  init: init,
  update: update,
  notifyUpdate: notifyUpdate,
 };
 var groups = [
  { title: T("group-high-definition"), predicate: function(stream) {
   return stream.height && stream.container && stream.container != "3GPP" && stream.height > 576;
  } },
  { title: T("group-standard-definition"), predicate: function(stream) {
   return stream.height && stream.container && stream.container != "3GPP" && stream.height <= 576;
  } },
  { title: T("group-mobile"), predicate: function(stream) {
   return stream.height && stream.container && stream.container == "3GPP";
  } },
  { title: T("group-unknown"), flat: true, predicate: function(stream) {
   return !stream.height || !stream.container;
  } },
 ];
 var links = [];
 var nextId = 0;
 // createOptionsButton() - Creates the button that opens the options menu
 function createOptionsButton()
 {
  var elem = document.createElement("a"),
   optionsOpen = false;
  elem.setAttribute("href", "javascript:;");
  elem.style.position = "absolute";
  elem.style.right = elem.style.top = "8px";
  elem.innerHTML = T("button-options");
  elem.addEventListener("click", function() {
   optionsOpen = !optionsOpen;
   self.options.style.display = optionsOpen ? "" : "none";
   elem.innerHTML = optionsOpen ? T("button-options-close") : T("button-options");
  });
  return elem
 }
 // createHeader(text) - Creates a menu section header
 function createHeader(text)
 {
  var elem = document.createElement("div");
  elem.style.padding = "2px 13px";
  elem.style.fontWeight = "bold";
  elem.style.borderBottom = "1px solid #999";
  elem.appendChild(document.createTextNode(text));
  return elem;
 }
 // createCheckbox(text) - Creates a YouTube uix checkbox
 function createCheckbox(text, checked, callback)
 {
  var label = document.createElement("label"),
      span = document.createElement("span"),
      checkbox = document.createElement("input"),
      elem = document.createElement("span");
  span.className = "yt-uix-form-input-checkbox-container" + (checked ? "  checked" : "");
  span.style.margin = "6px 6px 6px 13px";
  checkbox.className = "yt-uix-form-input-checkbox";
  checkbox.setAttribute("type", "checkbox");
  checkbox.checked = !!checked;
  checkbox.addEventListener("change", function() {
   callback(checkbox.checked);
  }, true);
  elem.className = "yt-uix-form-input-checkbox-element";
  span.appendChild(checkbox);
  span.appendChild(elem);
  label.style.display = "block";
  label.appendChild(span);
  label.appendChild(document.createTextNode(text));
  return label;
 }
 // createOptions() - Creates the options menu
 function createOptions()
 {
  var elem = document.createElement("div");
  elem.appendChild(createHeader(T("group-options")));
  // Determine whether to check GitHub for updates every two days
  elem.appendChild(createCheckbox(T("option-check"), localStorage["ytd-check-updates"] == "true", function (checked) {
   localStorage["ytd-check-updates"] = checked;
  }));
  // Add box for setting the format string
  var formatLabel = document.createElement("label"),
      formatBox = document.createElement("input");
  formatBox.className = "yt-uix-form-input-text";
  formatBox.value = localStorage["ytd-title-format"];
  formatBox.setAttribute("id", "ytd-format-box");
  formatBox.style.display = "block";
  formatBox.style.margin = "6px 13px";
  formatBox.style.width = "70%";
  formatBox.addEventListener("input", function() {
   localStorage["ytd-title-format"] = formatBox.value;
   updateLinks();
  });
  formatLabel.setAttribute("for", "ytd-format-box");
  formatLabel.style.display = "block";
  formatLabel.style.margin = "6px";
  formatLabel.appendChild(document.createTextNode(T("option-format")));
  elem.appendChild(formatLabel);
  elem.appendChild(formatBox);
  elem.style.display = "none";
  return elem;
 }
 // createDlButton() - Creates the instant download button
 function createDlButton()
 {
  var link = document.createElement("a"),
      elem = document.createElement("button");
  link.setAttribute("href", "javascript:;");
  elem.className = "start yt-uix-tooltip-reverse yt-uix-button yt-uix-button-default yt-uix-tooltip";
  elem.setAttribute("title", T("download-button-tip"));
  elem.setAttribute("type", "button");
  elem.setAttribute("role", "button");
  elem.innerHTML = "<span class=\"yt-uix-button-content\">" + T("download-button-text") + "</span>";
  link.appendChild(elem);
  return link;
 }
 // createMenuButton() - Creates the download menu button
 function createMenuButton()
 {
  var elem = document.createElement("button");
  elem.className = "end yt-uix-tooltip-reverse yt-uix-button yt-uix-button-default yt-uix-tooltip";
  elem.setAttribute("title", T("menu-button-tip"));
  elem.setAttribute("type", "button");
  elem.setAttribute("role", "button");
  elem.setAttribute("onclick", "; return false;");
  elem.innerHTML = "<img class=\"yt-uix-button-arrow\" style=\"margin: 0;\" src=\"//s.ytimg.com/yt/img/pixel-vfl73.gif\" alt=\"\">";
  return elem;
 }
 // createMenu() - Creates the downloads menu
 function createMenu()
 {
  var elem = document.createElement("div");
  elem.className = "yt-uix-button-menu";
  elem.style.display = "none";
  return elem;
 }
 function formatTitle(stream)
 {
  return (stream.vcodec ? stream.vcodec + "/" + stream.acodec : "") +
   (stream.vprofile ? " (" + stream.vprofile + (stream.level ? "@L" + stream.level.toFixed(1) : "") + ")" : "");
 }
 function updateLink(href, target)
 {
  var data = { "href": href, target: target };
  var event = document.createEvent("MessageEvent");
  event.initMessageEvent("ytd-update-link", true, true, JSON.stringify(data), document.location.origin, "", window);
  document.dispatchEvent(event);
 }
 // createMenuItemGroup() - Creates a sub-group for a set of related streams
 function createMenuItemGroup(streams)
 {
  // Create the button group and the size label ("360p", "480p", etc.)
  var itemGroup = document.createElement("div"),
      size = document.createElement("div"),
      mainLink = document.createElement("a"),
      mainId = nextId ++;
  itemGroup.style.position = "relative";
  itemGroup.style.minWidth = streams.length * 64 + 48 + "px";
  itemGroup.addEventListener("mouseover", function() {
   itemGroup.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
  }, false);
  itemGroup.addEventListener("mouseout", function() {
   itemGroup.style.backgroundColor = "";
  }, false);
  size.className = "yt-uix-button-menu-item";
  size.style.textAlign = "right";
  size.style.width = "55px";
  size.style.position = "absolute";
  size.style.left = "0px";
  size.style.top = "0px";
  size.style.paddingLeft = size.style.paddingRight = "0px";
  size.style.color = "inherit";
  // Create the main video link
  mainLink.className = "yt-uix-button-menu-item";
  mainLink.setAttribute("id", "ytd-" + mainId);
  mainLink.setAttribute("title", formatTitle(streams[0]));
  links.push({ stream: streams[0], anchor: mainLink });
  updateLink(StreamMap.getURL(streams[0]), "ytd-" + mainId);
  mainLink.style.display = "block";
  mainLink.style.paddingLeft = "55px";
  mainLink.style.marginRight = (streams.length - 1) * 64 + "px";
  mainLink.addEventListener("contextmenu", function(e) {
   // Prevent right-click closing the menu in Chrome
   e.stopPropagation();
  }, false);
  // Append the main link to the button group
  size.appendChild(document.createTextNode(streams[0].height + "p\u00a0"));
  mainLink.appendChild(size);
  mainLink.appendChild(document.createTextNode((streams[0].stereo3d ? "3D " : "") + streams[0].container));
  itemGroup.appendChild(mainLink);
  // Create each sublink
  for (var i = 1, max = streams.length; i < max; i ++)
  {
   var subLink = document.createElement("a"),
       subId = nextId ++;
   subLink.className = "yt-uix-button-menu-item";
   subLink.setAttribute("id", "ytd-" + subId);
   subLink.setAttribute("title", formatTitle(streams[i]));
   links.push({ stream: streams[i], anchor: subLink });
   updateLink(StreamMap.getURL(streams[i]), "ytd-" + subId);
   subLink.style.display = "block";
   subLink.style.position = "absolute";
   subLink.style.right = (streams.length - i - 1) * 64 + "px";
   subLink.style.top = "0px";
   subLink.style.width = "53px";
   subLink.style.paddingLeft = subLink.style.paddingRight = "5px";
   subLink.style.borderLeft = "1px solid #DDD";
   subLink.addEventListener("contextmenu", function(e) {
    // Prevent right-click closing the menu in Chrome
    e.stopPropagation();
   }, false);
   // Append the sublink to the button group
   subLink.appendChild(document.createTextNode((streams[i].stereo3d ? "3D " : "") + streams[i].container));
   itemGroup.appendChild(subLink);
  }
  return itemGroup;
 }
 // createGroup(title, streams) - Creates a new menu group
 function createGroup(title, flat, streams)
 {
  var elem = document.createElement("div");
  elem.appendChild(createHeader(title));
  if (flat)
   for (var i = 0, max = streams.length; i < max; i ++)
    elem.appendChild(createMenuItemGroup([streams[i]]));
  else
  {
   var resolutions = [],
       resGroups = {};
   for (var i = 0, max = streams.length; i < max; i ++)
   {
    if (!resGroups[streams[i].height])
    {
     resolutions.push(streams[i].height);
     resGroups[streams[i].height] = [];
    }
    resGroups[streams[i].height].push(streams[i]);
   }
   for (var i = 0, max = resolutions.length; i < max; i ++)
    elem.appendChild(createMenuItemGroup(resGroups[resolutions[i]]));
  }
  return elem;
 }
 // createUpdate() - Creates the updates button
 function createUpdate()
 {
  var elem = document.createElement("div");
  elem.appendChild(createHeader(T("group-update")));
  var a = document.createElement("a");
  a.className = "yt-uix-button-menu-item";
  a.setAttribute("href", "https://github.com/rossy2401/youtube-video-download/raw/master/youtube-video-download.user.js");
  a.appendChild(document.createTextNode(T("button-update")));
  elem.appendChild(a);
  return elem;
 }
 // setDlButton(stream) - Sets the default stream to download
 function setDlButton(stream)
 {
  self.dlButton.getElementsByTagName("button")[0]
   .setAttribute("title", T("download-button-tip") +
   " (" + stream.height + "p " + stream.container + ")");
  links.push({ stream: stream, anchor: self.dlButton });
 }
 // updateLinks() - Set the href and download attributes of all video
 // download links
 function updateLinks()
 {
  for (var i = 0, max = links.length; i < max; i ++)
  {
   var title = formatFileName(format(localStorage["ytd-title-format"], merge(links[i].stream, VideoInfo)));
   links[i].anchor.setAttribute("download", title + StreamMap.getExtension(links[i].stream));
   links[i].anchor.setAttribute("href", StreamMap.getURL(links[i].stream, title));
  }
 }
 // update(streams) - Adds streams to the menu
 function update(streams)
 {
  streams = streams
   .filter(function(obj) { return obj.url; })
   .sort(StreamMap.sortFunc);
  links = [];
  var mp4streams = streams.filter(function(obj) { return obj.container == "MP4"; });
  if (mp4streams.length)
   setDlButton(mp4streams[0]);
  else if (streams.length)
   setDlButton(streams[0]);
  else
  {
   var button = self.dlButton.getElementsByTagName("button")[0];
   self.menuButton.disabled = true;
   self.menuButton.setAttribute("title", "");
   button.setAttribute("title", T("error-no-downloads"));
  }
  for (var i = 0, max = groups.length; i < max; i ++)
  {
   var groupStreams = streams.filter(groups[i].predicate);
   if (groupStreams.length)
    self.downloads.appendChild(createGroup(groups[i].title, groups[i].flat, groupStreams));
  }
  updateLinks();
 }
 // init() - Initalises the user interface
 function init()
 {
  // Get the flag button from the actions menu
  var watchFlag = document.getElementById("watch-flag"),
      buttonGroup = document.createElement("span");
  buttonGroup.className = "yt-uix-button-group";
  self.dlButton = createDlButton();
  self.menuButton = createMenuButton();
  self.menu = createMenu();
  self.menu.appendChild(createOptionsButton());
  self.menu.appendChild(self.options = createOptions());
  self.menu.appendChild(self.downloads = document.createElement("div"));
  self.menuButton.appendChild(self.menu);
  // If the flag button is disabled, all the controls should be disabled
  self.dlButton.disabled = self.menuButton.disabled = watchFlag.disabled;
  // Populate the button group
  buttonGroup.appendChild(self.dlButton);
  buttonGroup.appendChild(self.menuButton);
  // Insert the button group before the flag button
  watchFlag.parentNode.insertBefore(buttonGroup, watchFlag);
  // Also insert some whitespace
  watchFlag.parentNode.insertBefore(document.createTextNode(" "), watchFlag);
 }
 function notifyUpdate()
 {
  self.menu.appendChild(createUpdate());
 }
 return self;
})();
// Update - Check GitHub for updates
var Update = (function() {
 self = {
  check: check,
 };
 // apiRequest(path, callback) - Perform a JSON API request for path,
 // calling the callback(json, error) function on completion
 function apiRequest(path, callback)
 {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", path);
  xhr.onload = function() {
   var json;
   try {
    json = JSON.parse(xhr.responseText);
   }
   catch (e) {
    callback(null, true);
   }
   if (json)
    callback(json);
  };
  xhr.onerror = function() {
   callback(null, true);
  };
  xhr.send();
 }
 // check() - Query GitHub for changes to
 // "youtube-video-download.user.js.sha1sum". If there is, inform the
 // Interface module.
 function check()
 {
  apiRequest("https://api.github.com/repos/rossy2401/youtube-video-download/git/refs/heads/master", function(json) {
   if (!json)
    return;
   apiRequest(json.object.url, function (json) {
    if (!json)
     return;
    apiRequest(json.tree.url, function (json) {
     if (!json)
      return;
     apiRequest(json.tree.filter(function(a) { return a.path == "youtube-video-download.user.js.sha1sum"; })[0].url, function (json) {
      if (!json)
       return;
      var sha1sum = atob(json.content.replace(/\n/g, ""));
      localStorage["ytd-update-sha1sum"] = sha1sum;
      if (sha1sum.substr(0, 7) != hash)
       Interface.notifyUpdate();
     });
    });
   });
  });
 }
 return self;
})();
function setLanguage(language)
{
 if (Languages[language])
  Languages.current = Languages[language];
}
function main()
{
 if (localStorage["ytd-check-updates"] === undefined)
  localStorage["ytd-check-updates"] = true;
 if (localStorage["ytd-title-format"] === undefined)
  localStorage["ytd-title-format"] = "${title}";
 setLanguage(document.documentElement.getAttribute("lang"));
 VideoInfo.init();
 Interface.init();
 Interface.update(StreamMap.getStreams());
 if ((localStorage["ytd-check-updates"] == "true"))
  if (localStorage["ytd-current-sha1sum"] != hash ||
   !localStorage["ytd-last-update"] ||
   Number(localStorage["ytd-last-update"]) < Date.now() - 2 * 24 * 60 * 60 * 1000)
  {
   Update.check();
   localStorage["ytd-last-update"] = Date.now();
  }
  else if (localStorage["ytd-update-sha1sum"] && localStorage["ytd-update-sha1sum"].substr(0, 7) != hash)
   Interface.notifyUpdate();
 localStorage["ytd-current-sha1sum"] = hash;
}
  main();
 }
 function inject(str)
 {
  var elem = document.createElement("script");
  elem.setAttribute("type", "application/javascript");
  elem.textContent = "(function() {\"use strict\"; (" + str + ")();})();";
  document.body.appendChild(elem);
 }
 inject(script);
})();