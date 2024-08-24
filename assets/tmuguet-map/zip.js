var zip = new JSZip();
var paths = [];
var Promise = window.Promise || JSZip.external.Promise;

function addzipfile(path) {
  paths.push(path);
}
function urlToPromise(url) {
  return new Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function dl(source) {
  var $source = $(source);
  var $icon = $(source).children('.fa');
  var $hint = $("<span> - </span>").appendTo($source);
  var $progress = $("<span>En cours...</span>").appendTo($hint);
  $icon.removeClass('fa-cloud-download').addClass('fa-spinner').addClass('fa-spin');
  $source.attr("disabled", "disabled");

  $.each(paths, function (i, path) {
    var filename = path.replace(/.*\//g, ""); // strip path
    zip.file(filename, urlToPromise(path), { binary: true });
  });
  paths = []; // Don't re-add them if we re-click on button

  zip.generateAsync({
    type: "blob",
    streamFiles: true,
    compression: "STORE"
  }, function updateCallback(metadata) {
    if (metadata.percent) {
      $progress.html(Math.round(metadata.percent) + '%');
    }
  }).then(function callback(blob) {
    saveAs(blob, $source.attr("data-filename") + ".zip");
    $hint.fadeOut(5000, function () {
      $source.removeAttr("disabled");
      $hint.remove();
      $icon.addClass('fa-cloud-download').removeClass('fa-spinner').removeClass('fa-spin');
    });
  }, function (e) {
    console.log("Error", e);
  });
}
